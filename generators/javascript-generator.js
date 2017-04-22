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

const indentPadding = 2;
let indentLevel = 0;

function emit(line) {
	return `${' '.repeat(indentPadding * indentLevel)}${line}`;
}

function genStatementList(statements) {
  indentLevel += 1;
  statements.forEach(statement => statement.gen());
  indentLevel -= 1;
}

Object.assign(Program.prototype, {
  gen() {
    this.block.gen();
  },
});

Object.assign(Block.prototype, {
  gen() {
    this.body.forEach(statement => statement.gen());
  },
});

Object.assign(BranchStatement.prototype, {
  gen() {
    for (var condition = 0; condition < this.conditions.length; condition++) {
    	const prefix = condition === 0 ? 'if' : '} else if';
    	emit(`${prefix} (${this.conditions[condition].gen()}) {`);
    	genStatementList(this.thenBlocks[condition]);
    }
    if (this.elseBlock !== null) {
    	emit('} else {');
    	genStatementList(this.elseBlock);
    }
    emit('}');
  },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen() {
  	emit(`var ${this.id} = (${this.parameterArray.map(p => p.gen()).join(', ')}) => {`);
  	genStatementList(this.block);
  	emit('}');
  },
});

Object.assign(ClassDeclarationStatement.prototype, {
  gen() {
    emit(`class ${this.id} {`);
   	// Need to rename the constructor 'constructor' instead of this.id
    genStatementList(this.block);
    emit('}');
  },
});

Object.assign(WhileStatement.prototype, {
  gen() {
  	emit(`while ${this.condition.gen()} {`);
  	genStatementList(this.block);
  	emit('}');
  },
});

// Skipped for-in statement for now

Object.assign(PrintStatement.prototype, {
  gen() {
  	emit(`console.log(${this.exp.gen()})`);
  },
});

Object.assign(AssignmentStatement.prototype, {
  gen() {
  	emit(`let ${this.idExp.gen} ${this.assignOp} ${this.exp.gen()}`);
  },
});

Object.assign(ReturnStatement.prototype, {
  gen() {
  	emit(`return ${this.exp.gen()}`);
  },
});

Object.assign(MatchExpression.prototype, {
  gen() {
  	emit('(() => {');
  	for (var condition = 0; condition < this.matchConditions.length; condition++) {
    	const prefix = condition === 0 ? 'if' : '} else if';
    	emit(`${prefix} (${this.matchConditions[condition].gen()}) {`);
    	genStatementList(this.matchBlocks[condition]);
    }
    if (this.catchAllMatch !== null) {
    	emit('} else {');
    	genStatementList(this.catchAllMatch);
    }
  	emit('})()');
  },
});

Object.assign(Match.prototype, {
  gen() {
  	emit(`${this.matchee.gen()}`);
  },
});

Object.assign(Parameter.prototype, {
  gen() {
  	(this.defaultValue === null) ? emit(`${this.id}`) : emit(`${this.id} = ${this.defaultValue.gen()}`);
  },
});

Object.assign(BinaryExpression.prototype, {
  gen() {
  	emit(`(${this.left.gen()} ${this.op} ${this.right.gen()})`);
  },
});

Object.assign(UnaryExpression.prototype, {
  gen() {
  	emit(`(${this.op} ${this.operand.gen()})`);
  },
});

Object.assign(ParenthesisExpression.prototype, {
  gen() {
  	emit(`(${this.exp.gen()})`);
  },
});

Object.assign(IdExpression.prototype, {
  gen() {
  	(this.idPostOp) ? emit(`${this.idExpBody.gen()}${this.idPostOp}`) : emit(`${this.idExpBody.gen()}`);
  },
});

// Skipped IdExpressionBodyRecursive and IdExpressionBodyBase for now.

Object.assign(PeriodId.prototype, {
  gen() {
  	emit(`.${this.id}`);
  },
});

Object.assign(Arguments.prototype, {
  gen() {
  	emit(`(this.VarList.join(', '))`);
  },
});

Object.assign(IdSelector.prototype, {
  gen() {
  	emit(`[${this.id}]`);
  },
});

Object.assign(List.prototype, {
  gen() {
  	emit(`[this.VarList.join(', ')]`);
  },
});

Object.assign(Tuple.prototype, {
  gen() {
  	emit(`(this.VarList.join(', '))`);
  },
});

Object.assign(Dictionary.prototype, {
  gen() {
  	emit(`{${this.properties.map(p => p.gen()).join(', ')}}`);
  },
});

Object.assign(IdValuePair.prototype, {
  gen() {
  	emit(`${this.id} : ${this.variable}`);
  },
});

Object.assign(VarList.prototype, {
  gen() {
  	if (this.length > 0) {
  		emit(`{${this.variables.map(v => v.gen()).join(', ')}}`);
  	}
  },
});

Object.assign(BoolLit.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(IntLit.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(FloatLit.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(StringLit.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(NullLit.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(IdVariable.prototype, {
  gen() {
  	emit(`${this.value}`);
  },
});

Object.assign(ConstId.prototype, {
  gen() {
  	emit(`CONST ${this.words}${this.rest}`);
  },
});

Object.assign(ClassId.prototype, {
  gen() {
  	emit(`CONST ${this.className}${this.rest}`);
  },
});

module.exports = (program) => {
	return program.gen();
}
