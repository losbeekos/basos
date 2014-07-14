app.jump = {
    settings: {
        speed: 300,
        $el: $('[data-jumpto]'),
        $navBar: $('#nav-bar'),
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
            offsetTop = $(_target).offset().top;

        if (app.jump.settings.$navBar.length > 0) {
            offsetTop = offsetTop - app.jump.settings.$navBar.height();
        }

        app.settings.$htmlAndBody.animate({scrollTop: offsetTop}, app.jump.settings.speed);
    }
};