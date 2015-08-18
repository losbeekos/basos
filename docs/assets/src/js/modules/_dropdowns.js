app.dropdowns = {
    settings: {
        $el: $('.dropdown'),
        showClass: 'dropdown--show'
    },

    init: function () {
        app.dropdowns.settings.$el.on('click', function () {
            var $this = $(this);

            if (app.settings.$html.hasClass('touch') || $this.data('dropdownTrigger')) {
                app.dropdowns.settings.$el.not($this).removeClass(app.dropdowns.settings.showClass);
                $this.toggleClass(app.dropdowns.settings.showClass);
            }
        });
    }
};