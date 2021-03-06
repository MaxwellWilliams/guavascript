const getIndent = require('../semantics/getIndent.js');

module.exports = class ReturnStatement {
  constructor(exp) {
    this.exp = exp;
    this.returnType = undefined;
  }
  analyze(context) {
    context.assertInFunctionDeclaration();
    this.exp.analyze(context);
    this.returnType = this.exp.type;
    return this;
  }
  optimize() {
    this.exp = this.exp.optimize();
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(Return` +
           `\n${this.exp.toString(++indent)}` +
           `\n${getIndent(--indent)})`;
  }
};
