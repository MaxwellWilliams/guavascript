module.exports.getOutput = function() {
  return `var x_1 = 2;
if (x_1 === 2) {
  var x_1 -= 1;
} else {
  var x_1 += 1;
}
console.log(x_1);`;
};