module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (age)
      )
      (21)
    )
    (Print
      (IdExpression
        (age)
      )
    )
  )
)`;
}
