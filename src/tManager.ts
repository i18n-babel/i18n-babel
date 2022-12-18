import { Ei18nEvents, ITranslatorOptions, TypeTData } from './types';

export class TManager {
    private options: ITranslatorOptions;
    private i18nData: string;
    private i18nElmt: Element;
    private originalText: string;
    private refreshInterval: any = -1;
    private translationResult = '';
    private refreshIntents = 0;
    private isTranslationInCourse = false;
    private tmpTranslation = document.createElement('span');
    private static t: (originalText: string, tData?: TypeTData, lang?: string) => Promise<string>;
    private static isInitialized: boolean;
    private static i18nBabelProcessedAttrName = 'data-i18n-babel';

    private constructor(i18nElmt: Element, options?: ITranslatorOptions) {
        i18nElmt.setAttribute(TManager.i18nBabelProcessedAttrName, '');
        document.addEventListener(Ei18nEvents.updateTranslations, () => this.handleTranslationsUpdate());
        this.i18nElmt = i18nElmt;
        this.options = options;
        this.i18nData = this.i18nElmt.getAttribute(this.options.dataAttribute);
        this.originalText = this.i18nElmt.innerHTML;
        this.startObserver();
        this.onTextChanged();
    }

    /** Attaches translator manager to i18nElmt */
    static attach(i18nElmt: Element, options?: ITranslatorOptions) {
        // Skip already processed elements
        if (i18nElmt.hasAttribute(TManager.i18nBabelProcessedAttrName)) {
            return;
        }
        // eslint-disable-next-line no-new
        new TManager(i18nElmt, options);
    }

    static init(t: (originalText: string, tData?: TypeTData, lang?: string) => Promise<string>) {
        // To avoid dependency cycle
        TManager.t = t;
        TManager.isInitialized = true;
    }

    startObserver() {
        // Detects if there has been a change on element which should affect to translation
        const observer = new MutationObserver(m => this.onMutation(m));
        // Start watching changes on this element
        observer.observe(this.i18nElmt, {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: true,
            characterDataOldValue: true,
        });
    }

    onMutation(mutations: MutationRecord[]) {
        const isTranslationNeeded = mutations.reduce((isNeeded, m) => {
            if (m.type === 'attributes' && m.attributeName === this.options.dataAttribute) {
                // Update i18nData if it has changed and translate again
                this.i18nData = this.i18nElmt.getAttribute(this.options.dataAttribute);
                return true;
            }
            // Prevents MutationObserver infinite loop: when `innerHTML` will be translated,
            // the translated text will be put in `innerHTML` and new mutation change will be triggered
            if (m.type === 'childList' && this.translationResult !== this.i18nElmt.innerHTML) {
                // The text to be translated has been changed, so update originalText and reefreshTranslation
                this.originalText = this.i18nElmt.innerHTML;
                return true;
            }
            if (m.type === 'characterData' && this.translationResult !== this.i18nElmt.innerHTML) {
                return true;
            }
            return isNeeded;
        }, false);

        if (isTranslationNeeded) {
            this.onTextChanged();
        }
    }

    onTextChanged() {
        this.refreshTranslation();
    }

    refreshTranslation() {
        if (this.refreshInterval !== -1) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = -1;
            this.refreshIntents = 0;
        }

        this.backgroundRefresh();
    }

    async backgroundRefresh() {
        // Wait for TManager to be initialized and to finish all previous translations
        if (TManager.isInitialized && !this.isTranslationInCourse) {
            this.isTranslationInCourse = true;
            clearInterval(this.refreshInterval);
            this.refreshInterval = -1;
            this.refreshIntents = 0;
            let i18nData = {};
            try {
                i18nData = JSON.parse(this.i18nData || '{}');
            } catch { } // eslint-disable-line no-empty

            let translation = this.originalText;
            try {
                translation = await TManager.t(this.originalText, i18nData);
            } catch { } // eslint-disable-line no-empty
            // Prevents MutationObserver infinite loop
            this.translationResult = translation;
            this.updateTranslation(this.tmpTranslation, this.i18nElmt);

            this.isTranslationInCourse = false;
        } else {
            this.refreshIntents += 1;
            this.refreshInterval = setTimeout(() => this.backgroundRefresh(), 10 * this.refreshIntents * this.refreshIntents);
        }
    }

    updateTranslation(tmpTranslation: HTMLSpanElement, translationElement: Element) {
        if (tmpTranslation.innerHTML !== translationElement.innerHTML) {
            // La traducció ha canviat
            translationElement.childNodes.forEach((n, key) => {
                if (tmpTranslation.childNodes.length > key) {
                    // Encara tenim nodes al tmpSpan
                    const translatedNode = tmpTranslation.childNodes.item(key);
                    if (n.nodeName === translatedNode.nodeName && n.textContent !== translatedNode.textContent) {
                        // Només ha canviat el text
                        // eslint-disable-next-line no-param-reassign
                        translationElement.childNodes.item(key).textContent = translatedNode.textContent;
                    } else if (n.nodeName !== translatedNode.nodeName) {
                        // El node ha canviat
                        translationElement.replaceChild(translatedNode.cloneNode(true), n);
                    }
                } else {
                    // S'ha eliminat aquest node
                    translationElement.removeChild(n);
                } // else: el node no ha canviat
            });

            // Afegir els nodes que queden pendents
            if (tmpTranslation.childNodes.length > translationElement.childNodes.length) {
                for (let i = translationElement.childNodes.length; i < tmpTranslation.childNodes.length; i += 1) {
                    translationElement.appendChild(tmpTranslation.childNodes.item(i).cloneNode(true));
                }
            }
        } // else: res a actualitzar
    }

    async handleTranslationsUpdate() {
        this.refreshTranslation();
    }
}
