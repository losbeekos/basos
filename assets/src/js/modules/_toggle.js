app.toggle = {
    settings: {
        $el: $('[data-toggle]')
    },

    init: function () {
        app.toggle.settings.$el.on('click', function (event) {
            event.preventDefault();

            app.toggle.toggler($($(this).data('toggle')));
        });
    },

    toggler: function (_target) {
        _target.toggleClass('toggle--hide');
    }
};