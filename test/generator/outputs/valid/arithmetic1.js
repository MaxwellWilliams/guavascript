module.exports.getProgram = function() {
  return `var x_1 = ((2 + 3) * Math.pow((6 - 1), 2)) / 4;
console.log(x_1);`
};

module.exports.getOutput = function() {
  return `31.25\n`;
};