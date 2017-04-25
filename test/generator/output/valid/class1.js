module.exports.getOutput = function() {
  return `class Ball {
  constructor(radius, weight = 1.0) {
    this.radius = radius;
    this.weight = weight;
  }
  is_round() {
    return true;
  }
}`;
};