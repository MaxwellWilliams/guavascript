module.exports.getOutput = function() {
  return `class Test {
  constructor(param1 = 1, param2 = "2", param3 = false, param4 = 0) {
    this.param1 = param1;
    this.param2 = param2;
    this.param3 = param3;
    this.PARAM4 = param4;
  }
  getParam1() {
    return this.param1;
  }
  setParam1(newParam) {
    this.param1 = newParam;
  }
  checkIfEqual(paramX, paramY) {
    return paramX === paramY;
  }
  class Sub {
    constructor(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    checkVariables(var1) {
      var answer = "";
      if ((var1 != null)) {
        answer = (() => {
          if (var1 === 1) {
            return "one";
          } else if (var1 === 2) {
            return "two";
          } else {
            return "not one or two";
          }
        })();
      }
      return answer;
    }
  }
  class Collections {
    constructor(dict, list, tup) {
      this.dict = dict;
      this.list = list;
      this.tup = tup;
    }
    addToDict(id, value) {
      this.dict[id] = value;
    }
    getDict(id) {
      return this.dict[id];
    }
    getTuple() {
      return this.tup;
    }
  }
}`;
};