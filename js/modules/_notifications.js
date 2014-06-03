app.notifications = {
    init: function () {
        var self = this;

        self.close();
        self.cookieLaw.init();
    },

    close: function () {
        var self = this;

        app.settings.$body.on('click', '[data-notification-close]', function (event) {
            event.preventDefault();

            var $close = $(this),
                $notification = $close.parent(),
                notificationId = $notification.attr('id');

            $notification.addClass('notification--close');

            if (notificationId === 'notification-cookie') {
                helper.cookies.create('basosCookieNotification', 'approved', 365);
            }

            setTimeout(function () {
                $notification.remove();
            }, 500);
        });
    },


    /*==========  Cookie law  ==========*/

    cookieLaw: {
        init: function () {
            var self = this,
                cookieValue = helper.cookies.read('basosCookieNotification'),
                info = '';

            if (cookieValue !== 'approved') {
                app.settings.$html.attr('notification-cookie-position', app.settings.notifications.cookieLaw.position);

                if (app.settings.notifications.cookieLaw.infoBtnShow) {
                    info = '<a class="btn btn--alpha btn--small" href="' + app.settings.notifications.cookieLaw.infoBtnLink + '">' + app.settings.notifications.cookieLaw.infoBtnText + '</a>';
                }

                var html = '<div id="notification-cookie" class="notification notification--alpha notification--cookie">'+
                           '<div class="notification__text">' + app.settings.notifications.cookieLaw.notificationText + '</div>'+
                           '<a class="btn btn--beta btn--small" data-notification-close>' + app.settings.notifications.cookieLaw.approveBtnText + '</a> '+ info +
                           '</div>';

                app.settings.$background.prepend(html);

                setTimeout(function () {
                    app.settings.$html.addClass('notification-cookie-show');
                }, 0);
            }
        }
    }
};