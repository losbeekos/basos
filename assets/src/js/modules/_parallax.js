app.parallax = {
    settings: {
        $el: $('.parallax'),
    },

    init: function (_scrollTop) {
        var self = this;

        if (app.parallax.settings.$el.length > 0) {
            app.parallax.settings.$el.each(function () {
                var $parallax = $(this),
                    parallaxData = $parallax.data(),
                    parallaxSpeed = parallaxData.parallaxSpeed,
                    parallaxOffset = $parallax.offset(),
                    parallaxOffsetTop = parallaxOffset.top,
                    $img = $parallax.find('.parallax__img');

                if (parallaxSpeed === undefined) {
                    parallaxSpeed = -4;
                }

                if (Modernizr.mq(app.mediaQueries.alpha)) {
                    $img.removeAttr('style');
                }

                console.log(app.settings.$html.hasClass('no-touch'));

                if (!helper.outView($parallax) && Modernizr.mq(app.mediaQueries.betaAndUp) && app.settings.$html.hasClass('no-touch')) {
                    var yPos = (_scrollTop / parallaxSpeed);

                    if (parallaxOffsetTop > app.settings.windowHeight) {
                        yPos = (_scrollTop - Math.round(parallaxOffsetTop - app.settings.windowHeight)) / parallaxSpeed;
                    }

                    $img.css({
                        'transform': 'translate3d(0, ' + yPos +  'px, 0)',
                        'transition': 'none'
                    });
                }

                $parallax.show();
            });
        }
    }
};