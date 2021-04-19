import IChannel from 'common/IChannel';
import ICore from 'app/include/ICore';
import IUICore from 'ui/include/IUICore';
import IStore from 'ui/include/IStore';
import { NoteLoaded, NoteSaved, SaveNote } from 'ui/protocol/events/Notes';
import { AppCoreInitStarted, AppCoreInitStepDetails, AppCoreIsReady, UICoreIsReady } from 'ui/protocol/events/App';
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
        this.appChannel.send(new UICoreIsReady());
    }

    setAppChannel(channel: IChannel): void {
        this.appChannel = channel;
        this.appChannel.on(AppCoreInitStarted.name, (e: any) => this.onAppCoreInitStarted(e));
        this.appChannel.on(AppCoreInitStepDetails.name, (e: any) => this.onAppCoreInitStepDetails(e));
        this.appChannel.on(AppCoreIsReady.name, (e: any) => this.onAppCoreIsReady(e));
        this.appChannel.on(NoteLoaded.name, (e: any) => this.onNoteLoaded(e));
        this.appChannel.on(NewNoteInfo.name, (e: any) => this.onNewNoteInfo(e));
        this.appChannel.on(NoteSaved.name, (e: any) => this.onNoteSaved(e));
    }

    onAppCoreIsReady(e: any): void {
        this.store.set('app.isInit', false);
    }
    onAppCoreInitStepDetails(message: AppCoreInitStepDetails): void {
        this.store.set('app.initStep', message.payload.stepName);
    }
    onAppCoreInitStarted(e: any): void {
        this.store.set('app.isInit', true);
    }

    setStore(store: IStore) {
        this.store = store;
    }

    onNoteLoaded(event: NoteLoaded) {
        const note = event.payload.note;
        this.store.set('notes', (notes: any) => {
            if (!notes) {
                return [note];
            }
            return [...notes, note];
        })
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
        request.payload.title = note.title;
        this.store.set('editor.isSaving', true);
        this.store.set('notes', (notes: any) => {
            if (!notes) {
                return [note];
            }
            return notes.map((n: any) => {
                if (n.identifier === note.identifier) {
                    return note;
                }
                return n;
            })
        });
        return this.appChannel.send(request);
    }
    onNoteSaved(e: NoteSaved): void {
        this.store.set('editor.isSaving', false);
        this.store.set('editor.justSaved', true);
    }


    // Local methods
    openNote(noteIdentifier: string): void {
        this.store.set('editor.isReady', false);
        this.store.set('editor.current', noteIdentifier);
    }

    // FIXME: Also send a request to backend, otherwise the note will
    // be loaded again on refresh
    trashNote(noteIdentifier: string): void {
        this.store.set('notes', (notes: any) => {
            if (notes) {
                return notes.filter((note: any) => {
                    if (note.identifier === noteIdentifier) {
                        return false;
                    }
                    return true;
                })
            }
        })
    }
}

export default UICore;