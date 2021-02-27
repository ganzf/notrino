import React from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import './editorv2.css';

class EditorV2 extends React.Component {
  editor: any;

  componentDidMount() {
    this.editor = new EditorJS({ 
      holder: 'editor-holder',
      onChange: (api: any) => { 
        console.log({ api });
      },
      tools: {
        // @ts-ignore
        header: Header,
      }
    });
    // @ts-ignore;
    window.editor = this.editor;
  }

  render() {
    return (
      <div id='editor-holder'></div>
    )
  }
}

export default EditorV2;