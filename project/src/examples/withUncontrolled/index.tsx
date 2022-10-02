// external libraries
import React from 'react';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';
import validatorMap from '../../form/validators/validatorMap';
import Input from '../../form/components/Input';
import CustomFileUploader from '../common/CustomFileUploader';

// customizations

import "./form.css";
import RegisterDto from './RegisterDto';
import { IErrorMsg } from '../../form/types/types';

const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form5'>
            <h1> "With Props" form </h1>
            <Form<RegisterDto>
                showErrors
                uncontrolled
                validator={values => values.image?.size < 300 && ['Image must be bigger than 300 byte']}
                onSubmit={onSubmit}
            >
                <input name='username' placeholder='Username' minLength={3} />
                <input name='fullname' placeholder='Fullname' minLength={6} />
                <input name='email' type='email' placeholder='Email' required />
                <input name='password' type='password' placeholder='Password' minLength={8} />
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

// validators={[validatorMap.isChecked('Please check in the agreement')]}
// options={[{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }]}
// FileCmp={CustomFileUploader} validators={[validatorMap.allowedType('image'), validatorMap.maxSize(2 * 1024 * 1024)]}

export default RegisterForm;