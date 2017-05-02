const astClasses = require('../parser.js');
const TYPE = require('./types.js');

const semanticErrors = {
  changedImmutableType(id, expectedType, receivedType) {
    return `ChangedImmutableType Error: Cannot to change ${id} `
         + `from ${expectedType} to ${receivedType}`;
  },
  useBeforeDeclaration(id) {
    return `UseBeforeDeclaration Error: ${id} was used but undeclared`;
  },
  doesntHaveExpectedType(id, expectedType, actualType) {
    if (id === undefined) {
      return `IncorrectType Error: Expected ${expectedType}, but found ${actualType}`;
    }
    return `IncorrectType Error: ${id} was expected to be ${expectedType} but is ${actualType}`;
  },
  classWithoutConstructor(id) {
    return `MissingConstructor Error: Class ${id} doesnt have a constructor`;
  },
  invalidBinaryOperands(leftType, op, rightType) {
    return `InvalidBinaryOperands Error: ${leftType} and ${rightType} cannot be used with ${op}`;
  },
  invalidUnaryOperand(type, op) {
    return `InvalidUnaryOperand Error: ${type} cannot be used with ${op}`;
  },
  matchMissingCatchAll() {
    return 'MatchMissingCatchAll Error: Match statement is missing catch all condition';
  },
  unusedVariable(id) {
    return `UnusedVariable Error: Local variable ${id} is declared but never used`;
  },
  notCalledAsFunction(id) {
    return `NotCalledAsFunction Error: ${id} was expected to be called as a function`;
  },
  invalidParams(id, functionType, calledType) {
    if (functionType === undefined && calledType === undefined) {
      return `InvalidParams Error: ${id} was called with parameters of incorrect type(s)`;
    }
    return `InvalidParams Error: ${id} was expected to be called with ${functionType}` +
           ` but was called with ${calledType}`;
  },
  returnOutsideFunction() {
    return 'ReturnOutsideFunction Error: Found a return statement outside of a function';
  },
  multipleReturnsInABlock() {
    return 'MultipleReturnsInABlock Error: Found more than one return statement in a block';
  },
};

function checkElementinArray(element, array) {
  for (const arrayCounter in array) {
    if (array[arrayCounter].length === element.length) {
      let equal = true;
      for (const elementCounter in element) {
        if (element[elementCounter] !== array[arrayCounter][elementCounter]) { equal = false; }
      }
      if (equal) { return true; }
    }
  }
  return false;
}

class Context {
  constructor(parent = null, inFunctionDelaration = false,
    inClassDelaration = false, currentClassId = undefined) {
    this.parent = parent;
    this.inFunctionDelaration = inFunctionDelaration;
    this.inClassDelaration = inClassDelaration;
    this.currentClassId = currentClassId;

    this.idTable = {};
  }

  createChildContextForBlock() {
    return new Context(this, this.inFunctionDelaration,
      this.inClassDelaration, this.currentClassId);
  }

  createChildContextForFunctionDeclaration() {
    return new Context(this, true, this.inClassDelaration, this.currentClassId);
  }

  createChildContextForClassDeclaration(currentClassId) {
    return new Context(this, this.inFunctionDelaration, true, currentClassId);
  }

  setId(id, value, type, isFunction = false, paramType = undefined) {
    // Case 1- Updating the value of an existing variable within the current scope:
    if (id in this.idTable) {
      // Make sure the new value has the correct type (static typing):
      if ((this.idTable[id].isFunction === isFunction) &&
       (this.idTable[id].paramType === paramType) &&
       (this.idTable[id].type === type)) {
        this.idTable[id].used = true;
      } else if (type === TYPE.NULL) {
        this.idTable[id].value = value;
        this.idTable[id].type = type;
        this.idTable[id].used = true;
        this.idTable[id].isFunction = isFunction;
        this.idTable[id].paramType = paramType;

        if (type === TYPE.CLASS) { this.idTable[id].properities = { constructors: [] }; }
        if (type === TYPE.DICTIONARY) { this.idTable[id].properities = {}; }
        if (type === TYPE.LIST || type === TYPE.TUPLE) { this.idTable[id].properities = []; }
      } else if (this.idTable[id].type === undefined) {
        // Updating recently declared variable with type (AssignmentStatement)
        this.idTable[id].value = value;
        this.idTable[id].type = type;
        this.idTable[id].possibleTypes = undefined;

        if (type === TYPE.CLASS) { this.idTable[id].properities = { constructors: [] }; }
        if (type === TYPE.DICTIONARY) { this.idTable[id].properities = {}; }
        if (type === TYPE.LIST || type === TYPE.TUPLE) { this.idTable[id].properities = []; }
      } else {
        throw new Error(semanticErrors.changedImmutableType(id, this.idTable[id].type, type));
      }
    } else {
      // Case 3- Either creating a new variable or shadowing an old one:
      this.idTable[id] = {};
      this.idTable[id].used = false;
      this.idTable[id].value = value;
      this.idTable[id].type = type;
      this.idTable[id].possibleTypes = undefined;
      this.idTable[id].isFunction = isFunction;
      this.idTable[id].paramType = paramType;
      this.idTable[id].properities = undefined;

      if (type === undefined) { this.idTable[id].possibleTypes = []; }

      if (type === TYPE.CLASS) { this.idTable[id].properities = { constructors: [] }; }
      if (type === TYPE.DICTIONARY) { this.idTable[id].properities = {}; }
      if (type === TYPE.LIST || type === TYPE.TUPLE) { this.idTable[id].properities = []; }
    }
  }

  setVariable(id, value, type) {
    this.setId(id, value, type);
  }

  setFunction(id, type, paramType) {
    this.setId(id, undefined, type, true, paramType);
  }

  getId(id, silent = false, onlyThisContext = false) {
    if (id in this.idTable) {
      this.idTable[id].used = true;
      return this.idTable[id];
    } else if (this.parent === null) {
      if (silent) {
        return undefined;
      }
      throw new Error(semanticErrors.useBeforeDeclaration(id));
    } else {
      if (onlyThisContext) {
        if (silent) {
          return undefined;
        }
        throw new Error(semanticErrors.useBeforeDeclaration(id));
      } else {
        return this.parent.getId(id, silent, onlyThisContext);
      }
    }
  }

  addProperityToId(id, value, key = undefined) {
    const variable = this.getId(id);
    if (variable.type === TYPE.CLASS) {
      if (typeof key !== 'string') {
        throw new Error(`invalidKey Error: ${id} is a class and expects key to be type string`);
      } else if (key === 'constructor') {
        variable.properities.constructors.push(value);
      } else {
        variable.properities[key] = value;
      }
    } else if (variable.type === TYPE.DICTIONARY) {
      if (typeof key !== 'string') {
        throw new Error(`invalidKey Error: ${id} is a dictionary and expects key to be type string`);
      }
      variable.properities[key] = value;
    } else if (variable.type === TYPE.LIST) {
      variable.properities.push(value);
    } else if (variable.type === TYPE.TUPLE) {
      variable.properities.push(value);
    } else {
      throw new Error(`${id} has type ${variable.type} and therfore cannot have properities`);
    }
  }

  getPropertyFromId(id, key) {
    const variable = this.getId(id);
    if (variable.type === TYPE.CLASS || variable.type === TYPE.DICTIONARY) {
      if (key in variable.properities) {
        return variable.properities[key];
      }
      throw new Error(semanticErrors.useBeforeDeclaration(`${id}.${key}`));
    } else if (variable.type === TYPE.LIST) {
      if (key <= (variable.properities.length + 1)) {
        return variable.properities.indexOf(key);
      }
      throw new Error(semanticErrors.useBeforeDeclaration(`${id}.${key}`));
    } else {
      throw new Error(`${id} has no propterties`);
    }
  }

  managePossibleTypes(id, newPossibleTypes) {
    const possibleTypes = this.idTable[id].possibleTypes;
    const existingTypes = (possibleTypes.length !== 0);

    if (existingTypes) {
      this.idTable[id].possibleTypes = [];
    }

    for (const newTypeCounter in newPossibleTypes) {
      const newPossibleType = newPossibleTypes[newTypeCounter];
      if (!existingTypes && this.idTable[id].possibleTypes.indexOf(newPossibleType) === -1) {
        this.idTable[id].possibleTypes.push(newPossibleType);
      } else if (existingTypes && possibleTypes.indexOf(newPossibleType) !== -1 &&
        this.idTable[id].possibleTypes.indexOf(newPossibleType) === -1) {
        this.idTable[id].possibleTypes.push(newPossibleType);
      }
    }
  }

  assertPossibleType(id, type) {
    if (!(type in this.idTable[id].possibleTypes)) {
      throw new Error(`${id} cannot have type ${type}`);
    }
  }

  assertAllLocalVarsUsed() {
    for (const varName in this.idTable) {
      const variable = this.idTable[varName];
      if (variable.used === false) {
        throw new Error(semanticErrors.unusedVariable(varName));
      }
    }
  }

  assertIdIsType(id, actualType) {
    if (actualType !== this.getId(id).type) {
      throw new Error(semanticErrors.doesntHaveExpectedType(id, this.getId(id).type, actualType));
    }
  }

  assertTypesAreEqual(expectedType, actualType) {
    if (expectedType !== actualType) {
      throw new Error(semanticErrors.doesntHaveExpectedType(undefined, expectedType, actualType));
    }
  }

  assertIsIteratable(id) {
    const idType = this.getId(id).type;
    if (idType !== TYPE.DICTIONARY && idType !== TYPE.LIST && idType !== TYPE.TUPLE) {
      const actualType = `${TYPE.DICTIONARY} ${TYPE.LIST} ${TYPE.TUPLE}`;
      throw new Error(semanticErrors.doesntHaveExpectedType(id, this.getId(id).type, actualType));
    }
  }

  assertClassHasConstructor(id) {
    this.assertIdIsType(id, TYPE.CLASS);
    const classConstructors = this.getId(id).properities.constructors;
    if (classConstructors.length < 1) {
      throw new Error(semanticErrors.classWithoutConstructor(id));
    }
  }

  assertInFunctionDeclaration() {
    if (!this.inFunctionDelaration) {
      throw new Error(semanticErrors.returnOutsideFunction());
    }
  }

  assertIdCalledAsFunction(id, op) {
    if (op !== '()') {
      throw new Error(semanticErrors.notCalledAsFunction(id));
    }
  }

  assertFunctionCalledWithValidParams(id, functionType, calledType) {
    if (functionType.length !== calledType.length) {
      throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
    }
    for (const typeCounter in functionType) {
      if (Array.isArray(functionType[typeCounter]) && (calledType[typeCounter] !== undefined)) {
        if (functionType[typeCounter].indexOf(calledType[typeCounter]) === -1) {
          throw new Error(semanticErrors.invalidParams(id));
        }
      } else if (((functionType[typeCounter] !== calledType[typeCounter]) &&
        (functionType[typeCounter] !== undefined)) || (calledType[typeCounter] === undefined)) {
        throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
      }
    }
  }

  assertUnaryOperandIsOneOfTypes(op, expected, received) {
    if (expected.indexOf(received) === -1) {
      throw new Error(semanticErrors.invalidUnaryOperand(received, op));
    }
  }

  assertBinaryOperandIsOneOfTypePairs(op, expectedTypes, actualTypes) {
    if (!checkElementinArray(actualTypes, expectedTypes)) {
      throw new Error(semanticErrors.invalidBinaryOperands(actualTypes[0], op, actualTypes[1]));
    }
  }

  assertMultipleReturnsInABlock() {
    throw new Error(semanticErrors.multipleReturnsInABlock());
  }

  assertMatchHasCatchAll(catchAll) {
    if (catchAll.length === 0) {
      throw new Error(semanticErrors.matchMissingCatchAll());
    }
  }
}

module.exports = Context;
