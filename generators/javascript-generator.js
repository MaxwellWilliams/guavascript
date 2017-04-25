const parser = require('../parser.js');
const getIndent = require('../semantics/getIndent.js');

const Program = require('../entities/program.js');
const Block = require('../entities/block.js');
const BranchStatement = require('../entities/branchStatement.js');
const FunctionDeclarationStatement = require('../entities/functionDeclarationStatement.js');
const ClassDeclarationStatement = require('../entities/classDeclarationStatement.js');
const WhileStatement = require('../entities/whileStatement.js');
const ForInStatement = require('../entities/forInStatement.js');
const PrintStatement = require('../entities/printStatement.js');
const AssignmentStatement = require('../entities/assignmentStatement.js');
const ReturnStatement = require('../entities/returnStatement.js');
const MatchExpression = require('../entities/matchExpression.js');
const Match = require('../entities/match.js');
const Parameter = require('../entities/parameter.js');
const BinaryExpression = require('../entities/binaryExpression.js');
const UnaryExpression = require('../entities/unaryExpression.js');
const ParenthesisExpression = require('../entities/parenthesisExpression.js');
const IdExpression = require('../entities/idExpression.js');
const IdExpressionBodyRecursive = require('../entities/idExpressionBodyRecursive.js');
const IdExpressionBodyBase = require('../entities/idExpressionBodyBase.js');
const PeriodId = require('../entities/periodId.js');
const Arguments = require('../entities/arguments.js');
const IdSelector = require('../entities/IdSelector.js');
const List = require('../entities/list.js');
const Tuple = require('../entities/tuple.js');
const Dictionary = require('../entities/dictionary.js');
const IdValuePair = require('../entities/idValuePair.js');
const VarList = require('../entities/varList.js');
const BoolLit = require('../entities/boolLit.js');
const IntLit = require('../entities/intLit.js');
const FloatLit = require('../entities/floatLit.js');
const StringLit = require('../entities/stringLit.js');
const NullLit = require('../entities/nullLit.js');
const IdVariable = require('../entities/idVariable.js');
const ConstId = require('../entities/constId.js');
const ClassId = require('../entities/classId.js');

let indent = 0;

function genStatementList(statements) {
	result = ``;
	indentLevel += 1;
	statements.forEach(statement => result += statement.gen());
	indentLevel -= 1;
	return result;
}

Object.assign(Program.prototype, {
  gen(indent = 0) {
    return this.block.gen(indent);
  },
});

Object.assign(Block.prototype, {
  gen(indent = 0) {
  	var result = [];
    this.body.forEach(statement => result.push(statement.gen(indent)));
    return result.join(`\n`);
  },
});

Object.assign(BranchStatement.prototype, {
  gen(indent = 0) {
  	var result = ``;
    for (var condition = 0; condition < this.conditions.length; condition++) {
    	const prefix = condition === 0 ? 'if' : '\n} else if';
    	result += `${prefix} (${this.conditions[condition].gen()}) {`;
    	result += `\n${getIndent(++indent)}${this.thenBlocks[condition].gen()}`;
    }
    if (this.elseBlock !== null) {
    	result += `\n${getIndent(--indent)}} else {`;
    	result += `\n${getIndent(++indent)}${this.elseBlock.gen()}`;
    }
    result += '\n}';
    return result;
  },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	result += `var ${this.id} = (${this.parameterArray.map(p => p.gen()).join(', ')}) => {`;
  	result += `\n${getIndent(++indent)}${this.block.gen()}\n`;
  	result += '}';
    return result;
  },
});

Object.assign(ClassDeclarationStatement.prototype, {
  gen(indent = 0) {
  	var result = ``;
    result += `class ${this.id} {`;
   	// Need to rename the constructor 'constructor' instead of this.id
   	result += `\n${this.block.gen(++indent)}\n`;
    result += '}';
    return result;
  },
});

Object.assign(WhileStatement.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	result += `while (${this.condition.gen()}) {`;
  	result += `\n${getIndent(++indent)}${this.block.gen()}\n`;
  	result += '}';
    return result;
  },
});

Object.assign(ForInStatement.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	result += `for var ${this.id} in ${this.iteratableObj.gen()} {`;
  	result += `\n${getIndent(++indent)} var ${this.id}_Iterable = ${this.iteratableObj.gen()}[${this.id}];`;
  	result += `\n${this.block.gen()}\n`;
  	result += '}';
  	return result;
  },
});

// Skipped for-in statement for now

Object.assign(PrintStatement.prototype, {
  gen(indent = 0) {
  	return `console.log(${this.exp.gen()});`;
  },
});

Object.assign(AssignmentStatement.prototype, {
  gen(indent = 0) {
  	// if variable has already been declared we must omit const and let
  	var variable = `${this.idExp.gen()}`;
  	if (variable === variable.toUpperCase()) {
  		return `${getIndent(indent)}const ${variable} ${this.assignOp} ${this.exp.gen()};`;
  	} else if (this.idExp.gen().indexOf('.') > -1 || this.idExp.gen().indexOf('[') > -1) {
  		return `${this.idExp.gen()} ${this.assignOp} ${this.exp.gen()};`;
  	} else {
  		return `${getIndent(indent)}var ${variable} ${this.assignOp} ${this.exp.gen()};`;
  	}
  },
});

Object.assign(ReturnStatement.prototype, {
  gen(indent = 0) {
  	return `return ${this.exp.gen()};`;
  },
});

Object.assign(MatchExpression.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	result += '(() => {';
  	for (var condition = 0; condition < this.matchConditions.length; condition++) {
      var prefix = `\n${getIndent(indent+1)}`;
    	prefix += condition === 0 ? 'if' : '} else if';
    	result += `${prefix} (${this.idExp.gen()} === ${this.matchConditions[condition].gen()}) {`;
    	result += `\n${getIndent(indent+2)}return ${this.matchBlocks[condition].gen()};`;
    }
    if (this.catchAllMatch.length > 0) {
    	result += `\n${getIndent(++indent)}} else {`;
    	result += `\n${getIndent(++indent)}return ${this.catchAllMatch[0].gen()};`;
      result += `\n${getIndent(--indent)}}`;
      indent -= 1;
    } else {
      result += `\n${getIndent(indent+1)}}`;
    }
  	result += `\n${getIndent(indent)}})()`;
    return result;
  }
});

Object.assign(Match.prototype, {
  gen(indent = 0) {
  	return `${this.matchee.gen()}`;
  }
});

Object.assign(Parameter.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	(this.defaultValue === null) ? result += `${this.id}` : result += `${this.id} = ${this.defaultValue.gen()}`;
  	return result;
  },
});

Object.assign(BinaryExpression.prototype, {
  gen(indent = 0) {
    var operator = this.op;
    if(operator === `==`) {
      operator = '===';
    } else if(operator === '^') {
      return `Math.pow(${this.left.gen(0)}, ${this.right.gen(0)})`;
    }
  	return `${this.left.gen(0)} ${operator} ${this.right.gen(0)}`;
  },
});

Object.assign(UnaryExpression.prototype, {
  gen(indent = 0) {
  	return `(${this.op} ${this.operand.gen(0)})`;
  },
});

Object.assign(ParenthesisExpression.prototype, {
  gen(indent = 0) {
  	return `(${this.exp.gen(0)})`;
  },
});

Object.assign(IdExpression.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	(this.idPostOp) ? result += `${this.idExpBody.gen()}${this.idPostOp}` : result += `${this.idExpBody.gen()}`;
    return result;
  },
});

Object.assign(IdExpressionBodyBase.prototype, {
  gen(indent = 0) {
  	var result = ``;
  	(this.id) ? result += `${this.id}` : result += `this`;
    return result;
  },
});

Object.assign(IdExpressionBodyRecursive.prototype, {
  gen(indent = 0) {
  	return `${this.idExpBase.gen()}${this.idAppendage.gen()}`;
  },
});

Object.assign(PeriodId.prototype, {
  gen(indent = 0) {
  	return`.${this.id}`;
  },
});

Object.assign(Arguments.prototype, {
  gen(indent = 0) {
  	if (this.values.gen() === undefined) {
  		return '()';
  	} else {
  		return `[${this.values.gen()}]`;
  	}
  },
});

Object.assign(IdSelector.prototype, {
  gen(indent = 0) {
  	return `[${this.variable.gen()}]`;
  },
});

Object.assign(List.prototype, {
  gen(indent = 0) {
  	if (this.values.gen() === undefined) {
  		return '[]';
  	} else {
  		return `[${this.values.gen()}]`;
  	}
  },
});

Object.assign(Tuple.prototype, {
  gen(indent = 0) {
  	return`(${this.values.variables.map(v => v.gen()).join(', ')})`;
  },
});

Object.assign(Dictionary.prototype, {
  gen(indent = 0) {
  	if (this.properties) {
  		return`{${this.properties.map(p => p.gen()).join(', ')}}`;
  	} else {
  		return '{}';
  	}
  },
});

Object.assign(IdValuePair.prototype, {
  gen(indent = 0) {
  	return `${this.id} : ${this.variable}`;
  },
});

Object.assign(VarList.prototype, {
  gen(indent = 0) {
  	if (this.length > 0) {
  		return `${this.variables.map(v => v.gen()).join(', ')}`;
  	}
  },
});

Object.assign(BoolLit.prototype, {
  gen(indent = 0) {
  	return `${this.value}`;
  },
});

Object.assign(IntLit.prototype, {
  gen(indent = 0) {
  	return `${this.value}`;
  },
});

Object.assign(FloatLit.prototype, {
  gen(indent = 0) {
  	return `${this.value}`;
  },
});

Object.assign(StringLit.prototype, {
  gen(indent = 0) {
  	return `"${this.value}"`;
  },
});

Object.assign(NullLit.prototype, {
  gen(indent = 0) {
  	return `${this.value}`;
  },
});

Object.assign(IdVariable.prototype, {
  gen(indent = 0) {
  	return `${this.value}`;
  },
});

Object.assign(ConstId.prototype, {
  gen(indent = 0) {
  	return `CONST ${this.words}${this.rest}`;
  },
});

Object.assign(ClassId.prototype, {
  gen(indent = 0) {
  	return `CONST ${this.className}${this.rest}`;
  },
});

module.exports = (program) => {
	return program.gen();
}
