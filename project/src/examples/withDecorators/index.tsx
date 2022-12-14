// external libraries
import React from 'react';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';
import { useConstant } from '../../form/utils/react-utils';

// customizations
import RegisterDto from './RegisterDto';
import "./form.css";

const RegisterForm = () => {

    const registerDto = useConstant(() => new RegisterDto());

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form1'>
            <h1> "With Decorators" form </h1>
            <Form<RegisterDto>
                entity={registerDto}
                onSubmit={onSubmit}
            />
        </div>
    );
};

export default RegisterForm;