const getIndent = require('../semantics/getIndent.js');

module.exports = class ConstId {
  constructor(firstWord, rest) {
    this.words = firstWord;
    this.rest = rest;
  }
  analyze(context) {
    return this;
  }
  optimize() {
    return this;
  }
  toString(indent = 0) {
    let string = `${getIndent(indent)}(\n${this.firstWord.toString()}`;
    for (const char in this.rest) {
      string += `\n${this.rest[char].toString()}`;
    }
    string += ')';
    return string;
  }
};
