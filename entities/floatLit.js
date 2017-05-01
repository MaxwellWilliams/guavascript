const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class FloatLit {
    constructor(value) {
        this.value = Number(value);
        this.type = TYPE.FLOAT;
    }
    analyze(context) {
        return this;
    }
    optimize() {
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.value})`;
    }
};