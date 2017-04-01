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
    }
};

checkArrayinArray(arrA, arrB) {
    var hash = {};
    for (b in arrB) {
        obj[arrB[b]] = b;
    }
    if (hash.hasOwnProperty(arrA)) {
        return true;
    }
};

class Context {

    constructor(parent, currentFunction, isInLoop) {
        this.parent = parent || null;
        this.currentFunction = currentFunction || null;
        this.isInLoop = isInLoop;

        // Need Object.create(null) so things like toString are not in this.symbolTable
        this.symbolTable = Object.create(null);
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

    setVariable(id, value, type) {

        // Case 1- updating the value of a variable within the current scope:
        if (id in this.symbolTable) {

            // Make sure the new value has the correct type (static typing):
            if (this.symbolTable[id].type === type) {
                this.symbolTable[id] = {value: value, type: type};
            } else {
                throw new Error(semanticErrors.changedImmutableType(id, this.symbolTable[id].type, type))
            }
        } else {

            // Case 2- either creating a new variable or shadowing an old one:
            this.symbolTable[id] = {value: value, type: type};
        }
    }

    get(id) {
        if (id in this.symbolTable) {
            return this.symbolTable[id];
        } else if (this.parent === null) {

            // If we are at the topmost block and didn't find id:
            throw new Error(semanticErrors.useBeforeDeclaration(id));

        } else {

            // Keep looking if we have higher contexts to check:
            return this.parent.lookup(id);
        }
    }

    assertIsInFunction(message) {
        if (!this.currentFunction) {

            // Use a more specific error message:
            throw new Error(message);
        }
    }

    assertIsFunction(value) {  // eslint-disable-line class-methods-use-this
        if (value.constructor !== astClasses.FunctionDeclarationStatement) {
            throw new Error(semanticErrors.isNotAFunction(value.id));
        }
    }

    assertIsTypeBoolean(exp) {
        if (!exp.type == "boolean") {
            throw new Error(semanticErrors.expressionIsNotTypeBoolean(exp, exp.type));
        }
    }

    assertUnaryOperandIsOneOfTypes(op, expected, received) {
        if (!(received in expected)) {
            throw new Error(semanticErrors.invalidUnaryOperand(received, op));
        }
    }

    assertBinaryOperandIsOneOfTypePairs(op, expected, received) {
        if (!(received in expected)) {
            throw new Error(semanticErrors.invalidBinaryOperand(received[0], op, received[1]));
        }
    }

    // Use these when a Program is newly created:
    // Context.INITIAL = new Context();  // eslint doesn't like the "." after Context ???

}

module.exports = Context;
