type IGuid = string;
type IByte = { toString: (n?: number) => string } & number;

class Guid {
    public value: IGuid;

    constructor(guid?: IGuid | Guid | IByte[]) {
        if (guid) {
            if (guid instanceof Guid) {
                this.value = guid.value;
            } else {
                this.value = Guid.parse(guid).value;
            }
        }
    }

    private static verify(guid: IGuid) {
        const pattern = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');
        return pattern.test(guid);
    }

    public static newGuid () {
        let d = new Date().getTime();
        let d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
    
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          let r = Math.random() * 16;
          if (d > 0) {
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          } else {
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
          }
          return (c === 'x' ? r : ((r & 0x7) | 0x8)).toString(16);
        });
    }

    public static parse(guid: IGuid | IByte[]): Guid {
        let newGuid: IGuid = '';
        if (Array.isArray(guid)) {
            newGuid = [
                guid.slice(0, 4),
                guid.slice(4, 6),
                guid.slice(6, 8),
                guid.slice(8, 10),
                guid.slice(10, 16)
            ].map(segment => segment.map(n => n.toString(16)).join('')).join('-');
        } else if (typeof guid === 'string') {
            if (guid.startsWith('{') && guid.endsWith('}')) {
                newGuid = guid.substring(1, guid.length - 1);
            } else {
                newGuid = guid;
            }
        }
        if (!Guid.verify(newGuid)) {
            throw new Error(`Guid not parsable ${guid}`);
        }
        return new Guid(newGuid)
    }

    public static tryParse(guid: IGuid | IByte[], out?: Guid) {
        try {
            const parsedGuid = this.parse(guid);
            return parsedGuid;
        } catch(err) {
            return out;
        }
    }

    public static empty(): string {
        return '00000000-0000-0000-0000-000000000000';
    }

    public static equals(guid1: Guid | string | IByte[], guid2: Guid | string | IByte[]) {
        return new Guid(guid1).value === new Guid(guid2).value;
    }

    public equals(guid: Guid | string): boolean {
        if (guid instanceof Guid) {
            return this.value === guid.value;
        } else {
            return this.value === guid;
        }
    }

    public toByteArray() {
        return this.value.replace(/-/g, '').match(/.{1,2}/g)?.map(str => Number('0x'+str));
    }


    public compareTo(guid: IGuid) {
        return this.value.localeCompare(guid);
    }

}

export default Guid;