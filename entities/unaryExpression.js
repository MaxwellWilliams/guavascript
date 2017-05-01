const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');
const IntLit = require('./intLit.js');
const FloatLit = require('./floatLit.js');
const BoolLit = require('./boolLit.js');

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
      if(this.op = '-' && this.type === TYPE.INTEGER) {
        return new IntLit(-this.operand.value);
      } else if(this.op = '-' && this.type === TYPE.FLOAT) {
        return new FloatLit(-this.operand.value)
      } else if(this.op = '!' && this.type === TYPE.BOOLEAN) {
        return new BoolLit(!this.operand.value)
      } else {
        this.operand.optimize();
        return this;
      }
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
};