import React from 'react';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Addon, AParsed, ParsingContext } from '../types';
import { Line, ReplacementInfo } from '../Line';

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
      const substr = text.substr(idx, text.length - idx);
      const match = substr.match(/^\$(\w+)/);

      if (match) {
        const isDefined = parsed.variables?.has(match[1]);
        const raw = match[0];
        if (isDefined) {
          const variable = parsed.variables!.get(match[1]);
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
                  return <div className='inline-var'><b>{variable.name}</b>{variable.getStringValue()}</div>;
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
