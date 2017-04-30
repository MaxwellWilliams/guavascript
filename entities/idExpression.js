const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class IdExpression {
    constructor(idExpBody, idPostOp) {
        this.idExpBody = idExpBody;
        this.idPostOp = idPostOp !== undefined ? idPostOp[0] : undefined;
        this.id;  // baseline identifier. example: x in x.doThis(3)[1].lalala
        this.type;
    }
    analyze(context) {
        this.idExpBody.analyze(context);

        if (this.idPostOp === "++" || this.idPostOp === "--") {
            context.assertUnaryOperandIsOneOfTypes(this.idPostOp, [TYPE.INTEGER, TYPE.FLOAT], this.idExpBody.type)
        }

        this.id = this.idExpBody.id;
        this.type = this.idExpBody.type;

        if(this.idExpBody && this.idExpBody.appendageOp === '[]') {
            context.getPropertyFromId(this.id, this.idExpBody.idAppendage.id);
        }
    }
    optimize() {
        
    }
    toString(indent = 0) {
        return  `${getIndent(indent)}(IdExpression\n` +
                `${this.idExpBody.toString(++indent)}` +
                `${(this.idPostOp === undefined) ? "" : `\n${getIndent(++indent)}${this.idPostOp}`}` +
                `\n${getIndent(--indent)})`;
    }
};