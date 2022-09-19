import React from 'react';
import { action, computed, makeObservable, observable, toJS } from 'mobx';

import ErrorStore from './ErrorStore';
import FieldStore from './FieldStore';
import { actionDebounce } from '../utils/utils';
import type { IFieldProps, IFormProps, IFieldStore, IValue } from '../types/types';
import { getFieldsSettings, getFormSettings } from '../utils/decorators';
import Input from '../components/Input';
import translate from '../utils/translate';
import { createCustomChildren } from '../components/Custom';
import Guid from '../utils/Guid';

const FormValidationKey = '*form*';

class FormContextStore<T extends object> {
    private _formProps: Partial<IFormProps<T>> = {};
    private _fieldsProps: Partial<Record<keyof T, IFieldProps<IValue, T>>> = {};

    public id = Guid.newGuid();

    public fields: IFieldStore<IValue, T>[] = [];

    @computed
    public get isDirty(): boolean {
        return this.fields.some(x => x.isDirty);
    }

    public errorStore: ErrorStore<T>;

    @observable
    public errorsValues: string[] = [];

    @observable
    public values: T = {} as T;

    constructor(private _props: IFormProps<T>) {
        makeObservable(this);
        this.errorStore = new ErrorStore<T>();
        this._formProps = { ..._props };
        this.setPropsFromEntity(_props.entity);
        (window as any)['form'] = this;
    }

    public defaultFieldValues = () => {
        return {
            Cmp: Input,
            type: 'text',
            value: '',
            translateFn: translate,
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
        this._fieldsProps = getFieldsSettings(entity);
        (Object.keys(this._fieldsProps) as (keyof T)[]).forEach((key) => {
            this._fieldsProps[key] = {
                ...this.defaultFieldValues(),
                name: key,
                value: entity[key],
                ...this._fieldsProps[key]
            } as IFieldProps<IValue, T>;
        });

        (Object.keys(entity) as (keyof T)[]).forEach(key => this.values[key] = entity[key]);
    }

    @action.bound
    public validate(values: T): void {
        this.fields
            .filter(x => !['reset', 'submit'].includes(x.name))
            .forEach(x => { x.setIsTouched(true); x.validate(values[x.name as keyof T]) });
        this.errorsValues = this.errorStore.list;
        const validator = this._props.validator;
        const formValidation = typeof validator === 'function' && validator(values)
        this.errorStore.add(FormValidationKey as unknown as keyof T, [formValidation]);
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
        }
    }

    @action.bound
    public addField<P>(inputProps: IFieldProps<P, T>): IFieldStore<P, T> {
        const name = inputProps.name as keyof T;
        const fieldStore = new FieldStore<P, T>(
            {
                showErrors: this._formProps.showErrors !== true,
                ...this._fieldsProps[name],
                ...inputProps
            } as IFieldProps<P, T>,
            this.createFieldHelpers(name)
        );
        this.fields.push(fieldStore);
        return fieldStore;
    }

    public onReset = (): void => {
        Object.values<IFieldStore<IValue, T>>(this.fields).forEach(x => x.onReset());
    }

    public getProps() {
        const props = {
            id: this.id,
            noValidate: true,
            ...this._formProps,
            onSubmit: this.onSubmit,
            onReset: this.onReset,
        };

        // inject children if autoGenerate is true
        if (props.autoGenerate) {
            props.children = createCustomChildren(this._fieldsProps, props.children);
        }

        // remove props which isn't for the dom
        const blacklistedProps = ['debounceTime', 'autoGenerate', 'translateFn'];
        blacklistedProps.forEach(propName => Reflect.deleteProperty(props, propName));
        return props;
    }

    public onSubmit = (ev?: React.FormEvent<HTMLFormElement>, skipValidation?: boolean): void | boolean => {
        if (ev) {
            ev.stopPropagation();
            ev.preventDefault();
        }
        const values = toJS(this.values);
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
            this.fields.forEach(field => {
                field.initialValue = field.value;
                field.setIsDirty(false);
                field.setIsTouched(false);
            });
        });
        return false;
    }
}

export default FormContextStore;