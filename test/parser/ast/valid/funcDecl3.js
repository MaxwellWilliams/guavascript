module.exports.getAst = function() {
    return `(Program
    (Block
        (=
            (IdExpression
                (z))
            (0))
        (Func
            (id computeSomething)
            (Parameters
                (id x, default )
                (id y, default ))
            (Block
                (=
                    (IdExpression
                        (z))
                    (+
                        (IdExpression
                            (x))
                        (IdExpression
                            (y))))))))`;
}
