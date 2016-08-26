/**
 * Method of testing whether or not a DOM element matches a given selector. 
 * Formerly known (and largely supported with prefix) as matchesSelector.
 * Credit: https://github.com/jonathantneal/closest
 */

if (typeof Element.prototype.matches !== 'function') {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
		var element = this,
			elements = (element.document || element.ownerDocument).querySelectorAll(selector),
			index = 0;

		while (elements[index] && elements[index] !== element) {
			++index;
		}

		return Boolean(elements[index]);
	};
}