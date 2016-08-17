helper.outView = function(el) {
	if (el instanceof jQuery) {
		el = el[0];
	}

	var rect = el.getBoundingClientRect();

	return (
		rect.bottom < 0 ||
		rect.top > document.body.clientHeight
	);
};