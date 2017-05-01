module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (31.25)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};