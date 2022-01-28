import { TypeTData } from './types';

const TAG_I18N_TRANSLATIONS = '__i18n-babel-data';

/**
 * Devuelve la tag que se usará para el localstorage, compuesta por estos
 * elementos, separados por `_`:
 * - TAG estándar `TAG_I18N_TRANSLATIONS`
 * - El idioma de las traducciones
 * - La versión, si no es `undefined` siempre se pone en el último tramo.
 * @param lang idioma de las traducciones
 * @param version versión de las traducciones
 */
function getTag(lang: string, version = 0) {
    return `${TAG_I18N_TRANSLATIONS}_${lang}_${version > -2 ? version : ''}`;
}

function removeStorageT(lang: string): void {
    Object.keys(localStorage)
        .filter(key => key.includes(getTag(lang, -2)))
        .map(key => localStorage.removeItem(key));
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
    // Elimina la `${TAG_I18N_TRANSLATIONS}_${lang}_${version}` para el idioma seleccionado
    removeStorageT(lang);
    localStorage.setItem(getTag(lang, version), JSON.stringify(translations));
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
    const key = Object.keys(localStorage).find((k: string) => k.includes(getTag(lang, -2)));
    const version = key ? key.split('_').pop() : defaultVersion;
    return parseFloat(version);
}
