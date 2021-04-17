import IChannel from 'common/IChannel';
import ICore from 'app/include/ICore';
import IUICore from 'ui/include/IUICore';
import IStore from 'ui/include/IStore';
import { NoteLoaded, NoteSaved, SaveNote } from 'ui/protocol/events/Notes';
import MockChannel from 'mocks/Channel';
import AppChannel from 'ui/modules/AppChannel';
import ReduxStore from './ReduxStore';
import { CreateNewNote, NewNoteInfo } from 'app/include/events/Notes';

class UICore implements IUICore {
    // Used to send and receive events from app
    appChannel: IChannel;

    // Used to store data for components to display
    store: IStore;

    constructor() {
        // @ts-ignore
        this.store = {};
        // @ts-ignore
        this.appChannel = null;
    }

    async init() {
        // @ts-ignore: window.utils is added by our electron app during preload (preload.ts)
        const embedded: boolean = window && window.utils && window.utils.electronEmbedded;
        this.store = new ReduxStore();

        if (embedded) {
            console.log('Not using mocks');
            this.setAppChannel(new AppChannel());
        } else {
            console.log('Using mock app');
            // If we are in dev env, once the appChannel is setup,
            // we also create a fake core to make it easy for devs
            // to send "event apps" on this channel.
            this.setAppChannel(new MockChannel());
            
            const MockApp = require('../../mocks/Core');
            const core = new MockApp.default() as ICore;
            core.setUiChannel(this.appChannel!!);
            // @ts-ignore
            window.app = core;
        }
    }
    
    setAppChannel(channel: IChannel): void {
        this.appChannel = channel;
        this.appChannel.on(NoteLoaded.name, (e: any) => this.onNoteLoaded(e));
        this.appChannel.on(NewNoteInfo.name, (e: any) => this.onNewNoteInfo(e));
        this.appChannel.on(NoteSaved.name, (e: any) => this.onNoteSaved(e));
    }

    setStore(store: IStore) {
        this.store = store;
    }

    onNoteLoaded(event: NoteLoaded) {
        console.log('Note Loaded !');
        this.store.set('note', event.payload.content);
    }

    createNewNote(): boolean {
        const sent = this.appChannel.send(new CreateNewNote());
        if (sent) {
            this.store.set('awaitingCreateNewNote', true);
        }
        return sent;
    }
    onNewNoteInfo(newNoteInfo: NewNoteInfo) {
        const note = { 
            identifier: newNoteInfo.payload.identifier,
            title: '',
        };
        this.store.set('awaitingCreateNewNote', false);
        this.store.set('notes', (notes: any) => { 
            if (!notes) {
                return [note];
            }
            return [...notes, note];
        })
        this.store.set('editor.current', note.identifier);
    }

    saveNote(note: any): boolean {
        const request = new SaveNote(note.identifier, note.value);
        this.store.set('editor.isSaving', true);
        return this.appChannel.send(request);
    }
    onNoteSaved(e: NoteSaved): void {
        this.store.set('editor.isSaving', false);
        this.store.set('editor.justSaved', true);
    }
}

export default UICore;