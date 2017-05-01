const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class BoolLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.BOOLEAN;
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