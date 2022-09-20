import type { ICommonInputProps, IFieldProps, IFormProps, IValidator, IValue } from "../types/types";
import { IRules, validate } from "./RegExp";

export const FormDataKey = Symbol('form');
export const InputDataKey = Symbol('input');

export const getFormSettings = <T extends object>(target: T): Partial<IFormProps<T>> => {
    if (!Reflect.has(target, FormDataKey)) {
        Reflect.set(target, FormDataKey, {});
    }
    return Reflect.get(target, FormDataKey) as Partial<IFormProps<T>>;
}

export const getFieldsSettings = <V, T extends object>(target: T): Record<keyof T, IFieldProps<V, T>> => {
    if (!Reflect.has(target, InputDataKey)) {
        Reflect.set(target, InputDataKey, {});
    }

    return Reflect.get(target, InputDataKey) as Record<keyof T, IFieldProps<V, T>>;
}

export const getFieldSettings = <V, T extends object>(target: T, propertyKey: keyof T): IFieldProps<V, T> => {
    const fields = getFieldsSettings<V, T>(target);
    if (!fields[propertyKey]) { fields[propertyKey] = {} as unknown as IFieldProps<V, T>; }
    return fields[propertyKey];
}

const addValidator = <V, T extends object>(target: T, propertyKey: keyof T, validator: IValidator<V, T>) => {
    const field = getFieldSettings<V, T>(target, propertyKey);
    if (!field.validators) { field.validators = [] as IFieldProps<V, T>['validators']; }
    field.validators!.push(validator);
}

export function Form<T extends object>(props: Partial<IFormProps<T>>) {
    return function (constructor: Function) {
        constructor.prototype[FormDataKey] = props;
    }
}

export function required<T extends object = any>(target: T, propertyKey: keyof T) {
    addValidator<unknown, T>(target, propertyKey, (value: unknown) => !value && ['IS_REQUIRED'])
}

export function isNumber<T extends object = any>(target: T, propertyKey: keyof T) {
    addValidator<IValue, T>(target, propertyKey, (value: IValue) => !isNaN(Number(value)) && ['NOT_A_NUMBER'])
}

export function minLength(minLength: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, (value: string) => value.length < minLength && ['TOO_SHORT', [minLength]])
    }
}

export function maxLength(maxLength: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, (value: string) => (value as string).length > maxLength && ['TOO_LONG', [maxLength]])
    }
}

export function min(min: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<number, T>(target, propertyKey, (value: number) => value < min && ['TOO_SHORT', [min]])
    }
}

export function max(max: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<number, T>(target, propertyKey, (value: number) => value > max && ['TOO_LONG', [max]])
    }
}

export function rule(rule: keyof IRules) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, (value: string) => !validate(value, rule) && ['INVALID_FORMAT', [rule]])
    }
}

export function type(type: IFieldProps<unknown, object>['type']) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        const field = getFieldSettings<unknown, T>(target, propertyKey);
        field.type = type;
    }
}

export function props<T extends object = any, V = unknown>(props: Partial<IFieldProps<V, object>>) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<V, T>(target, propertyKey);
        Object.assign(field, props);
    }
}

export function options(options: () => [string, string][]) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        const field = getFieldSettings<string, T>(target, propertyKey);
        field.options = options().map(([value, label]) => ({ value, label }));
    }
}

export function cmp<T extends object = any>(Cmp: Required<Pick<ICommonInputProps<unknown, T>, 'Cmp'>>['Cmp']) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<any, T>(target, propertyKey);
        field.Cmp = Cmp;
    }
}

export function validator<V, T extends object = any>(validatorFn: IValidator<V, T>) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorFn);
    }
}
