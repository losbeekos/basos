app.scrollSpy = {
	settings: {
		$el: $('[data-scrollspy]'),
		defaultClass: 'animation-bounceIn',
		repeat: true
	},

	init: function (_scrollTop, _windowHeight, _load) {
		var self = this,
			windowHeight = app.settings.$window.height();

		if (app.scrollSpy.settings.$el.length > 0) {
			app.scrollSpy.settings.$el.each(function (index) {
				var $this = $(this),
					elPositionTop = Math.round($this.offset().top),
					elHeight = $this.height(),
					inView = helper.inView($this),
					outView = helper.outView($this),
					partiallyInView = helper.partiallyInView($this),
					data = $this.data(),
					combinedClasses = (data.scrollspyClass === undefined) ? app.scrollSpy.settings.defaultClass : data.scrollspyClass;

				combinedClasses += ' scrollspy--in-view';

				if (app.settings.$html.hasClass('touch')) {
					$this.addClass(combinedClasses);
				} else {
					var hasCombinedClasses = $this.hasClass(combinedClasses),
						delay = (data.scrollspyDelay > 0) ? data.scrollspyDelay : 0;

					inView && !hasCombinedClasses ? setTimeout(function () { $this.addClass(combinedClasses); }, delay) : '';
					_load && partiallyInView && data.scrollspyPartiallyInView !== undefined ? setTimeout(function () { $this.addClass(combinedClasses); }, delay) : '';

					if (data.scrollspyRepeat !== undefined || app.scrollSpy.settings.repeat) {
						outView && hasCombinedClasses ?  $this.removeClass(combinedClasses) : '';
					}

					$this.outerHeight() > windowHeight ? $this.addClass(combinedClasses) : '';
				}
			});
		}
	}
};