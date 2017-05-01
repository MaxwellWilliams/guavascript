const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class BranchStatement {
    constructor(conditions, thenBlocks, elseBlock) {
        this.conditions = conditions;
        this.thenBlocks = thenBlocks;
        this.elseBlock = elseBlock;
    }
    analyze(context) {
        this.conditions.forEach(function(condition) {
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
      if(this.conditions.length === 1) {
        if (this.conditions[0].optimize().value) {
          return this.thenBlocks[0].optimize();
        } else {
          return this.elseBlock.optimize();
        }
      }

      this.conditions.map(c => c.optimize());
      this.thenBlocks.map(t => t.optimize());
      this.elseBlock = this.elseBlock.optimize();
      return this;
    }
    toString(indent = 0) {
        var string = `${getIndent(indent++)}(If`;
        for (var i in this.conditions) {
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