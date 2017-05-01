const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class StringLit {
    constructor(value) {
        this.value = value.substring(1, value.length - 1);
        this.type = TYPE.STRING;
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