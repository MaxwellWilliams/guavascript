module.exports.getAst = function() {
    return `(Program
  (Block
    (=
      (IdExpression
        (FEET_IN_METER)
      )
      (3.28084)
    )
    (Print
      (IdExpression
        (FEET_IN_METER)
      )
    )
  )
)`;
};
