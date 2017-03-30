const fs = require('fs');
const ohm = require('ohm-js');
const grammarContents = fs.readFileSync('guavascript.ohm');
const grammar = ohm.grammar(grammarContents);
const Context = require('./semantics/context');

const spacer = "    ";

function unpack(a) {
  return a.length === 0 ? null : a[0];
}

class Program {
    constructor(block) {
        this.block = block;
    }
    analyze(context = new Context()) {
        console.log("DEBUG: Program analyzing");
        this.block.analyze(context.createChildContextForBlock());
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Program\n${this.block.toString(++indent)})`;
    }
}

class Block {
    constructor(body) {
        this.body = body;
    }
    analyze(context) {
        console.log("DEBUG: Block analyzing");
        this.body.forEach(s => s.analyze(context));
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Block`;
        indent++;
        for (var statementIndex in this.body) {
            string += `\n${this.body[statementIndex].toString(indent)}`;
        }
        string += `)`;
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
    constructor(cases, elseBlock) {
        super();
        this.cases = cases;
        this.elseBlock = elseBlock[0];
    }
    analyze(context) {
        console.log("DEBUG: BranchStatement analyzing");
        this.cases.forEach(c => c.analyze(context));
        if (this.elseBlock) {
            this.elseBlock.analyze(context.createChildContextForBlock());
        }
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(if`;
        indent++;
        for (var i in this.cases) {
            string += `\n${this.cases[i].toString(indent)}`;
        }
        if (typeof this.elseBlock != 'undefined') {
            string += `\n${this.elseBlock.toString(indent)}`;
        }
        string += `)`;
        return string;
    }
}

class Case {
    constructor(exp, block) {
        this.exp = exp;
        this.block = block;
    }
    analyze(context) {
        console.log("DEBUG: Case analyzing");
        // TODO: How to check that this.exp is of type BOOL?
        this.exp.analyze(context);
        this.block.analyze(context.createChildContextForBlock);
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(case${(this.exp === 'undefined') ? "" : `\n${this.exp.toString(++indent)}`}\n${this.block.toString(++indent)})`;
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
        console.log("DEBUG: FunctionDeclarationStatement analyzing");
        context.assertVariableIsNotAlreadyDeclared(this.id);
        this.block.analyze(context.createChildContextForFunction());
        context.addVariable(this.id,
            {
                parameters: this.parameterArray,
                closure: context.symbolTable,
                block: this.block
            },
            "function");
        // TODO: Do we need to analyze the parameters?
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Func\n${spacer.repeat(++indent)}(id ${this.id})\n${spacer.repeat(indent)}(Parameters`;
        indent++;
        if (this.parameterArray !== [] && this.parameterArray !== [null] && this.parameterArray !== null) {
            for (var parameterIndex in this.parameterArray) {
                string += `\n${this.parameterArray[parameterIndex].toString(indent)}`;
            }
        }
        string += `)\n${this.block.toString(--indent)})`;
        return string;
    }
}

class Parameter {
    constructor(id, defaultValue) {
        this.id = id;
        this.defaultValue = defaultValue;
    }
    analyze() {
        console.log("DEBUG: Parameter analyzing");
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
        console.log("DEBUG: ClassDeclarationStatement analyzing");
        context.assertVariableIsNotAlreadyDeclared(this.id);

        // TODO: I THINK the block should be analyzed before adding it to the context??
        this.block.analyze(context);
        context.addVariable(this.id, this.block, "class");
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Class\n${spacer.repeat(++indent)}(id ${this.id})\n${this.block.toString(indent)})`;
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
        return `${spacer.repeat(indent)}(While\n${this.exp.toString(++indent)}\n${this.block.toString(++indent)})`;
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
        return `${spacer.repeat(indent)}(For id (${this.id}) in\n${this.iDExp.toString(++indent)}\n${this.block.toString(indent)})`;
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
        return `${spacer.repeat(indent)}(Print\n${this.exp.toString(++indent)})`;
    }
}

class AssignmentStatement extends Statement {
    constructor(idExp, assignOp, exp) {
        super();
        this.idExp = idExp;
        this.assignOp = assignOp;
        this.exp = exp;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.assignOp}\n${this.idExp.toString(++indent)}\n${this.exp.toString(indent)})`;
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
        return `${spacer.repeat(indent)}(Identifier Statement\n${this.iDExp.toString(++indent)})`;
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
        return `${spacer.repeat(indent)}(Return\n${this.exp.toString(++indent)})`;
    }
}

/*******************************
* Expressions
*******************************/

class Expression {
}

class MatchExpression extends Expression {
    constructor(idExp, var1, varArray, match1, matchArray, matchFinal) {
        super();
        this.idExp = idExp;
        this.var1 = var1;
        this.varArray = varArray;
        this.match1 = match1;
        this.matchArray = matchArray;
        this.matchFinal = matchFinal[0];
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Match Expression\n${this.idExp.toString(++indent)}\n${spacer.repeat(indent)}(Matches`;
        string += (this.var1.length != 0 && this.match1.length != 0) ? `\n${spacer.repeat(++indent)}(Match\n${this.var1.toString(++indent)} ->\n${this.match1.toString(indent)})` : "";
        if (this.varArray.length == this.matchArray.length && this.varArray.length != 0) {
            for (var varIndex in this.varArray) {
                string += `\n${spacer.repeat(--indent)}(Match\n${this.varArray[varIndex].toString(++indent)} ->\n${this.matchArray[varIndex].toString(indent)})`
            }
        }
        string += (this.matchFinal && this.matchFinal.length != 0) ? `\n${spacer.repeat(--indent)}(Match\n${spacer.repeat(++indent)} _ ->\n${this.matchFinal.toString(indent)})` : "";
        string += "))";
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
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.left.toString(++indent)}\n${this.right.toString(indent)})`;
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
    }
    analyze() {
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
        return `${spacer.repeat(indent)}(IdExpression\n${this.idExpBody.toString(++indent)}${(this.idPostOp.length === 0) ? "" : `\n${spacer.repeat(++indent)}${this.idPostOp}`})`;
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
        return `${spacer.repeat(indent)}(${this.appendageOp}\n${this.idExpBody.toString(++indent)}\n${this.idAppendage.toString(indent)})`;
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
        return `${spacer.repeat(indent)}(Arguments${this.args.toString(++indent)})`;
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
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(List${this.varList.toString(++indent)})`;
    }
}

class Tuple {
    constructor(elems) {
        this.elems = elems;
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Tuple${this.elems.toString(++indent)})`;
    }
}

class Dictionary {
    constructor(idValuePairs) {
        this.idValuePairs = idValuePairs;
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
        }
        string += ")"
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
    constructor(firstVar, varArray) {
        this.firstVar = firstVar;
        this.varArray = (varArray.length == 0) ? [] : varArray[0];
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        var string = (this.firstVar.length === 0) ? "" : `\n${spacer.repeat(indent)}${this.firstVar.toString(indent)}`;
        if (this.varArray.length != 0) {
            for (var variable in this.varArray) {
                string += `\n${this.varArray[variable].toString(indent)}`
            }
        }
        return string;
    }
}

class IntLit {
    constructor(digits) {
        this.digits = digits;
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
    }
    analyze() {
        // TODO
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.boolVal})`;
    }
}

class NullLit {
    constructor() {}
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
    Statement_conditional(exp, question, block1, colon, block2) {return new BranchStatement(new Case(exp.ast(), block1.ast()), block2.ast());},
    Statement_funcDecl(id, lParen, parameter1, commas, parameterArray, rParen, lCurly, block, rCurly) {
        let parameters = parameter1.ast();
        if (unpack(parameterArray.ast()) !== null) {
            parameters = parameters.concat(unpack(parameterArray.ast()));
        }
        return new FunctionDeclarationStatement(id.sourceString, parameters, block.ast());},
    Statement_classDecl(clas, id, lCurly, block, rCurly) {return new ClassDeclarationStatement(id.sourceString, block.ast());},
    Statement_match(matchExp) {return new MatchStatement(matchExp.ast());},
    Statement_ifElse(i, exp, lCurly1, block1, rCurly1, els, lCurly2, block2, rCurly2) {return new BranchStatement(new Case(exp.ast(), block1.ast()), block2.ast());},
    Statement_while(whil, exp, lCurly, block, rCurly) {return new WhileStatement(exp.ast(), block.ast());},
    Statement_forIn(fo, id, iN, iDExp, lCurly, block, rCurly) {return new ForInStatement(id.sourceString, iDExp.ast(), block.ast());},
    Statement_print(print, lCurly, exp, rCurly) {return new PrintStatement(exp.ast());},
    Statement_assign(idExp, assignOp, exp) {return new AssignmentStatement(idExp.ast(), assignOp.sourceString, exp.ast());},
    Statement_identifier(iDExp) {return new IdentifierStatement(iDExp.ast());},
    Statement_return(ret, exp) {return new ReturnStatement(exp.ast());},
    MatchExp(matchStr, idExp, wit, line1, var1, match1, lines, varArray, matchArray, lineFinal, _, matchFinal) {return new MatchExpression(idExp.ast(), var1.ast(), varArray.ast(), match1.ast(), matchArray.ast(), matchFinal.ast());},
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
        let pairs = IdValuePair.ast();
        if (unpack(IdValuePairs.ast()) !== null) {
            pairs = pairs.concat(unpack(IdValuePairs.ast()));
        }
        return new Dictionary(pairs);},
    IdValuePair(id, colon, variable) {return new IdValuePair(id.sourceString, variable.ast());},
    VarList(firstElem, commas, restElems) {return new VarList(firstElem.ast(), restElems.ast());},
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
