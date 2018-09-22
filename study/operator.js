// bang,bang you're boolean
// coerces obj to boolean, that is converting a value to boolean 
// if it was falsey(e.g. 0,null,undefined,etc) it will be false, otherwise true
// type 1: val.enabled = !!userId; // this faster than other
// type 2: val.enabled = userId == 0; 
console.log('number to boolean: ', Boolean(5), !5, !!5);
console.log('divide zero to boolean: ', Boolean(5/0), !!5/0, (!!5)/0);
console.log('!!false: ', !!false);
console.log('!!true: ', !!true);
console.log('!!0: ', !!0);
console.log('!!parseInt("foo"): ', !!parseInt("foo"));
console.log('!!1: ', !!1);
console.log('!!-1: ', !!-1);
console.log('!!"": ', !!"");
console.log('!!"foo": ', !!"foo");
console.log('!!undefined: ', !!undefined);
console.log('!!null: ', !!null);
console.log('!!{}: ', !!{});
console.log('!![]: ', !![]);


