module.exports.getProgram = () => `var multiply_1 = (x_2, y_3 = 2, z_4 = 4) => {
  console.log(z_4);
  return x_2 * y_3;
}
multiply_1(1, 2, 4);`;

module.exports.getOutput = () => '4\n';
