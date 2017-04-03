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
        this.returnType;
        this.numberOfReturnStatements = 0;
    }
    analyze(context) {
        let self = this;
        this.body.forEach(function(statement) {
            statement.analyze(context);
            if (statement.constructor === ReturnStatement) {
                self.numberOfReturnStatements++;
                if (self.numberOfReturnStatements <= 1) {
                    self.returnType = statement.returnType;
                } else {
                    context.throwMultipleReturnsInABlockError();
                }
            }
        });

        context.assertAllLocalVarsUsed()
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

class Statement {
}

// Use this for both conditional and if/else statement
class BranchStatement extends Statement {
    constructor(conditions, thenBlocks, elseBlock) {
        super();
        this.conditions = conditions;
        this.thenBlocks = thenBlocks;
        this.elseBlock = elseBlock;
    }
    analyze(context) {
        this.conditions.forEach(function(condition) {
            condition.analyze(context);
            context.assertIsTypeBoolean(condition);
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

class FunctionDeclarationStatement extends Statement {
    constructor(id, parameterArray, block) {
        super();
        this.id = id;
        this.parameterArray = parameterArray;
        this.block = block;
    }
    analyze(context) {

        let blockContext = context.createChildContextForFunction(this);
        let self = this;

        // If there is a default value, instantiate the variable in the block.
        // For all vars with a default, then they must match the type.
        this.parameterArray.forEach(function(parameter) {
            if (parameter.defaultValue !== null) {
                parameter.defaultValue.analyze(context);
                blockContext.setVariable(parameter.id, parameter.defaultValue.type);
            } else {
                blockContext.setVariable(parameter.id, "NULL");
            }
        });

        // But what about ambiguous variables? They will automatically be added to the
        // context as they are declared. We would want the type of the first declaration
        // to be the official type of the var. So, we get type checking for non-default vars
        // in the rest of the function for free.

        this.block.analyze(blockContext);

        let signature = [];

        // But, we still must check that the non-default variables were used.
        // this.parameterArray.forEach(function(parameter) {
        //     if (parameter.defaultValue == null) {

        //         let entry = self.block.context.get(
        //             parameter.id,
        //             true,  // silent = true
        //             true  // onlyThisContext = true
        //         );
        //         if (!entry) {
        //             context.declareUnusedLocalVariable(parameter.id);
        //         }
        //     }
        //     // At the same time, build the parameters signature
        //     signature.push(context.get(parameter.id).type);
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
    }
    analyze() {
        // TODO: I'm not sure there is anything semantic-wise to check here...
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

class ClassDeclarationStatement extends Statement {
    constructor(id, block) {
        super();
        this.id = id;
        this.block = block;
    }
    analyze(context) {
        this.block.analyze(context.createChildContextForBlock());
        context.setVariable(this.id, {type: TYPE.CLASS});
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Class` +
               `\n${spacer.repeat(++indent)}(id ${this.id})` +
               `\n${this.block.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class MatchStatement extends Statement {
    constructor(matchExp) {
        super();
        this.matchExp = matchExp;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${this.matchExp.toString(indent)}`;
    }
}

class WhileStatement extends Statement {
    constructor(exp, block) {
        super();
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

class ForInStatement extends Statement {
    constructor(id, iDExp, block) {
        super();
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

class PrintStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Print` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class AssignmentStatement extends Statement {
    constructor(idExp, assignOp, exp) {
        super();
        this.idExp = idExp;
        this.idExpBody = idExp.idExpBody;
        this.idPostOp = idExp.idPostOp;
        this.assignOp = assignOp;
        this.exp = exp;
    }
    analyze(context) {
        // If variable is being declared temporarily make type null
        if(context.get(this.idExpBody.id, true) == undefined) {
            context.setVariable(this.idExpBody.id, null)
        }

        this.exp.analyze(context);

        let expectedPairs;
        let idType = this.idExpBody.type;
        // console.log(util.inspect(this, {depth: null}));

        if (this.assignOp == "=") {
            context.setVariable(this.idExpBody.id, this.exp.type);
            this.idExpBody.analyze(context);
        } else {
            if (this.assignOp == "+=") {
                expectedPairs = [
                    [TYPE.INTEGER, TYPE. INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                    [TYPE.STRING, TYPE.STRING]
                ];
            } else if (this.assignOp == "*=") {
                expectedPairs = [
                    [TYPE.INTEGER, TYPE. INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                    [TYPE.STRING, TYPE.STRING],
                    [TYPE.STRING, TYPE.INTEGER]
                ];
            } else if (["-=", "/="].indexOf(this.assignOp) > -1) {
                expectedPairs = [
                    [TYPE.INTEGER, TYPE.INTEGER],
                    [TYPE.INTEGER, TYPE.FLOAT],
                    [TYPE.FLOAT, TYPE.INTEGER],
                    [TYPE.FLOAT, TYPE.FLOAT],
                ];
            }
            context.assertBinaryOperandIsOneOfTypePairs(
                this.assignOp,
                expectedPairs,
                [idType, this.exp.type]
            );
        }
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.assignOp}` +
               `\n${this.idExp.toString(++indent)}` +
               `\n${this.exp.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class IdentifierStatement extends Statement {
    constructor(iDExp) {
        super();
        this.iDExp = iDExp;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Identifier Statement` +
              `\n${this.iDExp.toString(++indent)}` +
              `\n${spacer.repeat(--indent)})`;
    }
}

class ReturnStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
        this.returnType;
    }
    analyze(context) {
        context.assertReturnInFunction();
        this.exp.analyze(context);
        this.returnType = this.exp.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Return` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class Expression {
}

class MatchExpression extends Expression {
    constructor(idExp, varArray, matchArray, matchFinal) {
        super();
        this.idExp = idExp;
        this.varArray = varArray;
        this.matchArray = matchArray;
        this.matchFinal = matchFinal;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Match Expression` +
                     `\n${this.idExp.toString(++indent)}` +
                     `\n${spacer.repeat(indent++)}(Matches`;
        if (this.varArray.length != 0 && this.varArray.length == this.matchArray.length) {
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
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${this.matchee.toString(indent)}`;
    }
}

class BinaryExpression extends Expression {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
        this.type;
    }
    analyze(context) {

        this.left.analyze(context);
        this.right.analyze(context);

        let expectedPairs;

        function appendNullToExpectedPairs(otherType) {
            expectedPairs.push([TYPE.NULL, otherType]);
            expectedPairs.push([otherType, TYPE.NULL]);
        }

        if (this.op == "||" || this.op == "&&") {
            expectedPairs = [[TYPE.BOOLEAN, TYPE.BOOLEAN]];
        } else if (this.op == "+") {
            expectedPairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.STRING, TYPE.STRING],
                [TYPE.LIST, TYPE.LIST],
                [TYPE.DICTIONARY, TYPE.DICTIONARY]
            ];

            if (context.currentFunction) {
                appendNullToExpectedPairs(TYPE.INTEGER);
                appendNullToExpectedPairs(TYPE.FLOAT);
                appendNullToExpectedPairs(TYPE.STRING);
                appendNullToExpectedPairs(TYPE.LIST);
                appendNullToExpectedPairs(TYPE.DICTIONARY);
                appendNullToExpectedPairs(TYPE.NULL);
            }

        } else if (["-", "/", "<=", "<", ">=", ">", "^"].indexOf(this.op) > -1) {
            expectedPairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT]
            ];

            if (context.currentFunction) {
                appendNullToExpectedPairs(TYPE.INTEGER);
                appendNullToExpectedPairs(TYPE.FLOAT);
                appendNullToExpectedPairs(TYPE.NULL);
            }

        } else if (this.op == "*") {
            expectedPairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.STRING, TYPE.INTEGER]         //?
            ];

            if (context.currentFunction) {
                appendNullToExpectedPairs(TYPE.INTEGER);
                appendNullToExpectedPairs(TYPE.FLOAT);
                appendNullToExpectedPairs(TYPE.NULL);
            }


        } else if (this.op == "//" || this.op == "%") {
            expectedPairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.INTEGER]
            ];

            if (context.currentFunction) {
                appendNullToExpectedPairs(TYPE.INTEGER);
                appendNullToExpectedPairs(TYPE.FLOAT);
                appendNullToExpectedPairs(TYPE.NULL);
            }

        } else if (this.op == "==" || this.op == "!=") {
            expectedPairs = allTypePairs;
        }

        context.assertBinaryOperandIsOneOfTypePairs(
            this.op,
            expectedPairs,
            [this.left, this.right]
        );

        // Important: the type of the expression is always the type of it's left operand
        // Example: "string" * 5 is TYPE.STRING
        this.type = this.left.type;

    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}` +
               `\n${this.left.toString(++indent)}` +
               `\n${this.right.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class UnaryExpression extends Expression {
    constructor(op, operand) {
        super();
        this.op = op;
        this.operand = operand;
        this.type;
    }
    analyze(context) {
        this.operand.analyze(context);
        if (this.op == "--" || this.op == "++") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER], this.operand.type);
        } else if (this.op == "-") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.INTEGER, TYPE.FLOAT], this.operand.type);
        } else if (this.op == "!") {
            context.assertUnaryOperandIsOneOfTypes(this.op, [TYPE.BOOLEAN], this.operand.type);
        }
        this.type = this.operand.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
}

class ParenthesisExpression extends Expression {
    constructor(exp) {
        super();
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

class Variable extends Expression {
    constructor(variable) {
        super();
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

class IdExpression extends Expression {
    constructor(idExpBody, idPostOp) {
        super();
        this.idExpBody = idExpBody;
        this.idPostOp = idPostOp;
        this.id;  // baseline identifier. example: x in x.doThis(3)[1].lalala
        this.type;
    }
    analyze(context) {
        this.idExpBody.analyze(context);
        if (this.idPostOp == "++" || this.idPostOp == "--") {
            context.assertUnaryOperandIsOneOfTypes(this.idPostOp, [TYPE.INTEGER], this.idExpBody.type)
        }
        this.id = this.idExpBody.id;
        this.type = this.idExpBody.type;
    }
    toString(indent = 0) {
        return  `${spacer.repeat(indent)}(IdExpression\n` +
                `${this.idExpBody.toString(++indent)}` +
                `${(this.idPostOp.length === 0) ? "" : `\n${spacer.repeat(++indent)}${this.idPostOp}`}` +
                `\n${spacer.repeat(--indent)})`;
    }
}

class IdExpressionBodyRecursive {
    constructor(idExpBody, idAppendage) {
        this.idExpBody = idExpBody;
        this.idAppendage = idAppendage;
        this.appendageOp = idAppendage === 'undefined' ? 'undefined' : idAppendage.getOp();
        this.id;
        this.type;
    }
    analyze(context) {
        this.idExpBody.analyze(context);
        this.id = this.idExpBody.id;
        this.type = this.idExpBody.type;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.appendageOp}` +
               `\n${this.idExpBody.toString(++indent)}` +
               `\n${this.idAppendage.toString(indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class IdExpressionBodyBase {
    constructor(id) {
        this.id = id;
        this.type = undefined;
    }
    analyze(context) {
        // let entry = context.get(this.id, true);
        // this.type = (typeof entry !== undefined) ? entry.type : "undefined";

        // this.type = context.get(this.id).type;  TODO: Is this necessicary (Max removed it)
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id})`;
    }
}

class PeriodId {
    constructor(id) {
        this.id = id;
    }
    analyze() {
        // TODO
    }
    getOp() {
        return ".";
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id.toString(++indent)})`;
    }
}

class Arguments {
    constructor(args) {
        this.args = args;
    }
    analyze() {
        // TODO
    }
    getOp() {
        return "()";
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Arguments`;
        if (this.args.length > 0) {
            string += `\n${this.args.toString(++indent)}` +
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
    }
    analyze() {
        // TODO
    }
    getOp() {
        return "[]";
    }
    toString(indent = 0) {
        return `${this.variable.toString(indent)}`;
    }
}

class List {
    constructor(varList) {
        this.varList = varList;
        this.type = TYPE.LIST;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(List`;
        if (this.varList.length > 0) {
            string += `\n${this.varList.toString(++indent)}` +
                      `\n${spacer.repeat(--indent)})`;
        } else {
            string += `)`;
        }
        return string;
    }
}

class Tuple {
    constructor(elems) {
        this.elems = elems;
        this.type = TYPE.TUPLE
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Tuple` +
               `\n${this.elems.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

class Dictionary {
    constructor(idValuePairs) {
        this.idValuePairs = idValuePairs;
        this.type = TYPE.DICTIONARY
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent++)}(Dictionary`
        if (this.idValuePairs.length !== 0) {
            for (var pairIndex in this.idValuePairs) {
                string += `\n${this.idValuePairs[pairIndex].toString(indent)}`;
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
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id} : ${this.variable.toString()})`;
    }
}

class VarList {
    constructor(variables) {
        this.variables = variables;
        this.length = variables.length;
    }
    analyze() {
        // TODO
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
    constructor(digits) {
        this.digits = digits;
        this.type = TYPE.INTEGER;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.digits})`;
    }
}

class FloatLit {
    constructor(value) {
        this.value = value;
        this.type = TYPE.FLOAT;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class StringLit {
    constructor(value) {
        this.value = value.substring(1, value.length - 1);
        this.type = TYPE.STRING;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.value})`;
    }
}

class BoolLit {
    constructor(boolVal) {
        this.boolVal = boolVal;
        this.type = TYPE.BOOLEAN;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.boolVal})`;
    }
}

class NullLit {
    constructor() {
        this.type = TYPE.NULL
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(null)`;
    }
}

class IdVariable {
    constructor(value) {
        this.value = value;
    }
    analyze() {
        // TODO
    }
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
    Statement_identifier(iDExp) {return new IdentifierStatement(iDExp.ast());},
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
    ParenExp_pass(variable) {return new Variable(variable.ast());},
    Var(input) {return new Variable(input.ast());},

    IdExp(idExpBody, idPostOp) {return new IdExpression(idExpBody.ast(), idPostOp.ast());},
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
    id_constant(constId) {return new constId(this.sourceString)},                  //TODO: fix constID
    idrest(character) {return character},
    constId(underscores, words) {return new ConstId(words)},
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

global.FunctionDeclarationStatement = FunctionDeclarationStatement;
global.Parameter = Parameter;
global.TYPE = TYPE;
