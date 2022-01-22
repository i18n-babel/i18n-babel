const TAG_I18N_TRANSLATIONS = '__i18njs-data';

export interface IApiData {
    apiUrl: string;
    appId: string;
    appSecret: string;
}

export type TypeTData = {
    [key: string]: string;
};

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

export function getStorageT(lang: string, version: number): TypeTData | {} {
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

/**
 * Devuelve la versión, solamente habrá una versión en localstorage, ya que
 * la anterior se elimina antes de guardar la nueva.
 * @param lang El idioma para el que se quieren las traducciones
 */
export function getStorageVersion(lang: string): number {
    const tag = Object.keys(localStorage).find((tag: string) => tag.includes(getTag(lang)));
    const version = tag ? tag.split('_').pop() : '-1';
    return parseFloat(version);
}
