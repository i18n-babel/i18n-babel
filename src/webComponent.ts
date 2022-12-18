import { TManager } from './tManager';
import { ITranslatorOptions } from './types';

export class I18nBabelWebcomponent extends HTMLElement {
    static options: ITranslatorOptions;
    private isAttached = false;

    connectedCallback() {
        if (!this.isAttached) {
            this.isAttached = true;
            TManager.attach(this, I18nBabelWebcomponent.options);
        }
    }
}
