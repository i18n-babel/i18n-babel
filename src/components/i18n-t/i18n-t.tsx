import { Component, Host, Prop, Element, h, Listen } from '@stencil/core';

import { Translator } from '../../utils/translator';

@Component({
    tag: 'i18n-t',
    styleUrl: 'i18n-t.css',
    shadow: true,
})

export class I18nT {

    @Prop() tData: string;
    @Element() i18nTEL: HTMLI18nTElement;
    private originalText: string;
    private translator = Translator.getInstance();

    constructor() {
        this.originalText = this.i18nTEL.innerHTML;
        this.getTranslation();
    }

    async getTranslation() {
        let tData = {};
        try {
            tData = JSON.parse(this.tData || '{}');
        } catch (e) {}
        this.i18nTEL.innerHTML = await this.translator.t(this.originalText, tData);
    }

    /**
     *
     */
    @Listen('i18n-update-translations', { target: 'document' })
    async handleTranslationsUpdate() {
        this.getTranslation();
    }

    /**
     *
     * @param data
     */
    @Listen('i18n-language-change', { target: 'document' })
    async handleLanguageChange(data) {
        this.translator.changeLanguage(data.detail);
    }

    render() {
        return <Host><slot></slot></Host>;
    }

}
