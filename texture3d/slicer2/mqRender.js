/**
 * render
 */
function mqRender(gl, options) {
	this.gl = gl;
	var self = this;
	this.width = options.width;
	this.height = options.height;
	this.depth = options.depth;
	this.dimx = options.dimx;
	this.dimy = options.dimy;
	this.rotate = quat.create();
	quat.identity(this.rotate);

	this.fieldOfView = 0.78; // 45-degree
	this.focalLength = 1.0 / Math.tan(0.5 * this.fieldOfView);
	this.near = 1.0;
	this.far = 1000.0;

	this.mv = mat4.create();
	this.eyePosition = vec3.fromValues(0, 0, 15);
	this.rayOrigin = vec3.create();
	this.upDirection = vec3.fromValues(0, 1, 0);
	this.targetPosition = vec3.fromValues(0, 0, 0);
	this.project = mat4.create();
	this.iproject = mat4.create(); // inverse projection
	
	// texture
	this.texVolume = this.gl.createTexture();
	// shader
	this.util = new mqUtil();
	this.cube = {};
	this.cube.vs = mqCreateShader(gl, getShaderById('vs'), gl.VERTEX_SHADER);
	this.cube.fs = mqCreateShader(gl, getShaderById('fs'), gl.FRAGMENT_SHADER);
	this.cube.program = mqCreateProgram(gl, this.cube.vs, this.cube.fs);
	this.cube.vao = this.util.vaoVolume2(gl);
	this.cube.loc = {};
	['umv', 'axis', 'slice', 'res', 'dim', 'select', 'texVolume'].forEach(function(name){
		self.cube.loc[name] = mqLocation(gl, self.cube.program, name);
	})

	this.axis = {};
	this.axis.vs = mqCreateShader(gl, getShaderById('line-vs'), gl.VERTEX_SHADER);
	this.axis.fs = mqCreateShader(gl, getShaderById('line-fs'), gl.FRAGMENT_SHADER);
	this.axis.program = mqCreateProgram(gl, this.axis.vs, this.axis.fs);
	this.axis.vao = this.util.vaoAxis(gl);
	this.axis.loc = {};
	['umv', 'uproject', 'uColour', 'uAlpha'].forEach(function(name){
		self.axis.loc[name] = mqLocation(gl, self.axis.program, name);
	})
	
	// viewport 
	this.vp = new mqViewport(0, 0, options.width, options.height);
	// delayed render
	this.delaytimer = null;

	this.gl.clearColor(0.2, 0.2, 0.2, 1.0);
	//this.gl.clearColor(1, 1, 1, 0);
	//this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.SCISSOR_TEST);

}
mqRender.prototype.loadTextureArray = function(img, size, numx, numy) {
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.texVolume);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
	this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
	this.gl.texImage2D(
		this.gl.TEXTURE_2D,
		0,
		this.gl.LUMINANCE,
		this.gl.LUMINANCE,
		this.gl.UNSIGNED_BYTE,
		img
	);
}
mqRender.prototype.rayCamera = function() {
	
	mat4.identity(this.mv);

	//mat4.translate(this.mv, this.mv, [-1.0, 1.0, 0]);

	//mat4.targetTo(this.mv, this.eyePosition, this.targetPosition, this.upDirection);
	
	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	mat4.multiply(this.mv, this.mv, rotmat);

	mat4.perspective(this.project, this.fieldOfView, this.width / this.height, this.near, this.far);

	//mat4.multiply(this.mv, this.mv, this.project);
}
mqRender.prototype.initDrawVolume = function() {		
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D, this.texVolume);
	
	this.gl.bindVertexArray(this.cube.vao.vao);
	this.gl.useProgram(this.cube.program);

	this.gl.uniform1i(this.cube.loc['texVolume'], 0);
}
mqRender.prototype.DrawAxis = function() {
	this.gl.bindVertexArray(this.axis.vao.vao);
	this.gl.useProgram(this.axis.program);
			
	this.gl.uniformMatrix4fv(this.axis.loc['umv'], false, this.mv);
	this.gl.uniformMatrix4fv(this.axis.loc['uproject'], false, this.project);
	this.gl.uniform1f(this.axis.loc['uAlpha'], 1.0);
	this.gl.uniform4fv(this.axis.loc['uColour'], new Float32Array([1.0, 1.0, 1.0, 0.0]));
	
	this.gl.drawArrays(this.axis.vao.type, 0, this.axis.vao.count);
}
mqRender.prototype.DrawVolume = function(options) {
	this.gl.bindVertexArray(this.cube.vao.vao);
	this.gl.useProgram(this.cube.program);
	
	if (options.idx == 3) {
		mat4.rotateX(this.mv, this.mv, 0.1);
		//mat4.rotateY(this.mv, this.mv, 0.5);
		//mat4.rotateZ(this.mv, this.mv, 0.5);
		// var rotmat = mat4.create();
		// mat4.fromQuat(rotmat, this.rotate);
		// mat4.multiply(this.mv, this.mv, rotmat);	
		this.gl.uniformMatrix4fv(this.cube.loc['umv'], false, this.mv);	
	} else {
		this.gl.uniformMatrix4fv(this.cube.loc['umv'], false, this.mv);
	}
	this.gl.uniform1i(this.cube.loc['axis'], options.idx);
	this.gl.uniform3fv(this.cube.loc['slice'], new Float32Array([
		(options.idx1-1)/(this.width-1), 
		(options.idx2-1)/(this.height-1), 
		(options.idx3)/(this.depth)
	]));
	this.gl.uniform3iv(this.cube.loc['res'], new Int32Array([this.width, this.height, this.depth]));
	this.gl.uniform2fv(this.cube.loc['dim'], new Float32Array([this.dimx, this.dimy]));
	this.gl.uniform2iv(this.cube.loc['select'], new Int32Array([options.idx1, options.idx2]));
	
	this.gl.drawArrays(this.cube.vao.type, 0, this.cube.vao.count);
}
mqRender.prototype.draw = function(options) {
	
	this.gl.viewport(0, 0, this.width, this.height);
	this.gl.scissor(0, 0, this.width, this.height);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	
	this.rayCamera();	

	this.DrawVolume(options);
	
	this.DrawAxis();	
}
mqRender.prototype.getScreen = function(id) {
	let imgw = gl.drawingBufferWidth;
	let imgh = gl.drawingBufferHeight;
	var pixels = new Uint8Array(imgw * imgh * 4);
	gl.readPixels(0, 0, imgw, imgh, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	let canvas2 = document.getElementById(id);
	var ctx = canvas2.getContext('2d');
	var imgData = ctx.getImageData(0, 0, imgw, imgh);
	var data = imgData.data;
	for (var i=0; i<imgh; i++) {
		for (var j=0;j<imgw;j++) {
			var idx = (j * imgw + i) * 4;
			data[idx+0] = pixels[idx+0];
			data[idx+1] = pixels[idx+1];
			data[idx+2] = pixels[idx+2];
			data[idx+3] = pixels[idx+3];
		}
	}
	ctx.putImageData(imgData, 0, 0);
}
mqRender.prototype.delayDraw = function(time, immediately) {
	if (!immediately) this.draw();
	// delay for render high quality render effect
	if (this.delaytimer) clearTimeout(this.delaytimer);
	var that = this;
	this.delaytimer = setTimeout(function(){that.draw();}, time);
}

mqRender.prototype.rotateX = function(deg) {
	this.rotation(deg, [1,0,0]);
}
mqRender.prototype.rotateY = function(deg) {
	this.rotation(deg, [0,1,0]);
}
mqRender.prototype.rotateZ = function(deg) {
	this.rotation(deg, [0,0,1]);
}
mqRender.prototype.rotation = function(deg, axis) {
	// quaterion rotate
	var rad = deg * Math.PI / 180.0;
	var rotation = quat.create();
	quat.setAxisAngle(rotation, axis, rad);
	quat.normalize(rotation, rotation);
	quat.multiply(this.rotate, rotation, this.rotate);
}

