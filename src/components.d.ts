/* eslint-disable */
/* tslint:disable */
export namespace Components {
    interface I18nBabel {
        /** Json string i18n data, will be used to interpolate string with `(% paramName %)` format */
        "dataI18n": string;
    }
}
declare global {
    interface HTMLI18nBabelElement extends Components.I18nBabel {
    }
    var HTMLI18nBabelElement: {
        prototype: HTMLI18nBabelElement;
        new(): HTMLI18nBabelElement;
    };
    interface HTMLElementTagNameMap {
        /** i18n-babel component, the text in innerHTML will be translated */
        "i18n-babel": HTMLI18nBabelElement;
    }
}
declare namespace LocalJSX {
    interface I18nBabel {
        /** Json string i18n data, will be used to interpolate string with `(% paramName %)` format */
        "dataI18n"?: string;
    }
    interface IntrinsicElements {
        /** i18n-babel component, the text in innerHTML will be translated */
        "i18n-babel": I18nBabel;
    }
}
export { LocalJSX as JSX };
