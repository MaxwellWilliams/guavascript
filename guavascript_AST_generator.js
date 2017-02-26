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
    }

    class FunctionDeclarationStatement extends Statement {
        constructor(id, parameters, block) {
            super();
            this.id = id;
            this.parameters = parameters;
            this.block = block;
        }
    }

    class ClassDeclarationStatement extends Statement {
        constructor(id, block) {
            super();
            this.id = id;
            this.block = block;
        }
    }

    class MatchStatement extends Statement {
        constructor(matchExp) {
            super();
            this.matchExp = matchExp;
        }
    }

    class WhileStatement extends Statement {
        constructor(exp, block) {
            super();
            this.exp = exp;
            this.block = block;
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
    }

    class AssignmentStatement extends Statement {
        constructor(id, assignOp, exp) {
            super();
            this.id = id;
            this.assignOp = assignOp;
            this.exp = exp;
        }
    }

    class IdentifierStatement extends Statement {
        constructor(iDExp) {
            super();
            this.iDExp = iDExp;
        }
    }

    class ReturnStatement extends Statement {
        constructor(exp) {
            super();
            this.exp = exp;
        }
    }

    class Expression {
    }

    class MatchExpression extends Expression {
        constructor(idExp, matchArray) {
            super();
            this.idExp = idExp;
            this.matches = matchArray

        }
    }

    class BooleanAndExpression extends Expression {
        constructor(left, right) {
            super();
            this.left;
            this.right;
        }
    }

    class RelationalOperatorExpression extends Expression {
        constructor(left, op, right) {
            super();
            this.left = left;
            this.op = op;
            this.right = right;
        }
    }

    class AdditionOperatorExpression extends Expression {
        constructor(left, op, right) {
            super();
            this.left = left;
            this.op = op;
            this.right = right;
        }
    }

    class MultiplicationOperatorExpression extends Expression {
        constructor(left, op, right) {
            super();
            this.left = left;
            this.op = op;
            this.right = right;
        }
    }

    class ExponentialExpression extends Expression {
        constructor(base, exponent) {
            super();
            this.base = base;
            this.pow = exponent;
        }
    }

    class VariableExpression extends Expression {
        constructor(variable) {
            this.var = variable;
        }
    }

    // Guavascript CST -> AST
    semantics = guavascriptGrammar.createSemantics().addOperation('tree' {
        Program(block) {return new Program(block.tree());},
        Block(statements) {return new Block(statements.tree());},
        Statement_conditional(exp, block1, block2) {return new BranchStatement(exp.tree(), block1.tree(), block2.tree());}
    });
