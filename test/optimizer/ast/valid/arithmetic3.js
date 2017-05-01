module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (0)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};