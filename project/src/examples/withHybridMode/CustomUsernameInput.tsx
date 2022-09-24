// external libraries
import React from 'react';
import { observer } from 'mobx-react-lite';

import { cn } from '../../form/utils/utils';
import type { ICustomProps } from '../../form/types/types';

import RegisterDto from './RegisterDto';

const CustomUsernameInput: ICustomProps<string, RegisterDto>['Cmp'] = observer(({ fieldStore }) => {
    return (
        <div
            className={cn('form-field', fieldStore.errors.length > 0 && 'error')}
            data-type='text'
            title={fieldStore.translatedErrors.join('\r\n') || ''}
        >
            <label htmlFor='username' className='form-label'> Username: </label>
            <input
                id='username'
                {...fieldStore.getProps(['showErrors']) as any}
                value={fieldStore.value}
            />
        </div>
    );
});

export default CustomUsernameInput;