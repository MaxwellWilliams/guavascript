const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class IntLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.INTEGER;
    }
    analyze(context) {}
    optimize() {
        
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.value})`;
    }
};