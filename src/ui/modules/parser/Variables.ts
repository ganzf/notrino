export class Reference {

}

export class Variable {
  // Line of the definition
  line: number = -1;

  // name of the variable
  name: string = '';

  // Label to display if nothing else is available
  label: string | null = null;

  // Variable type
  type: string | null = null;

  // Variable type params (pointer to something, options...)
  params: string | null = null;

  // Is it a pointer to something ?
  isReference: boolean = false;
  reference: Reference | null = null;

  getStringValue(): string | null {
    return this.label;
  }
}

export class Variables {
  vars: { [key: string]: Variable } = {};

  constructor() {

  }

  has(name: string): boolean {
    return Object.keys(this.vars).includes(name);
  }

  add(v: Variable) {
    this.vars[v.name] = v;
  }
}
