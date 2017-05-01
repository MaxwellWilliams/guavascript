const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

function pushUndefinedAndType(array, type) {
    if(type === undefined) {
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
        let idType = undefined;
        this.exp.analyze(context);
        this.id = this.idExpBody.id;
        this.type = this.exp.type;

        // If variable is being declared temporarily make type null
        if(context.inClassDelaration && (this.idExpBody.idExpBase.id === 'this')) {
            context.addProperityToId(context.currentClassId, this.exp, this.idExpBody.idAppendage.id)
            return;
        }

        if(context.getId(this.id, true) !== undefined) {
            this.idExpBody.analyze(context);
            idType = this.idExpBody.type;
        }
        let expectedTypePairs;

        if (this.assignOp === "=") {
            context.setVariable(this.id, this.type);

            if(this.type === TYPE.DICTIONARY) {
                for(var properityCounter in this.exp.properities) {
                    var properity = this.exp.properities[properityCounter];
                    context.addProperityToId(this.id, { type: properity.type }, properity.id);
                }
            } else if(this.type === TYPE.LIST || this.type === TYPE.TUPLE) {
              for(var properityCounter in this.exp.valueTypes) {
                  var properity = this.exp.valueTypes[properityCounter];
                  context.addProperityToId(this.id, { type: properity.type });
              }
            }
        } else {
            if (this.assignOp === "+=") {
                expectedTypePairs = [
                    [TYPE.INTEGER, TYPE.INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                    [TYPE.STRING, TYPE.STRING],
                    [TYPE.LIST, TYPE.LIST]
                ];

                if(context.inFunctionDelaration) {
                    pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                    pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                    pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
                    pushUndefinedAndType(expectedTypePairs, TYPE.LIST);
                    pushUndefinedAndType(expectedTypePairs, undefined);
                }
            } else if (this.assignOp === "*=") {
                expectedTypePairs = [
                    [TYPE.INTEGER, TYPE.INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                    [TYPE.STRING, TYPE.STRING],
                    [TYPE.STRING, TYPE.INTEGER]
                ];

                if(context.inFunctionDelaration) {
                    pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                    pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                    pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
                    pushUndefinedAndType(expectedTypePairs, undefined);
                }
            } else if (["-=", "/="].indexOf(this.assignOp) > -1) {
                expectedTypePairs = [
                    [TYPE.INTEGER, TYPE.INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                ];

                if(context.inFunctionDelaration) {
                    pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                    pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                    pushUndefinedAndType(expectedTypePairs, undefined);
                }
            }

            context.assertBinaryOperandIsOneOfTypePairs(
                this.assignOp,
                expectedTypePairs,
                [idType, this.type]
            );

            if(context.inFunctionDelaration && this.id && this.idExpBody.type === undefined) {
                var possibleTypes = [];

                for(var typePairCounter in expectedTypePairs) {
                    var possibleType = expectedTypePairs[typePairCounter][0];

                    if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
                        possibleTypes.push(possibleType);
                      }
                }
                context.managePossibleTypes(this.id, possibleTypes);
            }
            if(context.inFunctionDelaration && this.exp.idExpBody &&
               this.exp.idExpBody.id && this.exp.idExpBody.type === undefined) {
                var possibleTypes = [];

                for(var typePairCounter in expectedTypePairs) {
                    var possibleType = expectedTypePairs[typePairCounter][1];

                    if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
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