const getIndent = require('../semantics/getIndent.js');

module.exports = class IdValuePair {
    constructor(id, variable) {
        this.id = id;
        this.variable = variable;
    }
    analyze(context) {
        this.type = this.variable.type;
        return this;
    }
    optimize() {
        this.variable.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.id} : ${this.variable.toString()})`;
    }
};