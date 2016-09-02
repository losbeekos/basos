app.leave = {
	init: function () {
		document.querySelectorAll('[type=submit]').forEach(function (el) {
			el.addEventListener('click', function () {
				app.leave.inActive();
			});
		});

		document.querySelectorAll('[data-leave-target], [data-leave-target] input:not(submit)').forEach(function (inputs) {
			inputs.addEventListener('change', function () {
				app.leave.active();
			});

			inputs.addEventListener('input', function () {
				app.leave.active();
			});
		});
	},

	active: function (_message) {
		if (_message === undefined) {
			_message = 'You didn\'t save your changes.';
		}

		window.onbeforeunload = function() {
			return _message;
		};
	},

	inActive: function () {
		window.onbeforeunload = undefined;
	}
};

/*doc
---
title: Leave
name: leave
category: Javascript
---

Show a message when leaving the page and form elements are edited.

## Seperate input
```html_example
<input type="text" data-leave-target />
```

## Entire form
```html_example
<form data-leave-target />
	<input type="text" />
	<input type="text" />
</form>
```

*/