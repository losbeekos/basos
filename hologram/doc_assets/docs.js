$(function () {
	
});

var searchLastWindowScrollTop = 0;

app.settings.$window.on('scroll', function () {
	var scrollTop = $(this).scrollTop();

	console.log(scrollTop);

	if (scrollTop > searchLastWindowScrollTop) {
		$('html').addClass('hide-search');
	} else {
		$('html').removeClass('hide-search');
	}

	searchLastWindowScrollTop = scrollTop;
});