app.jump = {
    settings: {
        speed: 300,
        $el: $('[data-jumpto]')
    },

    init: function () {
        var self = this;

        app.jump.settings.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this).attr('href'));
        });
    },

    to: function (_target) {
        var self = this,
            offsetTop = Math.round($(_target).offset().top);

        if (app.navBar.settings.$el.length > 0) {
            offsetTop = offsetTop - app.navBar.settings.$el.height();
        }

        app.settings.$htmlAndBody.animate({scrollTop: offsetTop}, app.jump.settings.speed);
    }
};