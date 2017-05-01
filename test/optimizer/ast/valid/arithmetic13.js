module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (y)
      )
      (1)
    )
    (=
      (IdExpression
        (x)
      )
      (2)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};