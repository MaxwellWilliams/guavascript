const astClasses = require('../guavascript_AST_generator.js');

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
        // TODO
    }

    createChildContextForLoop() {
        // TODO
    }

    createChildContextForFunction(currentFunction) {
        // TODO
    }

    addVariable(id, value) {
        // TODO
    }

    get(id) {
        // TODO
    }

    assertIsInFunction(message) {
        // TODO
    }

    assertIsFunction(value) {
        // TODO
    }

    // TODO: Initial context

}

module.exports = Context;
