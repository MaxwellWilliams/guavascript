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
                        (onsole.log(1,)
                        (true)
                        (c.ns)))))))`;
}