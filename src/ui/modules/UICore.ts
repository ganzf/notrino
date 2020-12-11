import IChannel from 'common/IChannel';
import ICore from 'app/include/ICore';
import IUICore from 'ui/include/IUICore';
import IStore from 'ui/include/IStore';
import { NoteLoaded, SaveNote } from 'ui/protocol/events/Notes';
import MockChannel from 'mocks/Channel';

class UICore implements IUICore {
    appChannel?: IChannel;
    store?: IStore;

    async init() {
        // @ts-ignore: window.utils is added by our electron app during preload (preload.ts)
        const embedded: boolean = window && window.utils && window.utils.electronEmbedded;

        if (embedded) {
            console.log('Not using mocks');
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
    }

    setStore(store: IStore) {
        this.store = store;
    }

    async saveNote(content: string): Promise<boolean> {
        // This is the real impl of saving a note from the ui
        if (content.length === 0) {
            return false;
        }

        // Strongly typed message
        const message = new SaveNote(content);

        // Abstract channel but clearly understandable by a developer (sending message to the app)
        const isSaved = await this.appChannel?.send(message);
        return isSaved;
    }

    onNoteLoaded(event: NoteLoaded) {
        console.log('Note Loaded !');
        this.store?.set('note', event.payload.content);
    }
}

export default UICore;