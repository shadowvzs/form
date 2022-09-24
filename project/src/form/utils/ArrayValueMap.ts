class ArrayValueMap<T> extends Array<T> {
    public valueMap: Record<string, T> = {};

    constructor(private _key: keyof T, ...rest: T[]) {
        super(...rest);
    }

    public add = (item: T): this => {
        this.push(item);
        this.valueMap[item[this._key] as unknown as string] = item;
        return this;
    }

    public delete = (id: string): boolean => {
        const idx = this.findIndex(x => (x[this._key] as unknown as string) === id);
        if (idx < 0) { return false; }
        this.splice(idx, 1);
        return Reflect.deleteProperty(this.valueMap, this._key);
    }
}

export default ArrayValueMap;