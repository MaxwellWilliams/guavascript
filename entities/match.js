module.exports = class Match {
    constructor(matchee) {
        this.matchee = matchee;
    }
    analyze(context) {
        return this;
    }
    optimize() {
        this.matchee.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${this.matchee.toString(indent)}`;
    }
};