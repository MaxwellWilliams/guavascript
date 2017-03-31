const fs = require('fs');
const ohm = require('ohm-js');
const grammarContents = fs.readFileSync('guavascript.ohm');
const grammar = ohm.grammar(grammarContents);
const Context = require('./semantics/context');

const spacer = "  ";

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
        this.block.analyze(context.createChildContextForBlock());
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
    }
    analyze(context) {
        this.body.forEach(s => s.analyze(context));
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

/*******************************
* Statements
* Note: statement toString methods include an `indent` parameter, indicating how indented
* the particular printed statement should be. To illustrate the tree structure, a language
* class passes the `indent` + 1 to its children unless the child is trivial and printed
* directly in the parent node.
*******************************/

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
        this.conditions.forEach(function(c) {
            c.analyze(context);
            context.assertIsTypeBoolean(c);
        });
        this.thenBlocks.forEach(c => c.analyze(context.createChildContextForBlock()));
        if (this.elseBlock) {
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
        this.block.analyze(context.createChildContextForFunction());
        context.setVariable(this.id,
            {
                parameters: this.parameterArray,
                closure: context.symbolTable,
                block: this.block
            },
            "function");
        // TODO: Do we need to analyze the parameters?
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
        return `${spacer.repeat(indent)}(id ${this.id}, default ${this.defaultValue})`;
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
        context.setVariable(this.id, this.block, "class");
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
        this.assignOp = assignOp;
        this.exp = exp;
    }
    analyze(context) {
        this.idExp.analyze(context);
        this.exp.analyze(context);

        // console.log(util.inspect(this, {depth: null}));

        if (this.assignOp == "=") {
            // TODO: Not sure what the input id should be. Change from sourceString when we figure it out
            // console.log(`Set ${this.idExp.id} to ${this.exp} with type ${this.exp.type}`);
            context.setVariable(this.idExp.id, this.exp, this.exp.type);
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
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Return` +
               `\n${this.exp.toString(++indent)}` +
               `\n${spacer.repeat(--indent)})`;
    }
}

/*******************************
* Expressions
*******************************/

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
        // TODO: calculate type in here
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
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
}

class ParenthesisExpression extends Expression {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    analyze() {
        // TODO
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
        this.type;
    }
    analyze(context) {
        this.var.analyze(context);
        this.type = this.var.type;
        // TODO
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
    }
    analyze() {
        // TODO
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
    }
    analyze() {
        // TODO
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
    }
    analyze() {
        // TODO
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
        this.type = "list"
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
        this.type = "tuple"
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
        this.type = "dictionary"
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
        this.type = "integer";
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
        this.type = "float";
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
        this.type = "string";
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
        this.type = "boolean";
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
        this.type = "null"
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
    Param(id, equals, variable) {return new Parameter(id.sourceString, variable.ast())},
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

module.exports.FunctionDeclarationStatement = FunctionDeclarationStatement;
module.exports.Parameter = Parameter;
