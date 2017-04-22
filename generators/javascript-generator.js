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

function emit(line) {
  console.log(`${' '.repeat(indentPadding * indentLevel)}${line}`);
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
    	console.log(this.conditions[condition]);
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
  	emit(`var ${this.id.gen()} = (${this.parameterArray.map(p => p.gen()).join(', ')}) => {`);
  	genStatementList(this.block);
  	emit('}');
  },
});

module.exports = (program) => {
	return program.gen();
}
