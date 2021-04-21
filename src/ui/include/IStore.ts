interface IStore {
    getProvider(): any;
    set(path: string, value: any): void;
    remove(path: string): boolean;
    get(path: string): any;
    // Later:
    // addToArray
    // removeFromArray
    // ...
};

export default IStore;