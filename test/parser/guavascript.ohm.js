fs = require('fs');
path = require('path');
ohm = require('ohm-js');
parserLocation = path.resolve('./guavascript.ohm');
parserFile = fs.readFileSync(parserLocation, encoding='utf-8');
parser = ohm.grammar(parserFile);
assert = require('assert');
validPrograms = path.resolve('./test/parser/programs/valid');

(function() {
  describe('guavascript.ohm', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1, 2, 3].indexOf(4));
    });
    describe('Test valid example programs', function() {
      fs.readdirSync(validPrograms).forEach(function(file) {
        console.log(file);
        console.log(parser.match(file));

        m = parser.match('myVariable = 10');
        if (m.succeeded()) {
          console.log('Success!');
        } else {
          console.log('Nope');
        }
      });
      // it('');
    });
  });
}());
