app.dropdowns = {
    settings: {
        el: document.querySelectorAll('.dropdown'),
        showClass: 'dropdown--show'
    },

    init: function () {
        app.dropdowns.settings.el.forEach(dropdown => app.dropdowns.clickEvent(dropdown));

        document.body.onkeydown = function (event) {
            if (event.keyCode === 27) {
                app.dropdowns.closeAllDropdowns();
            }
        };

        document.body.onclick = function (event) {
            app.dropdowns.closeAllDropdowns();
        };
    },

    clickEvent: function (dropdown) {
        dropdown.addEventListener('click', function (event) {
            event.stopPropagation();

            if (document.documentElement.classList.contains('modernizr_touchevents') || this.getAttribute('data-dropdown-trigger')) {
                this.classList.toggle(app.dropdowns.settings.showClass);
            }
        });
    },

    closeAllDropdowns: function () {
        document.querySelectorAll('.dropdown').forEach(function (dropdown) {
            dropdown.classList.remove('dropdown--show');
        });
    }
};