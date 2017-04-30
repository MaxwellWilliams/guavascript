const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class Tuple {
    constructor(values) {
        this.values = values;
        this.type = TYPE.TUPLE;
        this.valueTypes = undefined;
    }
    analyze(context) {
        this.values.analyze(context);
        this.valueTypes = this.values.type;
    }
    optimize() {
        
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Tuple` +
               `\n${this.values.toString(++indent)}` +
               `\n${getIndent(--indent)})`;
    }
};