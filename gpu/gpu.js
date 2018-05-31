window.gpu =  {
    create: function(code, size){
        size = size || 256;
        code = code || '';
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var gl = this.gl = canvas.getContext('webgl');


        // 绑定并编译着色器程序
        var vertexShaderSource = 'attribute vec4 position;varying vec2 vCoord;void main() {vCoord = position.xy * 0.5 + 0.5;gl_Position = position;}';
        var fragmentShaderSource = 'precision highp float;varying vec2 vCoord;uniform sampler2D map;void main(void) {vec4 color = texture2D(map, vCoord);' + code + 'gl_FragColor = color;}';
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);				

        // 创建程序对象
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        this.program = program;

        // 顶点数据传输
        var vertices = new Float32Array([-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0]);
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        var aPosition = gl.getAttribLocation(program, 'position');
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);
    },

    run: function(canvas){
        var gl = this.gl;
        var program = this.program;
        var texture = gl.createTexture();
        var uMap = gl.getUniformLocation(program, 'map');

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        


        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);

        gl.uniform1i(uMap, 0);				

        // 绘制
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        var pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        return pixels;
    }
};