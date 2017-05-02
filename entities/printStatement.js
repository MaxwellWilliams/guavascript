const getIndent = require('../semantics/getIndent.js');

module.exports = class PrintStatement {
  constructor(exp) {
    this.exp = exp;
  }
  analyze(context) {
    this.exp.analyze(context);
    return this;
  }
  optimize() {
    // do we need to optimize print statement?
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(Print` +
           `\n${this.exp.toString(++indent)}` +
           `\n${getIndent(--indent)})`;
  }
};
