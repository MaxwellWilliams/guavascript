const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class NullLit {
  constructor() {
    this.type = TYPE.NULL;
    this.value = null;
  }
  analyze(context) {
    return this;
  }
  optimize() {
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(${this.value})`;
  }
};
