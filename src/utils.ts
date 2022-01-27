import { Ei18nEvents, TypeTData } from './types';

export type TypeTranslationsData = {
    availableLangs: string[];
    translations: TypeTData;
};

export function raiseEvent(eventName: Ei18nEvents, detail = undefined) {
    document.dispatchEvent(detail ? new CustomEvent(eventName, { detail }) : new CustomEvent<void>(eventName));
}
