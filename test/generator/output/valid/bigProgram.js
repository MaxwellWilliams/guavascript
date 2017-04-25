module.exports.getOutput = function() {
  return `class Test_1 {
  constructor(param1_1 = 1, param2_2 = "2", param3_3 = false, param4_4 = 0) {
    this.param1 = param1_1;
    this.param2 = param2_2;
    this.param3 = param3_3;
    this.PARAM4 = param4_4;
  }
  getParam1_5() {
    return this.param1;
  }
  setParam1_6(newParam_7) {
    this.param1 = newParam_7;
  }
  checkIfEqual_8(paramX_9, paramY_10) {
    return paramX_9 === paramY_10;
  }
  class Sub_11 {
    constructor(x_1, y_2, z_3) {
      this.x = x_1;
      this.y = y_2;
      this.z = z_3;
    }
    checkVariables_4(var1_5) {
      var answer_6 = "";
      if ((var1_5 != null)) {
        answer_6 = (() => {
          if (var1_5 === 1) {
            return "one";
          } else if (var1_5 === 2) {
            return "two";
          } else {
            return "not one or two";
          }
        })();
      }
      return answer_6;
    }
  }
  class Collections_12 {
    constructor(dict_1, list_2, tup_3) {
      this.dict = dict_1;
      this.list = list_2;
      this.tup = tup_3;
    }
    addToDict_4(id_5, value_6) {
      this.dict[id_5] = value_6;
    }
    getDict_7(id_5) {
      return this.dict[id_5];
    }
    getTuple_8() {
      return this.tup;
    }
  }
}`;
};