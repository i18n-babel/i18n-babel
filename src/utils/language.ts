import { Ei18nEvents, raiseEvent } from './utils';

export class Language {
    private language: string;
    private defaultLanguage = 'en';
    private isLocalValuesAllowed = false;
    private userLanguage = null;

    constructor(defaultLanguage = 'en', isLocalValuesAllowed = false, userLanguage = null) {
        this.defaultLanguage = defaultLanguage;
        this.language = defaultLanguage;
        this.isLocalValuesAllowed = isLocalValuesAllowed;
        this.userLanguage = userLanguage;
    }

    setValues(defaultLanguage: string) {
        this.defaultLanguage = defaultLanguage;
    }

    setLocalValuesAllowed(isLocalValuesAllowed = false) {
        this.isLocalValuesAllowed = isLocalValuesAllowed;
        this.manageCookie(this.language);
    }

    /**
    * Comprueba si el valor introducido se encuentra en availableLangs (Lenguajes disponibles).
    * @param lang Dialecto (p.ej) `ue`, `en-ue`
    * @returns EL lang introducido o si no lo encuentra el defaultLanguage.
    */
    getFromAvailableDialects(availableLangs: string[], lang: string) {
        const language: string = lang.indexOf('-') < 0 ? lang : lang.split('-')[0];
        return availableLangs.find(l => l.indexOf(language) === 0) || this.defaultLanguage;
    }

    getFromAvailableLangs(availableLangs: string[], lang: string) {
        if (availableLangs.indexOf(lang.toLowerCase()) >= 0) {
            return lang.toLowerCase();
        }
        return this.getFromAvailableDialects(availableLangs, lang);
    }

    initLanguage(availableLangs: string[], resetCookie = false) {
        let lang: string;

        if (this.isLocalValuesAllowed) {
            const [, cookieLang] = document.cookie.trim().match(/lang=([^;]*)/) || [];
            if (cookieLang) {
                const [, value] = cookieLang;
                lang = this.getFromAvailableLangs(availableLangs, value);
            }
        }

        if (!lang || resetCookie) {
            lang = this.userLanguage
                || (window as any).navigator.userLanguage
                || window.navigator.language
                || this.defaultLanguage;
            lang = this.getFromAvailableLangs(availableLangs, lang);
            this.manageCookie(lang);
        }

        if (lang !== this.language) {
            this.language = lang;
            raiseEvent(Ei18nEvents.updateTranslations);
        }
    }

    getLanguage(availableLangs: string[], resetCookie = false) {
        if (!this.language) {
            this.initLanguage(availableLangs, resetCookie);
        }
        return this.language;
    }

    setLanguage(availableLangs: string[], lang: string) {
        if (this.language !== lang) {
            this.language = this.getFromAvailableLangs(availableLangs, lang);
            this.userLanguage = this.language;
            this.manageCookie(this.language);
            raiseEvent(Ei18nEvents.updateTranslations);
        }
    }

    manageCookie(lang: string) {
        if (this.isLocalValuesAllowed) {
            const exdate: Date = new Date();
            exdate.setDate(exdate.getDate() + 20 * 365);
            document.cookie = `lang=${lang};expires=${exdate.toUTCString()};path=/`;
        } else {
            document.cookie = 'lang=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
        }
    }
}
