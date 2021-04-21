import IStore from 'ui/include/IStore';

class Store implements IStore {
    store: any = {
        __deleted__: [],
    };

    getProvider() {
        return this.store;
    }

    set(path: string, value: any): void {
        this.store[path] = value;
    }

    remove(path: string): boolean {
        this.store.__deleted__.push(path);
        return true;
    }

    get(path: string): any {
        return null;
    }
}

export default Store;