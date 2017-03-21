class AnalysisContext {

    constructor(parent) {
        this.symbolTable = {};
        this.parent = parent;
    }

    createChildContext() {
        return new AnalysisContext(this)
    }

    variableMustNotBeAlreadyDeclared(name) {
        if
    }

}
