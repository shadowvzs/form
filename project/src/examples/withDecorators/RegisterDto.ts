import { Form, minLength, options, props, required, rule, type, validator } from '../../form/utils/decorators';
import CustomFileUploader from './CustomFileUploader';

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

    @required
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

    @type('radio')
    @options(() => [['m', 'Male'], ['f', 'Female']])
    public sex: number;

    @type('file')
    @validator<File>((value) => !value.type.includes('image') && ['Invalid file format, only image is accepted'])
    @props<RegisterDto, File>({ FileCmp: CustomFileUploader })
    public image: File;
}

export default RegisterDto;