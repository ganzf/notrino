import React from 'react';
import ContentEditable from 'react-contenteditable';
import { getCurrentCursorPosition, setCurrentCursorPosition, moveCaretRight } from '../utils/editor';
import './BasicEditor.css';

interface Props { }
interface State {
  html: any;
}

class BasicEditor extends React.Component<Props, State> {
  contentEditable: any;
  variables: any = {};
  parserThreadStop: boolean = false;
  editingVar: boolean = false;
  varsCreated: boolean = true;
  titles: any = {};

  constructor(props: Props) {
    super(props);
    this.contentEditable = React.createRef();
    this.state = { html: "<div># Notename </div>" };
    // this.variables.notename = '';
    // @ts-ignore
    window.vars = this.variables;
  };

  componentDidMount() {
    this.parserThread();
  }

  componentWillUnmount() {
    this.parserThreadStop = true;
  }

  parserThread = async () => {
    console.log('PARSER THREAD START');

    const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    while (!this.parserThreadStop) {
      // Replace ${var} with object.
      if (this.varsCreated) {
        console.log('UPDATING HTML');
        this.setState((current: State) => {
          console.log('replacing var in html...');
          const next = current.html.replace(/\$\{([^}]*)\}/, (a: any, b: any) => `<span class="inline-var" id="var-${b.replace(/\s/, '_')}">${b}</span>`);
          return {
            ...current,
            html: next,
          }
        }, () => {
          this.varsCreated = false;
        });
      }

      if (!this.editingVar) {
        console.log('CHANGING VARS HTML');
        // Change var values if they changed
        const varNodes = document.querySelectorAll('.inline-var');
        varNodes.forEach((node: any) => {
          const varName = node.id.replace('var-', '');
          if (node.innerText !== this.variables[varName] && this.variables[varName] !== '') {
            node.innerText = this.variables[varName];
          }
        });
      }

      // Apply basic markdown styling line by line
      const lines = document.getElementById('editor')?.childNodes;
      lines?.forEach((line: ChildNode, linenbr: number) => {
        const isTitle = line.textContent?.startsWith('#');
        const shouldReplaceTitle = isTitle && line.nodeName !== 'H1';
        console.log('Line', { line, isTitle, shouldReplaceTitle });
        if (shouldReplaceTitle) {
          const titleElement = document.createElement('h1');
          let i = 0;
          while (i < line.childNodes.length) {
            const child = line.childNodes.item(i);
            console.log('Appending child to title', { child });
            if (i === 0 && child.nodeType === Node.TEXT_NODE && child.textContent) {
              child.textContent = child.textContent.toString().replace(/^\#+ ?/, '');
              titleElement.appendChild(child);
            }
            i += 1;
          }
          console.log('New elem', { titleElement });
          line.replaceWith(titleElement);
        }
      });
      await sleep(5000);
    }
  }

  handleChange = (evt: any) => {
    // @ts-ignore
    let copy = evt.target.value;

    const varReg = new RegExp(/\$\{([^}]*)\}/);
    let match = varReg.exec(copy);
    if (match) {
      const varName = match[1];
      if (!Object.keys(this.variables).includes(varName)) {
        this.variables[varName] = '';
        this.varsCreated = true;
      }
    } else {
      this.varsCreated = false;
    }
    this.setState({ html: copy });
  };

  render = () => {
    console.log('Rendering...');
    const outline: any = [];
    {
      document.getElementById('editor')?.querySelectorAll('h1').forEach((title: any) => {
        console.log({ title });
        outline.push(<p>{title.innerText.toString()}</p>);
      })
    }

    return (
      <>
        <div className="variables-inspector">
          <b>Inspector</b>
          {Object.keys(this.variables).map((varName: string) => {
            return <div key={varName} className='variable-edit-line'>
              <b>
                {varName}
              </b>
              <input
                id={`variable-edit-line-${varName}`}
                type="text"
                onFocus={() => { this.editingVar = true; }}
                onBlur={() => {
                  this.editingVar = false;
                  // @ts-ignore
                  this.variables[varName] = document.querySelector(`#variable-edit-line-${varName}`)?.value;
                }}
              />
            </div>
          })}
        </div>

        <div className='note-outline'>
          <b>Outline</b>
          {outline}
        </div>
        <ContentEditable
          onClick={() => {
            const focus = getCurrentCursorPosition('editor');
            const parentIsVar = focus.parentNode.className.includes('inline-var');
            if (parentIsVar) {
              moveCaretRight();
            }
          }}
          id='editor'
          className='basic-editor-container'
          innerRef={this.contentEditable}
          html={this.state.html} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          tagName='div' // Use a custom HTML tag (uses a div by default)
          onKeyDown={(evt: any) => {
            const isDeleteForward = evt.nativeEvent?.code === 'Delete';
            const isSpace = evt.nativeEvent?.code === 'Space';
            const isRightArrow = evt.nativeEvent?.code === 'ArrowRight';
            if (isRightArrow) {
              moveCaretRight();
            }
            if (isDeleteForward) {
              /*                   console.log('Trying to prevent default delete');
                                evt.nativeEvent.preventDefault();
                                evt.nativeEvent.stopPropagation(); */
            }
          }}
        />
      </>
    )
  };
}

export default BasicEditor;