app.btnDropdown = {
    init: function() {

        // Dropdown toggler
        document.querySelectorAll('[data-btn-dropdown-toggle]').forEach(function (toggle) {
            toggle.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();

                btnDropdown = this.closest('.btn-dropdown');

                if (btnDropdown.classList.contains('btn-dropdown--open')) {
                    btnDropdown.classList.remove('btn-dropdown--open');
                } else {
                    app.btnDropdown.closeOpenDropdown();
                    btnDropdown.classList.add('btn-dropdown--open');
                }
            });
        });

        // Do not close dropdown on dropdown content clicks
        document.querySelectorAll('.btn-dropdown__dropdown, .btn-dropdown__list').forEach(function (btn) {
            btn.addEventListener('click', function (event) {
                var allowProp = btn.getAttribute('data-btn-dropdown');

                if (allowProp !== 'allowPropagation') {
                    event.stopPropagation();
                }
            });
        });

        // Close all dropdowns on escape keydown
        document.onkeydown = function (event) {
            if (event.keyCode === 27) {
                app.btnDropdown.closeOpenDropdown();
            }
        };

        // Close all dropdowns on body click
        document.body.addEventListener('click', function () {
            app.btnDropdown.closeOpenDropdown();
        });
    },

    closeOpenDropdown: function () {
        document.querySelectorAll('.btn-dropdown--open').forEach(function (openDropdown) {
            openDropdown.classList.remove('btn-dropdown--open');
        });
    }

};