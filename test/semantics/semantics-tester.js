fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
parser = require(path.resolve('./parser.js'));
validPrograms = path.resolve('./test/semantics/programs/valid');
invalidPrograms = path.resolve('./test/semantics/programs/invalid');

tests = function(validFiles, invalidFiles) {
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
            const errorPattern = /error/;
            // console.log(util.inspect(parser(file.code), {depth: null}));
            assert.throws(() => parser(file.code).analyze(), errorPattern);
            //done();
        });
      });
    });
  });
};

(function() {
  validFiles = [];
  invalidFiles = [];

  fs.readdirSync(validPrograms).forEach(function(fileName) {
      fullProgramPath = validPrograms + '/' + fileName;
      programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
      // if(fileName == "shadow-var-dif-type.guav") {
      validFiles.push({
        name: fileName,
        code: programFileContents
      });
    // }
  });

  fs.readdirSync(invalidPrograms).forEach(function(fileName) {
    fullFilePath = invalidPrograms + '/' + fileName;
    fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    // if(fileName == "invalid-operation5.guav") {
    invalidFiles.push({
      name: fileName,
      code: fileContents
    });
    // }
  });

  tests(validFiles, invalidFiles);
}());
