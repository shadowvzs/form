// external libraries
import React from 'react';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';

// customizations

import "./form.css";
import RegisterDto from './RegisterDto';
import FormStore from '../../form/store/FormStore';

const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, []);

    const form = new FormStore({ onSubmit, uncontrolled: true });

    return (
        <div className='register-form5'>
            <h1> "With Props" form </h1>
            <Form<RegisterDto>
                store={form}
                showErrors
                uncontrolled
                validator={values => values.image?.size < 300 && ['Image must be bigger than 300 byte']}
                onSubmit={onSubmit}
            >
                <input {...form.getInputProps('username')} placeholder='Username' minLength={3} />
                <input {...form.getInputProps('fullname')} placeholder='Fullname' minLength={6} />
                <input {...form.getInputProps('email', { type: 'email' })} placeholder='Email' required />
                <input {...form.getInputProps('password', { type: 'password' })} placeholder='Password' minLength={8} />
                <div className='form-field'>
                    <input name='agree' type='checkbox' />
                    <label>I Agree</label>
                </div>
                <div className='form-field'>
                    <input name='sex' type='radio' />
                </div>
                <input name='image' type='file' />

                <input name='reset' value='Reset' type='reset' />
                <input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
};

export default RegisterForm;