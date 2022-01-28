import { generateToken } from './auth';
import { getStorageT, getStorageVersion, setStorageT } from './storage';
import { Ei18nEvents, ITranslatorOptions, TypeTData } from './types';
import { raiseEvent, TypeTranslationsData } from './utils';

export class TranslationsDownloader {
    private opts: ITranslatorOptions;
    private tInterval: any = -1;
    private tIntervalCount = 0;
    private missingsInterval = {};
    private translationsCache = {};
    private availableLangsCache = [];
    private notFoundCache: { [key: string]: boolean } = {};
    private localVersion = -1;
    private localTranslations: { [key: string]: TypeTData } = {};
    private asset2Json: { [key: string]: Promise<any> } = {};
    private assetsFetcherPromises: { [key: string]: Promise<Response> } = {};
    private requestOptions = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': location.origin, // eslint-disable-line no-restricted-globals
        'x-translate-i18n': 'js',
    };
    localTranslationsRequest: { [key: string]: Promise<TypeTData> } = {};

    constructor(options: ITranslatorOptions) {
        this.opts = options;
    }

    changeOptions(options: ITranslatorOptions) {
        this.opts = options;
    }

    cacheClear() {
        this.translationsCache = {};
        this.availableLangsCache = [];
    }

    /**
    * Obtiene las traducciones para un idioma y los idiomas disponibles.
    * Primero mira en la cache y sino las obtiene de (p.ej. para es): `assets/i18n/all-es.json`
    * @param lang Idiioma de las traducciones
    * isForceRefresh
    * @returns Un objeto json con las traducciones disponibles para ese idioma
    */
    async getTranslationsData(defaultAvailableLangs: string[], lang: string): Promise<TypeTranslationsData> {
        // - Cancelar el intervalo anterior de refresco
        // const isIdle = this.tInterval < 0;
        // clearInterval(this.tInterval);

        // - Miramos si las traducciones ya están en cache
        if (this.translationsCache[lang]) {
            return {
                availableLangs: this.availableLangsCache,
                translations: this.translationsCache[lang],
            };
        }

        // - Obtememos las traducciones locales
        const translations = await this.getLocalTranslationsOnce(lang);
        const availableLangs = defaultAvailableLangs;
        this.translationsCache[lang] = translations;
        this.availableLangsCache = availableLangs;

        // - Miramos que no se haya iniciado ya anteriormente el proceso de descarga en background
        if (this.tInterval < 0) {
            // - Iniciamos el descargador de las remote en background y el intérvalo de reintentos
            this.tIntervalCount = 0;
            this.tInterval = setInterval(() => this.downloadTranslationsData(defaultAvailableLangs, lang), 10000);
            this.downloadTranslationsData(defaultAvailableLangs, lang);
        }
        return {
            availableLangs,
            translations,
        };
    }

    async downloadTranslationsData(defaultAvailableLangs: string[], lang: string) {
        if (!this.opts.apiUrl) {
            clearInterval(this.tInterval);
            this.tInterval = -1;
            return;
        }

        try {
            const remoteAvailableLangs = await this.getRemoteAvailableLangs(defaultAvailableLangs);
            const remoteTranslations = await this.getRemoteTranslations(lang);
            this.translationsCache[lang] = remoteTranslations;
            this.availableLangsCache = remoteAvailableLangs;
            clearInterval(this.tInterval);
            this.tInterval = -1;
            raiseEvent(Ei18nEvents.updateTranslations, { lang });
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
    }

    async getRemoteAvailableLangs(defaultAvailable: string[]) {
        const authQs: string = await this.createAuthQs(this.opts.appId, this.opts.appSecret);
        const availableUrl = `${this.opts.apiUrl}/lang?${authQs}`;
        const resp = await fetch(availableUrl, {
            method: 'GET',
            headers: this.requestOptions,
            credentials: 'include',
        });

        if (resp.ok) {
            // No hay respuesta del servidor o ya tenemos la ultima locVersion en localstorage
            return (await resp.json()) || defaultAvailable;
        }

        return defaultAvailable;
    }

    async getRemoteTranslations(lang: string) {
        const authQs: string = await this.createAuthQs(this.opts.appId, this.opts.appSecret);
        const storageVersion: number = getStorageVersion(lang);
        const vUrl = `${this.opts.apiUrl}/lang/loc-version?lang=${lang}&${authQs}`;
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
            return this.getLocalTranslationsOnce(lang);
        }

        // hay una nueva version en el servidor => la descargamos
        let allUrl = `${this.opts.apiUrl}/locale/all.json?lang=${lang}&${authQs}`;
        if (this.opts.tags && this.opts.tags.length > 0) {
            allUrl += `&tags=${this.opts.tags.join(',')}`;
        }

        const locResponse = await fetch(allUrl, {
            method: 'GET',
            headers: this.requestOptions,
            credentials: 'include',
        });

        if (locResponse.ok) {
            const translations: TypeTData = this.process(await locResponse.json());
            setStorageT(lang, locVersion, translations);
            return translations;
        }
        throw new Error(`${locResponse.statusText}: ${await locResponse.text()}`);
    }

    /**
     * Check if available in localstorage and otherwise failback to assets
     * @param lang language
     * @param isLocalValuesAllowed local values allowed => save to localStorage
     * @returns tranlsations in localstorage or in assets
     */
    getLocalTranslationsOnce(lang: string): Promise<TypeTData> {
        // Prevent asking again and again
        const langKey = lang || '--';
        if (this.localTranslations[langKey] !== undefined) {
            return Promise.resolve(this.localTranslations[langKey]);
        }

        // We save a refference to the promise, so it will be called only once
        if (!this.localTranslationsRequest[langKey]) {
            this.localTranslationsRequest[langKey] = this.getLocalTranslations(lang);
        }

        return this.localTranslationsRequest[langKey];
    }

    async getLocalTranslations(lang: string): Promise<TypeTData> {
        const langKey = lang || '--';
        const version = await this.getAssetsVersion(lang);
        const storageVersion: number = getStorageVersion(lang, '-1');
        let storageTranslations = getStorageT(lang, storageVersion);

        if (storageVersion < 0 || Object.keys(storageTranslations).length === 0 || storageVersion < version) {
            // En caso que la versión del localstorage no exista, que las traducciones del localstorage estén vacías
            // o que la versión del localstorage sea menor que la versión en assets,
            // hay que leer los datos en assets y guardarlos en locastorage
            const assetsTranslations = await this.getAssetsTranslations(lang);
            if (assetsTranslations !== undefined) {
                storageTranslations = assetsTranslations;
                if (this.opts.isLocalValuesAllowed) {
                    setStorageT(lang, version, assetsTranslations);
                }
            } else if (lang !== '') {
                // No existen valores para este idioma, leer los valores por defecto
                return this.getLocalTranslationsOnce('');
            }
        }

        // Save assetsTranslations, wait here to save, so we can fetch assets in all calls
        this.localTranslations[langKey] = storageTranslations;
        delete this.localTranslationsRequest[langKey];
        return this.localTranslations[langKey];
    }

    private async getAssetsVersion(lang: string) {
        if (this.localVersion === -1) {
            // Obtener la versión en assets
            this.localVersion = 0;
            const assetsVersion = await fetch(`${this.opts.assetsLocation}/${this.opts.fileNames?.versions || 'versions.json'}`);
            if (assetsVersion.ok) {
                let versionJson = {};
                try {
                    // React returns 200 OK with main page when resource does not exist
                    versionJson = await assetsVersion.json();
                } catch { } // eslint-disable-line no-empty
                const versionStr = versionJson[lang || '--'] || '0';
                this.localVersion = parseFloat(versionStr);
            }
        }
        return this.localVersion;
    }

    private async getAssetsTranslations(lang: string): Promise<TypeTData> {
        const fileName = this.opts.fileNames[lang || '--'] || `all${lang ? '-' : ''}${lang}.json`;
        // Ask assets only once!
        if (this.assetsFetcherPromises[fileName] === undefined) {
            this.assetsFetcherPromises[fileName] = fetch(`${this.opts.assetsLocation}/${fileName}`);
        }
        const resp = await this.assetsFetcherPromises[fileName];
        if (!resp.ok) {
            // No existen valores para este idioma
            return undefined;
        }

        // El body solamente se puede usar una vez
        if (!resp.bodyUsed) {
            this.asset2Json[fileName] = resp.json();
        } else {
            while (!this.asset2Json) {
                // eslint-disable-next-line no-await-in-loop
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Procesamos las traducciones
        let json = {};
        try {
            json = await this.asset2Json[fileName];
        } catch { } // eslint-disable-line no-empty
        const translations = this.process(json);
        return translations;
    }

    private async createAuthQs(appId: string, appSecret: string): Promise<string> {
        if (appId && appSecret) {
            const nonce = new Date().getTime();
            const token = await generateToken(`${appSecret}-${nonce}`);
            return `appId=${encodeURIComponent(appId)}&token=${encodeURIComponent(token)}&timestamp=${nonce}`;
        }
        return '';
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
                this.notFoundCache[key] = true;
            } else {
                newObject[key] = object[key]; // eslint-disable-line no-param-reassign
            }
            return newObject;
        }, {});
    }

    /**
     * Finds if an string has empty translation.
     * Empty translation means that the original text is present in keys but no translation was found.
     * @param translationID the original text for the translation
     * @returns true if is missing, false otherwise
     */
    isMissing(translationID: string) {
        return this.notFoundCache[translationID] === true;
    }

    /**
     * Hides a translation from missing, so it will not be available as missing again.
     * Usefull to prevent notifying again and again.
     * @param translationID the original text for the translation
     */
    hideMissing(translationID: string) {
        if (this.notFoundCache[translationID] === true) {
            this.notFoundCache[translationID] = false;
        }
    }

    handleMissing(translationID: string, lang: string) {
        if (this.notFoundCache[translationID] === undefined) {
            clearInterval(this.missingsInterval[translationID]);
            this.notFoundCache[translationID] = false;
            if (this.opts.apiUrl) {
                // Report if not yet reported or retry after 5 minutes
                this.missingsInterval[`${translationID}-count`] = 0;
                this.missingsInterval[translationID] = setInterval(
                    async () => {
                        try {
                            const authQs = await this.createAuthQs(this.opts.appId, this.opts.appSecret);
                            const data = {
                                lang,
                                tag: this.opts.missingTag,
                                text: translationID,
                                extra: (window as any).location.href,
                            };
                            await fetch(`${this.opts.apiUrl}/locale/missing?${authQs}`, {
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
