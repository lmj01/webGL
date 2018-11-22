
function lmjTimeout(duration) {
	return new Promise((resolve, reject)=>{
		setTimeout(resolve, duration);
	});
}

console.log('step 1', new Date().getTime());
lmjTimeout(5000)
.then(()=>{
	console.log('step 1 after 5s ', new Date().getTime());
})

console.log('step 2', new Date().getTime());
lmjTimeout(1000)
.then(()=>{
	console.log('step 2 after 1 ', new Date().getTime());
	return lmjTimeout(2000);
})
.then(()=>{
	console.log('step 2 after 1 after 2 ', new Date().getTime());
	return new Error('error');
})
.catch(err=>{
	console.log('step promise all ', new Date().getTime());
	return Promise.all([lmjTimeout(100), lmjTimeout(200)]);

})
