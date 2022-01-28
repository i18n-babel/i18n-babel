import { Ei18nEvents, TypeTData } from './types';

export class TManager {
    private i18nData: string;
    private i18nElmt: Element;
    private originalText: string;
    private refreshInterval: any = -1;
    private translationResult = '';
    private refreshIntents = 0;
    private isTranslationInCourse = false;
    private static t: (originalText: string, tData?: TypeTData, lang?: string) => Promise<string>;
    private static isInitialized: boolean;
    private static i18nBabelProcessedAttrName = 'data-i18n-babel';

    private constructor(i18nElmt: Element, i18nData?: string) {
        i18nElmt.setAttribute(TManager.i18nBabelProcessedAttrName, '');
        document.addEventListener(Ei18nEvents.updateTranslations, () => this.handleTranslationsUpdate());
        this.i18nElmt = i18nElmt;
        this.i18nData = i18nData;
        this.originalText = this.i18nElmt.innerHTML;
        this.startObserver();
        this.onTextChanged();
    }

    /** Attaches translator manager to i18nElmt */
    static attach(i18nElmt: Element, i18nData?: string) {
        // Skip already processed elements
        if (i18nElmt.hasAttribute(TManager.i18nBabelProcessedAttrName)) {
            return;
        }
        // eslint-disable-next-line no-new
        new TManager(i18nElmt, i18nData);
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
        });
    }

    onMutation(mutations: MutationRecord[]) {
        const isTranslationNeeded = mutations.reduce((isNeeded, m) => {
            if (m.type === 'attributes' && m.attributeName === 'data-i18n') {
                this.i18nData = this.i18nElmt.getAttribute('data-i18n');
                return true;
            }
            // Prevents MutationObserver infinite loop
            if (m.type === 'childList' && this.translationResult !== this.i18nElmt.innerHTML) {
                this.originalText = this.i18nElmt.innerHTML;
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
            // Won't raise render, but MutationObserver will catch it
            this.i18nElmt.innerHTML = translation;
            this.isTranslationInCourse = false;
        } else {
            this.refreshIntents += 1;
            this.refreshInterval = setTimeout(() => this.backgroundRefresh(), 10 * this.refreshIntents * this.refreshIntents);
        }
    }

    async handleTranslationsUpdate() {
        this.refreshTranslation();
    }
}
