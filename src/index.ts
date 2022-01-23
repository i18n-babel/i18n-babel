import { Translator } from './utils/translator';

export { Components, JSX } from './components';
export { Translator } from './utils/translator';
export { ITranslatorOptions as II18nOptions } from './utils/utils';

declare global {
    interface Window {
        Translator: typeof Translator;
    }
}

window.Translator = Translator;
