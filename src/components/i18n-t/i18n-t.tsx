/* eslint-disable import/no-extraneous-dependencies */
import { Component, Host, Element, h } from '@stencil/core';

import { TManager } from '../../utils/tManager';

@Component({
    tag: 'i18n-t',
    styleUrl: 'i18n-t.css',
    shadow: true,
})
export class I18nT {
    @Element() i18nTEL: HTMLI18nTElement;

    constructor() {
        // eslint-disable-next-line
        new TManager(this.i18nTEL, this.i18nTEL.getAttribute('data-i18n'));
    }

    render() {
        return <Host><slot /></Host>;
    }
}
