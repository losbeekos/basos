app.disableHover = {
	timer: null,

	init: function () {
		clearTimeout(app.disableHover.timer);

		if (!document.body.classList.contains('disable-hover')) {
			document.body.classList.add('disable-hover');
		}

		app.disableHover.timer = setTimeout(function(){
			document.body.classList.remove('disable-hover');
		}, 100);
	}
};

/*doc
---
title: Disable hover
name: disable_hover
category: Javascript
---

A disable hover (.disable-hover) class is added to the body. 
This class prevents pointer events so there won't be any hover effect repaints, just the repaints for scrolling. This results in a better scrolling performance.

*/