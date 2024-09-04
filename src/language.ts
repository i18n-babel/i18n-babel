import { Ei18nEvents, ITranslatorOptions } from './types';
import { raiseEvent } from './utils';

export class Language {
    private language: string;
    private opts: ITranslatorOptions;

    constructor(options: ITranslatorOptions) {
        this.opts = options;
    }

    changeOptions(options: ITranslatorOptions) {
        this.opts = options;
        this.manageCookie(this.language);
    }

    getLangFromDialect(lang: string) {
        return lang.indexOf('-') < 0 ? lang : lang.split('-')[0];
    }

    /**
    * Comprueba si el valor introducido se encuentra en availableLangs (Lenguajes disponibles).
    * @param lang Dialecto (p.ej) `ue`, `en-ue`
    * @returns EL lang introducido o si no lo encuentra el defaultLanguage.
    */
    getFromAvailableDialects(availableLangs: string[], lang: string) {
        const language: string = this.getLangFromDialect(lang);
        return availableLangs.find(l => l.indexOf(language) === 0) || this.guessLanguage(true);
    }

    getFromAvailableLangs(availableLangs: string[], lang: string) {
        if (availableLangs.indexOf(lang.toLowerCase()) >= 0) {
            return lang.toLowerCase();
        }
        return this.getFromAvailableDialects(availableLangs, lang);
    }

    initLanguage(availableLangs: string[]) {
        const lang: string = this.getDefaultLanguage(availableLangs);

        if (lang !== this.language) {
            this.language = lang;
            raiseEvent(Ei18nEvents.updateTranslations, { lang });
        }
    }

    guessLanguage(isSkipCookie = false, resetCookie = false) {
        let lang: string;
        if (this.opts.isLocalValuesAllowed && !isSkipCookie) {
            const [, cookieLang] = document.cookie.trim().match(/lang=([^;]*)/) || [];
            if (cookieLang) {
                lang = this.getLangFromDialect(cookieLang);
            }
        }

        if (!lang || resetCookie) {
            lang = this.opts.userLanguage
                || (window as any).navigator.userLanguage
                || window.navigator.language
                || this.opts.defaultLanguage
                || 'en';
            lang = this.getLangFromDialect(lang);
            if (this.opts.availableLangs.indexOf(lang) === -1) {
                lang = this.opts.defaultLanguage || 'en';
            }
            if (resetCookie) {
                this.manageCookie(lang);
            }
        }

        return lang;
    }

    getDefaultLanguage(availableLangs: string[]) {
        const lang: string = this.guessLanguage(false);
        return this.getFromAvailableLangs(availableLangs, lang);
    }

    getCurrentLanguage(availableLangs: string[]) {
        if (!this.language) {
            this.initLanguage(availableLangs);
        }
        return this.language;
    }

    setLanguage(availableLangs: string[], lang: string) {
        if (this.language !== lang) {
            const newLang = this.getFromAvailableLangs(availableLangs, lang);
            if (newLang) {
                this.language = newLang;
                raiseEvent(Ei18nEvents.updateTranslations, { lang: newLang });
            }
        }

        this.manageCookie(lang);
        return this.language;
    }

    manageCookie(lang: string) {
        if (lang && this.opts.isLocalValuesAllowed) {
            const exdate: Date = new Date();
            exdate.setDate(exdate.getDate() + 20 * 365);
            document.cookie = `lang=${lang};expires=${exdate.toUTCString()};path=/`;
        } else {
            document.cookie = 'lang=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;';
        }
    }
}
