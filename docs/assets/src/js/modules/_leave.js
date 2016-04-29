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
            _message = 'U heeft wijzigingen aangebracht en nog niet opgeslagen.';
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

*/