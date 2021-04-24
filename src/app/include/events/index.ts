class NamedEvents {
  UICoreIsReady = 'UICoreIsReady';
  AppCoreInitStarted = 'AppCoreInitStarted';
  AppCoreInitStepDetails = 'AppCoreInitStepDetails';
  AppCoreIsReady = 'AppCoreIsReady';

  OpenFileExplorer = 'OpenFileExplorer';
  FileOpenedByUser = 'FileOpenedByUser';

  CreateNewNote = 'CreateNewNote';
  SaveNote = 'SaveNote';
  TrashNote = 'TrashNote';
  UpdateNoteIdentifier = 'UpdateNoteIdentifier';
  NewNoteInfo = 'NewNoteInfo';
  NoteLoaded = 'NoteLoaded';
  NoteSaved = 'NoteSaved';
  NoteTrashed = 'NoteTrashed';
  NoteIdentifierChanged = 'NoteIdentifierChanged';

  TrashedNoteDeleted = 'TrashedNoteDeleted';
  TrashedNoteRestored = 'TrashedNoteRestored';
  DeleteTrashedNote = 'DeleteTrashedNote';
  RestoreTrashedNote = 'RestoreTrashedNote';
};

// TODO: Implement me. Check that no two events have the same value (otherwise you can expect com issues)
function verify(namedEvents: NamedEvents): NamedEvents {
  return namedEvents;
}

export default verify(new NamedEvents());