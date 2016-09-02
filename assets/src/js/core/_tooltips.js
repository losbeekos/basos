app.tooltips = {
	settings: {
		el: document.querySelectorAll('.tooltip'),
		tooltipActiveClass: 'tooltip--active',
		tooltipContentClass: 'tooltip__content',
		arrowWidth: 8,
		tooltipTrigger: null
	},

	init: function () {
		if (app.tooltips.settings.el.length > 0) {
			let delegate = el => {
				if (el.getAttribute('data-tooltip-trigger') === 'click' || document.documentElement.classList.contains('modernizr_touchevents')) {
					app.tooltips.settings.tooltipTrigger = 'click';
				} else {
					app.tooltips.settings.tooltipTrigger = 'hover';
				}

				app.tooltips.triggers(el);
				app.tooltips.appendContent(el);
			};

			app.tooltips.settings.el.forEach(delegate);
		}
	},

	appendContent: function (tooltipTrigger) {
		let content = document.createElement('div');

		content.classList.add(app.tooltips.settings.tooltipContentClass);
		content.innerHTML = tooltipTrigger.getAttribute('title');

		tooltipTrigger.appendChild(content);
		tooltipTrigger.setAttribute('title', '');
		app.tooltips.calculatePosition(tooltipTrigger, tooltipTrigger.querySelector('.tooltip__content'));
	},

	triggers: function (tooltipTrigger) {
		if (app.tooltips.settings.tooltipTrigger === 'hover') {
			tooltipTrigger.addEventListener('mouseover', function () {
				this.classList.add(app.tooltips.settings.tooltipActiveClass);
			});

			tooltipTrigger.addEventListener('mouseout', function () {
				this.classList.remove(app.tooltips.settings.tooltipActiveClass);
			});
		} else {
			tooltipTrigger.addEventListener('click', function () {
				this.classList.toggle(app.tooltips.settings.tooltipActiveClass);
			});
		}
	},

	calculatePosition: function (tooltipTrigger, tooltipContent) {
		let position = tooltipTrigger.offsetHeight + app.tooltips.settings.arrowWidth + 'px';

		switch (tooltipTrigger.getAttribute('data-tooltip-position')) {
			case 'top':
				tooltipContent.style.bottom = position;
				break;
			case 'bottom':
				tooltipContent.style.top = position;
				break;
		}
	}
};