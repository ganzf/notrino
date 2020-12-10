import IChannel from 'common/IChannel';
import IUICore from 'ui/include/IUICore';
import { NoteLoaded, SaveNote } from 'ui/protocol/events/Notes';

class UICore implements IUICore {
    appChannel?: IChannel;
    note?: string;

    async init() {
        console.log('Hello World');
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

    setAppChannel(channel: IChannel): void {
        this.appChannel = channel;

        this.appChannel.on(NoteLoaded.name, (event: NoteLoaded) => {
            this.note = event.payload.content;
        });
    }
}

export default UICore;