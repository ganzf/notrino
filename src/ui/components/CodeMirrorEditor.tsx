import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import './CodeMirrorEditor.css';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import core from 'ui';
import { faCheck, faEdit, faIdCard, faKey, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Props {
  editor: {
    current: string,
    justSaved: boolean,
    isEditing: boolean,
    isReady: boolean;
    isSaving: boolean,
    isEditingIdentifier: boolean;
  }
  note: any;
};

let id = 1;

class CodeMirrorEditor extends React.Component<Props, any> {
  instance: any = null;
  saveInterval: any = null;

  constructor(props: Props) {
    super(props);
    const state = {
      value: '',
    }
    this.state = state;
  }

  componentWillUnmount() {
    clearInterval(this.saveInterval);
  }

  save() {
    const saveObject: any = {};
    saveObject.value = this.state.value;
    localStorage.setItem('note', JSON.stringify(saveObject));
  }

  listVariables() {
    const editor = this.instance;
    const doc = editor.getDoc();
    const variables: any[] = [];
    doc.eachLine((line: any) => {
      const { text } = line;
      // Typed variable
      let match = text.match(/^\$(\w+):\w+\(\w+\)=(\w+)/);
      if (match) {
        variables.push({
          text: match[1],
          displayText: `${match[1]} (=${match[2]})`,
        })
      }
      // Untyped (string) variable
      match = text.match(/^\$(\w+)=(\w+)/);
      console.log({ text, match });
      if (match) {
        // variables.push(match[1]);
        variables.push({
          text: match[1],
          displayText: `${match[1]} (=${match[2]})`,
        })
      }
    });
    return [...variables, 'this'];
  }

  showAutocomplete(list: string[]) {
    const editor = this.instance;
    const options = {
      closeCharacters: RegExp(/.*/),
      completeSingle: false,
      hint: () => {
        return {
          from: editor.getDoc().getCursor(),
          to: editor.getDoc().getCursor(),
          list,
        }
      }
    };
    editor.showHint(options);
  }

  render() {
    const { note } = this.props;
    if (!this.props.editor) {
      return null;
    }

    if (!this.props.editor.isReady) {
      core.store?.set('editor.isReady', true);
      this.setState({
        value: this.props.note && this.props.note.value,
      })
    }

    let width: number = 50;
    if (!this.props.editor?.isEditing) {
      width = 25;
    }

    return (
      <div className='editor-container' style={{ width: `${width}%`, opacity: width === 25 ? 0 : 1 }}>
        <CodeMirror
          editorDidMount={(editor) => {
            this.instance = editor;
          }}
          onFocus={() => {
            // Used to fix the first focus after clicking on edit
            this.instance && this.instance.refresh && this.instance.refresh();
            this.forceUpdate();
          }}
          onKeyUp={(editor, event) => {
            const { key } = event;
            if (key === '$') {
              this.showAutocomplete(this.listVariables());
            }
            const cursor = this.instance.getDoc().getCursor();
            const line = this.instance.getDoc().getLine(cursor.line);

            if (line.match(/^\$:Task\((T[0-9]+)\)=/)) {
              const match = line.match(/^\$:Task\((T[0-9]+)\)=/);
              const taskId = match[1];
              const from = { line: cursor.line, ch: 0 };
              const to = { line: cursor.line, ch: 9 + taskId.length };
              this.instance.replaceRange(`$${taskId}:Task(${taskId})=`, from, to);
              // to.ch = to.ch + taskId.length - 1;
              // this.instance.getDoc().markText(from, to, {
              //   className: 'markedText',
              // })
            }

            if (line.match(/^\$:Task=/)) {
              const from = {
                line: cursor.line,
                ch: 0,
              }
              const asText = `${id}`;
              const to = {
                line: cursor.line,
                ch: 6 + asText.length * 2 + 3,
              }
              this.instance.replaceRange(`$T${id}:Task(T${id})=`, from, to);
              id = id + 1;
            }
          }}
          onBeforeChange={(editor, data, value) => {
            if (this.props.editor?.isSaving) {
              return;
            }
            this.setState({ value });
            core.store?.set('editor.value', value);
          }}
          className='codemirror-container'
          value={this.state.value}
          options={{
            mode: 'xml',
            theme: 'material',
            lineNumbers: false,
            lineWrapping: true,
            extraKeys: {
              "Ctrl-Q": () => {
                core.store?.set('editor.isEditing', false);
              },
              "Ctrl-S": () => {
                // trigger a save
                if (note) {
                  core.saveNote({ identifier: note.identifier, value: this.state.value, title: note.title });
                } else {
                  console.warn(`Could not save note, note not found. (identifier: ${this.props.editor?.current})`);
                }
              }
            }
          }}
          onChange={(editor, data, value) => {
            setTimeout(() => {

              if (this.props.editor?.justSaved) {
                core.store?.set('editor.justSaved', false);
              }

              const cursor = this.instance.getDoc().getCursor();
              const line = this.instance.getDoc().getLine(cursor.line);
              if (cursor.line === 0) {
                core.store?.set('notes', (notes: any) => {
                  const note = notes && notes.find((note: any) => note.identifier === this.props.editor?.current);
                  if (note) {
                    note.title = line.replace(/^\#+\s+/, '');
                  }
                  return notes;
                })
              }
            }, 100);
          }}
        />
        <div className='editor-footer'>
            {
              this.props.editor?.isEditingIdentifier && <div>
                <input
                  type="text"
                  defaultValue={this.props.note?.identifier}
                  onBlur={(e: any) => {
                    core.store.set('notes', (notes: any) => {
                      return notes.map((note: any) => {
                        if (note.identifier === this.props.editor?.current) {
                          note.identifier = e.target.value;
                        }
                        return note;
                      });
                    })
                    // TODO: Implement me 
                    core.trashNote(this.props.editor?.current);
                    core.store.set('editor.isEditingIdentifier', false);
                    core.store.set('editor.current', e.target.value);
                  }}
                />
              </div>
            }
            {
              !this.props.editor?.isEditingIdentifier && <div
                className='footer-identifier'
                onClick={() => {
                  core.store.set('editor.isEditingIdentifier', (prev: any) => {
                    if (prev === null || prev === undefined) {
                      return true;
                    }
                    return !prev;
                  });
                }}
              >
                <FontAwesomeIcon icon={faIdCard} />
                {this.props.editor?.current}
              </div>
            }
            &nbsp;&nbsp;<b>{note?.title}</b>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
              <span className='keyboard-shortcut'>Ctrl+Q</span> to stop edit
            </div>
            <span className='keyboard-shortcut'>Ctrl+S</span> to save
            {this.props.editor?.isSaving && <FontAwesomeIcon icon={faSpinner} spin color='white' />}
            {!this.props.editor?.isSaving && this.props.editor?.justSaved && <FontAwesomeIcon icon={faCheck} color='green' />}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  let note;
  const current = state.global.editor?.current;
  note = state.global.notes?.find((note: any) => note.identifier === current);
  return {
    editor: state.global.editor,
    note,
    global: state.global,
  }
};

export default connect(mapStateToProps)(CodeMirrorEditor);