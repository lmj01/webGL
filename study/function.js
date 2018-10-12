// js 函数的种类
// 普通函数, 匿名函数, 闭包函数
//
// type 1
function showName(name) {
	console.log(name);
}
// type 1.1 同名函数的覆盖
console.log('type 1.1');
let n1 = 1;
function add(v1) {
	return n1 + 1;
}
console.log(add(n1));
function add(v1, v2) {
	return v1+2;
}
console.log(add(n1));
// type 1.2 arguments对象
console.log('type 1.2');
function showNames(name) {
	console.log(name);
	for (let i=0,c=arguments.length;i<c;i++) {
		console.log(arguments[i]);
	}
}
showNames('Nike', 'Lucy', 'Jacke');
// type 1.3 函数的默认返回值
console.log('type 1.3');
function showMessage() {
}
console.log(showMessage());

// type 2
console.log('type 2');
let anonymouseNormal = function(v1, v2) {
	console.log(v1+v2);
}
anonymouseNormal(3,6);
// type 2.1
console.log('type 2.1');
(function(v) {
	console.log(v);
})(2.1);

// type 3
console.log('type 3');
function funcA() {
	var i = 0;
	function funcB() {
		i++;
		console.log(i);
	}
	return funcB;
}
// 全局累加结果
var globalA = funcA();
// 局部的是一个值
function partFunction() {
	let part = funcA();
	part();
}
globalA();
partFunction();
globalA();
partFunction();
// type 3.1
console.log('type 3.1');
function funcA2(arg1, arg2) {
	var i = 0;
	function funcB2(step) {
		i = i + step;
		console.log(i);
	}
	return funcB2;
}
var globalA2 = funcA2(2, 3);
globalA2(1);
globalA2(3);
// type 3.2
console.log('type 3.2');
function funcA3() {
	var i = 0;
	function funcB3() {
		i++;
		console.log(i);
	}
	funcC = function() {
		i++;
		console.log(i);
	}
	return funcB3();
}
let gA31 = funcA3();
let gA32 = funcA3();
funcC();
funcC();

