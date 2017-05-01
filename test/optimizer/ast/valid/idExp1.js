module.exports.getAst = function() {
    return `(Program
  (Block
    (Print
      (+
        (+
          (+
            (+
              (1)
              ( hello, world! )
            )
            (true)
          )
          ( )
        )
        (3.14)
      )
    )
  )
)`;
}
