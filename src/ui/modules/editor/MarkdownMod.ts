import { start } from 'repl';
import AEditorModule from './AEditorModule';

export default class MarkdownMod implements AEditorModule {
    priority = 1;

    applyTitles(dom: HTMLDivElement, context: any) {
        context.lines && context.lines.forEach((line: HTMLDivElement) => {
            // ! Do not apply markdown styling to current editing line
            if (!context.currentLine || context.currentLine && line.id !== context.currentLine.id) {
                const startsWithHash = line.textContent?.match(/^\#+\s[\w\W]+/);
                const startsWithBulletItem = line.textContent?.match(/^\s?[o\+]\s[\w\W]+/);
                if (startsWithHash) {
                    const titleLevel = line.textContent?.split('#').filter((it: string) => it === "").length;
                    const isTitle = line.firstChild?.nodeName === `H${titleLevel}`;
                    if (!isTitle) {
                        line.innerHTML = line.innerHTML.replace(/^#+/, '');
                        line.innerHTML = `<h${titleLevel}>` + line.innerHTML + `</h${titleLevel}>`;
                        line.classList.add('title');
                    }
                }

                if (startsWithBulletItem) {
                    line.innerHTML = line.innerHTML.replace(/^\s?[o\+]/, '');
                    line.classList.add('todo-checkbox');
                    line.innerHTML = '<input type="checkbox" id="checkbox-' + line.id + '">' + line.innerHTML;
                }
            }
        });
    }

    apply(dom: HTMLDivElement, context: any) {
        this.applyTitles(dom, context);
    }
}