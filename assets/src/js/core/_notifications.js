app.notifications = {
	settings: {
		cookieLaw: {
			position: 'bottom',
			approveBtnText: 'ok, ik snap het',
			infoBtnShow: true,
			infoBtnLink: '/cookiewet',
			infoBtnText: 'meer informatie',
			notificationText: 'Wij gebruiken cookies om uw gebruikerservaring te verbeteren en statistieken bij te houden.'
		}
	},

	init: function () {
		var self = this;

		self.close();
		// self.cookieLaw.init(); // Uncomment if you need the notification
	},

	add: function (_target, _message, _size, _type) {
		$(_target).html('<div class="notification notification--' + _size + ' notification--' + _type + '"><div class="notification__text">' + _message + '</div></div>');
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
				helper.cookies.create('cookieNotification', 'approved', 365);
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
				cookieValue = helper.cookies.read('cookieNotification'),
				info = '';

			if (cookieValue !== 'approved' && navigator.CookiesOK === undefined) {
				app.settings.$html.attr('notification-cookie-position', app.notifications.settings.cookieLaw.position);

				if (app.notifications.settings.cookieLaw.infoBtnShow) {
					info = '<a class="btn btn--alpha btn--small" href="' + app.notifications.settings.cookieLaw.infoBtnLink + '">' + app.notifications.settings.cookieLaw.infoBtnText + '</a>';
				}

				var html = '<div id="notification-cookie" class="notification notification--alpha notification--cookie">'+
						   '<div class="notification__text">' + app.notifications.settings.cookieLaw.notificationText + '</div>'+
						   '<a class="btn btn--beta btn--small" data-notification-close>' + app.notifications.settings.cookieLaw.approveBtnText + '</a> '+ info +
						   '</div>';

				app.settings.$background.prepend(html);

				setTimeout(function () {
					app.settings.$html.addClass('notification-cookie-show');
				}, 0);
			}
		}
	}
};