const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class Dictionary {
  constructor(properities) {
    this.properities = properities;
    this.type = TYPE.DICTIONARY;
  }
  analyze(context) {
    for (const properityCounter in this.properities) {
      this.properities[properityCounter].analyze(context);
    }
    return this;
  }
  optimize() {
    this.properities.map(p => p.optimize());
    return this;
  }
  toString(indent = 0) {
    let string = `${getIndent(indent++)}(Dictionary`;
    if (this.properities.length !== 0) {
      for (const pairIndex in this.properities) {
        string += `\n${this.properities[pairIndex].toString(indent)}`;
      }
      string += `\n${getIndent(--indent)})`;
    } else {
      string += ')';
    }
    return string;
  }
};
