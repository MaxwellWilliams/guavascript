fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
parserContents = fs.readFileSync('guavascript.ohm');
parser = ohm.grammar(parserContents);
validPrograms = path.resolve('./test/parser/programs/valid');
invalidPrograms = path.resolve('./test/parser/programs/invalid');

tests = function(validFiles, invalidFiles) {
  describe('guavascript.ohm', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('valid\\' +file.name + ' should be accepted by the parser',
        function() {
          parseResult = parser.match(file.code);
          assert(parseResult.succeeded(),
            file.name + ' was ' + parseResult.succeeded());
        });
      });
    });

    describe('Test invalid example programs', function() {
      invalidFiles.forEach(function(file) {
        it('invalid\\' + file.name + ' should be rejected by the parser',
        function() {
          parseResult = parser.match(file.code);
          assert(!parseResult.succeeded(),
            file.name + ' was ' + parseResult.succeeded());
        });
      });
    });
  });
};

(function() {
  validFiles = [];
  invalidFiles = [];

  fs.readdirSync(validPrograms).forEach(function(fileName) {
    fullFilePath = validPrograms + '/' + fileName;
    fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    validFiles.push({
      name: fileName,
      code: fileContents
    });
  });

  fs.readdirSync(invalidPrograms).forEach(function(fileName) {
    fullFilePath = invalidPrograms + '/' + fileName;
    fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    invalidFiles.push({
      name: fileName,
      code: fileContents
    });
  });

  tests(validFiles, invalidFiles);
}());
