module.exports.getAst = () => `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (false)
    )
    (If
      (Case
        (Condition
          (==
            (IdExpression
              (x)
            )
            (true)
          )
        )
        (Body
          (Block
            (Print
              (true)
            )
          )
        )
      )
      (Else
        (Block
          (Print
            (false)
          )
        )
      )
    )
  )
)`;
