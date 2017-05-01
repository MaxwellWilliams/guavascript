module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (5.3)
    )
    (Print
      (IdExpression
        (x)
      )
    )
  )
)`;
};
