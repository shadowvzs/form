import { ObservableMap, ObservableSet } from "mobx";
import { InputHTMLAttributes } from "react";
import ErrorStore from "../store/ErrorStore";
import type FormStore from "../store/FormStore";
import type { IRules } from "../validators/RegExp";

export type IValue = any;

export type IErrorParams = (string | number)[];
export type IErrorText = string;
export type IErrorMsg = [IErrorText, IErrorParams?];

export type Constructor<T> = new (...args: any) => T;

export interface IConfig<T extends object> extends Partial<IFormProps<T>> {
    fields?: Partial<Record<keyof T, Partial<IFieldProps<unknown, T>>>>;
}

export type IValueOrGetter<T> = IValue | ((obj: T) => IValue);

export interface IFormStore<T extends object> {
    id: string;
    isDirty: boolean;
    errorStore: ErrorStore<T>;
    errorsValues: string[];
    values: T;
    initValues: T;
    updateProps: (_props: IFormProps<T>) => this;
    updateInputElements: () => void;
    validate: (values: T) => void;
    addField: <P>(inputProps: IFieldProps<P, T>) => IFieldStore<P, T>;
    addFieldIfNotExist: <P>(inputProps: IFieldProps<P, T>) => IFieldStore<P, T>;
    onReset: () => void;
    getProps: () => React.FormHTMLAttributes<HTMLFormElement>;
    onChangeHandler: (ev: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) => void;
    getInputProps: (name: keyof T, options?: { type?: 'checkbox' | 'file' }) => Record<string, any>;
    onSubmit: (ev?: React.FormEvent<HTMLFormElement>, skipValidation?: boolean) => void | boolean;
}

// export interface IFieldConfig<T extends object, P> {
//     id: string;
//     errors: IErrorMsg[];
//     translatedErrors: string[];
//     initialValue: IValue;
//     value: IValue;
// }

// export interface IFieldProps1<T extends object, P> {
//     id: string;
//     errors: IErrorMsg[];
//     translatedErrors: string[];
//     initialValue: IValue;
//     value: IValue;

//     // name: string;

//     // errors: IErrorMsg[];
//     // translatedErrors: string[];
//     // setErrors: (errors: IErrorMsg[]) => void;

//     // initialValue: IValue;
//     // value: IValue;
//     // setValue: (value: boolean) => void;

//     // isDirty: boolean;
//     // setIsDirty: (isDirty: boolean) => void;

//     // isTouched: boolean;
//     // setIsTouched: (isTouched: boolean) => void;

//     // onReset: () => void;
//     // getParsedValue: () => IValue;

//     // getProps: (blacklistedProps?: string[]) => IFieldProps<P, T>;
//     // validate: (value?: IValue) => boolean;

//     // setTypeBasedValue: (node: HTMLInputElement | HTMLSelectElement) => void;
// }
export interface IFormState<T extends object> {
    isDirty: ObservableSet<string>;
    isTouched: ObservableSet<string>;
    values: ObservableMap<keyof T, IValue>;
    parsedValues: IValue;
    htmlElements: Map<keyof T, HTMLInputElement | HTMLSelectElement>;
    defaultProps: Map<keyof T, Partial<IFieldProps<IValue, T, any>>>;
    errors: IErrorMsg[];
}

export type IFieldData<T extends object, V = IValue, H = HTMLInputElement> = {
    props: React.InputHTMLAttributes<H>;
    value: IValue;
    isTouched: boolean;
    isDirty: boolean;
    fieldStore: IFieldStore<V, T>;
} & Pick<IFieldProps<V, T>, 'Cmp' | 'options' | 'label' | 'labelStyle' | 'fieldStyle' | 'fieldClassName' | 'labelClassName' | 'showErrors' | 'errorRender'> & Pick<IInputProps<V, T>, 'list' | 'FileCmp'>;

export interface IFieldStore<P, T extends object, H = HTMLInputElement> {
    id: string;
    name: string;
    element: HTMLInputElement | HTMLSelectElement | null;

    errors: IErrorMsg[];
    translatedErrors: string[];
    setErrors: (errors: IErrorMsg[]) => void;

    initialValue: IValue;
    value: IValue;
    setValue: (value: boolean) => void;

    isDirty: boolean;
    setIsDirty: (isDirty: boolean) => void;

    isTouched: boolean;
    setIsTouched: (isTouched: boolean) => void;

    onReset: () => void;
    getParsedValue: () => IValue;

    getData: () => IFieldData<T, P, H>;
    validate: (value?: IValue) => boolean;

    setTypeBasedValue: (node: HTMLInputElement | HTMLSelectElement) => void;
}

export type IFormProps<T extends object> = Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit'> & {
    autoDisable?: boolean; // enable or disable the inputs with type 'submit' and 'reset'
    autoGenerate?: boolean; // if it is enabled then auto generate the input children for the form
    store?: FormStore<T>; // if we want provide an external formStore
    entity?: T;
    config?: IConfig<T>;
    showErrors?: boolean; // show form errors
    uncontrolled?: boolean; // inputs are uncontrolled or not

    debounceTime?: number; // if this is setted then submit method called with debounce

    errorRender?: (errors: string[], values?: T) => JSX.Element; // custom form error renderer
    onSubmit: (data: T) => Promise<boolean | void>; // submit method
    validator?: (values: T) => false | IErrorMsg; // for validator, can prevent the submitting if it return an error message
}

export type ITranslateFn = (str: string, params?: (string | number)[], options?: Record<string, any>) => string;
export type ICustomFormFieldProps<V, T extends object, H = HTMLInputElement> = { fieldStore: IFieldStore<V, T, H> };

export interface ICommonInputProps<V, T extends object, H = HTMLInputElement> {
    name: keyof T;

    value?: IValue;
    defaultValue?: IValue;
    disabled?: boolean;
    label?: string | JSX.Element;
    valueParser?: (value: IValue) => IValue;

    labelStyle?: React.CSSProperties;
    fieldStyle?: React.CSSProperties;
    fieldClassName?: string;
    labelClassName?: string;
    showErrors?: boolean;

    validators?: IValidator<V, T>[];
    translateFn?: ITranslateFn;
    Cmp?: ({ fieldStore }: ICustomFormFieldProps<V, T, H>) => JSX.Element | null;
    errorRender?: (errors: string[]) => JSX.Element; // custom form error renderer
}

export type IInputProps<V, T extends object, H = HTMLInputElement> = Omit<InputHTMLAttributes<H>, 'type' | 'value'> & ICommonInputProps<V, T, H> & {
    type?: 'number' | 'text' | 'reset' | 'submit' | 'checkbox' | 'radio' | 'password' | 'email' |
    'date' | 'datetime-local' | 'time' | 'week' | 'month' | 'color' | 'file' | 'range';

    accept?: string;
    multiple?: boolean;
    checked?: boolean;
    FileCmp?: (props: { onClick: () => void, value?: V, fieldStore: IFieldStore<V, T> }) => JSX.Element;

    rule?: keyof IRules;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number | string;
    max?: number | string;

    step?: number;
    list?: string;
    options?: { label: string, value: string }[]; /* for radio */
}

export type ISelectProps<V, T extends object, H = HTMLSelectElement> = React.InputHTMLAttributes<HTMLSelectElement> & ICommonInputProps<V, T, H> & {
    type?: 'number' | 'text';
    options: { label: string, value: string }[];
}

export type ICustomProps<V, T extends object, H = HTMLInputElement> = Partial<IInputProps<V, T, H> & ISelectProps<V, T, H>> & { Cmp: Pick<ICommonInputProps<V, T, H>, 'Cmp'>, name: keyof T };

export type IFieldProps<P, T extends object, H = HTMLInputElement> = IInputProps<P, T, H> | ISelectProps<P, T, H> | ICustomProps<P, T, H>;
// export type IFieldProps<P, T extends object> = IInputProps<P, T> | ISelectProps<P, T> | ICustomProps<P, T>;

export interface IFormFieldOptions<T extends object> {
    errorStore: ErrorStore<T>;
    props: IFormProps<T>;
    setValue?: (value: IValue) => void;
    getValues: () => T;
    isDirty: () => boolean;
}

export type IValidator<V, T extends object> = (value: V, obj: T) => false | IErrorMsg;