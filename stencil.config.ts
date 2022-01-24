import { Config } from '@stencil/core';

export const config: Config = {
    buildEs5: 'prod',
    extras: {
        cssVarsShim: true,
        dynamicImportShim: true,
        shadowDomShim: true,
        safari10: true,
        scriptDataOpts: true,
        appendChildSlotFix: false,
        cloneNodeFix: false,
        slotChildNodesFix: true,
    },
    namespace: 'data-i18n',
    outputTargets: [
        {
            type: 'dist',
            esmLoaderPath: '../loader',
        },
        {
            type: 'dist-custom-elements',
        },
        {
            type: 'docs-readme',
        },
        {
            type: 'www',
            serviceWorker: null, // disable service workers
        },
    ],
};
