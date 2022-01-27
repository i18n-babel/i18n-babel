// eslint-disable-next-line import/no-cycle
import { TManager } from './tManager';

export class I18nBabelWebcomponent extends HTMLElement {
    static dataAttribute: string;

    constructor() {
        super();
        TManager.attach(this, this.getAttribute(I18nBabelWebcomponent.dataAttribute));
    }
}
