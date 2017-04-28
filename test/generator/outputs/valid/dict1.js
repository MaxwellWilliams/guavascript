module.exports.getProgram = function() {
  return `var dict_1 = {x:5, y:"Hello", z:true};
console.log(dict_1);`;
};


module.exports.getOutput = function() {
  return '{x:5, y:"Hello", z:true}';
};