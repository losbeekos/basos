app.jump = {
    settings: {
        $el: $('[data-jumpto]'),
        speed: 300
    },

    init: function () {
        var self = this;

        app.jump.settings.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this).attr('href'));
        });
    },

    to: function (_target) {
        var self = this;

        app.settings.$htmlAndBody.animate({scrollTop: $(_target).offset().top}, app.jump.settings.speed);
    }
};