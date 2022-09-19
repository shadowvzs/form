import { IInputProps } from "../types/types";

export const cn = (...arg: (string | false | undefined)[]) => arg.filter(Boolean).join(' ');

const debounceMap = new Map();

export const actionDebounce = (fn: Function, timeout: number, key: string, ...rest: any[]) => {
    let timerId = debounceMap.get(key);
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
        fn(...rest);
        debounceMap.delete(key);
    }, timeout);

    debounceMap.set(key, timerId);
    return timerId;
};

export const isDateLike = (type: Required<Pick<IInputProps<unknown, any>, 'type'>>['type']) => ['week', 'date', 'dateime-local', 'month', 'time'].includes(type);
