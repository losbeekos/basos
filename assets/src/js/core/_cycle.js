app.cycle = {
	settings: {
		$el: $('.cycle__wrap', '.cycle'),
		slides: '> .cycle__item',
		pager: '> .cycle__pager',
		prev: '> .cycle__prev',
		next: '> .cycle__next',
		pagerActiveClass: 'cycle__pager--active'
	},

	init: function(){
		if(app.cycle.settings.$el.length > 0){
			app.cycle.settings.$el
				.cycle({
					slides           : app.cycle.settings.slides,
					pager            : app.cycle.settings.pager,
					prev             : app.cycle.settings.prev,
					next             : app.cycle.settings.next,
					pagerActiveClass : app.cycle.settings.pagerActiveClass,
					pauseOnHover     : true,
					swipe            : true,
					log              : false,
					paused           : true,
					fx               : 'none'
				})
				.on('cycle-update-view', function (event, optionHash, slideOptionsHash, currentSlideEl) {
					if (optionHash.slideCount > 1) {
						$(this).addClass('cycle-active');
					}
				})
				.on('cycle-before', function () {
					// $('.thumbnail-grid__item').each(function () {
					//     $(this).removeClass('scrollspy--in-view').removeClass('animation-fadeIn');
					// });
				})
				.on('cycle-after', function () {
					// app.scrollSpy.init();
				});
		}
	}
};