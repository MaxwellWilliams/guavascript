const BinaryExpression = require('./binaryExpression.js');

module.exports = class ParenthesisExpression {
    constructor(exp) {
        this.exp = exp;
        this.type;
    }
    analyze(context) {
        this.exp.analyze(context);
        this.type = this.exp.type;
        return this;
    }
    optimize() {
        if(this.exp.constructor === BinaryExpression) {
            return this.exp.optimize();
        }
        return this;
    }
    toString(indent = 0) {
        return `${this.exp.toString(indent)}`;
    }
};