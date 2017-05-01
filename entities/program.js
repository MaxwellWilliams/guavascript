const Context = require('../semantics/context');
const getIndent = require('../semantics/getIndent.js');

module.exports = class Program {
    constructor(block) {
        this.block = block;
    }
    analyze(context = new Context()) {
        this.block.analyze(context);
        return this;
    }
    optimize() {
        this.block.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Program` +
               `\n${this.block.toString(++indent)}` +
               `\n${getIndent(--indent)})`;
    }
};