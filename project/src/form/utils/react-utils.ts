// external libs
import React from 'react';
// form related imports
import FormStore from '../store/FormStore';
import type { IFormProps } from '../types/types';
import { validator } from './decorators';
import { getFormValues } from './form-utilities';

type ResultBox<T> = { v: T }

export function useConstant<T>(fn: () => T): T {
    const ref = React.useRef<ResultBox<T>>();
    if (!ref.current) {
        ref.current = { v: fn() };
    }

    return ref.current.v;
}

export function useForm<T extends object>({ store: externalStore, ...props }: IFormProps<T>): FormStore<T> {
    const ref = React.useRef<{ v: FormStore<T> }>();
    if (!ref.current) { ref.current = { v: externalStore || new FormStore<T>(props) }; }
    if (externalStore) { externalStore.updateProps(props); }

    return ref.current.v;
}

interface IUseFormValidatorConfig<T extends object> {
    initValues?: Partial<T>;
    validator: Record<keyof T, <V = any>(value: V, values: T) => false | string>;
    onSubmit: (values: T) => void;
}

// export function useFormValidator<T extends object>(config: IUseFormValidatorConfig<T>) {
//     const ref = React.useRef<ResultBox<{ v: (ev: React.FormEvent<HTMLFormElement>) => boolean }>>();
//     if (!ref.current) {
//         ref.current = {
//             v: (ev: React.FormEvent<HTMLFormElement>) => {
//                 const values = getFormValues<T>(ev.currentTarget || ev.target)
//                 if (config.validator(values) === ) {
//                     return
//                 }
//                 return false;
//             }
//         };
//     }

//     return ref.current!.v;

// }
