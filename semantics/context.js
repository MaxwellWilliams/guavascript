// Largely basing Context off of Dr. Toal's Plainscript...

const astClasses = require('../parser.js');

// Reminder: to access FunctionDeclarationStatement and Parameter:
// let x = new astClasses.FunctionDeclarationStatement(...)
// let x = new astClasses.Parameter(...)

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

    // TODO: Do we need both addVariable and setVariable? Our language has no instantiation syntax...

    addVariable(id, value, type) {

        // Only one uniqueness bucket - functions and non-functions cannot have the same id:
        if (id in this.symbolTable) {
            throw new Error(`${id} has already been declared within this scope`);
        }
        this.symbolTable[id] = {value: value, type: type};
    }

    setVariable(id, value, type) {

        // Case 1- updating the value of a variable within the current scope:
        if (id in this.symbolTable) {

            // Make sure the new value has the correct type (static typing):
            if (this.symbolTable[id].type === type) {
                this.symbolTable[id] = {value: value, type: type};
            } else {
                throw new Error(`Expected type ${this.symbolTable[id].type} but got ${type}`)
            }
        } else {

            // Case 2- either creating a new variable or shadowing an old one:
            this.addVariable(id, value, type);
        }
    }

    get(id) {
        if (id in this.symbolTable) {
            return this.symbolTable[id];
        } else if (this.parent === null) {

            // If we are at the topmost block and didn't find id:
            throw new Error(`${id} has not been declared`);

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
            throw new Error(`${value.id} is not a function`);
        }
    }

    assertVariableIsNotAlreadyDeclared(id) {

        // Only check the current level context:
        if (this.symbolTable[id]) {
            throw new Error(`${id} has already been declared`);
        }
    }

    // Use these when a Program is newly created:
    // Context.INITIAL = new Context();  // eslint doesn't like the "." after Context ???

}

module.exports = Context;
