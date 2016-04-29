app.tooltips = {
    settings: {
        $el: $('.tooltip'),
        tooltipActiveClass: 'tooltip--active',
        tooltipContentClass: 'tooltip__content',
        arrowWidth: 8,
        tooltipTrigger: null
    },

    init: function () {
        if (app.tooltips.settings.$el.length > 0) {
            app.tooltips.settings.$el.each(function () {
                var $tooltipTrigger = $(this);

                if ($tooltipTrigger.data('tooltipTrigger') === 'click' || app.settings.$html.hasClass('touch')) {
                    app.tooltips.settings.tooltipTrigger = 'click';
                } else {
                    app.tooltips.settings.tooltipTrigger = 'hover';
                }

                app.tooltips.triggers($tooltipTrigger);
                app.tooltips.appendContent($tooltipTrigger);
            });
        }
    },

    appendContent: function ($tooltipTrigger) {
        $tooltipTrigger
            .append('<div class="' + app.tooltips.settings.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
            .removeAttr('title');

        app.tooltips.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip__content'));
    },

    triggers: function ($tooltipTrigger) {
        if (app.tooltips.settings.tooltipTrigger === 'hover') {
            $tooltipTrigger.on({
                mouseenter: function () {
                    $(this).addClass(app.tooltips.settings.tooltipActiveClass);
                },
                mouseleave: function () {
                    $(this).removeClass(app.tooltips.settings.tooltipActiveClass);
                }
            });
        } else {
            $tooltipTrigger.on('click', function () {
                $(this).toggleClass(app.tooltips.settings.tooltipActiveClass);
            });
        }
    },

    calculatePosition: function ($tooltipTrigger, $tooltipContent) {
        var tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
            tooltipContentHeight = $tooltipContent.outerHeight();

        switch ($tooltipTrigger.data('tooltipPosition')) {
            case 'top':
                $tooltipContent.css({ bottom: tooltipTriggerHeight + app.tooltips.settings.arrowWidth });
                break;
            case 'right':
            case 'left':
                $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                break;
            case 'bottom':
                $tooltipContent.css({ top: tooltipTriggerHeight + app.tooltips.settings.arrowWidth });
                break;
        }
    }
};