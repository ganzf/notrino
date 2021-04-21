const path = require('path');
import { app, shell, dialog } from 'electron';
import { win } from '../main';
import ICore from '../include/ICore';
import IChannel from '../../common/IChannel';
import { NewNoteInfo, NoteIdentifierChanged, NoteLoaded, NoteSaved, NoteTrashed, SaveNote, TrashNote, UpdateNoteIdentifier } from '../include/events/Notes';
import Filesystem from '../../lib/FileSystem';
import UIChannel from './UIChannel';
import { AppCoreInitStepDetails, OpenFileExplorer, UICoreIsReady } from '../include/events/App';
import { AppCoreInitStarted } from '../include/events/App';
import { AppCoreIsReady } from '../include/events/App';

class Core implements ICore {
    uiChannel: IChannel;
    dataDirectory: string;
    maxNoteId: number = 1;

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

    setUiChannel(channel: IChannel) {
        this.uiChannel = channel;
        this.uiChannel.on(UICoreIsReady.name, (message, reply) => {
            const initStarted = new AppCoreInitStarted();
            reply(initStarted);
            let step = new AppCoreInitStepDetails();

            setTimeout(() => {
                step.payload.stepName = 'Loading notes';
                reply(step);
            }, 100);

            const notes = Filesystem.ls(this.dataDirectory);
            
            notes.forEach((note) => {
                if (Filesystem.isDirectory(path.join(this.dataDirectory, note))) {
                    return;
                }
                const content = Filesystem.read(path.join(this.dataDirectory, note));
                const noteData = JSON.parse(content);
                const noteLoaded = new NoteLoaded(noteData);
                try {
                    const id = parseInt(noteData.identifier.split('N')[1]);
                    if (this.maxNoteId < id) {
                        this.maxNoteId = id;
                    }
                } catch (e) {

                }
                reply(noteLoaded);
            });


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
        this.uiChannel.on(SaveNote.name, (message: SaveNote, reply) => {
            setTimeout(() => {
                if (this.onSaveNote(message)) {
                    const response = new NoteSaved();
                    reply(response);
                }
            }, 150);
        });

        this.uiChannel.on(TrashNote.name, (message: TrashNote, reply) => {
            setTimeout(async () => {
                if (await this.trashNote(message.payload.identifier)) {
                    reply(new NoteTrashed(message.payload.identifier));
                }
            }, 100);
        });

        this.uiChannel.on(UpdateNoteIdentifier.name, (message: UpdateNoteIdentifier, reply) => { 
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

        this.uiChannel.on(OpenFileExplorer.name, (message, reply) => { 
            this.onOpenFileExporer(message, reply);
        })
    }

    createNewNote(): NewNoteInfo {
        this.maxNoteId += 1;
        return new NewNoteInfo(`N${this.maxNoteId}`);
    }

    onOpenFileExporer(event: OpenFileExplorer, reply: any): void {
        dialog.showOpenDialog(win).then((userChoice) => { 
            console.log({ userChoice });
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
}

export default Core;