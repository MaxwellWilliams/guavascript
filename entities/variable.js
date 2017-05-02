const TYPE = require('../semantics/types.js');

module.exports = class Variable {
  constructor(variable) {
    this.var = variable;
    this.type = TYPE.null;
  }
  analyze(context) {
    this.var.analyze(context);
    this.type = this.var.type;
    return this;
  }
  optimize() {
    return this;
  }
  toString(indent = 0) {
    return `${this.var.toString(indent)}`;
  }
};
