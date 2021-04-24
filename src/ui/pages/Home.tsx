import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Button } from '../../design-system';
import core from '../index';
import CodeMirrorEditor from 'ui/components/CodeMirrorEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight, faCheck, faEdit, faExclamationTriangle, faPaperclip, faPen, faSpinner, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import NoteViewer from 'ui/components/NoteViewer';

interface NoteInfo {
    name: string;
    identifier: string;
    title: string;
}

interface Props {
    editor: any;
    notes: NoteInfo[];
    awaitingNewNote: boolean;
    global: any;
}

class Home extends React.Component<Props> {
    render() {
        const editor = this.props.editor;
        const currentNote = this.props.notes && this.props.notes.find((note) => note.identifier === editor?.current);
        const notes = this.props.notes;
        let icon = editor?.isSaving && faSpinner || editor?.justSaved && faCheck;
        const isOpen = this.props.global.isSideMenuOpen;
        const leftSideWidth = isOpen ? 300 : 80;
        return (
            <div className='page'>
                {
                    this.props.global?.app?.isInit && <div className='full-modal'>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <h1>Preparing your workspace...</h1>
                        </div>
                        <small style={{ color: 'dodgerblue' }}>
                            {this.props.global?.app?.initStep}
                        </small>
                    </div>
                }
                <div className='left-side' style={{ minWidth: `${leftSideWidth}px`, maxWidth: `${leftSideWidth}px` }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: isOpen ? 'row' : 'column' }}>
                        <b>Notrinotes</b>
                        <div>
                            <Button
                                onClick={() => { core.openFile(); }}
                                text='Open'
                                disabled={false}
                            />
                            <Button
                                onClick={() => { core.createNewNote(); }}
                                text='+'
                                disabled={this.props.awaitingNewNote}
                            />
                        </div>
                    </div>
                    {
                        notes && notes.map((note: any) => {
                            return <div className='note-card' onClick={() => { core.openNote(note.identifier) }}>
                                <div><small><b>{note.identifier}</b></small> {isOpen && note.title}</div>
                                <div>
                                    { note.edited && <FontAwesomeIcon icon={faExclamationTriangle} color='yellow' />}
                                    {currentNote && currentNote.identifier === note.identifier && <FontAwesomeIcon
                                        icon={icon}
                                        color={editor.isSaving ? 'white' : 'green'}
                                        spin={editor.isSaving}
                                    />}
                                </div>
                            </div>
                        })
                    }
                    <div className='collapse-left'>
                        {
                            this.props.global.isSideMenuOpen && <FontAwesomeIcon icon={faArrowCircleLeft}
                                onClick={() => {
                                    core.store.set('isSideMenuOpen', false);
                                }}
                            />
                        }
                        {
                            !this.props.global.isSideMenuOpen && <FontAwesomeIcon icon={faArrowCircleRight}
                                onClick={() => {
                                    core.store.set('isSideMenuOpen', true);
                                }}
                            />
                        }
                    </div>
                </div>
                <div className='main-content'>
                    {
                        this.props.global?.modal?.show && <div className='absolute-modal'>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {this.props.global.modal.options.icon && <FontAwesomeIcon icon={this.props.global.modal.options.icon} />}
                                <h2>{this.props.global.modal.options.title}</h2>
                            </div>
                            <p>
                                {this.props.global.modal.options.message}
                            </p>
                            <div className='absolute-modal-footer'>
                                {
                                    this.props.global.modal.options.choices.map((choice: any) => {
                                        return <Button text={choice.label} onClick={() => {
                                            core.onConfirm(choice.label);
                                        }} />
                                    })
                                }
                            </div>
                        </div>
                    }
                    <CodeMirrorEditor />
                    <NoteViewer />
                </div>
            </div>
        );
    }
}

const mapState = (state: any) => ({
    awaitingNewNote: state.global.awaitingCreateNewNote,
    notes: state.global.notes,
    editor: state.global.editor,
    modal: state.global.modal,
    global: state.global,
})

export default connect(mapState)(Home);