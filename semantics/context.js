const astClasses = require('../parser.js');

const semanticErrors = {
    changedImmutableType(id, expectedType, receivedType) {
        return `ChangedImmutableType error: tried to change ${id} `
            + `from type ${expectedType} to ${receivedType}`;
    },
    useBeforeDeclaration(id) {
        return `UseBeforeDeclaration error: ${id} was used but undeclared`;
    },
    isNotAFunction(id) {
        return `IsNotAFunction error: ${id} is not a function`;
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
    expressionIsNotTypeBoolean(exp, receivedType) {
        return `ExpressionIsNotTypeBoolean error: ${exp} is type ${receivedType} but must be type boolean`;
    },
    unusedLocalVariable(id) {
        return `UnusedLocalVariable error: local variable ${id} is declared but never used`;
    },
    notCalledAsFunction(id) {
        return `notCalledAsFunction error: ${id} was expected to be called as a function`
    },
    invalidParams(id, functionType, calledType) {
        return `invalidParams error: ${id} was expected to be called with ${functionType}` +
               ` but was called with ${calledType}`
    },
    returnOutsideFunction() {
        return `ReturnOutsideFunction error: found a return statement outside of a function`;
    },
    multipleReturnsInABlock(){
        return `MultipleReturnsInABlock error: found more than one return statement in a block`;
    }
};

function checkArrayinArray(arrA, arrB) {
    var hash = {};
    for (b in arrB) {
        hash[arrB[b]] = b;
    }
    return hash.hasOwnProperty(arrA);
};

class Context {
    constructor(parent, currentFunction, isInLoop, inFunctionDelaration = false) {
        this.parent = parent || null;
        this.currentFunction = currentFunction || null;
        this.isInLoop = isInLoop;
        this.inFunctionDelaration = inFunctionDelaration;

        // Need Object.create(null) so things like toString are not in this.idTable
        this.idTable = {};
    }

    createChildContextForBlock() {
        return new Context(this, this.currentFunction, this.inLoop);
    }

    createChildContextForLoop() {
        return new Context(this, this.currentFunction, true);
    }

    createChildContextForFunction(currentFunction) {
        return new Context(this, currentFunction, false);
    }

    createChildContextForFunctionDeclaration(currentFunction) {
        return new Context(this, currentFunction, false, true);
    }

    setId(id, type, isFunction = false, paramType = undefined) {
        // Case 1- Updating the value of an existing variable within the current scope:
        if(id in this.idTable) {
            // Make sure the new value has the correct type (static typing):
            if((this.idTable[id].isFunction === isFunction) &&
               (this.idTable[id].paramType === paramType) &&
               (this.idTable[id].type === type || this.idTable[id].type === "NULL")) {
                this.idTable[id].type = type;
                this.idTable[id].used = true;
            } else if(this.idTable[id].type == undefined) {
                //Updating recently declared variable with type (AssignmentStatement)
                this.idTable[id].type = type;
            } else {
                throw new Error(semanticErrors.changedImmutableType(id, this.idTable[id].type, type));
            }
        } else {
            // Case 3- Either creating a new variable or shadowing an old one:
            this.idTable[id] = {};
            this.idTable[id].type = type;
            this.idTable[id].isFunction = isFunction;
            this.idTable[id].paramType = paramType;
            this.idTable[id].used = false;
        }
    }

    setVariable(id, type) {
        this.setId(id, type);
    }

    setFunction(id, type, paramType) {
        this.setId(id, type, true, paramType);
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
                return this.parent.get(id);
            }
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

    // TODO: Possibly delete this
    assertIsInFunction(message) {
        if(!this.currentFunction) {

            // Use a more specific error message:
            throw new Error(message);
        }
    }

    assertIdCalledAsFunction(id, op) {
        if(op !== "()") {
            throw new Error(semanticErrors.notCalledAsFunction(id));
        }
    }

    assertFunctionCalledWithValidParams(id, functionType, calledType) {
        if(functionType.length !== calledType.length) {
          throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
        }
        for(var typeIndex in functionType) {
            if(((functionType[typeIndex] !== calledType[typeIndex]) && (functionType[typeIndex] !== undefined)) ||
               (calledType[typeIndex] == undefined)) {
                 throw new Error(semanticErrors.invalidParams(id, functionType, calledType));
               }
        }
    }

    assertReturnInFunction() {
        if(!this.currentFunction) {
            throw new Error(semanticErrors.returnOutsideFunction());
        }
    }

    assertIsFunction(value) {  // eslint-disable-line class-methods-use-this
        if(value.constructor !== astClasses.FunctionDeclarationStatement) {
            throw new Error(semanticErrors.isNotAFunction(value.id));
        }
    }

    assertIsTypeBoolean(exp) {
        if(!exp.type == "boolean") {
            throw new Error(semanticErrors.expressionIsNotTypeBoolean(exp, exp.type));
        }
    }

    assertUnaryOperandIsOneOfTypes(op, expected, received) {
        if(expected.indexOf(received) === -1) {
            throw new Error(semanticErrors.invalidUnaryOperand(received, op));
        }
    }

    assertBinaryOperandIsOneOfTypePairs(op, expected, received) {
        var receivedTypes = [received[0].type, received[1].type];

        if(receivedTypes[0] == "NULL" && receivedTypes[1] !== "NULL") {
          receivedTypes[0] = receivedTypes[1];
          this.setVariable(received[0].id, receivedTypes[0]);
        } else if(received[0].type !== "NULL" && received[1].type == "NULL") {
          receivedTypes[1] = receivedTypes[0];
          this.setVariable(received[1].id, receivedTypes[1]);
        }
        if(!checkArrayinArray(receivedTypes, expected)) {
            throw new Error(semanticErrors.invalidBinaryOperands(receivedTypes[0], op, receivedTypes[1]));
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
