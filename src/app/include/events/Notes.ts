import ARequest from '../../../common/ARequest';
import AResponse from '../../../common/AResponse';

class CreateNewNote extends ARequest {
    name: string = CreateNewNote.name;
    payload: null = null;
}

class NoteLoaded extends AResponse {
    name: string = NoteLoaded.name; // = NoteLoaded
    payload: {
        note: any,
    };

    constructor(note: any) {
        super();
        this.payload = { note };
    }
}

class SaveNote extends ARequest {
    name: string = SaveNote.name; // = SaveNote
    payload: {
        identifier: string,
        value: string,
    };

    constructor(identifier: string, value: string) {
        super();
        this.payload = { identifier, value };
    }
}

class NoteSaved extends AResponse {
    name: string = NoteSaved.name;
    payload: null = null;
}

class NewNoteInfo extends AResponse {
    name: string = NewNoteInfo.name; // = NewNoteInfo
    payload: {
        identifier: string,
    };

    constructor(identifier: string) {
        super();
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
