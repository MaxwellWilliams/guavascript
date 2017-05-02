const fs = require('fs');
const path = require('path');
const ohm = require('ohm-js');
const assert = require('assert');
const util = require('util');
const parser = require('../../parser.js');

const validPrograms = path.resolve('./test/optimizer/programs/valid');
const invalidPrograms = path.resolve('./test/optimizer/programs/invalid');
const validProgramAsts = path.resolve('./test/optimizer/ast/valid');

const optimizedPrograms = {
  'arithmetic1.guav': require(path.resolve(`${validProgramAsts}/arithmetic1.js`)),
  'arithmetic2.guav': require(path.resolve(`${validProgramAsts}/arithmetic2.js`)),
  'arithmetic3.guav': require(path.resolve(`${validProgramAsts}/arithmetic3.js`)),
  'arithmetic4.guav': require(path.resolve(`${validProgramAsts}/arithmetic4.js`)),
  'arithmetic5.guav': require(path.resolve(`${validProgramAsts}/arithmetic5.js`)),
  'arithmetic6.guav': require(path.resolve(`${validProgramAsts}/arithmetic6.js`)),
  'arithmetic7.guav': require(path.resolve(`${validProgramAsts}/arithmetic7.js`)),
  'arithmetic8.guav': require(path.resolve(`${validProgramAsts}/arithmetic8.js`)),
  'arithmetic9.guav': require(path.resolve(`${validProgramAsts}/arithmetic9.js`)),
  'arithmetic10.guav': require(path.resolve(`${validProgramAsts}/arithmetic10.js`)),
  'arithmetic11.guav': require(path.resolve(`${validProgramAsts}/arithmetic11.js`)),
  'arithmetic12.guav': require(path.resolve(`${validProgramAsts}/arithmetic12.js`)),
  'arithmetic13.guav': require(path.resolve(`${validProgramAsts}/arithmetic13.js`)),
  'arithmetic14.guav': require(path.resolve(`${validProgramAsts}/arithmetic14.js`)),
  'class1.guav': require(path.resolve(`${validProgramAsts}/class1.js`)),
  'conditional1.guav': require(path.resolve(`${validProgramAsts}/conditional1.js`)),
  'constDecl1.guav': require(path.resolve(`${validProgramAsts}/constDecl1.js`)),
  'constDecl2.guav': require(path.resolve(`${validProgramAsts}/constDecl2.js`)),
  'decl1.guav': require(path.resolve(`${validProgramAsts}/decl1.js`)),
  'decl2.guav': require(path.resolve(`${validProgramAsts}/decl2.js`)),
  'decl3.guav': require(path.resolve(`${validProgramAsts}/decl3.js`)),
  'decl4.guav': require(path.resolve(`${validProgramAsts}/decl4.js`)),
  'dict1.guav': require(path.resolve(`${validProgramAsts}/dict1.js`)),
  'dict2.guav': require(path.resolve(`${validProgramAsts}/dict2.js`)),
  'funcDecl1.guav': require(path.resolve(`${validProgramAsts}/funcDecl1.js`)),
  'funcDecl2.guav': require(path.resolve(`${validProgramAsts}/funcDecl2.js`)),
  'idExp1.guav': require(path.resolve(`${validProgramAsts}/idExp1.js`)),
  'idExp2.guav': require(path.resolve(`${validProgramAsts}/idExp2.js`)),
  'ifElse1.guav': require(path.resolve(`${validProgramAsts}/ifElse1.js`)),
  'ifElse2.guav': require(path.resolve(`${validProgramAsts}/ifElse2.js`)),
  'match1.guav': require(path.resolve(`${validProgramAsts}/match1.js`)),
  'match2.guav': require(path.resolve(`${validProgramAsts}/match2.js`)),
  'print1.guav': require(path.resolve(`${validProgramAsts}/print1.js`)),
  'shortMatch.guav': require(path.resolve(`${validProgramAsts}/shortMatch.js`)),
  'tuple.guav': require(path.resolve(`${validProgramAsts}/tuple.js`)),
  'unreachableStatement.guav': require(path.resolve(`${validProgramAsts}/unreachableStatement.js`)),
  'while1.guav': require(path.resolve(`${validProgramAsts}/while1.js`)),
  'whileFalseCondition.guav': require(path.resolve(`${validProgramAsts}/whileFalseCondition.js`)),
};

const tests = (validFiles, invalidFiles) => {
  describe('Optimizer tests:', () => {
    describe('Test valid example programs', () => {
      validFiles.forEach((file) => {
        it(`parser\\programs\\valid\\${file.name} should optimize properly`,
          () => {
            // console.log(util.inspect(parser(file.code), {depth: null}));
            assert.equal(parser(file.code).analyze().optimize().toString(),
                         optimizedPrograms[file.name].getAst(),
                         `Returned: ${parser(file.code).analyze().optimize().toString()}`);
          });
      });
    });
  });
};

(() => {
  const validFiles = [];
  const invalidFiles = [];

  fs.readdirSync(validPrograms).forEach((fileName) => {
    const fullProgramPath = `${validPrograms}/${fileName}`;
    const programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
     // if(fileName == "unreachableStatement.guav") {
    validFiles.push({
      name: fileName,
      code: programFileContents,
    });
     // }
  });

  tests(validFiles, invalidFiles);
})();
