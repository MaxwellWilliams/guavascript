const getIndent = require('../semantics/getIndent.js');
const ReturnStatement = require('./returnStatement.js');

module.exports = class Block {
  constructor(body) {
    this.body = body;
    this.numberOfReturnStatements = 0;
    this.returnType = undefined;
  }
  analyze(context) {
    for (const statement of this.body) {
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
    if (!context.inClassDelaration) {
      context.assertAllLocalVarsUsed();
    }
    return this;
  }
  optimize() {
    // Removes all statements after return statement
    let hitReturnStatement = false;
    let s = 0;
    while (!hitReturnStatement && s < this.body.length) {
      const statement = this.body[s];
      if (statement.constructor === ReturnStatement) {
        hitReturnStatement = true;
      }
      this.body[s] = statement.optimize();
      s++;
    }
    this.body = this.body.slice(0, s);
    this.body = this.body.filter(statement => statement !== null);
    return this;
  }
  toString(indent = 0) {
    let string = `${getIndent(indent++)}(Block`;
    for (const statement of this.body) {
      string += `\n${statement.toString(indent)}`;
    }
    string += `\n${getIndent(--indent)})`;
    return string;
  }
};
