(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mq = f()}})(function(){var define,module,exports;
'use strict';

// Constants
var isTouch = !!('ontouchstart' in window);
var isPointer = window.PointerEvent ? true : false;
var events = {
    touch: {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
    },
    mouse: {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup'
    },
    pointer: {
        start: 'pointerdown',
        move: 'pointermove',
        end: 'pointerup'
    }
};
var toBind;
var secondBind = {};
if (isPointer) {
    toBind = events.pointer;
} else if (isTouch) {
    toBind = events.touch;
    secondBind = events.mouse;
} else {
    toBind = events.mouse;
}

///////////////////////
///      UTILS      ///
///////////////////////

var u = {};
/*    
 * 向量计算
 * v2 \      / v2`
 *     \    /
 *      \a / 
 *       \/
 *       v1
 * */
u.distance = function (dx, dy) {
    
    return Math.sqrt((dx * dx) + (dy * dy));
};

u.direction = function(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}
// v1 dot v2 = |v1||v2|cos(theta)
// theta = acos(v1 dot v2 / (|v1||v2|))
u.angle = function(v1, v2) {

    // 方向
    let direction = u.direction(v1, v2);
    direction = direction > 0 ? -1 : 1;

    // 长度
    let lenv1 = u.distance(v1.x, v1.y);
    let lenv2 = u.distance(v2.x, v2.y);
    let len = lenv1 * lenv2;
    if (len === 0) return 0;

    let dot = v1.x * v2.x + v1.y * v2.y;
    let theta = dot / len;
    if (theta > 1) theta = 1;
    if (theta < -1) theta = -1;

    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;

    return direction * u.toDeg(Math.acos(theta));
};

// 得到的夹角不能判断v1和v2的深度, 可使用考虑使用atan2来
u.angle2 = function(v1, v2) {
    var dx = v2.x - v1.x;
    var dy = v2.y - v1.y;

    return u.degrees(Math.atan2(dy, dx));
}

u.toRrad = function(a) {
    return a * (Math.PI / 180);
};

u.toDeg = function(a) {
    return a * (180 / Math.PI);
};

u.trigger = function (el, type, data) {
    var evt = new CustomEvent(type, data);
    el.dispatchEvent(evt);
};

u.now = function() {
    return new Date().getTime();
}

///////////////////////
///   手势           //
//////////////////////

function Gesture (element, options) {
    this.target = element;
    // 当前状态
    this.s = {
        tapx1: null, // 第一个按下时
        tapy1: null,
        tapx2: null, // 第二个按下时
        tapy2: null, 
        width: null, //屏幕宽度
        height: null, // 屏幕高度
        movex1: null,
        movey1: null,
        taptime: null, // 按下时间
        prevtaptime: null,
        isdblclick: false, // 是否为双击
        tolongtap: null, // 长按下的定时器
    }

    // 当前事件接口
    this.onTap = options.onTap || function(e){};
    this.onDoubleTap = options.onDoubleTap || function(e){};
    this.onLongTap = options.onLongTap || function(e){};
    this.onSwipe = options.onSwipe || function(e){};
    this.onMove = options.onMove || function(e){};
    this.onPinch = options.onPinch || function(e){};
    this.onRotate = options.onRotate || function(e){};

};

Gesture.prototype = new Object();
Gesture.constructor = Gesture;

Gesture.prototype.bind = function() {
    this.target.addEventListener(toBind['start'], this.startEvent, false);
    this.target.addEventListener(toBind['move'], this.moveEvent, false);
    this.target.addEventListener(toBind['end'], this.endEvent, false);
}

Gesture.prototype.unbind = function() {
    this.target.removeEventListener(toBind['start'], this.startEvent);
    this.target.removeEventListener(toBind['move'], this.moveEvent);
    this.target.removeEventListener(toBind['end'], this.endEvent);
}

Gesture.prototype.startEvent = function(e) {
    var self = this;
    e.preventDefault();
    let touch1 = e.touches[0];
    self.s.tapx1 = touch1.pageX;
    self.s.tapy1 = touch1.pageY;
    self.s.width = touch1.clientX;
    self.s.height = touch1.clientY;
    if (e.touches.length > 1) {
        let touch2 = e.touches[1];
        self.s.tapx2 = touch2.pageX;
        self.s.tapy2 = touch2.pageY;
// 多点检测
let touch2 = e.touches[1];
detect.start2X = touch2.pageX;
detect.start2Y = touch2.pageY;
let xoffset = detect.start2X - detect.startX;
let yoffset = detect.start2Y - detect.startY;
detect.distance = distance(Math.abs(xoffset), Math.abs(yoffset));
detect.vector = { x: xoffset, y: yoffset };
    } else {
        detect.startTime = now();
				detect.longPress = window.setTimeout(() => { options.onLongTap({type:1}); }, 800);
				if (detect.previousPoint) {
					if (Math.abs(detect.startX - detect.previousPoint.startX) < 10 &&
						Math.abs(detect.startY - detect.previousPoint.startY) < 10 &&
						Math.abs(detect.startTime - detect.previousStartTime) < 300) {
						detect.dblclick = true;
						options.onDoubleTap();
					}
				}
				detect.previousStartTime = detect.startTime;
				detect.previousPoint = { startX: detect.startX, startY: detect.startY };
    }
}

Gesture.prototype.moveEvent = function(e) {
    e.preventDefault();
    // 长按不能移动			
			window.clearTimeout(detect.longPress);
			let timestamp = now();
			if (e.touches.length > 1) {
				// 旋转或缩放多点触摸
				let xoffset = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
				let yoffset = Math.abs(e.touches[1].pageY - e.touches[0].pageY);
				let xyLength = distance(xoffset, yoffset);
				// 根据距离差值较大为缩放
				if (Math.abs(detect.startY - e.touches[0].pageY) > 10 &&
					Math.abs(detect.start2Y - e.touches[1].pageY) > 10) {
					let ratio = xyLength / detect.distance;
					detect.scale = 1;
					if (ratio < 1) detect.scale = 0;
					options.onPinch({scale:detect.scale});
				}
				// 旋转为特殊情况,
				else if ((Math.abs(detect.startX - e.touches[0].pageX) < 1 && 
						  Math.abs(detect.startY - e.touches[0].pageY) < 1)) {
					let vector = {
						x: e.touches[1].pageX - detect.startX,
						y: e.touches[1].pageY - detect.startY
					};
					let angle = rotateAngle(vector, detect.vector);
					//logs.push('angle:'+angle);
					options.onRotate({angle:angle});
				}
			} else {
				let point = e.touches ? e.touches[0] : e;
				let deltaX = detect.moveX === null ? 0 : point.pageX - detect.moveX;
				let deltaY = detect.moveY === null ? 0 : point.pageY - detect.moveY;
				options.onMove({
					x:deltaX, y:deltaY,
					startx:detect.moveX, 
					starty: detect.moveY,
					endx: point.pageX,
					endY: point.pageY,
				});
				detect.moveX = point.pageX;
				detect.moveY = point.pageY;
			}
}

Gesture.prototype.endEvent = function(e) {
    var self = this;
    window.clearTimeout(self.s.tolongtap);
    self.onLongTap({type:0});
    let timestamp = u.now();
    let x = sefl.s.movex1 - self.s.tapx1;
    let y = self.s.movey1 - self.s.tapy1;
    if (sefl.s.isdblclick === false) {
        if ((self.s.movex1 !== null && Math.abs(x) > 10) ||
            (self.s.movey1 !== null && Math.abs(y) > 10)) {
            if (timestamp - self.s.taptime < 500) {
                self.onSwipe({type:1});
            } else {
                self.onSwipe({type:0});
            }
        } else if (timestamp - self.s.taptime < 500) {
            self.onTap({});
        }
    }
    self.s.tapx1 = self.s.tapy1 = null;
    self.s.movex1 = self.s.movey1 = null;
    self.s.isdblclick = false;
}

return {
    gesture: function (element, options) {
        var gesture = new Gesture(element, options);
        
        return gesture;
    },
};

});
