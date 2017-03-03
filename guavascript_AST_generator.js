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
        for (var statementIndex in this.body) {
            string += `\n${this.body[statementIndex].toString(++indent)}`;
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
        this.elseBlock = elseBlock;
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(if`;
        for (var i in this.cases) {
            string += `\n${this.cases[i].toString(++indent)}`;
        }
        if (typeof elseBlock != `undefined`) {
            string += `\n${this.elseBlock.toString(++indent)}`;
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
        return `${spacer.repeat(indent)}(case\n${this.exp.toString(++indent)}\n${this.block.toString(++indent)})`;
    }
}

class FunctionDeclarationStatement extends Statement {
    constructor(id, parameters, block) {
        super();
        this.id = id;
        this.parameters = parameters;
        this.block = block;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(Func\n(id ${this.id})\n(param`;
        for (var parameterIndex in this.parameters) {
            string += `\n${this.parameters[parameterIndex].toString(++indent)}`;
        }
        string += `)\n${this.block.toString(++indent)})`;
    }
}

class Parameter {
    constructor(id, defaultValue) {
        this.id = id;
        this.defaultValue = defaultValue;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(id ${this.id}, default ${this.defaultValue})`;
    }
}

class ClassDeclarationStatement extends Statement {
    constructor(id, block) {
        super();
        this.id = id;
        this.block = block;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Class\n${spacer.repeat(indent++)}(id ${this.id})\n${this.block.toString(++indent)})`;
    }
}

class MatchStatement extends Statement {
    constructor(matchExp) {
        super();
        this.matchExp = matchExp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Match\n${this.matchExp.toString(index)})`;
    }
}

class WhileStatement extends Statement {
    constructor(exp, block) {
        super();
        this.exp = exp;
        this.block = block;
    }
    toString(indent) {
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
    toString(indent) {
        return `${spacer.repeat(indent)}(For id (${this.id}) in\n${this.iDExp.toString(++indent)}\n${this.block.toString(++indent)})`;
    }
}

class PrintStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Print\n${this.exp.toString(++indent)})`;
    }
}

class AssignmentStatement extends Statement {
    constructor(id, assignOp, exp) {
        super();
        this.id = id;
        this.assignOp = assignOp;
        this.exp = exp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.assignOp}\n)${spacer.repeat(++indent)}(id ${this.id})\n${this.exp.toString(++indent)}`;
    }
}

class IdentifierStatement extends Statement {
    constructor(iDExp) {
        super();
        this.iDExp = iDExp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Identifier Statement\n${this.iDExp.toString(++indent)})`;
    }
}

class ReturnStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Return\n${this.exp.toString(++indent)})`;
    }
}

/*******************************
* Expressions
*******************************/

class Expression {
}

class IdentifierExpression extends Expression {
    constructor(id, /* TODO: What to do with all those optionals? */ idPostOp) {
        super();
        this.id = id;
        this.idPostOp = idPostOp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}`;  // TODO: not done!
    }
}


class IdentifierExpressionBodyRecursive extends Expression {
    constructor(idExpBody, selector) {
        super();
        this.idExpBody = idExpBody;
        this.selector = selector
    }
    toString(indent) {
        return `${spacer.repeat(indent)}`;  // TODO: not done!
    }
}

class IdentifierExpressionBodyId extends Expression {
    constructor(id) {
        super();
        this.id = id;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}`;  // TODO: not done!
    }
}


class MatchExpression extends Expression {
    constructor(idExp, matchArray) {
        super();
        this.idExp = idExp;
        this.matches = matchArray
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(Match Expression\n${this.idExp.toString(++indent)}\n${spacer.repeat(++indent)}(matches`;
        indent++;
        for (var matchIndex in this.matches) {
            string += `\n${this.matches[matchIndex].toString(++indent)}`
        }
        string += "))"
        return string;
    }
}

class Match {
    constructor(expression) {
        this.expression = expression
    }
    toString(indent) {
        return `${spacer.repeat(indent)}`;  // TODO: not done!
    }
}

class BinaryExpression extends Expression {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.left.toString(++indent)}\n${this.right.toString(++indent)})`;
    }
}

class UnaryExpression extends Expression {
    constructor(op, operand) {
        super();
        this.op = op;
        this.operand = operand;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.op}\n${this.operand.toString(++indent)})`;
    }
}

class ParenthesisExpression extends Expression {
    constructor(exp) {
        this.exp = exp;
    }
    toString(indent) {
        // Don't increase indent, as the semantic meaning of parenthesis are already captured in the tree
        return `${this.exp.toString(indent)}`;
    }
}

class Variable extends Expression {
    constructor(variable) {
        super();
        this.var = variable;
    }
    toString(indent) {
        // Don't increase indent, we already know literals and other data types are variables
        return `${this.var.toString(indent)}`;
    }
}

class IdExpression extends Expression {
    constructor(idExpBody, idPostOp) {
        this.idExpBody = idExpBody;
        this.idPostOp = idPostOp;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(IdExpression\n${this.idExpBody.toString(++indent)}${this.idPostOp === 'undefined' ? "" : `\n${spacer.repeat(++indent)}${this.idPostOp}`})`;
    }
}

class IdExpressionBody {
    constructor(idExpBody, idAppendage) {
        this.idExpBody = idExpBody;
        this.idAppendage = idAppendage;
        this.appendageOp = idAppendage === 'undefined' ? 'undefined' : idAppendage.getOp();
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.appendageOp}\n${this.IdExpressionBody.toString(++indent)}\n${this.idAppendage.toString(++indent)})`;
    }
}

class PeriodId {
    constructor(id) {
        this.id = id;
    }
    getOp() {
        return ".";
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.id.toString(++indent)})`; // TODO: done?
    }
}

class Arguments {
    constructor(arg, argsArray) {
        this.arg = arg;
        this.argsArray = argsArray;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(Arguments\n${this.idExp.toString(++indent)}\n${spacer.repeat(++indent)}`;
        indent++;
        for (var arg in this.argsArray) {
            string += `\n${this.argsArray[arg].toString(++indent)}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class IdSelector {
    constructor(variable) {
        this.variable = variable;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.variable})`;
    }
}

class List {
    constructor(variable, varArray) {
        this.variable = variable;
        this.varArray = varArray;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(List Elements\n${this.variable.toString(++indent)}\n${spacer.repeat(++indent)}`;
        indent++;
        for (var variable in this.varArray) {
            string += `\n${this.varArray[variable].toString(++indent)}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class Tuple {
    constructor(variable, variables) {
        this.variable = variable;
        this.variables = variables;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(Tuple Elements\n${this.variable.toString(++indent)}\n${spacer.repeat(++indent)}`;
        indent++;
        for (var variable in this.varArray) {
            string += `\n${this.varArray[variable].toString(++indent)}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class Dictionary {
    constructor(idValuePair, idValuePairsArray) {
        this.idValuePair = idValuePair;
        this.idValuePairsArray = idValuePairsArray;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(Tuple Elements\n${this.idValuePair.toString(++indent)}\n${spacer.repeat(++indent)}`;
        indent++;
        for (var pair in this.idValuePairsArray) {
            string += `\n${this.idValuePairsArray[pair].toString(++indent)}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class IdValuePair {
    constructor(id, variable) {
        this.id = id;
        this.variable = variable;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(Id Value Pair\n${this.id.toString(++indent)}\n${this.variable.toString(++indent)})`;;
    }
}

class IntLit {
    constructor(digits) {
        this.digits = digits;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.digits.toString(++indent)})`;
    }
}

class FloatLit {
    constructor(digits1, digits2) {
        this.digits1 = digits1;
        this.digits2 = digits2;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.digits1.toString(++indent)},${this.digits2.toString(++indent)})`;
    }
}

class StringLit {
    constructor(word) {
        this.word = word;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.word.toString(++indent)})`;
    }
}

class BoolLit {
    constructor(boolVal) {
        this.boolVal = boolVal;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.boolVal})`;
    }
}

class IdVariable {
    constructor(firstChar, rest) {
        this.string = firstChar + rest;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(\n${this.string})`;
    }
}  // TODO: done?

class ConstId {
    constructor(firstWord, rest) {
        this.words = firstWord;
        this.rest = rest;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(\n${this.firstWord.toString()}`;
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class ClassId {
    constructor(className, rest) {
        this.className = className;
        this.rest = rest;
    }
    toString(indent) {
        var string = `${spacer.repeat(indent)}(\n${this.className.toString()}`;
        for (var char in this.rest) {
            string += `\n${this.rest[char].toString()}`
        }
        string += ")"
        return string;
    }
}  // TODO: done?

class Comment {
    constructor(comments) {
        this.comments = comments;
    }
    toString(indent) {
        return `${spacer.repeat(indent)}(${this.comments.toString(++indent)})`; // TODO: done?
    }
}

// TODO: merge MatchExpression Match's into single array. Same with other arrays

// Guavascript CST -> AST
semantics = grammar.createSemantics().addOperation('ast', {
    Program(block) {return new Program(block.ast());},
    Block(statements) {return new Block(statements.ast());},
    Statement_conditional(exp, question, block1, colon, block2) {return new BranchStatement(new Case(exp.ast(), block1.ast()), block2.ast());},

    Statement_funcDecl(id, lParen, commas, parameter, parameters, rParen, lCurly, block, rCurly) {
        console.log("id: " + id.ast());
        console.log("lParen: " + lParen.sourceString);
        console.log("commas: " + commas.sourceString);
        console.log("parameter: " + parameter.sourceString);
        console.log("parameters: " + parameters.sourceString);
        console.log("rParen: " + rParen.sourceString);
        console.log("lCurly: " + lCurly.sourceString);
        console.log("block: " + block.sourceString);
        console.log("rCurly: " + rCurly.sourceString);
        return new FunctionDeclarationStatement(id.sourceString, parameters.ast(), block.ast());
    },

    Statement_classDecl(clas, id, lCurly, block, rCurly) {return new ClassDeclarationStatement(id.sourceString, block.ast());},
    Statement_match(matchExp) {return new MatchStatement(matchExp.ast());},
    Statement_ifElse(i, exp, lCurly1, block1, rCurly1, els, lCurly2, block2, rCurly2) {return new BranchStatement(new Case(exp.ast(), block1.ast()), block2.ast());},
    Statement_while(whil, exp, lCurly, block, rCurly) {return new WhileStatement(exp.ast(), block.ast());},
    Statement_forIn(fo, id, iN, iDExp, lCurly, block, rCurly) {return new ForInStatement(id.sourceString, iDExp.ast(), block.ast());},
    Statement_print(print, lCurly, exp, rCurly) {return new PrintStatement(exp.ast());},
    Statement_assign(id, assignOp, exp) {return new AssignmentStatement(id.sourceString, assignOp.sourceString, exp.ast());},
    Statement_identifier(iDExp) {return new IdentifierStatement(iDExp.ast());},
    Statement_return(ret, exp) {return new ReturnStatement(exp.ast());},
    MatchExp(matchStr, idExp, wit, line1, expression, match1, lines, expressions, matchArray, line2, underscore, match2) {return new MatchExpression(idExp.ast(), matchArray.ast());},
    Match (arrow, expression) {return new Match(expression.ast())},
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
    ExponExp_reg(base, operator, exponent) {return new BinaryExpression(base.ast(), operator, exponent.ast());},
    ExponExp_pass(otherExp) {return otherExp.ast();},
    PrefixExp(prefixOp, exp) {return new UnaryExpression(prefixOp.sourceString, exp.ast());},
    ParenExp_reg(left, exp, right) {return new ParenthesisExpression(exp.ast());},
    ParenExp_pass(variable) {return new Variable(variable.ast());},
    Var(input) {return new Variable(input.ast());},

    IdExp(idExpBody, idPostOp) {return new IdentifierExpression(idExpBody.ast(), idPostOp.ast());},
    IdExpBody_recursive(idExpBody, selector) {return new IdentifierExpressionBodyRecursive(idExpBody.ast(), selector.ast());},
    IdExpBody_id(id) {return new IdentifierExpressionBodyRecursive(id.sourceString);},
    periodId(period, id) {return new PeriodId(id.sourceString);},
    Arguments(lParen, var1, commasArray, varArray, rParen) {return new Arguments(var1.ast(), varArray.ast());},
    IdSelector(lBracket, variable, rBracket) {return new IdSelector(variable.ast());},
    idPostOp(op) {return op},
    List(lBracket, variable, commas, variables, rBracket) {return new List(variable.ast(), variables.ast());},
    Tuple(lParen, variable, commas, variables, rParen) {return new Tuple(variable.ast(), variables.ast());},
    Dictionary(lBrace, IdValuePair, commas, IdValuePairs, rBrace) {return new List(IdValuePair.ast(), IdValuePairs.ast());},
    IdValuePair(id, colon, variable) {return new IdValuePair(id.sourceString, variable.ast());},
    orOp(operator) {return operator;},
    andOp(operator) {return operator;},
    exponOp(operator) {return operator;},
    assignOp(operator) {return operator;},
    addOp(operator) {return operator;},
    mulOp(operator) {return operator;},
    relOp(operator) {return operator;},
    prefixOp(operator) {return operator;},
    boolLit(boolVal) {return new BoolLit(boolVal.sourceString);},
    intLit(digits) {return new IntLit(digits.ast());},
    floatLit(digits1, period, digits2) {return new FloatLit(digits1, digits2);},
    stringLit(backslashes, any, backslash) {return new StringLit(any)},
    keyword(word) {return word;},
    id_variable(firstChar, rest) {return new IdVariable(firstChar.sourceString, rest.sourceString);},
    id_constant(constId) {return new constId(constId.ast())},
    idrest(character) {return character},
    constId(underscores, words) {return ConstId(words)},
    classId(upper, idrests) {return ClassId(idrests.ast())},
    // Not sure how to do the += for space
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
