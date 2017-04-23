fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
parser = require(path.resolve('./parser.js'));
generator = require(path.resolve('./generators/javascript-generator.js'));
validPrograms = path.resolve('./test/generator/programs/valid');
invalidPrograms = path.resolve('./test/generator/programs/invalid');
validProgramOutputs = path.resolve('./test/generator/output/valid');
// invalidProgramOutputs = path.resolve('./test/generator/output/invalid');

tests = function(validFiles, invalidFiles) {
  describe('Generator tests', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('generator\\programs\\valid\\' +file.name + ' should generate correct code',
          function() {
            console.log(generator(parser(file.code)));
            assert.equal(generator(parser(file.code)), outputs[file.name],
              'Returned: ' + generator(parser(file.code)));
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
    fullOutputPath = validProgramOutputs + '/' + fileName;
    programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    if(fileName == "decl1.guav") {
    validFiles.push({
      name: fileName,
      code: programFileContents
    });
    }
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
    'arithmetic1.guav': require(path.resolve(validProgramOutputs + '/arithmetic1.js')).getOutput(),
    'arithmetic2.guav': require(path.resolve(validProgramOutputs + '/arithmetic2.js')).getOutput(),
    'class1.guav': require(path.resolve(validProgramOutputs + '/class1.js')).getOutput(),
    'conditional1.guav': require(path.resolve(validProgramOutputs + '/conditional1.js')).getOutput(),
    'constDecl1.guav': require(path.resolve(validProgramOutputs + '/constDecl1.js')).getOutput(),
    'constDecl2.guav': require(path.resolve(validProgramOutputs + '/constDecl2.js')).getOutput(),
    'decl1.guav': require(path.resolve(validProgramOutputs + '/decl1.js')).getOutput(),
    'decl2.guav': require(path.resolve(validProgramOutputs + '/decl2.js')).getOutput(),
    'decl3.guav': require(path.resolve(validProgramOutputs + '/decl3.js')).getOutput(),
    'decl4.guav': require(path.resolve(validProgramOutputs + '/decl4.js')).getOutput(),
    'dict1.guav': require(path.resolve(validProgramOutputs + '/dict1.js')).getOutput(),
    'dict2.guav': require(path.resolve(validProgramOutputs + '/dict2.js')).getOutput(),
    'funcDecl1.guav': require(path.resolve(validProgramOutputs + '/funcDecl1.js')).getOutput(),
    'funcDecl2.guav': require(path.resolve(validProgramOutputs + '/funcDecl2.js')).getOutput(),
    'funcDecl3.guav': require(path.resolve(validProgramOutputs + '/funcDecl3.js')).getOutput(),
    'idExp1.guav': require(path.resolve(validProgramOutputs + '/idExp1.js')).getOutput(),
    'idExp2.guav': require(path.resolve(validProgramOutputs + '/idExp2.js')).getOutput(),
    'idExp3.guav': require(path.resolve(validProgramOutputs + '/idExp3.js')).getOutput(),
    'ifElse.guav': require(path.resolve(validProgramOutputs + '/ifElse.js')).getOutput(),
    'match1.guav': require(path.resolve(validProgramOutputs + '/match1.js')).getOutput(),
    'match2.guav': require(path.resolve(validProgramOutputs + '/match2.js')).getOutput(),
    'print1.guav': require(path.resolve(validProgramOutputs + '/print1.js')).getOutput(),
    'shortMatch.guav': require(path.resolve(validProgramOutputs + '/shortMatch.js')).getOutput(),
    'tuple.guav': require(path.resolve(validProgramOutputs + '/tuple.js')).getOutput(),
    'while1.guav': require(path.resolve(validProgramOutputs + '/while1.js')).getOutput(),
    'bigProgram.guav': require(path.resolve(validProgramOutputs + '/bigProgram.js')).getOutput()
};