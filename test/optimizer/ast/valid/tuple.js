module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (tuple)
      )
      (Tuple
        (VarList
          (hi)
          (3)
          (true)
        )
      )
    )
    (Print
      (IdExpression
        (tuple)
      )
    )
  )
)`;
}
