import { EndOfLineState } from "typescript";

class Parser {
  getLinesFromValue(value: string) {
    const lines: any[] = [];
    let previous: string | null;
    value?.split(/(?=[\r\n]{2})|(?<=[\r\n]{2})/).map((line: string) => {
      let res: null | string;
      if (line.match(/^[\r\n]+$/)) {
        res = null;
        if (line.match(/^[\r\n]{2}$/)) {
          lines.push(null);
        } else {
          if (previous === null) {
            lines.push(null);
          }
        }
      } else {
        res = '';

        line.split(/[\r\n]/).forEach((line: string) => {
          lines.push(line);
        });
      }
      previous = res;
    });

    return lines;
  }
}

export default new Parser();