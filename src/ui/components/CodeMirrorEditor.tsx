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
import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Props {
  editor: {
    current: string,
    isSaving: boolean,
    justSaved: boolean,
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
    return (
      <div className='editor-container'>
        <CodeMirror
          editorDidMount={(editor) => {
            this.instance = editor;
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
          }}
          className='codemirror-container'
          value={this.state.value}
          options={{
            mode: 'xml',
            theme: 'material',
            lineNumbers: false,
            lineWrapping: true,
            extraKeys: {
              "Ctrl-S": () => { 
                // core.store?.set('editor.isSaving', true);
                // trigger a save
                core.saveNote({ identifier: note.identifier, value: this.state.value });
                setTimeout(() => {
                  // on save confirmed
                  // core.store?.set('editor.isSaving', false);
                  // core.store?.set('editor.justSaved', true);
                }, 5000);
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
                    note.title = line;  
                  }
                  return notes;
                })
              }
            }, 100);
          }}
        />
        <div className='editor-footer'>
          <div>
            [{this.props.editor?.current}]&nbsp;&nbsp;<b>{note?.title}</b>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            { this.props.editor?.isSaving && <FontAwesomeIcon icon={faSpinner} spin color='white' /> }
            { this.props.editor?.justSaved && <FontAwesomeIcon icon={faCheck} color='green' /> }
            <span className='keyboard-shortcut'>CTRL+S</span> to save
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