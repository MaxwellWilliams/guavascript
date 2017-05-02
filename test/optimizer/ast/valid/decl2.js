module.exports.getAst = () => `(Program
  (Block
    (=
      (IdExpression
        (age)
      )
      (21)
    )
    (Print
      (IdExpression
        (age)
      )
    )
  )
)`;
