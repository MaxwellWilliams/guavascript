const getIndent = require('../semantics/getIndent.js');

module.exports = class PeriodId {
    constructor(id) {
        this.id = id;
        this.op = "."
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.id.toString(++indent)})`;
    }
};