import { faCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import core from 'ui';
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
    const value = this.props.editor?.value || this.props.note?.value;

    if (!value) {
      return null;
    }

    const isEditing = this.props.editor?.isEditing;
    const left = isEditing ? 0 : 25;
    const lines = value?.split(/\r?\n/) || [];
    const parsed = lines.map((line: string) => {
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
      match = line.match(/^\$(\w+)=(.*)+$/)
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

      match = line.match(/^\+?\s*?\(([^\s]+)\)/);
      const lineTags: any = {};
      match && match[1].split(',').map((tag: string) => {
        lineTags[tag.toLowerCase()] = true;
      })

      return {
        printable: true,
        display: () => {
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

          let before = <></>;
          const classes: any = {};
          const isListItem = resultText.startsWith('+');
        
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
              before = <span className='inline-tag critical'>Critique</span>;
            }
            if (lineTags.bugfix) {
              before = <span className='inline-tag bugfix'>Bugfix</span>;
            }
            resultText = resultText.replace(/^\+?\s*?\([^\s]+\)/, '');
          }

          if (isListItem) {
            classes['list-item'] = true;
            console.log('Resulting class: ', { classes, text: classNames(classes) });
            return <div className={classNames(classes)}>
              <FontAwesomeIcon icon={faCircle} />
              {before}
              {resultText.replace(/^\+/, '')}
              </div>
          }

          return <p className={classNames(classes)}>{before}{resultText}</p>
        }
      };
    });
    return (
      <div className='note-viewer' style={{ minWidth: `${width}% `, maxWidth: `${width}% ` }}>
        <div className='note-viewer-content'>
          {
            parsed && parsed.map((line: any) => {
              if (line.printable) {
                return line.display();
              }
            })
          }
        </div>
        {!this.props.editor?.isEditing && <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5,
        }}>
          <div className='shadow-button' onClick={() => { core.store?.set('editor.isEditing', true) }}>
            <FontAwesomeIcon icon={faEdit} />
            <span>Edit</span>
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
  }
};

export default connect(mapStateToProps)(NoteViewer);