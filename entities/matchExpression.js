const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class MatchExpression {
    constructor(idExp, matchConditions, matchBlocks, catchAllMatch) {
        this.idExp = idExp;
        this.matchConditions = matchConditions;
        this.matchBlocks = matchBlocks;
        this.catchAllMatch = catchAllMatch;
        this.type = undefined;
    }
    analyze(context) {
        this.idExp.analyze(context);
        this.type = this.idExp.type;

        for(var varCounter in this.matchConditions) {
            var variable = this.matchConditions[varCounter];
            variable.analyze(context);
            context.assertTypesAreEqual(this.type, variable.type);
        }

        if(this.type !== TYPE.BOOLEAN) {
            context.assertMatchHasCatchAll(this.catchAllMatch);
        } else {
            var contiansTrueMatch = false;
            var contiansFalseMatch = false;
            for(var varCounter in this.matchConditions) {
                var variable = this.matchConditions[varCounter];
                if(variable.value === 'true') {contiansTrueMatch = true;}
                if(variable.value === 'false') {contiansFalseMatch = true;}
            }
            if(!(contiansTrueMatch && contiansFalseMatch)) {
                context.assertMatchHasCatchAll(this.catchAllMatch);
            }
        }
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(Match Expression` +
                     `\n${this.idExp.toString(++indent)}` +
                     `\n${getIndent(indent++)}(Matches`;
        if (this.matchConditions.length != 0 && this.matchConditions.length === this.matchBlocks.length) {
            for (var varIndex in this.matchConditions) {
                string += `\n${getIndent(indent)}(Match` +
                          `\n${this.matchConditions[varIndex].toString(++indent)} ->` +
                          `\n${this.matchBlocks[varIndex].toString(indent)}` +
                          `\n${getIndent(--indent)})`
            }
        }
        if (this.catchAllMatch.length > 0) {
          string += `\n${getIndent(indent)}(Match` +
                    `\n${getIndent(++indent)}_ ->` +
                    `\n${getIndent(indent)}${this.catchAllMatch.toString(indent)}` +
                    `\n${getIndent(--indent)})`;
        }
        string += `\n${getIndent(--indent)})` +
                  `\n${getIndent(--indent)})`;
        return string;
    }
};