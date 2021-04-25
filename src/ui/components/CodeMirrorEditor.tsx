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
import parser from 'ui/modules/parser';

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
  global: any;
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

  showAutocomplete(list: string[] | any[], word: string = '') {
    const editor = this.instance;
    let force = false;
    let hide = false;
    let nextList = list.filter((l) => {
      if (typeof (l) === 'string') {
        return l.startsWith(word);
      }
      // l.text = l.text.replace(new RegExp(`^${word}`), '');
      // l.word = word;
      l.originalText = l.text;
      return word === '$' || (l.displayText && l.displayText.startsWith(word));
    });
    if (nextList.length === 0) {
      hide = true;
    }

    if (nextList.length === 1 && nextList[0].isScope) {
      // example: $passwords
      console.log({ word, first: nextList[0] });
      if (word.endsWith('.')) {
        nextList = ['passwords.1', 'passwords.2'];
      }
    }

    const current = editor.state.completionActive?.data?.list;
    if (current?.length !== nextList.length) {
      force = true;
    }

    const options = {
      closeCharacters: RegExp(/\s/),
      completeSingle: false,
      hint: () => {
        const from = editor.getDoc().getCursor();
        let updatedList = [];
        if (nextList.length === 1 && nextList[0].isScope) {
          // example: $passwords
          const cursor = editor.getCursor();
          const wordPos = editor.findWordAt(cursor);
          const currentWord = editor.getRange(wordPos.anchor, wordPos.head);

          if (nextList.length === 1 && currentWord === nextList[0].originalText) {
            console.log('Updating...');

            // get the list of variables in the scope
            const note: any = this.props.global?.notes?.find((note: any) => note.identifier === currentWord);
            if (note) {
              const parsed = parser.parse(note.unsavedValue || note.value);
              if (parsed.variables) {
                const scopedVariables = Object.values(parsed.variables.vars)
                updatedList = scopedVariables.map((v) => ({ text: `.${v.name}`, displayText: `${v.name} => ${v.label}`}));
              }
            }
          }
        }
        if (updatedList.length === 0) {
          updatedList = nextList.map((item) => {
            const cursor = editor.getCursor();
            const wordPos = editor.findWordAt(cursor);
            const currentWord = editor.getRange(wordPos.anchor, wordPos.head);

            if (nextList.length === 1 && currentWord === item.originalText) {
              editor.showHint({});
              return null;
            }
            item.text = item.originalText.replace(new RegExp(`^${currentWord}`), '');
            return item;
          })
        }

        // Compare the data from the current completion object with the new list
        return {
          from,
          to: editor.getDoc().getCursor(),
          // Need to update the completion objects with the current word value
          list: updatedList,
        }
      }
    };
    if (hide && editor.state.completionActive) {
      editor.showHint({});
    }
    if (!editor.state.completionActive || force) {
      editor.showHint(options);
    }
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
      this.updateNote(value);
    }

    let width: number = 50;
    if (!this.props.editor?.isEditing) {
      width = 25;
    }

    // @ts-ignore
    if (this.props.editor?.shouldFocus) {
      const textarea = document.querySelector('.CodeMirror textarea');
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
            const cursor = this.instance.getDoc().getCursor();
            const line = this.instance.getDoc().getLine(cursor.line);

            const isMove = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key);

            // parse line + cursor to know what to show in autocomplete
            const wordPos = this.instance.findWordAt(cursor);
            const word = this.instance.getRange(wordPos.anchor, wordPos.head);
            let withPrefix: any;
            try {
              withPrefix = this.instance.getRange({ line: wordPos.anchor.line, ch: wordPos.anchor.ch - 1 }, wordPos.head);
              // console.log({ withPrefix, word });
              if (withPrefix === ' $') {
                withPrefix = '$';
              }
            } catch (e) {

            }
            if (!isMove && withPrefix && withPrefix.startsWith('$')) {
              const parsed = parser.parse(this.state.value);
              if (parsed.variables) {
                const variables = Object.values(parsed.variables.vars);
                const list = variables.map(v => ({ text: `${v.name}`, displayText: `${v.name} => ${v.getStringValue()}` }));
                const notes = this.props.global.notes.map((n: any) => ({ text: n.identifier, displayText: n.identifier, isScope: true }));
                this.showAutocomplete(list.concat(notes), word);
              }
            }

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
            this.updateNote(value);
          }}
          className='codemirror-container'
          value={this.state.value}
          options={{
            mode: 'xml',
            theme: 'material',
            lineNumbers: false,
            lineWrapping: true,
            extraKeys: {
              "Shift-Q": () => {
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
              <span className='keyboard-shortcut'>Shift+Q</span> to stop edit
            </div>
            <span className='keyboard-shortcut'>Ctrl+S</span> to save
            {this.props.editor?.isSaving && <FontAwesomeIcon icon={faSpinner} spin color='white' />}
            {!this.props.editor?.isSaving && this.props.editor?.justSaved && <FontAwesomeIcon icon={faCheck} color='green' />}
          </div>
        </div>
      </div >
    )
  }

  updateNote(value: string) {
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