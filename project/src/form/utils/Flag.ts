class Flag {
    public static indexToEnumValue(index: number): number {
        return 1 << index;
    }

    public static enumValueToIndex(enumValue: number): number {
        return Math.log(enumValue) / Math.log(2);
    }
    public static has = (value: number, enumValue: number): boolean => new Flag(value).has(enumValue);
    public static set = (value: number, enumValue: number, enable: boolean): Flag => new Flag(value).set(enumValue, enable);
    public static add = (value: number, enumValue: number): Flag => new Flag(value).add(enumValue);
    public static remove = (value: number, enumValue: number): Flag => new Flag(value).remove(enumValue);
    public static toggle = (value: number, enumValue: number): Flag => new Flag(value).toggle(enumValue);

    public value: number;

    constructor(value: number) {
        this.value = value;
    }

    public has(enumValue: number): boolean {
        return (this.value & enumValue) > 0;
    }

    public set(enumValue: number, enable: boolean): Flag {
        if (this.has(enumValue) !== enable) {
            this.toggle(enumValue);
        }
        return this;
    }

    public add(enumValue: number): Flag {
        this.value = this.value | enumValue;
        return this;
    }

    public remove(enumValue: number): Flag {
        if (this.has(enumValue)) {
            this.toggle(enumValue);
        }
        return this;
    }

    public toggle(enumValue: number): Flag {
        this.value = this.value ^ enumValue;
        return this;
    }

    private getAllValues(): number[] {
        const maxSafeValue = Math.log(Number.MAX_SAFE_INTEGER) / Math.log(2);
        const results = [];
        let enumValue: number;
        for (let i = 0; i < maxSafeValue; i++) {
            enumValue = Flag.indexToEnumValue(i);
            results[i] = this.value & enumValue;
        }
        return results;
    }

    // returns boolean list based on each index if it is enabled or not
    public get entries(): boolean[] {
        return this.getAllValues().map(x => Boolean(x));
    }
    
    // returns all enabled enumValues in array form
    public get values(): number[] {
        return this.getAllValues().filter(Boolean);
    }

    // returns all enabled indexes in array form
    public get valueIndexes(): number[] {
        return this.getAllValues().reduce((t, value, index) => {
            if (value !== 0) { t.push(index); }
            return t;
        }, [] as number[]);
    }
}

export default Flag;