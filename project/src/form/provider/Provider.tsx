import React from 'react';
import FormStore from '../store/FormStore';

const FormContext = React.createContext<FormStore<any>>(null!);

export default FormContext;