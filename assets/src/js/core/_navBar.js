app.navBar = {
	settings: {
		el: document.getElementById('nav-bar'),
		trigger: document.getElementById('nav-bar-trigger'),
		navBarOffsetTop: null,
		navBarHeight: null,
		lastWindowScrollTop: 0,
		hideOnScroll: false,
		fixedClass: 'nav-bar--fixed',
		showClass: 'nav-bar--show',
		mobileShowClass: 'nav-bar--mobile-show',
		transformClass: 'nav-bar--transform',
		allwaysShowOnMobile: true,
		allwaysShowOnMobileClass: 'nav-bar--always-show-on-mobile'
	},

	init: function(_scrollTop){
		if (app.navBar.settings.el !== null) {
			app.navBar.resize();
			app.navBar.addClasses();
			app.navBar.scroller(_scrollTop);
			app.navBar.trigger();
		}
	},

	resize: function () {
		if (app.navBar.settings.el !== null) {
			app.navBar.settings.navBarOffsetTop = Math.round(app.navBar.settings.el.getBoundingClientRect().top),
			app.navBar.settings.navBarHeight = app.navBar.settings.el.offsetHeight;
		}
	},

	addClasses: function () {
		if (app.navBar.settings.el.classList.contains(app.navBar.settings.fixedClass)) {
			app.settings.container.style.marginTop = app.navBar.settings.navBarHeight + 'px';
		}

		if (window.scrollY >= (app.navBar.settings.navBarOffsetTop+1)) {
			app.navBar.settings.el.classList.add(app.navBar.settings.fixedClass);
		}

		if (app.navBar.settings.allwaysShowOnMobile) {
			app.navBar.settings.el.classList.add(app.navBar.settings.allwaysShowOnMobileClass);
		}
	},

	scroller: function (_scrollTop) {
		if (app.navBar.settings.el !== null) {
			if (_scrollTop >= app.navBar.settings.navBarOffsetTop) {
				app.navBar.settings.el.classList.add(app.navBar.settings.fixedClass);
				app.settings.container.style.marginTop = app.navBar.settings.navBarHeight + 'px';

				if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
					app.navBar.settings.el.classList.add(app.navBar.settings.transformClass);
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
			} else {
				app.navBar.settings.el.classList.remove(app.navBar.settings.fixedClass);
				app.settings.container.style.marginTop = 0 + 'px';

				if (app.navBar.settings.hideOnScroll) {
					app.navBar.settings.el.classList.remove(app.navBar.settings.transformClass);
				}
			}

			if (_scrollTop > app.navBar.settings.lastWindowScrollTop) {
				if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
					app.navBar.settings.el.classList.remove(app.navBar.settings.showClass);
				}
				if (!app.navBar.settings.hideOnScroll){
					app.navBar.settings.el.classList.remove(app.navBar.settings.showClass);
				}
			} else {
				if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
				if (!app.navBar.settings.hideOnScroll){
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
			}

			app.navBar.settings.lastWindowScrollTop = _scrollTop;
		}
	},

	trigger: function () {
		app.navBar.settings.trigger.addEventListener('click', function (event) {
			event.preventDefault();

			app.navBar.settings.el.classList.toggle(app.navBar.settings.mobileShowClass);
		});
	}
};