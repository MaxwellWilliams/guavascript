module.exports.getProgram = function() {
	return `var tuple_1 = ["hi", 3, true];
console.log(tuple_1);`;
};

module.exports.getOutput = function() {
  return `[ 'hi', 3, true ]\n`;
};