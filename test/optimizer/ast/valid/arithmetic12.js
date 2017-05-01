module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (-11)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};