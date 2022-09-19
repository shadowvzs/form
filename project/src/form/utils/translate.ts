import translationMap from '../translation/index';
import { ITranslateFn } from '../types/types';

const translate: ITranslateFn = (str: string, params?: (string | number)[], options?: Record<string, any>) => {
    const userLanguage = 'en-US';
    let translation = translationMap[userLanguage][str];
    if (!translation) { return str; }

    if (params && params.length) {
        params.forEach((param, idx) => {
            translation = translation.replace('%' + idx, String(param));
        });
    }
    return translation;
}

export default translate;
