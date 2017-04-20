const getIndent = require('../semantics/getIndent.js');

module.exports = class Arguments {
    constructor(varList) {
        this.varList = varList;
        this.op = "()";
        this.type = undefined;
    }
    analyze(context) {
        this.varList.analyze(context);
        this.type = this.varList.type;
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(Arguments`;
        if (this.varList.length > 0) {
            string += `\n${this.varList.toString(++indent)}` +
                      `\n${getIndent(--indent)})`;
        } else {
          string += `)`
        }
        return string;
    }
};