const astClasses = require('../parser.js');

const TYPE = {
    BOOLEAN: "BOOLEAN",
    INTEGER: "INTEGER",
    FLOAT: "FLOAT",
    STRING: "STRING",
    LIST: "LIST",
    DICTIONARY: "DICTIONARY",
    TUPLE: "TUPLE",
    FUNCTION: "FUNCTION",
    CLASS: "CLASS",
    NULL: "NULL"
}

const semanticErrors = {
    changedImmutableType(id, expectedType, receivedType) {
        return `ChangedImmutableType error: tried to change ${id} `
            + `from type ${expectedType} to ${receivedType}`;
    },
    useBeforeDeclaration(id) {
        return `UseBeforeDeclaration error: ${id} was used but undeclared`;
    },
    doesntHaveExpectedType(id, expectedType, actualType) {
        return `IncorrectType error: ${id} was expected to be type ${expectedType} but is type ${actualType}`;
    },
    isNotAFunction(id) {
        return `IsNotAFunction error: ${id} is not a function`;
    },
    classWithoutConstructor(id) {
        return `MissingClassConstructor error: ${id} doesnt have a constructor`;
    },
    isNotAList(id) {
        return `IsNotAList error: ${id} is not a list`;
    },
    isNotADictionary(id) {
        return `IsNotADictionary error: ${id} is not a dictionary`;
    },
    invalidBinaryOperands(leftType, op, rightType) {
        return `InvalidBinaryOperands error: ${leftType} and ${rightType} cannot be used with ${op}`;
    },
    invalidUnaryOperand(type, op) {
        return `InvalidUnaryOperand error: ${type} cannot be used with ${op}`;
    },
    parameterArgumentMismatch(id, parameterTypeList, argumentTypeList) {
        return `ParameterArgumentMismatch error: ${id} has signature ${parameterTypeList} `
            + `but was called with signature ${argumentTypeList}`;
    },
    incompleteMatch() {
        return `IncompleteMatch error: match statement is non-exhaustive`;
    },
    conditionIsNotBoolean(exp, receivedType) {
        return `ConditionIsNotBoolean error: Conditional statement must be boolean, but is ${receivedType}`;
    },
    unusedLocalVariable(id) {
        return `UnusedLocalVariable error: local variable ${id} is declared but never used`;
    },
    notCalledAsFunction(id) {
        return `notCalledAsFunction error: ${id} was expected to be called as a function`;
    },
    invalidParams(id, functionType, calledType) {
        if(functionType === undefined && calledType === undefined) {
            return `InvalidParams error: ${id} was called with parameters of incorrect type(s)`;
        }
        return `InvalidParams error: ${id} was expected to be called with ${functionType}` +
               ` but was called with ${calledType}`;
    },
    returnOutsideFunction() {
        return `ReturnOutsideFunction error: found a return statement outside of a function`;
    },
    multipleReturnsInABlock(){
        return `MultipleReturnsInABlock error: found more than one return statement in a block`;
    }
};

function checkElementinArray(element, array) {
    for (var arrayCounter in array) {
        if(array[arrayCounter].length === element.length) {
            let equal = true;
            for (var elementCounter in element) {
                if(element[elementCounter] !== array[arrayCounter][elementCounter]) {equal = false;}
            }
            if(equal) {return true;}
        }
    }
    return false;
};

class Context {
    constructor(parent = null, currentFunction = null, isInLoop, inFunctionDelaration = false, inClassDelaration = false, currentClassId = null) {
        this.parent = parent;
        this.currentFunction = currentFunction;
        this.isInLoop = isInLoop;
        this.inFunctionDelaration = inFunctionDelaration;
        this.inClassDelaration = inClassDelaration;
        this.currentClassId = currentClassId;

        // Need Object.create(null) so things like toString are not in this.idTable
        this.idTable = {};
    }

    createChildContextForBlock() {
        return new Context(this, this.currentFunction, this.inLoop, this.inFunctionDelaration, this.inClassDelaration, this.currentClassId);
    }

    createChildContextForLoop() {
        return new Context(this, this.currentFunction, true, this.inFunctionDelaration, this.inClassDelaration, this.currentClassId);
    }

    createChildContextForFunction(currentFunction) {
        return new Context(this, currentFunction, this.inLoop, this.inFunctionDelaration, this.inClassDelaration, this.currentClassId);
    }

    createChildContextForFunctionDeclaration(currentFunction) {
        return new Context(this, this.currentFunction, this.inLoop, true, this.inClassDelaration, this.currentClassId);
    }

    createChildContextForClassDeclaration(currentClassId) {
        return new Context(this, this.currentFunction, this.inLoop,  this.inFunctionDelaration, true, currentClassId);
    }

    setId(id, type, isFunction = false, paramType = undefined) {
        // Case 1- Updating the value of an existing variable within the current scope:
        if(id in this.idTable) {
            // Make sure the new value has the correct type (static typing):
            if((this.idTable[id].isFunction === isFunction) &&
               (this.idTable[id].paramType === paramType) &&
               (this.idTable[id].type === type)) {
                this.idTable[id].used = true;
            } else if(type === "NULL") {
                this.idTable[id].type = type;
                this.idTable[id].used = true;
                this.idTable[id].isFunction = isFunction;
                this.idTable[id].paramType = paramType;
            } else if(this.idTable[id].type == undefined) {
                //Updating recently declared variable with type (AssignmentStatement)
                this.idTable[id].type = type;
                this.idTable[id].possibleTypes = undefined;
            } else {
                throw new Error(semanticErrors.changedImmutableType(id, this.idTable[id].type, type));
            }
        } else {
            // Case 3- Either creating a new variable or shadowing an old one:
            this.idTable[id] = {};
            this.idTable[id].used = false;
            this.idTable[id].type = type;
            this.idTable[id].possibleTypes = undefined;
            this.idTable[id].isFunction = isFunction;
            this.idTable[id].paramType = paramType;
            this.idTable[id].properities = undefined;

            if(type === undefined) {this.idTable[id].possibleTypes = [];}

            if(type === TYPE.CLASS) {this.idTable[id].properities = { constructors: [] };};
            if(type === TYPE.DICTIONARY) {this.idTable[id].properities = {};};
            if(type === TYPE.LIST || type === TYPE.TUPLE) {this.idTable[id].properities = [];};
        }
    }

    setVariable(id, type) {
        this.setId(id, type);
    }

    setFunction(id, type, paramType) {
        this.setId(id, type, true, paramType);
    }

    addValueToId(id, value, key = undefined) {
        let variable = this.get(id);
        if(variable.type === TYPE.CLASS) {
            if(key === undefined) {
                throw new Error(`${id} is a dictionary and expects key value pairs`);
            } else if(key === 'constructor') {
                variable.properities['constructors'].push(value);
            } else {
                variable.properities[key] = value;
            }
        } else if(variable.type === TYPE.DICTIONARY) {
            if(key = undefined) {
              throw new Error(`${id} is a dictionary and expects key value pairs`);
            }
            variable.properities[key] = value;
        } else if(variable.type === TYPE.LIST) {
            variable.properities.push(value);
        } else if(variable.type === TYPE.TUPLE) {
            variable.properities.push(value);
        } else {
          throw new Error(`${id} has type ${variable.type} and therfore cannot have properities`);
        }
    }

    getPropertyFromId(id, key) {
        let variable = this.get(id)
        if(variable.type == TYPE.CLASS || variable.type == TYPE.DICTIONARY) {
            //console.log(variable);
            //console.log(variable.properities);
            if(key in variable.properities) {
                return variable.properities[key]
            } else {
                throw new Error(semanticErrors.useBeforeDeclaration(id + '.' + key));
            }
        } else if(variable.type == TYPE.LIST) {
            if(key in variable.properities[key]) {
                return variable.properities[key]
            } else {
                throw new Error(semanticErrors.useBeforeDeclaration(id + '.' + key));
            }
        } else {
            throw new Error(`${id} has no propterties`);
        }
    }

    get(id, silent = false, onlyThisContext = false) {
        if(id in this.idTable) {
            this.idTable[id].used = true;
            return this.idTable[id];
        } else if(this.parent === null) {
            if(silent) {
                return undefined;
            } else {
                throw new Error(semanticErrors.useBeforeDeclaration(id));
            }
        } else {
            if(onlyThisContext) {
              if(silent) {
                  return undefined;
              } else {
                  throw new Error(semanticErrors.useBeforeDeclaration(id));
              }
            } else {
                return this.parent.get(id, silent, onlyThisContext);
            }
        }
    }

    managePossibleTypes(id, newPossibleTypes) {
        var possibleTypes = this.idTable[id].possibleTypes;
        var existingTypes = (possibleTypes.length !== 0);

        if(existingTypes) {
            this.idTable[id].possibleTypes = [];
        }

        for(var newTypeCounter in newPossibleTypes) {
            var newPossibleType = newPossibleTypes[newTypeCounter];
            if(!existingTypes && this.idTable[id].possibleTypes.indexOf(newPossibleType) === -1) {
                this.idTable[id].possibleTypes.push(newPossibleType);
            } else if(existingTypes && possibleTypes.indexOf(newPossibleType) !== -1 && this.idTable[id].possibleTypes.indexOf(newPossibleType) === -1) {
                this.idTable[id].possibleTypes.push(newPossibleType);
            }
        }
    }

    assertPossibleType(id, type) {
        if(!type in this.idTable[id].possibleTypes) {
            throw new Error('${id} cannot have type ${type}');
        }
    }

    assertAllLocalVarsUsed() {
      for (var varName in this.idTable) {
        var variable = this.idTable[varName];
          if (variable.used == false) {
              this.declareUnusedLocalVariable(varName);
          }
      }
    }

    assertIsType(id, actualType) {
        if(actualType !== this.get(id).type) {
            throw new Error(semanticErrors.doesntHaveExpectedType(id, this.get(id).type, actualType));
        }
    }

    assertClassHasConstructor(id) {
        this.assertIsType(id, TYPE.CLASS);
        let classConstructors = this.get(id).properities['constructors'];
        if(classConstructors.length < 1) {
            throw new Error(semanticErrors.classWithoutConstructor(id));
        }
    }

    assertInFunctionDeclaration() {
        if(!this.inFunctionDelaration) {
            throw new Error(semanticErrors.returnOutsideFunction());
        }
    }

    assertIdCalledAsFunction(id, op) {
        if(op !== "()") {
            throw new Error(semanticErrors.notCalledAsFunction(id));
        }
    }

    assertFunctionCalledWithValidParams(id, functionType, calledType) {
        console.log(functionType);
        console.log(calledType);

        if(functionType.length !== calledType.length) {
          throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
        }
        for(var typeCounter in functionType) {
            if(Array.isArray(functionType[typeCounter]) && (calledType[typeCounter] !== undefined)) {
                if(functionType[typeCounter].indexOf(calledType[typeCounter]) === -1) {
                    throw new Error(semanticErrors.invalidParams(id));
                }
            } else if(((functionType[typeCounter] !== calledType[typeCounter]) && (functionType[typeCounter] !== undefined)) ||
               (calledType[typeCounter] === undefined)) {
                 throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
               }
        }
    }

    assertIsFunction(value) {  // eslint-disable-line class-methods-use-this
        if(value.constructor !== astClasses.FunctionDeclarationStatement) {
            throw new Error(semanticErrors.isNotAFunction(value.id));
        }
    }

    assertConditionIsBoolean(exp) {
        if(exp.type !== "BOOLEAN") {
            throw new Error(semanticErrors.conditionIsNotBoolean(exp, exp.type));
        }
    }

    assertUnaryOperandIsOneOfTypes(op, expected, received) {
        if(expected.indexOf(received) === -1) {
            throw new Error(semanticErrors.invalidUnaryOperand(received, op));
        }
    }

    assertBinaryOperandIsOneOfTypePairs(op, expectedTypes, actualTypes) {
        if(!checkElementinArray(actualTypes, expectedTypes)) {
            throw new Error(semanticErrors.invalidBinaryOperands(actualTypes[0], op, actualTypes[1]));
        }
    }

    declareUnusedLocalVariable(id) {
        throw new Error(semanticErrors.unusedLocalVariable(id));
    }

    throwMultipleReturnsInABlockError() {
        throw new Error(semanticErrors.multipleReturnsInABlock());
    }

    // Use these when a Program is newly created:
    // Context.INITIAL = new Context();  // eslint doesn't like the "." after Context ???

}

module.exports = Context;
