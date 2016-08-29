app.groupCheckable = {
    settings: {
        el: document.querySelectorAll('[data-group-checkable')
    },
    init: function () {
        app.groupCheckable.settings.el.forEach(function (checkable) {
            app.groupCheckable.toggleGroup(checkable);

            checkable.addEventListener('change', function () {
                app.groupCheckable.toggleGroup(checkable);
            });
        });

        document.querySelectorAll('[data-group-checkable-target]').forEach(function (target) {
            target.addEventListener('change', function () {
                var group = target.getAttribute('data-group-checkable-target'),
                    targets = document.querySelectorAll('[data-group-checkable-target=' + group + ']'),
                    trigger = document.querySelector('[data-group-checkable=' + group + ']'),
                    checked = 0;

                targets.forEach(function (target) {
                    if (target.checked === true) {
                        checked = checked+1;
                    }
                });

                targets.length === checked ? trigger.checked = 'checked' : trigger.checked = '';
            });
        });
    },

    toggleGroup: function (checkable) {
        var group = document.querySelectorAll('[data-group-checkable-target=' + checkable.getAttribute('data-group-checkable') + ']');

        group.forEach(function (checkbox) {
            checkable.checked ? checkbox.checked = 'checked' : checkbox.checked = '';
        });
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