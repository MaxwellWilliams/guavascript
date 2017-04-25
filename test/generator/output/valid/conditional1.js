module.exports.getOutput = function() {
  return `if ((x === 2)) {
  var x -= 1;
} else {
  var x += 1;
}
console.log(x);`;
};