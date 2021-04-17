import IChannel from '../../common/IChannel';
import { NewNoteInfo, SaveNote } from './events/Notes';

interface ICore {
    onInit(): void;
    createNewNote(): NewNoteInfo;
    setUiChannel(channel: IChannel): void;
    onSaveNote(saveNote: SaveNote): boolean;
}

export default ICore;