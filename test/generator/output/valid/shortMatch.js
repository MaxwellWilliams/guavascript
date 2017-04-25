module.exports.getOutput = function() {
	return `var x_1 = 2;
(() => {
  if (x_1 === 2) {
    return "two";
  }
})()
console.log(x_1);`;
};