import CoreUI from './CoreUI';

it('Instantiate CoreUI without error', () => {
    expect(() => {
        new CoreUI();
    }).not.toThrowError(Error);
});

it('CoreUI.init()', () => {
    expect(() => {
        const core = new CoreUI();
        core.init();
    }).not.toThrowError(Error);
});