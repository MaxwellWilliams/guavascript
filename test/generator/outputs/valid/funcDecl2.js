module.exports.getProgram = function() {
  return `var z_1 = 0;
var computeSomething_2 = (x_3 = 0, y_4 = 0) => {
  return (x_3 + y_4);
}
var z_1 = computeSomething_2(1, 2);`;
};

module.exports.getOutput = function() {
  return '';
};