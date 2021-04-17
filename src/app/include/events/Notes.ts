import IChannelMessage from '../../../common/IChannelMessage';

class CreateNewNote implements IChannelMessage {
    name: string = CreateNewNote.name;
    payload: null = null;
    allowSendByApp: boolean = false;
    allowSendByUI: boolean = true;
}

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
        identifier: string,
        value: string,
    };
    allowSendByApp: boolean = false;
    allowSendByUI: boolean = true;

    constructor(identifier: string, value: string) {
        this.payload = { identifier, value };
    }
}

class NoteSaved implements IChannelMessage {
    name: string = NoteSaved.name;
    payload: null = null;
    allowSendByApp = true;
    allowSendByUI = false;
}

class NewNoteInfo implements IChannelMessage {
    name: string = NewNoteInfo.name; // = NewNoteInfo
    payload: {
        identifier: string,
    };
    allowSendByUI: boolean = false;
    allowSendByApp: boolean = true;

    constructor(identifier: string) {
        this.payload = { identifier };
    }
}

export {
    // Requests
    CreateNewNote,
    SaveNote,

    // Responses
    NewNoteInfo,
    NoteLoaded,
    NoteSaved,
}
