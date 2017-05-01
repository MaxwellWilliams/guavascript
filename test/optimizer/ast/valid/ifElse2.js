module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (true)
    )
    (Block
      (Print
        (true)
      )
    )
  )
)`;
};