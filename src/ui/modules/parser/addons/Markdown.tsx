import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import core from 'ui';
import { Line } from '../Line';
import { Addon, AParsed, ParsingContext } from '../types';

export class Markdown implements Addon {
  execute(parsed: AParsed, context: ParsingContext): void {
    const line = context.currentLine;
    if (line.isEmpty()) {
      return;
    }

    let match = line.match(/^(\#+)\s+/);
    const text = line.text!;
    if (match) {
      const count = match[1].length;
      line.text = text.replace(/\#+/, '');
      let content: any = null;
      // FIXME: Need to improve edit note api to support tags inside titles etc...
      let onClick = () => {
        if (line.inlineTags.collapsed && context.note) {
          console.log('Line is collapsed');
          core.editNote(context.note?.identifier, {
            action: 'REMOVE_INLINE_TAG',
            tagValue: 'collapsed',
            lineNbr: line.nbr,
          })
        } else if (!line.inlineTags.collapsed && context.note) {
          core.editNote(context.note?.identifier, {
            action: 'ADD_INLINE_TAG',
            tagValue: 'collapsed',
            lineNbr: line.nbr,
          })
        }
      };
      if (count === 1) { content = () => <h1>{line.getContent()}</h1>; }
      if (count === 2) { content = () => <h2>{line.getContent()}</h2> ; }
      if (count === 3) { content = () => <h3>{line.getContent()}</h3>; }
      if (count === 4) { content = () => <h4>{line.getContent()}</h4>; }
      if (count > 4) { content = () => <h4>{line.getContent()}</h4>; }
      line.printable = true;
      line.useDefaultDisplay = false;
      line.display = () => content();
      return;
    }

    match = line.match(/^____(_+)?$/);
    if (match) {
      line.printable = true;
      line.useDefaultDisplay = false;
      line.display = () => <div className='separator' />;
      return;
    }

    if (text.startsWith('+')) {
      line.hiddenTags.isListItem = true;
      line.classes['list-item'] = true;
      line.text = text.replace(/^\+/, '');
      line.before.push({
        name: 'bullet',
        addon: 'markdown',
        exec: () => <FontAwesomeIcon icon={faCircle} />,
      })
    }
  }
}