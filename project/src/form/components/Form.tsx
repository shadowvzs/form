import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import { useForm } from '../utils/react-utils';
import { cn } from '../utils/utils';
import type { IFormProps } from '../types/types';
import ErrorListRender from './ErrorMessage';

function Form<T extends object>({ errorRender, ...props }: IFormProps<T>) {
    const store = useForm<T>(props)
    const { showErrors, uncontrolled, validator, ...formProps } = store.getProps();
    const showErrorsSection = store.errorStore.totalSize > 0 && showErrors;
    const errors = store.errorsValues;

    React.useLayoutEffect(store.updateInputElements, [props.children, props.uncontrolled]);

    return (
        <FormContext.Provider value={store}>
            <form {...formProps} className={cn(props.className, 'custom-form')} />
            {showErrorsSection && (
                errorRender
                    ? errorRender(errors)
                    : <ErrorListRender errors={errors} className='form-errors' />
            )}
        </FormContext.Provider>
    )
};

const FormWithObserver = observer(Form);

export default FormWithObserver;