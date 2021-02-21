import AEditorModule from './AEditorModule';

export default class MarkdownMod implements AEditorModule {
    priority = 1;

    applyTitles(dom: HTMLDivElement, context: any) {
        context.lines && context.lines.forEach((line: HTMLDivElement) => {
            const startsWithHash = line.textContent?.match(/\#+\s/);
            if (startsWithHash) {
                const titleLevel = line.textContent?.split('#').filter((it: string) => it === "").length;
                const isTitle = line.firstChild?.nodeName === `H${titleLevel}`;
                if (!isTitle) {
                    console.log({ isTitle, line });
                    line.innerHTML = `<h${titleLevel}>` + line.innerHTML + `</h${titleLevel}>`;
                }
            }
        });
    }

    apply(dom: HTMLDivElement, context: any) {
        this.applyTitles(dom, context);
        context.lines && context.lines.forEach((line: HTMLDivElement) => {
            if (line.className.includes(' focus-line')) {
                line.className = line.className.replace(' focus-line', '');
            }
        })
        if (context.currentLine) {
            const line = context.currentLine as HTMLDivElement;
            if (!line.className.includes(' focus-line')) {
                line.className += ' focus-line'
            }
        }
    }
}