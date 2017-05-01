module.exports = class Variable {
    constructor(variable) {
        this.var = variable;
        this.type = "NULL";
    }
    analyze(context) {
        this.var.analyze(context);
        this.type = this.var.type;
        return this;
    }
    optimize() {
        return this;
    }
    toString(indent = 0) {
        return `${this.var.toString(indent)}`;
    }
};