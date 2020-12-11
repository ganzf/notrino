import IStore from 'ui/include/IStore';

class Store implements IStore {
    store: any = {
        __deleted__: [],
    };


    set(path: string, value: any): void {
        this.store[path] = value;
    }

    remove(path: string): boolean {
        this.store.__deleted__.push(path);
        return true;
    }
}

export default Store;