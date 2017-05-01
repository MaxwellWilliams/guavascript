module.exports = class IdSelector {
    constructor(variable) {
        this.variable = variable;
        this.op = '[]';
        this.id = undefined;
    }
    analyze(context) {
        this.id = this.variable.value;
        return this;
    }
    optimize() {
       return this; 
    }
    toString(indent = 0) {
        return `${this.variable.toString(indent)}`;
    }
};