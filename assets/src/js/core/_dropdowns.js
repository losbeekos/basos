app.dropdowns = {
    settings: {
        $el: $('.dropdown'),
        showClass: 'dropdown--show'
    },

    init: function () {
        app.dropdowns.settings.$el.on('click', function (event) {
            var $this = $(this);

            event.stopPropagation();

            if (app.settings.$html.hasClass('modernizr_touchevents') || $this.data('dropdownTrigger')) {
                app.dropdowns.settings.$el.not($this).removeClass(app.dropdowns.settings.showClass);
                $this.toggleClass(app.dropdowns.settings.showClass);
            }
        });

        app.settings.$body
            .on('keydown', function(event){
                if (event.keyCode === 27) {
                    $('.dropdown').removeClass('dropdown--show');
                }
            })
            .on('click', function () {
                $('.dropdown').removeClass('dropdown--show');
            });
    }
};