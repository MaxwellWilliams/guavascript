fs = require('fs');
path = require('path');
ohm = require('ohm-js');
parserContents = fs.readFileSync('guavascript.ohm');
parser = ohm.grammar(parserContents);
assert = require('assert');
validPrograms = path.resolve('./test/parser/programs/valid');
async = require('async');

tests = function(validFiles) {
  describe('guavascript.ohm', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it(file.name + ' should be accepted by the parser', function() {
          parseResult = parser.match(file.code);
          assert(parseResult.succeeded(),
            'Is ' + parseResult.succeeded());
        });
      });
    });
  });
};

(function() {
  validFiles = [];
  fs.readdirSync(validPrograms).forEach(function(fileName) {
    fullFilePath = validPrograms + '/' + fileName;
    fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    validFiles.push({
      name: fileName,
      code: fileContents,
    });
  });
  console.log(validFiles);
  tests(validFiles);
}());
