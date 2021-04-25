
interface NamedFunction {
  name: string;
  addon?: string;
  exec: Function;
}

export class ReplacementInfo {
  start: number = 0;
  end: number = 0;
  raw: string = '';
  shouldReplace: boolean = false;
  replaceWith: Function = () => null;
}

interface ReplacerFunction {
  name: string;
  addon?: string;
  exec: (finalText: string) => ReplacementInfo;
}

export class Line {
  text: string | null; // simple text
  content?: any; // JSX display
  nbr: number = -1;
  display: Function;
  printable: boolean = true;
  useDefaultDisplay: boolean = true;
  type: string | null = null;
  // Hidden tags used only for parsing, example: ListItem
  hiddenTags: any = {};
  // User defined, visible tags
  inlineTags: { [key: string]: string } = {};
  classes: { [key: string]: boolean } = {
    'line': true,
  };

  // display sections:
  // gutter (codeMirror gutter)
  // before (list item, tags...)
  // text (actual content)
  gutter: NamedFunction[] = [];
  before: NamedFunction[] = [];
  replaceText: ReplacerFunction[] = [];

  constructor(text: string | null) {
    this.text = text;
    this.display = () => this.printable ? text : null;
  }

  getContent(): any {
    return this.content || this.text;
  }

  isEmpty(): boolean {
    return this.text === null;
  }

  length(): number {
    return this.text?.length || 0;
  }

  match(reg: any): any {
    return this.text?.match(reg) || false;
  }

  replace(source: any, by: any) {
    return this.text?.replace(source, by);
  }
}
