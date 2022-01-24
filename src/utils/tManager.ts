import { Translator } from '..';
import { Ei18nEvents } from './utils';

export class TManager {
    private i18nData: string;
    private i18nTEL: Element;
    private originalText: string;
    private refreshInterval: any = -1;
    private translationResult = '';
    private refreshIntents = 0;

    constructor(i18nTEL: Element, i18nData?: string) {
        document.addEventListener(Ei18nEvents.updateTranslations, () => this.handleTranslationsUpdate());
        this.i18nTEL = i18nTEL;
        this.i18nData = i18nData;
        this.originalText = this.i18nTEL.innerHTML;
        this.startObserver();
        this.onTextChanged();
    }

    startObserver() {
        // Detects if there has been a change on element which should affect to translation
        const observer = new MutationObserver(m => this.onMutation(m));
        // Start watching changes on this element
        observer.observe(this.i18nTEL, {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: true,
        });
    }

    onMutation(mutations: MutationRecord[]) {
        const isTranslationNeeded = mutations.reduce((isNeeded, m) => {
            if (m.type === 'attributes' && m.attributeName === 'data-i18n') {
                this.i18nData = this.i18nTEL.getAttribute('data-i18n');
                return true;
            }
            // Prevents MutationObserver infinite loop
            if (m.type === 'childList' && this.translationResult !== this.i18nTEL.innerHTML) {
                this.originalText = this.i18nTEL.innerHTML;
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
        if (Translator.isInitialized()) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = -1;
            this.refreshIntents = 0;
            let i18nData = {};
            try {
                i18nData = JSON.parse(this.i18nData || '{}');
            } catch { } // eslint-disable-line no-empty
            const translation = await Translator.t(this.originalText, i18nData);
            // Prevents MutationObserver infinite loop
            this.translationResult = translation;
            // Won't raise render, but MutationObserver will catch it
            this.i18nTEL.innerHTML = translation;
        } else {
            this.refreshIntents += 1;
            this.refreshInterval = setTimeout(() => this.backgroundRefresh(), 10 * this.refreshIntents * this.refreshIntents);
        }
    }

    async handleTranslationsUpdate() {
        this.refreshTranslation();
    }
}
