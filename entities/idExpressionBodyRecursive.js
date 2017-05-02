const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class IdExpressionBodyRecursive {
  constructor(idExpBase, idAppendage) {
    this.idExpBase = idExpBase;
    this.idAppendage = idAppendage;
    this.appendageOp = idAppendage === undefined ? undefined : idAppendage.op;
    this.id = undefined;
    this.type = undefined;
  }
  analyze(context) {
    this.idExpBase.analyze(context);
    this.idAppendage.analyze(context);
    this.id = this.idExpBase.id;
    this.type = this.idExpBase.type;

    if (this.appendageOp !== undefined && this.type === undefined) {
      if (this.appendageOp === '[]') {
        this.type = TYPE.LIST;
        context.setVariable(this.id, this.type);
      } else if (this.appendageOp === '{}') {
        context.managePossibleTypes(this.id, [TYPE.CLASS, TYPE.DICTIONARY]);
      }
    }

    if (this.idExpBase.isFunction) {
      context.assertIdCalledAsFunction(this.id, this.appendageOp);
      this.idAppendage.analyze(context);
      context.assertFunctionCalledWithValidParams(
        this.id,
        this.idExpBase.paramType,
        this.idAppendage.type);
    }
    return this;
  }
  optimize() {
    this.idExpBase = this.idExpBase.optimize();
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(${this.appendageOp}` +
           `\n${this.idExpBase.toString(++indent)}` +
           `\n${this.idAppendage.toString(indent)}` +
           `\n${getIndent(--indent)})`;
  }
};
