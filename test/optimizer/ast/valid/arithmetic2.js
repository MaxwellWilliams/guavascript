module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (5)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};
