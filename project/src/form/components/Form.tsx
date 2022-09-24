import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import FormContextStore from '../store/FormStore';
import { useConstant } from '../utils/react-utils';
import { cn } from '../utils/utils';
import type { IFormProps } from '../types/types';
import ErrorListRender from './ErrorMessage';

function Form<T extends object>({ store: externalStore, errorRender, ...props }: IFormProps<T>) {
    const store = useConstant(() => externalStore ? externalStore.updateProps(props) : new FormContextStore<T>(props));

    const { showErrors, ...formProps } = store.getProps();
    const showErrorsSection = store.errorStore.totalSize > 0 && showErrors;
    const errors = store.errorsValues;

    return (
        <FormContext.Provider value={store}>
            <form
                {...formProps}
                className={cn(props.className, 'custom-form')}
            />
            {showErrorsSection && (errorRender
                ? errorRender(errors)
                : <ErrorListRender errors={errors} className='form-errors' />
            )}
        </FormContext.Provider>
    )
};

const FormWithObserver = observer(Form);

export default FormWithObserver;