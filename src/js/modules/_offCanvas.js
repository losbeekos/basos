app.offCanvas = {
    init: function () {

        app.settings.offCanvas.$link.on('click', function(event) {
            event.preventDefault();

            var href = window.location,
                linkHref = $(this).attr('href');

            app.offCanvas.hideLeftAndRight();

            setTimeout(function () {
                if (href !== linkHref) {
                    window.location = linkHref;
                }
            }, 400);
        });

        app.settings.$html.delegate(app.settings.offCanvas.toggleLeft, 'click', function(event) {
            app.offCanvas.toggleLeft();
        });

        app.settings.$html.delegate(app.settings.offCanvas.toggleRight, 'click', function(event) {
            app.offCanvas.toggleRight();
        });

        app.settings.$container.on('click', function () {
            app.offCanvas.hideLeftAndRight();
        });
    },

    hideLeftAndRight: function () {
        app.settings.$html
            .removeClass('off-canvas-show-left')
            .removeClass('off-canvas-show-right');
    },

    showLeft: function () {
        app.settings.$html.addClass('off-canvas-show-left');
    },

    hideLeft: function () {
        app.settings.$html.removeClass('off-canvas-show-left');
    },

    toggleLeft: function () {
        app.offCanvas.hideRight();
        app.settings.$html.toggleClass('off-canvas-show-left');
    },

    showRight: function () {
        app.settings.$html.addClass('off-canvas-show-right');
    },

    hideRight: function () {
        app.settings.$html.removeClass('off-canvas-show-right');
    },

    toggleRight: function () {
        app.offCanvas.hideLeft();
        app.settings.$html.toggleClass('off-canvas-show-right');
    }
};