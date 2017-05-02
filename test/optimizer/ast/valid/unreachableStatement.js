module.exports.getAst = () => `(Program
  (Block
    (Func
      (id test)
      (Parameters)
      (Block
        (Return
          (Hello)
        )
      )
    )
    (IdExpression
      (()
        (test)
        (Arguments)
      )
    )
  )
)`;
