module.exports.getAst = function() {
    return `(Program
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
};