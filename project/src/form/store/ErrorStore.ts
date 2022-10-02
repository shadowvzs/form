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
            const prefix = this.getPrefix(key);
            const messages = (value as IErrorMsg[]).map(([str, params]) => prefix + this._translate(str, params));
            this.set(key, messages);
        } else {
            this.delete(key);
        }
        this.setTotalSize();
        return this;
    }

    private getPrefix = (key: keyof T) => (key as string)[0] === '*' ? '' : (key as string) + ': ';

    public append(key: keyof T, value: (IErrorMsg | false)[]) {
        if (this.has(key)) {
            const messages = this.get(key)!;
            const prefix = this.getPrefix(key);
            const newMessages = (value.filter(Boolean) as IErrorMsg[]).map(([str, params]) => prefix + this._translate(str, params));
            messages.push(...newMessages);
            this.set(key, messages)
        } else {
            return this.add(key, value);
        }
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