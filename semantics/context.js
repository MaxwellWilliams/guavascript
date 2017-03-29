// Largely basing Context off of Dr. Toal's Plainscript...

const astClasses = require('../guavascript_AST_generator.js');

// Reminder: to access FunctionDeclarationStatement and Parameter:
// let x = new astClasses.FunctionDeclarationStatement(...)
// let x = new astClasses.Parameter(...)

class Context {

    constructor(parent, currentFunction, isInLoop) {
        this.parent = parent || null;
        this.currentFunction = currentFunction || null;
        this.isInLoop = isInLoop;

        // Need Object.create(null) so things like toString are not in this.variables
        this.variables = Object.create(null);
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

    addVariable(id, value) {
        if (id in this.variables) {
            throw new Error(`${id} has already been declared within this scope`);
        }
        this.variables[id] = value;
    }

    get(id) {
        if (id in this.variables) {
            return this.variables[id];
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

    // Use these when a Program is newly created:
    Context.INITIAL = new Context();

}

module.exports = Context;
