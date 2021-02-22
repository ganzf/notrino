import { findElementById, querySelectorUp } from 'ui/utils/editor';
import AEditorModule from './AEditorModule';

export default class CursorMod implements AEditorModule {
    priority = 1;

    // Apply Style modifies the real dom directly.
    applyStyle(dom: HTMLDivElement) {
        const lines = dom.querySelectorAll('div');
        const selection = window.getSelection();
        lines && lines.forEach((line: HTMLDivElement) => {
            if (line.id) {
                if (line.classList.contains('focus-line')) {
                    line.classList.remove('focus-line');
                }

                if (selection && selection.focusNode) {
                    const lineParent = querySelectorUp(selection.focusNode, (n: any) => {
                        return n?.classList?.contains('line');
                    }) as HTMLDivElement | null;
                    if (lineParent && lineParent.id === line.id) {
                        if (!line.classList.contains('focus-line')) {
                            line.classList.add('focus-line');
                        }
                    }
                }
            }
        })
    }

    // Apply modifies the future DOM (it means that you can modify layout, tags, etc...)
    apply(dom: HTMLDivElement, context: any) {
        const winSelection = window.getSelection();
        // Attention, ce node c'est pas dans le DOM en parametre, mais celui deja present dans la page.
        const node = winSelection?.focusNode;
        const offset = winSelection?.focusOffset;
        const parent = node?.parentNode;
        // @ts-ignore
        const id = parent.id;
        const targetInDom = findElementById(dom, id);
        context.currentLine = targetInDom;

        /* console.log({ context });
        if (context.currentLine)  {
            context.currentLine.className = context.currentLine.className.replace(' focus-line', '');
        }
        if (targetInDom) {
            context.currentLine = targetInDom;
            // @ts-ignore
            targetInDom.className += ' focus-line';
        } */
    }
}