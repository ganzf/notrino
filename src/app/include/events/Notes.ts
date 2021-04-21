import ARequest from '../../../common/ARequest';
import AResponse from '../../../common/AResponse';

class CreateNewNote extends ARequest {
    name: string = "CreateNewNote";
    payload: null = null;
}

class NoteLoaded extends AResponse {
    name: string = "NoteLoaded"; // = NoteLoaded
    payload: {
        note: any,
    };

    constructor(note: any) {
        super();
        this.payload = { note };
    }
}

class SaveNote extends ARequest {
    name: string = "SaveNote"; // = SaveNote
    payload: {
        identifier: string,
        value: string,
        title: string,
    };

    constructor(identifier: string, value: string) {
        super();
        this.payload = { identifier, value, title: 'No title' };
    }
}

class NoteSaved extends AResponse {
    name: string = "NoteSaved";
    payload: null = null;
}

class NewNoteInfo extends AResponse {
    name: string = "NewNoteInfo"; // = NewNoteInfo
    payload: {
        identifier: string,
        value: string | null,
    };

    constructor(identifier: string) {
        super();
        this.payload = {
            identifier,
            value: null,
        };
    }
}

class TrashNote extends ARequest {
    name: string = "TrashNote";
    payload: {
        identifier: string,
    };

    constructor(identifier: string) {
        super();
        this.payload = { identifier };
    }
}

class NoteTrashed extends AResponse {
    name: string = "NoteTrashed";
    payload: {
        identifier: string,
    };

    constructor(identifier: string) {
        super();
        this.payload = { identifier }
    }
}

class UpdateNoteIdentifier extends ARequest {
    name: string = "UpdateNoteIdentifier";
    payload: {
        oldId: string,
        newId: string,
    }

    constructor(oldId: string, newId: string) {
        super();
        this.payload = { oldId, newId };
    }
}

class NoteIdentifierChanged extends AResponse {
    name: string = "NoteIdentifierChanged";
    payload: {
        oldId: string,
        newId: string,
    }

    constructor(oldId: string, newId: string) {
        super();
        this.payload = { oldId, newId };
    }
}

export {
    // Requests
    CreateNewNote,
    SaveNote,
    TrashNote,
    UpdateNoteIdentifier,

    // Responses
    NewNoteInfo,
    NoteLoaded,
    NoteSaved,
    NoteTrashed,
    NoteIdentifierChanged,
}
