module.exports.getOutput = function() {
	return `var y = (() => {
		if (x == true) {
			return "truth";
		} else {
			return "lies"
		}
	})();
console.log(y);`;
};