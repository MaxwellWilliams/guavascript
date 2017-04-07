const fs = require('fs');
const ohm = require('ohm-js');
const grammarContents = fs.readFileSync('guavascript.ohm');
const grammar = ohm.grammar(grammarContents);
const Context = require('./semantics/context');

const spacer = "  ";

const TYPE = {
    BOOLEAN: "BOOLEAN",
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    STRING: "STRING",
    LIST: "LIST",
    DICTIONARY: "DICTIONARY",
    TUPLE: "TUPLE",
    FUNCTION: "FUNCTION",
    CLASS: "CLASS",
    NULL: "NULL"
}

function defineTypePairs() {
    allTypePairs = [];
    for (let i in TYPE) {
        if (TYPE.hasOwnProperty(i)) {
            for (let j in TYPE) {
                if (TYPE.hasOwnProperty(j)) {
                    allTypePairs.push([i, j]);
                }
            }
        }
    }
}
defineTypePairs();

function unpack(elem) {
    elem = elem.ast();
    elem = Array.isArray(elem) ? elem : [elem];
    return elem.length === 0 ? null : elem[0];
}

function joinParams(parameter, parameters) {
    parameter = Array.isArray(parameter.ast()) ? parameter.ast() : [parameter.ast()];
    if (unpack(parameters) !== null) {
        return parameter.concat(unpack(parameters));
    }
    return parameter;
}

function pushUndefinedAndType(array, type) {
    if(type === undefined) {
        array.push([undefined, undefined]);
    } else {
        array.push([undefined, type]);
        array.push([type, undefined]);
    }
}


class Program {
    constructor(block) {
        this.block = block;
    }
    analyze(context = new Context()) {

        // Don't use createChildContextForBlock since we don't want an extra level.
        // context.parent should equal null.
        this.block.analyze(context);
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Program` +
               `\n${this.block.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class Block {
    constructor(body) {
        this.body = body;
        this.numberOfReturnStatements = 0;
        this.returnType = undefined;
    }
    analyze(context) {
        for(var statementCounter in this.body) {
            var statement = this.body[statementCounter];
            statement.analyze(context);
            if (statement.constructor === ReturnStatement) {
                this.numberOfReturnStatements++;
                if (this.numberOfReturnStatements <= 1) {
                    this.returnType = statement.returnType;
                } else {
                    context.throwMultipleReturnsInABlockError();
                }
            }
        }
        if(!context.inClassDelaration) {
            context.assertAllLocalVarsUsed();
        }
    }

    toString(indent = 0) {
        var string = `${spacer.repeat(indent++)}(Block`;
        for (var statementIndex in this.body) {
            string += `\n${this.body[statementIndex].toString(indent)}`;
        }
        string += `\n${spacer.repeat(--indent)})`;
        return string;
    }
}

// Use this for both conditional and if/else statement
class BranchStatement {
    constructor(conditions, thenBlocks, elseBlock) {
        this.conditions = conditions;
        this.thenBlocks = thenBlocks;
        this.elseBlock = elseBlock;
    }
    analyze(context) {
        this.conditions.forEach(function(condition) {
            condition.analyze(context);
            context.assertConditionIsBoolean(condition);
        });
        this.thenBlocks.forEach(block => block.analyze(context.createChildContextForBlock()));
        if (this.elseBlock !== null) {
            this.elseBlock.analyze(context.createChildContextForBlock());
        }
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent++)}(If`;
        for (var i in this.conditions) {
            string += `\n${spacer.repeat(indent)}(Case` +
                      `\n${spacer.repeat(++indent)}(Condition` +
                      `\n${this.conditions[i].toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})` +
                      `\n${spacer.repeat(indent)}(Body` +
                      `\n${this.thenBlocks[i].toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})` +
                      `\n${spacer.repeat(--indent)})`;
        }
        if (this.elseBlock !== null) {
            string += `\n${spacer.repeat(indent)}(Else` +
                      `\n${this.elseBlock.toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})`;
        }
        string += `\n${spacer.repeat(--indent)})`;
        return string;
    }
}

class FunctionDeclarationStatement {
    constructor(id, parameterArray, block) {
        this.id = id;
        this.parameterArray = parameterArray;
        this.block = block;
        this.paramType = [];
    }
    analyze(context) {
        let blockContext = context.createChildContextForFunctionDeclaration(this);
        let self = this;

        // If there is a default value, instantiate the variable in the block.
        // For all vars with a default, then they must match the type.
        this.parameterArray.forEach(function(parameter) {
            if (parameter.defaultValue !== null) {
                parameter.defaultValue.analyze(context);
                blockContext.setVariable(parameter.id, parameter.defaultValue.type);
            } else {
                blockContext.setVariable(parameter.id, undefined);
            }
        });

        this.block.analyze(blockContext);

        this.parameterArray.forEach(function(param) {
            var parameter = blockContext.getId(param.id);
            if(parameter.type === undefined) {
                self.paramType.push(parameter.possibleTypes);
            } else {
                self.paramType.push(parameter.type);
            }
        });

        if(context.inClassDelaration) {
            let functionProperities = {
                type: this.block.returnType,
                paramType: this.paramType
            }
            context.addProperityToId(context.currentClassId, functionProperities, this.id)
        } else {
            context.setFunction(this.id, this.block.returnType, this.paramType);
        }

        let signature = [];

        // But, we still must check that the non-default variables were used.
        // this.parameterArray.forEach(function(parameter) {
        //     if (parameter.defaultValue === null) {

        //         let entry = self.block.context.getId(
        //             parameter.id,
        //             true,  // silent = true
        //             true  // onlyThisContext = true
        //         );
        //         if (!entry) {
        //             context.declareUnusedLocalVariable(parameter.id);
        //         }
        //     }
        //     // At the same time, build the parameters signature
        //     signature.push(context.getId(parameter.id).type);
        // });

        // If you can't find a parameter in the block, throw unusedLocalVariable
        // context.setVariable(this.id, {type: TYPE.FUNCTION, returnType: block.returnType, parameters: signature});

    }

    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Func` +
                    `\n${spacer.repeat(++indent)}(id ${this.id})` +
                    `\n${spacer.repeat(indent++)}(Parameters`;
        if (this.parameterArray.length !== 0) {
            for (var parameterIndex in this.parameterArray) {
                string += `\n${this.parameterArray[parameterIndex].toString(indent)}`;
            }
            string += `\n${spacer.repeat(--indent)})`;
        } else {
          string += `)`;
          indent -= 1;
        }
        string += `\n${this.block.toString(indent)}` +
                  `\n${spacer.repeat(--indent)})`;
        return string;
    }
}

class Parameter {
    constructor(id, defaultValue) {
        this.id = id;
        this.defaultValue = defaultValue;
        this.type = undefined;
    }
    analyze(context) {
        if(this.defaultValue) {
            this.defaultValue.analyze(context);
            this.type = this.defaultValue.type;
        }
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(id ${this.id}`;
        if(this.defaultValue !== null) {
            string += `, default ${this.defaultValue}`;
        }
        string += `)`
        return string
    }
}

class ClassDeclarationStatement {
    constructor(id, block) {
        this.id = id;
        this.block = block;
    }
    analyze(context) {
        context.setVariable(this.id, TYPE.CLASS);
        let newContext = context.createChildContextForClassDeclaration(this.id);
        this.block.analyze(newContext);
        context.assertClassHasConstructor(this.id);
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Class` +
               `\n${spacer.repeat(++indent)}(id ${this.id})` +
               `\n${this.block.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class MatchStatement {
    constructor(matchExp) {
        this.matchExp = matchExp;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${this.matchExp.toString(indent)}`;
    }
}

class WhileStatement {
    constructor(exp, block) {
        this.exp = exp;
        this.block = block;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(While` +
          `\n${spacer.repeat(++indent)}(Condition` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})` +
               `\n${spacer.repeat(indent)}(Body` +
               `\n${this.block.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class ForInStatement {
    constructor(id, iDExp, block) {
        this.id = id;
        this.iDExp = iDExp;
        this.block = block;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(For id (${this.id}) in` +
               `\n${this.iDExp.toString(++indent)}` +
               `\n${this.block.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class PrintStatement {
    constructor(exp) {
        this.exp = exp;
    }
    analyze(context) {
        this.exp.analyze(context);
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Print` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class AssignmentStatement {
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

        if(context.getId(this.id, true, true) !== undefined) {
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
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.assignOp}` +
               `\n${this.idExp.toString(++indent)}` +
               `\n${this.exp.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class ReturnStatement {
    constructor(exp) {
        this.exp = exp;
        this.returnType;
    }
    analyze(context) {
        context.assertInFunctionDeclaration();
        this.exp.analyze(context);
        this.returnType = this.exp.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Return` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class MatchExpression {
    constructor(idExp, varArray, matchArray, matchFinal) {
        this.idExp = idExp;
        this.varArray = varArray;
        this.matchArray = matchArray;
        this.matchFinal = matchFinal;
    }
    analyze(context) {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Match Expression` +
                     `\n${this.idExp.toString(++indent)}` +
                     `\n${spacer.repeat(indent++)}(Matches`;
        if (this.varArray.length != 0 && this.varArray.length === this.matchArray.length) {
            for (var varIndex in this.varArray) {
                string += `\n${spacer.repeat(indent)}(Match` +
                          `\n${this.varArray[varIndex].toString(++indent)} ->` +
                          `\n${this.matchArray[varIndex].toString(indent)}` +
                          `\n${spacer.repeat(--indent)})`
            }
        }
        if (this.matchFinal.length > 0) {
          string += `\n${spacer.repeat(indent)}(Match` +
                    `\n${spacer.repeat(++indent)}_ ->` +
                    `\n${spacer.repeat(indent)}${this.matchFinal.toString(indent)}` +
                    `\n${spacer.repeat(--indent)})`;
        }
        string += `\n${spacer.repeat(--indent)})` +
                  `\n${spacer.repeat(--indent)})`;
        return string;
    }
}

class Match {
    constructor(matchee) {
        this.matchee = matchee;
    }
    analyze(context) {
        // TODO
    }
    toString(indent = 0) {
        return `${this.matchee.toString(indent)}`;
    }
}

class BinaryExpression {
    constructor(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
        this.type;
    }
    analyze(context) {
        this.left.analyze(context);
        this.right.analyze(context);
        let expectedTypePairs;

        if (this.op === "||" || this.op === "&&") {
            this.type = TYPE.BOOLEAN;
            expectedTypePairs = expectedTypePairs.push([TYPE.BOOLEAN, TYPE.BOOLEAN]);
        } else if (this.op === "+") {
            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.INTEGER, TYPE.STRING],
                [TYPE.INTEGER, TYPE.LIST],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.STRING],
                [TYPE.FLOAT, TYPE.LIST],
                [TYPE.STRING, TYPE.STRING],
                [TYPE.STRING, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.STRING],
                [TYPE.STRING, TYPE.FLOAT],
                [TYPE.STRING, TYPE.BOOLEAN],
                [TYPE.STRING, TYPE.LIST],
                [TYPE.BOOLEAN, TYPE.STRING],
                [TYPE.BOOLEAN, TYPE.LIST],
                [TYPE.LIST, TYPE.LIST],
                [TYPE.LIST, TYPE.INTEGER],
                [TYPE.LIST, TYPE.FLOAT],
                [TYPE.LIST, TYPE.STRING],
                [TYPE.LIST, TYPE.BOOLEAN]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
                pushUndefinedAndType(expectedTypePairs, TYPE.LIST);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if(["-", "/", "<=", "<", ">=", ">", "^"].indexOf(this.op) > -1) {
            if(["<=", "<", ">=", ">"].indexOf(this.op) > -1) {
                this.type = TYPE.BOOLEAN;
            }

            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if (this.op === "*") {
            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.STRING, TYPE.INTEGER]         //?
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if (this.op === "//" || this.op === "%") {
            if(this.op === "//") {
                this.type = TYPE.INTEGER;
            } else if(this.left.type === TYPE.FLOAT || this.right.type === TYPE.FLOAT) {
                this.type = TYPE.FLOAT;
            } else {
                this.type = TYPE.INTEGER;
            }

            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if (this.op === "==" || this.op === "!=") {
            this.type = TYPE.BOOLEAN

            expectedTypePairs = allTypePairs;

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        }
        context.assertBinaryOperandIsOneOfTypePairs(
            this.op,
            expectedTypePairs,
            [this.left.type, this.right.type]
        );

        if(this.type === undefined) {
            if(this.left.type === TYPE.STRING || this.right.type === TYPE.STRING) {
                this.type = TYPE.STRING;
            } else if(this.left.type === TYPE.FLOAT || this.right.type === TYPE.FLOAT) {
                this.type = TYPE.FLOAT;
            } else {
                this.type = this.left.type;
            }
        }

        if(context.inFunctionDelaration && this.left.id && this.left.type === undefined) {
            var possibleTypes = [];

            for(var typePairCounter in expectedTypePairs) {
                var possibleType = expectedTypePairs[typePairCounter][0];

                if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
                    possibleTypes.push(possibleType);
                  }
            }
            context.managePossibleTypes(this.left.id, possibleTypes)
        }
        if(context.inFunctionDelaration && this.right.id && this.right.type === undefined) {
            var possibleTypes = [];

            for(var typePairCounter in expectedTypePairs) {
                var possibleType = expectedTypePairs[typePairCounter][1];

                if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
                    possibleTypes.push(possibleType);
                  }
            }
            context.managePossibleTypes(this.right.id, possibleTypes)
        }
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}` +
               `\n${this.left.toString(++indent)}` +
               `\n${this.right.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class UnaryExpression {
    constructor(op, operand) {
        this.op = op;
        this.operand = operand;
        this.type;
    }
    analyze(context) {
        this.operand.analyze(context);
        if (this.op === "--" || this.op === "++") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER], this.operand.type);
        } else if (this.op === "-") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER, TYPE.FLOAT], this.operand.type);
        } else if (this.op === "!") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.BOOLEAN], this.operand.type);
        }
        this.type = this.operand.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
}

class ParenthesisExpression {
    constructor(exp) {
        this.exp = exp;
        this.type;
    }
    analyze(context) {
        this.exp.analyze(context);
        this.type = this.exp.type;
    }
    toString(indent = 0) {
        // Don't increase indent, as the semantic meaning of parenthesis are already captured in the tree
        return `${this.exp.toString(indent)}`;
    }
}

class Variable {
    constructor(variable) {
        this.var = variable;
        this.type = "NULL";
    }
    analyze(context) {
        this.var.analyze(context);
        this.type = this.var.type;
    }
    toString(indent = 0) {
        // Don't increase indent, we already know literals and other data types are variables
        return `${this.var.toString(indent)}`;
    }
}

class IdExpression {
    constructor(idExpBody, idPostOp) {
        this.idExpBody = idExpBody;
        this.idPostOp = idPostOp;
        this.id;  // baseline identifier. example: x in x.doThis(3)[1].lalala
        this.type;
    }
    analyze(context) {
        this.idExpBody.analyze(context);

        if (this.idPostOp === "++" || this.idPostOp === "--") {
            context.assertUnaryOperandIsOneOfTypes(this.idPostOp, [TYPE.INTEGER], this.idExpBody.type)
        }

        this.id = this.idExpBody.id;
        this.type = this.idExpBody.type;

        if(this.idExpBody && this.idExpBody.appendageOp === '[]') {
            context.getPropertyFromId(this.id, this.idExpBody.idAppendage.id);
        }
    }
    toString(indent = 0) {
        return  `${spacer.repeat(indent)}(IdExpression\n` +
                `${this.idExpBody.toString(++indent)}` +
                `${(this.idPostOp.length === 0) ? "" : `\n${spacer.repeat(++indent)}${this.idPostOp}`}` +
                `\n${spacer.repeat(--indent)})`;
    }
}

class IdExpressionBodyRecursive {
    constructor(idExpBase, idAppendage) {
        this.idExpBase = idExpBase;
        this.idAppendage = idAppendage;
        this.appendageOp = idAppendage === undefined ? undefined : idAppendage.op;
        this.id;
        this.type;
    }
    analyze(context) {
        this.idExpBase.analyze(context);
        this.idAppendage.analyze(context);
        this.id = this.idExpBase.id;
        this.type = this.idExpBase.type;

        if(this.appendageOp !== undefined && this.type === undefined) {
            if(this.appendageOp === '[]') {
                this.type = TYPE.LIST;
                context.setVariable(this.id, this.type);
            } else if(this.appendageOp === '{}') {
                context.managePossibleTypes(this.id, [TYPE.CLASS, TYPE.DICTIONARY]);
            }
        }

        if(this.idExpBase.isFunction) {
            context.assertIdCalledAsFunction(this.id, this.appendageOp);
            this.idAppendage.analyze(context);
            context.assertFunctionCalledWithValidParams(this.id, this.idExpBase.paramType, this.idAppendage.type);
        }
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.appendageOp}` +
               `\n${this.idExpBase.toString(++indent)}` +
               `\n${this.idAppendage.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class IdExpressionBodyBase {
    constructor(id) {
        this.id = id;
        this.type = undefined;
        this.paramType = undefined;
    }
    analyze(context) {                               // Dont Analyze on initial variable declarations
        let variable = context.getId(this.id);
        this.type = variable.type;
        this.isFunction = variable.isFunction;
        this.paramType = variable.paramType ? variable.paramType : undefined;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id})`;
    }
}

class PeriodId {
    constructor(id) {
        this.id = id;
        this.op = "."
    }
    analyze(context) {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id.toString(++indent)})`;
    }
}

class Arguments {
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
        var string = `${spacer.repeat(indent)}(Arguments`;
        if (this.varList.length > 0) {
            string += `\n${this.varList.toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})`;
        } else {
          string += `)`
        }
        return string;
    }
}

class IdSelector {
    constructor(variable) {
        this.variable = variable;
        this.op = '[]';
        this.id = undefined;
    }
    analyze(context) {
        this.id = this.variable.value;
    }
    toString(indent = 0) {
        return `${this.variable.toString(indent)}`;
    }
}

class List {
    constructor(values) {
        this.values = values;
        this.type = TYPE.LIST;
        this.valueTypes = undefined;
    }
    analyze(context) {
        this.values.analyze(context);
        this.valueTypes = this.values.type;
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(List`;
        if (this.values.length > 0) {
            string += `\n${this.values.toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})`;
        } else {
            string += `)`;
        }
        return string;
    }
}

class Tuple {
    constructor(values) {
        this.values = values;
        this.type = TYPE.TUPLE;
        this.valueTypes = undefined;
    }
    analyze(context) {
        this.values.analyze(context);
        this.valueTypes = this.values.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Tuple` +
               `\n${this.values.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class Dictionary {
    constructor(properities) {
        this.properities = properities;
        this.type = TYPE.DICTIONARY
    }
    analyze(context) {
        for(var properityCounter in this.properities) {
            this.properities[properityCounter].analyze(context);
        }
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent++)}(Dictionary`
        if (this.properities.length !== 0) {
            for (var pairIndex in this.properities) {
                string += `\n${this.properities[pairIndex].toString(indent)}`;
            }
            string += `\n${spacer.repeat(--indent)})`;
        } else {
          string += `)`;
        }
        return string;
    }
}

class IdValuePair {
    constructor(id, variable) {
        this.id = id;
        this.variable = variable;
    }
    analyze(context) {
        this.type = this.variable.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id} : ${this.variable.toString()})`;
    }
}

class VarList {
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
    toString(indent = 0) {
        var string = `${spacer.repeat(indent++)}(VarList`;
        if (this.variables.length !== 0) {
            for (var variable in this.variables) {
                string += `\n${this.variables[variable].toString(indent)}`
            }
            string += `\n${spacer.repeat(--indent)})`;
        } else {
          string += `)`;
        }
        return string;
    }
}

class IntLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.INTEGER;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class FloatLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.FLOAT;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class StringLit {
    constructor(value) {
        this.value = value.substring(1, value.length - 1);
        this.type = TYPE.STRING;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class BoolLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.BOOLEAN;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class NullLit {
    constructor() {
        this.type = TYPE.NULL
        this.value = null;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(null)`;
    }
}

class IdVariable {
    constructor(value) {
        this.value = value;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(\n${this.value})`;
    }
}

class ConstId {
    constructor(firstWord, rest) {
        this.words = firstWord;
        this.rest = rest;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(\n${this.firstWord.toString()}`;
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
}

class ClassId {
    constructor(className, rest) {
        this.className = className;
        this.rest = rest;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(\n${this.className.toString()}`
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
}

// Guavascript CST -> AST
semantics = grammar.createSemantics().addOperation('ast', {
    Program(block) {return new Program(block.ast());},
    Block(statements) {return new Block(statements.ast());},
    Statement_conditional(exp, question, ifBlock, colon, elseBlock) {
      return new BranchStatement([exp.ast()], [ifBlock.ast()], unpack(elseBlock));},
    Statement_funcDecl(id, lParen, parameter1, commas, parameterArray, rParen, lCurly, block, rCurly) {
      return new FunctionDeclarationStatement(id.sourceString, joinParams(parameter1, parameterArray), block.ast());},
    Statement_classDecl(clas, id, lCurly, block, rCurly) {
      return new ClassDeclarationStatement(id.sourceString, block.ast());},
    Statement_match(matchExp) {return new MatchStatement(matchExp.ast());},
    Statement_ifElse(i, ifExp, lCurly1, ifBlock, rCurly1, elif, exps, lCurly2, blocks, rCurly2, els, lCurly3, elseBlock, rCurly3) {
      return new BranchStatement(joinParams(ifExp, exps), joinParams(ifBlock, blocks), unpack(elseBlock));},
    Statement_while(whil, exp, lCurly, block, rCurly) {return new WhileStatement(exp.ast(), block.ast());},
    Statement_forIn(fo, id, iN, iDExp, lCurly, block, rCurly) {
      return new ForInStatement(id.sourceString, iDExp.ast(), block.ast());},
    Statement_print(print, lCurly, exp, rCurly) {return new PrintStatement(exp.ast());},
    Statement_assign(idExp, assignOp, exp) {
      return new AssignmentStatement(idExp.ast(), assignOp.sourceString, exp.ast());},
    Statement_identifier(idExp) {return idExp.ast();},
    Statement_return(ret, exp) {return new ReturnStatement(exp.ast());},
    MatchExp(matchStr, idExp, wit, line1, var1, match1, lines, varArray, matchArray, lineFinal, _, matchFinal) {
        return new MatchExpression(idExp.ast(), [var1.ast()].concat(varArray.ast()), [match1.ast()].concat(matchArray.ast()), matchFinal.ast());},
    Match (arrow, matchee) {return new Match(matchee.ast())},
    Param(id, equals, variable) {return new Parameter(id.sourceString, unpack(variable))},
    Exp_reg(left, op, right) {return new BinaryExpression(left.ast(), op.sourceString, right.ast());},
    Exp_pass(otherExp) {return otherExp.ast();},
    BoolAndExp_reg(left, op, right) {return new BinaryExpression(left.ast(), op.sourceString, right.ast());},
    BoolAndExp_pass(otherExp) {return otherExp.ast()},
    RelExp_reg(left, op, right) {return new BinaryExpression(left.ast(), op.sourceString, right.ast());},
    RelExp_pass(otherExp) {return otherExp.ast();},
    AddExp_reg(left, op, right) {return new BinaryExpression(left.ast(), op.sourceString, right.ast());},
    AddExp_pass(otherExp) {return otherExp.ast();},
    MulExp_reg(left, op, right) {return new BinaryExpression(left.ast(), op.sourceString, right.ast());},
    MulExp_pass(otherExp) {return otherExp.ast();},
    ExponExp_reg(base, op, exponent) {return new BinaryExpression(base.ast(), op.sourceString, exponent.ast());},
    ExponExp_pass(otherExp) {return otherExp.ast();},
    PrefixExp_reg(prefixOp, exp) {return new UnaryExpression(prefixOp.sourceString, exp.ast());},
    PrefixExp_pass(otherExp) {return otherExp.ast();},
    ParenExp_reg(left, exp, right) {return new ParenthesisExpression(exp.ast());},
    ParenExp_pass(variable) {return variable.ast();},
    Var(input) {return input.ast();},

    IdExp(idExpBody, idPostOp) {return new IdExpression(idExpBody.ast(), idPostOp.sourceString);},
    IdExpBody_recursive(idExpBody, selector) {return new IdExpressionBodyRecursive(idExpBody.ast(), selector.ast());},
    IdExpBody_base(id) {return new IdExpressionBodyBase(id.sourceString);},
    periodId(period, id) {return new PeriodId(id.sourceString);},
    Arguments(lParen, args, rParen) {return new Arguments(args.ast());},
    IdSelector(lBracket, variable, rBracket) {return new IdSelector(variable.ast());},
    idPostOp(op) {return op},
    List(lBracket, list, rBracket) {return new List(list.ast());},
    Tuple(lParen, tuple, rParen) {return new Tuple(tuple.ast());},
    Dictionary(lBrace, IdValuePair, commas, IdValuePairs, rBrace) {
        return new Dictionary(joinParams(IdValuePair, IdValuePairs));},
    IdValuePair(id, colon, variable) {return new IdValuePair(id.sourceString, variable.ast());},
    VarList(firstElem, commas, restElems) {return new VarList(joinParams(firstElem, restElems));},
    orOp(operator) {return operator;},
    andOp(operator) {return operator;},
    exponOp(operator) {return operator;},
    assignOp(operator) {return operator;},
    addOp(operator) {return operator;},
    mulOp(operator) {return operator;},
    relOp(operator) {return operator;},
    prefixOp(operator) {return operator;},
    boolLit(boolVal) {return new BoolLit(boolVal.sourceString);},
    intLit(digits) {return new IntLit(this.sourceString);},
    floatLit(digits1, period, digits2) {return new FloatLit(this.sourceString);},
    stringLit(lQuote, content, rQuote) {return new StringLit(this.sourceString)},
    nullLit(nul) {return new NullLit()},
    keyword(word) {return word;},
    id_variable(firstChar, rest) {return new IdVariable(this.sourceString);},
    id_constant(constId) {return constId.ast()},
    idrest(character) {return character},
    constId(underscores, words) {return new ConstId(words)},          //TODO: fix constID
    classId(upper, idrests) {return new ClassId(idrests.ast())}
});

module.exports = (program) => {
  match = grammar.match(program);
  if(match.succeeded()) {
      return semantics(match).ast();
  } else {
    console.log(match.message);
  }
}
