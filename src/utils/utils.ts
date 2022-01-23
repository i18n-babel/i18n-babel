const TAG_I18N_TRANSLATIONS = '__i18njs-data';

/**
 * Interface that defines the initialization parameters of Translator
 */
export interface ITranslatorOptions {
    /** Allowed languages array, if found language is not in this array, will fall back to default, defaults to ['en'] */
    availableLangs: string[];
    /** The default language to select when the selected one is not found in availableLangs, defaults to 'en' */
    defaultLanguage?: string;
    /** Will take precedence over navigator language, defaults to 'en' */
    userLanguage?: string;
    /** Show missing translations in console.warn, defaults to false */
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
}

export type TypeTData = {
    [key: string]: string;
};

export type TypeTranslationsConfig = {
    availableLangs: string[];
    translations: TypeTData;
};

export enum Ei18nEvents {
    updateTranslations = 'i18n-update-translations',
}

export function raiseEvent(eventName: Ei18nEvents) {
    document.dispatchEvent(new Event(eventName));
}

/**
 * Devuelve la tag que se usará para el localstorage, compuesta por estos
 * elementos, separados por `_`:
 * - TAG estándar `TAG_I18N_TRANSLATIONS`
 * - El idioma de las traducciones
 * - La versión, si no es `undefined` siempre se pone en el último tramo.
 * @param lang idioma de las traducciones
 * @param version versión de las traducciones
 */
function getTag(lang: string, version?: number) {
    return `${TAG_I18N_TRANSLATIONS}_${lang}_${version || ''}`;
}

export function getStorageT(lang: string, version: number): TypeTData | Record<string, never> {
    if (version >= 0) {
        const translations: TypeTData = JSON.parse(localStorage.getItem(getTag(lang, version)));
        if (Object.keys(translations).length > 0) {
            return translations;
        }
    }
    return {};
}

export function setStorageT(lang: string, version: number, translations: TypeTData): void {
    localStorage.setItem(getTag(lang, version), JSON.stringify(translations));
}

export function removeStorageT(lang: string): void {
    Object.keys(localStorage)
        .filter(key => key.includes(getTag(lang)))
        .map(key => localStorage.removeItem(key));
}

export function clearLocalStorage() {
    Object.keys(localStorage)
        .filter(key => key.startsWith(TAG_I18N_TRANSLATIONS))
        .map(key => localStorage.removeItem(key));
}

/**
 * Devuelve la versión, solamente habrá una versión en localstorage, ya que
 * la anterior se elimina antes de guardar la nueva.
 * @param lang El idioma para el que se quieren las traducciones
 */
export function getStorageVersion(lang: string, defaultVersion = '-1'): number {
    const key = Object.keys(localStorage).find((k: string) => k.includes(getTag(lang)));
    const version = key ? key.split('_').pop() : defaultVersion;
    return parseFloat(version);
}
