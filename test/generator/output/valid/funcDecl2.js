module.exports.getOutput = function() {
	return `let numbers = [1, 2, 3, 4, 5, 6];
	list = [];
	var count_by_two = () => {
	  result = 0;
	  for var i in numbers {
	    if (i % 2 == 0) {
	      result += i;
	    }
	  }
	  return result;
	}`;
};