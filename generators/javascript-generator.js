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
const IdSelector = require('../entities/idSelector.js');
const List = require('../entities/list.js');
const Tuple = require('../entities/tuple.js');
const Dictionary = require('../entities/dictionary.js');
const IdValuePair = require('../entities/idValuePair.js');
const Variable = require('../entities/variable.js');
const VarList = require('../entities/varList.js');
const BoolLit = require('../entities/boolLit.js');
const IntLit = require('../entities/intLit.js');
const FloatLit = require('../entities/floatLit.js');
const StringLit = require('../entities/stringLit.js');
const NullLit = require('../entities/nullLit.js');
const IdVariable = require('../entities/idVariable.js');
const ConstId = require('../entities/constId.js');
const ClassId = require('../entities/classId.js');

// jsName(e) takes any PlainScript object with an id property, such as a
// Variable, Parameter, or FunctionDeclaration, and produces a JavaScript
// name by appending a unique indentifying suffix, such as '_1' or '_503'.
// It uses a cache so it can return the same exact string each time it is
// called with a particular entity.
const jsName = () => {
  let lastId = 0;
  const map = new Map();
  return (id) => {
    if (!(map.has(id))) {
      map.set(id, ++lastId); // eslint-disable-line no-plusplus
    }
    return `${id}_${map.get(id)}`;
  };
};

Object.assign(Program.prototype, {
  gen(indent = 0) {
    const names = jsName();
    return this.block.gen(indent, names);
  },
});

Object.assign(Block.prototype, {
  gen(indent = 0, names = undefined, inClass = false) {
    const result = [];

    this.body.forEach((statement) => {
      if (statement.constructor === FunctionDeclarationStatement) {
        result.push(statement.gen(indent, names, inClass));
      } else if (statement.constructor === IdExpression) {
        result.push(statement.gen(indent, names, false));
      } else {
        result.push(statement.gen(indent, names));
      }
    });
    return result.join('\n');
  },
});

Object.assign(BranchStatement.prototype, {
  gen(indent = 0, names) {
    let result = '';
    for (let condition = 0; condition < this.conditions.length; condition++) {
      const prefix = condition === 0 ? 'if' : '\n} else if';
      result += `${getIndent(indent)}${prefix} (${this.conditions[condition].gen(0, names)}) {`;
      result += `\n${getIndent(indent + 1)}${this.thenBlocks[condition].gen(0, names)}`;
    }
    if (this.elseBlock !== null) {
      result += `\n${getIndent(indent)}} else {`;
      result += `\n${getIndent(++indent)}${this.elseBlock.gen(0, names)}`;
    }
    result += `\n${getIndent(--indent)}}`;
    return result;
  },
});

Object.assign(FunctionDeclarationStatement.prototype, {
  gen(indent = 0, names = undefined, inClass = false) {
    let result = '';
    let newNames;

    if (this.id === 'constructor') {
      newNames = names;
      result += `${getIndent(indent)}constructor(${this.parameterArray.map(p => p.gen(0, newNames)).join(', ')}) {`;
    } else if (inClass) {
      names(this.id);
      newNames = names;
      result += `${getIndent(indent)}${newNames(this.id)}(${this.parameterArray.map(p => p.gen(0, newNames)).join(', ')}) {`;
    } else {
      names(this.id);
      newNames = names;
      result += `${getIndent(indent)}var ${newNames(this.id)} = (${this.parameterArray.map(p => p.gen(0, newNames)).join(', ')}) => {`;
    }
    result += `\n${this.block.gen(++indent, newNames)}`;
    result += `\n${getIndent(--indent)}}`;
    return result;
  },
});

Object.assign(ClassDeclarationStatement.prototype, {
  gen(indent = 0, names) {
    let result = '';
    result += `${getIndent(indent)}class ${names(this.id)} {`;
    const newNames = jsName();
    result += `\n${this.block.gen(++indent, newNames, true)}`;
    result += `\n${getIndent(--indent)}}`;
    return result;
  },
});

Object.assign(WhileStatement.prototype, {
  gen(indent = 0, names) {
    let result = '';
    result += `while (${this.condition.gen(0, names)}) {`;
    result += `\n${this.block.gen(++indent, names)}\n`;
    result += '}';
    return result;
  },
});

Object.assign(ForInStatement.prototype, {
  gen(indent = 0, names) {
    let result = '';
    result += `${getIndent(indent)}for var ${this.id} in ${this.iteratableObj.gen(0, names)} {`;
    result += `\n${getIndent(++indent)}var ${this.id}_Iterable = ${this.iteratableObj.gen(0, names)}[${this.id}];`;
    result += `\n${this.block.gen(indent, names)}`;
    result += `\n${getIndent(--indent)}}`;
    return result;
  },
});

Object.assign(PrintStatement.prototype, {
  gen(indent = 0, names) {
    return `${getIndent(indent)}console.log(${this.exp.gen(0, names)});`;
  },
});

Object.assign(AssignmentStatement.prototype, {
  gen(indent = 0, names) {
    // if letiable has already been declared we must omit const and let
    const letiable = `${this.idExp.gen(0, names)}`;
    if (letiable === letiable.toUpperCase()) {
      return `${getIndent(indent)}const ${letiable} ${this.assignOp} ${this.exp.gen(0, names)};`;
    } else if (this.idExp.gen(0, names).indexOf('.') > -1 || this.idExp.gen(0, names).indexOf('[') > -1 ||
              this.assignOp === '+=' || this.assignOp === '-=' || this.assignOp === '*=' || this.assignOp === '/=') {
      return `${this.idExp.gen(indent, names)} ${this.assignOp} ${this.exp.gen(0, names)};`;
    } else if (this.exp.constructor === MatchExpression) {
      return `${getIndent(indent)}var ${letiable} ${this.assignOp} ${this.exp.gen(indent, names)};`;
    }
    return `${getIndent(indent)}var ${letiable} ${this.assignOp} ${this.exp.gen(0, names)};`;
  },
});

Object.assign(ReturnStatement.prototype, {
  gen(indent = 0, names) {
    return `${getIndent(indent)}return ${this.exp.gen(0, names)};`;
  },
});

Object.assign(MatchExpression.prototype, {
  gen(indent = 0, names) {
    let result = '';
    result += '(() => {';
    for (let condition = 0; condition < this.matchConditions.length; condition++) {
      let prefix = `\n${getIndent(indent + 1)}`;
      prefix += condition === 0 ? 'if' : '} else if';
      result += `${prefix} (${this.idExp.gen(0, names)} === ${this.matchConditions[condition].gen(0, names)}) {`;
      result += `\n${getIndent(indent + 2)}${this.matchBlocks[condition].gen(0, names)}`;
    }
    if (this.catchAllMatch.length > 0) {
      result += `\n${getIndent(++indent)}} else {`;
      result += `\n${getIndent(++indent)}${this.catchAllMatch[0].gen(0, names)}`;
      result += `\n${getIndent(--indent)}}`;
      indent -= 1;
    } else {
      result += `\n${getIndent(indent + 1)}}`;
    }
    result += `\n${getIndent(indent)}})()`;
    return result;
  },
});

Object.assign(Match.prototype, {
  gen(indent = 0, names) {
    // console.log(this.matchee.constructor);
    if (this.matchee.constructor === Block) {
      return `${this.matchee.gen(0, names)}`;
    }
    return `return ${this.matchee.gen(0, names)};`;
  },
});

Object.assign(Parameter.prototype, {
  gen(indent = 0, names) {
    let result = `${names(this.id)}`;
    if (this.defaultValue != null) {
      result += ` = ${this.defaultValue.gen(0, names)}`;
    }
    return result;
  },
});

Object.assign(BinaryExpression.prototype, {
  gen(indent = 0, names) {
    let operator = this.op;
    if (operator === '==') {
      operator = '===';
    } else if (operator === '^') {
      return `Math.pow(${this.left.gen(0, names)}, ${this.right.gen(0, names)})`;
    }
    return `${this.left.gen(0, names)} ${operator} ${this.right.gen(0, names)}`;
  },
});

Object.assign(UnaryExpression.prototype, {
  gen(indent = 0, names) {
    return `(${this.op} ${this.operand.gen(0, names)})`;
  },
});

Object.assign(ParenthesisExpression.prototype, {
  gen(indent = 0, names) {
    return `(${this.exp.gen(0, names)})`;
  },
});

Object.assign(IdExpression.prototype, {
  gen(indent = 0, names, inAssignment = true) {
    return `${this.idExpBody.gen(indent, names, inAssignment)}`;
  },
});

Object.assign(IdExpressionBodyBase.prototype, {
  gen(indent = 0, names, inAssignment = true) {
    let result = `${getIndent(indent)}`;
    result += this.id === 'this' ? 'this' : `${names(this.id)}`;
    return result;
  },
});

Object.assign(IdExpressionBodyRecursive.prototype, {
  gen(indent = 0, names, inAssignment = true) {
    let result = `${getIndent(indent)}${this.idExpBase.gen(0, names)}`;
    if (this.appendageOp === '()') {
      result += `(${this.idAppendage.gen(0, names)})`;
      result += inAssignment ? '' : ';';
    } else if (this.appendageOp === '[]') {
      result += `(${this.idAppendage.gen(0, names)})`;
    } else {
      result += `${this.idAppendage.gen(0, names)}`;
    }
    return result;
  },
});

Object.assign(PeriodId.prototype, {
  gen(indent = 0, names) {
    return `.${this.id}`;
  },
});

Object.assign(Arguments.prototype, {
  gen(indent = 0, names) {
    if (this.varList === undefined) {
      return '';
    }
    return `${this.varList.gen(0, names)}`;
  },
});

Object.assign(IdSelector.prototype, {
  gen(indent = 0, names) {
    return `[${this.letiable.gen(0, names)}]`;
  },
});

Object.assign(List.prototype, {
  gen(indent = 0, names) {
    if (this.values.gen(0, names) === undefined) {
      return '[]';
    }
    return `[${this.values.gen(0, names)}]`;
  },
});

Object.assign(Tuple.prototype, {
  gen(indent = 0, names) {
    return `[${this.values.variables.map(v => v.gen(0, names)).join(', ')}]`;
  },
});

Object.assign(Dictionary.prototype, {
  gen(indent = 0, names) {
    return `{${this.properities.map(p => p.gen(0, names)).join(', ')}}`;
  },
});

Object.assign(IdValuePair.prototype, {
  gen(indent = 0, names) {
    return `${this.id}:${this.variable.gen(0, names)}`;
  },
});

Object.assign(Variable.prototype, {
  gen(indent = 0, names) {
    return `${this.var.gen(indent, names)}`;
  },
});

Object.assign(VarList.prototype, {
  gen(indent = 0, names) {
    if (this.variables.length > 0) {
      return `${this.variables.map(v => v.gen(0, names)).join(', ')}`;
    }
  },
});

Object.assign(BoolLit.prototype, {
  gen(indent = 0, names) {
    return `${this.value}`;
  },
});

Object.assign(IntLit.prototype, {
  gen(indent = 0, names) {
    return `${this.value}`;
  },
});

Object.assign(FloatLit.prototype, {
  gen(indent = 0, names) {
    return `${this.value}`;
  },
});

Object.assign(StringLit.prototype, {
  gen(indent = 0, names) {
    return `"${this.value}"`;
  },
});

Object.assign(NullLit.prototype, {
  gen(indent = 0, names) {
    return `${this.value}`;
  },
});

Object.assign(IdVariable.prototype, {
  gen(indent = 0, names) {
    return `${this.value}`;
  },
});

Object.assign(ConstId.prototype, {
  gen(indent = 0, names) {
    return `CONST ${this.words}${this.rest}`;
  },
});

Object.assign(ClassId.prototype, {
  gen(indent = 0, names) {
    return `CONST ${this.className}${this.rest}`;
  },
});

module.exports = program => program.gen();
