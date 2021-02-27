import React from 'react';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import BasicEditor from 'ui/components/BasicEditor';
import EditorV1 from 'ui/components/EditorV1';
import EditorV2 from 'ui/components/EditorV2';
import NewNote from 'ui/components/NewNote';
import { Button } from '../../design-system';
import core from '../index';

// TODO: Replace parent with Page ?
class Home extends React.Component<any> {
    render() {
        const textInput = (name: string, id: string = "") => <input id={id} type="text" value={this.props.editor && this.props.editor[name]} onChange={(e: any) => {
            core.store?.set(`editor.${name}`, e.target.value);
        }} />

        const { modal } = this.props;

        const noteNames = localStorage.getItem('noteNames');
        const isLoaded = noteNames !== undefined;
        const list: string[] = isLoaded && JSON.parse(noteNames!) || [];
        return <div className='page'>
            {
                modal && modal.show && <div className="modal-container">
                    <div className="backdrop" />
                    <NewNote />
                </div>
            }
            <div className='left-side'>
                {list.length} notes <Button onClick={() => {
                    core.store?.set('modal.show', true);
                    core.store?.set('newNote.show', true);
                }} text={"New"} />
                {
                    list && list.map((name) => {
                        const str = localStorage.getItem(name);
                        if (str) {
                            const note = JSON.parse(str);
                            const tags = note.tags && note.tags.split(',');
                            return <div className='explorer-note' onClick={() => {
                                core.store?.set(`editor.name`, note.name);
                                core.store?.set(`editor.title`, note.title);
                                core.store?.set(`editor.tags`, note.tags);
                                core.store?.set(`editor.html`, note.html);
                                const event = new Event('noteLoaded');
                                // @ts-ignore
                                event.html = note.html;
                                window.dispatchEvent(event);
                            }}><p>
                                    <small>{note.name}</small> - {note.title}</p>
                                {tags.map((tagname: string) => <div className="tag">{tagname}</div>)}
                            </div>
                        }
                    })
                }
            </div>
            <div className='main-content'>
                {/*<BasicEditor />
                */}
                <EditorV1 />
            </div>
            <div className='right-side'>
                <p>Name</p>
                {textInput('name')}
                <p>Title</p>
                {textInput('title', "text-input-editor-title")}
                <p>Tags</p>
                {textInput('tags')}
                <br />
                <Button onClick={() => {
                    localStorage.removeItem(`note.${this.props.editor.name}`)
                    let notes = JSON.parse(localStorage.getItem('noteNames')!);
                    notes = notes.filter((noteName: string) => noteName !== `note.${this.props.editor.name}`);
                    localStorage.setItem('noteNames', JSON.stringify(notes));
                    core.store?.remove('editor.name');
                    core.store?.remove('editor.title');
                    core.store?.remove('editor.tags');
                    core.store?.remove('editor.html');
                }} text='Delete' />
            </div>
        </div>;
    }
}

const mapState = (state: any) => ({
    notes: state.global.notes,
    editor: state.global.editor,
    modal: state.global.modal,
})

export default connect(mapState)(Home);