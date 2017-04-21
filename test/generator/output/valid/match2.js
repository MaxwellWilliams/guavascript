module.exports.getOutput = function() {
	return `let y = (() => {
		if (x == true) {
			return "truth";
		} else {
			return "lies"
		}
	})();`;
};