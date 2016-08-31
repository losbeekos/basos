app.btnDropdown = {
	init: function() {
		// Dropdown toggler
		let toggleEventHandler = toggle => {
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
		};

		document.querySelectorAll('[data-btn-dropdown-toggle]').forEach(toggleEventHandler);

		// Do not close dropdown on dropdown content clicks
		let dropdownEventHandler = btn => {
			btn.addEventListener('click', function (event) {
				var allowProp = btn.getAttribute('data-btn-dropdown');

				if (allowProp !== 'allowPropagation') {
					event.stopPropagation();
				}
			});
		};

		document.querySelectorAll('.btn-dropdown__dropdown, .btn-dropdown__list').forEach(dropdownEventHandler);

		// Close all dropdowns on escape keydown
		let eventCloseDelegate = event => app.btnDropdown.closeOpenDropdown();

		document.onkeydown = function (event) {
			if (event.keyCode === 27) {
				eventCloseDelegate();
			}
		};

		// Close all dropdowns on body click
		document.body.addEventListener('click', function () {
			eventCloseDelegate();
		});
	},

	closeOpenDropdown: function () {
		let openDelegate = openDropdown => {
			openDropdown.classList.remove('btn-dropdown--open');
		};

		document.querySelectorAll('.btn-dropdown--open').forEach(openDelegate);
	}

};