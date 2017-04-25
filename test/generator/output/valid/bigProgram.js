module.exports.getOutput = function() {
  return `class Test {

    constructor (param1 = 1, param2 = "2", param3 = false, param4 = 0) {
      this.param1 = param1;
      this.param2 = param2;
      this.param3 = param3;
      this.PARAM4 = param4;
    }

    var getParam1 = () => {
      return this.param1;
    }

    var setParam1 = (newParam) = () => {
      this.param1 = newParam;
    }

    var checkIfEqual = (paramX, paramY) = () => {
      return paramX == paramY;
    }

    class Sub {
      constructor (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      }

      var checkVariables = (var1) = () => {
        var answer;
        if (var1 != null) {
          answer = (() {
            if (var1 == 1) {
              var1 = "one";
            } else if (var1 = 2) {
              var1 = "two";
            } else {
              var1 = "not one or two";
            }
          })();
        }
        return answer;
      }
    }

    class Collections {

      constructor (dict, list, tup) {
        this.dict = dict;
        this.list = list;
        this.tup = tup;
      }

      var addToDict (id, value) = () => {
        this.dict[id] = value;
      }

      var getDict (id) = () => {
        return this.dict[id];
      }

      // var addToList (value) = () => {
      //    this.list.append(value, 1, "truelalala")
      // }

      var getTuple = () = () => {
        return this.tup;
      }
    }
  }`;
};