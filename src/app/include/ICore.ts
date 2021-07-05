import IChannel from '../../common/IChannel';
import { NewNoteInfo, SaveNote } from './events/Notes';

interface ICore {
    onInit(): void;
    createNewNote(): NewNoteInfo;
    setUiChannel(channel: IChannel): void;
    onSaveNote(saveNote: SaveNote): boolean;
    setWindowStatus(status: 'waiting-activation' | 'active'): void;
    isWindowActive(): boolean;
    
    // Opens a quick write memo that will be debriefed at the end of the day :) 
    onQuickThought(): void;
}

export default ICore;