module.exports.getAst = function() {
  console.log('here!');
    return `(Program
    (Block
        (While
            (true)
                (Block
                    (Return
                        (true))))))`;
}