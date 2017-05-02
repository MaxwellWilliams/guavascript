const getIndent = require('../semantics/getIndent.js');

module.exports = class VarList {
  constructor(variables) {
    this.variables = variables;
    this.length = variables.length;
    this.type = undefined;
  }
  analyze(context) {
    this.type = [];
    for (const variable of this.variables) {
      variable.analyze(context);
      this.type.push(variable.type);
    }
    return this;
  }
  optimize() {
    this.variables.map(v => v.optimize());
    return this;
  }
  toString(indent = 0) {
    let string = `${getIndent(indent++)}(VarList`;
    if (this.variables.length !== 0) {
      for (const variable in this.variables) {
        string += `\n${this.variables[variable].toString(indent)}`;
      }
      string += `\n${getIndent(--indent)})`;
    } else {
      string += ')';
    }
    return string;
  }
};
