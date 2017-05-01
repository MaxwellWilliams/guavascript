const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class List {
    constructor(values) {
        this.values = values;
        this.type = TYPE.LIST;
        this.valueTypes = undefined;
    }
    analyze(context) {
        this.values.analyze(context);
        this.valueTypes = this.values.type;
        return this;
    }
    optimize() {
        this.values.map(v => v.optimize());
        return this;
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(List`;
        if (this.values.length > 0) {
            string += `\n${this.values.toString(++indent)}` +
                      `\n${getIndent(--indent)})`;
        } else {
            string += `)`;
        }
        return string;
    }
};