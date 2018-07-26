
function PerlinNoise3D(x, y, z, alpha, beta, n, pn) {
	let sum=0;
	let p=[x,y,z];
	let scale=1;
	for (var i=0; i<n; i++) {
		let val = pn.noise(p[0], p[1], p[2]);
		sum += val / scale;
		scale *= alpha;
		p[0] *= beta;
		p[1] *= beta;
		p[2] *= beta;
	}
	return sum;
}

function createPyroclasticVolume(n, r) {
	var pn = new Perlin(new Date().getTime());
	var data = new Uint8Array(n*n*n);
	var pixel = 0;

	var frequency = 3.0 / n;
	var center = n / 2.0 + 0.5;
	for (var x=0; x<n; ++x) {
		for (var y=0; y<n; ++y) {
			for (var z=0; z<n; ++z) {
				var dx = center - x;
				var dy = center - y;
				var dz = center - z;

				var off = Math.abs(PerlinNoise3D(
					x*frequency,
					y*frequency,
					z*frequency,
					5, 6, 3,
					pn
				));

				var d = Math.sqrt(dx*dx+dy*dy+dz*dz) / n;
				var isFilled = (d - off) < r;
				data[pixel++] = isFilled ? 255 : 0;
			}
		}
	}
	var tex3d = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_3D, tex3d);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

	gl.texImage3D(
		gl.TEXTURE_3D, 
		0, 
		gl.LUMINANCE,
		n,n,n, 
		0,
		gl.LUMINANCE,
		gl.UNSIGNED_BYTE,
		data
	);

	return tex3d;
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
mqUtil.prototype.vaoVolume2 = function(gl) {
	var vao = gl.createVertexArray();
	gl.bindVertexArray(vao);

	var positions = new Float32Array([1.0,1.0,  -1.0,1.0,  1.0,-1.0,  -1.0,-1.0]);
	var posbuffer = mqBufferData(gl, positions, gl.STATIC_DRAW);
	//var texcoords = new Float32Array([1.0, 1.0,  0.0, 1.0,  1.0, 0.0,  0.0, 0.0]);
	//var texbuffer = mqBufferData(gl, texcoords, gl.STATIC_DRAW);

	gl.enableVertexAttribArray(0);
	gl.bindBuffer(gl.ARRAY_BUFFER, posbuffer);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// gl.enableVertexAttribArray(1);
	// gl.bindBuffer(gl.ARRAY_BUFFER, texbuffer);
	// gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
	// gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindVertexArray(null);
	return {vao:vao, type:gl.TRIANGLE_STRIP, count:4};
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

// image data
function loadImage(url, onload) {
	var img = new Image();
	img.src = url;
	img.onload = function(){
		onload(img);
	}
	return img;
}

function loadRawData(url, callback) {
	var rawFile = new XMLHttpRequest();
	rawFile.open('GET', url, true);
	rawFile.responseType = 'blob';
	rawFile.onloadend = function(){
		var fr = new FileReader();
		fr.onload = function(e){
			var buf = fr.result;
			callback(buf);
		}
		fr.onerror = function(e) {
			console.error("FileReader error", e);
		}
		fr.readAsArrayBuffer(file);
		
		callback(rawFile.response, null, callback);
	}
	rawFile.send(null);
}