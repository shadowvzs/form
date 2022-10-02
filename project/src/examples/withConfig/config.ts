import { IConfig } from "../../form/types/types";
import validatorMap from "../../form/validators/validatorMap";
import CustomFileUploader from "../common/CustomFileUploader";
import RegisterDto from "./RegisterDto";

const config = {
    autoGenerate: true,
    showErrors: true,
    fields: {
        username: {
            minLength: 3,
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
            validators: [
                validatorMap.isChecked('Please check in the agreement')
            ],
            value: false
        },
        sex: {
            type: 'radio',
            options: [
                { label: 'Male', value: 'm' },
                { label: 'Female', value: 'f' }
            ]
        },
        image: {
            type: 'file',
            FileCmp: CustomFileUploader,
            validators: [
                validatorMap.allowedType('image'),
                validatorMap.maxSize(2 * 1024 * 1024)
            ],
        }
    }
} as IConfig<RegisterDto>;

export default config;
