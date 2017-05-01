const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class UnaryExpression {
    constructor(op, operand) {
        this.op = op;
        this.operand = operand;
        this.type;
    }
    analyze(context) {
        this.operand.analyze(context);
        if (this.op === "--" || this.op === "++") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER], this.operand.type);
        } else if (this.op === "-") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER, TYPE.FLOAT], this.operand.type);
        } else if (this.op === "!") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.BOOLEAN], this.operand.type);
        }
        this.type = this.operand.type;
        return this;
    }
    optimize() {
       return this; 
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
};