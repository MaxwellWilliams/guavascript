module.exports.getAst = () => `(Program
  (Block
    (=
      (IdExpression
        (dict)
      )
      (Dictionary
        (x : (5))
        (y : (Hello))
        (z : (true))
      )
    )
    (Print
      (IdExpression
        (dict)
      )
    )
  )
)`;
