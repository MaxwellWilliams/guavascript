const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

function pushUndefinedAndType(array, type) {
  if (type === undefined) {
    array.push([undefined, undefined]);
  } else {
    array.push([undefined, type]);
    array.push([type, undefined]);
  }
}

module.exports = class AssignmentStatement {
  constructor(idExp, assignOp, exp) {
    this.idExp = idExp;
    this.idExpBody = idExp.idExpBody;
    this.idPostOp = idExp.idPostOp;
    this.assignOp = assignOp;
    this.exp = exp;
  }
  analyze(context) {
    let idType;
    this.exp.analyze(context);
    this.id = this.idExpBody.id;
    this.type = this.exp.type;

    // If variable is being declared temporarily make type null
    if (context.inClassDelaration && (this.idExpBody.idExpBase.id === 'this')) {
      context.addProperityToId(context.currentClassId, this.exp, this.idExpBody.idAppendage.id);
      return;
    }

    if (context.getId(this.id, true) !== undefined) {
      this.idExpBody.analyze(context);
      idType = this.idExpBody.type;
    }
    let expectedTypePairs;

    if (this.assignOp === '=') {
      if (this.type === TYPE.DICTIONARY) {
        context.setVariable(this.id, undefined, this.type);
        for (const properity of this.exp.properities) {
          context.addProperityToId(this.id, { type: properity.type }, properity.id);
        }
      } else if (this.type === TYPE.LIST || this.type === TYPE.TUPLE) {
        context.setVariable(this.id, undefined, this.type);
        if (this.exp.valueTypes) {
          for (const properity of this.exp.valueTypes) {
            context.addProperityToId(this.id, { type: properity.type });
          }
        }
      } else {
        context.setVariable(this.id, this.exp.value, this.type);
      }
    } else {
      if (this.assignOp === '+=') {
        expectedTypePairs = [
          [TYPE.INTEGER, TYPE.INTEGER],
          [TYPE.INTEGER, TYPE.FLOAT],
          [TYPE.FLOAT, TYPE.INTEGER],
          [TYPE.FLOAT, TYPE.FLOAT],
          [TYPE.STRING, TYPE.STRING],
          [TYPE.LIST, TYPE.LIST],
        ];

        if (context.inFunctionDelaration) {
          pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
          pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
          pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
          pushUndefinedAndType(expectedTypePairs, TYPE.LIST);
          pushUndefinedAndType(expectedTypePairs, undefined);
        }
      } else if (this.assignOp === '*=') {
        expectedTypePairs = [
          [TYPE.INTEGER, TYPE.INTEGER],
          [TYPE.INTEGER, TYPE.FLOAT],
          [TYPE.FLOAT, TYPE.INTEGER],
          [TYPE.FLOAT, TYPE.FLOAT],
          [TYPE.STRING, TYPE.STRING],
          [TYPE.STRING, TYPE.INTEGER],
        ];

        if (context.inFunctionDelaration) {
          pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
          pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
          pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
          pushUndefinedAndType(expectedTypePairs, undefined);
        }
      } else if (['-=', '/='].indexOf(this.assignOp) > -1) {
        expectedTypePairs = [
          [TYPE.INTEGER, TYPE.INTEGER],
          [TYPE.INTEGER, TYPE.FLOAT],
          [TYPE.FLOAT, TYPE.INTEGER],
          [TYPE.FLOAT, TYPE.FLOAT],
        ];

        if (context.inFunctionDelaration) {
          pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
          pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
          pushUndefinedAndType(expectedTypePairs, undefined);
        }
      }

      context.assertBinaryOperandIsOneOfTypePairs(
        this.assignOp,
        expectedTypePairs,
        [idType, this.type]);

      if (context.inFunctionDelaration && this.id && this.idExpBody.type === undefined) {
        const possibleTypes = [];

        for (const typePair of expectedTypePairs) {
          const possibleType = typePair[0];

          if (((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
            possibleTypes.push(possibleType);
          }
        }

        context.managePossibleTypes(this.id, possibleTypes);
      }
      if (context.inFunctionDelaration && this.exp.idExpBody &&
        this.exp.idExpBody.id && this.exp.idExpBody.type === undefined) {
        const possibleTypes = [];

        for (const typePair of expectedTypePairs) {
          const possibleType = typePair[1];

          if (((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
            possibleTypes.push(possibleType);
          }
        }
        context.managePossibleTypes(this.exp.idExpBody.id, possibleTypes);
      }
    }
    return this;
  }
  optimize() {
    this.idExp = this.idExp.optimize();
    this.exp = this.exp.optimize();
    return this;
  }
  toString(indent = 0) {
    return `${getIndent(indent)}(${this.assignOp}` +
           `\n${this.idExp.toString(++indent)}` +
           `\n${this.exp.toString(indent)}` +
           `\n${getIndent(--indent)})`;
  }
};
