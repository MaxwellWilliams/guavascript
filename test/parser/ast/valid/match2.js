module.exports.getAst = function() {
    return `(Program
    (Block
        (Match Expression
            (IdExpression
                (x))
            (Matches
                (Match
                    (2) ->
                    (atc))
                (Match
                    (3) ->
                    (atch ))
                (Match
                    (4) ->
                    (atch))
                (Match
                    (5) ->
                    (atch))
                (Match
                     _ ->
                    (Block
                        (if
                            (==
                                (IdExpression
                                    (y))
                                (3))
                            (Block
                                (=
                                    (IdExpression
                                        (string))
                                    (atch x with
))
                                (=
                                    (IdExpression
                                        (list))
                                    (List
                                        (1)
                                        (2)
                                        (3)
                                        (4)))))))))))`;
}