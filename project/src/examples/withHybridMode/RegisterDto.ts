import { label, minLength, required, rule, type } from '../../form/utils/decorators';
import Guid from '../../form/utils/Guid';

// the form decorator is optional but we can provide here the constant configs (props)
class RegisterDto {

    public id = Guid.newGuid(); // normal field

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

    public agree: boolean = false;
    public sex: string = 'f'; // example a default value
    public image: File;
}

export default RegisterDto;