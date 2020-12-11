import IChannel from 'common/IChannel';
import ICore from '../app/include/ICore';
import { SaveNote } from '../app/include/events/Notes';
import { NoteLoaded } from 'ui/protocol/events/Notes';

class MockCore implements ICore {
    uiChannel?: IChannel;

    setUiChannel(channel: IChannel): void {
        this.uiChannel = channel;

        // Place fake events
        this.uiChannel.on(SaveNote.name, (event: SaveNote) => {
            if (event.payload.content === undefined) {
                return false;
            }
            return true;
        });
    }

    onInit() {
        const noteLoaded = new NoteLoaded('lala');
        this.uiChannel?.send(noteLoaded);
    }

    onSaveNote(): boolean {
        return true;
    }
}

export default MockCore;