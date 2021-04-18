const path = require('path');
import { app } from 'electron';
import ICore from '../include/ICore';
import IChannel from '../../common/IChannel';
import { NewNoteInfo, NoteLoaded, NoteSaved, SaveNote } from '../include/events/Notes';
import Filesystem from '../../lib/FileSystem';
import UIChannel from './UIChannel';
import { AppCoreInitStepDetails, UICoreIsReady } from '../include/events/App';
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
            console.log({ notes });
            notes.forEach((note) => {
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
        this.uiChannel.on(SaveNote.name, (message, reply) => {
            setTimeout(() => { 
                if (this.onSaveNote(message)) {
                    const response = new NoteSaved();
                    reply(response);
                }
            }, 2500);
        });
    }

    createNewNote(): NewNoteInfo {
        this.maxNoteId += 1;
        return new NewNoteInfo(`N${this.maxNoteId}`);
    }

    onSaveNote(saveNote: SaveNote): boolean {
        const { identifier, value } = saveNote.payload;
        const savePath = path.join(this.dataDirectory, `note-${identifier}.notrinote`);
        const json = {
            value,
            identifier,
            saveDate: new Date(),
        }
        Filesystem.writeFileSync(savePath, JSON.stringify(json));
        return true;
    }
}

export default Core;