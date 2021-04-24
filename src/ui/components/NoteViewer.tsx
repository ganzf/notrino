import { faCircle, faEdit, faExclamation, faExclamationTriangle, faLightbulb, faQuestion, faStickyNote, faTasks } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import core from 'ui';
import moment from 'moment';
import ReactKanban from '@lourenci/react-kanban';
import '@lourenci/react-kanban/dist/styles.css'

import './NoteViewer.css';

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

    const isEditing = this.props.editor?.isEditing;
    const value = note.unsavedValue || note.value;
    
    if (!value) {
      return null;
    }

    const left = isEditing ? 0 : 25;
    const lines: any[] = [];
    value?.split(/(?=[\r\n]{2})|(?<=[\r\n]{2})/).map((line: string) => {
      if (line.match(/^[\r\n]+$/)) {
        lines.push(null);
      } else {
        line.split(/[\r\n]/).forEach((line: string) => lines.push(line));
      }
    });
    const context: any = {
      typed: {},
    };
    let parsed: any[] = [];
    parsed = lines.map((line: string, lineNbr: number) => {
      // Empty lines
      if (!line) {

        if (context.enabled && context?.symbol === '+') {
          context.symbol = undefined;
          context.type = undefined;
          context.enabled = false;
        }

        return {
          printable: true,
          display: () => {
            return <p className='empty-line'></p>;
          }
        }
      }

      let match = line.match(/^(\#+)\s+/);
      if (match) {
        const count = match[1].length;
        let txt = line.replace(/\#+/, '');
        let content: any = null;
        if (count === 1) { content = <h1>{txt}</h1>; }
        if (count === 2) { content = <h2>{txt}</h2>; }
        if (count === 3) { content = <h3>{txt}</h3>; }
        if (count === 4) { content = <h4>{txt}</h4>; }
        return {
          printable: true,
          display: () => content,
        }
      }
      match = line.match(/^\$(\w+)=(.*)+$/);
      if (match) {
        return {
          printable: false,
          type: 'definition',
          name: match[1],
          value: match[2],
        };
      }

      match = line.match(/^____(_+)?$/);
      if (match) {
        return {
          printable: true,
          display: () => {
            return <div className='separator' />
          }
        }
      }

      const isComment = line.match(/^\/\//);
      if (isComment) {
        const isContext = line.match(/([\+]){1}:(Task)/);
        if (isContext) {
          context.startLine = lineNbr;
          context.symbol = isContext[1];
          context.type = isContext[2];
        }
        return {
          printable: false,
          type: 'comment',
          content: line,
        }
      }

      match = line.match(/^\+?\s*?\(([^\s]+)\)/);
      const lineTags: any = {};
      match && match[1].split(',').map((tag: string) => {
        lineTags[tag.toLowerCase()] = true;
      })

      let resultText = line;
      let matched = false;
      let varMatch = line.match(/\$(\w+)\s/);
      let maxAttempts = 10;
      while (varMatch && maxAttempts > 0) {
        maxAttempts -= 1;
        matched = true;
        const varName = varMatch[1];
        const v = parsed.find((l: any) => !l.printable && l.type === 'definition' && l.name === varName);
        if (v) {
          resultText = resultText.replace(varMatch[0], `${v.value} `);
        }
        varMatch = resultText.match(/\$(\w+)\s/);
      }

      let meta: any = {};
      const isListItem = resultText.startsWith('+');
      if (isListItem && context?.symbol === '+') {
        meta.type = context.type;
        context.enabled = true;
      }

      if (context.enabled && context?.symbol === '+' && !isListItem) {
        context.symbol = undefined;
        context.type = undefined;
        context.enabled = false;
      }

      if (meta?.type) {
        if (!context.typed[meta.type]) {
          context.typed[meta.type] = [];
        }
        context.typed[meta.type].push({
          lineNbr,
          line,
          meta,
          lineTags,
        });
      }

      return {
        printable: true,
        meta,
        display: () => {
          let before = <></>;
          const classes: any = {};

          if (lineTags) {
            if (lineTags.ok) {
              classes['line--ok'] = true;
            }
            if (lineTags.important) {
              classes['line--important'] = true;
            }
            if (lineTags.design) {
              before = <span className='inline-tag'>Design</span>;
            }
            if (lineTags.critique) {
              before = <span className='inline-tag critical'>
                Critique
                </span>;
            }
            if (lineTags.bugfix) {
              before = <span className='inline-tag bugfix'>Bugfix</span>;
            }
            if (lineTags.idee) {
              before = <span className='inline-tag idea'>
                <FontAwesomeIcon icon={faLightbulb} />
              </span>;
            }
            resultText = resultText.replace(/^\+?\s*?\([^\s]+\)/, '');
          }

          if (isListItem) {
            classes['list-item'] = true;
            let bullet = <FontAwesomeIcon icon={faCircle} />
            if (meta?.type === 'Task') {
              bullet = <input
                style={{ marginRight: '5px' }}
                type='checkbox'
                checked={lineTags?.ok ? true : false}
                onClick={() => {
                  if (note) {
                    const action = lineTags.ok ? 'REMOVE_INLINE_TAG' : 'ADD_INLINE_TAG';
                    const tagValue = 'ok';
                    core.editNote(note.identifier, {
                      lineNbr,
                      action,
                      tagValue,
                    });
                  }
                }}
              />
            }
            return <div className={classNames(classes)}>
              {bullet}
              {before}
              {resultText.replace(/^\+/, '')}
            </div>
          }

          return <p className={classNames(classes)}>
            {before}
            {resultText}
          </p>
        }
      };
    });

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
          {
            parsed && parsed.map((line: any) => {
              if (line.printable) {
                return line.display();
              }
            })
          }
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