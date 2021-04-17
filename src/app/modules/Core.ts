import ICore from '../include/ICore';
import IChannel from '../../common/IChannel';
import { NewNoteInfo, NoteSaved, SaveNote } from '../include/events/Notes';
import Filesystem from '../../lib/FileSystem';

class Core implements ICore {
    uiChannel: IChannel;

    onInit() {

    }

    setUiChannel(channel: IChannel) {
        this.uiChannel = channel;
        this.uiChannel.on(SaveNote.name, (message, reply) => {
            setTimeout(() => { 
                if (this.onSaveNote(message)) {
                    const response = new NoteSaved();
                    reply(response);
                }
            }, 2500);
        })
    }

    createNewNote(): NewNoteInfo {
        return new NewNoteInfo('N1');
    }

    onSaveNote(saveNote: SaveNote): boolean {
        const { identifier, value } = saveNote.payload;
        Filesystem.writeFileSync(`./notes-${identifier}.notrinote`, value);
        return true;
    }
}

export default Core;