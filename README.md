# Form

## <ins>Documentation</ins>

### <ins>Intro</ins>

#### Basic commands:
   * yarn start      = start the test project

#### Technologies
 - react, mobx, typescript

#### Goal
- for fun form library which handle the form/form field validations, set the onChangeHandler and value changes automatically.
- make the form handling more comfortable and easier with ReactJs.

### Benefits

#### Advantages
- work with any of 3 mode or you can mix it up
- automatical set the model and validate it based on validations (if validation fail the onsubmit not triggered)
- work with form validation (which happens only at click to the onSubmit) or field validation which happens on the input change
- work with custom input components (example at hybrid mode *CustomUsernameInput*)
- type safe
- handle multiple input types (input with datalist), select, file imput with single or file array etc
    - use **Input**, **Select**, **Custom** (for special components) components and **Form**

#### Modes
<details>
  <summary>Class & Decorator approach - click here for expand</summary>   

##### Decorator List
```typescript
// rules
@required // input field must have a value
@isNumber // value is a valid number or not
@minLength(number) // string length validation
@maxLength(number) // string length validation
@min(number) // lesser than validation
@max(number) // greater than validation
@isChecked(errorMessage?: string) // give error if the checkbox not checked
@rule(key: string) // example rules was declared in RegExp.ts and used like a regExp validation for the value
@minSize(number) // min file size
@maxSize(number) // max file size
@minTotalSize(number) // min files size (in case if multiple file selected, input must have multiple={true} props)
@maxTotalSize(number) // max files size (in case if multiple file selected, input must have multiple={true} props)
@minCount(number) // array length lesser than
@maxCount(number) // array length higher than
@allowedType(string) // example 'image', 'jpg', 'jpeg', 'png' etc
@isSame(string or keyof T or getterFunctionWhichReturnAValue) // compare value with other property/value or with constant

// props
@label(string) // input label
@fileCmp(ReactComponent) // replace the original file input component
@accept(string) // input file accept example 'image/*'
@multiple  // allow file select input to select multiple files
@valueParser((value: any) => any) // convert the value from 1 type into another
@props(object) // prop object for inputs
@options([string, string][]) // options for datalist, select and radio; example [['m', 'Male'], ['f', 'Female']]
@cmp(ReactComponent) // use custom component which reiceive the '{ fieldStore }' like props
```

##### Class & Decorators
  
```typescript
@Form({ autoGenerate: true, showErrors: true })
class RegisterDto {

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

    @type('checkbox')
    @label('I Agree')
    @isChecked('Please check in the agreement') // it is same than @validator(agree => !agree && ['Please check in the agreement'])
    public agree: boolean = false;

    @type('radio') // it is same than: @props({ type: 'radio', options: [{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }] })
    @options(() => [['m', 'Male'], ['f', 'Female']])
    public sex: string;

    @type('file')
    @allowedType('image')
    @maxSize(2 * 1024 * 1024)
    @fileCmp(CustomFileUploader)
    public image: File;
}
```

##### Component
```tsx
const RegisterForm = () => {
    const registerDto = useConstant(() => new RegisterDto());
    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time, return true if you sent successfully and false if not
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form1'>
            <h1> "With Decorators" form </h1>
            <Form<RegisterDto>
                entity={registerDto}
                onSubmit={onSubmit}
            />
        </div>
    );
}
```
</details>

<details>
  <summary>Config object approach - click here for expand</summary>   

##### validatorMap
```typescript
type IErrorParams = (string | number)[]; // if we need some dynamic value for error
type IErrorText = string; // simple error message
type IErrorMsg = [IErrorText, IErrorParams?];
  
const validatorMap = {
    minSize: <V>(size: number, errorMsg: string = 'TOO_SMALL_FILE') => (value: V) => false | IErrorMsg,
    maxSize: <V>(size: number, errorMsg: string = 'TOO_BIG_FILE') => (value: V) => false | IErrorMsg,
    minTotalSize: <V>(size: number, errorMsg: string = 'TOO_SMALL_FILE') => (value: V) => false | IErrorMsg,
    maxTotalSize: <V>(size: number, errorMsg: string = 'TOO_BIG_FILE') => (value: V) => false | IErrorMsg,
    minCount: <V>(count: number, errorMsg: string = 'TOO_LESS') => (value: V) => false | IErrorMsg,
    maxCount: <V>(count: number, errorMsg: string = 'TOO_MUCH') => (value: V) => false | IErrorMsg,
    allowedType: <V>(typeOrExtension: string, errorMsg: string = 'INVALID_FILE') => (value: V) => false | IErrorMsg,
    minLength: <V>(minLength: number, errorMsg: string = 'TOO_SHORT') => (value: V) => false | IErrorMsg,
    maxLength: <V>(maxLength: number, errorMsg: string = 'TOO_LONG') => (value: V) => false | IErrorMsg,
    min: <V>(min: number, errorMsg: string = 'TOO_LOW') => (value: V) => false | IErrorMsg,
    max: <V>(max: number, errorMsg: string = 'TOO_HIGH') => (value: V) => false | IErrorMsg,
    isNumber: (errorMsg: string = 'NOT_A_NUMBER') => (value: IValue) => false | IErrorMsg,
    rule: <V>(rule: keyof IRules, errorMsg: string = 'INVALID_FORMAT') => (value: V) => false | IErrorMsg,
    isChecked: (errorMsg: string = 'MUST_BE_CHECKED') => (value: boolean) => false | IErrorMsg,
    required: (errorMsg: string = 'IS_REQUIRED') => (value: unknown) => false | IErrorMsg,
    isSame: <T extends object>(valueOrGetter: IValueOrGetter<T>, errorMsg: string = 'NOT_SAME') => (value: IValue, obj: T) => false | IErrorMsg,
};

```

##### config
```typescript
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
```
  
  ##### Component
```tsx
const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form2'>
            <h1> "With Config" form </h1>
            <Form<RegisterDto>
                config={config}
                onSubmit={onSubmit}
            />
        </div>
    );
}  
```
</details>

<details>
  <summary>Props approach - click here for expand</summary>   

##### props
```typescript
  
export type IFormProps<T extends object> = Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit'> & {
    autoDisable?: boolean; // enable or disable the inputs with type 'submit' and 'reset'
    autoGenerate?: boolean; // if it is enabled then auto generate the input children for the form
    store?: FormContextStore<T>; // if we want provide an external formContextStore
    entity?: T;
    config?: IConfig<T>;
    showErrors?: boolean; // show form errors

    debounceTime?: number; // if this is setted then submit method called with debounce

    errorRender?: (errors: string[], values?: T) => JSX.Element; // custom form error renderer
    onSubmit: (data: T) => Promise<boolean | void>; // submit method
    validator?: (values: T) => IErrorMsg; // for validator, can prevent the submitting if it return an error message
}


export type ITranslateFn = (str: string, params?: (string | number)[], options?: Record<string, any>) => string;
export type ICustomFormFieldProps<V, T extends object> = { fieldStore: IFieldStore<V, T> };

export interface ICommonInputProps<V, T extends object> {
    name: keyof T;

    value?: IValue;
    defaultValue?: IValue;
    disabled?: boolean;
    label?: string | JSX.Element;
    cast?: 'number' | 'string' | 'boolean' | 'file';
    valueParser?: (value: IValue) => IValue;

    labelStyle?: React.CSSProperties;
    fieldStyle?: React.CSSProperties;
    fieldClassName?: string;
    labelClassName?: string;
    showErrors?: boolean;

    entity?: T;
    validators?: IValidator<V, T>[];
    translateFn?: ITranslateFn;
    Cmp?: ({ fieldStore }: ICustomFormFieldProps<V, T>) => JSX.Element | null;
    errorRender?: (errors: string[]) => JSX.Element; // custom form error renderer
}

export type IInputProps<V, T extends object> = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLInputElement>, HTMLInputElement> & ICommonInputProps<V, T> & {
    type?: 'number' | 'text' | 'reset' | 'submit' | 'checkbox' | 'radio' | 'password' | 'email' |
    'date' | 'datetime-local' | 'time' | 'week' | 'month' | 'color' | 'file' | 'range';

    accept?: string;
    multiple?: boolean;
    checked?: boolean;
    FileCmp?: (props: { onClick: () => void, value?: V, fieldStore: IFieldStore<V, T> }) => JSX.Element;

    rule?: keyof IRules;
    required?: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number | string;
    max?: number | string;

    step?: number;
    list?: string;
    options?: { label: string, value: string }[]; /* for radio */
}

export type ISelectProps<V, T extends object> = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & ICommonInputProps<V, T> & {
    type?: 'number' | 'text';
    options: { label: string, value: string }[];
}

export type ICustomProps<V, T extends object> = Partial<IInputProps<V, T> & ISelectProps<V, T>> & { Cmp: Pick<ICommonInputProps<V, T>, 'Cmp'>, name: keyof T };

export type IFieldProps<P, T extends object> = IInputProps<P, T> | ISelectProps<P, T> | ICustomProps<P, T>;

export interface IFormFieldOptions<T extends object> {
    errorStore: ErrorStore<T>;
    props: IFormProps<T>;
    setValue?: (value: IValue) => void;
    getValues: () => T;
    isDirty: () => boolean;
}

```

##### Component
```tsx
const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form3'>
            <h1> "With Props" form </h1>
            <Form<RegisterDto>
                showErrors
                onSubmit={onSubmit}
            >
                <Input name='username' rule='ALPHA_NUM' label='Username: ' />
                <Input name='fullname' rule='NAME' label='Fullname: ' minLength={6} />
                <Input name='email' type='email' label='Email: ' required />
                <Input name='password' type='password' rule='LOW_UP_NUM' label='Password: ' minLength={8} />
                <Input name='agree' type='checkbox' label='I Agree: ' validators={[validatorMap.isChecked('Please check in the agreement')]} value={false} />
                <Input name='sex' type='radio' options={[{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }]} />
                <Input name='image' type='file' FileCmp={CustomFileUploader} validators={[validatorMap.allowedType('image'), validatorMap.maxSize(2 * 1024 * 1024)]} />

                <Input name='reset' value='Reset' type='reset' />
                <Input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
};
```
</details>

<details>
  <summary>Hybrid approach + Custom Input Cmp - click here for expand</summary>
  
##### Decorator
```typescript
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
  
    @type('password')
    @isSame('password')
    @label('Confirm: ')
    public password2: string = '';


    public agree: boolean = false;
    public sex: string = 'f'; // example a default value
    public image: File;
}
```
  
##### Config
```typescript
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
```
  
##### CustomUsernameInput
```tsx
const CustomUsernameInput: ICustomProps<string, RegisterDto>['Cmp'] = observer(({ fieldStore }) => {
    return (
        <div
            className={cn('form-field', fieldStore.errors.length > 0 && 'error')}
            data-type='text'
            title={fieldStore.translatedErrors.join('\r\n') || ''}
        >
            <label htmlFor='username' className='form-label'> Username: </label>
            <input
                id='username'
                {...fieldStore.getProps(['showErrors']) as any}
                value={fieldStore.value}
            />
        </div>
    );
});  
```
  
##### Form Component
```tsx
const RegisterForm = observer(() => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    const formStore = useConstant(() => new FormStore({ onSubmit }));
    const registerDto = useConstant(() => new RegisterDto());

    return (
        <div className='register-form4'>
            <h1> "With Hybrid Mode" form </h1>
            <Form<RegisterDto>
                showErrors
                entity={registerDto}
                config={config}
                store={formStore}
                onSubmit={onSubmit}
            >
                <Custom<string, RegisterDto> Cmp={CustomUsernameInput} name='username' />
                <Input name='fullname' />
                <Input name='email' />
                <Input name='password' />
                <Input name='agree' type='checkbox' label='I Agree: ' value={false} />
                <Input name='sex' type='radio' />
                <Input name='image' type='file' FileCmp={CustomFileUploader} />

                <Input name='reset' value='Reset' type='reset' />
                <Input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
});
```
</details>

  
### Get started

#### What is important?
  
  * You must use component only the package, like Form, Input, Select, Custom
  * if you use custom components then probably you must wrap your component with observer from **react-mobx-lite** package
  
#### In use
```tsx
// the form itself
const RegisterForm = () => {

    const onSubmit = React.useCallback(async (data: RegisterDto) => {
        // dummy waiting time
        await delayPromise(1000);
        console.info('result', data);
        alert(JSON.stringify(data));
        return true;
    }, [])

    return (
        <div className='register-form3'>
            <h1> "With Props" form </h1>
            <Form<RegisterDto>
                showErrors
                onSubmit={onSubmit}
            >
                <Input name='username' rule='ALPHA_NUM' label='Username: ' />
                <Input name='fullname' rule='NAME' label='Fullname: ' minLength={6} />
                <Input name='email' type='email' label='Email: ' required />
                <Input name='password' type='password' rule='LOW_UP_NUM' label='Password: ' minLength={8} />
                <Input<string, RegisterDto> name='password2' />
                <Input name='agree' type='checkbox' label='I Agree: ' validators={[validatorMap.isChecked('Please check in the agreement')]} value={false} />
                <Input name='sex' type='radio' options={[{ label: 'Male', value: 'm' }, { label: 'Female', value: 'f' }]} />
                <Input name='image' type='file' FileCmp={CustomFileUploader} validators={[validatorMap.allowedType('image'), validatorMap.maxSize(2 * 1024 * 1024)]} />

                <Input name='reset' value='Reset' type='reset' />
                <Input name='submit' value='Submit' type='submit' />
            </Form>
        </div>
    );
};
  
// file uploader preview component - this just for fun
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
};
```

  If you want to be sure you used the right property name at name field then you can use generic types (we have generics in other 2 approach as well)
```tsx
  <Input<boolean, RegisterDto> type='checkbox' name='agree' />
```
  
