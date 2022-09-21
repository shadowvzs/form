import React from 'react'

import { IInputProps } from "../../form/types/types";
import { file2Base64 } from '../../form/utils/file-utility';

const CustomFileUploader: IInputProps<File, any>['FileCmp'] = ({ onClick, value }) => {

    const [src, setSrc] = React.useState<string>('');

    React.useEffect(() => {
        if (!value) {
            setSrc('');
        } else {
            file2Base64(value).then((source) => setSrc(source))
        }
    }, [value, setSrc])

    return (
        <img
            src={src}
            onClick={onClick}
            width={100}
            height={100}
            style={{ background: 'white', border: '1px solid #777', margin: 'auto', cursor: 'pointer' }}
        />
    );
}

export default CustomFileUploader;