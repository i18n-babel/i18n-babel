import { Language } from './language';
import { TranslationsDownloader } from './translationsDownloader';
import { IApiData, TypeTData } from './utils';

/**
 * Esta clase gestiona todo el contenido de las traducciones
 */
export class Translator {

    static instance: Translator;
    private translationDownloader: TranslationsDownloader;
    private language: Language;
    private isShowMissing: Boolean;

    private constructor() {
    }

    static getInstance() {
        if (!Translator.instance) {
            throw new Error('Translator is not yet initialized, please call Translator.init() first');
        }
        return Translator.instance;
    }

    static init(availableLangs: string[], defaultLanguage: string = 'en', apiData: IApiData, isShowMissing: Boolean = false) {
        let { instance } = Translator;
        const { apiUrl, appId, appSecret } = apiData;
        if (instance) {
            // Cambia los parametros de inicializacion
            instance.language.setValues(availableLangs, defaultLanguage);
            instance.translationDownloader.setValues(apiUrl, appId, appSecret);
            return instance;
        }
        instance = new Translator();
        instance.translationDownloader = new TranslationsDownloader(apiUrl, appId, appSecret);
        instance.language = new Language(availableLangs, defaultLanguage);
        instance.language.initLanguage();
        instance.isShowMissing = isShowMissing;

        Translator.instance = instance;
        return instance;
    }

    getInstanceTD() {
        return this.translationDownloader;
    }

    /**
     * Obtiene las traducciones y busca la que coincida con originalText
     * @param originalText Texto sin traducir
     * @param tData
     * @param lang  Idioma de las traducciones
     * @returns El texto traducido
     */
    // tslint:disable-next-line: function-name
    async t(originalText: string, tData?: TypeTData, lang?: string) {
        const selectedLanguage: string = lang || this.language.getLanguage();
        const translations: TypeTData = await this.translationDownloader.getTranslations(selectedLanguage);
        let translated: string = originalText;

        if (!translations[originalText]) {
            // Missing to server
            const missingText = await this.translationDownloader.handleMissing(originalText, selectedLanguage);
            if (translations[originalText] === '' && this.isShowMissing) {
                // La cadena ya se ha creado, pero todavía no se ha traducido
                console.warn(`Still missing translation for "${originalText}"`);
            } else {
                console.warn(`Missing translation for "${missingText}"`);
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
    interpolate(text: string, data: TypeTData) {
        let interpolated = text;
        if (text.indexOf('(%') > -1) {
            Object.keys(data).forEach((tkey) => {
                const regex = new RegExp(`\\(%\\s*${tkey}\\s*%\\)`, 'g');
                interpolated = interpolated.replace(regex, data[tkey] || '');
            });
        }
        return interpolated;
    }

    changeLanguage(lang: string) {
        this.language.setLanguage(lang);
    }

}
