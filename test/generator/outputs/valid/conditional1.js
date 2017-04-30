module.exports.getProgram = function() {
  return `var x_1 = 2;
if (x_1 === 2) {
  x_1 -= 1;
} else {
  x_1 += 1;
}
console.log(x_1);`;
};

module.exports.getOutput = function() {
  return `1\n`;
};