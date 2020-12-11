interface IStore {
    set(path: string, value: any): void;
    remove(path: string): boolean;

    // Later:
    // addToArray
    // removeFromArray
    // ...
};

export default IStore;