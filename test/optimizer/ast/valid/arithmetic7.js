module.exports.getAst = function() {
    return `(Program
  (Block
    (=
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
};