import { IConfig } from "../../form/types/types";
import validatorMap from "../../form/validators/validatorMap";
import CustomFileUploader from "../common/CustomFileUploader";
import RegisterDto from "./RegisterDto";

const config = {
    fields: {
        agree: {
            validators: [
                validatorMap.isChecked('Please check in the agreement')
            ],
        },
        sex: {
            options: [
                { label: 'Male', value: 'm' },
                { label: 'Female', value: 'f' }
            ]
        },
        image: {
            validators: [
                validatorMap.allowedType('image'),
                validatorMap.maxSize(2 * 1024 * 1024)
            ],
        }
    }
} as IConfig<RegisterDto>;

export default config;
