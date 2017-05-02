module.exports.getAst = () => `(Program
  (Block
    (Class
      (id Ball)
      (Block
        (Func
          (id constructor)
          (Parameters
            (id radius)
            (id weight, default (1.0))
          )
          (Block
            (=
              (IdExpression
                (.
                  (this)
                  (radius)
                )
              )
              (IdExpression
                (radius)
              )
            )
            (=
              (IdExpression
                (.
                  (this)
                  (weight)
                )
              )
              (IdExpression
                (weight)
              )
            )
          )
        )
        (Func
          (id is_round)
          (Parameters)
          (Block
            (Return
              (true)
            )
          )
        )
      )
    )
  )
)`;
