import events from '.';
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
    payload: {
        identifier: string;
    }

    constructor(identifier: string) {
        super();
        this.payload = {
            identifier
        }
    }
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

class RestoreTrashedNote extends ARequest {
    name: string = events.RestoreTrashedNote;
    payload: {
        identifier: string;
    }

    constructor(noteIdentifier: string) {
        super();
        this.payload = {
            identifier: noteIdentifier,
        };
    }
}

class DeleteTrashedNote extends ARequest {
    name: string = events.DeleteTrashedNote;
    payload: {
        identifier: string;
    }

    constructor(noteIdentifier: string) {
        super();
        this.payload = {
            identifier: noteIdentifier,
        };
    }
}

class TrashedNoteRestored extends AResponse {
    name = events.TrashedNoteRestored;
    payload: {
        identifier: string;
    }

    constructor(identifier: string) {
        super();
        this.payload = {
            identifier,
        };
    }
}

class TrashedNoteDeleted extends AResponse {
    name = events.TrashedNoteDeleted;
    payload: {
        identifier: string;
    }

    constructor(noteIdentifier: string) {
        super();
        this.payload = {
            identifier: noteIdentifier,
        };
    }
}

export {
    // Requests
    CreateNewNote,
    SaveNote,
    TrashNote,
    UpdateNoteIdentifier,
    RestoreTrashedNote,
    DeleteTrashedNote,

    // Responses
    NewNoteInfo,
    NoteLoaded,
    NoteSaved,
    NoteTrashed,
    NoteIdentifierChanged,
    TrashedNoteRestored,
    TrashedNoteDeleted,
}
