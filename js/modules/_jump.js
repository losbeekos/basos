app.jump = {
    init: function () {
        var self = this;

        app.settings.jump.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this));
        });
    },

    to: function (_link) {
        var self = this;

        app.settings.$htmlAndBody.animate({scrollTop: $(_link.attr('href')).offset().top}, app.settings.jump.speed);
    }
};