module.exports.getOutput = function() {
	return `let z = 0;
var computeSomething = (x, y) => {
   z = x + y;
}`;
};