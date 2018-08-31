// AMD-Asynchronous Module Definition异步模块定义,浏览器端模块化的规范
// 模块将被异步加载,模块加载不影响后面语句的运行,所有依赖某些模块的语句都放置
// 在回调函数中

// 作为一个规范,只需要定义其语法API,而不关心其实现
/*
define(
    [module-name?],//optional
    [array-of-dependencies?],//optional
    [module-factory-or-object]
);
即define(id?,dependencies?,factory);
*/
define(
    "exModule",
    ["foo", "bar"],
    function (foo, bar) {
        var exModule = {
            exFunc: function() {
                console.log('example function');
            }
        }
        return exModule;
    }
);
// require方法
// require([module], callback);
require(['math'], function(math) {
    math.add(2,3);
});

// CommonJS是服务器端的规范,一个单独的文件就是一个模块,每一个模块都是一个单独的作用域,
// 除非定义为global对象的属性,否则无法被其他模块读取,输出模块变量最好是使用module.exports对象
// (1)example one
// file lib.js
function log(arg) {
    console.log(arg);
}
exports.log = log;
// file app.js 
var lib = require('./lib');
function foo() {
    lib.log('log-message');
}
exports.foo = foo;
// (2)example two
module.exports = function() {
    console.log('some module')
};

// 对象方法,把模块写成一个对象,所有的模块成员都放到对象里面
var module = {
    func1: function() {
        console.log('function 1');
    },
    func2: function() {
        console.log('function 2');
    }
}
module.func1();
module.func2();

// 通过闭包来封装私有属性和方法, 模拟类的概念
var exModule = (function () {
    var privateVar = 0;
    var privateFunc = function(arg) {
        console.log(arg);
    }
    return {
        publicVar : 'foo',
        publicFunc : function(arg) {
            privateVar++;
            privateFunc(arg);
        }
    };
})()

