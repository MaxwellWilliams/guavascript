module.exports.getOutput = function() {
	return `class Ball {
	    Ball (radius, weight = 1.0) {
	        this.radius = radius;
	        this.weight = weight;
	    }
	    var is_round = () => {
	        return true;
	    }
	}`;
};