import { TManager } from './tManager';

export class I18nBabelWebcomponent extends HTMLElement {
    static dataAttribute: string;
    private isAttached = false;

    connectedCallback() {
        if (!this.isAttached) {
            this.isAttached = true;
            TManager.attach(this, this.getAttribute(I18nBabelWebcomponent.dataAttribute));
        }
    }
}
