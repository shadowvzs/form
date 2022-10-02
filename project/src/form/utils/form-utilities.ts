import React from 'react';
import { IErrorMsg, IValue } from '../types/types';
import validatorMap from '../validators/validatorMap';

export const getInputDefaultValue = (attributes: React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement>) => {
    const map = {
        submit: 'submit',
        reset: 'reset',
        text: '',
        email: '',
        number: 0,
        checkbox: false,
        radio: '',
        password: '',
        color: '#ffffff',
        date: '',
        'datetime-local': '',
        time: '',
        month: '',
        week: '',
        range: '',
        file: attributes['multiple'] ? [] : null
    };

    return map[attributes['type'] as keyof typeof map];
};

export const inputType2VarType = {
    submit: 'string',
    reset: 'string',
    text: 'string',
    email: 'string',
    number: 'number',
    checkbox: 'boolean',
    radio: 'string',
    password: 'string',
    date: 'string',
    'datetime-local': 'string',
    month: 'string',
    week: 'string',
    time: 'string',
    color: 'string',
    range: 'number',
    file: 'file',
    undefined: 'string'
} as const;


export const getInputNodeValue = (node: HTMLInputElement | HTMLSelectElement): IValue => {
    const { type } = node;
    const value = node.value as string;
    const files = node instanceof HTMLInputElement && node.files;
    if (type === 'file') {
        if (files) {
            return node.hasAttribute('multiple') ? Array.from(files) : files[0];
        }
    } else if (type === 'checkbox') {
        return (node as HTMLInputElement).checked;
    } else {
        return value || getInputDefaultValue({ type: node.type, multiple: node.multiple }) || '';
    }
};

export const getInputNodeValidators = (node: HTMLInputElement | HTMLSelectElement, inputValue?: IValue): IErrorMsg[] => {
    const validatorKeys = Object.keys(validatorMap);
    const value = inputValue || getInputNodeValue(node);
    const usedKeys = validatorKeys.filter(key => node.hasAttribute(key)) as (keyof typeof validatorMap)[];
    return usedKeys.map(key => {
        const attrValue = node.getAttribute(key);
        const fnArg = (typeof attrValue === 'string' && attrValue !== '') ? (isNaN(+attrValue) ? attrValue : +attrValue) : undefined;
        const errorMessages = (validatorMap[key] as Function)(fnArg)(value);
        return errorMessages;
    }).filter(Boolean);
};

export const getFormValues = <T>(formElement: HTMLFormElement) => {
    return Array.from(formElement.querySelectorAll<HTMLInputElement>('input,select'))
        .reduce((obj: T, inputElem: HTMLInputElement) => {
            obj[inputElem.name as keyof T] = getInputNodeValue(inputElem);
            return obj;
        }, {} as T);
}
