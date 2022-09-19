import React from 'react';
import FormContextStore from '../store/FormStore';

const FormContext = React.createContext<FormContextStore<any>>(null!);

export default FormContext;