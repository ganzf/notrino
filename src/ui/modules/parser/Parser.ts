// Parser
import { CommentBasedContext } from "./addons/CommentBasedContext";
import { DefaultDisplay } from "./addons/DefaultDisplay";
import { InlineTags } from "./addons/InlineTags";
import { Markdown } from "./addons/Markdown";
import { Line } from './Line';
import { Variable, Variables } from './Variables';
import { Variables as VariablesAddon } from './addons/Variables';
import { Addon, AParsed, ParsingContext } from "./types";

class Parsed extends AParsed {
  lines: Line[] = [];
  variables: Variables | null = null;
  addons: Addon[] = [
    new Markdown(),
    new InlineTags(),
    new CommentBasedContext(),
    new VariablesAddon(),
    new DefaultDisplay(),
  ];

  constructor(lines: Line[], context?: ParsingContext) {
    super();
    this.lines = lines;
    this._getVariables();
    if (context) {
      this.lines.forEach(line => {
        this.addons.forEach((addon) => {
          context.currentLine = line;
          addon.execute(this, context);
        })
      })
    }
  }

  _getVariables() {
    this.lines.forEach((line: Line, nbr: number) => {
      if (line.isEmpty()) {
        return;
      }
      const text = line.text!;
      // Typed variable
      let match = text.match(/^\$(\w+):(\w+)(\(\w+\))?=([\w\s]+)/);
      const v = new Variable();
      if (match) {

        if (this.variables === null) {
          this.variables = new Variables();
        }

        v.line = nbr;
        v.name = match[1];
        v.type = match[2];
        v.params = match[3];
        v.label = match[4];
        line.printable = false;
        line.type = 'variableDefinition';
        if (!this.variables.has(v.name)) {
          this.variables.add(v);
        }
      }

      // Untyped (string) variable
      match = text.match(/^\$(\w+)=(.*)$/);
      if (match) {
        if (this.variables === null) {
          this.variables = new Variables();
        }

        const v = new Variable();
        v.name = match[1];
        v.label = match[2];
        v.line = nbr;
        line.printable = false;
        line.type = 'variableDefinition';
        if (!this.variables.has(v.name)) {
          this.variables.add(v);
        }
      }
    });
  }
}

class Parser {
  parse(value: string, context?: ParsingContext): Parsed {
    return new Parsed(this._getLinesFromValue(value), context);
  }

  // You can use this function to get the raw lines out of the text.
  // But it would probably be better to only use the AParsed object ;)
  _getLinesFromValue(value: string): Line[] {
    const lines: Line[] = [];
    let previous: string | null;
    value?.split(/(?=[\r\n]{2})|(?<=[\r\n]{2})/).map((line: string) => {
      let res: null | string;
      if (line.match(/^[\r\n]+$/)) {
        res = null;
        if (line.match(/^[\r\n]{2}$/)) {
          lines.push(new Line(null));
        } else {
          if (previous === null) {
            lines.push(new Line(null));
          }
        }
      } else {
        res = '';

        line.split(/[\r\n]/).forEach((text: string) => {
          lines.push(new Line(text));
        });
      }
      previous = res;
    });
    lines.forEach((line, index: number) => {
      line.nbr = index;
    })
    return lines;
  }
}

export default new Parser();