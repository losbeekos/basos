app.affix = {
    settings: {
        $el: $('[data-affix]'),
        $navBar: $('#nav-bar, #off-canvas-nav-bar')
    },

    init: function (_scrollTop) {
        if (app.affix.settings.$el.length > 0) {
            app.affix.resizeWidth();
            app.affix.updateOffsetTop(_scrollTop);

            app.affix.settings.$el.each(function () {
                var $affix = $(this),
                    affixHeight = $affix.height();

                if (affixHeight < app.settings.windowHeight) {
                    app.settings.$window.on('scroll', function () {
                        app.affix.scroller($(this).scrollTop(), $affix);
                    });
                }
            });
        }
    },

    scroller: function (_scrollTop, _el) {
        var $container = _el.closest('.affix-container'),
            affixOffsetTop = _el.attr('data-affix-offset'),
            bottomTrigger = (($container.offset().top + $container.height()) - _el.height());

        if (app.navBar.settings.$el.length > 0) {
            bottomTrigger = (bottomTrigger - app.navBar.settings.navBarHeight);
        }

        if (_scrollTop >= affixOffsetTop && _scrollTop < bottomTrigger && _el.height() < $container.height()) {
            _el.addClass('affix--fixed').removeClass('affix--absolute');
            _el.css({top: app.affix.settings.$navBar.height()});
        } else if (_scrollTop >= bottomTrigger && _el.height() < $container.height()) {
            _el.removeClass('affix--fixed').addClass('affix--absolute');
        } else {
            _el.removeClass('affix--fixed').removeClass('affix--absolute');
            _el.css({top: 0});
        }
    },

    updateOffsetTop: function (_scrollTop) {
        app.affix.settings.$el.each(function () {
            var $this = $(this),
                affixHeight = $this.height(),
                offsetTop = $this.closest('.affix-container').offset().top;

            if (affixHeight < app.settings.windowHeight) {
                if (app.navBar.settings.$el.length > 0) {
                    offsetTop = (offsetTop - app.affix.settings.$navBar.height());
                }

                $this.attr('data-affix-offset', Math.round(offsetTop));
                app.affix.scroller(_scrollTop, $this);
            }
        });
    },

    resizeWidth: function (_el) {
        app.affix.settings.$el.each(function (){
            var $affix = $(this);
            
            $affix.removeClass('affix--fixed').removeClass('affix--absolute').removeAttr('style').width($affix.width());
        });
    }
};