const getIndent = require('../semantics/getIndent.js');

module.exports = class PrintStatement {
    constructor(exp) {
        this.exp = exp;
    }
    analyze(context) {
        this.exp.analyze(context);
    }
    optimize() {
        
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Print` +
               `\n${this.exp.toString(++indent)}` +
               `\n${getIndent(--indent)})`;
    }
};