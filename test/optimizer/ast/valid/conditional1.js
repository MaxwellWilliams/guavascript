module.exports.getAst = () => `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (2)
    )
    (-=
      (IdExpression
        (x)
      )
      (1)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
