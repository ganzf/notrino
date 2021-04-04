import classnames from 'classnames';
import Mousetrap from 'mousetrap';
import React from 'react';
import ContentEditable from 'react-contenteditable';
import ReactJson from 'react-json-view';
import core from 'ui';
import NoteString from './NoteTypes/NoteString';
import TaskReference from './NoteTypes/TaskReference';
import './SplitEditor.css';

class SplitEditor extends React.Component<any, any> {
  contentEditable: any;
  rightPanel: any;

  constructor(props: any) {
    super(props);
    this.contentEditable = React.createRef();
    this.rightPanel = React.createRef();
    this.state = {
      html: '<div><br/></div>',
      note: {},
      display: 'note',
    };
  }

  componentDidMount() {
    // IT WORKS ! 
    Mousetrap(document.getElementById('editor')!).bind('shift+tab', (e: any) => {
      this.setState((prev: any) => ({ ...prev, display: prev.display === 'json' ? 'note' : 'json' }))
      e.preventDefault();
      e.stopPropagation();
    })
  }

  toJSON(html: any): any {
    const dom = document.createElement('html');
    dom.innerHTML = html;
    const lines = dom.querySelectorAll('div');
    const json: any = {};
    json.state = {};
    json.lines = Object.values(lines).map((div: HTMLDivElement) => {
      let text = div.innerText;
      const isTitle = text.startsWith('#');
      const isListItem = text.startsWith('+');
      const isChecklistItemDone = text.startsWith('[x]');
      const isChecklistItemTodo = text.startsWith('[]');
      const isChecklistItem = isChecklistItemTodo || isChecklistItemDone;
      const isDefinitionReg = new RegExp(/^\$([^=]+)={1}(.*)$/);
      const isDefinition = isDefinitionReg.exec(text);
      let definition: any;
      if (isDefinition) {
        const name = isDefinition[1].split(':')[0];
        let type = isDefinition[1].split(':').length > 1 ? isDefinition[1].split(':')[1] : 'string';
        let typeName = type && type.split('(')[0];
        let typeArgs = type && type.split('(').length > 1 && type.split('(')[1].replace(/\)$/, '');

        definition = {
          name,
          type,
          typeName,
          typeArgs,
          value: isDefinition[2],
        }

        if (typeName === 'Task') {
          if (!json.state.Tasks) { 
            json.state.Tasks = {};
          }

          // TODO: replace with real uuid call
          const uuid = `21398129as-d210391-${typeName}-${name}`;
          definition.ref = uuid;
          let isDone = false;
          if (typeArgs && typeArgs === 'OK') {
            isDone = true;
          }
          
          json.state.Tasks[uuid] = {
            definition,
            uuid,
            isDone,
          };
        }
      }

      if (isListItem) {
        text = text.replace(/^\+/, '');
      }
      if (isTitle) {
        text = text.replace(/^\#+/, '');
      }
      if (isChecklistItem) {
        if (isChecklistItemDone) {
          text = text.replace(/^\[x\]/, '');
        } else {
          text = text.replace(/^\[\]/, '');
        }
      }

      return {
        isTitle,
        isListItem,
        isChecklistItem,
        isChecklistItemDone,
        isChecklistItemTodo,
        definition,
        isDefinition: isDefinition != null,
        text,
      }
    });
    return json;
  }

  renderJSONToHtml(json: any) {
    if (!json) {
      return <></>;
    }

    const getDefinitionsBeforeLine = (line: number) => {
      return json.lines.filter((l: any, index: number) => {
        return index < line && l.isDefinition;
      }).reverse();
    }

    return json.lines?.map((line: any, index: number) => {
      const scopedVars = getDefinitionsBeforeLine(index);
      let displayText = line.text;

      // Do not render definition line in the note
      if (line.isDefinition) {
        return <></>;
      }

      if (scopedVars.length > 0) {
        let shouldReplace = false;
        const tmp = displayText.split(/\$([^\s]*)/).map((part: string) => {
          const matching = scopedVars.find((definitionLine: any) => definitionLine.definition.name === part);
          if (matching) {
            shouldReplace = true;
            const definition = matching.definition;
            const name = definition.name;
            const typeName = definition.typeName;
            const typeArgs = definition.typeArgs;
            const value = definition.value;
            let compo;
            if (typeName === 'String') {
              compo = <NoteString definition={definition} args={typeArgs} note={json} />
            }
            if (typeName === 'Task') {
              compo = <TaskReference definition={definition} args={typeArgs} note={json} />
            }
            return <span>{compo || value}</span>
          }
          return part;
        })
        if (shouldReplace) {
          displayText = tmp;
        }
      }

      let before;
      const classes: any = {};
      if (line.isListItem) {
        classes['list-item'] = true;
      }
      if (line.isTitle) {
        classes['title'] = true;
      }
      if (line.isChecklistItem) {
        classes['checklist-item'] = true;
        let checked = false;
        if (line.isChecklistItemDone) {
          checked = true;
        }
        before = <input type='checkbox' checked={checked} />
      }

      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {before}
          <p className={classnames(classes)}>
            {displayText}
          </p>
        </div>
      )
    });
  }

  handleChange = (e: any) => {
    const next = e.target.value !== '<br>' && e.target.value || '<div><br/></div>';
    const json = this.toJSON(next);
    this.setState({ html: next, note: json });
  }

  render() {
    return <div className='split-editor'>
      <div className='left-panel'>
        <ContentEditable
          id='editor'
          innerRef={this.contentEditable}
          html={this.state.html} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          tagName='div' // Use a custom HTML tag (uses a div by default)
        />
      </div>
      <div className='right-panel'>
        {this.state.display === 'json' && <>
          <ReactJson src={this.state.note} theme={'summerfruit:inverted'} />
        </>}
        {
          this.state.display === 'note' && <>
            {this.renderJSONToHtml(this.state.note)}
          </>
        }
      </div>
    </div>
  }
}

export default SplitEditor;