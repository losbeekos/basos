app.scrollSpy = {
    settings: {
        $el: $('[data-scrollspy]'),
        defaultClass: 'animation-bounceIn',
        repeat: true
    },

    init: function () {
        var self = this,
            windowHeight = app.settings.$window.height();

        if (app.scrollSpy.settings.$el.length > 0 && app.settings.$html.hasClass('no-touch')) {
            app.scrollSpy.settings.$el.each(function () {
                var $this = $(this),
                    inView = helper.inView($this),
                    outView = helper.outView($this),
                    data = $this.data(),
                    combinedClasses = (data.scrollspyClass === undefined) ? app.scrollSpy.settings.defaultClass : data.scrollspyClass;

                combinedClasses += ' scrollspy--in-view';

                var hasCombinedClasses = $this.hasClass(combinedClasses),
                    delay = (data.scrollspyDelay > 0) ? data.scrollspyDelay : 0;

                inView && !hasCombinedClasses || data.scrollspyKickoff !== undefined ? setTimeout(function () { $this.addClass(combinedClasses); }, delay) : '';

                if (data.scrollspyRepeat !== undefined || app.scrollSpy.settings.repeat) {
                    outView && hasCombinedClasses ?  $this.removeClass(combinedClasses) : '';
                }

                $this.outerHeight() > windowHeight ? $this.addClass(combinedClasses) : '';
            });
        }
    }
};