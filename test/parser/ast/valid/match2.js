module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (y)
      )
      (Match Expression
        (IdExpression
          (x)
        )
        (Matches
          (Match
            (true) ->
            (truth)
          )
          (Match
            _ ->
            (lies)
          )
        )
      )
    )
  )
)`;
}
