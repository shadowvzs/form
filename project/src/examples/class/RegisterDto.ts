import { Form, minLength, props, rule, type, validator } from '../../form/utils/decorators';

// the form decorator is optional but we can provide here the constant configs (props)
@Form({ autoGenerate: true, showErrors: true })
class RegisterDto {

    @minLength(3)
    @rule('ALPHA_NUM')
    @props({ label: 'Username: ' })
    public username: string = '';

    @minLength(6)
    @rule('NAME')
    @props({ label: 'Fullname: ' })
    public fullname: string = '';

    @type('email')
    @props({ label: 'Email: ' })
    public email: string = '';

    @type('password')
    @rule('LOW_UP_NUM')
    @minLength(8)
    @props({ label: 'Password: ' })
    public password: string = '';

    @type('checkbox')
    @props({ label: 'I Agree' })
    @validator(agree => !agree && ['Please check in the agreement'])
    public agree: boolean = false;
}

export default RegisterDto;