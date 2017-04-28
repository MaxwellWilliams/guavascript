fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
validPrograms = path.resolve('./test/optimizer/programs/valid');
invalidPrograms = path.resolve('./test/optimizer/programs/invalid');
validProgramAsts = path.resolve('./test/optimizer/ast/valid');
// invalidProgramAsts = path.resolve('./test/optimizer/ast/invalid');

tests = function(validFiles, invalidFiles) {
  describe('optimizer tests', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('optimizer\\programs\\valid\\' +file.name + ' should be optimize',
          function() {
            // console.log(util.inspect(optimizer(file.code).toString(), {depth: null}));
            /*assert.equal(optimizer(file.code).toString(), optimizations[file.name],
              'Returned: ' + grammarResult);*/
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
    fullAstPath = validProgramAsts + '/' + fileName;
    programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // if(fileName == "match1.guav") {
    validFiles.push({
      name: fileName,
      code: programFileContents
    });
    // }
  });

  tests(validFiles, invalidFiles);
}());

optimizations = {
};