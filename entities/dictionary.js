const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

module.exports = class Dictionary {
    constructor(properities) {
        this.properities = properities;
        this.type = TYPE.DICTIONARY
    }
    analyze(context) {
        for(var properityCounter in this.properities) {
            this.properities[properityCounter].analyze(context);
        }
    }
    optimize() {
        
    }
    toString(indent = 0) {
        var string = `${getIndent(indent++)}(Dictionary`
        if (this.properities.length !== 0) {
            for (var pairIndex in this.properities) {
                string += `\n${this.properities[pairIndex].toString(indent)}`;
            }
            string += `\n${getIndent(--indent)})`;
        } else {
          string += `)`;
        }
        return string;
    }
};