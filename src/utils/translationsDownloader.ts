import { getStorageT, getStorageVersion, Ei18nEvents, raiseEvent, removeStorageT, setStorageT, TypeTranslationsConfig, TypeTData } from './utils';

export class TranslationsDownloader {
    private apiUrl: string;
    private appId: string;
    private appSecret: string;
    private tags: string[] = [];
    private tInterval: any = -1;
    private tIntervalCount;
    private missingsInterval = {};
    private translationsCache = {};
    private availableLangsCache = [];
    private notFoundCache: string[] = [];
    private missingTag = 'app';
    private requestOptions = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': location.origin, // eslint-disable-line no-restricted-globals
        'x-translate-i18n': 'js',
    };

    constructor(apiUrl: string, appId: string, appSecret: string, missingTag = 'app', tags = []) {
        this.apiUrl = apiUrl;
        this.appId = appId;
        this.appSecret = appSecret;
        this.missingTag = missingTag;
        this.tags = tags;
    }

    setValues(apiUrl: string, appId: string, appSecret: string) {
        this.apiUrl = apiUrl;
        this.appId = appId;
        this.appSecret = appSecret;
    }

    cacheClear() {
        this.translationsCache = {};
        this.availableLangsCache = [];
    }

    /**
    * Obtiene las traducciones para un idioma y los idiomas disponibles.
    * Primero mira en la cache y sino las obtiene de (p.ej. para es): `assets/translations/all-es.json`
    * @param lang Idiioma de las traducciones
    * isForceRefresh
    * @returns Un objeto json con las traducciones disponibles para ese idioma
    */
    async getTranslationsConfig(defaultAvailableLangs: string[], lang: string, isLocalValuesAllowed: boolean): Promise<TypeTranslationsConfig> {
        // - Cancelar el intervalo anterior de refresco
        // const isIdle = this.tInterval < 0;
        clearInterval(this.tInterval);

        // - Miramos si están en cache
        if (this.translationsCache[lang]) {
            return {
                availableLangs: this.availableLangsCache,
                translations: this.translationsCache[lang],
            };
        }

        // - Obtememos las traducciones locales
        const translations: TypeTData = await this.getLocal(lang, isLocalValuesAllowed);
        const availableLangs = defaultAvailableLangs;
        this.translationsCache[lang] = translations;
        this.availableLangsCache = availableLangs;

        // - Miramos que no se haya iniciado ya anteriormente el proceso de descarga en background
        if (this.tInterval < 0) {
            // - Iniciamos el descargador de las remote en background
            this.tIntervalCount = 0;
            this.tInterval = setInterval(
                async () => {
                    try {
                        const remoteAvailableLangs = await this.getRemoteAvailableLangs(defaultAvailableLangs);
                        const ts: TypeTData = await this.getRemote(lang, isLocalValuesAllowed);
                        this.translationsCache[lang] = ts;
                        this.availableLangsCache = remoteAvailableLangs;
                        clearInterval(this.tInterval);
                        this.tInterval = -1;
                        raiseEvent(Ei18nEvents.updateTranslations);
                    } catch (err) {
                        console.error(err); // eslint-disable-line no-console
                    }
                    if (this.tIntervalCount >= 6) {
                        // Timeout
                        clearInterval(this.tInterval);
                        this.tInterval = -1;
                    } else {
                        this.tIntervalCount += 1;
                    }
                },
                10000,
            );
        }
        return {
            availableLangs,
            translations,
        };
    }

    async getRemoteAvailableLangs(defaultAvailable: string[]) {
        if (this.apiUrl) {
            const authQs: string = await this.createAuthQs(this.appId, this.appSecret);
            const availableUrl = `${this.apiUrl}/lang?${authQs}`;
            const resp = await fetch(availableUrl, {
                method: 'GET',
                headers: this.requestOptions,
                credentials: 'include',
            });

            if (resp.ok) {
                // No hay respuesta del servidor o ya tenemos la ultima locVersion en localstorage
                return (await resp.json()) || defaultAvailable;
            }
        } else {
            throw new Error('API URL was not configured');
        }

        return defaultAvailable;
    }

    async getRemote(lang: string, isLocalValuesAllowed: boolean) {
        if (this.apiUrl) {
            const authQs: string = await this.createAuthQs(this.appId, this.appSecret);
            const storageVersion: number = getStorageVersion(lang);
            const vUrl = `${this.apiUrl}/lang/loc-version?lang=${lang}&${authQs}`;
            // gestion de la version
            const vResponse = await fetch(vUrl, {
                method: 'GET',
                headers: this.requestOptions,
                credentials: 'include',
            });

            const locVersionStr = (await vResponse.text()) || '-1';
            const locVersion = parseFloat(locVersionStr);
            if (!vResponse.ok || locVersion < 0 || locVersion === storageVersion) {
                // No hay respuesta del servidor o ya tenemos la ultima locVersion en localstorage
                return this.getLocal(lang, isLocalValuesAllowed);
            }

            // hay una nueva version en el servidor => la descargamos
            let allUrl = `${this.apiUrl}/locale/all.json?lang=${lang}&${authQs}`;
            if (this.tags && this.tags.length > 0) {
                allUrl += `&tags=${this.tags.join(',')}`;
            }

            const locResponse = await fetch(allUrl, {
                method: 'GET',
                headers: this.requestOptions,
                credentials: 'include',
            });

            if (locResponse.ok) {
                // Elimina la `${TAG_I18N_TRANSLATIONS}_${lang}_${version}` para el idioma seleccionado
                removeStorageT(lang);
                const translations: TypeTData = this.process(await locResponse.json());
                setStorageT(lang, locVersion, translations);
                return translations;
            }
            throw new Error(`${locResponse.statusText}: ${await locResponse.text()}`);
        } else {
            throw new Error('API URL was not configured');
        }
    }

    async getLocal(lang: string, isLocalValuesAllowed: boolean) {
        // Check if available in localstorage and otherwise failback to assets
        const storageVersion: number = getStorageVersion(lang);
        let storageTranslations = getStorageT(lang, storageVersion);
        const assetsVersion = await fetch('assets/translations/versions.json');
        let version = 0;
        if (assetsVersion.ok) {
            const versionJson = (await assetsVersion.json()) || {};
            const versionStr = versionJson[`version_${lang}`] || '0';
            version = parseFloat(versionStr);
        }
        if (storageVersion < 0 || Object.keys(storageTranslations).length === 0 || storageVersion < version) {
            // En caso que la versión del localstorage no exista, que las traducciones del localstorage estén vacías
            // o que la versión del localstorage sea menor que la versión en assets/translations/versions.json
            // hay que leer los datos en assets/translations/all.json y guardarlos en locastorage
            const assetsTranslations = await fetch(`assets/translations/all${lang ? '-' : ''}${lang}.json`);
            if (assetsTranslations.status === 404 && lang !== '') {
                // No existen valores para este idioma, cogemos los valores por defecto
                return this.getLocal('', isLocalValuesAllowed);
            }
            if (!assetsTranslations.ok) {
                return {};
            }
            // Procesamos las traducciones y las guardamos en localstorage
            const translations: TypeTData = this.process(await assetsTranslations.json());
            setStorageT(lang, version, translations);
            storageTranslations = translations;
        }
        return storageTranslations;
    }

    private async createAuthQs(appId: string, appSecret: string): Promise<string> {
        if (appId && appSecret) {
            const nonce = new Date().getTime();
            const token = await this.generateToken(`${appSecret}-${nonce}`);
            return `appId=${encodeURIComponent(appId)}&token=${encodeURIComponent(token)}&timestamp=${nonce}`;
        }
        return '';
    }

    private async generateToken(password: string): Promise<string> {
        try {
            const hashBytes = 32;
            const saltBytes = 40;
            const iterations = 100;
            const digest = 'SHA-512';

            const pwBuf = this.str2ab(password);
            // First, create a PBKDF2 "key" containing the password
            const baseKey = await window.crypto.subtle.importKey('raw', pwBuf, 'PBKDF2', false, ['deriveBits', 'deriveKey']);

            // Generate random salt
            const salt = new Uint8Array(saltBytes);
            window.crypto.getRandomValues(salt);

            // Derive a key from the password and random salt
            const params = { iterations, salt, name: 'PBKDF2', hash: digest };
            const hash = await crypto.subtle.deriveBits(params, baseKey, hashBytes * 8);
            const hashUint8 = new Uint8Array(hash);

            // Create combined token
            const combined = new ArrayBuffer(salt.length + hashUint8.length + 8);
            const dataview = new DataView(combined);

            // Write data into combined buffer
            // Server is using Big Endian
            dataview.setUint32(0, salt.length, false);
            dataview.setUint32(4, params.iterations, false);
            for (let i = 0; i < salt.length; i += 1) {
                dataview.setUint8(i + 8, salt[i]);
            }
            for (let i = 0; i < hashUint8.length; i += 1) {
                dataview.setUint8(i + salt.length + 8, hashUint8[i]);
            }

            // Return as base64 string
            const combinedS = this.ab2str(combined);
            return btoa(combinedS);
        } catch (err) {
            console.error(`Key derivation failed: ${err.message}`); // eslint-disable-line no-console
        }
        return '';
    }

    private ab2str(buffer) {
        const byteArray = new Uint8Array(buffer);
        let byteString = '';
        for (let i = 0; i < byteArray.byteLength; i += 1) {
            byteString += String.fromCodePoint(byteArray[i]);
        }
        return byteString;
    }

    private str2ab(byteString) {
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i += 1) {
            byteArray[i] = byteString.codePointAt(i);
        }
        return byteArray;
    }

    /**
    * Fills notFound array with empty translation strings.
    * @param object translations json.
    */
    private process(object: any) {
        return Object.keys(object).reduce((newObject, key) => {
            if (typeof object[key] === 'object') {
                newObject[key] = this.process(object[key]); // eslint-disable-line no-param-reassign
            } else if ((typeof object[key] === 'string') && (object[key] === '')) {
                this.notFoundCache.push(key);
            } else {
                newObject[key] = object[key]; // eslint-disable-line no-param-reassign
            }
            return newObject;
        }, {});
    }

    handleMissing(translationID, lang) {
        if (this.notFoundCache.indexOf(translationID) < 0) {
            clearInterval(this.missingsInterval[translationID]);
            this.notFoundCache.push(translationID);
            if (this.apiUrl) {
                // Report if not yet reported or retry after 5 minutes
                this.missingsInterval[`${translationID}-count`] = 0;
                this.missingsInterval[translationID] = setInterval(
                    async () => {
                        try {
                            const authQs = await this.createAuthQs(this.appId, this.appSecret);
                            const data = {
                                lang,
                                tag: this.missingTag,
                                text: translationID,
                                extra: (window as any).location.href,
                            };
                            await fetch(`${this.apiUrl}/locale/missing?${authQs}`, {
                                method: 'POST',
                                headers: this.requestOptions,
                                credentials: 'include',
                                body: JSON.stringify(data),
                            });
                            clearInterval(this.missingsInterval[translationID]);
                        } catch (error) {
                            console.error(error); // eslint-disable-line no-console
                        }
                        if (this.missingsInterval[`${translationID}-count`] >= 6) {
                            clearInterval(this.missingsInterval[translationID]);
                        } else {
                            this.missingsInterval[`${translationID}-count`] += 1;
                        }
                    },
                    10000,
                );
            }
        }
        return translationID;
    }
}
