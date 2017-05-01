const getIndent = require('../semantics/getIndent.js');

module.exports = class ClassId {
    constructor(className, rest) {
        this.className = className;
        this.rest = rest;
    }
    analyze(context) {
        return this;
    }
    optimize() {
        return this;
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(\n${this.className.toString()}`
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
};