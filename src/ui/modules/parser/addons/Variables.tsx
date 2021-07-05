import React from 'react';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Addon, AParsed, ParsingContext } from '../types';
import { Line, ReplacementInfo } from '../Line';
import core from 'ui';
import parser from '..';

export class Variables implements Addon {
  execute(parsed: AParsed, context: ParsingContext): void {
    const line: Line = context.currentLine;
    let shouldSkip = !line.printable || line.isEmpty()
    const isDefinition = line.type === 'variableDefinition';
    // Required for composed variables
    if (isDefinition) {
      shouldSkip = false;
    }

    if (shouldSkip) {
      return;
    }

    let text = line.text!;
    let idx = 0;
    while (idx < text.length && idx >= 0) {
      let scope = parsed.variables;
      const substr = text.substr(idx, text.length - idx);
      const match = substr.match(/^\$([\w\.]+)/);
      let varName: string = `${match && match[1]}`;
      let scopeName = '';

      if (match) {
        const raw = match[0];

        console.log({ raw });
        if (raw.includes('.')) {
          const chain = raw.replace(/^\$/, '').split('.', 2);
          if (context.note && chain[0] && chain[0] !== context.note.identifier) {
            const note = core.getNoteById(chain[0]);
            if (note) {
              // Make sure its not the same note
              const parsed = parser.parse(note.unsavedValue || note.value);
              const variablesOfScope = parsed.variables;
              if (variablesOfScope) {
                console.log('Using other scope', { variablesOfScope });
                scope = variablesOfScope;
                scopeName = `${chain[0]} > `;
                varName = chain[1];
              }
            }
          }
        }

        const isDefined = scope?.has(varName);
        console.log({ isDefined, raw, varName, scope });
        if (isDefined) {
          const variable = scope!.get(varName);
          line.replaceText.push({
            name: 'variable',
            addon: 'variables',
            exec: (finalText: string) => {
              const info = new ReplacementInfo();
              if (finalText.includes(raw)) {
                info.start = finalText.indexOf(raw);
                info.raw = raw;
                info.shouldReplace = true;
                info.end = info.start + raw.length;
                info.replaceWith = () => {
                  const type = variable.type?.toLowerCase() || 'string';
                  if (type === 'string') {
                    const style: any = {};
                    if (variable.params) {
                      const color = variable.params.split(',').find((option) => {
                        if (['blue', 'red', 'green', 'yellow', 'orange', 'crimson', 'purple', 'rose'].includes(option)) {
                          return true;
                        }
                        return false;
                      })
                      const size = variable.params.split(',').find((option) => {
                        if (option.match(/^[0-9]+px$/)) {
                          return true;
                        }
                        return false;
                      });
                      if (color) {
                        style.color = color;
                      }
                      if (size) {
                        style.fontSize = size;
                      }
                      if (variable.params.split(',').find((option) => {
                        if (option === 'bold') {
                          return true;
                        }
                        return false;
                      })) {
                        style.fontWeight = '600';
                      }
                    }
                    return <div style={style} className='inline-var'><b>{scopeName}{variable.name}</b>{variable.getStringValue()}</div>;
                  } else if (type === 'task') {
                    return <div className='inline-var'>[{variable.type}] - {variable.getStringValue()}</div>
                  }
                }
              }
              return info;
            }
          })
        }

      }
      idx += 1;
    }
    line.text = text;

    // Apply the replaceText functions
    if (line.replaceText.length > 0) {
      let currentText = line.text;
      let content: any[] = [];
      line.replaceText.forEach((rf) => {
        const info = rf.exec(currentText);
        if (info.shouldReplace) {
          const beforeReplacement = currentText.substr(0, info.start);
          content.push(<span>{beforeReplacement}</span>);
          content.push(info.replaceWith());
          currentText = currentText.substr(info.end, currentText.length - info.end);
        }
      })
      if (currentText.length > 0) {
        content.push(<span>{currentText}</span>)
      }
      line.content = content;
    }
  }
}
