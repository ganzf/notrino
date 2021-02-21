import { title } from 'process';
import React from 'react';
import ReactDOM from 'react-dom';
import ContentEditable from 'react-contenteditable';
import { start } from 'repl';
import { getCurrentCursorPosition, setCurrentCursorPosition, moveCaretRight, changeTagOfNode, getCaretTopPoint, getCaretPoint, querySelectorUp } from '../utils/editor';
import './BasicEditor.css';
import { v4 as uuid } from 'uuid';
import mousetrap from 'mousetrap';
import { connect, Provider } from 'react-redux';
import { timeStamp } from 'console';
import { Button } from 'design-system';
import InlineAliasDisplay from './InlineAliasDisplay';
import core from 'ui';
import ReactDOMServer from 'react-dom/server';

/* import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import { Controlled as CodeMirror } from 'react-codemirror2'
// scss
import 'codemirror/addon/hint/show-hint.css';
require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/javascript-hint'); */

interface Props {
  editor: any;
}
interface State {
  html: any;
  caret: any;
  noteName?: string;
  title?: string;
}

class BasicEditor extends React.Component<Props, State> {
  contentEditable: any;
  variables: any = {};
  parserThreadStop: boolean = false;
  editingVar: boolean = false;
  varsCreated: boolean = true;
  titles: any = {};

  defaultHtml: string;
  minHTML = `<div><br></div>`;
  lastInput: any;
  lastKnownCursorPosition?: {
    position: number; // Should remove the # from any level title
    node: any; parentNode: any;
  };

  reactVDOM: Element = document.createElement('div');
  reactVirtualContainers: Element[] = [];

  constructor(props: Props) {
    super(props);
    this.contentEditable = React.createRef();
    this.defaultHtml = this.minHTML;
    this.state = { html: this.defaultHtml, caret: { x: null, y: null, count: 0 } };
    // this.variables.notename = '';
    // @ts-ignore
    window.vars = this.variables;
    // @ts-ignore
    window.addEventListener('noteLoaded', (e: any) => {
      if (e.html) {
        this.setState({ html: e.html }, () => {
          this.applyDisplay();
        });
      } else {
        this.setState({ html: this.minHTML });
      }
    }, false);
  };

  componentDidMount() {
    // this.parserThread();
    // this.parse();
    // this.applyMarkdown();
    mousetrap(document.getElementById('editor')!).bind('ctrl+s', async () => {
      if (this.props.editor.name && this.props.editor.title) {
        const name = `note.${this.props.editor.name}`;
        const isNameAvailable = localStorage.getItem(`note.${this.props.editor.name}`) === undefined;
        const existingNotes = (localStorage.getItem('noteNames') && JSON.parse(localStorage.getItem('noteNames')!)) || [];
        if (!existingNotes.includes(name)) {
          existingNotes.push(name);
        }
        if (isNameAvailable) {
          localStorage.setItem(name, JSON.stringify({
            name: this.props.editor.name,
            title: this.props.editor.title,
            tags: this.props.editor.tags,
            html: this.state.html,
          }));
        } else {
          localStorage.setItem(name, JSON.stringify({
            name: this.props.editor.name,
            title: this.props.editor.title,
            tags: this.props.editor.tags,
            html: this.state.html,
          }));
        }
        localStorage.setItem('noteNames', JSON.stringify(existingNotes));
      }
    });
    // TODO: Get note name from props
    // if (localStorage.getItem('note')) {
    //  this.setState({ html: localStorage.getItem('note') });
    // }
  }

  fakeDom: any;
  applyMarkdown = () => {
    if (!this.fakeDom) {
      this.fakeDom = document.createElement('div');
      this.fakeDom.className = "fake-editor";
    }
    const { html } = this.state;
    this.fakeDom.innerHTML = html;
    const divs = this.fakeDom.querySelectorAll('div');
    divs.forEach((div: HTMLHtmlElement) => {
      const inner = div.innerHTML;
      const isTitleWithLabel = new RegExp(/\#+ [a-zA-Z]+/).exec(inner);
      if (inner.startsWith('#') && isTitleWithLabel) {
        let titleType = 'h1';
        if (inner.startsWith('####')) {
          titleType = 'h4';
        } else if (inner.startsWith('###')) {
          titleType = 'h3';
        } else if (inner.startsWith('##')) {
          titleType = 'h2';
        }
        // Should remove the # from any level title
        div.innerHTML = div.innerHTML.replace(/^\#{1,4} /, '');
        div.innerHTML = `<${titleType}>` + div.innerHTML + `</${titleType}>`;
      }
    })
    console.log('HTML CHANGED', { fakeDom: this.fakeDom });
    this.setState({ html: this.fakeDom.innerHTML });
  }

  applyDisplay = () => {
    return;
    if (!this.fakeDom) {
      this.fakeDom = document.createElement('div');
      this.fakeDom.className = "fake-editor";
    }
    const { html } = this.state;
    this.fakeDom.innerHTML = html;
    const inlineVars = this.fakeDom.querySelectorAll('.inline-var');
    if (inlineVars) {
      inlineVars.forEach((inlineVar: HTMLHtmlElement) => {
        const text = inlineVar.innerText;
        if (!text) {
          return;
        }
        const split = text.split(':');
        let faceValue = text;
        let type;
        if (split && split.length > 1) {
          type = split[0];
          if (type === 'password') {
            faceValue = '***************';
          }
          if (type === 'boolean') {
            faceValue = '<span class="boolean-value ' + split[1] + '">' + split[1] + '</span>';
          }
          if (type === 'people') {
            faceValue = '<div class="people-value"><img src="https://www.flaticon.com/svg/vstatic/svg/265/265674.svg?token=exp=1611971571~hmac=53c0274f4ddecfee8d9862bb02cbc0f6" height="20" />' + split[1] + '</span>';
          }
        }
        inlineVar.innerHTML = faceValue;
      })
      this.setState({ html: this.fakeDom.innerHTML });
    }
  }

  componentWillUnmount() {
    this.parserThreadStop = true;
  }

  parse = () => {
    // Replace ${var} with object.
    if (this.varsCreated) {
      console.log('UPDATING HTML');
      this.setState((current: State) => {
        const next = current.html.replace(/\$\{([^}]*)\}/, (a: any, b: any) => {
          const id = `${b.replace('/\s/', '_')}`;
          this.variables[id] = {

          }
          return `<span contentEditable="false" class="inline-var" id="var-${id}">${b}</span>`;
        });
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
  }

  parserThread = async () => {
    console.log('PARSER THREAD START');

    const sleep = (ms: number) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    while (!this.parserThreadStop) {
      this.parse();
      await sleep(5000);
    }
  }

  updateCaretInformation = () => {
    const caret: any = {}
    const sel: any = window.getSelection();
    caret.count = getCurrentCursorPosition('editor').position;

    const focusNode = sel?.focusNode;
    const nearestLineTxt = querySelectorUp(focusNode, (node: any) => {
      if (node?.className?.includes('line-txt')) {
        return true;
      }
      return false;
    })
    if (nearestLineTxt) {
      // @ts-ignore
      const rect = nearestLineTxt.getBoundingClientRect();
      caret.x = rect.right;
      caret.y = rect.bottom;
    }

    this.setState({ caret });
    return;

    let refNode = sel?.focusNode;
    let rect = sel?.focusNode.getBoundingClientRect ? sel?.focusNode.getBoundingClientRect() : null;
    if (!rect) {
      refNode = sel?.focusNode?.previousSibling;
      rect = sel?.focusNode?.previousSibling?.getBoundingClientRect ? sel?.focusNode?.previousSibling?.getBoundingClientRect() : null;
      if (!rect) {
        refNode = sel?.focusNode?.parentNode;
        rect = sel?.focusNode?.parentNode.getBoundingClientRect ? sel?.focusNode?.parentNode.getBoundingClientRect() : null;
      }
    }
    const styles = getComputedStyle(refNode);
    const lineheight: any = styles.lineHeight === 'normal' ? 1.2 : 1.2;
    const fontSize: any = parseInt(styles.fontSize, 10);
    console.log({ fontSize, lineheight, line: styles.lineHeight, range: sel?.getRangeAt(0) });
    caret.x = rect && rect.x + sel?.focusOffset * ((fontSize - 1) / 2);
    if (caret.x > 650) {
      caret.x = 650;
    }
    caret.y = rect.y;
    this.setState({ caret });
    console.log({ sel, offset: sel?.focusOffset });

  }

  wrapTextNodesInSpan = () => {
    this.fakeDom.innerHTML = this.state.html;
    const lines = this.getLines(this.fakeDom);
    let changed = false;
    lines.forEach((line: ChildNode) => {
      line.childNodes.forEach((node: ChildNode) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
          const span = document.createElement('span');
          changed = true;
          span.innerHTML = node.textContent;
          node.replaceWith(span);
        }
      });
    });
    if (changed) {
      this.setState({ html: this.fakeDom.innerHTML });
    }
  }

  checkUnterminatedLines = () => {
    this.fakeDom.innerHTML = this.state.html;
    const lines = this.getLines(this.fakeDom);
    let changed = false;
    lines.forEach((line: ChildNode) => {
      if (line.childNodes[line.childNodes.length - 1].nodeType !== Node.TEXT_NODE) {
        const last = line.childNodes[line.childNodes.length - 1] as Element;
        const lastIsSpan = last && last.tagName === 'SPAN';
        if (lastIsSpan) {
          if (last.innerHTML.length === 0) {
            last.innerHTML = '<br>';
            changed = true;
          }
        }
      }
    });
    if (changed) {
      this.setState({ html: this.fakeDom.innerHTML });
    }
  }

  handleChange = (evt: any) => {
    // @ts-ignore
    let copy = evt.target.value;
    const caret: any = {};
    caret.count = getCurrentCursorPosition('editor').position;
    const sel = window.getSelection();
    const varReg = new RegExp(/\$\{([^}]*)\}/);
    const inlineCodeReg = new RegExp(/\`([^`<>]+)\`/);
    const startMultilineCodeReg = new RegExp(/\`\`\`/);
    const tmpDom = document.createElement('html');
    tmpDom.innerHTML = this.state.html;
    let cursorChange: number;
    // Never have an empty editor
    if (copy.length === 0) {
      copy = this.minHTML;
    }

    // Add caret correction when editing inline code
    let inlineMatch = inlineCodeReg.exec(copy);
    if (inlineMatch && this.lastInput !== '`') {
      copy = copy.replace(inlineMatch[0], `<code>${inlineMatch[1]}</code>`);
      cursorChange = 1;
    }

    let multilineMatch = startMultilineCodeReg.exec(copy);
    if (multilineMatch) {
      copy = copy.replace(multilineMatch[0], '<pre><code>&nbsp;</code></pre>')
    }

    let openingVarReg = new RegExp(/\s+\$\{/gi);
    let openingVarMatch = openingVarReg.exec(copy);
    if (openingVarMatch) {
      // remove caret anchor in html before placing it here.
      // copy = copy.substr(0, openingVarMatch.index) + `&nbsp;<span id="caret-anchor"></span>` + copy.substr(openingVarMatch.index + 1, copy.length - openingVarMatch.index + 1);
    }

    let match = varReg.exec(copy);
    if (match && this.lastInput !== '}') {
      const varName = match[1];
      if (!Object.keys(this.variables).includes(varName)) {
        this.variables[varName] = '';
        let faceValue = match[1];
        // Generate a random unique identifier
        // const uuid = uuid();
        // ${number a = 12} would be nice
        // Are unnamed variables allowed ?
        // Can you for example, write ${mdr} => type is default to string, value is mdr and there is no name.
        // What can you do with this ? not much..
        // You can at least write ${laugh=mdr} => name is laugh, value is mdr. and the focus should be on mdr

        const name = match[1].split('=')[0];
        const id = `var-${match[1].replaceAll(/\s+/g, '_')}`;
        faceValue = faceValue.replace(`${name}=`, '');
        // copy = copy.replace(match[0], `<div id="${id}"></div>`);

        // ! A timeout is required for mounting the react component. No idea why.
        setTimeout(() => {
          const container = document.getElementById(id);
          if (container) {
            let Component: any;
            let props: any = {};
            if (match && match[1].includes(':button=')) {
              Component = Button;
              // Props are not necessary, because components can connect to the store.
              // The container id is MANDATORY though, for finding the right data to display
              props.text = "Hello World from react";
              props.onClick = () => {
                console.log('Coucou');
              }
            }
            if (Component) {
              // ReactDOM.render(<Component {...props} provider={} />, container);
            }
          }
        }, 10);

        this.varsCreated = true;
        cursorChange = 2;
      }
    } else {
      this.varsCreated = false;
    }

    // Prevent emtpy editor
    // const htmlDom = document.createElement('html');
    /*     htmlDom.innerHTML = copy;
        if (htmlDom.querySelectorAll('.line-txt').length === 0) {
          copy = this.defaultHtml;
        } */
    this.setState({ html: copy, caret }, () => {
      this.applyMarkdown();
      this.applyDisplay();
      this.applyAliases();
      this.wrapTextNodesInSpan();
      // this.checkUnterminatedLines();
      if (cursorChange) {
        // When creating a var, you remove $, { and } characters. So we place the caret back to the "right"
        // position
        setCurrentCursorPosition(this.lastKnownCursorPosition!.position - cursorChange);
      }
    });
  };

  getLines = (editor: HTMLHtmlElement) => {
    return editor?.childNodes;
  }

  listAliases = (editor: HTMLHtmlElement) => {
    const varDefinitionReg = new RegExp(/^(\$?[a-zA-Z_]+)=(.*)$/);
    const lines = this.getLines(editor);
    const list: any[] = [];
    lines?.forEach((line: ChildNode, linenbr: number) => {
      const el: HTMLHtmlElement = line as HTMLHtmlElement;
      if (el.className.includes(' alias-definition')) {
        el.className = el.className.replace(' alias-definition', '');
      }

      const content = line.childNodes[0] as Element;
      console.log({ content });
      if (content && content.tagName === 'SPAN') {
        const text = (line as HTMLHtmlElement).innerText.replace(/(\r\n|\n|\r)/gm, " ").trim()
        console.log({ text });
        if (text) {
          const match = varDefinitionReg.exec(text);
          if (match) {
            // @ts-ignore
            if (!line.className.includes(' alias-definition')) {
              (line as HTMLHtmlElement).className += ' alias-definition';
            }
            const name = match[1];
            const value = match[2]
            list.push({ linenbr, name, value, line, content });
            core.store?.set('locals.' + name, value);
          }
        }
      }
    });
    console.log({ definitions: list });
    return list;
  }

  applyAliases = () => {
    if (!this.fakeDom) {
      this.fakeDom = document.createElement('div');
      this.fakeDom.className = "fake-editor";
    }
    const { html } = this.state;
    this.fakeDom.innerHTML = html;
    const aliases = this.listAliases(this.fakeDom);
    const lines = this.getLines(this.fakeDom);
    let cursorChange: number;
    lines?.forEach((line: ChildNode, linenbr: number) => {
      // @ts-ignore
      if (line && line.innerHTML) {
        const html = line as HTMLHtmlElement;
        let htmlStr = html.innerHTML;

        // ! For each alias, look for alias.name in htmlStr and replace with a variable container
        aliases.forEach((alias: any) => {
          // Il faudrait checker alias.name non pas dans htmlStr, mais plutot dans les textNode qui ne sont pas des
          // elements react. Ni d'ailleurs, dans les balises HTML. Donc a voir, peut etre tester dans html.innerText ?
          if (linenbr > alias.linenbr && htmlStr.includes(alias.name)) {
            const element = document.createElement('div');
            element.innerHTML = htmlStr;
            // For each node in the line (it can already contain variable containers, or just text)
            element.childNodes.forEach((child: ChildNode) => {
              // IF the node is text and text is not empty
              const isSpan = (child as Element).tagName === 'SPAN';
              const hasContent = isSpan && (child as Element).innerHTML.length > 0;
              if (hasContent) {
                const content = (child as Element).innerHTML;
                // Generate array containing text, split by alias.name occurences (keeping alias.name inside the array)
                // \u200b is a whitespace character
                const split = content.split(new RegExp(`(${alias.name})`, "g"));
                const nodes = split.map((text: string, index: number) => {
                  if (text === alias.name) {
                    const variableContainer = document.createElement('div');
                    variableContainer.id = uuid();
                    variableContainer.innerHTML = "<reactplaceholder>" + alias.name + "</reactplaceholder>&nbsp;";
                    variableContainer.className = `alias alias-${alias.name}`;
                    document.addEventListener("re-render-" + variableContainer.id, (renderEvent: any) => {
                      console.log('React parent component was re-rendered');
                      const { html } = renderEvent.detail;
                      const el = document.getElementById(variableContainer.id);
                      if (el) {
                        // Pas possible, il faut quand meme update le this.state.html non ?
                        el.innerHTML = html;
                        // Mais si on update dans un DOM qui parse le this.state.html,
                        // puis qu'on serialize en faisant this.state.html = this.fakeDom.innerHTML
                        // ca devrait passer
                      }
                    });
                    // variableContainer.contentEditable = "false";
                    const diff = alias.name.length - alias.value.length;
                    // cursorChange = diff + 1;
                    return variableContainer;
                  } else {
                    const span = document.createElement('span');
                    span.innerHTML = text;
                    return span;
                  }
                })

                // nodes.push(document.createTextNode("\u200b"));


                // replace itself with nodes 0,
                // then adds all the nodes as sibling
                let i = nodes.length - 1;
                while (i >= 0) {
                  child.after(nodes[i])
                  i -= 1;
                }
                child.remove();
              }
            })
            htmlStr = element.innerHTML;
          }
        })
        setTimeout(() => {
          aliases.forEach((alias: any) => {
            const containers = document.querySelectorAll(`.alias-${alias.name}`);
            if (containers) {
              containers.forEach((container: Element) => {
                // the container has not been filled with a component yet
                // console.log('Candidate for mounting alias component', { container, str: container.innerHTML, isEmpty: container.innerHTML === '' })
                console.log({ container, inner: container.innerHTML });

                if (container.innerHTML.includes('reactplaceholder')) {
                  const rect = container.getBoundingClientRect();


                  console.log('Detected a react placeholder with id', container.id );
                  let Component: any;
                  let props: any = {};
                  Component = InlineAliasDisplay;
                  props.alias = alias;
                  const uid = container.id;
                  props.uuid = uid;
                  props.key = uid;
                  props.rect = rect;
                  if (Component) {
                    const ContentElement = React.createElement(Component, props);
                    const ProviderElement = React.createElement(Provider, { store: core.store!!.getProvider() }, ContentElement);

                    // React can keep track of a react component mounted to a "fake" or "virtual" dom element.
                    // A virtual of fake dom element is one created with document.createElement, not related to the root tree
                    // of the current webpage.
                    // Therefore, all of our react components linked to a div in the editor DOM are contained
                    // in other divs not related to the application DOM tree.
                    // Let's test onClick functions.
                    const virtualContainer = this.reactVirtualContainers.find((el: Element) => el.id === props.uuid);
                    if (virtualContainer) {
                      ReactDOM.render(ProviderElement, virtualContainer);

                    } else {
                      const newVirtualContainer = document.createElement('div');
                      newVirtualContainer.id = props.uuid;
                      const editorReactRoot = document.getElementById('editor-react-root');
                      editorReactRoot?.appendChild(newVirtualContainer);
                      ReactDOM.render(ProviderElement, newVirtualContainer);
                      this.reactVirtualContainers.push(newVirtualContainer);
                    }


                    // const componentAsString = ReactDOMServer.renderToString(ProviderElement);
                    // console.log({ componentAsString });
                    console.log('MOUTING A INLINEALIASDISPLAY for ', { props, container });
                }
              }

                if (container.innerHTML === '') {
                  let Component: any;
                  let props: any = {};
                  Component = InlineAliasDisplay;
                  props.alias = alias;
                  const uid = container.id;
                  props.uuid = uid;
                  props.key = uid;
                  if (Component) {
                    const ContentElement = React.createElement(Component, props);
                    const ProviderElement = React.createElement(Provider, { store: core.store!!.getProvider() }, ContentElement);
                    // ReactDOM.render(<Provider store={core.store!!.getProvider()}><Component key={uid} {...props} /></Provider>, container);
                    ReactDOM.render(ProviderElement, this.reactVDOM);

                    // const componentAsString = ReactDOMServer.renderToString(ProviderElement);
                    // console.log({ componentAsString });
                    console.log('MOUTING A INLINEALIASDISPLAY for ', { props, container });
                  }
                }
              });
            }
          })
          this.checkUnterminatedLines();
          /* if (cursorChange) {
            setCurrentCursorPosition(this.lastKnownCursorPosition!.position - cursorChange);
          } */
        }, 10);
        html.innerHTML = htmlStr;
      }
    })
    this.setState({ html: this.fakeDom.innerHTML });
  }

  render = () => {
    /*  // @ts-ignore
     return <div style={{ width: '100%' }}><CodeMirror
     // @ts-ignore
       value={this.state.value}
       options={{
         extraKeys: {'Ctrl-Space': 'autocomplete'},
         mode: {name: 'javascript', globalVars: true},
         theme: 'material',
         lineNumbers: true
       }}
       onBeforeChange={(editor: any, data: any, value: any ) => {
         // @ts-ignore
         this.setState({ value });
       }}
       onChange={(editor: any, data: any, value: any) => {
         // @ts-ignore
         this.setState({ value });
       }}
       editorDidMount={(editor: any) => {
         // @ts-ignore
         window.editor = editor;
       }}
     /></div>; */

    const outline: any = [];
    {
      document.getElementById('editor')?.querySelectorAll('h1').forEach((title: any) => {
        outline.push(<p>{title.innerText.toString()}</p>);
      })
    }

    const fake = document.createElement('div');
    fake.innerHTML = this.state.html;
    const lines: any = [];
    fake.querySelectorAll('div').forEach((i) => {
      lines.push(`${i.outerHTML}`);
    });

    const caretAnchor = document.getElementById('caret-anchor');
    let caretAbsolutePosition;
    if (caretAnchor) {
      caretAbsolutePosition = caretAnchor.getBoundingClientRect();
      // console.log({ caretAbsolutePosition });
    }

    return (
      <>
        <div id="editor-react-root"></div>
        {/*         { false && <div className='caret-indicator' style={{ left: this.state.caret.x, top: `${this.state.caret.y}px` }}>
          autocomplete here
        </div> }
        <div className="variables-inspector">
          <b>Inspector</b>
          <br />Count: {this.state.caret.count}
          <br />X: {this.state.caret.x}
          <br />Y: {this.state.caret.y}
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
        </div> */}
        <ContentEditable
          onClick={() => {

          }}
          id='editor'
          className='basic-editor-container'
          innerRef={this.contentEditable}
          html={this.state.html} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          tagName='div' // Use a custom HTML tag (uses a div by default)
          onKeyUp={(evt: any) => {
            const arrows = {
              up: evt.nativeEvent?.code === 'ArrowUp',
              down: evt.nativeEvent?.code === 'ArrowDown',
              left: evt.nativeEvent?.code === 'ArrowLeft',
              right: evt.nativeEvent?.code === 'ArrowRight',
            }
            // console.log(getCurrentCursorPosition('editor'));
            this.lastKnownCursorPosition = getCurrentCursorPosition('editor');
            if (arrows.left || arrows.right || arrows.up || arrows.down) {
              // this.updateCaretInformation();
            }
          }}
          onKeyDown={(evt: any) => {
            const isDeleteForward = evt.nativeEvent?.code === 'Delete';
            const isSpace = evt.nativeEvent?.code === 'Space';
            const isRightArrow = evt.nativeEvent?.code === 'ArrowRight';
            const isEnter = evt.nativeEvent?.code === 'Enter';
            const isInsideCodeBlock = window.getSelection()?.focusNode?.previousSibling?.firstChild?.nodeName === 'PRE';
            const isInsideVariable = querySelectorUp(window.getSelection()!.focusNode!, (node) => {
              return node.className?.includes('inline-var');
            })
            // console.log({ evt });
            this.lastInput = evt.key;
            if (isRightArrow) {

            }
            if (isDeleteForward) {
              /*                   console.log('Trying to prevent default delete');
                                evt.nativeEvent.preventDefault();
                                evt.nativeEvent.stopPropagation(); */
            }

            if (isEnter && isInsideCodeBlock) {
              // console.log('Pressed enter in code block');
              evt.nativeEvent.preventDefault();
              evt.nativeEvent.stopPropagation();
              // this.addLineInCodeBlock();
            }
          }}
        />
        {/*         <div className="debug-html-editor">
          {this.state.html}
        </div> */}
      </>
    )
  };
}

const mapState = (state: any) => ({
  editor: state.global.editor,
})

export default connect(mapState)(BasicEditor);