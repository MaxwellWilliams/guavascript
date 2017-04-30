module.exports.getProgram = function() {
	return `var x_1 = 2;
var x_1 = (() => {
  if (x_1 === 2) {
    return "two";
  } else {
    return "";
  }
})();
console.log(x_1);`;
};

module.exports.getOutput = function() {
  return `two\n`;
};