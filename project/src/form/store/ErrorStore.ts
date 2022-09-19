import { action, makeObservable, observable } from 'mobx';
import { IErrorMsg, ITranslateFn } from '../types/types';
import translate from '../utils/translate';

class ErrorStore<T extends object> extends Map<keyof T, string[]> {
    @observable
    public totalSize: number = 0;

    constructor(
        private _translate: ITranslateFn = translate
    ) {
        super();
        makeObservable(this);
    }

    public add(key: keyof T, value: (IErrorMsg | false)[]) {
        value = value.filter(Boolean);
        if (value.length > 0) {
            const messages = (value as IErrorMsg[]).map(([str, params]) => (key as string) + ': ' + this._translate(str, params));
            this.set(key, messages);
        } else {
            this.delete(key);
        }
        this.setTotalSize();
        return this;
    }

    public get list() {
        const list: string[] = [];
        this.forEach(errors => list.push(...errors));
        return list;
    }

    @action.bound
    public setTotalSize() {
        let size = 0;
        this.forEach(value => size += value.length);
        this.totalSize = size;
    }
}

export default ErrorStore;