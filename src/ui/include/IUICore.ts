import IChannel from 'common/IChannel';
import IStore from 'ui/include/IStore';
import { NewNoteInfo } from 'ui/protocol/events/Notes';

interface IUICore {
    // Used to send and receive events from app
    appChannel?: IChannel;
    // Used to store data for components to display
    store?: IStore;

    // The UI needs asynchronous time for setting itself up.
    init(): Promise<void>;
    // The UI's job is to handle events and update the store used by IUI (react).
    setStore(store: IStore): void;
    // setAppChannel
    setAppChannel(channel: IChannel): void;

    // Requests (returning boolean indicating if the request has been sent through the channel)
    createNewNote(): boolean;
    saveNote(note: any): boolean;
    
    // Local methods
    openNote(noteIdentifier: string): void;
}

export default IUICore;