module.exports.getAst = () => `(Program
  (Block
    (Func
      (id multiply)
      (Parameters
        (id x)
        (id y, default (2))
        (id z, default (4))
      )
      (Block
        (Print
          (IdExpression
            (z)
          )
        )
        (Return
          (*
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
        (multiply)
        (Arguments
          (VarList
            (1)
            (2)
            (4)
          )
        )
      )
    )
  )
)`;
