const getIndent = require('../semantics/getIndent.js');

module.exports = class ForInStatement {
  constructor(id, iteratableObj, block) {
    this.id = id;
    this.iteratableObj = iteratableObj;
    this.block = block;
  }
  analyze(context) {
    const blockContext = context.createChildContextForBlock();
    blockContext.setId(this.id, undefined);
    this.iteratableObj.analyze(context);
    context.assertIsIteratable(this.iteratableObj.id);
    this.block.analyze(blockContext);
    return this;
  }
  optimize() {
    if (this.iteratableObj.value === {} || this.iteratableObj.value === []) {
      return null;
    }
    this.block = this.block.optimize();
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(For id (${this.id}) in` +
           `\n${this.iteratableObj.toString(++indent)}` +
           `\n${this.block.toString(indent)}` +
           `\n${getIndent(--indent)})`;
  }
};
