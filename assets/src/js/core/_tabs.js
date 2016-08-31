app.tabs = {
	settings: {
		tab: document.querySelectorAll('.tab')
	},

	init: function () {
		let tabsEventHandler = tab => {
			tab.addEventListener('click', function (event) {
				var item = document.querySelector(tab.getAttribute('href')),
					content = item.closest('.tab-content');

				event.preventDefault();
				
				app.tabs.settings.tab.forEach(tab => tab.classList.remove('tab--active'));
				tab.classList.add('tab--active');

				content.querySelector('.tab-item--active').classList.remove('tab-item--active');
				item.classList.add('tab-item--active');
			});
		};

		app.tabs.settings.tab.forEach(tabsEventHandler);
	}
};