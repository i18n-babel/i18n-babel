export class Language {
    private language: string;
    private availableLangs = ['en']; // TODO: GET /i18n/langs
    private defaultLanguage = 'en';
    private eventUpdateT = new Event('i18n-update-translations');

    constructor(availableLangs = ['en'], defaultLanguage = 'en') {
        this.availableLangs = availableLangs;
        this.defaultLanguage = defaultLanguage;
        this.language = defaultLanguage;
    }

    setValues(availableLangs: string[], defaultLanguage: string) {
        this.availableLangs = availableLangs;
        this.defaultLanguage = defaultLanguage;
    }

    /**
    * Comprueba si el valor introducido se encuentra en availableLangs (Lenguajes disponibles).
    * @param lang Dialecto (p.ej) `ue`, `en-ue`
    * @returns EL lang introducido o si no lo encuentra el defaultLanguage.
    */
    selectDialect(lang: string) {
        const language: string = lang.indexOf('-') < 0 ? lang : lang.split('-')[0];
        return this.availableLangs.find(l => l.indexOf(language) === 0) || this.defaultLanguage;

    }

    selectLang(lang: string) {
        if (this.availableLangs.indexOf(lang.toLowerCase()) >= 0) {
            return lang.toLowerCase();
        }
        return this.selectDialect(lang);
    }

    initLanguage(resetCookie: Boolean = false) {
        let lang: string;
        let exdate: Date;

        const [, cookieLang] = document.cookie.trim().match(/lang=([^;]*)/) || [];
        if (cookieLang) {
            const [, value] = cookieLang;
            lang = this.selectLang(value);
        }

        if (!lang || resetCookie) {
            const user = JSON.parse(localStorage.getItem('user') || '{}') || {};
            lang = user.lang ||
                (window as any).navigator.userLanguage ||
                window.navigator.language ||
                this.defaultLanguage;
            exdate = new Date();
            exdate.setDate(exdate.getDate() + 20 * 365);
            lang = this.selectLang(lang);
            document.cookie = `lang=${lang};expires=${exdate.toUTCString()};path=/`;
        }

        if (lang !== this.language) {
            this.language = lang;
            document.dispatchEvent(this.eventUpdateT);
        }
    }

    getLanguage(resetCookie: Boolean = false) {
        if (!this.language) {
            this.initLanguage(resetCookie);
        }
        return this.language;
    }

    setLanguage(lang: string) {
        if (this.language !== lang) {
            this.language = this.selectLang(lang);
            const exdate: Date = new Date();
            exdate.setDate(exdate.getDate() + 20 * 365);
            document.cookie = `lang=${this.language};expires=${exdate.toUTCString()};path=/`;

            document.dispatchEvent(this.eventUpdateT);
        }
    }
}
