import { sizeFormatter } from '../utils/size-formatter';
import { IRules, validate } from './RegExp';
import type { IErrorMsg, IValue, IValueOrGetter } from '../types/types';

const validatorMap = {
    minSize: <V>(size: number, errorMsg: string = 'TOO_SMALL_FILE') => (value: V) => {
        const msg = [errorMsg, [sizeFormatter(size)]] as IErrorMsg;
        if (value instanceof File) {
            return value.size < size && msg;
        } else if (value && Array.isArray(value)) {
            return value.some(x => x.size < size) && msg;
        }
        return false;
    },
    maxSize: <V>(size: number, errorMsg: string = 'TOO_BIG_FILE') => (value: V) => {
        const msg = [errorMsg, [sizeFormatter(size)]] as IErrorMsg;
        if (value instanceof File) {
            return value.size > size && msg;
        } else if (value && Array.isArray(value)) {
            return value.some(x => x.size > size) && msg;
        }
        return false;
    },
    minTotalSize: <V>(size: number, errorMsg: string = 'TOO_SMALL_FILE') => (value: V) => {
        const msg = [errorMsg, [sizeFormatter(size)]] as IErrorMsg;
        if (value && Array.isArray(value)) {
            return value.reduce((t, x) => t + x.size, 0) < size && msg;
        }
        return false;
    },
    maxTotalSize: <V>(size: number, errorMsg: string = 'TOO_BIG_FILE') => (value: V) => {
        const msg = [errorMsg, [sizeFormatter(size)]] as IErrorMsg;
        if (value && Array.isArray(value)) {
            return value.reduce((t, x) => t + x.size, 0) > size && msg;
        }
        return false;
    },
    minCount: <V>(count: number, errorMsg: string = 'TOO_LESS') => (value: V) => {
        return value && Array.isArray(value) && value.length < count && [errorMsg, [count]] as IErrorMsg;
    },
    maxCount: <V>(count: number, errorMsg: string = 'TOO_MUCH') => (value: V) => {
        return value && Array.isArray(value) && value.length > count && [errorMsg, [count]] as IErrorMsg;
    },
    allowedType: <V>(typeOrExtension: string, errorMsg: string = 'INVALID_FILE') => (value: V) => {
        const regExp = new RegExp(`\\b${typeOrExtension}\\b`, 'gi');
        const msg = [errorMsg, [typeOrExtension]] as IErrorMsg;
        if (value instanceof File) {
            return !value.type.match(regExp) && msg;
        } else if (value && Array.isArray(value)) {
            return value.some(x => !x.type.match(regExp)) && msg;
        }
        return false;
    },
    minLength: <V>(minLength: number, errorMsg: string = 'TOO_SHORT') => (value: V) => {
        return typeof value === 'string' && value.length < minLength && [errorMsg, [minLength]] as IErrorMsg;
    },
    maxLength: <V>(maxLength: number, errorMsg: string = 'TOO_LONG') => (value: V) => {
        return typeof value === 'string' && value.length > maxLength && [errorMsg, [maxLength]] as IErrorMsg;
    },
    min: <V>(min: number, errorMsg: string = 'TOO_LOW') => (value: V) => {
        return typeof value === 'number' && value < min && [errorMsg, [min]] as IErrorMsg;
    },
    max: <V>(max: number, errorMsg: string = 'TOO_HIGH') => (value: V) => {
        return typeof value === 'number' && value > max && [errorMsg, [max]] as IErrorMsg;
    },
    isNumber: <V>(errorMsg: string = 'NOT_A_NUMBER') => (value: IValue) => !isNaN(Number(value)) && [errorMsg] as IErrorMsg,
    rule: <V>(rule: keyof IRules, errorMsg: string = 'INVALID_FORMAT') => (value: V) => typeof value === 'string' && !validate(value, rule) && [errorMsg, [rule]] as IErrorMsg,
    isChecked: <V>(errorMsg: string = 'MUST_BE_CHECKED') => (value: boolean) => !value && [errorMsg] as IErrorMsg,
    required: <V>(errorMsg: string = 'IS_REQUIRED') => (value: unknown) => {
        return (
            !value ||
            (typeof value === 'string' && !value.trim()) ||
            (Array.isArray(value) && !value.length)
        ) && [errorMsg] as IErrorMsg;
    },
    isSame: <T extends object>(valueOrGetter: IValueOrGetter<T>, errorMsg: string = 'NOT_SAME') => (value: IValue, obj: T) => {
        const myValue = typeof valueOrGetter === 'string' ? (Reflect.has(obj, valueOrGetter) ? Reflect.get(obj, valueOrGetter) : valueOrGetter) : valueOrGetter();
        return myValue !== value && [errorMsg, [myValue, value]] as IErrorMsg;
    },
};

export default validatorMap;