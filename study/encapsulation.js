// js封装成类的主要方法

// 原始模式, 缺点:1多个实例时,要重复写,2实例与原型之间没有关系
var cat = {
    name:'name',
    color:'color'
}
var cat1 = {};
cat1.name = '';
cat1.color = '';

// 函数版 解决代码重复
function Cat(name, color) {
    return {
        name:name,
        color:color
    }
}
var cat1 = Cat('', '');

// 构造函数版 实例与原型有关联了,但浪费内存,因为要new,方法重复
function Cat(name, color) {
    this.name = name;
    this.color = color;
    this.eat = function() {};
}
var cat1 = new Cat('', '');

// Prototype版 js规定每个构造函数都有一个prototype属性,指向一个对象,
// 这个对象的所有属性和方法都会被构造函数的实例继承
function Cat(name, color) {
    this.name = name;
    this.color = color;
}
Cat.prototype.type = '';
Cat.prototype.eat = function() {};
