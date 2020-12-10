import IChannelMessage from '../../../common/IChannelMessage';

class NoteLoaded implements IChannelMessage {
    name: string = NoteLoaded.name; // = NoteLoaded
    payload: {
        content: string,
    };
    allowSendByApp: boolean = true;
    allowSendByUI: boolean = false;

    constructor(content: string) {
        this.payload = { content };
    }
}

class SaveNote implements IChannelMessage {
    name: string = SaveNote.name; // = SaveNote
    payload: {
        content: string,
    };
    allowSendByApp: boolean = false;
    allowSendByUI: boolean = true;

    constructor(content: string) {
        this.payload = { content };
    }
}

export {
    NoteLoaded,
    SaveNote,
}
