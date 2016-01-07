app.groupCheckable = {
    init: function () {
        $('[data-group-checkable]').each(function () {
            app.groupCheckable.toggleGroup($(this));
        });

        $('[data-group-checkable]').on('change', function () {
            app.groupCheckable.toggleGroup($(this));
        });

        $('[data-group-checkable-target]').on('change', function () {
            var $this = $(this),
                group = $this.attr('data-group-checkable-target'),
                $group = $('[data-group-checkable-target=' + group + ']'),
                $groupChecked = $('[data-group-checkable-target=' + group + ']:checked'),
                $trigger = $('[data-group-checkable=' + group + ']');

            $group.length === $groupChecked.length ? $trigger.prop('checked', true) : $trigger.prop('checked', false);
        });
    },

    toggleGroup: function ($this) {
        var $group = $('[data-group-checkable-target=' + $this.attr('data-group-checkable') + ']');

        $this.is(':checked') ? $group.prop('checked', true) : $group.prop('checked', false);
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