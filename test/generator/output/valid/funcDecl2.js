module.exports.getOutput = function() {
  return `var numbers = [1, 2, 3, 4, 5, 6];
  var list = [];
  var count_by_two = () => {
    var result = 0;
    for var i in numbers {
      if (i % 2 == 0) {
        var result += i;
      }
    }
    return result;
  }`;
};