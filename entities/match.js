module.exports = class Match {
    constructor(matchee) {
        this.matchee = matchee;
    }
    analyze(context) {}
    toString(indent = 0) {
        return `${this.matchee.toString(indent)}`;
    }
};