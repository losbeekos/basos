app.btnDropdown = {
    init: function() {
        app.settings.$body.on('click', '[data-btn-dropdown-toggle]', function (event) {
            event.preventDefault();
            event.stopPropagation();

            var $this = $(this),
                $btnDropdown = $this.closest('.btn-dropdown');

            if ($btnDropdown.hasClass('btn-dropdown--open')) {
                $btnDropdown.removeClass('btn-dropdown--open');
            } else {
                $('.btn-dropdown--open').removeClass('btn-dropdown--open');
                $btnDropdown.addClass('btn-dropdown--open');
            }
        });

        app.settings.$body.on('keydown', function(event){
            if (event.keyCode === 27) {
                $('.btn-dropdown--open').removeClass('btn-dropdown--open');
            }
        });

        app.settings.$body.on('click', '.btn-dropdown__dropdown, .btn-dropdown__list', function (event) {
            var allowProp = $(this).attr("data-btn-dropdown");
            if (allowProp !== "allowPropagation") {
                event.stopPropagation();
            }
        });

        app.settings.$body.on('click', function () {
            $('.btn-dropdown--open').removeClass('btn-dropdown--open');
        });
    }

};