/**
 * matrix
 */
function mqMatrix() {
	this.m = mat4.create();
	this.stack = [];
}
mqMatrix.prototype.push = function(mat) {
	if (mat) {
		this.stack.push(mat4.create(mat));
		this.m = mat4.create(mat);
	} else {
		this.stack.push(mat4.create(this.m));	
	}
}
mqMatrix.prototype.pop = function() {
	if (this.stack.length == 0) {
		throw "Matrix stack underflow";
	}
	this.m = this.stack.pop();
	return this.m;
}
mqMatrix.prototype.multiply = function(mat) {
	mat4.multiply(this.m, this.m, mat);
}
mqMatrix.prototype.identity = function() {
	mat4.identity(this.m);
}
mqMatrix.prototype.scale = function(s) {
	mat4.scale(this.m, this.m, s);
}
mqMatrix.prototype.translate = function(t) {
	mat4.translate(this.m, this.m, t);
}
mqMatrix.prototype.rotate = function(angle, v) {
	var rad = angle * Math.PI / 180.0;
	mat4.rotate(this.m, this.m, rad, v);
}

/**
 * viewport
 */
function mqViewport(x, y, width, height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}
mqViewport.prototype.toArray = function() {
	return [this.x, this.y, this.width, this.height];
}
