module.exports.getOutput = function() {
  return `var z = 0;
var computeSomething = (x, y) => {
  var z = x + y;
}`;
};