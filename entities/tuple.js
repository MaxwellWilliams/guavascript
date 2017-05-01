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
        return this;
    }
    optimize() {
        // why isn't values recognized as an array like list?
        // this.values.map(v => v.optimize());

        this.values.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(Tuple` +
               `\n${this.values.toString(++indent)}` +
               `\n${getIndent(--indent)})`;
    }
};