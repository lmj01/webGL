/**
 * 处理HTML5移动端手势
 * @author meijie
 * @date 2018.6.11
 * 移动与挥动两个事件很难区分开,尽量只使用其中一个
 * 缩放或旋转是多点触摸,旋转手势是固定第一个点,变动第二个点
 * 缩放是两点同时向里或向外移动
 * 长按开始传入type===1,弹起后传入type===0
 * 挥动传入type===1为向后,其他为向前
 * var element = document.getElementById('app');
 * var mqgesture = mq.gesture;
 * mqgesture.init(element, {
 * 	onTap: click_tap,				// 单击
 *  onDoubleTap: click_doubletap,	// 双击
 *  onLongTap: click_longtap,		// 长按
 *  onMove: click_move,				// 移动
 *  onSwipe: click_swipe,			// 挥动
 *  onRotate: click_rotate,			// 旋转
 *  onPinch: click_scale,			// 缩放
 *  onLog: click_log				// 日志
 * });
 * 
 */
var mq = window.mq || {};

mq.gesture = {
	init: function(element, options) {
		var that = this;
		this.target = element;
		var detect = {
			startX: null,
			startY: null,
			start2X: null,
			start2Y: null,
			clientX: null,
			moveX: null,
			moveY: null,
			startTime: null, // 按下时间
			previousStartTime: null, //			
			dblclick: false, // 是否为双击
			previousPoint: null, // 先前按下的点
			scale: null, // 缩放类型,1放大一倍,0缩小一倍
			distance: null, // 两个手指直接的距离
			vector: null, // 两个手指的向量
			longPress: null, // 长按定时器
		}
		options = options || {};
		// 单击
		options.onTap = options.onTap || function(){};
		// 双击
		options.onDoubleTap = options.onDoubleTap || function() {};
		// 长按
		options.onLongTap = options.onLongTap || function(e) {};
		// 挥动
		options.onSwipe = options.onSwipe || function() {};
		// 移动
		options.onMove = options.onMove || function(e) {};
		// 缩放
		options.onPinch = options.onPinch || function(e) {};
		// 旋转
		options.onRotate = options.onRotate || function(e) {};
		var log = options.onLog || function(e) {}
		var logs = [];
		
		this.target.addEventListener('touchstart', onTouchStart);		
		this.target.addEventListener('touchend', onTouchEnd);		
		this.target.addEventListener('touchmove', onTouchMove);		
		this.target.addEventListener('touchcancel', onTouchCancel);
		
		function onTouchStart(e) {
			logs = [];
			let touch1 = e.touches[0];
			detect.startX = touch1.pageX;
			detect.startY = touch1.pageY;
			detect.clientX = touch1.clientX/2;
			window.clearTimeout(detect.longPress);
			if (e.touches.length > 1) {
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
			e.preventDefault();
		}
		
		function onTouchMove(e) {
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
					let angleval = rotateAngle(vector, detect.vector);
					logs.push('angle:'+angleval);
					options.onRotate({angle:angleval});
				}
			} else {
				let point = e.touches ? e.touches[0] : e;
				let deltaX = detect.moveX === null ? 0 : point.pageX - detect.moveX;
				let deltaY = detect.moveY === null ? 0 : point.pageY - detect.moveY;
				options.onMove({x:deltaX, y:deltaY});
				detect.moveX = point.pageX;
				detect.moveY = point.pageY;
			}
			e.preventDefault();
		}
		
		function onTouchEnd(e) {
			window.clearTimeout(detect.longPress);
			options.onLongTap({type:0});
			let timestamp = now();
			var xoffset = detect.moveX - detect.startX;
			var yoffset = detect.moveY - detect.startY;
			if (detect.dblclick === false) {
				// 挥动,有偏移产生的
				if ((detect.moveX !== null && Math.abs(xoffset) > 10) ||
					(detect.moveY !== null && Math.abs(yoffset) > 10)) {
					if (timestamp - detect.startTime < 500) {
						if (detect.startX > detect.clientX) {
							options.onSwipe({type:1});
						} else {
							options.onSwipe({type:0});
						}
					}
				}
				// 单击 
				else if (timestamp - detect.startTime < 500) {
					options.onTap();
				}
			}
			// 恢复初始状态
			detect.startX = detect.startY = detect.moveX = detect.moveY = null;
			detect.dblclick = false;
			log(logs);
		}
		
		function onTouchCancel(e) {
			onTouchEnd(e);
		}
		
		function now() {
			return new Date().getTime();
		}
		
		function distance(x, y) {
			return Math.sqrt(x*x + y*y);
		}
		/*    
		 *    ~~~~~~~~ 
		 * p1 \      / p1`
		 *     \    /
		 *      \  / 
		 *       \/
		 *       p0
		 * */
		// 向量的旋转方向
		function rotateDirection(v1, v2) {
			return v1.x * v2.y - v2.x * v1.y;
		}
		// v1 dot v2 = |v1||v2|cos(theta)
		// theta = acos(v1 dot v2 / (|v1||v2|))
		// 得到的夹角不能判断v1和v2的深度, 可使用考虑使用atan2来
		function rotateAngle(v1, v2) {
			let direction = rotateDirection(v1, v2);
			direction = direction > 0 ? -1 : 1;
			//logs.push('v1x:'+(v1.x).toFixed(2));
			//logs.push('v1y:'+(v1.y).toFixed(2));
			let len1 = distance(v1.x, v1.y);
			//logs.push('len1:'+len1.toFixed(2));
			//logs.push('v2x:'+v2.x.toFixed(2));
			//logs.push('v2y:'+v2.y.toFixed(2));
			let len2 = distance(v2.x, v2.y);
			//logs.push('len2:'+len2.toFixed(2));
			let mr = len1 * len2;
			if (mr === 0) return 0;
			let dot = v1.x * v2.x + v1.y * v2.y;
			//logs.push('mr:'+mr.toFixed(2));
			//logs.push('dot:'+dot.toFixed(2));
			let r = dot / mr;
			//logs.push('r:'+r.toFixed(2));
			//logs.push('\n');
			if (r > 1) r = 1;
			if (r < -1) r = -1;
			return (Math.acos(r) * direction * 180) / Math.PI;
		}
	}
};   