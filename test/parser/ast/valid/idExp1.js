module.exports.getAst = function() {
    return `(Program
  (Block
    (IdExpression
      (()
        (.
          (console)
          (log)
        )
        (Arguments
          (VarList
            (1)
            (hello, world!)
            (true)
            (3.14)
          )
        )
      )
    )
  )
)`;
}
