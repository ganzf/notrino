import React from 'react';
import { connect } from 'react-redux';
import './NewNote.css';
import core from '../index';
import { Button } from 'design-system';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faFile } from '@fortawesome/free-solid-svg-icons';


class NewNote extends React.Component<any, any> {
  render() {
    const { newNote } = this.props;
    if (!newNote || !newNote.show) {
      return null;
    }

    const noteTypes = {
      "Blank": {
        tags: ["Blank"],
        description: "A blank note with no specific purpose",
      },
      "Project": {
        tags: ["Project"],
        description: "Write down ideas about an exciting project!",
      },
      "Tasks": {
        tags: ["Tasks"],
        description: "Keep track of your micro-tasks and personal todos",
      },
      "Databook": {
        tags: ["Databook"],
        description: "Organize key information for your daily job that you must remember!",
      },
      "Credentials": {
        tags: ["Credentials", "Private"],
        description: "Save your passwords and other credentials in this secure and private note",
      },
      "Meeting notes": {
        tags: ["Live", "Meeting"],
        description: "In a meeting ? Just write everything down. Notrino will remind you about this in 24h",
      },
      "Learning": {
        tags: ["Live", "Learning"],
        description: "In class ? Just write everything down. Notrino will remind you about this in 24h",
      },
    }

    const noteTypeButton = (noteType: any) => {
      return <div className="new-note-type-button" onClick={() => {
        core.store?.set('editor.tags', noteType.tags.join(','));
        core.store?.set('editor.name', noteType.name);
        core.store?.set('editor.title', '');
        core.store?.set('newNote.show', false);
        core.store?.set('modal.show', false);
        const e = new CustomEvent('noteLoaded');
        // @ts-ignore
        e.html = undefined;
        window.dispatchEvent(e);
        document.getElementById('text-input-editor-title')?.focus();
      }}>
        <div>
          <b><FontAwesomeIcon icon={faFile} /> {noteType.name}</b><br/>
          <p>{noteType.description}</p>
        </div>
        <div>
          <div>{noteType.tags.map((t: string) => <small>{t}</small>)}</div>
        </div>
      </div>
    }

    // @ts-ignore
    const list = Object.keys(noteTypes).map((key: string) => ({ name: key, ...noteTypes[key] }));

    return (
      <div className="new-note-container">
        {list.map(noteTypeButton)}
        <Button text="Cancel" onClick={() => { core.store?.set('modal.show', false) }} />
      </div>
    )
  }
}

const mapStateToProps = (state: any) => ({
  newNote: state.global?.newNote,
})

export default connect(mapStateToProps)(NewNote);