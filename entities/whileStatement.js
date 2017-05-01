const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class WhileStatement {
    constructor(condition, block) {
        this.condition = condition;
        this.block = block;
    }
    analyze(context) {
        var blockContext = context.createChildContextForBlock();
        this.condition.analyze(context);
        context.assertTypesAreEqual(this.condition.type, TYPE.BOOLEAN);
        this.block.analyze(blockContext);
        return this;
    }
    optimize() {
        this.condition.optimize();
        this.block.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(While` +
          `\n${getIndent(++indent)}(Condition` +
               `\n${this.condition.toString(++indent)}` +
               `\n${getIndent(--indent)})` +
               `\n${getIndent(indent)}(Body` +
               `\n${this.block.toString(++indent)}` +
               `\n${getIndent(--indent)})` +
               `\n${getIndent(--indent)})`;
    }
};