// js的继承方法

function Animal() {
    this.species = '';
}

// 构造函数绑定 使用call或apply方法,将父对象的构造函数绑定在子对象上
function Cat(name,color) {
    Animal.apply(this.arguments);
    this.name = name;
    this.color = color;
}

// Prototype版
function Cat(name,color) {
    this.name = name;
    this.color = color;
}
Cat.prototype = new Animal();
Cat.prototype.constructor = Cat;

// 继承Prototype版
function Animal(){
}
Animal.prototype.species = '';
function Cat(name,color) {
    this.name = name;
    this.color = color;
}
Cat.prototype = Animal.prototype;
Cat.prototype.constructor = Cat;

// 利用空对象作中介
var F = function(){};
F.prototype = Animal.prototype;
Cat.prototype = new F();
Cat.prototype.constructor = Cat;
// or function
function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype; // 子对象可以直接调用父对象的方法
}
extend(Cat, Animal);
var cat1 = new Cat('','');

// 拷贝继承
function Animal(){}
Animal.prototype.species = '';
function extend2(Child, Parent) {
    var p = Parent.prototype;
    var c = Child.prototype;
    for (var i in p) {
        c[i] = p[i];
    }
    c.uber = p;
}
extend2(Cat, Animal);
var cat1 = new Cat('','');