'use strict';	
function test() {
    this.width = 10;
}
function Slicer(parentEl) {
    this.layout = "xyz";
    this.dims = [256, 256, 256];
    this.uniformColor = [0.5, 0.5, 0.5, 1.0];
    
    this.container = document.createElement("div");
    this.container.style.cssText = "position: absolute; bottom: 10px; left: 10px; margin: 0px; padding: 0px; pointer-events: none;";
    parentEl.appendChild(this.container);

    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = "position: absolute; bottom: 0px; margin: 0px; padding: 0px; border: none; background: rgba(0,0,0,0); pointer-events: none;";

    this.doLayout();

    this.canvas.mouse = new Mouse(this.canvas, this);

    this.gl = this.canvas.getContext('webgl');

    this.vs = mqCreateShader(this.gl, getShaderById('vs'), this.gl.VERTEX_SHADER);
    this.fs = mqCreateShader(this.gl, getShaderById('fs'), this.gl.FRAGMENT_SHADER);
    this.program = mqCreateProgram(this.gl, this.vs, this.fs);
    this.locColor = this.gl.getUniformLocation(this.program, 'uInColor');
    this.locIdx = this.gl.getUniformLocation(this.program, 'idxDiv');
    
    var vertexPositions = [0.5,0.0,0.0, 0.0,0.5,0.0, -0.5,0.0,0.0];
    this.vertexPositionBuffer = mqBufferData(this.gl, new Float32Array(vertexPositions), this.gl.STATIC_DRAW); this.gl.createBuffer();

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.SCISSOR_TEST);
}	
Slicer.prototype.doLayout = function() {
    this.viewers = [];

    var x = 0;
    var y = 0;
    var xmax = 0;
    var ymax = 0;
    var rotate = 0;

    var that = this;
    var buffer = "";
    var rowHeight = 0, rowWidth = 0;
    var addViewer = function(idx) {
        var mag = 1.0;
        if (buffer) mag = parseFloat(buffer);
        var v = new SliceView(that, x, y, idx, rotate, mag);
        that.viewers.push(v);
        that.container.appendChild(v.div);

        y += v.viewport.height + 5; //Offset by previous height
        var w = v.viewport.width + 5;
        if (w > rowWidth) rowWidth = w;
        if (y > ymax) ymax = y;
    }

    //Process based on layout
    this.flipY = false;
    for (var i=0; i<this.layout.length; i++) {
        var c = this.layout.charAt(i);
        rotate = 0;
        switch (c) {
        case 'X':
            rotate = 90;
        case 'x':
            addViewer(0);
            break;
        case 'Y':
            rotate = 90;
        case 'y':
            addViewer(1);
            break;
        case 'Z':
            rotate = 90;
        case 'z':
            addViewer(2);
            break;
        case '|':
            y = 0;
            x += rowWidth;
            rowWidth = 0;
            break;
        case '_':
            this.flipY = true;
            break;
        case '-':
            alignTop = false;
            break;
        default:
            //Add other chars to buffer, if a number will be used as zoom
            buffer += c;
            continue;
        }
        //Clear buffer
        buffer = "";
    }
    this.width = x + rowWidth;
    this.height = ymax;
    
    //Restore the main canvas
    this.container.appendChild(this.canvas);

    this.container.style.bottom = "";
    this.container.style.top = (this.height + 10) + "px";
}
Slicer.prototype.draw = function() {
    if (this.width != this.canvas.width || this.height != this.canvas.height) {
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        if (this.gl) {
            this.gl.viewportWidth = this.width;
            this.gl.viewportHeight = this.height;
        }
    }

    //Clear all
    this.gl.scissor(0, 0, this.width, this.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //Draw each slice viewport
    for (var i=0; i<this.viewers.length; i++)
        this.drawSlice(i);
}
Slicer.prototype.drawSlice = function(idx) {
    var view = this.viewers[idx];
    var vp = view.viewport;

    this.gl.scissor(vp.x, vp.y, vp.width, vp.height);
    this.gl.enable(this.gl.BLEND);

    this.gl.useProgram(this.program);

    this.gl.enableVertexAttribArray(0);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

    this.gl.uniform4fv(this.locColor, this.uniformColor);
    this.gl.uniform1i(this.locIdx, idx);
    
    //Draw, single pass
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
}
function SliceView(slicer, x, y, axis, rotate, magnify) {
    this.axis = axis;
    this.slicer = slicer;
    this.origin = [0.5,0.5];
    this.rotate = rotate || 0;

    //Calc viewport
    this.i = 0;
    this.j = 1;
    if (axis == 0) this.i = 2;
    if (axis == 1) this.j = 2;

    var w = Math.round(slicer.dims[this.i]);
    var h = Math.round(slicer.dims[this.j]);

    if (this.rotate == 90)
        this.viewport = new mqViewport(x, y, h, w);
    else
        this.viewport = new mqViewport(x, y, w, h);

    //Border and mouse interaction element
    this.div = document.createElement("div");
    this.div.style.cssText = "padding: 0px; margin: 0px; outline: 2px solid red; position: absolute; display: inline-block; pointer-events: auto;";
    this.div.id = "slice-div-" + axis;

    this.div.style.left = x + "px";
    this.div.style.bottom = y + "px";
    this.div.style.width = this.viewport.width + "px";
    this.div.style.height = this.viewport.height + "px";

    this.div.mouse = new Mouse(this.div, this);
}
SliceView.prototype.click = function(event, mouse) {
    console.log('click', event, mouse);			
    if (this.slicer.uniformColor[this.axis] < 0.9)
        this.slicer.uniformColor[this.axis] += 0.1;
    else 
        this.slicer.uniformColor[this.axis] -= 0.1;
    this.slicer.draw();    
    this.slicer.draw();
}
SliceView.prototype.wheel = function(event, mouse) {
    console.log('wheel', event, mouse);
    this.slicer.uniformColor[this.axis] += event.spin;
    this.slicer.draw();
}
SliceView.prototype.move = function(event, mouse) {
    console.log('move', event, mouse);
    if (mouse.isdown) this.click(event, mouse);
}
