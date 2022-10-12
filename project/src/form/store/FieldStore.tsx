import type { FormEvent, FocusEvent, HTMLAttributes, HTMLInputTypeAttribute, RefCallback } from 'react';
import { action, computed, makeObservable, observable } from 'mobx';

import type {
    IErrorMsg,
    IFieldData,
    IFieldProps,
    IFieldStore,
    IFormFieldOptions,
    IInputProps,
    IValidator,
    IValue
} from '../types/types';

import Guid from '../utils/Guid';
import validatorMap from '../validators/validatorMap';
import { getInputNodeValue, inputType2VarType, getInputDefaultValue } from '../utils/form-utilities';
import React from 'react';

class FieldStore<P, T extends object, H = HTMLInputElement> implements IFieldStore<P, T, H> {

    private _validators: IValidator<P, T>[] = [];
    private _props: IFieldProps<P, T, H> = {} as IFieldProps<P, T, H>;
    private _valueParser: (value: IValue) => IValue;

    public id: string = Guid.newGuid();
    public initialValue: IValue;

    public get name() { return this._props.name || this.id; }

    public element: HTMLInputElement | HTMLSelectElement | null = null;

    @observable
    public value: IValue = '';
    public parsedValue: IValue = '';

    @action.bound
    public setValue(value: IValue) {
        if (['reset', 'submit'].includes(this.name)) {
            return this.value = value;
        }
        if (value !== this.initialValue) {
            this.setIsDirty(true);
        }

        this.parsedValue = this.getParsedValue(value);
        if (this.isTouched) { this.validate(this.parsedValue); }
        this.value = value;
        this.form?.setValue!(this.parsedValue);
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
        _props: IFieldProps<P, T, H>,
        public form: IFormFieldOptions<T>
    ) {
        makeObservable(this);
        if (!_props['type']) { _props['type'] = 'text'; }
        this._props = _props;
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

    public getData = (): IFieldData<T, P, H> => {

        const {
            showErrors,
            options,
            validators,
            translateFn,
            Cmp,
            FileCmp,
            label,
            ...rest
        } = this._props as IInputProps<P, T>;

        const data = {
            props: {
                type: 'text',
                checked: this._props['type'] === 'checkbox' ? ['1', 1, true, 'true'].includes(this.value) : undefined,
                ref: (element: HTMLInputElement | HTMLSelectElement) => {
                    this.element = element;
                    if (element && this._props.type === 'file') {
                        element.onchange = (ev: Event) => this.setTypeBasedValue(ev.target as HTMLInputElement);
                    }
                },
                ...rest,
            } as React.InputHTMLAttributes<H>,
            showErrors: showErrors === undefined ? (!this.form.props.showErrors && this.errors.length > 0) : showErrors,
            isDirty: this.isDirty,
            isTouched: this.isTouched,
            value: this.parsedValue,
            options,
            label,
            FileCmp,
            Cmp,
        } as IFieldData<T, P, H>;

        const props = data.props;

        // handle autoDisable for submit & reset
        if (this.form && this.form.props.autoDisable && props['disabled'] === undefined) {
            if (props.type === 'submit') {
                props.disabled = !this.form.isDirty() || this.form.errorStore.totalSize > 0;
            } else if (props.type === 'reset') {
                props.disabled = !this.form.isDirty();
            }
        }

        if (options && props.type && ['text', 'search'].includes(props.type)) {
            props.list = this.id + 'List';
        }

        // IFieldData<T, P>;
        if (props.type !== 'file') {
            Object.assign(props, {
                value: this.value,
                onChange: this.onChangeHandler,
                onFocus: this.onFocusHandler,
                onBlur: this.onBlurHandler
            });
        } else {
            Reflect.deleteProperty(props, 'value');
            if (FileCmp) {
                props.style = { display: 'none' };
            }
        }

        return data;
    }

    public getParsedValue = (value = this.value) => {
        const { valueParser } = this._props;

        if (typeof valueParser === 'function') { return valueParser(value); }
        const cast = inputType2VarType[this._props.type! as keyof typeof inputType2VarType];

        switch (cast) {
            case 'boolean':
                return ['1', 1, true, 'true'].includes(value);
            case 'number':
                return Number(value);
            default:
                return value;
        }
    }

    public setTypeBasedValue(node: HTMLInputElement | HTMLSelectElement) {
        this.setValue(getInputNodeValue(node));
    }

    private onChangeHandler = (ev: FormEvent<H | any>) => {
        const { onChange } = this._props;
        this.setTypeBasedValue(ev.currentTarget);
        if (onChange) { onChange(ev as any); }
    }

    private onFocusHandler = (ev: FocusEvent<H | any>) => {
        this.setIsTouched(true);
        if (this._props.onFocus) {
            this._props.onFocus(ev);
        }
    }

    private onBlurHandler = (ev: FocusEvent<H | any>) => {
        if (['submit', 'reset', 'checkbox', 'radio'].includes(this._props.type!)) { return; }
        this.setTypeBasedValue(ev.currentTarget);
        if (this._props.onBlur) {
            this._props.onBlur(ev);
        }
    }

    public onReset = () => {
        this.setValue(this.initialValue);
        this.setIsTouched(false);
    }

    public getDefaultValue(): IValue {
        const { defaultValue, options, type, multiple } = this._props;
        if (defaultValue) { return defaultValue; }
        if (options && type === 'radio') { return options[0].value; }
        return defaultValue || getInputDefaultValue({ type, multiple }) as IValue;
    }

    private createValidators = (_props: IFieldProps<P, T, H>) => {

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
            minLength,
            maxLength,
            rule,
            required,
            type,
        } = this._props as IInputProps<P, T>;

        if (required) {
            validators.push(validatorMap.required());
        }

        if (minLength) {
            validators.push(validatorMap.minLength(minLength));
        }
        if (maxLength) {
            validators.push(validatorMap.maxLength(maxLength));
        }
        if (rule) {
            validators.push(validatorMap.rule(rule));
        }

        if (type === 'email' && rule !== 'EMAIL') {
            validators.push(validatorMap.rule('EMAIL'));
        }
    }

    private validateNumber = (validators: IValidator<P, T>[]) => {
        const {
            min,
            max,
            required,
        } = this._props as IInputProps<P, T>;

        if (required) {
            validators.push(validatorMap.required());
        }

        validators.push(validatorMap.isNumber());
        if (min) {
            validators.push(validatorMap.min(Number(min)));
        }
        if (max) {
            validators.push(validatorMap.max(Number(max)));
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
            validators.push(validatorMap.required());
        }
    }
}

export default FieldStore;
