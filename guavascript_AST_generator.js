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

class Statement {
}

class ConditionalStatement extends Statement {
    constructor(exp, block1, block2) {
        super();
        this.exp = exp;
        this.block1 = block1;
        this.block2 = block2;
    }
}

class FunctionDeclarationStatement extends Statement {
    constructor() {
        super();

    }
}

class ClassDeclarationStatement extends Statement {
    constructor() {
        super();

    }
}

class MatchStatement extends Statement {
    constructor() {
        super();

    }
}

class IfElseStatement extends Statement {
    constructor() {
        super();

    }
}

class WhileStatement extends Statement {
    constructor() {
        super();

    }
}

class ForInStatement extends Statement {
    constructor() {
        super();

    }
}

class PrintStatement extends Statement {
    constructor() {
        super();

    }
}

class AssignmentStatement extends Statement {
    constructor() {
        super();

    }
}

class IdentifierStatement extends Statement {
    constructor() {
        super();

    }
}

class ReturnStatement extends Statement {
    constructor() {
        super();

    }
}

// Guavascript CST -> AST
semantics = guavascriptGrammar.createSemantics().addOperation('tree' {
    Program(block) {return new Program(block.tree());},
    Block() {}
});
