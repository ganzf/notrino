import React from 'react';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Addon, AParsed, ParsingContext } from '../types';
import { Line, ReplacementInfo } from '../Line';
import core from 'ui';
import parser from '..';

export class Functions implements Addon {
    parseCommand(command: string, parsed: AParsed, context: ParsingContext) {
        const selectMatch = command.match(/select (lines|variables) with (tag|tags|length) (.*)/)
        if (selectMatch) {
            let params: any = selectMatch[3];
            const inStatement = params.match(/\s+in (.*)$/);
            if (inStatement) {
                params = params.replace(inStatement[0], '');
            }
            params = params.split(' and ')
            const select = {
                what: selectMatch[1],
                with: selectMatch[2],
                params,
                in: inStatement && inStatement[1],
            };
            
            let otherParsed = parsed;
            if (select.in) {
                const other = core.getNoteById(select.in);
                if (other) {
                    const ctx: any = {
                        note: other,
                        core
                      };
                    otherParsed = parser.parse(other.unsavedValue || other.value, ctx);
                }
            }
            const lines = otherParsed.lines;
            const selected: any[] = [];
            lines.forEach(line => { 
                if (line.printable) {
                    if (Object.keys(line.inlineTags).length > 0) {
                        let excluded = false;

                        params.forEach((param: string) => {
                            let paramValue = param;
                            const isNot = param.match(/^not\s+/i);
                            if (isNot) {
                                paramValue = param.replace(isNot[0], '');
                            }
                            if (isNot && line.inlineTags[paramValue]) {
                                excluded = true;
                            }
                            if (!isNot) {
                                if (!line.inlineTags[paramValue]) {
                                    excluded = true;
                                }
                            }
                        })
                        if (!excluded) {
                            selected.push(line);
                        }
                    }
                }
            });
            return selected;
        }
    }

    execute(parsed: AParsed, context: ParsingContext): void {
        const line: Line = context.currentLine;
        let shouldSkip = !line.printable || line.isEmpty();
        if (shouldSkip) {
          return;
        }
        const text = line.text!;
        const containsVariable = text.includes('$');
        const variablesIterator = text.matchAll(/(\${([^}]+)})/gi);
        let variable = variablesIterator.next();
        while (variable && !variable.done) {
            line.printable = false;
            const value = variable.value[2]
            console.log({ variable, value });
            variable = variablesIterator.next();
            const lines = this.parseCommand(value, parsed, context);
            line.display = () => { 
                return (<>
                {lines?.map(l => { 
                    return <p>{(l.display && l.display()) || l.text}</p>;
                })}
                </>)
            }
        }



        return;
    }
}
