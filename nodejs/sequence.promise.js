
(new Promise((resolve, reject)=>{
	console.log('step 1');
	resolve('return-step-1');
}))
.then((data)=>{
	console.log(data);
	return new Promise((resolve,reject)=>{
		console.log('step 2');
		resolve('return-step-2');
	});
})
.then((data)=>{
	console.log(data);
	return new Promise((resolve, reject)=>{
		console.log('step 3');
		resolve('return-step-3');
	})
})
.then((data)=>{
	console.log(data);
})
.catch((e)=>{
	console.log('catch error', e);
});
