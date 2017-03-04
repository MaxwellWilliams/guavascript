// A compiler for Ael.
//
// Example usage:
//
//   $ node ael.js --target=[c|js|stack] filename.ael'

/*********************
* Syntax
*********************/

/*
aelGrammar = ohm.grammar(`Ael {
Program = Exp
Exp     = Exp addop Term     --binary
| Term
Term    = Term mulop Factor  --binary
| Factor
Factor  = "-" Primary        --negate
| Primary
Primary = Power
| "(" Exp ")"        --parens
| number
Power   = Primary "^" Primary
addop   = "+" | "-"
mulop   = "*" | "/"
number  = digit+
space  := " " | "\t"
}`);
*/

/*********************
* Abstract Syntax
*********************/

/*
class Program {
constructor(expression) {
this.body = expression;
}
}

class Expression {
}

class BinaryExpression extends Expression {
constructor(left, op, right) {
super();
this.left = left;
this.op = op;
this.right = right;
}
}

class UnaryExpression extends Expression {
constructor(op, operand) {
super();
this.op = op;
this.operand = operand;
}
}

class NumericLiteral extends Expression {
constructor(value) {
super();
this.value = value;
}
}

// CST -> AST
const semantics = aelGrammar.createSemantics().addOperation('tree', {
    Program(body) {return new Program(body.tree());},
    Exp_binary(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    Term_binary(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    Factor_negate(op, operand) {return new UnaryExpression('-', operand.tree());},
    Primary_parens(open, expression, close) {return expression.tree();},
    Power(base, op, exponent) {return new BinaryExpression(base.tree(), op.sourceString, exponent.tree());},
    number(chars) {return new NumericLiteral(+this.sourceString);},
});
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

fs = require('fs');
ohm = require('ohm-js');
grammarContents = fs.readFileSync('guavascript.ohm');
grammar = ohm.grammar(grammarContents);

var spacer = "    ";

class Program {
    constructor(block) {
        this.block = block;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Program\n${this.block.toString(++indent)})`;
    }
}

class Block {
    constructor(body) {
        this.body = body;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(case${(this.exp === 'undefined') ? "" : `\n${this.exp.toString(++indent)}`}\n${this.block.toString(++indent)})`;
    }
}

class FunctionDeclarationStatement extends Statement {
    constructor(id, parameter1, parameterArray, block) {
        super();
        this.id = id;
        this.parameter1 = parameter1;
        this.parameterArray = parameterArray[0];
        this.block = block;
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Func\n${spacer.repeat(++indent)}(id ${this.id})\n${spacer.repeat(indent)}(Parameters`;
        indent++;
        string += (this.parameter1.length === 0) ? "" : `\n${spacer.repeat(indent)}${this.parameter1.toString(indent)}`;
        if (this.parameterArray !== 'undefined') {
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Class\n${spacer.repeat(++indent)}(id ${this.id})\n${this.block.toString(indent)})`;
    }
}

class MatchStatement extends Statement {
    constructor(matchExp) {
        super();
        this.matchExp = matchExp;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(For id (${this.id}) in\n${this.iDExp.toString(++indent)}\n${this.block.toString(indent)})`;
    }
}

class PrintStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.assignOp}\n${this.idExp.toString(++indent)}\n${this.exp.toString(indent)})`;
    }
}

class IdentifierStatement extends Statement {
    constructor(iDExp) {
        super();
        this.iDExp = iDExp;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Return\n${this.exp.toString(++indent)})`;
    }
}

/*******************************
* Expressions
*******************************/

class Expression {
}

// class MatchExpression extends Expression {
//     constructor(idExp, matchArray) {
//         super();
//         this.idExp = idExp;
//         this.matches = matchArray
//     }
//     toString(indent = 0) {
//         var string = `${spacer.repeat(indent)}(Match Expression\n${this.idExp.toString(++indent)}\n${spacer.repeat(++indent)}(matches`;
//         indent++;
//         for (var matchIndex in this.matches) {
//             string += `\n${this.matches[matchIndex].toString(++indent)}`
//         }
//         string += "))"
//         return string;
//     }
// }

//idExp.ast(), exp1.ast(), expArray.ast(), match1.ast(), matchArray.ast(), matchFinal.ast()

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
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Match Expression\n${this.idExp.toString(++indent)}\n${spacer.repeat(indent)}(Matches`;
        string += (this.var1.length != 0 && this.match1.length != 0) ? `\n${spacer.repeat(++indent)}(Match\n${this.var1.toString(++indent)} -> \n${this.match1.toString(indent)})` : "";
        if (this.varArray.length == this.matchArray.length && this.varArray.length != 0) {
            for (var varIndex in this.varArray) {
                string += `\n${spacer.repeat(--indent)}(Match\n${this.varArray[varIndex].toString(++indent)} -> \n${this.matchArray[varIndex].toString(indent)})`
            }
        }
        string += (this.matchFinal.length != 0) ? `\n${spacer.repeat(--indent)}(Match\n${spacer.repeat(++indent)} _ -> \n${this.matchFinal.toString(indent)})` : "";
        string += "))";
        return string;
    }
}

class Match {
    constructor(matchee) {
        this.matchee = matchee;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
}

class ParenthesisExpression extends Expression {
    constructor(exp) {
        super();
        this.exp = exp;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.appendageOp}\n${this.idExpBody.toString(++indent)}\n${this.idAppendage.toString(indent)})`;
    }
}

class IdExpressionBodyBase {
    constructor(id) {
        this.id = id;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id})`;
    }
}

class PeriodId {
    constructor(id) {
        this.id = id;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(List${this.varList.toString(++indent)})`;
    }
}

class Tuple {
    constructor(elems) {
        this.elems = elems;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(Tuple${this.elems.toString(++indent)})`;
    }
}

class Dictionary {
    constructor(idValuePair, idValuePairsArray) {
        this.idValuePair = idValuePair;
        this.idValuePairsArray = (idValuePairsArray.length == 0) ? [] : idValuePairsArray[0];
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Dictionary`
        string += `${(this.idValuePair.length == 0) ? "" : `\n${spacer.repeat(++indent)}${this.idValuePair.toString(indent)}`}`;
        if (this.idValuePairsArray.length !== 0) {
            for (var pairIndex in this.idValuePairsArray) {
                string += `\n${this.idValuePairsArray[pairIndex].toString(indent)}`;
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.id} : ${this.variable.toString()})`;
    }
}

class VarList {
    constructor(firstVar, varArray) {
        this.firstVar = firstVar;
        this.varArray = (varArray.length == 0) ? [] : varArray[0];
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
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.digits.toString(++indent)})`;
    }
}

class FloatLit {
    constructor(digits1, digits2) {
        this.digits1 = digits1;
        this.digits2 = digits2;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.digits1.toString(++indent)}.${this.digits2.toString(++indent)})`;
    }
}

class StringLit {
    constructor(word) {
        this.word = word;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.word.toString(++indent)})`;
    }
}

class BoolLit {
    constructor(boolVal) {
        this.boolVal = boolVal;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.boolVal})`;
    }
}

class NullLit {
    constructor() {}
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(null)`;
    }
}

class IdVariable {
    constructor(firstChar, rest) {
        this.string = firstChar + rest;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(\n${this.string})`;
    }
}

class ConstId {
    constructor(firstWord, rest) {
        this.words = firstWord;
        this.rest = rest;
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
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(\n${this.className.toString()}`
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
}

class Comment {
    constructor(comments) {
        this.comments = comments;
    }
    toString(indent = 0) {
        return `${spacer.repeat(indent)}(${this.comments.toString(++indent)})`;
    }
}

// TODO: merge MatchExpression Match's into single array. Same with other arrays

// Guavascript CST -> AST
semantics = grammar.createSemantics().addOperation('ast', {
    Program(block) {return new Program(block.ast());},
    Block(statements) {return new Block(statements.ast());},
    Statement_conditional(exp, question, block1, colon, block2) {return new BranchStatement(new Case(exp.ast(), block1.ast()), block2.ast());},
    Statement_funcDecl(id, lParen, parameter1, commas, parameterArray, rParen, lCurly, block, rCurly) {return new FunctionDeclarationStatement(id.sourceString, parameter1.ast(), parameterArray.ast(), block.ast());},
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
    Dictionary(lBrace, IdValuePair, commas, IdValuePairs, rBrace) {return new Dictionary(IdValuePair.ast(), IdValuePairs.ast());},
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
    floatLit(digits1, period, digits2) {return new FloatLit(digits1.sourceString, digits2.sourceString);},
    stringLit(lQuote, str, rQuote) {return new StringLit(str.sourceString)},
    nullLit(nul) {return new NullLit()},
    keyword(word) {return word;},
    id_variable(firstChar, rest) {return new IdVariable(firstChar.sourceString, rest.sourceString);},
    id_constant(constId) {return new constId(constId.ast())},
    idrest(character) {return character},
    constId(underscores, words) {return new ConstId(words)},
    classId(upper, idrests) {return new ClassId(idrests.ast())},
    comment(hashBang, comments, newline) {return new Comment(comments)},
});

module.exports = (program) => {
  match = grammar.match(program);
  if(match.succeeded()) {
      return semantics(match).ast();
  } else {
    console.log(match.message);
  }
}
