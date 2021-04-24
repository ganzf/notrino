import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Addon, AParsed, ParsingContext } from '../types';

export class InlineTags implements Addon {
  separator: string;
  beginChar: string;
  endChar: string;

  constructor(options: any = {}) {
    this.separator = options.separator || ',';
    this.beginChar = options.beginChar || '(';
    this.endChar = options.endChar || ')';
  }

  execute(parsed: AParsed, context: ParsingContext): void {
    const line = context.currentLine;
    const match = line.match(/^\+?\s*?\(([^\s]+)\)/);
    if (match) {
      const lineTags: any = {};
      match && match[1].split(this.separator).map((tag: string) => {
        lineTags[tag.toLowerCase()] = true;
      })
      line.inlineTags = lineTags;

      if (lineTags) {
        if (lineTags.ok) {
          line.classes['line--ok'] = true;
        }
        if (lineTags.important) {
          line.classes['line--important'] = true;
        }
        if (lineTags.design) {
          line.before.push({
            name: 'inline-tag',
            exec: () => <span className='inline-tag'>Design</span>,
          });
        }
        if (lineTags.critique) {
          line.before.push({
            name: 'inline-tag',
            exec: () => <span className='inline-tag critical'>Critique</span>,
          });
        }
        if (lineTags.bugfix) {
          line.before.push({
            name: 'inline-tag',
            exec: () => <span className='inline-tag bugfix'>Bugfix</span>,
          });
        }
        if (lineTags.idee) {
          line.before.push({
            name: 'inline-tag',
            exec: () => <span className='inline-tag idea'>
              <FontAwesomeIcon icon={faLightbulb} />
            </span>,
          })
        }
      }

      line.text = line.text!.replace(/^\+?\s*?\([^\s]+\)/, '');
    }
  }
}
