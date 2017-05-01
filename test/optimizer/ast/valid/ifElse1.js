module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (false)
    )
    (Block
      (Print
        (false)
      )
    )
  )
)`;
}
