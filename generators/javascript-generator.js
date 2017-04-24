const parser = require('../parser.js');

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

let indentLevel = 0;

function genStatementList(statements) {
	result = ``;
	indentLevel += 1;
	statements.forEach(statement => result += statement.gen());
	indentLevel -= 1;
	return result;
}

Object.assign(Program.prototype, {
  gen() {
    return this.block.gen();
  },
});

Object.assign(Block.prototype, {
  gen() {
  	var result = [];
    this.body.forEach(statement => result.push(statement.gen()));
    return result.join('\n');
  },
});

Object.assign(BranchStatement.prototype, {
  gen() {
  	var result = ``;
    for (var condition = 0; condition < this.conditions.length; condition++) {
    	const prefix = condition === 0 ? 'if' : '} else if';
    	result += `${prefix} (${this.conditions[condition].gen()}) {`;
    	result += genStatementList(this.thenBlocks[condition]);
    }
    if (this.elseBlock !== null) {
    	result += '} else {';
    	result += genStatementList(this.elseBlock);
    }
    result += '}';
    return result;
  },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen() {
  	var result = ``;
  	result += `var ${this.id} = (${this.parameterArray.map(p => p.gen()).join(', ')}) => {`;
  	result += genStatementList(this.block);
  	result += '}';
    return result;
  },
});

Object.assign(ClassDeclarationStatement.prototype, {
  gen() {
  	var result = ``;
    result += `class ${this.id} {`;
   	// Need to rename the constructor 'constructor' instead of this.id
   	result += genStatementList(this.block);
    result += '}';
    return result;
  },
});

Object.assign(WhileStatement.prototype, {
  gen() {
  	var result = ``;
  	result += `while ${this.condition.gen()} {`;
  	result += genStatementList(this.block);
  	result += '}';
    return result;
  },
});

// Skipped for-in statement for now

Object.assign(PrintStatement.prototype, {
  gen() {
  	return `console.log(${this.exp.gen()});`;
  },
});

Object.assign(AssignmentStatement.prototype, {
  gen() {
  	// if variable has already been declared we must omit const and let

  	var variable = `${this.idExp.gen()}`;
  	if (variable === variable.toUpperCase()) {
  		return `const ${this.idExp.gen()} ${this.assignOp} ${this.exp.gen()};`;
  	} else {
  		return `let ${this.idExp.gen()} ${this.assignOp} ${this.exp.gen()};`;
  	}
  },
});

Object.assign(ReturnStatement.prototype, {
  gen() {
  	return `return ${this.exp.gen()}`;
  },
});

Object.assign(MatchExpression.prototype, {
  gen() {
  	var result = ``;
  	result += '(() => {';
  	for (var condition = 0; condition < this.matchConditions.length; condition++) {
    	const prefix = condition === 0 ? 'if' : '} else if';
    	result += `${prefix} (${this.matchConditions[condition].gen()}) {`;
    	result += genStatementList(this.matchBlocks[condition]);
    }
    if (this.catchAllMatch !== null) {
    	result += '} else {';
    	result += genStatementList(this.catchAllMatch);
    }
  	result += '})()';
    return result;
  },
});

Object.assign(Match.prototype, {
  gen() {
  	return `${this.matchee.gen()}`;
  },
});

Object.assign(Parameter.prototype, {
  gen() {
  	var result = ``;
  	(this.defaultValue === null) ? result += `${this.id}` : result += `${this.id} = ${this.defaultValue.gen()}`;
  	return result;
  },
});

Object.assign(BinaryExpression.prototype, {
  gen() {
  	return `(${this.left.gen()} ${this.op} ${this.right.gen()})`;
  },
});

Object.assign(UnaryExpression.prototype, {
  gen() {
  	return `(${this.op} ${this.operand.gen()})`;
  },
});

Object.assign(ParenthesisExpression.prototype, {
  gen() {
  	return `(${this.exp.gen()})`;
  },
});

Object.assign(IdExpression.prototype, {
  gen() {
  	var result = ``;
  	(this.idPostOp) ? result += `${this.idExpBody.gen()}${this.idPostOp}` : result += `${this.idExpBody.gen()}`;
    return result;
  },
});

Object.assign(IdExpressionBodyBase.prototype, {
  gen() {
  	var result = ``;
  	(this.id) ? result += `${this.id}` : result += `this`;
    return result;
  },
});

Object.assign(IdExpressionBodyRecursive.prototype, {
  gen() {
  	return `${this.idExpBase.gen()}${this.idAppendage.gen()}`;
  },
});

Object.assign(PeriodId.prototype, {
  gen() {
  	return`.${this.id}`;
  },
});

Object.assign(Arguments.prototype, {
  gen() {
  	return `(this.VarList.join(', '))`;
  },
});

Object.assign(IdSelector.prototype, {
  gen() {
  	return `[${this.variable.gen()}]`;
  },
});

Object.assign(List.prototype, {
  gen() {
  	return `[this.VarList.join(', ')]`;
  },
});

Object.assign(Tuple.prototype, {
  gen() {
  	return`(${this.values.variables.map(v => v.gen()).join(', ')})`;
  },
});

Object.assign(Dictionary.prototype, {
  gen() {
  	return`{${this.properties.map(p => p.gen()).join(', ')}}`;
  },
});

Object.assign(IdValuePair.prototype, {
  gen() {
  	return `${this.id} : ${this.variable}`;
  },
});

Object.assign(VarList.prototype, {
  gen() {
  	if (this.length > 0) {
  		return `{${this.variables.map(v => v.gen()).join(', ')}}`;
  	}
  },
});

Object.assign(BoolLit.prototype, {
  gen() {
  	return `${this.value}`;
  },
});

Object.assign(IntLit.prototype, {
  gen() {
  	return `${this.value}`;
  },
});

Object.assign(FloatLit.prototype, {
  gen() {
  	return `${this.value}`;
  },
});

Object.assign(StringLit.prototype, {
  gen() {
  	return `"${this.value}"`;
  },
});

Object.assign(NullLit.prototype, {
  gen() {
  	return `${this.value}`;
  },
});

Object.assign(IdVariable.prototype, {
  gen() {
  	return `${this.value}`;
  },
});

Object.assign(ConstId.prototype, {
  gen() {
  	return `CONST ${this.words}${this.rest}`;
  },
});

Object.assign(ClassId.prototype, {
  gen() {
  	return `CONST ${this.className}${this.rest}`;
  },
});

module.exports = (program) => {
	return program.gen();
}
