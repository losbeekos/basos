app.delayedImageLoading = {
	settings: {
		el: '[data-delay-image-loading]'
	},

	init: function() {
		if (document.documentElement.classList.contains('modernizr_template') && document.querySelector(app.delayedImageLoading.settings.el) !== null) {
			let template = document.querySelector(app.delayedImageLoading.settings.el),
				parent = template.parentNode,
				contents = template.innerHTML;

			parent.removeChild(template);
			parent.innerHTML += contents;
		}
	}
};

/*doc
---
title: Delay image loading
name: delay_image_loading
category: Javascript
---

JavaScript method to delay the load of images and make the page respond faster especially on slow connections. 

Idea is kindly borrowed from [Christian Heilmann](https://www.christianheilmann.com/2015/09/08/quick-trick-using-template-to-delay-loading-of-images/).

```html_example
<ul class="list-unstyled">
	<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf" /></li>
	<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf" /></li>
	<template data-delay-image-loading>
		<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf?text=delayed" /></li>
		<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf?text=delayed" /></li>
	</template>
</ul>
```

*/