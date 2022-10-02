import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import { cn } from '../utils/utils';
import { useConstant } from '../utils/react-utils';

import type { ICustomFormFieldProps, IFieldStore, ISelectProps, IValue } from '../types/types';
import type FormStore from '../store/FormStore';

function Select<P extends IValue, T extends object>(props: ISelectProps<P, T, HTMLSelectElement> | ICustomFormFieldProps<P, T, HTMLSelectElement>) {
    const ctx = React.useContext<FormStore<T>>(FormContext);
    const fieldStore = useConstant<IFieldStore<P, T, HTMLSelectElement>>(() => (props as ICustomFormFieldProps<P, T, HTMLSelectElement>).fieldStore || ctx.addField(props as ISelectProps<P, T, HTMLSelectElement>));
    const {
        fieldClassName,
        fieldStyle,
        label,
        labelStyle,
        labelClassName,
        options,
        showErrors,
        props: inputProps
    } = fieldStore.getData();

    const { name } = inputProps;
    const id = `${ctx.id}-${name || fieldStore.id}`;

    return (
        <div style={fieldStyle} className={cn('form-field', fieldStore.errors.length > 0 && 'error', fieldClassName)}>
            <label htmlFor={id} style={labelStyle} className={cn('form-label', labelClassName)}>{label}</label>
            <select
                className={cn('form-input', inputProps.className)}
                id={id}
                {...inputProps}
            >
                {options && options.map(({ label, value }) => (
                    <option value={value} key={value}> {label} </option>
                ))}
            </select>
        </div>
    );
}

const SelectWithObserver = observer(Select);

export default SelectWithObserver;
