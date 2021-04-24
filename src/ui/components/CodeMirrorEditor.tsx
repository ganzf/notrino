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
import { faBars, faCheck, faCogs, faEdit, faHamburger, faIdCard, faKey, faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'design-system';
import { createModuleResolutionCache } from 'typescript';

interface Props {
  editor: {
    current: string,
    justSaved: boolean,
    shouldReload: boolean,
    isEditing: boolean,
    isReady: boolean;
    isSaving: boolean,
    isEditingIdentifier: boolean;
    isMenuOpen: boolean;
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

    if (!this.props.editor.isReady || this.props.editor.shouldReload) {
      core.store?.set('editor.isReady', true);
      core.store?.set('editor.shouldReload', false);
      const value = this.props.note?.unsavedValue || this.props.note?.value;
      this.setState({ value });
    }

    let width: number = 50;
    if (!this.props.editor?.isEditing) {
      width = 25;
    }

    // @ts-ignore
    if (this.props.editor?.shouldFocus) {
      const textarea = document.querySelector('.CodeMirror textarea');
      console.log({ textarea });
      if (textarea) {
        setTimeout(() => {
          // @ts-ignore
          textarea.focus && textarea.focus();
          core.store?.set('editor.shouldFocus', false);
        }, 150);
      }
    }

    return (
      <div className='editor-container' style={{ width: `${width}%`, opacity: width === 25 ? 0 : 1 }}>

        {
          // @ts-ignore
          this.props.editor?.isOptionsOpen && <div className="editor-options-container">
            <div className="editor-options-header">
              <h3>{note?.title}{' > Options'}</h3>
              <div style={{ width: '20%', display: 'flex', justifyContent: 'space-between' }}>
                <Button text="Close" onClick={() => { core.store?.set('editor.isOptionsOpen', false); }} />
                <Button text='Save' disabled={this.state.unsavedIdentifier == null} onClick={() => {
                  core.store.set('notes', (notes: any) => {
                    return notes.map((note: any) => {
                      if (note.identifier === this.props.editor?.current) {
                        note.identifier = this.state.unsavedIdentifier;
                      }
                      return note;
                    });
                  })
                  core.updateNoteIdentifier(this.props.editor.current, this.state.unsavedIdentifier);
                  core.store.set('editor.current', this.state.unsavedIdentifier);
                  this.setState({ unsavedIdentifier: null });
                }} />
              </div>
            </div>
            <div className="editor-option-container">
              <label htmlFor="identifier-input">Identifier</label>
              <input
                id="identifier-input"
                tabIndex={2}
                type="text"
                value={this.state.unsavedIdentifier || note?.identifier}
                onChange={(e) => {
                  this.setState({ unsavedIdentifier: e.target.value });
                }}
              />
            </div>
          </div>
        }

        <CodeMirror
          editorDidMount={(editor) => {
            this.instance = editor;
          }}
          onFocus={() => {
            // Used to fix the first focus after clicking on edit
            this.instance && this.instance.refresh && this.instance.refresh();
            core.store?.set('editor.isMenuOpen', false);
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
            core.store?.set('notes', (notes: any) => {
              return notes && notes.map((note: any) => {
                if (note.identifier === this.props.editor.current) {
                  if (note.value !== value) {
                    note.edited = true;
                    note.unsavedValue = value;
                  } else {
                    if (note.edited) {
                      note.edited = false;
                      note.unsavedValue = undefined;
                    }
                  }
                }
                return note;
              }) || [];
            });
          }}
          className='codemirror-container'
          value={this.state.value}
          options={{
            mode: 'xml',
            theme: 'material',
            lineNumbers: false,
            lineWrapping: true,
            extraKeys: {
              "Ctrl-E": () => {
                core.store?.set('editor.isEditing', false);
              },
              "Ctrl-S": () => {
                // trigger a save
                if (note) {
                  core.saveNote({
                    identifier: note.identifier,
                    value: this.state.value,
                    title: note.title,
                    saveDate: new Date(),
                  });
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
        <div className={`menu ${this.props.editor.isMenuOpen ? 'open' : ''}`}>
          <div className='menu-item' onClick={() => {
            core.store.set('editor.isOptionsOpen', true);
            core.store.set('editor.isMenuOpen', false);
          }}>
            <FontAwesomeIcon icon={faCogs} />
              Options
          </div>
          <div className='menu-item' onClick={async () => {
            if (note) {
              core.store.set('editor.isMenuOpen', false);
              const choice = await core.confirm({
                icon: faTrash,
                title: 'Move to trash',
                message: 'Are you sure you want to trash this note ?',
                choices: [
                  {
                    label: 'Cancel',
                  },
                  {
                    label: 'Confirm',
                  }
                ],
              });
              if (choice === 'Confirm') {
                core.trashNote(note.identifier)
              }
            }
          }}>
            <FontAwesomeIcon icon={faTrash} />
              Move to trash
              </div>
        </div>
        <div className='editor-footer'>
          <div className='toolbar-button' onClick={() => {
            core.store.set('editor.isMenuOpen', (isOpen: boolean) => {
              if (isOpen) {
                return false;
              }
              return true;
            });
          }}>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
                    core.updateNoteIdentifier(this.props.editor.current, e.target.value);
                    core.store.set('editor.isEditingIdentifier', false);
                    core.store.set('editor.current', e.target.value);
                  }}
                />
              </div>
            }

            <div>
              <FontAwesomeIcon icon={faIdCard} />
              {this.props.editor?.current}
            </div>

            &nbsp;&nbsp;<b>{note?.title}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '5px' }}>
              <span className='keyboard-shortcut'>Ctrl+E</span> to stop edit
            </div>
            <span className='keyboard-shortcut'>Ctrl+S</span> to save
            {this.props.editor?.isSaving && <FontAwesomeIcon icon={faSpinner} spin color='white' />}
            {!this.props.editor?.isSaving && this.props.editor?.justSaved && <FontAwesomeIcon icon={faCheck} color='green' />}
          </div>
        </div>
      </div >
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