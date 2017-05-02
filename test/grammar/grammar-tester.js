const fs = require('fs');
const path = require('path');
const ohm = require('ohm-js');
const assert = require('assert');

const grammarContents = fs.readFileSync('guavascript.ohm');
const grammar = ohm.grammar(grammarContents);
const validPrograms = path.resolve('./test/grammar/programs/valid');
const invalidPrograms = path.resolve('./test/grammar/programs/invalid');

const tests = (validFiles, invalidFiles) => {
  describe('Grammar tests', () => {
    describe('Test valid example programs', () => {
      validFiles.forEach((file) => {
        it(`grammar\\programs\\valid\\${file.name} should be accepted by the grammar`,
          () => {
            const grammarResult = grammar.match(file.code);
            assert.equal(grammarResult.succeeded(), true,
              `Returned: ${grammarResult}`);
          });
      });
    });

    describe('Test invalid example programs', () => {
      invalidFiles.forEach((file) => {
        it(`grammar\\programs\\invalid\\${file.name} should be rejected by the grammar`,
          () => {
            const grammarResult = grammar.match(file.code);
            assert.equal(grammarResult.succeeded(), false,
              `Returned: ${grammarResult}`);
          });
      });
    });
  });
};

(() => {
  const validFiles = [];
  const invalidFiles = [];

  fs.readdirSync(validPrograms).forEach((fileName) => {
    const fullFilePath = `${validPrograms}/${fileName}`;
    const fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    validFiles.push({
      name: fileName,
      code: fileContents,
    });
  });

  fs.readdirSync(invalidPrograms).forEach((fileName) => {
    const fullFilePath = `${invalidPrograms}/${fileName}`;
    const fileContents = fs.readFileSync(fullFilePath, 'utf-8');
    invalidFiles.push({
      name: fileName,
      code: fileContents,
    });
  });

  tests(validFiles, invalidFiles);
})();
