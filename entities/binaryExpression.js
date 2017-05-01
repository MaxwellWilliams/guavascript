const TYPE = require('../semantics/types.js');
const getIndent = require('../semantics/getIndent.js');

allTypePairs = [];
for (let i in TYPE) {
    if(TYPE.hasOwnProperty(i)) {
        for (let j in TYPE) {
            if(TYPE.hasOwnProperty(j)) {
                allTypePairs.push([i, j]);
            }
        }
    }
}

function pushUndefinedAndType(array, type) {
    if(type === undefined) {
        array.push([undefined, undefined]);
    } else {
        array.push([undefined, type]);
        array.push([type, undefined]);
    }
}

module.exports = class BinaryExpression {
    constructor(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
        this.type;
    }
    analyze(context) {
        this.left.analyze(context);
        this.right.analyze(context);
        let expectedTypePairs;

        if(this.op === "||" || this.op === "&&") {
            this.type = TYPE.BOOLEAN;
            expectedTypePairs = expectedTypePairs.push([TYPE.BOOLEAN, TYPE.BOOLEAN]);
        } else if(this.op === "+") {
            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.INTEGER, TYPE.STRING],
                [TYPE.INTEGER, TYPE.LIST],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.STRING],
                [TYPE.FLOAT, TYPE.LIST],
                [TYPE.STRING, TYPE.STRING],
                [TYPE.STRING, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.STRING],
                [TYPE.STRING, TYPE.FLOAT],
                [TYPE.STRING, TYPE.BOOLEAN],
                [TYPE.STRING, TYPE.LIST],
                [TYPE.BOOLEAN, TYPE.STRING],
                [TYPE.BOOLEAN, TYPE.LIST],
                [TYPE.LIST, TYPE.LIST],
                [TYPE.LIST, TYPE.INTEGER],
                [TYPE.LIST, TYPE.FLOAT],
                [TYPE.LIST, TYPE.STRING],
                [TYPE.LIST, TYPE.BOOLEAN]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, TYPE.STRING);
                pushUndefinedAndType(expectedTypePairs, TYPE.LIST);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if(["-", "/", "<=", "<", ">=", ">", "^"].indexOf(this.op) > -1) {
            if(["<=", "<", ">=", ">"].indexOf(this.op) > -1) {
                this.type = TYPE.BOOLEAN;
            }

            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if(this.op === "*") {
            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.INTEGER, TYPE.STRING],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT],
                [TYPE.STRING, TYPE.INTEGER]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if(this.op === "//" || this.op === "%") {
            if(this.op === "//") {
                this.type = TYPE.INTEGER;
            } else if(this.left.type === TYPE.FLOAT || this.right.type === TYPE.FLOAT) {
                this.type = TYPE.FLOAT;
            } else {
                this.type = TYPE.INTEGER;
            }

            expectedTypePairs = [
                [TYPE.INTEGER, TYPE.INTEGER],
                [TYPE.INTEGER, TYPE.FLOAT],
                [TYPE.FLOAT, TYPE.INTEGER],
                [TYPE.FLOAT, TYPE.FLOAT]
            ];

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, TYPE.INTEGER);
                pushUndefinedAndType(expectedTypePairs, TYPE.FLOAT);
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        } else if(this.op === "==" || this.op === "!=") {
            this.type = TYPE.BOOLEAN

            expectedTypePairs = allTypePairs;

            if(context.inFunctionDelaration) {
                pushUndefinedAndType(expectedTypePairs, undefined);
            }
        }
        context.assertBinaryOperandIsOneOfTypePairs(
            this.op,
            expectedTypePairs,
            [this.left.type, this.right.type]
        );

        if(this.type === undefined) {
            if(this.left.type === TYPE.STRING || this.right.type === TYPE.STRING) {
                this.type = TYPE.STRING;
            } else if(this.left.type === TYPE.FLOAT || this.right.type === TYPE.FLOAT) {
                this.type = TYPE.FLOAT;
            } else {
                this.type = this.left.type;
            }
        }

        if(context.inFunctionDelaration && this.left.id && this.left.type === undefined) {
            var possibleTypes = [];

            for(var typePairCounter in expectedTypePairs) {
                var possibleType = expectedTypePairs[typePairCounter][0];

                if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
                    possibleTypes.push(possibleType);
                  }
            }
            context.managePossibleTypes(this.left.id, possibleTypes)
        }
        if(context.inFunctionDelaration && this.right.id && this.right.type === undefined) {
            var possibleTypes = [];

            for(var typePairCounter in expectedTypePairs) {
                var possibleType = expectedTypePairs[typePairCounter][1];

                if(((possibleTypes.indexOf(possibleType) === -1)) && (possibleType !== undefined)) {
                    possibleTypes.push(possibleType);
                  }
            }
            context.managePossibleTypes(this.right.id, possibleTypes)
        }
        return this;
    }
    optimize() {
        /*if(this.op === "+") {

        } else if(this.op === "-") {

        } else if(this.op === "*") {

        } else if(this.op === "/") {
            
        } else if(this.op === "%") {
            
        }*/
        this.left.optimize();
        this.right.optimize();
        return this;
    }
    toString(indent = 0) {
        return `${getIndent(indent)}(${this.op}` +
               `\n${this.left.toString(++indent)}` +
               `\n${this.right.toString(indent)}` +
               `\n${getIndent(--indent)})`;
    }
};