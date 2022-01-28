/**
 * Interface that defines the initialization parameters of Translator
 */
export interface ITranslatorOptions {
    /** Allowed languages array, if found language is not in this array, will fall back to default, defaults `['en']` */
    availableLangs?: string[];
    /** The default language to select when the selected one is not found in availableLangs, defaults `'en'` */
    defaultLanguage?: string;
    /** Will take precedence over navigator language, defaults `'en'` */
    userLanguage?: string;
    /** Show missing translations in console, defaults `false` */
    isShowMissing?: boolean;
    /** Allow the use of cookie `lang` to save the language and localstorage to save translations and versions, defaults `false` */
    isLocalValuesAllowed?: boolean;
    /** Api url to get remote updates, defaults `null` */
    apiUrl?: string;
    /** App id to get remote updates, defaults `null` */
    appId?: string;
    /** App secret to get remote updates, defaults `null` */
    appSecret?: string;
    /** The tag that will be sent to server when missing string is found, defaults `'app'` */
    missingTag?: string;
    /** The tags to filter strings on server side, defaults `[]` */
    tags?: string[];
    /** Path to the location of assets files, defaults `'assets/i18n'` */
    assetsLocation?: string;
    /**
     * Names of the translations and version files. Examples of use:
     * ```
     * { "--": "filename1.json", "ca": "filename2.json", "en": "filename3.json", ..., "versions": "filename.json" }
     * ```
     * defaults: For every language, the default file is located at `all-${langCode}.json`:
     * ```
     * { "--": "all.json", "ca": "all-ca.json", "en": "all-en.json", ..., "versions": "versions.json" }
     * ```
     */
    fileNames?: { [key: string]: string };
    /**
     * Enables attribute translations. This is less performant than tag option because it has to traverse and observe all DOM
     * to be reactive to changes. Defaults `false`
     */
    isEnableAttr?: boolean;
    /** *EXPERIMENTAL*: When using a custom component, it defines the tag name, defaults `'i18n-babel'` */
    tagName?: string;
    /** *EXPERIMENTAL*: When using a custom component, it defines the attribute name for intetrpolation options, defaults `'data-i18n'` */
    dataAttribute?: string;
}

/**
 * Events emitted by i18n-babel
 */
export enum Ei18nEvents {
    /** Emitted when translator is ready to be initialized */
    translatorReady = 'i18n-babel-ready',
    /** Raixed when new translations are available, either because new language has been selected
     * or because remote download has finished */
    updateTranslations = 'i18n-babel-update-translations',
    /** Event emitted when missing (empty) translation is found
     * - `ev.detail` contains original text
     * *Only emitted when `isShowMissing` is set to `true`* */
    missingTranslation = 'i18n-babel-missing-translation',
    /** Event emitted when new translation is found
     * - `ev.detail` contains original text
     * *Only emitted when `isShowMissing` is set to `true`* */
    newTranslation = 'i18n-babel-new-translation',
}

export type TypeTData = {
    [key: string]: string;
};
