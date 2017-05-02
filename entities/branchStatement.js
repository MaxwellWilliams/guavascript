const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class BranchStatement {
  constructor(conditions, thenBlocks, elseBlock) {
    this.conditions = conditions;
    this.thenBlocks = thenBlocks;
    this.elseBlock = elseBlock;
  }
  analyze(context) {
    this.conditions.forEach((condition) => {
      condition.analyze(context);
      context.assertTypesAreEqual(condition.type, TYPE.BOOLEAN);
    });
    this.thenBlocks.forEach(block => block.analyze(context.createChildContextForBlock()));
    if (this.elseBlock !== null) {
      this.elseBlock.analyze(context.createChildContextForBlock());
    }
    return this;
  }
  optimize() {
    for (let c = 0; c < this.conditions.length; c++) {
      if (this.conditions[c].optimize().value) {
        return this.thenBlocks[c].optimize();
      }
    }

    return this.elseBlock.optimize();
  }
  toString(indent = 0) {
    let string = `${getIndent(indent++)}(If`;
    for (const i in this.conditions) {
      string += `\n${getIndent(indent)}(Case` +
                `\n${getIndent(++indent)}(Condition` +
                `\n${this.conditions[i].toString(++indent)}` +
                `\n${getIndent(--indent)})` +
                `\n${getIndent(indent)}(Body` +
                `\n${this.thenBlocks[i].toString(++indent)}` +
                `\n${getIndent(--indent)})` +
                `\n${getIndent(--indent)})`;
    }
    if (this.elseBlock !== null) {
      string += `\n${getIndent(indent)}(Else` +
                `\n${this.elseBlock.toString(++indent)}` +
                `\n${getIndent(--indent)})`;
    }
    string += `\n${getIndent(--indent)})`;
    return string;
  }
};
