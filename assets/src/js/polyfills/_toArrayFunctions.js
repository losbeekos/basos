/**
 * Transform HTML collections and Nodes to arrays, so the methods are available.
 * @type {Array}
 */

let methods = ['forEach','filter'];

for (let n in methods) {
	let method = methods[n];

	if (typeof NodeList.prototype[method] !== 'function') {
		NodeList.prototype[method] = Array.prototype[method];
	}
}