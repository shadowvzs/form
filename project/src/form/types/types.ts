import ErrorStore from "../store/ErrorStore";
import type FormContextStore from "../store/FormStore";
import type { IRules } from "../utils/RegExp";

export type IValue = any;

export type IErrorParams = (string | number)[];
export type IErrorText = string;
export type IErrorMsg = [IErrorText, IErrorParams?];

export type Constructor<T> = new (...args: any) => T;
export interface IConfig<T extends object> {
    form?: IFormProps<T>;
    fields?: Record<keyof T, IFieldProps<unknown, T>>
}

export interface IFieldStore<P, T extends object> {
    id: string;
    name: string;

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

    getProps: () => IFieldProps<P, T>;
    validate: (value?: IValue) => boolean;

    setTypeBasedValue: (node: HTMLInputElement | HTMLSelectElement) => void;
}

export type IFormProps<T extends object> = Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit'> & {
    autoDisable?: boolean; // enable or disable the inputs with type 'submit' and 'reset'
    autoGenerate?: boolean; // if it is enabled then auto generate the input children for the form
    store?: FormContextStore<T>; // if we want provide an external formContextStore
    entity?: T;
    showErrors?: boolean; // show form errors

    debounceTime?: number; // if this is setted then submit method called with debounce

    errorRender?: (errors: string[], values?: T) => JSX.Element; // custom form error renderer
    onSubmit: (data: T) => Promise<boolean | void>; // submit method
    validator?: (values: T) => IErrorMsg; // for validator, can prevent the submitting if it return an error message
}

export type ITranslateFn = (str: string, params?: (string | number)[], options?: Record<string, any>) => string;
export type ICustomFormFieldProps<V, T extends object> = { fieldStore: IFieldStore<V, T> };

export interface ICommonInputProps<V, T extends object> {
    name: keyof T;

    value?: IValue;
    defaultValue?: IValue;
    disabled?: boolean;
    label?: string | JSX.Element;
    cast?: 'number' | 'string' | 'boolean' | 'file';
    valueParser?: (value: IValue) => IValue;

    labelStyle?: React.CSSProperties;
    fieldStyle?: React.CSSProperties;
    fieldClassName?: string;
    labelClassName?: string;
    showErrors?: boolean;

    entity?: T;
    validators?: IValidator<V, T>[];
    translateFn?: ITranslateFn;
    Cmp?: ({ fieldStore }: ICustomFormFieldProps<V, T>) => JSX.Element | null;
    errorRender?: (errors: string[]) => JSX.Element; // custom form error renderer
}

export type IInputProps<V, T extends object> = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLInputElement>, HTMLInputElement> & ICommonInputProps<V, T> & {
    type?: 'number' | 'text' | 'reset' | 'submit' | 'checkbox' | 'radio' | 'password' | 'email' |
    'date' | 'datetime-local' | 'time' | 'week' | 'month' | 'color' | 'file' | 'range';

    accept?: string;
    multiple?: boolean;
    checked?: boolean;
    fileCmp?: (onClick: () => void) => JSX.Element;

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

export type ISelectProps<V, T extends object> = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & ICommonInputProps<V, T> & {
    type?: 'number' | 'text';
    options: { label: string, value: string }[];
}

export type ICustomProps<V, T extends object> = Partial<IInputProps<V, T> & ISelectProps<V, T>> & { Cmp: Pick<ICommonInputProps<V, T>, 'Cmp'>, name: keyof T };

export type IFieldProps<P, T extends object> = IInputProps<P, T> | ISelectProps<P, T> | ICustomProps<P, T>;

export interface IFormFieldOptions<T extends object> {
    errorStore: ErrorStore<T>;
    props: IFormProps<T>;
    setValue?: (value: IValue) => void;
    getValues: () => T;
    isDirty: () => boolean;
}

export type IValidator<V, T extends object> = (value: V, obj?: T) => false | IErrorMsg;