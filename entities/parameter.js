const getIndent = require('../semantics/getIndent.js');

module.exports = class Parameter {
    constructor(id, defaultValue) {
        this.id = id;
        this.defaultValue = defaultValue;
        this.type = undefined;
    }
    analyze(context) {
        if(this.defaultValue) {
            this.defaultValue.analyze(context);
            this.type = this.defaultValue.type;
        }
    }
    optimize() {
        
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(id ${this.id}`;
        if(this.defaultValue !== null) {
            string += `, default ${this.defaultValue}`;
        }
        string += `)`
        return string
    }
};