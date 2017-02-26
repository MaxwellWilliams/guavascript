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
parserContents = fs.readFileSync('guavascript.ohm');
guavascriptGrammar = ohm.grammar(parserContents);

class Program {
    constructor(block) {
        this.body = block;
    }
}

class Block {
    constructor(statements) {
        this.body = statements;
    }
}

/*******************************
* Statements
*******************************/

class Statement {
}

// Use this for both conditional and if/else statement
class BranchStatement extends Statement {
    constructor(exp, block1, block2) {
        super();
        this.exp = exp;
        this.block1 = block1;
        this.block2 = block2;
    }
    toString() {
        return "if " + this.exp.toString() + " then " + this.block1.toString() + " else " + this.block.toString();
    }
}

class FunctionDeclarationStatement extends Statement {
    constructor(id, parameters, block) {
        super();
        this.id = id;
        this.parameters = parameters;
        this.block = block;
    }
    toString() {
        return id.toString() + "(" parameters.toString() ")" + "...";  // TODO: Check with Toal before doing all the toString's
    }
}

class ClassDeclarationStatement extends Statement {
    constructor(id, block) {
        super();
        this.id = id;
        this.block = block;
    }
    toString() {
        return "";
    }
}

class MatchStatement extends Statement {
    constructor(matchExp) {
        super();
        this.matchExp = matchExp;
    }
    toString() {
        return "";
    }
}

class WhileStatement extends Statement {
    constructor(exp, block) {
        super();
        this.exp = exp;
        this.block = block;
    }
    toString() {
        return "";
    }
}

class ForInStatement extends Statement {
    constructor(id, iDExp, block) {
        super();
        this.id = id;
        this.iDExp = iDExp;
        this.block = block;
    }
}

class PrintStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString() {
        return "";
    }
}

class AssignmentStatement extends Statement {
    constructor(id, assignOp, exp) {
        super();
        this.id = id;
        this.assignOp = assignOp;
        this.exp = exp;
    }
    toString() {
        return "";
    }
}

class IdentifierStatement extends Statement {
    constructor(iDExp) {
        super();
        this.iDExp = iDExp;
    }
    toString() {
        return "";
    }
}

class ReturnStatement extends Statement {
    constructor(exp) {
        super();
        this.exp = exp;
    }
    toString() {
        return "";
    }
}

/*******************************
* Expressions
*******************************/

class Expression {
}

class MatchExpression extends Expression {
    constructor(idExp, matchArray) {
        super();
        this.idExp = idExp;
        this.matches = matchArray
    }
    toString() {
        return "";
    }
}

class BinaryExpression extends Expression {
    constructor(left, op, right) {
        super();
        this.left = left;
        this.op = op;
        this.right = right;
    }
    toString() {
        return "";
    }
}

class UnaryExpression extends Expression {
    constructor(op, operand) {
        super();
        this.op = op;
        this.operand = operand;
    }
    toString() {
        return "";
    }
}


class Exp1Expression extends Expression {
    constructor(variable) {
        this.var = variable;
    }
    toString() {
        return "";
    }
}

// Guavascript CST -> AST
semantics = guavascriptGrammar.createSemantics().addOperation('tree' {
    Program(block) {return new Program(block.tree());},
    Block(statements) {return new Block(statements.tree());},
    Statement_conditional(exp, block1, block2) {return new BranchStatement(exp.tree(), block1.tree(), block2.tree());},
    Statement_ifElse(exp, block1, block2) {return new BranchStatement(exp.tree(), block1.tree(), block2.tree());},
    Statement_funcDecl(id, parameters, block) {return new FunctionDeclarationStatement(id.sourceString, parameters.tree(), block.tree());},
    Statement_classDecl(id, block) {return new ClassDeclarationStatement(id.sourceString, block.tree());},
    Statement_match(matchExp) {return new MatchStatement(matchExp.tree());},
    Statement_while(exp, block) {return new WhileStatement(exp.tree(), block.tree());},
    Statement_forIn(id, iDExp, block) {return new ForInStatement(id.sourceString, iDExp.tree(), block.tree());},
    Statement_print(exp) {return new PrintStatement(exp.tree());},
    Statement_assign(id, assignOp, exp) {return new AssignmentStatement(id.sourceString, assignOp.sourceString, exp.tree());},
    Statement_identifier(iDExp) {return new IdentifierStatement(iDExp.tree());},
    Statement_return(exp) {return new ReturnStatement(exp.tree());}
    Expression_match(idExp, matchArray) {return new MatchExpression(idExp.tree(), matchArray.tree());}
    Expression_boolAnd(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());}
    Expression_boolOr(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());}
    Expression_rel(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());}
    Expression_add(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());}
    Expression_mul(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());}
    Expression_expon(base, exponent) {return new BinaryExpression(base.tree(), "^", exponent.tree());}
    Expression_exp1(variable) {return new Exp1Expression(variable.tree());}
});
