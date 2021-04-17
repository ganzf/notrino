import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Button } from '../../design-system';
import core from '../index';
import CodeMirrorEditor from 'ui/components/CodeMirrorEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface NoteInfo {
    name: string;
    identifier: string;
    title: string;
}

interface Props {
    editor: any;
    notes: NoteInfo[];
    awaitingNewNote: boolean;
}

class Home extends React.Component<Props> {
    render() {
        const editor = this.props.editor;
        const currentNote = this.props.notes && this.props.notes.find((note) => note.identifier === editor?.current);
        const notes = this.props.notes;
        let icon = editor?.isSaving && faSpinner || editor?.justSaved && faCheck;
        return (
            <div className='page'>
                <div className='left-side'>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <b>Notes</b>
                        <Button
                            onClick={() => { core.createNewNote(); }}
                            text='+'
                            disabled={this.props.awaitingNewNote}
                        />
                    </div>
                    {
                        notes && notes.map((note: any) => {
                            return <div className='note-card'>
                                <div><b>{note.identifier}</b>: {note.title}</div>
                                <div>
                                    {currentNote && currentNote.identifier === note.identifier && <FontAwesomeIcon 
                                        icon={icon}
                                        color={editor.isSaving ? 'white' : 'green' }
                                        spin={editor.isSaving}
                                    />}
                                </div>
                            </div>
                        })
                    }
                </div>
                <div className='main-content'>
                    <CodeMirrorEditor />

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