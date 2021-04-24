import { faCircle, faEdit, faExclamation, faExclamationTriangle, faLightbulb, faQuestion, faStickyNote, faTasks } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import core from 'ui';
import moment from 'moment';
import ReactKanban from '@lourenci/react-kanban';
import '@lourenci/react-kanban/dist/styles.css'
import parser from 'ui/modules/parser';

import './NoteViewer.css';
import ReactJson from 'react-json-view';

interface Props {
  mode: 'default' | 'text' | 'kanban';
  editor: any;
  note: any;
  notes: any[];
}

class NoteViewer extends React.Component<Props> {
  render() {
    const width = 50;
    const { note } = this.props;
    if (!note) {
      return null;
    }
    const value = note.unsavedValue || note.value;
    if (!value) {
      return null;
    }
    const context: any = {
      note,
      core
    };
    const content = parser.parse(value, context);
    let body = undefined;
    if (this.props.mode === 'kanban') {
      const tasks = context.typed['Task'] || [];
      const todo: any = [];
      const done: any = [];
      tasks.forEach((task: any, id: number) => {
        if (task.lineTags?.ok) {
          done.push({ ...task, id });
        } else {
          todo.push({ ...task, id });
        }
      })
      const board = {
        columns: [
          {
            id: 1,
            title: 'To do',
            onDragEnd: (card: any) => {
              core.editNote(note.identifier, {
                action: 'REMOVE_INLINE_TAG',
                tagValue: 'ok',
                lineNbr: card.lineNbr,
              })
            },
            cards: todo,
          },
          {
            id: 2,
            title: 'Done',
            cards: done,
            onDragEnd: (card: any) => {
              core.editNote(note.identifier, {
                action: 'ADD_INLINE_TAG',
                tagValue: 'ok',
                lineNbr: card.lineNbr,
              })
            },
          }
        ]
      }

      body = (
        <ReactKanban
          children={board}
          onCardDragEnd={(card: any, source: any, destination: any) => {
            const currentColumn = board.columns.find((col: any) => col.id === destination.toColumnId);
            console.log(' Coucou ', { card, source, destination });
            currentColumn?.onDragEnd(card);
          }}
          renderCard={(input: any) => {
            return <div
              className='kanban-card'
            >
              {input.line.replace(/\+?(\s+)?(\([^\)]+\))?/, '')}
            </div>;
          }}
        />
      );
    } else {
      body = (<>
        <div style={{ position: 'absolute', top: '2px', right: '2px', padding: '2px' }}>
          <small>{note?.saveDate && moment(new Date(note.saveDate).getTime()).format('DD/MM HH:mm')}</small>
        </div>
        <div className='note-viewer-content'>
          {content.lines.map(line => line.display())}
        </div>
      </>
      )
    }

    return (
      <div className='note-viewer' style={{ minWidth: `${width}% `, maxWidth: `${width}% ` }}>
        {body}
        {!this.props.editor?.isEditing && <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}>
          <div className='shadow-button'
            style={{ marginRight: '10px' }}
            onClick={() => {
              if (this.props.mode === 'text') {
                core.store?.set('editor.mode', 'kanban')
              } else {
                core.store?.set('editor.mode', 'text')
              }
            }}>
            <FontAwesomeIcon icon={this.props.mode === 'text' ? faTasks : faStickyNote} />
            <span>{this.props.mode === 'text' ? 'Kanban' : 'Note'}</span>
          </div>
          <div className='shadow-button' onClick={() => { core.store?.set('editor.isEditing', true) }}>
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
          </div>
          <div className='shadow-button' style={{ maxWidth: '20%', marginLeft: '10px' }} onClick={() => {
            core.saveCurrentNote();
          }}>
            Save
          </div>
        </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  const { editor } = state.global;
  const notes = state.global.notes;
  const note = notes && notes.find((note: any) => {
    return note.identifier === editor?.current;
  });
  return {
    note,
    notes,
    editor,
    global: state.global,
    mode: editor?.mode,
  }
};

export default connect(mapStateToProps)(NoteViewer);