app.parallax = {
    settings: {
        $el: $('.parallax'),
    },

    init: function (_scrollTop) {
        var self = this;

        if (app.parallax.settings.$el.length > 0 && app.settings.$html.hasClass('no-touch')) {
            app.parallax.settings.$el.each(function () {
                var $parallax = $(this),
                    parallaxData = $parallax.data(),
                    parallaxSpeed = parallaxData.parallaxSpeed,
                    parallaxOffset = $parallax.offset(),
                    parallaxOffsetTop = parallaxOffset.top;

                if (parallaxSpeed === undefined) {
                    parallaxSpeed = -4;
                }

                if (!helper.outView($parallax) && app.settings.$window.width() > 700) {
                    var yPos = (_scrollTop / parallaxSpeed);

                    if (parallaxOffsetTop > app.settings.windowHeight) {
                        yPos = (_scrollTop - Math.round(parallaxOffsetTop - app.settings.windowHeight)) / parallaxSpeed;
                    }

                    $parallax.find('.parallax__img').css({
                        'transform': 'translate3d(0, ' + yPos +  'px, 0)',
                        'transition': 'none'
                    });
                }

                $parallax.show();
            });
        }
    }
};