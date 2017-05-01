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
            (hello, world!)
          )
        )
      )
    )
  )
)`;
}
