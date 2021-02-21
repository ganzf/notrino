import AEditorModule from './AEditorModule';
import { v4 as uuid } from 'uuid';
import { isDoStatement } from 'typescript';

let index = 1;

export default class LinterMod implements AEditorModule {
    priority = 0;

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

        const ids: string[] = [];

        context.lines.forEach((line: HTMLDivElement) => {
            if (!line.id || ids.includes(line.id)) {
                line.id = uuid();
            }
            ids.push(line.id);
        })
    }
}