module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (2)
    )
    (=
      (IdExpression
        (x)
      )
      (Match Expression
        (IdExpression
          (x)
        )
        (Matches
          (Match
            (2) ->
            (two)
          )
          (Match
            _ ->
            ()
          )
        )
      )
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
}
