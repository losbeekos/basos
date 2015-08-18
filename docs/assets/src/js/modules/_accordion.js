app.accordion = {
    settings: {
        $el: $('.accordion'),
        $group: $('.accordion__group'),
        $trigger: $('.accordion__trigger'),
        contentShowClass: 'accordion-content-show'
    },

    init: function () {
        var self = this;

        if (app.accordion.settings.$el.length > 0) {
            self.setGroupHeight();
            self.toggler();
            self.forceMaxheight();
        }
    },

    setGroupHeight: function () {
        var self = this;

        app.accordion.settings.$group.each(function () {
            var $group = $(this),
                $groupContent = $group.find('.accordion__content');

            $groupContent.removeAttr('style');

            var contentHeight = $groupContent.height();

            $groupContent.attr('data-accordion-content-height', contentHeight);

            if ($group.hasClass(app.accordion.settings.contentShowClass)) {
                $groupContent.css({'max-height': contentHeight});
            } else {
                $groupContent.css({'max-height': 0});
            }
        });
    },

    toggler: function () {
        var self = this;

        app.accordion.settings.$trigger.on('click', function () {
            var $trigger = $(this),
                $group = $trigger.parent(),
                $content = $trigger.next();

            if (!$group.hasClass(app.accordion.settings.contentShowClass)) {
                self.hideGroup($trigger.closest('.accordion').find('.accordion__content'));
                self.showGroup($trigger, $content);
            } else {
                self.hideGroup($content);
            }
        });
    },

    showGroup: function ($trigger, $content) {
        var self = this;

        $content
            .css({'max-height': $trigger.next().data('accordionContentHeight')})
            .parent()
            .addClass(app.accordion.settings.contentShowClass);
    },

    hideGroup: function ($content) {
        var self = this;

        $content
            .css({'max-height': 0})
            .parent()
            .removeClass(app.accordion.settings.contentShowClass);
    },

    forceMaxheight: function () {
        var self = this;

        app.settings.$window.resize(function() {
            self.setGroupHeight();
        });
    }
};