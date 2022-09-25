// external libraries
import React from 'react';
import { observer } from 'mobx-react-lite';

// generic component
import Form from '../../form/components/Form';
import delayPromise from '../../form/utils/delayPromise';
import { useConstant } from '../../form/utils/react-utils';
import Input from '../../form/components/Input';
import CustomFileUploader from '../common/CustomFileUploader';
import FormStore from '../../form/store/FormStore';
import Custom from '../../form/components/Custom';

// customizations
import RegisterDto from './RegisterDto';
import "./form.css";
import config from './config';
import CustomUsernameInput from './CustomUsernameInput';

const RegisterForm = observer(() => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    const formStore = useConstant(() => new FormStore({ onSubmit }));
    const registerDto = useConstant(() => new RegisterDto());

    return (
        <div className='register-form4'>
            <h1> "With Hybrid Mode" form </h1>
            <Form<RegisterDto>
                showErrors
                entity={registerDto}
                config={config}
                store={formStore}
                onSubmit={onSubmit}
            >
                <Custom<string, RegisterDto> Cmp={CustomUsernameInput} name='username' />
                <Input<string, RegisterDto> name='fullname' />
                <Input<string, RegisterDto> name='email' />
                <Input<string, RegisterDto> name='password' />
                <Input<string, RegisterDto> name='password2' />
                <Input<Boolean, RegisterDto> name='agree' type='checkbox' label='I Agree: ' value={false} />
                <Input<string, RegisterDto> name='sex' type='radio' />
                <Input<File, RegisterDto> name='image' type='file' FileCmp={CustomFileUploader} />

                <Input name='reset' value='Reset' type='reset' />
                <Input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
});

export default RegisterForm;