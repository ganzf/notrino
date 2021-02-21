import { findElementById } from 'ui/utils/editor';
import AEditorModule from './AEditorModule';

export default class CursorMod implements AEditorModule {
    priority = 1;

    apply(dom: HTMLDivElement, context: any) {
        const winSelection = window.getSelection();
        // Attention, ce node c'est pas dans le DOM en parametre, mais celui deja present dans la page.
        const node = winSelection?.focusNode;
        const offset = winSelection?.focusOffset;
        const parent = node?.parentNode;
        // @ts-ignore
        const id = parent.id;
        const targetInDom = findElementById(dom, id);
        if (targetInDom) {
            context.currentLine = targetInDom;
        }
    }
}