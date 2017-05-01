const fs = require('fs');
const path = require('path');
const assert = require('assert');
// const util = require('util');
const parser = require('../../parser.js');

const validPrograms = path.resolve('./test/semantics/programs/valid');
const invalidPrograms = path.resolve('./test/semantics/programs/invalid');

const tests = (validFiles, invalidFiles) => {
  describe('Semantic analysis tests:', function() {
    describe('Valid example program', function() {
      validFiles.forEach(function(file) {
        it('parser\\programs\\valid\\' + file.name + ' should analyze without any errors',
          function() {
            // console.log(util.inspect(parser(file.code), {depth: null}));
            parser(file.code).analyze();
            //done();
        });
      });
    });

    describe('Invalid example program,', function() {
      invalidFiles.forEach(function(file) {
        it('parser\\programs\\invalid\\' + file.name + ' should throw a semantic error',
          function() {
            const errorPattern = /Error/;
            // console.log(util.inspect(parser(file.code), {depth: null}));
            assert.throws(() => parser(file.code).analyze(), errorPattern);
            //done();
        });
      });
    });
  });
};

(function() {
  let validFiles = [];
  let invalidFiles = [];

  fs.readdirSync(validPrograms).forEach(function(fileName) {
      fullProgramPath = validPrograms + '/' + fileName;
      fileContents = fs.readFileSync(fullProgramPath, 'utf-8');
      // if(fileName == "exhaustive-match-using-else.guav") {
      validFiles.push({
        name: fileName,
        code: fileContents
      });
    // }
  });

  fs.readdirSync(invalidPrograms).forEach(function(fileName) {
    fullFilePath = invalidPrograms + '/' + fileName;
    fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    // if(fileName == "invalid-post-op.guav") {
    invalidFiles.push({
      name: fileName,
      code: fileContents
    });
    // }
  });

  tests(validFiles, invalidFiles);
}());
