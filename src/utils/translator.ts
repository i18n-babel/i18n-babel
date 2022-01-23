import { Language } from './language';
import { TranslationsDownloader } from './translationsDownloader';
import { clearLocalStorage, II18nOptions, TypeTData } from './utils';

/**
 * Esta clase gestiona todo el contenido de las traducciones
 */
export class Translator {
    static instance: Translator;
    private tDonwloader: TranslationsDownloader;
    private language: Language;
    private isShowMissing: boolean;
    private isLocalValuesAllowed = false;
    private availableLangs = ['en'];

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    static getInstance() {
        if (!Translator.instance) {
            throw new Error('Translator is not yet initialized, please call Translator.init() first');
        }
        return Translator.instance;
    }

    static init(options: II18nOptions) {
        let { instance } = Translator;
        const {
            apiUrl,
            appId,
            appSecret,
            availableLangs = ['en'], // TODO: GET /i18n/langs
            defaultLanguage = 'en',
            isShowMissing = false,
            isLocalValuesAllowed = false,
            userLanguage = null,
            missingTag = 'app',
            tags = [],
        } = options;
        if (instance) {
            // Cambia los parametros de inicializacion
            instance.availableLangs = availableLangs;
            instance.isLocalValuesAllowed = isLocalValuesAllowed;
            instance.language.setValues(defaultLanguage);
            instance.tDonwloader.setValues(apiUrl, appId, appSecret);
            return instance;
        }
        instance = new Translator();
        instance.tDonwloader = new TranslationsDownloader(apiUrl, appId, appSecret, missingTag, tags);
        instance.availableLangs = availableLangs;
        instance.isLocalValuesAllowed = isLocalValuesAllowed;
        instance.language = new Language(defaultLanguage, isLocalValuesAllowed, userLanguage);
        instance.language.initLanguage(availableLangs);
        instance.isShowMissing = isShowMissing;

        Translator.instance = instance;
        return instance;
    }

    static setLocalValuesAllowed(isLocalValuesAllowed = false) {
        this.getInstance().setLocalValuesAllowed(isLocalValuesAllowed);
    }

    setLocalValuesAllowed(isLocalValuesAllowed = false) {
        this.language.setLocalValuesAllowed(isLocalValuesAllowed);
        this.isLocalValuesAllowed = isLocalValuesAllowed;

        if (!isLocalValuesAllowed) {
            clearLocalStorage();
        }
    }

    /**
    * Tries to translate a text, returns the text itself if no translation is found.
    * @param originalText text to translate
    * @param tData Interpolation parameters
    * @param lang  Translation language
    * @returns Translated text
    */
    static t(originalText: string, tData?: TypeTData, lang?: string) {
        return this.getInstance().t(originalText, tData, lang);
    }

    /**
     * Tries to translate a text, returns the text itself if no translation is found.
     * @param originalText text to translate
     * @param tData Interpolation parameters
     * @param lang  Translation language
     * @returns Translated text
     */
    // tslint:disable-next-line: function-name
    async t(originalText: string, tData?: TypeTData, lang?: string) {
        const selectedLanguage: string = lang || this.language.getLanguage(this.availableLangs);
        const { availableLangs, translations } = await this.tDonwloader.getTranslationsConfig(
            this.availableLangs,
            selectedLanguage,
            this.isLocalValuesAllowed,
        );
        this.availableLangs = availableLangs;
        let translated: string = originalText;

        if (!translations[originalText]) {
            // Missing to server
            const missingText = await this.tDonwloader.handleMissing(originalText, selectedLanguage);
            if (translations[originalText] === '' && this.isShowMissing) {
                // La cadena ya se ha creado, pero todavía no se ha traducido
                console.warn(`Still missing translation for "${originalText}"`); // eslint-disable-line no-console
            } else if (this.isShowMissing) {
                console.warn(`Missing translation for "${missingText}"`); // eslint-disable-line no-console
            }
            translated = originalText;
        } else {
            translated = translations[originalText];
        }

        return tData ? this.interpolate(translated, tData) : translated;
    }

    /**
    * *Función para uso interno*. Recorre las keys del JSON para comprobar si coinciden con el RegExp (p.ej) : `(%key%)`,
    * si coinciden sustituye la palabra por el valor encontrado en el JSON (p.ej) : `(%nombre%)` por `Toni`
    * @param text Texto a interpolar
    * @param data Json que contiene los paramatros del componente (p.ej) : `{ nombre: 'Toni', edad: 25 }`
    * @returns El texto interpolado
    */
    private interpolate(text: string, data: TypeTData) {
        let interpolated = text;
        if (text.indexOf('(%') > -1) {
            Object.keys(data).forEach((tkey) => {
                const regex = new RegExp(`\\(%\\s*${tkey}\\s*%\\)`, 'g');
                interpolated = interpolated.replace(regex, data[tkey] || '');
            });
        }
        return interpolated;
    }

    /**
     * Changes the language of the application.
     * @param lang new language
     */
    static changeLanguage(lang: string) {
        this.getInstance().changeLanguage(lang);
    }

    /**
     * Changes the language of the application.
     * @param lang new language
     */
    changeLanguage(lang: string) {
        this.language.setLanguage(this.availableLangs, lang);
    }

    /**
     * Clears the translations cache and tries to download again the translations.
     */
    static cacheClear() {
        this.getInstance().cacheClear();
    }

    /**
     * Clears the translations cache and tries to download again the translations.
     */
    cacheClear() {
        this.tDonwloader.cacheClear();
    }
}
