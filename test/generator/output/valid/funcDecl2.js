module.exports.getOutput = function() {
  return `var numbers = [1, 2, 3, 4, 5, 6];
  var list = [];
  var count_by_two = (test) => {
    var result = test;
    for var i in numbers {
      var i_Iterable = numbers[i];
      if (i % 2 === 0) {
        var result += numbers[i];
      }
    }
    return result;
  }`;
};