import type { Constructor, IConfig } from '../types/types';


class ConfigMap {
    private _map = new Map<string, unknown>;

    public set<T extends object>(cls: Constructor<T> | string, config: IConfig<T>) {
        const key = typeof cls === 'string' ? cls : cls.constructor.name;
        this._map.set(key, config);
    }

    public get<T extends object>(cls: Constructor<T> | string): IConfig<T> {
        const key = typeof cls === 'string' ? cls : cls.constructor.name;
        const config = this._map.get(key) || {};
        return config as any as IConfig<T>;
    }
}

const configMap = new ConfigMap();

export default configMap;