app.tooltips = {
    tooltipTrigger: null,

    init: function () {
        var self = this;

        if (app.settings.tooltips.$el.length > 0) {
            app.settings.tooltips.$el.each(function () {
                var $tooltipTrigger = $(this);

                if ($tooltipTrigger.data('tooltipTrigger') === 'click') {
                    self.tooltipTrigger = 'click';
                } else {
                    self.tooltipTrigger = 'hover';
                }

                self.triggers($tooltipTrigger);
                self.appendContent($tooltipTrigger);
            });
        }
    },

    appendContent: function ($tooltipTrigger) {
        var self = this;

        $tooltipTrigger
            .append('<div class="' + app.settings.tooltips.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
            .removeAttr('title');

        self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip__content'));
    },

    triggers: function ($tooltipTrigger) {
        var self = this;

        if (self.tooltipTrigger === 'hover') {
            $tooltipTrigger.on({
                mouseenter: function () {
                    $(this).addClass(app.settings.tooltips.tooltipActiveClass);
                },
                mouseleave: function () {
                    $(this).removeClass(app.settings.tooltips.tooltipActiveClass);
                }
            });
        } else {
            $tooltipTrigger.on('click', function () {
                $(this).toggleClass(app.settings.tooltips.tooltipActiveClass);
            });
        }
    },

    calculatePosition: function ($tooltipTrigger, $tooltipContent) {
        var self = this,
            tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
            tooltipContentHeight = $tooltipContent.outerHeight();

        switch ($tooltipTrigger.data('tooltipPosition')) {
            case 'top':
                $tooltipContent.css({ bottom: tooltipTriggerHeight + app.settings.tooltips.arrowWidth });
                break;
            case 'right':
            case 'left':
                $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                break;
            case 'bottom':
                $tooltipContent.css({ top: tooltipTriggerHeight + app.settings.tooltips.arrowWidth });
                break;
        }
    }
};