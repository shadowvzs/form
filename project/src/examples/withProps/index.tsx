// external libraries
import React from 'react';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';

// customizations
import RegisterDto from './RegisterDto';
import "./form.css";
import Input from '../../form/components/Input';
import validatorMap from '../../form/validators/validatorMap';
import CustomFileUploader from './CustomFileUploader';

const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form3'>
            <h1> "With Props" form </h1>
            <Form<RegisterDto>
                //showErrors
                onSubmit={onSubmit}
            >
                <Input name='username' rule='ALPHA_NUM' label='Username: ' />
                <Input name='fullname' rule='NAME' label='Fullname: ' minLength={6} />
                <Input name='email' type='email' label='Email: ' required />
                <Input name='password' type='password' rule='LOW_UP_NUM' label='Password: ' minLength={8} />
                <Input name='agree' type='checkbox' label='I Agree: ' validators={[validatorMap.isChecked('Please check in the agreement')]} value={false} />
                <Input name='sex' type='radio' options={[{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }]} />
                <Input name='image' type='file' FileCmp={CustomFileUploader} validators={[validatorMap.allowedType('image'), validatorMap.maxSize(2 * 1024 * 1024)]} />

                <Input name='reset' value='Reset' type='reset' />
                <Input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
}

export default RegisterForm;