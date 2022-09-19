import React from 'react';
import { observer } from 'mobx-react-lite';

const ErrorListRender = observer(({ className, errors }: { errors: string[], className?: string }) => {
    return (
        <ul className={className}>
            {errors.map((msg, idx) => <li key={idx}>{msg}</li>)}
        </ul>
    );
});

export default ErrorListRender;