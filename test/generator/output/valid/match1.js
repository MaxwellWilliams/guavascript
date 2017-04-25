module.exports.getOutput = function() {
  var string = 
`(() => {
  if (x === 2) {
    return "two";
  } else if (x === 3) {
    return "three";
  } else if (x === 4) {
    return "four";
  } else if (x === 5) {
    return "five";
  } else {
    return "nope";
  }
})();
console.log(x);`;

  return string;
};