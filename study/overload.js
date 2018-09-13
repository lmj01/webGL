
// 父类与子类的重载
function parent() {
    this.initialize = function() {
        this.x = 1;
        this.y = 1;
        console.log('parent initial');
    }
    this.initialize()
}
function son() {
    this.initialize = function() {
        this.hehe = "hehe";
        this.haha = "haha";
        son.prototype.initialize.apply(this, arguments);
        console.log('son initial');
    }
    this.Demo = function(x, y) {
        console.log("son::Demo", x, y);
    }
    this.initialize()
}
function grandson() {
    this.initialize = function() {
        this.kk = "kk";
        son.prototype.initialize.apply(this, arguments);
        console.log('grandson initial');
    }
    this.Demo = function(x, y) {
        grandson.prototype.Demo.apply(this, arguments);
        console.log("grandson::Demo", x, y);
    }
    this.initialize()
}
son.prototype = new parent();
grandson.prototype = new son();

var p1 = new parent();
p1.initialize();
console.log('son:');
var s1 = new son();
s1.initialize();
s1.Demo(1,2);
console.log('gradson:');
var g1 = new grandson();
g1.initialize();
g1.Demo(2,3);