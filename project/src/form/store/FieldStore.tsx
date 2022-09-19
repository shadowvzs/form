import type { FormEvent, FocusEvent } from 'react';
import { action, computed, makeObservable, observable } from 'mobx';

import type {
    IErrorMsg,
    IFieldProps,
    IFieldStore,
    IFormFieldOptions,
    IInputProps,
    IValidator,
    IValue
} from '../types/types';
import { validate } from '../utils/RegExp';
import Guid from '../utils/Guid';

const defaultValues = {
    submit: 'submit',
    reset: 'reset',
    text: '',
    email: '',
    number: 0,
    checkbox: false,
    radio: '',
    password: '',
    color: '#ffffff',
    date: '',
    'datetime-local': '',
    time: '',
    month: '',
    week: '',
    range: '',
    file: []
} as const;

const inputType2VarType = {
    submit: 'string',
    reset: 'string',
    text: 'string',
    email: 'string',
    number: 'number',
    checkbox: 'boolean',
    radio: 'string',
    password: 'string',
    date: 'string',
    'datetime-local': 'string',
    month: 'string',
    week: 'string',
    time: 'string',
    color: 'string',
    range: 'number',
    file: 'file'

} as const;

class FieldStore<P, T extends object> implements IFieldStore<P, T> {

    public id: string = Guid.newGuid();;

    public initialValue: IValue;

    private _validators: IValidator<P, T>[] = [];

    private _props: IFieldProps<P, T> = {} as IFieldProps<P, T>;

    public get name() { return this._props.name || this.id; }

    @observable
    public value: IValue = '';

    @action.bound
    public setValue(value: IValue) {
        if (['reset', 'submit'].includes(this.name)) {
            return this.value = value;
        }
        if (value !== this.initialValue) {
            this.setIsDirty(true);
        }

        const parsedValue = this.getParsedValue(value);
        if (this.isTouched) { this.validate(parsedValue); }
        this.value = value;
        this.form?.setValue!(parsedValue);
    }

    @observable
    public isDirty: boolean = false;

    @action.bound
    public setIsDirty(isDirty: boolean) { this.isDirty = isDirty; }

    @observable
    public errors: IErrorMsg[] = [];

    @action.bound
    public setErrors(errors: IErrorMsg[]) { this.errors = errors.filter(Boolean); }

    @computed
    public get translatedErrors() {
        const { translateFn } = this._props;
        if (!translateFn) { return this.errors.map(x => x[0]); }
        return this.errors.map(([errorText, params]) => translateFn(errorText, params));
    }

    @observable
    public isTouched: boolean = false;

    @action.bound
    public setIsTouched(isTouched: boolean) { this.isTouched = isTouched; }

    constructor(
        _props: IFieldProps<P, T>,
        public form: IFormFieldOptions<T>
    ) {
        makeObservable(this);
        this.createProps(_props);
        this.createValidators(_props);
        this.initialValue = _props.value || this.getDefaultValue();
        this.setValue(this.initialValue);
    }

    public validate(value?: IValue) {
        const values = this.form?.getValues();
        const errors: IErrorMsg[] = this._validators
            .map(x => x(value, values))
            .filter(Boolean) as IErrorMsg[];
        this.setErrors(errors);
        this.form?.errorStore.add(this._props.name!, errors);
        return this.errors.length === 0;
    }

    public getProps() {
        const props = {
            type: 'text',
            checked: this._props['type'] === 'checkbox' ? ['1', 1, true, 'true'].includes(this.value) : undefined,
            ...this._props,
            value: this.value,
            onChange: this.onChangeHandler,
            onFocus: this.onFocusHandler,
            onBlur: this.onBlurHandler
        } as IFieldProps<P, T>;

        // handle autoDisable for submit & reset
        if (this.form && this.form.props.autoDisable && props['disabled'] === undefined) {
            if (props.type === 'submit') {
                props.disabled = !this.form.isDirty() || this.form.errorStore.totalSize > 0;
            } else if (props.type === 'reset') {
                props.disabled = !this.form.isDirty();
            }
        }

        if (props.options && props.type && ['text', 'search'].includes(props.type)) {
            (props as IInputProps<P, T>).list = this.id + 'List';
        }

        if (props.showErrors === undefined) {
            props.showErrors = !this.form.props.showErrors && this.errors.length > 0;
        }

        // remove props which isn't for the dom
        const blacklistedProps = ['Cmp', 'translateFn'];
        if (props.type === 'file') {
            if ((props as IInputProps<unknown, T>).fileCmp) {
                props.style = { display: 'none' };
            }
            blacklistedProps.push('value', 'onChange');
        }
        blacklistedProps.forEach(propName => Reflect.deleteProperty(props, propName));
        return props;
    }

    public getParsedValue = (value = this.value) => {
        const { cast, valueParser } = this._props;

        if (typeof valueParser === 'function') { return valueParser(value); }

        switch (cast) {
            case 'boolean':
                return ['1', 1, true, 'true'].includes(value);
            case 'number':
                return Number(value);
            default:
                return value;
        }
    }

    public setTypeBasedValue(node: HTMLInputElement | HTMLSelectElement): void {
        const { type } = this._props;
        const value = node.value as string;
        const files = node instanceof HTMLInputElement && node.files;
        if (type === 'file') {
            if (files) {
                this.setValue(Array.from(files));
            }
        } else if (type === 'checkbox') {
            this.setValue(!this.value);
        } else {
            this.setValue(value);
        }
    }

    private onChangeHandler = (ev: FormEvent<HTMLInputElement | HTMLSelectElement | any>) => {
        const { onChange } = this._props;
        this.setTypeBasedValue(ev.currentTarget);
        if (onChange) { onChange(ev); }
    }

    private onFocusHandler = (ev: FocusEvent<HTMLInputElement | HTMLSelectElement | any>) => {
        this.setIsTouched(true);
        if (this._props.onFocus) {
            this._props.onFocus(ev);
        }
    }

    private onBlurHandler = (ev: FocusEvent<HTMLInputElement | HTMLSelectElement | any>) => {
        if (['submit', 'reset', 'checkbox', 'radio'].includes(this._props.type!)) { return; }
        const node = ev.currentTarget.value;
        this.setTypeBasedValue(node);
        if (this._props.onBlur) {
            this._props.onBlur(ev);
        }
    }

    public onReset = () => {
        this.setValue(this.initialValue);
        this.setIsTouched(false);
    }

    public getDefaultValue(): IValue {
        if (this._props.defaultValue) { return this._props.defaultValue; }
        if (this._props.options && this._props.type === 'radio') { return this._props.options[0].value; }
        return this._props.defaultValue || defaultValues[this._props.type || 'text'] as IValue;
    }

    private createValidators = (_props: IFieldProps<P, T>) => {

        const {
            type = 'text',
            validators: baseValidators = []
        } = this._props as IInputProps<P, T>;

        const validators: IValidator<P, T>[] = [...baseValidators];

        // validate based on variable type
        const varType = inputType2VarType[type];
        ({
            file: this.validateFile,
            number: this.validateNumber,
            string: this.validateString,
            boolean: this.validateBoolean,
        })[varType](validators)

        this._validators = validators.filter(Boolean);
    }

    private validateString = (validators: IValidator<P, T>[]) => {
        const {
            minLength = 0,
            maxLength = Number.MAX_SAFE_INTEGER,
            rule,
            required,
        } = this._props as IInputProps<P, T>;

        if (required) {
            validators.push(
                (value: IValue) => !value.trim() && ['IS_REQUIRED']
            );
        }

        if (minLength) {
            validators.push(
                (value: IValue) => value.length < minLength && ['TOO_SHORT', [minLength]]
            );
        }
        if (maxLength) {
            validators.push(
                (value: IValue) => value.length > maxLength && ['TOO_LONG', [maxLength]]
            );
        }
        if (rule) {
            validators.push(
                (value: IValue) => !validate(value, rule) && ['INVALID_FORMAT', [rule]]
            );
        }
    }

    private validateNumber = (validators: IValidator<P, T>[]) => {
        const {
            min,
            max,
            required,
        } = this._props as IInputProps<P, T>;

        if (required) {
            validators.push(
                (value: IValue) => !value.trim() && ['IS_REQUIRED']
            );
        }

        validators.push(
            (value: IValue) => value && isNaN(this.getParsedValue(value)) && ['NOT_A_NUMBER']
        );
        if (min) {
            validators.push(
                (value: IValue) => this.getParsedValue(value) < min && ['TOO_LOW', [min]]
            );
        }
        if (max) {
            validators.push(
                (value: IValue) => this.getParsedValue(value) > max && ['TOO_HIGH', [max]]
            );
        }
    }

    private validateBoolean = (validators: IValidator<P, T>[]) => {
        // for boolean we do not need validations but later maybe be we implement something
    }

    private validateFile = (validators: IValidator<P, T>[]) => {
        const {
            required,
        } = this._props as IInputProps<P, T>;

        if (required) {
            validators.push(
                (value: IValue) => (!value || !value.length) && ['IS_REQUIRED']
            );
        }
    }

    private createProps(_props: IFieldProps<P, T>) {
        const inputProps = _props as IInputProps<P, T>;
        const props = {
            cast: inputProps.cast || inputType2VarType[_props.type!],
            ..._props,
        }

        this._props = props;
    }
}

export default FieldStore;
