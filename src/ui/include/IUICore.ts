import IChannel from 'common/IChannel';
import IStore from 'ui/include/IStore';
import { NewNoteInfo } from 'ui/protocol/events/Notes';

interface IUICore {
    // Used to send and receive events from app
    appChannel?: IChannel;
    // Used to store data for components to display
    store: IStore;

    // The UI needs asynchronous time for setting itself up.
    init(): Promise<void>;
    // The UI's job is to handle events and update the store used by IUI (react).
    setStore(store: IStore): void;
    // setAppChannel
    setAppChannel(channel: IChannel): void;

    // Requests (returning boolean indicating if the request has been sent through the channel)
    createNewNote(): boolean;
    saveNote(note: any): boolean;
    trashNote(noteIdentifier: string): void;
    updateNoteIdentifier(oldId: string, newId: string): void;
    openFile(): void;
    
    // Local methods
    openNote(noteIdentifier: string): void;
    confirm(confirmOptions: any): Promise<any>;
    onConfirm(choice: string): void;
    editNote(noteIdentifier: string, action: any): void;
    saveCurrentNote(): void;
}

export default IUICore;