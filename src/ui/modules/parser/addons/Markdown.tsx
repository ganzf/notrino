import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
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
      if (count === 1) { content = <h1>{line.text}</h1>; }
      if (count === 2) { content = <h2>{line.text}</h2>; }
      if (count === 3) { content = <h3>{line.text}</h3>; }
      if (count === 4) { content = <h4>{line.text}</h4>; }
      if (count > 4) { content = <h4>{line.text}</h4>; }
      line.printable = true;
      line.useDefaultDisplay = false;
      line.display = () => content;
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