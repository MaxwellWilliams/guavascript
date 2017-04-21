fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
generator = require(path.resolve('./generators/javascript-generator.js'));
validPrograms = path.resolve('./test/generator/programs/valid');
invalidPrograms = path.resolve('./test/generator/programs/invalid');
validProgramOutputs = path.resolve('./test/generator/output/valid');
// invalidProgramOutputs = path.resolve('./test/generator/output/invalid');

tests = function(validFiles, invalidFiles) {
  describe('Generator tests', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('generator\\programs\\valid\\' +file.name + ' should be accepted by the grammar',
          function() {
            // console.log(util.inspect(generator(file.code), {depth: null}));
            assert.equal(generator(file.code).toString(), outputs[file.name],
              'Returned: ' + generator(file.code).toString());
        });
      });
    });

    // describe('Test invalid example programs', function() {
    //   invalidFiles.forEach(function(file) {
    //     it('generator\\programs\\invalid\\' + file.name + ' should be rejected by the grammar',
    //       function() {
    //         grammarResult = grammar.match(file.code);
    //         assert.equal(grammarResult.succeeded(), false,
    //           'Returned: ' + grammarResult);
    //     });
    //   });
    // });
  });
};

(function() {
  validFiles = [];
  invalidFiles = [];

  fs.readdirSync(validPrograms).forEach(function(fileName) {
    fullProgramPath = validPrograms + '/' + fileName;
    fullAstPath = validProgramOutputs + '/' + fileName;
    programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // if(fileName == "match1.guav") {
    validFiles.push({
      name: fileName,
      code: programFileContents
    });
    // }
  });

  // fs.readdirSync(invalidPrograms).forEach(function(fileName) {
  //   fullFilePath = invalidPrograms + '/' + fileName;
  //   fileContents = fs.readFileSync(fullFilePath, 'utf-8');
  //   invalidFiles.push({
  //     name: fileName,
  //     code: fileContents
  //   });
  // });

  tests(validFiles, invalidFiles);
}());

outputs = {
    'arithmetic1.guav': require(path.resolve(validProgramOutputs + '/arithmetic1.js')).getOutput()
};