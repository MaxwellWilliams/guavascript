module.exports.getAst = function() {
    return `(Program
    (Block
        (While
            (true)
                (Block
                    (Return
                        (true))))))`;
}
