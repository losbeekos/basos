app.jump = {
    init: function () {
        var self = this;

        app.settings.jump.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this).attr('href'));
        });
    },

    to: function (_target) {
        var self = this;

        app.settings.$htmlAndBody.animate({scrollTop: $(_target).offset().top}, app.settings.jump.speed);
    }
};