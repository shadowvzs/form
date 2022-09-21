// external libraries
import React from 'react';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';

// customizations
import RegisterDto from './RegisterDto';
import "./form.css";
import config from './config';

const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form'>
            <h1> "With Decorators" form </h1>
            <Form<RegisterDto>
                config={config}
                onSubmit={onSubmit}
            />
        </div>
    );
}

export default RegisterForm;