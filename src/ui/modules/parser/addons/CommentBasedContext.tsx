import React from 'react';
import { Line } from '../Line';
import { Addon, AParsed } from "../types";

export class CommentBasedContext implements Addon {
  // This addon allows users to define context info in a comment
  // example: "// +:Task" => transforms all following list items to Task type
  execute(parsed: AParsed, context: any): void {
    const line: Line = context.currentLine;
    // Stop applying context on empty line
    if (line.isEmpty()) {
      if (context.symbol === '+') {
        context.symbol = undefined;
        context.type = undefined;
      }
    } else {
      const isComment = line.match(/^\/\//);
      if (isComment) {
        const isContext = line.match(/([\+]){1}:(Task)/);
        if (isContext) {
          context.symbol = isContext[1];
          context.type = isContext[2];
        }
        line.printable = false;
        line.type = 'comment';
      } else {
        if (line.hiddenTags.isListItem && context.symbol === '+') {
          const type = context.type;
          const bulletFunc = line.before.find(nf => nf.name === 'bullet' && nf.addon === 'markdown');
          if (bulletFunc) {
            bulletFunc.exec = () => null;
          }
          // Add our bullet method in first position of line before functions
          line.before.unshift({
            name: 'bullet',
            addon: 'commentBasedContext',
            exec: () => {
              if (type === 'Task') {
                const { core, note } = context;
                return <input
                  style={{ marginRight: '5px' }}
                  type='checkbox'
                  checked={line.inlineTags?.ok ? true : false}
                  onClick={() => {
                    if (note && core) {
                      const action = line.inlineTags?.ok ? 'REMOVE_INLINE_TAG' : 'ADD_INLINE_TAG';
                      const tagValue = 'ok';
                      core.editNote(note.identifier, {
                        lineNbr: line.nbr,
                        action,
                        tagValue,
                      });
                    }
                  }}
                />
              }
            }
          })
        }
      }
    }
  }
}