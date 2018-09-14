// 测试调用
new Promise(function(resolve, reject) {
    let val = Math.floor(Math.random() * Math.floor(100));
    console.log('get random val is ', val);
    if (val % 2 == 0) {
        resolve("even");
    } else {
        reject("odd");
    }
}).then((val)=>{
    console.log('resolve ', val);
}, (val) => {
    console.log('reject ', val);
})