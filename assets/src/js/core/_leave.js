app.leave = {
    init: function () {
        app.settings.$body.on('click', '[type=submit]', function () {
            app.leave.inActive();
        });

        app.settings.$body.on('change input', '[data-leave-target], [data-leave-target] input:not(submit)', function () {
            app.leave.active();
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