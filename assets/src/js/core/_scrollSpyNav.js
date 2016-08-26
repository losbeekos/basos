app.scrollSpyNav = {
    settings: {
        $el: $('[data-scrollspy-nav]'),
        navLength: ($('[data-scrollspy-nav]').length-1),
        currentNav: 0
    },

    init: function (_scrollTop) {
        var self = this,
            windowHeight = app.settings.$window.height();

        if (app.scrollSpyNav.settings.$el.length > 0) {
            app.scrollSpyNav.settings.$el.each(function () {
                var $this = $(this),
                    $target = $($this.attr('href')),
                    targetTop = Math.round($target.position().top),
                    $next = $this.parent().next().find('[data-jumpto-extra-offset]'),
                    nextTop = app.settings.$document.height();

                if (app.navBar.settings.el.length > 0) {
                    targetTop = targetTop - app.navBar.settings.el.offsetHeight;
                }

                $next.length === 0 ? nextTop = app.settings.$document.height() : nextTop = $next.position().top;

                if (_scrollTop >= targetTop) {
                    $('.scrollspy-nav--active').not($this).removeClass('scrollspy-nav--active');
                    $this.addClass('scrollspy-nav--active');
                }
            });

            app.scrollSpyNav.settings.$el.parent().each(function (index) {
                var $item = $(this);

                if (_scrollTop === (app.settings.$document.height()-windowHeight)) {
                    $('.scrollspy-nav--active').removeClass('scrollspy-nav--active');
                    app.scrollSpyNav.settings.$el.parent().eq(app.scrollSpyNav.settings.navLength).find('[data-scrollspy-nav]').addClass('scrollspy-nav--active');
                }
            });
        }
    }
};