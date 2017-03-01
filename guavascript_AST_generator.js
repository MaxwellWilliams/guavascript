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
    constructor(statements) {
        this.body = statements;
    }
    toString(indent = 0) {
        var string = `${spacer.repeat(indent)}(Block`;
        for (var statementIndex in statements) {
            string += `\n${this.statements[statementIndex].toString(++indent)}`;
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
        return `${spacer.repeat(indent)}(Class\n(id ${this.id})\n${this.block.toString(++index)})`;
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
        return `${spacer.repeat(indent)}(Identifier Statement\n${this.iDExp(++indent)})`;
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
        this.id = id;
        this.idPostOp = idPostOp;
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
        this.appendageOp = idAppendage.getOp();
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
        return `${spacer.repeat(indent)}(${this.id})`;
    }
}

// TODO: merge MatchExpression Match's into single array. Same with other arrays

// Guavascript CST -> AST
semantics = guavascriptGrammar.createSemantics().addOperation('tree' {
    Program(block) {return new Program(block.tree());},
    Block(statements) {return new Block(statements.tree());},
    Statement_conditional(exp, block1, block2) {return new BranchStatement(new Case(exp.tree(), block1.tree()), block2.tree());},
    Statement_ifElse(exp, block1, block2) {return new BranchStatement(new Case(exp.tree(), block1.tree()), block2.tree());},
    Statement_funcDecl(id, parameters, block) {return new FunctionDeclarationStatement(id.sourceString, parameters.tree(), block.tree());},
    Statement_classDecl(id, block) {return new ClassDeclarationStatement(id.sourceString, block.tree());},
    Statement_match(matchExp) {return new MatchStatement(matchExp.tree());},
    Statement_while(exp, block) {return new WhileStatement(exp.tree(), block.tree());},
    Statement_forIn(id, iDExp, block) {return new ForInStatement(id.sourceString, iDExp.tree(), block.tree());},
    Statement_print(exp) {return new PrintStatement(exp.tree());},
    Statement_assign(id, assignOp, exp) {return new AssignmentStatement(id.sourceString, assignOp.sourceString, exp.tree());},
    Statement_identifier(iDExp) {return new IdentifierStatement(iDExp.tree());},
    Statement_return(exp) {return new ReturnStatement(exp.tree());},
    Expression_match(idExp, matchArray) {return new MatchExpression(idExp.tree(), matchArray.tree());},
    Exp(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    Exp_pass(),
    BoolAndExp(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    BoolAndExp_pass(),
    RelExp(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    RelExp_pass(),
    AddExp(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    AddExp_pass(),
    MulExp(left, op, right) {return new BinaryExpression(left.tree(), op.sourceString, right.tree());},
    MulExp_pass(),
    ExponExp(base, exponent) {return new BinaryExpression(base.tree(), "^", exponent.tree());},
    ExponExp_pass(),
    PrefixExp(),
    ParenExp(_, exp, _) {return new ParenthesisExpression(exp.tree());}
    ParenExp_pass(variable) {return new Variable(variable.tree());}
    Var(input) {return new Variable(input.tree());}
});
