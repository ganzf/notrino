// Only Interfaces and small classes
import IUICore from "ui/include/IUICore";
import { Line } from './Line';
import { Variables } from './Variables';

interface IParsed {}

export class AParsed implements IParsed {
  lines: Line[] = [];
  variables: Variables | null = null;
  addons: Addon[] = [];
}

export interface ParsingContext {
  note?: any;
  core: IUICore;
  currentLine: Line;
}

export interface Addon {
  execute(parsed: AParsed, context: any): void;
}