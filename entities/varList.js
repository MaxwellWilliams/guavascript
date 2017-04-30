const getIndent = require('../semantics/getIndent.js');

module.exports = class VarList {
    constructor(variables) {
        this.variables = variables;
        this.length = variables.length;
        this.type = undefined;
    }
    analyze(context) {
        this.type = [];
        for(var variableCounter in this.variables) {
            var variable = this.variables[variableCounter];
            variable.analyze(context);
            this.type.push(variable.type);
        }
    }
    optimize() {
        
    }
    toString(indent = 0) {
        var string = `${getIndent(indent++)}(VarList`;
        if (this.variables.length !== 0) {
            for (var variable in this.variables) {
                string += `\n${this.variables[variable].toString(indent)}`
            }
            string += `\n${getIndent(--indent)})`;
        } else {
          string += `)`;
        }
        return string;
    }
};