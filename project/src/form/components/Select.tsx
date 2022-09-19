import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import { cn } from '../utils/utils';
import { useConstant } from '../utils/react-utils';

import type { ICustomFormFieldProps, IFieldStore, ISelectProps, IValue } from '../types/types';
import type FormContextStore from '../store/FormStore';

function Select<P extends IValue, T extends object>(props: ISelectProps<P, T> | ICustomFormFieldProps<P, T>) {
    const ctx = React.useContext<FormContextStore<T>>(FormContext);
    const fieldStore = useConstant<IFieldStore<P, T>>(() => (props as ICustomFormFieldProps<P, T>).fieldStore || ctx.addField(props as ISelectProps<P, T>));
    const {
        className,
        fieldClassName,
        fieldStyle,
        labelStyle,
        labelClassName,
        options,
        showErrors,
        ...inputProps
    } = fieldStore.getProps() as ISelectProps<P, T>;

    const { name, label } = inputProps;
    const id = `${ctx.id}-${name || fieldStore.id}`;

    return (
        <div style={fieldStyle} className={cn('form-field', fieldStore.errors.length > 0 && 'error', fieldClassName)}>
            <label htmlFor={id} style={labelStyle} className={cn('form-label', labelClassName)}>{label}</label>
            <select
                className={cn('form-input', className)}
                id={id}
                {...inputProps}
            >
                {options.map(({ label, value }) => (
                    <option value={value} key={value}> {label} </option>
                ))}
            </select>
        </div>
    );
}

const SelectWithObserver = observer(Select);

export default SelectWithObserver;
