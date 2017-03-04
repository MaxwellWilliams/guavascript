module.exports.getAst = function() {
    return `(Program
    (Block
        (=
            (IdExpression
                (numbers))
            (List
                (1)
                (2)
                (3)
                (4)
                (5)
                (6)))
        (=
            (IdExpression
                (list))
            (List))
        (Func
            (id count_by_two)
            (Parameters)
            (Block
                (=
                    (IdExpression
                        (result))
                    (0))
                (For id (i) in
                    (IdExpression
                        (numbers))
                    (Block
                        (if
                            (==
                                (%
                                    (IdExpression
                                        (i))
                                    (2))
                                (0))
                            (Block
                                (+=
                                    (IdExpression
                                        (result))
                                    (IdExpression
                                        (i)))))))
                (Return
                    (IdExpression
                        (result)))))))`;
}