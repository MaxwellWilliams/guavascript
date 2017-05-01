module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (z)
      )
      (1)
    )
    (Func
      (id computeSomething)
      (Parameters
        (id x, default (0))
        (id y, default (0))
      )
      (Block
        (Return
          (+
            (IdExpression
              (x)
            )
            (IdExpression
              (y)
            )
          )
        )
      )
    )
    (=
      (IdExpression
        (newValue)
      )
      (IdExpression
        (()
          (computeSomething)
          (Arguments
            (VarList
              (IdExpression
                (z)
              )
              (2)
            )
          )
        )
      )
    )
    (Print
      (IdExpression
        (newValue)
      )
    )
  )
)`;
}
