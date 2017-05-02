const fs = require('fs');
const path = require('path');
const ohm = require('ohm-js');
const assert = require('assert');
const util = require('util');
const parser = require('../../parser.js');

const validPrograms = path.resolve('./test/parser/programs/valid');
const invalidPrograms = path.resolve('./test/parser/programs/invalid');
const validProgramAsts = path.resolve('./test/parser/ast/valid');
// invalidProgramAsts = path.resolve('./test/parser/ast/invalid');

const parserPrograms = {
  'arithmetic1.guav': require(path.resolve(`${validProgramAsts}/arithmetic1.js`)),
  'arithmetic2.guav': require(path.resolve(`${validProgramAsts}/arithmetic2.js`)),
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
  'funcDecl3.guav': require(path.resolve(`${validProgramAsts}/funcDecl3.js`)),
  'idExp1.guav': require(path.resolve(`${validProgramAsts}/idExp1.js`)),
  'idExp2.guav': require(path.resolve(`${validProgramAsts}/idExp2.js`)),
  'idExp3.guav': require(path.resolve(`${validProgramAsts}/idExp3.js`)),
  'ifElse.guav': require(path.resolve(`${validProgramAsts}/ifElse.js`)),
  'match1.guav': require(path.resolve(`${validProgramAsts}/match1.js`)),
  'match2.guav': require(path.resolve(`${validProgramAsts}/match2.js`)),
  'print1.guav': require(path.resolve(`${validProgramAsts}/print1.js`)),
  'shortMatch.guav': require(path.resolve(`${validProgramAsts}/shortMatch.js`)),
  'tuple.guav': require(path.resolve(`${validProgramAsts}/tuple.js`)),
  'while1.guav': require(path.resolve(`${validProgramAsts}/while1.js`)),
  'bigProgram.guav': require(path.resolve(`${validProgramAsts}/bigProgram.js`)),
};

const tests = (validFiles, invalidFiles) => {
  describe('Parser tests', () => {
    describe('Test valid example programs', () => {
      validFiles.forEach((file) => {
        it(`parser\\programs\\valid\\${file.name} should be accepted by the grammar`,
          () => {
            // console.log(util.inspect(parser(file.code), {depth: null}));
            assert.equal(parser(file.code).toString(), parserPrograms[file.name].getAst(),
              `Returned: ${parser(file.code).toString()}`);
          });
      });
    });

    // describe('Test invalid example programs', () => {
    //   invalidFiles.forEach((file) => {
    //     it('parser\\programs\\invalid\\' + file.name + ' should be rejected by the grammar',
    //       () => {
    //         grammarResult = grammar.match(file.code);
    //         assert.equal(grammarResult.succeeded(), false,
    //           'Returned: ' + grammarResult);
    //     });
    //   });
    // });
  });
};

(() => {
  const validFiles = [];
  const invalidFiles = [];

  fs.readdirSync(validPrograms).forEach((fileName) => {
    const fullProgramPath = `${validPrograms}/${fileName}`;
    const programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // if(fileName == "idExp3.guav") => {
    validFiles.push({
      name: fileName,
      code: programFileContents,
    });
    // }
  });

  // fs.readdirSync(invalidPrograms).forEach((fileName) => {
  //   fullFilePath = invalidPrograms + '/' + fileName;
  //   fileContents = fs.readFileSync(fullFilePath, 'utf-8');
  //   invalidFiles.push({
  //     name: fileName,
  //     code: fileContents
  //   });
  // });

  tests(validFiles, invalidFiles);
})();
