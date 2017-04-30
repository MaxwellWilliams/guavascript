const getIndent = require('../semantics/getIndent.js');

module.exports = class ReturnStatement {
    constructor(exp) {
        this.exp = exp;
        this.returnType;
    }
    analyze(context) {
        context.assertInFunctionDeclaration();
        this.exp.analyze(context);
        this.returnType = this.exp.type;
    }
    optimize() {
        
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Return` +
               `\n${this.exp.toString(++indent)}` +
               `\n${getIndent(--indent)})`;
    }
};