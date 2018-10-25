
const fs = require('fs');
const readline = require('readline');


fs.writeFile('helloworld.txt', 'hello world! is the content', function(err) {
	console.log(err);
})

var content = fs.readFileSync('./default_dental_curve');
//console.log(content.toString());

var ostream = fs.createWriteStream('test.js');

const rl = readline.createInterface({
	input: fs.createReadStream('default_dental_curve'),
	crlfDelay: Infinity
});
ostream.once('open', function(fd){
	ostream.write('let default_dental_curve=\"');
	var set = content.toString().split('\n');
	set.forEach((val)=>{
		ostream.write(val+',');
	});
	//console.log(set);
	//ostream.write(content.toString());
	ostream.write('\"\n');
});
/*
rl.on('line', (line)=>{
	ostream.write(line+'\\n');
});
ostream.write('\"\n');
*/
