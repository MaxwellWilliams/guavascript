const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class ClassDeclarationStatement {
    constructor(id, block) {
        this.id = id;
        this.block = block;
    }
    analyze(context) {
        context.setVariable(this.id, TYPE.CLASS);
        let newContext = context.createChildContextForClassDeclaration(this.id);
        this.block.analyze(newContext);
        context.assertClassHasConstructor(this.id);
    }
    optimize() {
        
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Class` +
               `\n${getIndent(++indent)}(id ${this.id})` +
               `\n${this.block.toString(indent)}` +
               `\n${getIndent(--indent)})`;
    }
};