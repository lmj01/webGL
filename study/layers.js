// 测试
function Layers() {
    	this.mask = 1 | 0;
}

Object.assign(Layers.prototype, {
	set: function(channel) {
		this.mask = 1 << channel | 0;
	},
	enable: function(channel) {
		this.mask |= 1 << channel | 0;
	},
	toggle: function(channel) {
		this.mask ^= 1 << channel | 0;
	},
	disable: function(channel) {
		this.mask &= ~(1 << channel | 0);
	},
 	test: function(layers) {
		return (this.mask & layers.mask) !== 0;
	}
})

let l1 = new Layers();
let l2 = new Layers();
console.log('default value: ', l1.mask, l2.mask, l1.test(l2));

l1.set(1);
l2.set(2);
console.log('l1:1,l2:2: ', l1.mask, l2.mask, l1.test(l2));
l2.disable(2);
console.log('after l2 disable: ', l1.mask, l2.mask, l1.test(l2));

