import React from 'react';
import { observer } from 'mobx-react-lite';

import FormContext from '../provider/Provider';
import { useConstant } from '../utils/react-utils';

import type { ICustomProps, IFieldProps, IFieldStore, IValue } from '../types/types';
import type FormContextStore from '../store/FormStore';
import Input from './Input';

export function createCustomChildren<T extends object>(fieldProps: Partial<Record<keyof T, IFieldProps<IValue, T>>>, children?: React.ReactNode) {
    const entries = Object.entries(fieldProps);
    if (React.Children.count(children) === 0) {
        entries.push(['submit', { Cmp: Input, type: 'submit', value: 'submit', name: 'submit' }]);
        entries.push(['reset', { Cmp: Input, type: 'reset', value: 'reset', name: 'reset' }]);
    }
    const elems = entries.map(([key, props], idx) => (
        <Custom key={key + idx} {...props as ICustomProps<IValue, T>} />
    ));

    return (<> {elems} {children} </>);
}

function Custom<P extends IValue, T extends object>(props: ICustomProps<P, T>) {
    const ctx = React.useContext<FormContextStore<T>>(FormContext);
    const fieldStore = useConstant<IFieldStore<P, T>>(() => ctx.addField(props));
    const { Cmp } = props;

    return (
        <Cmp fieldStore={fieldStore} />
    );
}

const InputWithObserver = observer(Custom);

export default InputWithObserver;
