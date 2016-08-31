app.toggle = {
	settings: {
		el: document.querySelectorAll('[data-toggle]')
	},

	init: function () {
		let toggleEventHandler = toggle => {
			toggle.addEventListener('click', function (event) {
				event.preventDefault();

				app.toggle.toggler(document.querySelector(this.getAttribute('data-toggle')));
			});
		};

		app.toggle.settings.el.forEach(toggleEventHandler);
	},

	toggler: function (_target) {
		_target.classList.toggle('toggle--hide');
	}
};