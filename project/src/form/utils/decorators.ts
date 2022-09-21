import type { ICommonInputProps, IFieldProps, IFormProps, IInputProps, IValidator, IValue } from "../types/types";
import validatorMap from "../validators/validatorMap";
import { IRules } from "../validators/RegExp";

export const FormDataKey = Symbol('form');
export const InputDataKey = Symbol('input');

export const getFormSettings = <T extends object>(target: T): Partial<IFormProps<T>> => {
    if (!Reflect.has(target, FormDataKey)) {
        Reflect.set(target, FormDataKey, {});
    }
    return Reflect.get(target, FormDataKey) as Partial<IFormProps<T>>;
};

export const getFieldsSettings = <V, T extends object>(target: T): Record<keyof T, IFieldProps<V, T>> => {
    if (!Reflect.has(target, InputDataKey)) {
        Reflect.set(target, InputDataKey, {});
    }

    return Reflect.get(target, InputDataKey) as Record<keyof T, IFieldProps<V, T>>;
};

export const getFieldSettings = <V, T extends object>(target: T, propertyKey: keyof T): IFieldProps<V, T> => {
    const fields = getFieldsSettings<V, T>(target);
    if (!fields[propertyKey]) { fields[propertyKey] = {} as unknown as IFieldProps<V, T>; }
    return fields[propertyKey];
};

const addValidator = <V, T extends object>(target: T, propertyKey: keyof T, validator: IValidator<V, T>) => {
    const field = getFieldSettings<V, T>(target, propertyKey);
    if (!field.validators) { field.validators = [] as IFieldProps<V, T>['validators']; }
    field.validators!.push(validator);
};

export function Form<T extends object>(props: Partial<IFormProps<T>>) {
    return function (constructor: Function) {
        constructor.prototype[FormDataKey] = props;
    };
}

// ------ Validators - START ------- 
export function validator<V, T extends object = any>(validatorFn: IValidator<V, T>) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorFn);
    };
}

export function required<T extends object = any>(target: T, propertyKey: keyof T) {
    addValidator<unknown, T>(target, propertyKey, validatorMap.required())
}

export function isNumber<T extends object = any>(target: T, propertyKey: keyof T) {
    addValidator<IValue, T>(target, propertyKey, validatorMap.isNumber())
}

export function minLength(minLength: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, validatorMap.minLength(minLength))
    };
}

export function maxLength(maxLength: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, validatorMap.maxLength(maxLength))
    };
}

export function min(min: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<number, T>(target, propertyKey, validatorMap.min(min))
    };
}

export function max(max: number) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<number, T>(target, propertyKey, validatorMap.max(max))
    };
}

export function isChecked(errorMsg?: string) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<boolean, T>(target, propertyKey, validatorMap.isChecked(errorMsg))
    };
}

export function rule(rule: keyof IRules) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        addValidator<string, T>(target, propertyKey, validatorMap.rule(rule))
    };
}

export function minSize<V = File, T extends object = any>(size: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.minSize<V>(size));
    };
}

export function maxSize<V = File, T extends object = any>(size: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.maxSize<V>(size));
    };
}

export function minTotalSize<V = File, T extends object = any>(size: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.minTotalSize<V>(size));
    };
}

export function maxTotalSize<V = File, T extends object = any>(size: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.maxTotalSize<V>(size));
    };
}

export function minCount<V = unknown[], T extends object = any>(count: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.minCount<V>(count));
    };
}

export function maxCount<V = unknown[], T extends object = any>(count: number) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.maxCount<V>(count));
    };
}

export function allowedType<V = File, T extends object = any>(typeOrExtension: string) {
    return function (target: T, propertyKey: keyof T) {
        addValidator<V, T>(target, propertyKey, validatorMap.allowedType<V>(typeOrExtension));
    };
}
// ------ Validators - END ------- 

// ------ Prop helpers - START ------- 
export function type(type: IFieldProps<unknown, object>['type']) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        const field = getFieldSettings<unknown, T>(target, propertyKey);
        field.type = type;
    };
}

export function label<T extends object = any, V = unknown>(label: IFieldProps<V, object>['label']) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<V, T>(target, propertyKey);
        Object.assign(field, { label });
    };
}

export function fileCmp<T extends object = any, V = unknown>(FileCmp: IInputProps<V, object>['FileCmp']) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<V, T>(target, propertyKey);
        Object.assign(field, { FileCmp });
    };
}

export function accept<T extends object = any, V = unknown>(acceptedMimetypes: string) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<V, T>(target, propertyKey);
        Object.assign(field, { accept: acceptedMimetypes });
    };
}

export function multiple<T extends object = any, V = unknown>(target: T, propertyKey: keyof T) {
    const field = getFieldSettings<V, T>(target, propertyKey);
    Object.assign(field, { multiple: true });
}

export function valueParser(parser: IInputProps<unknown, object>['valueParser']) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        const field = getFieldSettings<string, T>(target, propertyKey);
        Object.assign(field, { valueParser: parser });
    };
}

export function props<T extends object = any, V = unknown>(props: Partial<IFieldProps<V, object>>) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<V, T>(target, propertyKey);
        Object.assign(field, props);
    };
}

export function options(options: () => [string, string][]) {
    return function <T extends object = any>(target: T, propertyKey: keyof T) {
        const field = getFieldSettings<string, T>(target, propertyKey);
        field.options = options().map(([value, label]) => ({ value, label }));
    };
}

export function cmp<T extends object = any>(Cmp: Required<Pick<ICommonInputProps<unknown, T>, 'Cmp'>>['Cmp']) {
    return function (target: T, propertyKey: keyof T) {
        const field = getFieldSettings<any, T>(target, propertyKey);
        field.Cmp = Cmp;
    };
}
// ------ Prop helpers - END ------- 
