import React from 'react';
import ContentEditable from 'react-contenteditable';
import { connect } from 'react-redux';
import '../css/editorv1.css';
import Line from './Line';
import { getCurrentCursorPosition, setCurrentCursorPosition, moveCaretRight, changeTagOfNode, getCaretTopPoint, getCaretPoint, querySelectorUp } from '../utils/editor';
import { v4 as uuid } from 'uuid';
import AEditorModule from 'ui/modules/editor/AEditorModule';
import LinterMod from 'ui/modules/editor/LinterMod';
import MarkdownMod from 'ui/modules/editor/MarkdownMod';
import CursorMod from 'ui/modules/editor/CursorMod';

interface Props { };

const mapStateToProps = (state: any) => ({

})

class EditorV1 extends React.Component<Props, any> {
  contentEditable: any;
  modules: AEditorModule[] = [
    new CursorMod(),
    new LinterMod(),
    new MarkdownMod(),
  ];
  lastContext: any = {};

  constructor(props: Props) {
    super(props);
    this.contentEditable = React.createRef();
    this.state = {
      html: '',
    }
  }

  // For each loaded modules, apply a modification to the current editor dom.
  onDOMUpdate(evt: any, dom: HTMLDivElement) {
    console.log('Before', { dom, text: dom.outerHTML });
    // Context is an object that can be used by modules to read/write/share data with other modules
    // For example, the ParseLines modules will add a list of line references in the context object for
    // other modules to use (instead of calling the function themselves)
    const context = {
      ...this.lastContext,
      event: evt,
    };
    // Sort by priorities
    this.modules.sort((a: any, b: any) => a.priority - b.priority).forEach((mod: AEditorModule) => {
      mod.apply(dom, context);
      console.log({ context });
    });
    this.lastContext = context;
    this.setState({ html: dom.innerHTML });
  }

  forceUpdateDOM = () => {
    const evt = {};
    const dom = document.createElement('div');
    dom.id = 'temporary-editor-dom';
    dom.innerHTML = this.state.html;
    this.onDOMUpdate(evt, dom);
  }

  handleChange = (evt: any) => {
    let html = evt.target.value;
    const nextDOM = document.createElement('div');
    nextDOM.id = 'temporary-editor-dom';
    nextDOM.innerHTML = html;
    this.onDOMUpdate(evt, nextDOM);
  }

  render() {
    return (
      <div className='editor-container'>
        <ContentEditable
          onClick={() => {

          }}
          id='editor'
          className='content-editable'
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
            if (arrows.up || arrows.down || arrows.left || arrows.right) {
              // Restyle even if there's been no change in the EDITOR !
              // instead of applying a new this.state.html
              // apply a different style to the dom directly
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
            if (isRightArrow) {

            }
            if (isDeleteForward) {

            }
            if (isEnter && isInsideCodeBlock) {

            }
          }}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps)(EditorV1);
