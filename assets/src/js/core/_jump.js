app.jump = {
	settings: {
		speed: 300
	},

	init: function () {
		document.querySelectorAll('[data-jumpto]').forEach(function (jumper) {
			jumper.addEventListener('click', function () {
				var extraOffset = 0;

				event.preventDefault();

				if (jumper.getAttribute('data-jumpto-extra-offset') !== undefined) {
					extraOffset = jumper.getAttribute('data-jumpto-extra-offset');
				}

				if (jumper.getAttribute('data-jumpto-speed') !== undefined) {
					app.jump.settings.speed = jumper.getAttribute('data-jumpto-speed');
				}

				app.jump.to(jumper.getAttribute('href'), extraOffset, app.jump.settings.speed);
			});
		});
	},

	to: function (_target, _extraOffset, _speed) {
		var offsetTop = Math.round(helper.getCoords(document.querySelector(_target)).top);

		_extraOffset === undefined ? 0 : '';

		if (app.navBar.settings.el !== null) {
			offsetTop = offsetTop - (app.navBar.settings.el.offsetHeight + _extraOffset);
		} else {
			offsetTop = offsetTop + _extraOffset;
		}

		app.settings.$htmlAndBody.animate({scrollTop: offsetTop}, _speed, function () {
			window.location.hash = _target;
		});
	}
};

/*doc
---
title: Jump
name: jump
category: Javascript
---

```html_example
<a href="#background" data-jumpto>Jump to background id</a>
```

*/