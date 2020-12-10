import MockChannel from 'mocks/Channel';
import MockCore from 'mocks/Core';
import { NoteLoaded, SaveNote } from 'ui/protocol/events/Notes';
import UICore from './UICore';

const setupTest = () => {
    const app = new MockCore();
    const ui = new UICore();
    const channel = new MockChannel();
    app.setUiChannel(channel);
    ui.setAppChannel(channel);
    return {
        app,
        ui,
        channel,
    }
}

it('Instantiate UICore without error', () => {
    expect(() => {
        new UICore();
    }).not.toThrowError(Error);
});

it('UICore.init()', () => {
    expect(() => {
        const core = new UICore();
        core.init();
    }).not.toThrowError(Error);
});

it ('Should emit SaveNote event on saveNote()', async () => {
    const { app, ui, channel } = setupTest();
    await ui.saveNote('lala');
    expect(channel.lastMessage).toBe(SaveNote.name)
})

it ('Should not do anything when saving empty note', async () => {
    const { ui, channel } = setupTest();
    await ui.saveNote('');
    expect(channel.messagesSent).toBe(0);
});

// TODO: Improve me: Saving in memory is useless for the UI, it needs to be displayed to the end user.
// A simple test of that, is at least to publish to the redux store.
// This way, we guarantee that events coming from the app will result in data saved in the store.
// We simply need to abstract the redux store with a MockClass and a Wrapper and an Interface (IUIStore, MockUIStore, UIStore)
it('Should save note on NoteLoaded', async () => {
    const { ui, channel } = setupTest();

    expect(ui.note).toBe(undefined);

    const noteLoadedEvent = new NoteLoaded('Hello From App');

    // Normally, only the app should send this event
    channel.send(noteLoadedEvent);

    expect(ui.note).not.toBe(undefined);
    expect(ui.note).toStrictEqual(noteLoadedEvent.payload.content);
});

// This is a core related expectation. If the mock classes does not implement the protocol, its your fault.
// Therefore, i'm not so sure that this is a good test.
// Let's keep it here as a comment, for an example of what tests you should NOT do.
// it('Should return false if empty note content'), async () => {
//   const { app, ui, channel } = setupTest();
//   const isSaved = await ui.saveNote('');
//   expect(isSaved).toBe(false);
//})

// Dumb tests for developping mock classes and channels. Can be removed.
// Also, this shows that the MockCore is useless as long as you don't need fake events received from the app
// Unit tests of the UI part of the application should only test which events are going out with MockChannels.
// It should not even be required to mock the app core, only the protocol through a mock channel using channel.receiveIn(timeout=0);

it('UICore.saveNote()', async () => {
    // Create a fake application core and a real ui
    const app = new MockCore();
    const ui = new UICore();

    // Setup an event channel between the real ui core and the fake app core
    const channel = new MockChannel();

    ui.setAppChannel(channel);
    app.setUiChannel(channel);

    // The real ui sends a real event into what it believes is a real app channel
    const isSaved = await ui.saveNote('lala');
    // But the fake app responds
    expect(isSaved).toBe(true);
});
