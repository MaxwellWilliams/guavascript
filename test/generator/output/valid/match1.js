module.exports.getOutput = function() {
  return `var x_1 = 4;
(() => {
  if (x_1 === 2) {
    return "two";
  } else if (x_1 === 3) {
    return "three";
  } else if (x_1 === 4) {
    return "four";
  } else if (x_1 === 5) {
    return "five";
  } else {
    return "nope";
  }
})()`;
};