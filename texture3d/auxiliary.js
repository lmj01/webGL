/**
 * shader
 * @param {*} id 
 */
function mqShader() {
	this.program = null;
	this.vs = null;
	this.fs = null;
	this.vao = null;
	this.posbuffer = null;
	this.texbuffer = null;
	this.posloc = null; // same as glsl layout qualifier
	this.texloc = null;
	this.uniformloc = []; // uniform name for location
	this.attrloc = []; // attributes location
}
mqShader.prototype.getCodeFromElement = function(id) {
	return document.getElementById(id).textContent.replace(/^\s+|\s+$/g, '');
}
mqShader.prototype.createShader = function(gl, source, type) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var log = gl.getShaderInfoLog(shader);
	if (log) {
		console.log(log);
	}
	return shader;
}
mqShader.prototype.createProgram = function(gl, vs, fs) {
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
mqShader.prototype.bufferData = function(gl, data, type) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, type);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return buffer;
}
mqShader.prototype.enableAttr = function(gl, name, on) {
	if (!this.attrloc.hasOwnProperty(name)) return;
	if (on)
		gl.enableVertexAttribArray(this.attrloc[name]);
	else 
	 	gl.disableVertexAttribArray(this.attrloc[name]);
}
mqShader.prototype.bindLocation = function(gl, attribute, uniform) {
	if (!gl.isProgram(this.program))
		throw "bindLocation need a valid program object";
	var that = this;
	attribute.forEach(function(name) {
		that.attrloc[name] = gl.getAttribLocation(that.program, name);
	})
	uniform.forEach(function(name) {
		that.uniformloc[name] = gl.getUniformLocation(that.program, name);
	})
}
mqShader.prototype.getAttrLoc = function(name) {
	if(!this.attrrloc.hasOwnProperty(name)) 
		throw "no such attribute name" + name;
	return this.attrloc[name];
}
mqShader.prototype.getUniformLoc = function(name) {
	if (!this.uniformloc.hasOwnProperty(name))
		throw "no such uniform name" + name;
	return this.uniformloc[name];
}
mqShader.prototype.createVAO = function(gl, npos, ntex) {
	this.vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);

	this.enableAttr(npos, true);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer);
	gl.vertexAttribPointer(this.posloc, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	this.enableAttr(ntex, true);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
	gl.vertexAttribPointer(this.texloc, 2, gl.FLOAT,false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindVertexArray(null);	
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
	mat4.multiply(this.m, mat);
}
mqMatrix.prototype.identity = function() {
	mat4.identity(this.m);
}
mqMatrix.prototype.scale = function(s) {
	mat4.scale(this.m, s);
}
mqMatrix.prototype.translate = function(t) {
	mat4.translate(this.m, t);
}
mqMatrix.prototype.rotate = function(angle, v) {
	var rad = angle * Math.PI / 180.0;
	mat4.rotate(this.m, rad, v);
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

/**
 * render
 */
function mqRender(gl) {
	this.gl = gl;

	this.translate = [0,0,0];
	this.rotate = quat.create();
	quat.identity(this.rotate);
	this.focus = [0,0,0];
	this.center = [0, 0, 0];
	this.scale = [1, 1, 1];
	this.orientation = 1.0; // 1.0f for RH, -1.0 for LH
	this.fov = 45.0;
	this.focalLength = 1.0 / Math.tan(0.5 * this.fov * Math.PI / 180.0);
	
	this.mv = new mqMatrix();
	this.project = new mqMatrix();
	this.program = null;
	// texture
	this.texVolume = this.gl.createTexture();
	// shader
	// uniform variable
	this.umv = null;
	this.uproject = null;
	this.unormal = null;
	this.umvloc = null;
	this.uprojectloc = null;
	this.unormalloc = null;
	// viewport 
	this.vp = null;
	// delayed render
	this.delaytimer = null;

	if (true) {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}
	if (true) {
		this.gl.clearColor(0, 0, 0, 0);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	}
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
mqRender.prototype.setPerspective = function(fovy, aspect, znear, zfar) {
	this.project.m = mat4.perspective(fovy, aspect, znear, zfar);
}
mqRender.prototype.updateMatrix = function() {
	this.gl.uniformMatrix4fv(this.umvloc, false, this.mv.m);
	this.gl.uniformMatrix4fv(this.uprojectloc, false, this.project.m);
	if (this.unormalloc) {
		var normalmat = mat4.create(this.mv.m);
		mat4.inverse(normalmat);
		mat4.transpose(normalmat);
		this.gl.uniformMatrix4fv(this.unormalloc, false, normalmat);
	}
}
mqRender.prototype.camera = function() {
	this.mv.identity();
}
mqRender.prototype.rayCamera = function() {
	this.mv.identity();
	this.mv.translate(this.translate);
}
mqRender.prototype.draw = function() {
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(this.vp.x, this.vp.y, this.vp.width, this.vp.height);

	// only render current modelview
	this.mv.push();

	this.rayCamera();

	this.gl.useProgram(this.program);

	// texture

	//this.gl.drawArrays()

	this.mv.pop();
}

mqRender.prototype.delayDraw = function(time, immediately) {
	if (!immediately) this.draw();
	// delay for render high quality render effect
	if (this.delaytimer) clearTimeout(this.delaytimer);
	var that = this;
	this.delaytimer = setTimeout(function(){that.draw();}, time);
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