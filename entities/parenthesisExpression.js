module.exports = class ParenthesisExpression {
    constructor(exp) {
        this.exp = exp;
        this.type;
    }
    analyze(context) {
        this.exp.analyze(context);
        this.type = this.exp.type;
    }
    toString(indent = 0) {
        return `${this.exp.toString(indent)}`;
    }
};