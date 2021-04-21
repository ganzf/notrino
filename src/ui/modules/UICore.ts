import IChannel from 'common/IChannel';
import ICore from 'app/include/ICore';
import IUICore from 'ui/include/IUICore';
import IStore from 'ui/include/IStore';
import { NoteIdentifierChanged, NoteLoaded, NoteSaved, NoteTrashed, SaveNote, TrashNote, UpdateNoteIdentifier } from 'ui/protocol/events/Notes';
import { AppCoreInitStarted, AppCoreInitStepDetails, AppCoreIsReady, UICoreIsReady, OpenFileExplorer } from 'ui/protocol/events/App';
import MockChannel from 'mocks/Channel';
import AppChannel from 'ui/modules/AppChannel';
import ReduxStore from './ReduxStore';
import { CreateNewNote, NewNoteInfo } from 'app/include/events/Notes';

class UICore implements IUICore {
    // Used to send and receive events from app
    appChannel: IChannel;

    // Used to store data for components to display
    store: IStore;
    confirmChoice: any;

    constructor() {
        // @ts-ignore
        this.store = {};
        // @ts-ignore
        this.appChannel = null;
    }

    async init() {
        // @ts-ignore: window.utils is added by our electron app during preload (preload.ts)
        const embedded: boolean = window && window.utils && window.utils.electronEmbedded;
        this.store = new ReduxStore();

        if (embedded) {
            console.log('Not using mocks');
            this.setAppChannel(new AppChannel());
        } else {
            console.log('Using mock app');
            // If we are in dev env, once the appChannel is setup,
            // we also create a fake core to make it easy for devs
            // to send "event apps" on this channel.
            this.setAppChannel(new MockChannel());

            const MockApp = require('../../mocks/Core');
            const core = new MockApp.default() as ICore;
            core.setUiChannel(this.appChannel!!);
            // @ts-ignore
            window.app = core;
        }
        this.appChannel.send(new UICoreIsReady());
    }

    setAppChannel(channel: IChannel): void {
        this.appChannel = channel;
        this.appChannel.on(AppCoreInitStarted.name, (e: any) => this.onAppCoreInitStarted(e));
        this.appChannel.on(AppCoreInitStepDetails.name, (e: any) => this.onAppCoreInitStepDetails(e));
        this.appChannel.on(AppCoreIsReady.name, (e: any) => this.onAppCoreIsReady(e));
        this.appChannel.on(NoteLoaded.name, (e: any) => this.onNoteLoaded(e));
        this.appChannel.on(NewNoteInfo.name, (e: any) => this.onNewNoteInfo(e));
        this.appChannel.on(NoteSaved.name, (e: any) => this.onNoteSaved(e));
        this.appChannel.on(NoteTrashed.name, (e: any) => this.onNoteTrashed(e));
        this.appChannel.on(NoteIdentifierChanged.name, (e: any) => this.onNoteIdentifierChanged(e));
    }

    confirm(confirmOptions: any): Promise<any> {
        const promise = new Promise((resolve) => {
            this.store.set('modal', {
                show: true,
                options: confirmOptions,
            });
            const interval = setInterval(() => {
                if (this.confirmChoice) {
                    resolve(this.confirmChoice);
                    clearInterval(interval);
                    this.confirmChoice = undefined;
                    this.store.set('modal', {});
                }
            }, 100);
        });
        return promise;
    }
    onConfirm(choice: any) {
        this.confirmChoice = choice;
    }

    onAppCoreIsReady(e: any): void {
        this.store.set('app.isInit', false);
    }
    onAppCoreInitStepDetails(message: AppCoreInitStepDetails): void {
        this.store.set('app.initStep', message.payload.stepName);
    }
    onAppCoreInitStarted(e: any): void {
        this.store.set('app.isInit', true);
    }

    setStore(store: IStore) {
        this.store = store;
    }

    onNoteLoaded(event: NoteLoaded) {
        const note = event.payload.note;
        this.store.set('notes', (notes: any) => {
            if (!notes) {
                return [note];
            }
            return [...notes, note];
        })
    }

    createNewNote(): boolean {
        const sent = this.appChannel.send(new CreateNewNote());
        if (sent) {
            this.store.set('awaitingCreateNewNote', true);
        }
        return sent;
    }
    onNewNoteInfo(newNoteInfo: NewNoteInfo) {
        const note = {
            identifier: newNoteInfo.payload.identifier,
            title: '',
            value: newNoteInfo.payload.value || '# ',
        };
        this.store.set('awaitingCreateNewNote', false);
        this.store.set('notes', (notes: any) => {
            if (!notes) {
                return [note];
            }
            return [...notes, note];
        })
        this.store.set('editor.current', note.identifier);
        this.store.set('editor.isEditing', true);
    }

    saveNote(note: any): boolean {
        const request = new SaveNote(note.identifier, note.value);
        request.payload.title = note.title;
        this.store.set('editor.isSaving', true);
        this.store.set('notes', (notes: any) => {
            if (!notes) {
                return [note];
            }
            return notes.map((n: any) => {
                if (n.identifier === note.identifier) {
                    return note;
                }
                return n;
            })
        });
        return this.appChannel.send(request);
    }
    onNoteSaved(e: NoteSaved): void {
        this.store.set('editor.isSaving', false);
        this.store.set('editor.justSaved', true);
    }

    trashNote(noteIdentifier: string): void {
        this.appChannel.send(new TrashNote(noteIdentifier));
    }

    onNoteTrashed(noteTrashed: NoteTrashed) {
        const { identifier } = noteTrashed.payload;
        let shouldClose = false;
        this.store.set('editor.current', (current: any) => {
            shouldClose = true;
            return current;
        })
        this.store.set('notes', (notes: any) => {
            if (notes) {
                return notes.filter((note: any) => {
                    if (note.identifier === identifier) {
                        return false;
                    }
                    return true;
                })
            }
        })
        if (shouldClose) {
            this.closeEditor();
        }
    }

    updateNoteIdentifier(oldId: string, newId: string): void {
        this.appChannel.send(new UpdateNoteIdentifier(oldId, newId));
    }

    onNoteIdentifierChanged(event: NoteIdentifierChanged): void {
        const { oldId, newId } = event.payload;
        console.log({ event });
    }

    openFile(): void {
        this.appChannel.send(new OpenFileExplorer());
    }

    // Local methods
    openNote(noteIdentifier: string): void {
        this.store.set('editor.isReady', false);
        this.store.set('editor.current', noteIdentifier);        
    }

    closeEditor(): void {
        this.store.set('editor.current', undefined);
        this.store.set('editor.isMenuOpen', false);
        this.store.set('editor.isEditing', false);
    }

    // Todo, implement new actions and update editor content on edit of global.notes
    editNote(noteIdentifier: string, action: any): void {
        this.store.set('notes', (notes: any) => {
            return notes && notes.map((note: any) => {
                if (note.identifier === noteIdentifier) {
                    const value = note.value;
                    let result = '';
                    let lines: any[] = [];
                    value?.split(/(?=[\r\n]{2})|(?<=[\r\n]{2})/).map((line: string) => {
                        if (line.match(/^[\r\n]+$/)) {
                            lines.push(null);
                        } else {
                            line.split(/[\r\n]/).forEach((line: string) => lines.push(line));
                        }
                    });
                    console.log('Applying edit to note: ', { action });
                    if (lines) {
                        lines = lines.map((line: any, lineNbr: number) => {
                            if (lineNbr === action.lineNbr) {
                                const { tagValue } = action;
                                console.log('Editing line ! ', { tagValue, lineNbr, action, line });
                                if (action.action === 'REMOVE_INLINE_TAG' && line.includes(tagValue)) {
                                    const match = line.match(/^\+?\s*?(\(([^\s]+)\))/);
                                    const lineTags: any = {};
                                    match && match[2].split(',').map((tag: string) => {
                                        lineTags[tag.toLowerCase()] = true;
                                    })

                                    if (Object.keys(lineTags).includes(tagValue)) {
                                        delete lineTags[tagValue];
                                        if (Object.keys(lineTags).length === 0) {
                                            return line.replace(match[0], match[0].replace(match[1], ''));
                                        }
                                        return line.replace(match[2], Object.keys(lineTags).join(','));
                                    }
                                }

                                if (action.action === 'ADD_INLINE_TAG') {
                                    let match = line.match(/^\+?\s*?\(([^\s]+)\)/);
                                    const lineTags: any = {};
                                    match && match[1].split(',').map((tag: string) => {
                                        lineTags[tag.toLowerCase()] = true;
                                    })

                                    if (!match) {
                                        match = line.match(/^(\+?\s*?)/);
                                        if (match) {
                                            return line.replace(match[1], match[1] + `(${tagValue})`);
                                        }
                                    }

                                    if (!Object.keys(lineTags).includes(tagValue)) {
                                        lineTags[tagValue] = true;
                                        return line.replace(match[1], Object.keys(lineTags).join(','));
                                    }
                                }
                            }
                            return line;
                        });
                        // Add empty lines again
                        result = lines.join('\n');
                        note.value = result;
                    }
                }
                return note;
            })
        });
        this.store.set('editor.shouldReload', true);
    }

    saveCurrentNote(): void {
        const editor = this.store.get('global.editor');
        if (editor && editor.current) {
            const notes = this.store.get('global.notes');
            if (notes) {
                const note = notes.find((note: any) => note.identifier === editor.current);
                if (note) {
                    this.saveNote(note);
                }
            }
        }
    }
}

export default UICore;