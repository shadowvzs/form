import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import { cn } from '../utils/utils';
import { useConstant } from '../utils/react-utils';

import type { ICustomFormFieldProps, IFieldData, IFieldStore, IInputProps, IValue } from '../types/types';
import type FormStore from '../store/FormStore';
import ErrorListRender from './ErrorMessage';

function Input<P extends IValue, T extends object>(props: IInputProps<P, T> | ICustomFormFieldProps<P, T>) {
    const ctx = React.useContext<FormStore<T>>(FormContext);
    const fieldStore = useConstant<IFieldStore<P, T>>(() => (props as ICustomFormFieldProps<P, T>).fieldStore || ctx.addField(props as IInputProps<P, T>));
    const {
        fieldClassName,
        fieldStyle,
        labelStyle,
        labelClassName,
        showErrors,
        label,
        FileCmp,
        errorRender,
        options,
        props: inputProps
    } = fieldStore.getData() as IFieldData<T, P>;

    const { id, element } = fieldStore;
    const { type } = inputProps;

    if (type === 'radio' && Array.isArray(options) && options.length > 1) {
        return (
            <fieldset style={fieldStyle} className={cn('form-field', fieldStore.errors.length > 0 && 'error', fieldClassName)}>
                {label && <legend>{label}</legend>}
                {options.map(({ label, value }, idx) => (
                    <div key={idx}>
                        <input
                            className={cn('form-input', inputProps.className)}
                            id={id + '-' + idx}
                            {...inputProps}
                            checked={value === fieldStore.value}
                            value={value}
                        />
                        {label && <label htmlFor={id + '-' + idx} style={labelStyle} className={cn('form-label', labelClassName)}>{label}</label>}
                    </div>
                ))}
            </fieldset>
        )
    }

    return (
        <div
            style={fieldStyle}
            className={cn('form-field', fieldStore.errors.length > 0 && 'error', fieldClassName)}
            data-type={type || 'text'}
            title={fieldStore.translatedErrors.join('\r\n') || ''}
        >
            {label && <label htmlFor={id} style={labelStyle} className={cn('form-label', labelClassName)}>{label}</label>}
            <input
                className={cn('form-input', inputProps.className)}
                id={id}
                {...inputProps}
            />
            {FileCmp && <FileCmp onClick={() => { fieldStore.element?.click(); }} fieldStore={fieldStore} value={fieldStore.value} />}
            {options && (
                <datalist id={id + 'List'}>
                    {options.map(({ label, value }, idx) => (<option value={value} key={idx}>{label}</option>))}
                </datalist>
            )}
            {showErrors && fieldStore.errors.length > 0 && (errorRender
                ? errorRender(fieldStore.translatedErrors)
                : <ErrorListRender errors={fieldStore.translatedErrors} className='field-errors' />
            )}
        </div>
    );
}

const InputWithObserver = observer(Input);

export default InputWithObserver;
