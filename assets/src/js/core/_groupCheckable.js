app.groupCheckable = {
	init: function () {

		// Master checkbox
		let checkableDelegate = checkable => app.groupCheckable.toggleGroup(checkable);

		document.querySelectorAll('[data-group-checkable]').forEach(checkable => {
			checkableDelegate(checkable);

			checkable.addEventListener('change', () => checkableDelegate(checkable));
		});

		// Target checkboxes
		let delegateCheckedCount = target => target.checked,
			delegateGroupCheckable = target => {
				let group = target.getAttribute('data-group-checkable-target'),
					targets = [].slice.call(document.querySelectorAll('[data-group-checkable-target=' + group + ']')),
					trigger = document.querySelector('[data-group-checkable=' + group + ']'),
					checkedCount = targets.filter(delegateCheckedCount).length;

				trigger.checked = targets.length === checkedCount ?  'checked' : '';
			},
			checkableEventHandler = target => {
				target.addEventListener('change', event => delegateGroupCheckable(target));
			};

		document.querySelectorAll('[data-group-checkable-target]').forEach(checkableEventHandler);
	},

	toggleGroup: function (checkable) {
		let group = document.querySelectorAll('[data-group-checkable-target=' + checkable.getAttribute('data-group-checkable') + ']'),
			delegateGroup = checkbox => checkbox.checked = checkable.checked === true ? 'checked' : '';

		// Check or uncheck boxes based on the checked state of the group checkbox.
		group.forEach(delegateGroup);
	}
};

/*doc
---
title: Group checkable
name: group_checkable
category: Javascript
---

```html_example
<input name="checkbox" type="checkbox" id="checkbox" data-group-checkable="checkable-example" /><label for="checkbox">Check all</label>
<ul class="form__input-list list-unstyled">
	<li><input name="checkbox" type="checkbox" id="checkbox1" data-group-checkable-target="checkable-example" /><label for="checkbox1">Checkbox</label></li>
	<li><input name="checkbox" type="checkbox" id="checkbox2" data-group-checkable-target="checkable-example" /><label for="checkbox2">Checkbox</label></li>
	<li><input name="checkbox" type="checkbox" id="checkbox3" data-group-checkable-target="checkable-example" /><label for="checkbox3">Checkbox</label></li>
</ul>
```

*/