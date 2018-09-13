
// 父类与子类的重载
function parent() {
    this.x = 1;
    this.y = 1;
    this.Demo = function() {
        console.log("parent:Demo", this.x, this.y)
    }
}
function son() {
    this.Demo = function() {
        son.prototype.Demo.apply(this, arguments);
        console.log("son::Demo", this.x, this.y);
    }
}
function grandson() {
    this.Demo = function() {
        grandson.prototype.Demo.apply(this, arguments);
        console.log("grandson::Demo", this.x, this.y);
    }
}
son.prototype = new parent();
grandson.prototype = new son();

var p1 = new parent();

console.log('son:');
var s1 = new son();
s1.x = 2;
s1.y = 3;
s1.Demo();

console.log('gradson:');
var g1 = new grandson();
g1.x = 4;
g1.y = 5;
g1.Demo();