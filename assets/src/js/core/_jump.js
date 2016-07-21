app.jump = {
    settings: {
        speed: 300
    },

    init: function () {
        app.settings.$body.on('click', '[data-jumpto]', function (event) {
            var $this = $(this),
                data = $this.data(),
                extraOffset = 0;

            event.preventDefault();

            if (data.jumptoExtraOffset !== undefined) {
                extraOffset = data.jumptoExtraOffset;
            }

            if (data.jumptoSpeed !== undefined) {
                app.jump.settings.speed = data.jumptoSpeed;
            }

            app.jump.to($(this).attr('href'), extraOffset, app.jump.settings.speed);
        });
    },

    to: function (_target, _extraOffset, _speed) {
        var offsetTop = Math.round($(_target).offset().top);

        _extraOffset === undefined ? 0 : '';

        if (app.navBar.settings.$el.length > 0) {
            offsetTop = offsetTop - (app.navBar.settings.$el.height() + _extraOffset);
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