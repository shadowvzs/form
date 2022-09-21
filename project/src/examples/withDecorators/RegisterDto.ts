import { allowedType, fileCmp, Form, label, minLength, maxSize, options, required, rule, type, isChecked } from '../../form/utils/decorators';
import CustomFileUploader from './CustomFileUploader';

// the form decorator is optional but we can provide here the constant configs (props)
@Form({ autoGenerate: true, showErrors: true })
class RegisterDto {

    @minLength(3)
    @rule('ALPHA_NUM')
    @label('Username: ')
    public username: string = '';

    @minLength(6)
    @rule('NAME')
    @label('Fullname: ')
    public fullname: string = '';

    @required
    @type('email')
    @label('Email: ')
    public email: string = '';

    @type('password')
    @rule('LOW_UP_NUM')
    @minLength(8)
    @label('Password: ')
    public password: string = '';

    @type('checkbox')
    @label('I Agree')
    @isChecked('Please check in the agreement') // it is same than @validator(agree => !agree && ['Please check in the agreement'])
    public agree: boolean = false;

    @type('radio') // it is same than: @props({ type: 'radio', options: [{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }] })
    @options(() => [['m', 'Male'], ['f', 'Female']])
    public sex: number;

    @type('file')
    @allowedType('image')
    @maxSize(2 * 1024 * 1024)
    @fileCmp(CustomFileUploader)
    public image: File;
}

export default RegisterDto;