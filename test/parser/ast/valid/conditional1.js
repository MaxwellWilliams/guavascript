module.exports.getAst = function() {
    return `(Program
    (Block
        (if
            (==
                (IdExpression
                    (x))
                (2))
            (Block
                (-=
                    (IdExpression
                        (x))
                    (1))))))`;
};