fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
util = require('util');
exec = require('child_process').exec;

parser = require(path.resolve('./parser.js'));
generator = require(path.resolve('./generators/javascript-generator.js'));
validPrograms = path.resolve('./test/generator/programs/valid');
invalidPrograms = path.resolve('./test/generator/programs/invalid');
outputs = path.resolve('./test/generator/outputs/valid');

tests = function(validFiles, invalidFiles) {
  describe('Generator tests', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('generator\\programs\\valid\\' + file.name + ' should generate correct code',
          function() {
            parser(file.code).analyze();
            assert.equal(generator(parser(file.code)), programs[file.name].getProgram(),
              'Returned: ' + generator(parser(file.code)));
        });
        it('generator\\programs\\valid\\' + file.name + ' should execute correctly',
          function(done) {
            exec(`node guavascript.js --js test/generator/programs/valid/${file.name} | node`,
              function(error, stdout, stderr) {
                console.log('stdout: ', stdout);
                console.log('out: ', programs[file.name].getOutput());
                assert.equal(error, null);
                assert.equal(stdout, programs[file.name].getOutput(), 'Returned: ' + stdout);
                assert.equal(stderr, '', 'Returned: ' + stderr);
                done();
            });
        });
      });
    });

    // describe('Test invalid example programs', function() {
    //   invalidFiles.forEach(function(file) {
    //     it('generator\\programs\\invalid\\' + file.name + ' should be rejected by the grammar',
    //       function() {
    //         assert.throws(() => parser(file.code).analyze(), errorPattern);
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
    fullOutputPath = outputs + '/' + fileName;
    programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // if(fileName == "funcDecl1.guav") {
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

programs = {
    'arithmetic1.guav': require(path.resolve(outputs + '/arithmetic1.js')),
    'class1.guav': require(path.resolve(outputs + '/class1.js')),
    'conditional1.guav': require(path.resolve(outputs + '/conditional1.js')),
    'constDecl1.guav': require(path.resolve(outputs + '/constDecl1.js')),
    'constDecl2.guav': require(path.resolve(outputs + '/constDecl2.js')),
    'decl1.guav': require(path.resolve(outputs + '/decl1.js')),
    'decl2.guav': require(path.resolve(outputs + '/decl2.js')),
    'decl3.guav': require(path.resolve(outputs + '/decl3.js')),
    'decl4.guav': require(path.resolve(outputs + '/decl4.js')),
    'dict1.guav': require(path.resolve(outputs + '/dict1.js')),
    'dict2.guav': require(path.resolve(outputs + '/dict2.js')),
    'funcDecl1.guav': require(path.resolve(outputs + '/funcDecl1.js')),
    'funcDecl2.guav': require(path.resolve(outputs + '/funcDecl2.js')),
    'idExp1.guav': require(path.resolve(outputs + '/idExp1.js')),
    'idExp2.guav': require(path.resolve(outputs + '/idExp2.js')),
    'ifElse.guav': require(path.resolve(outputs + '/ifElse.js')),
    'match1.guav': require(path.resolve(outputs + '/match1.js')),
    'match2.guav': require(path.resolve(outputs + '/match2.js')),
    'print1.guav': require(path.resolve(outputs + '/print1.js')),
    'shortMatch.guav': require(path.resolve(outputs + '/shortMatch.js')),
    'tuple.guav': require(path.resolve(outputs + '/tuple.js')),
    'while1.guav': require(path.resolve(outputs + '/while1.js'))
};