fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
parser = require(path.resolve('./parser.js'));
validPrograms = path.resolve('./test/optimizer/programs/valid');
invalidPrograms = path.resolve('./test/optimizer/programs/invalid');
validProgramAsts = path.resolve('./test/optimizer/ast/valid');

tests = function(validFiles, invalidFiles) {
  describe('Optimizer tests:', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('parser\\programs\\valid\\' +file.name + ' should be accepted by the grammar',
          function() {
            console.log(util.inspect(parser(file.code), {depth: null}));
            assert.equal(parser(file.code).analyze().optimize(), optimizedPrograms[file.name].getAst(),
              'Returned: ' + parser(file.code).toString());
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
    if(fileName == "arithmetic1.guav") {
    validFiles.push({
      name: fileName,
      code: programFileContents
    });
    }
  });

  tests(validFiles, invalidFiles);
}());

optimizedPrograms = {
    'arithmetic1.guav': require(path.resolve(validProgramAsts + '/arithmetic1.js')),
    'arithmetic2.guav': require(path.resolve(validProgramAsts + '/arithmetic2.js')),
    'class1.guav': require(path.resolve(validProgramAsts + '/class1.js')),
    'conditional1.guav': require(path.resolve(validProgramAsts + '/conditional1.js')),
    'constDecl1.guav': require(path.resolve(validProgramAsts + '/constDecl1.js')),
    'constDecl2.guav': require(path.resolve(validProgramAsts + '/constDecl2.js')),
    'decl1.guav': require(path.resolve(validProgramAsts + '/decl1.js')),
    'decl2.guav': require(path.resolve(validProgramAsts + '/decl2.js')),
    'decl3.guav': require(path.resolve(validProgramAsts + '/decl3.js')),
    'decl4.guav': require(path.resolve(validProgramAsts + '/decl4.js')),
    'dict1.guav': require(path.resolve(validProgramAsts + '/dict1.js')),
    'dict2.guav': require(path.resolve(validProgramAsts + '/dict2.js')),
    'funcDecl1.guav': require(path.resolve(validProgramAsts + '/funcDecl1.js')),
    'funcDecl2.guav': require(path.resolve(validProgramAsts + '/funcDecl2.js')),
    'idExp1.guav': require(path.resolve(validProgramAsts + '/idExp1.js')),
    'idExp2.guav': require(path.resolve(validProgramAsts + '/idExp2.js')),
    'ifElse.guav': require(path.resolve(validProgramAsts + '/ifElse.js')),
    'match1.guav': require(path.resolve(validProgramAsts + '/match1.js')),
    'match2.guav': require(path.resolve(validProgramAsts + '/match2.js')),
    'print1.guav': require(path.resolve(validProgramAsts + '/print1.js')),
    'shortMatch.guav': require(path.resolve(validProgramAsts + '/shortMatch.js')),
    'tuple.guav': require(path.resolve(validProgramAsts + '/tuple.js')),
    'while1.guav': require(path.resolve(validProgramAsts + '/while1.js'))
};
