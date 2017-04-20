const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class FloatLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.FLOAT;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.value})`;
    }
};