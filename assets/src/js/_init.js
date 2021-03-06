app.settings.$document.ready(function () {
	var $this = $(this),
		scrollTop = $this.scrollTop();

	app.settings.html.classList.remove('no-js');
	app.settings.html.classList.add('js');

	app.affix.init();
	app.svg.init();
	app.scrollSpyNav.init(scrollTop);
	app.fastClick.init();
	app.fitVids.init();
	app.navBar.init(scrollTop);
	app.dropdowns.init();
	app.formModules.init();
	app.jump.init();
	app.modal.init();
	app.tooltips.init();
	app.accordion.init();
	app.tabs.init();
	app.notifications.init();
	app.offCanvas.init();
	app.toggle.init();
	app.groupCheckable.init();
	app.leave.init();
	app.btnDropdown.init();
	app.btnRipple.init();
	app.googleMaps.init();

	//app.cycle.init();
	//app.fancybox.init();
	//app.navPrimary.init();

});

app.settings.$window.ready(function () {
	var $this = $(this),
		scrollTop = $this.scrollTop(),
		windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, true);
	app.equalize.init();
	app.delayedImageLoading.init();

	setTimeout(function () {
		app.responsiveImages.setBackgroundImage();
	}, 10);
});

app.settings.$window.on('scroll', function () {
	var $this = $(this),
		scrollTop = $this.scrollTop(),
		windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, false);
	app.scrollSpyNav.init(scrollTop);
	app.navBar.scroller(scrollTop);
	app.disableHover.init();
});

app.settings.$window.on('touchmove', function(){
	var $this = $(this),
		scrollTop = $this.scrollTop(),
		windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, false);
	app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {

	app.settings.$html.addClass('disable-transitions');

	if(this.resizeTo) {
		clearTimeout(this.resizeTo);
	}

	this.resizeTo = setTimeout(function() {
		var $this = $(this),
			scrollTop = $this.scrollTop(),
			windowHeight = $this.height();

		app.equalize.init();
		app.scrollSpy.init(scrollTop, windowHeight, true);
		app.scrollSpyNav.init(scrollTop);
		app.navBar.resize(scrollTop);
		app.navBar.scroller(scrollTop);
		app.responsiveImages.setBackgroundImage();

		app.settings.$html.removeClass('disable-transitions');
	}, 500);
});