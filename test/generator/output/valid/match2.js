module.exports.getOutput = function() {
	return `var x_1 = false;
var y_2 = (() => {
  if (x_1 === true) {
    return "truth";
  } else {
    return "lies";
  }
})();
console.log(y_2);`;
};