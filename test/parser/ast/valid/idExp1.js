module.exports.getAst = function() {
    return `(Program
    (Block
        (Identifier Statement
            (IdExpression
                (()
                    (.
                        (console)
                        (log))
                    (Arguments
                        (1)
                        (hello, world!)
                        (true)
                        (3.14)))))))`;
}
