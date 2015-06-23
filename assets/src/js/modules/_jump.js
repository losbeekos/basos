app.jump = {
    settings: {
        speed: 300
    },

    init: function () {
        app.settings.$body.on('click', '[data-jumpto]', function (event) {
            event.preventDefault();

            app.jump.to($(this).attr('href'), 0);
        });
    },

    to: function (_target, _extraOffset) {
        var offsetTop = Math.round($(_target).offset().top);

        _extraOffset === undefined ? 0 : '';

        if (app.navBar.settings.$el.length > 0) {
            offsetTop = offsetTop - (app.navBar.settings.$el.height() + _extraOffset);
        }

        app.settings.$htmlAndBody.animate({scrollTop: offsetTop}, app.jump.settings.speed);
    }
};