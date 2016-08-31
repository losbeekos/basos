app.accordion = {
	settings: {
		el: document.querySelectorAll('.accordion'),
		group: document.querySelectorAll('.accordion__group'),
		trigger: document.querySelectorAll('.accordion__trigger'),
		contentShowClass: 'accordion-content-show'
	},

	init: function () {
		if (app.accordion.settings.el.length > 0) {
			app.accordion.setGroupHeight();
			app.accordion.toggler();
			
			window.onresize = function() {
				app.accordion.setGroupHeight();
			};
		}
	},

	setGroupHeight: function () {
		let groupDelegate = group => {
			let groupContent = group.querySelector('.accordion__content');

			groupContent.setAttribute('style', '');

			let contentHeight = groupContent.offsetHeight;

			groupContent.setAttribute('data-accordion-content-height', contentHeight);
			group.classList.contains(app.accordion.settings.contentShowClass) ? groupContent.style.maxHeight = contentHeight : groupContent.style.maxHeight = 0;
		};
		
		app.accordion.settings.group.forEach(groupDelegate);
	},

	toggler: function () {
		let triggerEventHandler = trigger => {
			trigger.addEventListener('click', function () {
				var group = trigger.parentNode,
					content = trigger.nextElementSibling;

				if (group.classList.contains(app.accordion.settings.contentShowClass)) {
					app.accordion.hideGroup(content);
				} else {
					app.accordion.hideGroup(trigger);
					app.accordion.showGroup(trigger, content);
				}
			});
		};

		app.accordion.settings.trigger.forEach(triggerEventHandler);
	},

	showGroup: function (trigger, content) {
		content.style.maxHeight = trigger.nextElementSibling.getAttribute('data-accordion-content-height') + 'px';
		content.parentNode.classList.add(app.accordion.settings.contentShowClass);
	},

	hideGroup: function (trigger) {
		let shownItem = document.querySelector('.accordion-content-show'),
			content = document.querySelectorAll('.accordion__content'),
			contentDelegate = content => content.style.maxHeight = 0;

		if (shownItem === null)  {
			trigger.classList.add(app.accordion.settings.contentShowClass);
		} else {
			shownItem.classList.remove(app.accordion.settings.contentShowClass);
		}

		content.forEach(contentDelegate);
	}
};