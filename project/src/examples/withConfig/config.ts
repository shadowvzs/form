import { IConfig } from "../../form/types/types";
import RegisterDto from "./RegisterDto";

const config = {
    autoGenerate: true,
    showErrors: true,
    fields: {
        username: {
            rule: 'ALPHA_NUM',
            label: 'Username: '
        },
        fullname: {
            minLength: 6,
            rule: 'NAME',
            label: 'Fullname: '
        },
        email: {
            required: true,
            type: 'email',
            label: 'Email: '
        },
        password: {
            rule: 'LOW_UP_NUM',
            minLength: 8,
            type: 'password',
            label: 'Password: ',
        },
        agree: {
            type: 'checkbox',
            label: 'I Agree',
            validators: [agree => !agree && ['Please check in the agreement']],
            value: false
        },
        sex: {
            type: 'radio',
            options: [{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }]
        },
        image: {
            type: 'file',
            validators: [
                agree => !agree && ['Please check in the agreement']
            ],
        }
    }
} as IConfig<RegisterDto>;

export default config;