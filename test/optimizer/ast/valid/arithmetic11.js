module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (3)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};