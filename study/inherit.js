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
