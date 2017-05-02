module.exports.getProgram = () => `var x_1 = false;
if ((x_1 === true)) {
  console.log("true");
} else {
  console.log("false");
}`;

module.exports.getOutput = () => 'false\n';
