module.exports.getAst = function() {
    return `(Program
  (Block
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