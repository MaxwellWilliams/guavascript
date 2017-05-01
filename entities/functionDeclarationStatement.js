const getIndent = require('../semantics/getIndent.js');

module.exports = class FunctionDeclarationStatement {
    constructor(id, parameterArray, block) {
        this.id = id;
        this.parameterArray = parameterArray;
        this.block = block;
        this.paramType = [];
    }
    analyze(context) {
        let blockContext = context.createChildContextForFunctionDeclaration();
        let self = this;

        // If there is a default value, instantiate the variable in the block.
        // For all vars with a default, then they must match the type.
        this.parameterArray.forEach(function(parameter) {
            if (parameter.defaultValue !== null) {
                parameter.defaultValue.analyze(context);
                blockContext.setVariable(parameter.id, parameter.defaultValue.value, parameter.defaultValue.type);
            } else {
                blockContext.setVariable(parameter.id, undefined, undefined);
            }
        });

        this.block.analyze(blockContext);

        this.parameterArray.forEach(function(param) {
            var parameter = blockContext.getId(param.id);
            if(parameter.type === undefined) {
                self.paramType.push(parameter.possibleTypes);
            } else {
                self.paramType.push(parameter.type);
            }
        });

        if(context.inClassDelaration) {
            let functionProperities = {
                type: this.block.returnType,
                paramType: this.paramType
            }
            context.addProperityToId(context.currentClassId, functionProperities, this.id)
        } else {
            context.setFunction(this.id, this.block.returnType, this.paramType);
        }
        return this;
    }
    optimize() {
        this.block = this.block.optimize();
        return this;
    }
    toString(indent = 0) {
        var string = `${getIndent(indent)}(Func` +
                    `\n${getIndent(++indent)}(id ${this.id})` +
                    `\n${getIndent(indent++)}(Parameters`;
        if (this.parameterArray.length !== 0) {
            for (var parameterIndex in this.parameterArray) {
                string += `\n${this.parameterArray[parameterIndex].toString(indent)}`;
            }
            string += `\n${getIndent(--indent)})`;
        } else {
          string += `)`;
          indent -= 1;
        }
        string += `\n${this.block.toString(indent)}` +
                  `\n${getIndent(--indent)})`;
        return string;
    }
};