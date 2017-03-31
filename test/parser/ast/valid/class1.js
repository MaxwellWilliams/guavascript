module.exports.getAst = function() {
    return `(Program
  (Block
    (Class
      (id Ball)
      (Block
        (Func
          (id Ball)
          (Parameters
            (id radius, default )
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
};
