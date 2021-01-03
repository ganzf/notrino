import IChannel from 'common/IChannel';
import IStore from 'ui/include/IStore';

interface IUICore {
    // Used to send and receive events from app
    appChannel?: IChannel;

    // Used to store data for components to display
    store?: IStore;

    // The UI needs asynchronous time for setting itself up.
    init(): Promise<void>;

    // The UI's job is to handle events and update the store used by IUI (react).
    setStore(store: IStore): void;

    // The UI can send a note as string and asynchronously return if the note was saved by the App
    saveNote(content: string): Promise<boolean>;

    // setAppChannel
    setAppChannel(channel: IChannel): void;
}

export default IUICore;