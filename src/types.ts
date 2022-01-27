/**
 * Interface that defines the initialization parameters of Translator
 */
export interface ITranslatorOptions {
    /** Allowed languages array, if found language is not in this array, will fall back to default, defaults to ['en'] */
    availableLangs?: string[];
    /** The default language to select when the selected one is not found in availableLangs, defaults to 'en' */
    defaultLanguage?: string;
    /** Will take precedence over navigator language, defaults to 'en' */
    userLanguage?: string;
    /** Show missing translations in console, defaults to false */
    isShowMissing?: boolean;
    /** Allow the use of cookie `lang` to save the language and localstorage to save translations and versions, defaults to false */
    isLocalValuesAllowed?: boolean;
    /** Api url to get remote updates, defailts to null */
    apiUrl?: string;
    /** App id to get remote updates, defailts to null */
    appId?: string;
    /** App secret to get remote updates, defailts to null */
    appSecret?: string;
    /** The tag that will be sent to server when missing string is found, defaults to 'app' */
    missingTag?: string;
    /** The tags to filter strings on server side, defaults [] */
    tags?: string[];
    /** Path to the location of assets files, defaults 'assets/i18n' */
    assetsLocation?: string;
    /**
     * Names of the translations and version files. Define it as:
     * ```
     * { "--": "filename1.json", "ca": "filename2.json", "en": "filename3.json", ..., "versions": "filename.json" }
     * ```
     * defaults: For every language, the default file is located at `all-${langCode}.json`:
     * ```
     * { "--": "all.json", "ca": "all-ca.json", "en": "all-en.json", ..., "versions": "versions.json" }
     * ```
     */
    fileNames?: { [key: string]: string };
    /** When using a custom component, it defines the tag name, defaults i18n-babel */
    tagName?: string;
    /** When using a custom component, it defines the attribute name for intetrpolation options, defaults data-i18n */
    dataAttribute?: string;
}

export enum Ei18nEvents {
    translatorReady = 'i18n-babel-ready',
    updateTranslations = 'i18n-babel-update-translations',
    missingTranslation = 'i18n-babel-missing-translation',
    newTranslation = 'i18n-babel-new-translation',
}

export type TypeTData = {
    [key: string]: string;
};
