module.exports.getAst = function() {
    return `(Program
    (Block
        (if
            (==
                (IdExpression
                    (x))
                (true))
            (Block
                (Return
                    (true)))
            (Block
                (Return
                    (false))))))`;
}