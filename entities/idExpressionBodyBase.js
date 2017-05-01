const getIndent = require('../semantics/getIndent.js');

module.exports = class IdExpressionBodyBase {
    constructor(id) {
        this.id = id;
        this.type = undefined;
        this.paramType = undefined;
        this.value = undefined;
    }
    analyze(context) {                               // Dont Analyze on initial variable declarations
        let variable = context.getId(this.id);
        this.type = variable.type;
        this.isFunction = variable.isFunction;
        this.paramType = variable.paramType ? variable.paramType : undefined;
        this.value = variable.value;
        return this;
    }
    optimize() {
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.id})`;
    }
};