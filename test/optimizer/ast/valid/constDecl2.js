module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (PI)
      )
      (3.1415926)
    )
    (Print
      (IdExpression
        (PI)
      )
    )
  )
)`;
}
