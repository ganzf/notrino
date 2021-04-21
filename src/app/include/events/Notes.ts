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
        title: string,
    };

    constructor(identifier: string, value: string) {
        super();
        this.payload = { identifier, value, title: 'No title' };
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
    name: string = TrashNote.name;
    payload: {
        identifier: string,
    };

    constructor(identifier: string) {
        super();
        this.payload = { identifier };
    }
}

class NoteTrashed extends AResponse {
    name: string = NoteTrashed.name;
    payload: {
        identifier: string,
    };

    constructor(identifier: string) {
        super();
        this.payload = { identifier }
    }
}

class UpdateNoteIdentifier extends ARequest {
    name: string = UpdateNoteIdentifier.name;
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
    name: string = NoteIdentifierChanged.name;
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
