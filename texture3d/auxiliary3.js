function getShaderById(id) {
	return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
}
function mqCreateShader(gl, source, type) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var log = gl.getShaderInfoLog(shader);
	if (log) {
		console.log(log);
	}
	return shader;
}
function mqCreateProgram(gl, vs, fs) {
	var program = gl.createProgram();
	gl.attachShader(program, vs); gl.deleteShader(vs);
	gl.attachShader(program, fs); gl.deleteShader(fs);
	gl.linkProgram(program);
	var log = gl.getProgramInfoLog(program);
	if (log) {
		console.log(log);
	}
	return program;
}
function mqBufferData(gl, data, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, type);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return buffer;
}
function mqLocation(gl, program, name) {
	return gl.getUniformLocation(program, name);
}

/**
 * 工具
 */
function mqUtil() {
}
mqUtil.prototype.vaoCube = function(gl) {
	var vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);

	var positionData = new Float32Array([
		-1.0, -1.0, -1.0,  -1.0, -1.0, 1.0,
		-1.0, 1.0, -1.0,  -1.0, 1.0, 1.0, 
		1.0, -1.0, -1.0,  1.0, -1.0, 1.0, 
		1.0, 1.0, -1.0,  1.0, 1.0,1.0
	]);
	var indices = new Uint16Array([
		7, 3, 1, 1, 5, 7, // Z+
        0, 2, 6, 6, 4, 0, // Z-
        6, 2, 3, 3, 7, 6, // Y+
        1, 0, 4, 4, 5, 1, // Y-
        3, 2, 0, 0, 1, 3, // X-
        4, 6, 7, 7, 5, 4, // X+
	]);

	var posVbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER ,posVbo);
	gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);
	gl.bindBuffer(null);

	var idxVbo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxVbo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	gl.bindBuffer(null);

	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

	gl.bindVertexArray(null);
	return {vao:vao, buffer:idxVbo, count:36 };
}
mqUtil.prototype.vaoVolume = function(gl) {
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var positions = new Float32Array([-1.0,-1.0, 1.0,-1.0, 1.0,1.0, 1.0,1.0, -1.0,1.0, -1.0,-1.0])
	var posbuffer = mqBufferData(gl, positions, gl.STATIC_DRAW);
	var texcoords = new Float32Array([0.0,1.0, 1.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,0.0, 0.0,1.0]);
	var texbuffer = mqBufferData(gl, texcoords, gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	

	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, texbuffer);
	gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	

	gl.bindVertexArray(null);	
	return {vao:vao, type: gl.TRIANGLES, count: 6};
}
mqUtil.prototype.vaoAxis = function(gl) {
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var vertexPositions = [
		-1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		0.0, -1.0,  0.0, 
		0.0,  1.0,  0.0, 
		0.0,  0.0, -1.0, 
		0.0,  0.0,  1.0
	];
	var posbuffer = mqBufferData(gl, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	var vertexColours =  [
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0
	];	
	var colourbuf = mqBufferData(gl, new Float32Array(vertexColours), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
	gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.enableVertexAttribArray(1);
	gl.bindBuffer(gl.ARRAY_BUFFER, colourbuf);
	gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindVertexArray(null);
	return {vao: vao, type:gl.LINES, count: 6};
}

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
/**
 * render
 */
function mqRender(gl, options) {
	this.gl = gl;
	var self = this;
	this.width = options.width;
	this.height = options.height;
	this.rotate = quat.create();
	quat.identity(this.rotate);

	this.resolution = [options.dimx, options.dimy, options.dimz];
	this.fov = 45.0;
	this.focalLength = 1.0 / Math.tan(0.5 * this.fov * Math.PI / 180);
	this.near = 1.0;
	this.far = 1000.0;
	this.resolution = [options.dimx, options.dimy, options.dimz];
	this.tiles = [options.slicex, options.slicey];

	this.mv = new mqMatrix();
	this.project = new mqMatrix();
	this.iproject = mat4.create(); // inverse projection
	
	// texture
	this.texVolume = this.gl.createTexture();
	// shader
	this.util = new mqUtil();
	this.cube = {};
	this.cube.vs = mqCreateShader(gl, getShaderById('vs'), gl.VERTEX_SHADER);
	this.cube.fs = mqCreateShader(gl, getShaderById('fs'), gl.FRAGMENT_SHADER);
	this.cube.program = mqCreateProgram(gl, this.cube.vs, this.cube.fs);
	this.cube.vao = this.util.vaoVolume(gl);
	this.cube.loc = {};
	['umv', 'FocalLength', 'WindowSize', 'RayOrigin', 'uvolume'].forEach(function(name){
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

	this.gl.clearColor(0, 0, 0, 0);
	this.gl.enable(this.gl.DEPTH_TEST);
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.enable(this.gl.BLEND);
	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
}
mqRender.prototype.loadTextureArray = function(img, size, numx, numy) {
	var canvas = document.createElement('canvas');
	canvas.width = size * numx;
	canvas.height = size * numy;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0);
	
	this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.texVolume);
	this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_BASE_LEVEL, 0);
	this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAX_LEVEL, Math.log2(size));
	this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
	this.gl.texParameteri(this.gl.TEXTURE_2D_ARRAY, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
	this.gl.texStorage3D(
		this.gl.TEXTURE_2D_ARRAY,
		Math.log2(size),
		this.gl.RGBA8,
		size, 
		size, 
		numx*numy
	);
	for (let i=0; i<numy; i++) {
		for (let j=0; j<numx; j++) {
			var imageData = ctx.getImageData(0+j*size, 0+i*size, size, size);
			var pixels = new Uint8Array(imageData.data.buffer);
			this.gl.texSubImage3D(
				this.gl.TEXTURE_2D_ARRAY, 0, 
				0, 0, j+i*numx,
				size, size, 1,
				this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels
			);
		}
	}
}
mqRender.prototype.rayCamera = function() {
	this.mv.identity();

	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	this.mv.multiply(rotmat);
}
mqRender.prototype.initDrawVolume = function() {		
	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.texVolume);
	
	this.gl.bindVertexArray(this.cube.vao.vao);
	this.gl.useProgram(this.cube.program);

	this.gl.uniform1i(this.cube.loc['uvolume'], 0);
	this.gl.uniform2fv(this.cube.loc['WindowSize'], new Float32Array([this.width, this.height]));
}
mqRender.prototype.DrawAxis = function() {
	this.gl.bindVertexArray(this.axis.vao.vao);
	this.gl.useProgram(this.axis.program);
			
	this.gl.uniformMatrix4fv(this.axis.loc['umv'], false, this.mv.m);
	this.gl.uniformMatrix4fv(this.axis.loc['uproject'], false, this.project.m);
	this.gl.uniform1f(this.axis.loc['uAlpha'], 0.5);
	this.gl.uniform4fv(this.axis.loc['uColour'], new Float32Array([1.0, 1.0, 1.0, 0.0]));
	
	this.gl.drawArrays(this.axis.vao.type, 0, this.axis.vao.count);
}
mqRender.prototype.DrawVolume = function() {
	this.gl.bindVertexArray(this.cube.vao.vao);
	this.gl.useProgram(this.cube.program);

	this.gl.uniformMatrix4fv(this.cube.loc['umv'], false, this.mv.m);
	this.gl.uniform1f(this.cube.loc['FocalLength'], this.focalLength);
	this.gl.uniform3fv(this.cube.loc['RayOrigin'], new Float32Array([0, 0, 3]));
	
	this.gl.drawArrays(this.cube.vao.type, 0, this.cube.vao.count);
}
mqRender.prototype.draw = function() {
	
	this.gl.clear(this.gl.COLOR_BUFFER_BIT 
		//| this.gl.DEPTH_BUFFER_BIT
	);
	this.gl.viewport(this.vp.x, this.vp.y, this.vp.width, this.vp.height);

	this.rayCamera();	

	this.DrawVolume();
	
	this.DrawAxis();
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

// image data
function loadImage(url, onload) {
	var img = new Image();
	img.src = url;
	img.onload = function(){
		onload(img);
	}
	return img;
}