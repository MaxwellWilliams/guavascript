module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (x)
      )
      (3)
    )
    (While
      (Condition
        (>
          (IdExpression
            (x)
          )
          (0)
        )
      )
      (Body
        (Block
          (Print
            (true)
          )
          (-=
            (IdExpression
              (x)
            )
            (1)
          )
        )
      )
    )
  )
)`;
}
