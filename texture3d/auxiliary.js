/**
 * shader
 * @param {*} id 
 */
function mqShader() {
	this.program = null;
	this.vs = null;
	this.fs = null;
	this.vao = null;
	this.drawtype = null;
	this.drawcount = null;
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
mqShader.prototype.createVAO = function(gl, options) {
	this.vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);

	this.drawtype = options.type;
	this.drawcount = 6;

	var that = this;
	options.object.forEach(function(obj){
		if (obj.enable) {
			that.attrloc[obj.name] = obj.loc;
			let buffer = that.bufferData(gl, obj.data, gl.STATIC_DRAW);
			gl.enableVertexAttribArray(obj.loc);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.vertexAttribPointer(obj.loc, obj.size, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);	
		}
	});
	gl.bindVertexArray(null);	
}

/**
 * 工具
 */
function mqUtil() {
}
mqUtil.prototype.vaoCube = function() {
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
	return vao;
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

	this.width = options.width;
	this.height = options.height;
	this.rotate = quat.create();
	quat.identity(this.rotate);
	this.fov = 45.0;
	this.near = 0.1;
	this.far = 100.0;
	this.resolution = [options.dimx, options.dimy, options.dimz];

	this.mv = new mqMatrix();
	this.project = new mqMatrix();
	this.iproject = null; // inverse projection
	this.mnormal = null; // normal 
	
	// texture
	this.texVolume = this.gl.createTexture();
	// shader
	this.glsl = new mqShader();
    this.glsl.vs = this.glsl.createShader(gl, this.glsl.getCodeFromElement('vs'), gl.VERTEX_SHADER);
    this.glsl.fs = this.glsl.createShader(gl, this.glsl.getCodeFromElement('fs'), gl.FRAGMENT_SHADER);
    this.glsl.program = this.glsl.createProgram(gl, this.glsl.vs, this.glsl.fs);
	this.initVolumeShader();
	
	// auxililary scene object 
	this.lineglsl = new mqShader();
	this.lineglsl.vs = this.lineglsl.createShader(gl, this.lineglsl.getCodeFromElement('line-vs'), gl.VERTEX_SHADER);
	this.lineglsl.fs = this.lineglsl.createShader(gl, this.lineglsl.getCodeFromElement('line-fs'), gl.FRAGMENT_SHADER);
	this.lineglsl.program = this.lineglsl.createProgram(gl, this.lineglsl.vs, this.lineglsl.fs);
	this.initLineShader();
	
	// viewport 
	this.vp = new mqViewport(
		//0, 0, options.width, options.height
		0, 0, 400, 400
	);
	// delayed render
	this.delaytimer = null;

	this.gl.clearColor(0, 0, 0, 0);
	if (true) {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
	}
	if (true) {		
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
	}
}
mqRender.prototype.initVolumeShader = function() {
	let options = {
		type: 
			gl.TRIANGLES,
			//gl.TRIANGLE_STRIP,
		count: 
			//4,
			6,
		object:	[
			{
				name: 'position',
				enable: true,
				loc: 0,
				size: 2,
				data: 
					//new Float32Array([1.0,1.0, -1.0,1.0, 1.0,-1.0, -1.0,-1.0]),
					new Float32Array([-1.0,-1.0, 1.0,-1.0, 1.0,1.0, 1.0,1.0, -1.0,1.0, -1.0,-1.0]),				
			}, {
				name: 'texcoord',
				enable: false,
				loc: 1,
				size: 2,
				data: 
					//new Float32Array([1.0,1.0, 0.0,1.0, 1.0,0.0, 0.0,0.0]),
					new Float32Array([0.0,1.0, 1.0,1.0, 1.0,0.0, 1.0,0.0, 0.0,0.0, 0.0,1.0]),
			}
		]
	};
    this.glsl.createVAO(this.gl, options);
	this.glsl.bindLocation(
		this.gl, 
		[options.object[0].name, options.object[1].name], 
		['uvolume', 'umv','uproject', 'uiproject', 'unormal', 'uvp', 'uResolution']
	);	
}
mqRender.prototype.initLineShader = function() {
	var vertexPositions = [-1.0,  0.0,  0.0,
		1.0,  0.0,  0.0,
		0.0, -1.0,  0.0, 
		0.0,  1.0,  0.0, 
		0.0,  0.0, -1.0, 
		0.0,  0.0,  1.0];
	var vertexColours =  [1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0];
	this.lineglsl.posbuffer = this.lineglsl.bufferData(this.gl, new Float32Array(vertexPositions), gl.STATIC_DRAW);
	this.lineglsl.colourbuf = this.lineglsl.bufferData(this.gl, new Float32Array(vertexColours), gl.STATIC_DRAW);
	this.lineglsl.bindLocation(this.gl, 
		[],
		['umv', 'uproject', 'uColour', 'uAlpha']
	);
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

	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	this.mv.multiply(rotmat);
	
	// perspective matrix
	this.setPerspective(this.fov, this.width / this.height, this.near, this.far);
}
mqRender.prototype.rayCamera = function() {
	// apply translation to origin, any rotation and scaling
	this.mv.identity();
	
	// rotate model
	var rotmat = mat4.create();
	mat4.fromQuat(rotmat, this.rotate);
	this.mv.multiply(rotmat);

	// perspective matrix
	this.setPerspective(this.fov, this.width / this.height, this.near, this.far);

	// get inverted matrix for volume shader 
	this.iproject = mat4.create(this.project.m);
	mat4.invert(this.iproject, this.iproject);
}
mqRender.prototype.initDrawVolume = function() {
	
	this.gl.useProgram(this.glsl.program);
	this.gl.bindVertexArray(this.glsl.vao);

	this.gl.activeTexture(this.gl.TEXTURE0);
	this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.texVolume);
	
	this.rayCamera();
	this.updateMatrix();

	this.gl.uniform1i(this.glsl.getUniformLoc('uvolume'), 0);
	this.gl.uniformMatrix4fv(this.glsl.getUniformLoc('uiproject'), false, this.iproject);            
	this.gl.uniform4fv(this.glsl.getUniformLoc('uvp'), new Float32Array(this.vp.toArray()));
	this.gl.uniform3fv(this.glsl.getUniformLoc('uResolution'), new Float32Array(this.resolution));

}
mqRender.prototype.DrawAxis = function() {
	
	this.camera();
	this.gl.useProgram(this.lineglsl.program);

	this.gl.uniformMatrix4fv(this.lineglsl.getUniformLoc('umv'), false, this.mv.m);
	this.gl.uniformMatrix4fv(this.lineglsl.getUniformLoc('uproject'), false, this.project.m);
	this.gl.uniform1f(this.lineglsl.getUniformLoc('uAlpha'), 0.5);
	this.gl.uniform4fv(this.lineglsl.getUniformLoc('uColour'), new Float32Array([1.0, 1.0, 1.0, 0.0]));
	
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineglsl.posbuffer);
	this.gl.enableVertexAttribArray(0);
	this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.lineglsl.colourbuf);
	this.gl.enableVertexAttribArray(1);
	this.gl.vertexAttribPointer(1, 4, this.gl.FLOAT, false, 0, 0);

	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

	this.gl.drawArrays(this.gl.LINES, 0, 6);
}
mqRender.prototype.draw = function() {
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	//this.gl.viewport(this.vp.x, this.vp.y, this.vp.width, this.vp.height);

	// only render current modelview
	this.mv.push();
	this.gl.useProgram(this.glsl.program);

	this.rayCamera();

	this.updateMatrix();

	this.gl.uniformMatrix4fv(this.glsl.getUniformLoc('uiproject'), false, this.iproject);

	this.gl.drawArrays(this.glsl.drawtype, 0, this.glsl.drawcount);

	this.mv.pop();

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