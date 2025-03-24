import { Language } from './language';
import { clearLocalStorage } from './storage';
import { TManager } from './tManager';
import { TranslationsDownloader } from './translationsDownloader';
import { Ei18nEvents, ITranslatorOptions, TypeTData } from './types';
import { raiseEvent } from './utils';
import { I18nBabelWebcomponent } from './webComponent';

declare global {
    interface Window {
        Translator: typeof Translator;
        newTranslations: TypeTData;
    }
}

window.newTranslations = window.newTranslations || {};

/**
 * Translator is the main entry point for i18n-babel.
 * It can be used to initialize the i18n-babel system.
 * It also gives access to the translation API through `Translator.t` function.
 */
export class Translator {
    static instance: Translator;
    static defaultOptions: ITranslatorOptions = {
        availableLangs: ['en'],
        defaultLanguage: 'en',
        userLanguage: null,
        isShowMissing: false,
        isLocalValuesAllowed: false,
        isEnableAttr: false,
        tags: [],
        missingTag: 'app',
        assetsLocation: 'assets/i18n',
        fileNames: {},
        apiUrl: null,
        appId: null,
        appToken: null,
        tagName: 'i18n-babel',
        dataAttribute: 'data-i18n',
        dataTarget: 'data-i18n-target',
        interpolateLeft: '${',
        interpolateRight: '}',
    };
    private tDonwloader: TranslationsDownloader;
    private language: Language;
    private opts: ITranslatorOptions;
    private availableLangs: string[];
    private observers: MutationObserver[] = [];

    private ilEsc: string;
    private irEsc: string;

    private constructor(options: ITranslatorOptions) {
        if (Translator.isInitialized()) {
            throw new Error('Translator cannot be instantiated, please use `Translator.init()`');
        }
        this.setupOptions(options);

        this.tDonwloader = new TranslationsDownloader(this.opts);
        this.language = new Language(this.opts);
        this.language.initLanguage(this.opts.availableLangs);

        // custom components are not supported on es5, and we also check if already defined to support hmr
        if (typeof I18nBabelWebcomponent === 'function'
            && /^\s*class\s+/.test(I18nBabelWebcomponent.toString())
            && !customElements.get(this.opts.tagName)
        ) {
            // Register custom component
            I18nBabelWebcomponent.options = this.opts;
            customElements.define(this.opts.tagName, I18nBabelWebcomponent);
        }
        this.refreshMutationObservers();
    }

    /**
     * Gets the static instance of Translator
     * @returns an instance to the Translator class
     */
    static getInstance() {
        if (!Translator.isInitialized()) {
            return Translator.init();
        }
        return Translator.instance;
    }

    /**
     * Checks whether if Translator has been initialized
     * @returns true if the instance has been already initialized
     */
    static isInitialized() {
        return !!Translator.instance;
    }

    /**
     * Initializes the Translator system. It keeps only one instance per runtime
     * and it can be called as many times as desired. It will always return the
     * same instance.
     *
     * When called twice with different options, options will be overriden.
     *
     * @param options translator options
     * @returns a singleton instance to Translator
     */
    static init(options?: ITranslatorOptions) {
        let { instance } = Translator;
        if (instance) {
            // Cambia los parametros de inicializacion
            const isRefreshObservers = !instance.opts.isEnableAttr && options.isEnableAttr;
            instance.setupOptions(options);
            if (isRefreshObservers) {
                instance.refreshMutationObservers();
            }
            return instance;
        }

        instance = new Translator(options);
        Translator.instance = instance;
        // This has been done to avoid dependency cycle
        TManager.init(instance.t.bind(instance));
        return instance;
    }

    private setupOptions(options: ITranslatorOptions) {
        this.opts = { ...Translator.defaultOptions, ...options };
        this.availableLangs = this.opts.availableLangs;
        // const regexSpecialChars = [
        //     '.', ',', '+', ',', '*', ',', '?', ',', '^',
        //     ',', '$', ',', '(', ',', ')', ',', '[', ',',
        //     ']', ',', '{', ',', '}', ',', '|', ',', '\\'];
        // .split('').map(c => (regexSpecialChars.indexOf(c) > 0 ? `\\${c}` : c)).join('');
        this.ilEsc = this.opts.interpolateLeft.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        this.irEsc = this.opts.interpolateRight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        if (this.language) {
            this.language.changeOptions(this.opts);
        }
        if (this.tDonwloader) {
            this.tDonwloader.changeOptions(this.opts);
        }
    }

    private refreshMutationObservers() {
        this.disconnectObservers();
        if (this.opts.isEnableAttr) {
            this.processDataAttributes(document);
            this.startDOMObserver(document);
        }
    }

    /**
     * Attach TManager to all elements with the `dataAttribute` attribute, traversing shadow dom's
     */
    private processDataAttributes(target: Element | Document) {
        const elements = [target];
        // Check if it has subelements
        if (target.getElementsByTagName) {
            elements.push(...Array.from(target.getElementsByTagName('*')));
        }
        elements.forEach((el: Element) => {
            // Elements inserted via tagName are created with `customElements.define(this.opts.tagName, I18nBabelWebcomponent)`
            // They already have TManager attached
            if (el.hasAttribute && el.hasAttribute(this.opts.dataAttribute) && el.tagName !== this.opts.tagName) {
                TManager.attach(el, I18nBabelWebcomponent.options);
            }
            if (el.shadowRoot) {
                Array.from(el.shadowRoot.childNodes).forEach(cn => this.processDataAttributes(cn as Element));
                this.startDOMObserver(el.shadowRoot);
            }
        });
    }

    private startDOMObserver(target: Node) {
        const observer = new MutationObserver((mutations: MutationRecord[]) => mutations.forEach((m) => {
            if (m.type === 'childList' && m.addedNodes.length > 0) {
                m.addedNodes.forEach((el: any) => this.processDataAttributes(el));
            }
        }));
        // Start watching changes on this element
        observer.observe(target, {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: true,
            attributeFilter: [this.opts.dataAttribute],
        });
        this.observers.push(observer);
    }

    private disconnectObservers() {
        this.observers.forEach(o => o.disconnect());
        this.observers = [];
    }

    static setLocalValuesAllowed(isLocalValuesAllowed = false) {
        Translator.getInstance().setLocalValuesAllowed(isLocalValuesAllowed);
    }

    setLocalValuesAllowed(isLocalValuesAllowed = false) {
        this.opts.isLocalValuesAllowed = isLocalValuesAllowed;
        this.language.changeOptions(this.opts);

        if (!isLocalValuesAllowed) {
            clearLocalStorage();
        }
    }

    /**
    * Translates a text, returns the text itself if no translation is found.
    * @param originalText text to translate
    * @param tData Interpolation parameters
    * @param lang Translation language
    * @returns Translated text
    */
    static t(originalText: string, tData?: TypeTData, lang?: string) {
        return Translator.getInstance().t(originalText, tData, lang);
    }

    /**
    * Translates a text, returns the text itself if no translation is found.
    * @param originalText text to translate
    * @param tData Interpolation parameters
    * @param lang Translation language
    * @returns Translated text
    */
    static tJson(originalJson: { [key: string]: string }, tData?: TypeTData, lang?: string) {
        return Object.keys(originalJson).reduce(async (prev, key) => {
            const translated = await prev;
            return {
                ...translated,
                [key]: await Translator.getInstance().t(originalJson[key], tData, lang),
            };
        }, Promise.resolve({})) as any;
    }

    /**
     * Translates a text, returns the text itself if no translation is found.
     * @param originalText text to translate
     * @param tData Interpolation parameters
     * @param lang Translation language
     * @returns Translated text
     */
    async t(originalText: string, tData?: TypeTData, lang?: string) {
        if (originalText === '') {
            return Promise.resolve(originalText);
        }

        const selectedLanguage: string = lang || this.language.getCurrentLanguage(this.availableLangs);
        const { availableLangs, translations } = await this.tDonwloader.getTranslationsData(this.availableLangs, selectedLanguage);
        this.availableLangs = availableLangs;
        let translated: string = originalText;

        if (!translations[originalText]) {
            // Missing to server
            this.tDonwloader.handleMissing(originalText, selectedLanguage);
            if (this.opts.isShowMissing) {
                if (this.tDonwloader.isMissing(originalText)) {
                    // La cadena ya se ha creado, pero todavía no se ha traducido
                    raiseEvent(Ei18nEvents.missingTranslation, originalText);
                    console.log('Missing translation: %c%s', 'color:blue;font-weight:bold', originalText); // eslint-disable-line no-console
                    // Notify only once!
                    this.tDonwloader.hideMissing(originalText);
                } else if (window.newTranslations[originalText] !== '') {
                    window.newTranslations[originalText] = '';
                    raiseEvent(Ei18nEvents.newTranslation, originalText);
                    console.log('New string found: %c%s', 'color:blue;font-weight:bold', originalText); // eslint-disable-line no-console
                }
            }
            translated = originalText;
        } else {
            translated = translations[originalText];
        }

        return tData ? this.interpolate(translated, tData) : translated;
    }

    /**
    * *Función para uso interno*. Recorre las keys del JSON para comprobar si coinciden con el RegExp (p.ej) : `${key}`,
    * si coinciden sustituye la palabra por el valor encontrado en el JSON (p.ej) : `${nombre}` por `Toni`
    * @param text Texto a interpolar
    * @param data Json que contiene los paramatros del componente (p.ej) : `{ nombre: 'Toni', edad: 25 }`
    * @returns El texto interpolado
    */
    private interpolate(text: string, data: TypeTData) {
        // TODO: support deep nesting
        let interpolated = text;
        if (text.indexOf(this.opts.interpolateLeft) > -1) {
            Object.keys(data).forEach((tkey) => {
                const regex = new RegExp(`${this.ilEsc}\\s*${tkey}\\s*${this.irEsc}`, 'g');
                interpolated = interpolated.replace(regex, `${data[tkey]}` || '');
            });
        }
        // Replace all missing data
        interpolated = interpolated.replace(new RegExp(`${this.ilEsc}.*${this.irEsc}`, 'g'), '');
        return interpolated;
    }

    /**
     * Guess the language. First look at the `lang` cookie.
     * If it's not available, it looks for the language in these places (in this order of precedence):
     *
     * - options.userLanguage
     * - navigator.userLanguage
     * - options.defaultLanguage
     *
     * @param isSkipCookie does not read from cookie
     * @param resetCookie saves the favorite language to `lang` cookie
     * @returns 2 letters favorite language
     */
    static guessLanguage(isSkipCookie = false, resetCookie = false) {
        return Translator.getInstance().guessLanguage(isSkipCookie, resetCookie);
    }

    /**
     * Guess the language. First look at the `lang` cookie.
     * If it's not available, it looks for the language in these places (in this order of precedence):
     *
     * - options.userLanguage
     * - navigator.userLanguage
     * - options.defaultLanguage
     *
     * @param isSkipCookie does not read from cookie
     * @param resetCookie saves the favorite language to `lang` cookie
     * @returns 2 letters favorite language
     */
    guessLanguage(isSkipCookie = false, resetCookie = false) {
        return this.language.guessLanguage(isSkipCookie, resetCookie);
    }

    /**
     * Guesses the language (see `guessLanguage()`) and filters it with `availableLangs`.
     * If the language is not present in `availableLangs` the `options.defaultLanguage` will be returned.
     *
     * @returns 2 letters default language
     */
    static getDefaultLanguage() {
        return Translator.getInstance().getDefaultLanguage();
    }

    /**
     * Guesses the language (see `guessLanguage()`) and filters it with `availableLangs`.
     * If the language is not present in `availableLangs` the `options.defaultLanguage` will be returned.
     *
     * @returns 2 letters default language
     */
    getDefaultLanguage() {
        return this.language.getDefaultLanguage(this.availableLangs);
    }

    /**
     * Gets current language of the application.
     * The language will be one of the availableLangs or the defaultOne
     * @param lang new language
     * @returns current language
     */
    static getCurrentLanguage() {
        return Translator.getInstance().getCurrentLanguage();
    }

    /**
     * Gets current language of the application.
     * The language will be one of the availableLangs or the defaultOne
     * @param lang new language
     * @returns current language
     */
    getCurrentLanguage() {
        return this.language.getCurrentLanguage(this.availableLangs);
    }

    /**
     * Changes the language of the application.
     * Must be one of availableLangs otherwise the favorite language will be selected.
     * @param lang new language
     * @returns new language
     */
    static setLanguage(lang: string) {
        return Translator.getInstance().setLanguage(lang);
    }

    /**
     * Changes the language of the application.
     * Must be one of availableLangs otherwise the favorite language will be selected.
     * @param lang new language
     * @returns new language
     */
    setLanguage(lang: string) {
        return this.language.setLanguage(this.availableLangs, lang);
    }

    /**
     * Clears the translations cache and tries to download again the translations.
     */
    static cacheClear() {
        Translator.getInstance().cacheClear();
    }

    /**
     * Clears the translations cache and tries to download again the translations.
     */
    cacheClear() {
        this.tDonwloader.cacheClear();
    }

    /**
     * Get missing translations. The array gets updated when a new missing translation is found.
     * @returns an array of strings with missing translations
     */
    static getMissingTranslations() {
        return Translator.getInstance().getMissingTranslations();
    }

    /**
     * Get missing translations. The array gets updated when a new missing translation is found.
     * @returns an array of strings with missing translations
     */
    getMissingTranslations() {
        return window.newTranslations || [];
    }
}

window.addEventListener('load', () => {
    if (typeof I18nBabelWebcomponent === 'function'
        && /^\s*class\s+/.test(I18nBabelWebcomponent.toString())
        && !customElements.get('i18n-babel')
    ) {
        // Register custom component
        I18nBabelWebcomponent.options = Translator.defaultOptions;
        customElements.define('i18n-babel', I18nBabelWebcomponent);
    }
    raiseEvent(Ei18nEvents.translatorReady);
});
