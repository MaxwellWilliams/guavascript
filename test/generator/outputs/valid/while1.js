module.exports.getProgram = function() {
    return `var x_1 = 3;
while (x_1 > 0) {
  console.log("true");
  x_1 -= 1;
}`;
};

module.exports.getOutput = function() {
  return `true
true
true\n`;
};