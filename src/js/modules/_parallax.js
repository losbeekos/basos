app.parallax = {
    settings: {
        $el: $('.parallax'),
    },

    init: function (_scrollTop) {
        var self = this;

        if (app.parallax.settings.$el.length > 0 && app.settings.$html.hasClass('no-touch')) {
            app.parallax.settings.$el.each(function () {
                var $parallax = $(this),
                    parallaxOffset = $parallax.offset(),
                    parallaxOffsetTop = Math.round(parallaxOffset.top - app.settings.windowHeight);

                if (!helper.outView($parallax) && app.settings.$window.width() > 700) {
                    $parallax.find('.parallax__img').css({
                        'transform': 'translate3d(0, ' + (_scrollTop-parallaxOffsetTop)/4 +  'px, 0)',
                        'transition': 'none'
                    });
                }
            });
        }
    }
};