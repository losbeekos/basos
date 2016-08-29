app.toggle = {
    settings: {
        el: document.querySelectorAll('[data-toggle]')
    },

    init: function () {
        app.toggle.settings.el.forEach(function (toggle) {
            toggle.addEventListener('click', function (event) {
                event.preventDefault();

                app.toggle.toggler(document.querySelector(this.getAttribute('data-toggle')));
            });
        });
    },

    toggler: function (_target) {
        _target.classList.toggle('toggle--hide');
    }
};