const fs = require('fs');
const path = require('path');
const assert = require('assert');
// const util = require('util');
const parser = require('../../parser.js');

const validPrograms = path.resolve('./test/semantics/programs/valid');
const invalidPrograms = path.resolve('./test/semantics/programs/invalid');

const tests = (validFiles, invalidFiles) => {
  describe('Semantic analysis tests:', () => {
    describe('Valid example program', () => {
      validFiles.forEach((file) => {
        it(`parser\\programs\\valid\\${file.name} should analyze without any errors`,
          () => {
            // console.log(util.inspect(parser(file.code), {depth: null}));
            parser(file.code).analyze();
            // done();
          });
      });
    });

    describe('Invalid example program,', () => {
      invalidFiles.forEach((file) => {
        it(`parser\\programs\\invalid\\${file.name} should throw a semantic error`,
          () => {
            const errorPattern = /Error/;
            // console.log(util.inspect(parser(file.code), {depth: null}));
            assert.throws(() => parser(file.code).analyze(), errorPattern);
            // done();
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
    const fileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // if(fileName == "exhaustive-match-using-else.guav") => {
    validFiles.push({
      name: fileName,
      code: fileContents,
    });
    // }
  });

  fs.readdirSync(invalidPrograms).forEach((fileName) => {
    const fullFilePath = `${invalidPrograms}/${fileName}`;
    const fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    // if(fileName == "invalid-post-op.guav") => {
    invalidFiles.push({
      name: fileName,
      code: fileContents,
    });
    // }
  });

  tests(validFiles, invalidFiles);
})();
