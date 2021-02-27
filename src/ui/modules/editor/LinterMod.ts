import AEditorModule from './AEditorModule';
import { v4 as uuid } from 'uuid';
import { isDoStatement } from 'typescript';
import { title } from 'process';

let index = 1;

export default class LinterMod implements AEditorModule {
    priority = 0;

    // This module tags with the right classnames every line in the editor
    apply(dom: HTMLDivElement, context: any) {
        // Avoids the starting issue of a floating text node inside the editor
        if (dom.firstChild?.nodeName === '#text') {
            console.log('First dom child', { first: dom.firstChild });
            const text = dom.textContent || '';
            if (text.length > 0) {
                dom.innerHTML = '<div>' + dom.innerHTML + '</div>';
            }
        }

        context.lines = dom.querySelectorAll('div');
        context.lines.forEach((line: HTMLDivElement) =>  {
            // First, verify is a classList can be applied
            const text = line.textContent;
            const aliasReg = new RegExp(/^\$[\w\W]+=[\w\W]+$/);
            if (text?.match(aliasReg)) {
                line.classList.add('inline-alias-definition');
            } else {
                if (line.classList.contains('inline-alias-definition')) {
                    line.classList.remove('inline-alias-definition');
                }
            }
        })
/* 
        const ids: string[] = []; */
/* 
        // This causes bad side effects with return lines. maybe avoid doing it like this
        context.lines.forEach((line: HTMLDivElement) => {
            if (!line.id || ids.includes(line.id) || line.id === 'newline') {
                line.id = uuid();
                if (!line.classList.contains('line')) {
                    line.classList.add('line');
                }
            }
            ids.push(line.id);
        }) */

    }
}