function lmjReg() {
    this.count = 0;
    this.total = 0;
}
lmjReg.prototype.run1 = function(str) {
    if (/.y/.test('my')) {
        console.log('pass');
        this.count++;  
    } else {
        console.log('reject');
    }
    this.total++;
}

lmjReg.prototype.run2 = function(str) {
    if (/\d/.test(str) && /[0-9]/.test(str)) {
        console.log('pass');
        this.count++;
    } else {
        console.log('reject')
    }    
    this.total++;
}

lmjReg.prototype.run3 = function(str) {
    if (/\D/.test(str) && /[^0-9]/.test(str)) {
        console.log('pass');
        this.count++;
    } else {
        console.log('reject')
    }    
    this.total++;
}

// 任意单个字符
let lmj = new lmjReg();
lmj.run1('my');
lmj.run2('B2');
lmj.run3('B2');
console.log('run result:', lmj.count, lmj.total);


