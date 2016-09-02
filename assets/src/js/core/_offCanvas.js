app.offCanvas = {
	settings: {
		toggleLeft: '#off-canvas-toggle-left',
		toggleRight: '#off-canvas-toggle-right',
		width: $('.off-canvas, .off-canvas-nav-bar').outerWidth(),
		$el: $('.off-canvas, .off-canvas-nav-bar'),
		$link: $('.off-canvas-nav__link, .off-canvas-nav-bar__link')
	},

	init: function () {

		app.offCanvas.settings.$link.on('click', function(event) {
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

		app.settings.$html.on('click', app.offCanvas.settings.toggleLeft, function(event) {
			app.offCanvas.toggleLeft();
		});

		app.settings.$html.on('click', app.offCanvas.settings.toggleRight, function(event) {
			app.offCanvas.toggleRight();
		});

		app.settings.$container.on('click', function () {
			app.offCanvas.hideLeftAndRight();
		});

		app.settings.$body
			.on('keydown', function(event){
				if (event.keyCode === 27) {
					app.offCanvas.hideLeftAndRight();
				}
			});
	},

	hideLeftAndRight: function () {
		app.settings.$html
			.removeClass('off-canvas-show-left')
			.removeClass('off-canvas-show-right')
			.removeClass('off-canvas-nav-bar-show-left')
			.removeClass('off-canvas-nav-bar-show-right');
	},

	showLeft: function () {
		app.settings.$html.addClass('off-canvas-show-left').addClass('off-canvas-nav-bar-show-left');
	},

	hideLeft: function () {
		app.settings.$html.removeClass('off-canvas-show-left').removeClass('off-canvas-nav-bar-show-left');
	},

	toggleLeft: function () {
		app.offCanvas.hideRight();
		app.settings.$html.toggleClass('off-canvas-show-left').toggleClass('off-canvas-nav-bar-show-left');
	},

	showRight: function () {
		app.settings.$html.addClass('off-canvas-show-right').addClass('off-canvas-nav-bar-show-right');
	},

	hideRight: function () {
		app.settings.$html.removeClass('off-canvas-show-right').removeClass('off-canvas-nav-bar-show-right');
	},

	toggleRight: function () {
		app.offCanvas.hideLeft();
		app.settings.$html.toggleClass('off-canvas-show-right').toggleClass('off-canvas-nav-bar-show-right');
	}
};