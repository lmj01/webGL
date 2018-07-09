function mqMath(){
    return this;
}
mqMath.prototype.distance = function(p1, p2){
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx*dx+dy*dy);
}
mqMath.prototype.toDeg = function(rad) {
    return rad * (180 / Math.PI);
}
mqMath.prototype.toRad = function(deg) {
    return deg * (Math.PI / 180);
}
mqMath.prototype.angle = function(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    var rad = Math.atan2(dy, dx);
    return {rad:rad, deg:this.toDeg(rad)};
}

function mqGestureSwipe(targetid, options) {
    var target = document.getElementById(targetid); // the element
    this.target = target;
    bind();
    this.clickdown = null;
    var onDirUp = options.onDirUp || function(){};
    var onDirDown = options.onDirDown || function(){};
    var onDirLeft = options.onDirLeft || function(){};
    var onDirRight = options.onDirRight || function(){};
    var mqmath = new mqMath();    
    

    function onStart(e) {
        let touch = e.touches[0];
        if (!touch) touch = e.changedTouches[0];
        this.clickdown = {x:touch.pageX, y:touch.pageY};
    }
    function onMove(e) {
        return;
        let touch = e.touches[0];
        if (!touch) touch = e.changedTouches[0];
        var click = {x:touch.pageX, y:touch.pageY};
        var force = mqmath.distance(click, this.clickdown) / 10;
        var angle = mqmath.angle(click, this.clickdown);
        angle.force = force;
        //this.deduction(angle);
        var rAngle = angle.rad;
        var angle45 = Math.PI / 4;
        var angle90 = Math.PI / 2;
        // Angular direction
        //     \  UP /
        //      \   /
        // LEFT       RIGHT
        //      /   \
        //     /DOWN \
        //
        if (
            rAngle > angle45 &&
            rAngle < (angle45 * 3)
        ) {
            onDirUp(angle);
        } else if (
            rAngle > -angle45 &&
            rAngle <= angle45
        ) {
            onDirLeft(angle);
        } else if (
            rAngle > (-angle45 * 3) &&
            rAngle <= -angle45
        ) {
            onDirDown(angle);
        } else {
            onDirRight(angle);
        }
    }
    function onEnd(e) {
        let touch = e.touches[0];
        if (!touch) touch = e.changedTouches[0];
        var click = {x:touch.pageX, y:touch.pageY};
        var force = mqmath.distance(click, this.clickdown) / 10;
        var angle = mqmath.angle(click, this.clickdown);
        angle.force = force;
        //this.deduction(angle);
        var rAngle = angle.rad;
        var angle45 = Math.PI / 4;
        var angle90 = Math.PI / 2;
        // Angular direction
        //     \  UP /
        //      \   /
        // LEFT       RIGHT
        //      /   \
        //     /DOWN \
        //
        if (
            rAngle > angle45 &&
            rAngle < (angle45 * 3)
        ) {
            onDirUp(angle);
        } else if (
            rAngle > -angle45 &&
            rAngle <= angle45
        ) {
            onDirLeft(angle);
        } else if (
            rAngle > (-angle45 * 3) &&
            rAngle <= -angle45
        ) {
            onDirDown(angle);
        } else {
            onDirRight(angle);
        }
    }
    function bind() {
        var isTouch = !!('ontouchstart' in window);
        if (isTouch) {
            target.addEventListener('touchstart', onStart, false);
            target.addEventListener('touchmove', onMove, false);
            target.addEventListener('touchend', onEnd, false);
        } else {
            target.addEventListener('mousedown', onStart, false);
            target.addEventListener('mousemove', onMove, false);
            target.addEventListener('mouseup', onEnd, false);
        }
    }
    function unbind() {
        var isTouch = !!('ontouchstart' in window);
        if (isTouch) {            
            target.removeEventListener('touchstart', onStart);
            target.removeEventListener('touchmove', onMove);
            target.removeEventListener('touchend', onEnd);
        } else {
            target.removeEventListener('mousedown', onStart);
            target.removeEventListener('mousemove', onMove);
            target.removeEventListener('mouseup', onEnd);
        }
    }
    return this;
}
// mqGestureSwipe.prototype.bind = function() {
//     var isTouch = !!('ontouchstart' in window);
//         if (isTouch) {
//             this.target.addEventListener('touchstart', this.onStart, false);
//             this.target.addEventListener('touchmove', this.onMove, false);
//             this.target.addEventListener('touchend', this.onEnd, false);
//         } else {
//             this.target.addEventListener('mousedown', this.onStart, false);
//             this.target.addEventListener('mousemove', this.onMove, false);
//             this.target.addEventListener('mouseup', this.onEnd, false);
//         }
// }
// mqGestureSwipe.prototype.unbind = function() {
//     var isTouch = !!('ontouchstart' in window);
//         if (isTouch) {            
//             this.target.removeEventListener('touchstart', this.onStart);
//             this.target.removeEventListener('touchmove', this.onMove);
//             this.target.removeEventListener('touchend', this.onEnd);
//         } else {
//             this.target.removeEventListener('mousedown', this.onStart);
//             this.target.removeEventListener('mousemove', this.onMove);
//             this.target.removeEventListener('mouseup', this.onEnd);
//         }
// }