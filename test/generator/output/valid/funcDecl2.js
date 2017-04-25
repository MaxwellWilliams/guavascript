module.exports.getOutput = function() {
  return `var numbers_1 = [1, 2, 3, 4, 5, 6];
var list_2 = [];
var count_by_two_3 = (test_4) => {
  var result_5 = test_4;
  for var i_6 in numbers_1 {
    var i_Iterable = numbers[i_6];
    if (i_Iterable % 2 === 0) {
      var result += i_Iterable;
    }
  }
  return result_5;
}`;
};