const getIndent = require('../semantics/getIndent.js');
const ReturnStatement = require('./returnStatement.js');

module.exports = class Block {
    constructor(body) {
        this.body = body;
        this.numberOfReturnStatements = 0;
        this.returnType = undefined;
    }
    analyze(context) {
        for(var statementCounter in this.body) {
            var statement = this.body[statementCounter];
            statement.analyze(context);
            if (statement.constructor === ReturnStatement) {
                this.numberOfReturnStatements++;
                if (this.numberOfReturnStatements <= 1) {
                    this.returnType = statement.returnType;
                } else {
                    context.assertMultipleReturnsInABlock();
                }
            }
        }
        if(!context.inClassDelaration) {
            context.assertAllLocalVarsUsed();
        }
    }

    toString(indent = 0) {
        var string = `${getIndent(indent++)}(Block`;
        for (var statementIndex in this.body) {
            string += `\n${this.body[statementIndex].toString(indent)}`;
        }
        string += `\n${getIndent(--indent)})`;
        return string;
    }
}