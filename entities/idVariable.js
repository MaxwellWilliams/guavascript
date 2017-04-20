const getIndent = require('../semantics/getIndent.js');

module.exports = class IdVariable {
    constructor(value) {
        this.value = value;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${getIndent(indent)}(\n${this.value})`;
    }
};