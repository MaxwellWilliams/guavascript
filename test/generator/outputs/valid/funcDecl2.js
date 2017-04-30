module.exports.getProgram = function() {
  return `var z_1 = 1;
var computeSomething_2 = (x_3 = 0, y_4 = 0) => {
  return (x_3 + y_4);
}
var newValue_5 = computeSomething_2(z_1, 2);
console.log(newValue_5);`;
};

module.exports.getOutput = function() {
  return `3\n`;
};