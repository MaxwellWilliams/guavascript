module.exports.getProgram = function() {
	var string =
`var tuple_1 = ("hi", 3, true);
console.log(tuple_1);`;

	return string;
};

module.exports.getOutput = function() {
  return 'hi, 3, true';
};