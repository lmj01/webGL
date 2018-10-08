// 静态方法与非静态方法
//
function Person(name) {
	// 非静态属性
	this.name = name;
	// 非静态方法
	this.show = function() {
		console.log('name is ' + this.name);
	}
}
// 静态属性
Person.mouth = 1;
// 静态方法
Person.cry = function() {
	console.log('crying---');
}
// 非静态属性
Person.prototype.teeth = 32;

