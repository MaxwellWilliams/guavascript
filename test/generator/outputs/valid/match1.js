module.exports.getProgram = function() {
  return `var x_1 = 4;
(() => {
  if (x_1 === 2) {
    console.log("two");
  } else if (x_1 === 3) {
    console.log("three");
  } else if (x_1 === 4) {
    console.log("four");
  } else if (x_1 === 5) {
    console.log("five");
  } else {
    console.log("nope");
  }
})()`;
};

module.exports.getOutput = function() {
  return `four\n`;
};