import React, { FormHTMLAttributes, InputHTMLAttributes } from 'react';
import { action, computed, makeObservable, observable, ObservableMap, ObservableSet, toJS } from 'mobx';

import ErrorStore from './ErrorStore';
import FieldStore from './FieldStore';
import Input from '../components/Input';
import { createCustomChildren } from '../components/Custom';
import { actionDebounce } from '../utils/utils';
import { getFieldsSettings, getFormSettings } from '../utils/decorators';
import translate from '../utils/translate';
import Guid from '../utils/Guid';
import ArrayValueMap from '../utils/ArrayValueMap';
import { getFormValues, getInputNodeValidators, getInputNodeValue } from '../utils/form-utilities';
import type { IFieldProps, IFormProps, IFieldStore, IValue, IErrorMsg, IFormStore } from '../types/types';

const FormValidationKey = '*form*';

class FormStore<T extends object> implements IFormStore<T> {
    private _formProps: Partial<IFormProps<T>> = {};
    private _formRef: HTMLFormElement;
    private _fieldsProps: Partial<Record<keyof T, Partial<IFieldProps<IValue, T, any>>>> = {};
    private _fieldMap: ArrayValueMap<IFieldStore<IValue, T, any>> = new ArrayValueMap<IFieldStore<IValue, T, any>>('name');
    private _inputElements = new ArrayValueMap<HTMLInputElement>('name');

    public id = Guid.newGuid();

    @computed
    public get isDirty(): boolean {
        // return this._fieldMap2.some(x => x.isDirty);
        return this._fieldMap.some(x => x.isDirty);
    }

    public errorStore: ErrorStore<T>;

    @observable
    public errorsValues: string[] = [];

    @observable
    public values: T = {} as T;

    public initValues: T = {} as T;

    constructor(private _props: IFormProps<T>) {
        makeObservable(this);
        this.errorStore = new ErrorStore<T>();
        this.updateProps(_props);
        if (_props.uncontrolled) {
            this.initValues = JSON.parse(JSON.stringify(this.values));
        }
    }

    public updateProps(_props: IFormProps<T>) {
        const props: IFormProps<T> = { ...this._props, ..._props };
        if (props.config) {
            const { fields, ...formProps } = props.config;
            this._formProps = formProps;
            this._fieldsProps = fields || {};
        }
        this._formProps = { ...props, ...this._formProps };
        this._props = props;
        this.setPropsFromEntity(props.entity);
        return this;
    }

    public updateInputElements = (): void => {
        if (!this._formProps) { return; }
        const inputs = this._formRef.querySelectorAll<HTMLInputElement>('input,select');
        inputs.forEach(inputElem => {
            if (inputElem.type === 'submit') {
                inputElem.onclick = (ev: any) => this.onSubmit();
            }
            const name = inputElem.name as keyof T;
            this._inputElements.add(inputElem);
            this.initValues[name] = getInputNodeValue(inputElem);
        });
    }

    private _defaultFieldValues = () => {
        return {
            Cmp: Input,
            type: 'text',
            value: '',
            translateFn: translate,
            showErrors: this._formProps.showErrors !== true
        };
    };

    /**
     * Create form and field props if we provided an entity to the form
     * @param entity 
     */
    @action.bound
    private setPropsFromEntity(entity?: T) {
        if (!entity) { return; }
        this._formProps = { ...this._formProps, ...getFormSettings(entity) };
        this._fieldsProps = { ...this._fieldsProps, ...getFieldsSettings(entity) };
        (Object.keys(this._fieldsProps) as (keyof T)[]).forEach((key) => {
            this._fieldsProps[key] = {
                name: key,
                value: entity[key],
                ...this._fieldsProps[key]
            } as IFieldProps<IValue, T>;
        });

        (Object.keys(entity) as (keyof T)[]).forEach(key => this.values[key] = entity[key]);
    }

    // itt kellene rendezni mindent mi kozos

    @action.bound
    public validate(values: T): void {
        const { uncontrolled } = this._props;
        if (uncontrolled) {
            this._inputElements.forEach(inputElem => {
                values[inputElem.name as keyof T] = getInputNodeValue(inputElem);
            });
        } else {
            this._fieldMap
                .filter(x => !['reset', 'submit'].includes(x.name))
                .forEach(x => { x.setIsTouched(true); x.validate(values[x.name as keyof T]) });
        }
        const validator = this._props.validator;
        const formValidation = typeof validator === 'function' && validator(values);
        this.errorStore.add(FormValidationKey as unknown as keyof T, [formValidation]);
        if (uncontrolled) {
            const errors: IErrorMsg[] = [];
            this._inputElements.forEach(inputelem => errors.push(...getInputNodeValidators(inputelem)));

            this.errorStore.append(FormValidationKey as unknown as keyof T, errors);
        }
        this.errorsValues = this.errorStore.list;
    }

    @action.bound
    private createFieldHelpers(name: keyof T) {
        const baseOptions = {
            errorStore: this.errorStore,
            props: this._props,
            getValues: () => this.values,
            isDirty: () => this.isDirty,
        };

        if (['reset', 'submit'].includes(name as string)) { return baseOptions; }

        return {
            ...baseOptions,
            setValue: (value: IValue) => {
                this.values[name] = value;
                const { debounceTime } = this._formProps;
                if (debounceTime) {
                    actionDebounce(
                        () => this.onSubmit(),
                        debounceTime,
                        `form-${this.id}`
                    )
                }
            },
        };
    }

    // @action.bound
    // public setValue(name: keyof T, value: IValue) {
    //     if (['reset', 'submit'].includes(name as string)) {
    //         return this.values[name] = value;
    //     }
    //     if (value !== this.initValues[name]) {
    //         this.setIsDirty(true);
    //     }

    //     const parsedValue = this.getParsedValue(value);
    //     if (this.isTouched) { this.validate(parsedValue); }
    //     this.value = value;
    //     this.form?.setValue!(parsedValue);
    // }


    // public addField2<P>(inputProps: IFieldProps1<P, T>, htmlInput?: boolean): IFieldProps1<T, P> {
    //     // IFieldProps1
    //     const { name, type = 'text' } = inputProps;
    //     const props: IFieldProps1<T, P> = {
    //         ...inputProps,
    //         type,
    //         // form: this,
    //     } as any;

    //     if (inputProps) {
    //         props.showErrors = this._formProps.showErrors !== true;
    //         Object.assign(props, {
    //             Cmp: props.Cmp || Input,
    //             showErrors: props.showErrors || this._formProps.showErrors !== true,
    //         });
    //     }
    //     /*
    //         Cmp: Input,
    //         type: 'text',
    //         value: '',
    //         translateFn: translate,
    //         showErrors: this._formProps.showErrors !== true        
    //     */

    //     if (!this._formProps.uncontrolled && type !== 'file') {
    //         Object.defineProperty(props, 'value', { get: function () { return this.values[name]; } });
    //         props.onChange = this.onChangeHandler;
    //     }

    //     Object.defineProperty(props, 'isDirty', { get: function () { return this.values[name] !== this.initialValue[name] || ''; } });


    //     // @action.bound
    //     // public setValueDebounce(value: IValue) {
    //     //     this.values[name] = value;
    //     //     const { debounceTime } = this._formProps;
    //     //     if (debounceTime) {
    //     //         actionDebounce(
    //     //             () => this.onSubmit(),
    //     //             debounceTime,
    //     //             `form-${this.id}`
    //     //         )
    //     //     }
    //     // }
    // }

    @action.bound
    public addField<P, H = HTMLInputElement>(inputProps: IFieldProps<P, T, H>): IFieldStore<P, T, H> {
        const name = inputProps.name as keyof T;
        const fieldStore = new FieldStore<P, T, H>(
            {
                ...this._defaultFieldValues(),
                ...this._fieldsProps[name],
                ...inputProps
            } as IFieldProps<P, T, H>,
            this.createFieldHelpers(name)
        );
        this._fieldMap.add(fieldStore);
        if (typeof this.initValues[name] === 'undefined') { this.initValues[name] = fieldStore.value; }
        return fieldStore;
    }

    public addFieldIfNotExist<P>(inputProps: IFieldProps<P, T>): IFieldStore<P, T> {
        return this._fieldMap.valueMap[inputProps.name] || this.addField(inputProps);
    }

    public onReset = (): void => {
        if (this._props.uncontrolled) {
            const inputs = this._formRef.querySelectorAll<HTMLInputElement>('input,select');
            inputs.forEach(inputElem => {
                inputElem.value = String(this.initValues[inputElem.name as keyof T]);
            });
        } else {
            Object.values<IFieldStore<IValue, T>>(this._fieldMap).forEach(x => x.onReset());
        }
    }

    public getProps(): Omit<IFormProps<T>, 'onSubmit'> & Pick<HTMLFormElement, 'onSubmit'> {
        const props = {
            id: this.id,
            noValidate: true,
            ...this._formProps,
            ref: (el: HTMLFormElement) => this._formRef = el,
            onSubmit: this.onSubmit,
            onReset: this.onReset,
        };

        // inject children if autoGenerate is true
        if (props.autoGenerate) {
            props.children = createCustomChildren(this._fieldsProps, props.children);
        }

        // remove props which isn't for the dom
        const blacklistedProps = ['debounceTime', 'autoGenerate', 'translateFn', 'entity', 'config'];
        blacklistedProps.forEach(propName => Reflect.deleteProperty(props, propName));
        return props as Omit<IFormProps<T>, 'onSubmit'> & Pick<HTMLFormElement, 'onSubmit'>;
    }

    @action.bound
    public onChangeHandler(ev: React.ChangeEvent<HTMLInputElement | HTMLInputElement>) {
        const target = ev.currentTarget || ev.target;
        const value = getInputNodeValue(target);
        this.values[target.name as keyof T] = value;
    }

    public getInputProps = <E = HTMLInputElement>(name: keyof T, givenProps: InputHTMLAttributes<E> = {}) => {
        const props: Record<string, any> = {
            onChange: this.onChangeHandler,
            name,
            ...givenProps
        };

        switch (givenProps.type) {
            case 'file':
                break;
            case 'checkbox':
                Object.assign(props, {
                    checked: this.values[name] || this.initValues[name] || false
                });
            default:
                Object.assign(props, {
                    defaultValue: this.values[name] || this.initValues[name] || '',
                });
                break;
        }

        return props;
    }

    public onSubmit = (ev?: React.FormEvent<HTMLFormElement>, skipValidation?: boolean): void | boolean => {
        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }

        const values = this._props.uncontrolled
            ? getFormValues<T>(this._formRef)
            : toJS(this.values);
        if (!skipValidation) {
            this.validate(values);
            const errors = this.errorsValues;
            if (errors.length > 0) {
                if (this._formProps.showErrors) {

                    return false;
                }
                throw new Error(errors.join('\r\n'));
            }
        }
        this._props.onSubmit(values).then(x => {
            if (!x) { return; }
            if (this._props.uncontrolled) {
                const inputs = this._formRef.querySelectorAll<HTMLInputElement>('input,select');
                inputs.forEach(inputElem => {
                    this.initValues[inputElem.name as keyof T] = inputElem.value as unknown as T[keyof T];
                });
            } else {
                this._fieldMap.forEach(field => {
                    field.initialValue = field.value;
                    field.setIsDirty(false);
                    field.setIsTouched(false);
                });

            }
        });
        return false;
    }
}

export default FormStore;