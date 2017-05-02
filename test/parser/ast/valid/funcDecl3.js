module.exports.getAst = () => `(Program
  (Block
    (=
      (IdExpression
        (z)
      )
      (0)
    )
    (Func
      (id computeSomething)
      (Parameters
        (id x)
        (id y)
      )
      (Block
        (=
          (IdExpression
            (z)
          )
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
    (IdExpression
      (()
        (computeSomething)
        (Arguments
          (VarList
            (1)
            (2)
          )
        )
      )
    )
  )
)`;
