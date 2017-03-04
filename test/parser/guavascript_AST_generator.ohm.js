fs = require('fs');
path = require('path');
ohm = require('ohm-js');
assert = require('assert');
parser = require(path.resolve('./guavascript_AST_generator.js'));
validPrograms = path.resolve('./test/parser/programs/valid');
invalidPrograms = path.resolve('./test/parser/programs/invalid');
// validProgramAsts = path.resolve('./test/parser/ast/valid');
// invalidProgramAsts = path.resolve('./test/parser/ast/invalid');

tests = function(validFiles, invalidFiles) {
  describe('guavascript_AST_generator.ohm', function() {
    describe('Test valid example programs', function() {
      validFiles.forEach(function(file) {
        it('parser\\programs\\valid\\' +file.name + ' should be accepted by the grammar',
          function() {
            // console.log(parser(file.code).toString());
            // console.log( '\"' + file.ast.toString() + '\"');
            // console.log( '\"' + parser(file.code).toString() + '\"');
            // console.log(parser(file.code).toString() == file.ast);
            console.log();
            assert.equal(parser(file.code).toString(), programAsts[file.name],
              'Returned: ' + grammarResult);
        });
      });
    });

    // describe('Test invalid example programs', function() {
    //   invalidFiles.forEach(function(file) {
    //     it('parser\\programs\\invalid\\' + file.name + ' should be rejected by the grammar',
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
    // fullAstPath = validProgramAsts + '/' + fileName;
    programFileContents = fs.readFileSync(fullProgramPath, 'utf-8');
    // astFileContents = fs.readFileSync(fullAstPath, 'utf-8');
    validFiles.push({
      name: fileName,
      code: programFileContents
      // ast: astFileContents
    });
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

programAsts = {
    'bigTest1.guav': `(Program
    (Block
        (Class
            (id Test)
            (Block
                (Func
                    (id Test)
                    (Parameters
                        (id param1, default (1))
                        (id param2, default (l))
                        (id param3, default (false))
                        (id param4, default (0)))
                    (Block
                        (=
                            (IdExpression
                                (.
                                    (this)
                                    (param1)))
                            (IdExpression
                                (param1)))
                        (=
                            (IdExpression
                                (.
                                    (this)
                                    (param2)))
                            (IdExpression
                                (param2)))
                        (=
                            (IdExpression
                                (.
                                    (this)
                                    (param3)))
                            (IdExpression
                                (param3)))
                        (=
                            (IdExpression
                                (.
                                    (this)
                                    (PARAM4)))
                            (IdExpression
                                (param4)))))
                (Func
                    (id getParam1)
                    (Parameters)
                    (Block
                        (Return
                            (IdExpression
                                (.
                                    (this)
                                    (param1))))))
                (Func
                    (id setParam1)
                    (Parameters
                        (id newParam, default ))
                    (Block
                        (=
                            (IdExpression
                                (.
                                    (this)
                                    (param1)))
                            (IdExpression
                                (newParam)))))
                (Func
                    (id checkIfEqual)
                    (Parameters
                        (id paramX, default )
                        (id paramY, default ))
                    (Block
                        (Return
                            (==
                                (IdExpression
                                    (paramX))
                                (IdExpression
                                    (paramY))))))
                (Class
                    (id Sub)
                    (Block
                        (Func
                            (id Sub)
                            (Parameters
                                (id x, default )
                                (id y, default )
                                (id z, default ))
                            (Block
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (x)))
                                    (IdExpression
                                        (x)))
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (y)))
                                    (IdExpression
                                        (y)))
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (z)))
                                    (IdExpression
                                        (z)))))
                        (Func
                            (id checkVariables)
                            (Parameters
                                (id var1, default ))
                            (Block
                                (Identifier Statement
                                    (IdExpression
                                        (answer)))
                                (if
                                    (!=
                                        (IdExpression
                                            (var1))
                                        (null))
                                    (Block
                                        (=
                                            (IdExpression
                                                (answer))
                                            (Match Expression
                                                (IdExpression
                                                    (var1))
                                                (Matches
                                                    (Match
                                                        (1) ->
                                                        (las))
                                                    (Match
                                                        (2) ->
                                                        (las))
                                                    (Match
                                                         _ ->
                                                        (lass Test {
)))))))
                                (Return
                                    (IdExpression
                                        (answer)))))))
                (Class
                    (id Collections)
                    (Block
                        (Func
                            (id Collections)
                            (Parameters
                                (id dict, default )
                                (id list, default )
                                (id tup, default ))
                            (Block
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (dict)))
                                    (IdExpression
                                        (dict)))
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (list)))
                                    (IdExpression
                                        (list)))
                                (=
                                    (IdExpression
                                        (.
                                            (this)
                                            (tup)))
                                    (IdExpression
                                        (tup)))))
                        (Func
                            (id addToDict)
                            (Parameters
                                (id id, default )
                                (id value, default ))
                            (Block
                                (=
                                    (IdExpression
                                        ([]
                                            (.
                                                (this)
                                                (dict))
                                            (IdExpression
                                                (id))))
                                    (IdExpression
                                        (value)))))
                        (Func
                            (id getDict)
                            (Parameters
                                (id id, default ))
                            (Block
                                (Return
                                    (IdExpression
                                        ([]
                                            (.
                                                (this)
                                                (dict))
                                            (IdExpression
                                                (id)))))))
                        (Func
                            (id getTuple)
                            (Parameters)
                            (Block
                                (Return
                                    (IdExpression
                                        (.
                                            (this)
                                            (tup))))))))))))`
}