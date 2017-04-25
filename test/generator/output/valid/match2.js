module.exports.getOutput = function() {
	return `var y_1 = (() => {
  if (x_2 === true) {
    return "truth";
  } else {
    return "lies";
  }
})();
console.log(y_1);`;
};