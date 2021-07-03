const path = require('path');
import { app, shell, dialog } from 'electron';
import { win } from '../main';
import ICore from '../include/ICore';
import IChannel from '../../common/IChannel';
import { DeleteTrashedNote, NewNoteInfo, NoteIdentifierChanged, NoteLoaded, NoteSaved, NoteTrashed, RestoreTrashedNote, SaveNote, TrashedNoteDeleted, TrashedNoteRestored, TrashNote, UpdateNoteIdentifier } from '../include/events/Notes';
import Events from '../include/events';
import Filesystem from '../../lib/FileSystem';
import UIChannel from './UIChannel';
import { AppCoreInitStepDetails, OpenFileExplorer, UICoreIsReady } from '../include/events/App';
import { AppCoreInitStarted } from '../include/events/App';
import { AppCoreIsReady } from '../include/events/App';

class Core implements ICore {
    uiChannel: IChannel;
    dataDirectory: string;
    maxNoteId: number = 1;
    windowStatus: 'waiting-activation' | 'active';

    constructor() {
        this.dataDirectory = path.join(app.getPath('userData'), 'UserNotes');
        console.log('Data directory is ' + this.dataDirectory);
        if (!Filesystem.exists(this.dataDirectory)) {
            Filesystem.createDir(this.dataDirectory);
        }
        if (!Filesystem.exists(path.join(this.dataDirectory, 'trashed'))) {
            Filesystem.createDir(path.join(this.dataDirectory, 'trashed'));
        }
    }

    onInit() {
        this.setUiChannel(new UIChannel());
    }

    setWindowStatus(status: 'waiting-activation') {
        this.windowStatus = status;
    }

    isWindowActive(): boolean {
        return this.windowStatus === 'active';
    }

    setUiChannel(channel: IChannel) {
        this.uiChannel = channel;
        this.uiChannel.on(Events.UICoreIsReady, (message, reply) => {
            const initStarted = new AppCoreInitStarted();
            reply(initStarted);
            let step = new AppCoreInitStepDetails();

            setTimeout(() => {
                step.payload.stepName = 'Loading notes';
                reply(step);
            }, 100);

            const notes = Filesystem.ls(this.dataDirectory);
            const trash = Filesystem.ls(path.join(this.dataDirectory, 'trashed'));

            notes.forEach((note) => {
                if (Filesystem.isDirectory(path.join(this.dataDirectory, note))) {
                    return;
                }
                const noteLoaded = this.loadNote(note);
                if (noteLoaded) {
                    reply(noteLoaded);
                }
            });

            trash.forEach((note) => {
                if (Filesystem.isDirectory(path.join(this.dataDirectory, 'trashed', note))) {
                    return;
                }
                const content = Filesystem.read(path.join(this.dataDirectory, 'trashed', note));
                const noteData = JSON.parse(content);
                noteData.isTrash = true;
                const noteLoaded = new NoteLoaded(noteData);
                reply(noteLoaded);
            })


            /*             setTimeout(() => { 
                            step.payload.stepName = 'Reinventing the wheel';
                            reply(step);
                        }, 5000);
            
                        setTimeout(() => { 
                            step.payload.stepName = 'Copy pasting from stack overflow';
                            reply(step);
                        }, 7500); */

            setTimeout(() => {
                const initEnded = new AppCoreIsReady();
                reply(initEnded);
            }, 1000);
        });
        this.uiChannel.on(Events.SaveNote, (message: SaveNote, reply) => {
            setTimeout(() => {
                if (this.onSaveNote(message)) {
                    const response = new NoteSaved(message.payload.identifier);
                    reply(response);
                }
            }, 150);
        });

        this.uiChannel.on(Events.TrashNote, (message: TrashNote, reply) => {
            setTimeout(async () => {
                if (await this.trashNote(message.payload.identifier)) {
                    reply(new NoteTrashed(message.payload.identifier));
                }
            }, 100);
        });

        this.uiChannel.on(Events.UpdateNoteIdentifier, (message: UpdateNoteIdentifier, reply) => {
            setTimeout(async () => {
                const oldName = path.join(this.dataDirectory, `note-${message.payload.oldId}.notrinote`);
                const newName = path.join(this.dataDirectory, `note-${message.payload.newId}.notrinote`);
                if (Filesystem.exists(oldName)) {
                    const renamed = await Filesystem.move(oldName, newName)
                    const content = Filesystem.read(newName);
                    const note = JSON.parse(content);
                    note.identifier = message.payload.newId;
                    Filesystem.writeFileSync(newName, JSON.stringify(note));
                    if (renamed) {
                        reply(new NoteIdentifierChanged(message.payload.oldId, message.payload.newId));
                    }
                }
            }, 100);
        });

        this.uiChannel.on(Events.OpenFileExplorer, (message, reply) => {
            this.onOpenFileExporer(message, reply);
        });

        this.uiChannel.on(Events.RestoreTrashedNote, async (message: RestoreTrashedNote, reply) => {
            // Move trashed note into userNotes
            const filename = this.findInTrash(message.payload.identifier);
            if (filename) {
                const filepath = path.join(this.dataDirectory, 'trashed', filename);
                const next = path.join(this.dataDirectory, filename);
                const moved = await Filesystem.move(filepath, next);
                if (moved) {
                    reply(new TrashedNoteRestored(message.payload.identifier));
                    const noteLoaded = this.loadNote(filename);
                    if (noteLoaded) {
                        reply(noteLoaded);
                    }
                }
            }
        });

        this.uiChannel.on(Events.DeleteTrashedNote, (message: DeleteTrashedNote, reply) => {
            const filename = this.findInTrash(message.payload.identifier);
            if (filename) {
                const filepath = path.join(this.dataDirectory, 'trashed', filename);
                Filesystem.rm(filepath);
                return reply(new TrashedNoteDeleted(message.payload.identifier));
            }
            return console.error('Could not delete file', { filename, trash: Filesystem.ls(path.join(this.dataDirectory, 'trashed')) });
        });
    }

    createNewNote(): NewNoteInfo {
        this.maxNoteId += 1;
        return new NewNoteInfo(`N${this.maxNoteId}`);
    }

    onOpenFileExporer(event: OpenFileExplorer, reply: any): void {
        const options = {
            filters: [
                { name: 'Text', extensions: ['txt'] },
                { name: 'Notrinote', extensions: ['ntn'] },
            ]
        };
        dialog.showOpenDialog(win, options).then((userChoice) => {
            if (!userChoice.canceled) {
                const filepath = userChoice.filePaths[0];
                const ext = path.extname(filepath);
                const supportedExts = ['.txt'];
                if (supportedExts.includes(ext)) {
                    const content = Filesystem.exists(filepath) && Filesystem.read(filepath, 'utf-8');
                    this.maxNoteId += 1;
                    const res = new NewNoteInfo(`N${this.maxNoteId}`);
                    res.payload.value = `${content}`;
                    reply(res);
                }
            }
        });
    }

    onSaveNote(saveNote: SaveNote): boolean {
        const { identifier, value, title } = saveNote.payload;
        const savePath = path.join(this.dataDirectory, `note-${identifier}.notrinote`);
        const json = {
            value,
            identifier,
            saveDate: new Date(),
            title,
        }
        Filesystem.writeFileSync(savePath, JSON.stringify(json));
        return true;
    }

    async trashNote(identifier: string): Promise<boolean> {
        const notes = Filesystem.ls(this.dataDirectory);
        let filepath: string = '';
        let candidates: any = [];
        notes && notes.find((note: string) => {
            if (!Filesystem.isDirectory(path.join(this.dataDirectory, note))) {
                const content = Filesystem.read(path.join(this.dataDirectory, note));
                try {
                    const id = JSON.parse(content).identifier;
                    if (id === identifier) {
                        candidates.push({ note, id, filepath: path.join(this.dataDirectory, note) });
                    }
                } catch (e) {
                    console.error('Failed to read note', { e });
                    return false;
                }
            }
        });
        if (candidates.length > 1) {
            console.error('Too many files with the same identifier', { candidates, identifier });
            return false;
        }
        filepath = candidates[0].filepath;
        const destination = path.join(this.dataDirectory, 'trashed', candidates[0].note);
        console.log('Moving', { filepath, destination });
        const moved = await Filesystem.move(filepath, destination);
        if (!moved) {
            console.error('Did not move');
        }
        const exists = Filesystem.exists(destination);
        if (!exists) {
            console.error('Does not exists');
        }
        return moved && exists;
    }

    findInTrash(identifier: string): string | undefined {
        const trash = Filesystem.ls(path.join(this.dataDirectory, 'trashed'));
        let found: string | undefined;
        trash.forEach((filename) => {
            if (filename.split('-')[1].split('.')[0] === identifier) {
                found = filename;
            }
        })
        return found;
    }

    findInNotes(identifier: string): string | undefined {
        const trash = Filesystem.ls(path.join(this.dataDirectory));
        let found: string | undefined;
        trash.forEach((filename) => {
            try {
                if (filename.split('-')[1].split('.')[0] === identifier) {
                    found = filename;
                }
            } catch (e) {

            }
        })
        return found;
    }

    loadNote(name: string): NoteLoaded | undefined {
        let noteData: any;
        try {
            const content = Filesystem.read(path.join(this.dataDirectory, name));
            noteData = JSON.parse(content);
            const id = parseInt(noteData.identifier.split('N')[1]);
            if (this.maxNoteId < id) {
                this.maxNoteId = id;
            }
        } catch (e) {

        }
        if (!noteData) {
            return undefined;
        }
        const noteLoaded = new NoteLoaded(noteData);
        return noteLoaded;
    }
}

export default Core;