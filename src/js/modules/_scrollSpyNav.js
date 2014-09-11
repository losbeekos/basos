app.scrollSpyNav = {
    settings: {
        $el: $('[data-scrollspy-nav]')
    },

    init: function (_scrollTop) {
        var self = this,
            windowHeight = app.settings.$window.height();

        if (app.scrollSpyNav.settings.$el.length > 0) {
            app.scrollSpyNav.settings.$el.each(function () {
                var $this = $(this),
                    $target = $('#' + $this.data('scrollspyNav')),
                    targetTop = Math.round($target.position().top);

                if (app.navBar.settings.$el.length > 0) {
                    targetTop = targetTop - app.navBar.settings.$el.height();
                }

                if (_scrollTop >= targetTop) {
                    _scrollTop >= (targetTop + $target.outerHeight()) ? $this.removeClass('scrollspy-nav--active') : $this.addClass('scrollspy-nav--active');
                } else {
                    $this.removeClass('scrollspy-nav--active');
                }
            });
        }
    }
};