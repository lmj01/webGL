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
	this.itemSize = null;
	this.numItems = null;
	this.posloc = null; // same as glsl layout qualifier
	this.texloc = null;
	this.drawtype = null;
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
		throw "no such attribute name : " + name;
	return this.attrloc[name];
}
mqShader.prototype.getUniformLoc = function(name) {
	if (!this.uniformloc.hasOwnProperty(name))
		throw "no such uniform name : " + name;
	return this.uniformloc[name];
}
mqShader.prototype.createVAO = function(gl, npos, ntex) {
	this.vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);

	var positionData = 
		//new Float32Array([1.0,1.0, -1.0,1.0, 1.0,-1.0, -1.0,-1.0]);
		new Float32Array([-1.0,-1.0, 1.0,-1.0, 1.0,1.0, 1.0,1.0, -1.0,1.0, -1.0,-1.0]);
	this.posbuffer = this.bufferData(gl, positionData, gl.STATIC_DRAW);

	var texcoordData = 
		//new Float32Array([1.0,1.0, 0.0,1.0, 1.0,0.0, 0.0,0.0]);
		new Float32Array([0.0,1.0, 1.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,0.0, 0.0,1.0]);
	this.texbuffer = this.bufferData(gl, texcoordData, gl.STATIC_DRAW);
	this.drawtype = 
		gl.TRIANGLES;
		//gl.TRIANGLE_STRIP;
	this.itemSize = 2;
	this.numItems = 6;//4;

	// same as in glsl layout qualifier
	this.posloc = 0;
	this.texloc = 1;
	gl.enableVertexAttribArray(this.posloc);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.posbuffer);
	gl.vertexAttribPointer(this.posloc, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
/*
	gl.enableVertexAttribArray(this.texloc);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
	gl.vertexAttribPointer(this.texloc, this.itemSize, gl.FLOAT,false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
*/
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

/**
 * render
 */
function mqRender(gl, width, height, depth, slicex, slicey) {
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
	this.resolution = [width, height, depth];
	this.res = [width, height, depth];
	this.dims = [1.0, 1.0, 1.0];
	this.scaling = this.dims;
	this.tiles = [slicex, slicey];
	this.iscale = [1.0 / this.scaling[0], 1.0 / this.scaling[1], 1.0 / this.scaling[2]];
	this.center = [0.5 * this.scaling[0], 0.5 * this.scaling[2], 0.5 * this.scaling[2]];
	this.focus = this.center;
	
	this.mv = new mqMatrix();
	this.project = new mqMatrix();
	this.program = null;
	// texture
	this.texVolume = this.gl.createTexture();
	// shader
	this.glsl = null;
	// uniform matrix variables
	this.umv = null;	// modelview
	this.uproject = null; // projection
	this.uiproject = null; // inverse projection
	this.unormal = null; // normal 
	// viewport 
	this.vp = new mqViewport(0, 0, width, height);
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
	mat4.perspective(this.project.m, fovy, aspect, znear, zfar);
}
mqRender.prototype.updateMatrix = function() {
	this.gl.uniformMatrix4fv(this.glsl.getUniformLoc('umv'), false, this.mv.m);
	this.gl.uniformMatrix4fv(this.glsl.getUniformLoc('uproject'), false, this.project.m);
	var normalmat = mat4.create(this.mv.m);
	mat4.invert(normalmat, normalmat);
	mat4.transpose(normalmat, normalmat);
	if (this.glsl) {
		this.gl.uniformMatrix4fv(this.glsl.getUniformLoc('unormal'), false, normalmat);
	}	
}
mqRender.prototype.camera = function() {
	// apply translation to origin, any rotation and scaling
	this.mv.identity();
	this.mv.translate(this.translate);
	// adjust center of rotation, default is same as focal point so this does nothing
	adjust = [-(this.focus[0] - this.center[0]), -(this.focus[1]-this.center[1]), -(this.focus[2] - this.center[2])];
	this.mv.translate(adjust);

	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	this.mv.multiply(rotmat);

	// adjust back for rotation center
	adjust.forEach(function(element){
		element *= element * -1;
	})
	//adjust = [this.focus[0] - this.center[0], this.focus[1] - this.center[1], this.focus[2] - this.center[2]];
	this.mv.translate(adjust);

	// tanslate back by center of model to align eye with model center
	this.mv.translate([-this.focus[0], -this.focus[1], -this.focus[2] * this.orientation]);

	// perspective matrix
	this.setPerspective(this.fov, this.vp.width, this.vp.height, 0.1, 100.0);
}
mqRender.prototype.rayCamera = function() {
	// apply translation to origin, any rotation and scaling
	this.mv.identity();
	this.mv.translate(this.translate);

	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	this.mv.multiply(rotmat);

	// for a volume cube other than [0,0,0] - [1,1,1], need to translate/scale here...
	this.mv.translate([-this.scaling[0]*0.5, -this.scaling[1]*0.5, -this.scaling[2]*0.5]);
	// inverse of scaling
	this.mv.scale([this.iscale[0], this.iscale[1], this.iscale[2]]);

	// perspective matrix
	this.setPerspective(this.fov, this.vp.width, this.vp.height, 0.1, 100.0);

	// get inverted matrix for volume shader 
	this.uiproject = mat4.create(this.project.m);
	mat4.invert(this.uiproject, this.uiproject);
}
mqRender.prototype.draw = function() {
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	this.gl.viewport(this.vp.x, this.vp.y, this.vp.width, this.vp.height);

	// only render current modelview
	this.mv.push();

	this.rayCamera();

	this.gl.useProgram(this.program);

	// texture

	this.gl.drawArrays(this.glsl.drawtype, 0, this.glsl.numItems);

	this.mv.pop();
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