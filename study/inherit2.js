// 非构造函数的继承方式
var Chinese = {
    nation:''
}
var Doctor = {
    career:''
}
// 两个普通的对象,如何继承关系了?

// object()方法:json发明人Douglas Crockford提出了一个object函数
function object(o) {
    function F() {}
    F.prototype = o;
    return new F();
}
var Doctor = object(Chinese);
Doctor.career = '';
console.log(Doctor.nation);

// 浅拷贝 仅拷贝基本类型的数据 早期的Jquery的继承方式
function extendCopy(p) {
    var c = {};
    for (var i in p) {
        c[i] = p[i];
    }
    c.uber = p;
    return c;
}

// 深拷贝 递归调用浅拷贝, 现在Jquery使用的继承方法
function deepCopy(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}