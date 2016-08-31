app.dropdowns = {
	settings: {
		el: document.querySelectorAll('.dropdown'),
		showClass: 'dropdown--show'
	},

	init: function () {
		if (app.dropdowns.settings.el.length > 0) {
			let dropdownDelegate = dropdown => dropdown.addEventListener('click', function (event) {
				event.stopPropagation();

				if (document.documentElement.classList.contains('modernizr_touchevents') || this.getAttribute('data-dropdown-trigger')) {
					this.classList.toggle(app.dropdowns.settings.showClass);
				}
			});

			app.dropdowns.settings.el.forEach(dropdownDelegate);

			document.body.onkeydown = function (event) {
				if (event.keyCode === 27) {
					app.dropdowns.closeAllDropdowns();
				}
			};

			document.body.onclick = function (event) {
				app.dropdowns.closeAllDropdowns();
			};
		}
	},

	closeAllDropdowns: function () {
		if (app.dropdowns.settings.el.length > 0) {
			let closeDelegate = dropdown => dropdown.classList.remove('dropdown--show');

			document.querySelectorAll('.dropdown').forEach(closeDelegate);
		}
	}
};