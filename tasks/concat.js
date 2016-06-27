module.exports = {
	app: {
		options: {
			sourceMap: true
		}, 

		src: [
			// Bower components
			'bower_components/fastclick/lib/fastclick.js',
			'bower_components/fitvids/jquery.fitvids.js',
			'bower_components/parsleyjs/dist/parsley.js',
			'bower_components/parsleyjs/dist/i18n/nl.js',
			'bower_components/svg4everybody/dist/svg4everybody.js',
			'bower_components/rangeslider.js/dist/rangeslider.js',

			// Peanuts
			// 'bower_components/jQuery.serializeObject/dist/jquery.serializeObject.min.js',

			// Basos
			'<%= basos.src %>/js/_settings.js',
			'<%= basos.src %>/js/_mediaQueries.js',
			'<%= basos.src %>/js/helpers/*.js',
			'<%= basos.src %>/js/modules/*.js',
			'<%= basos.src %>/js/_init.js'
		],
		dest: '<%= basos.dist %>/js/app.js',
	}
}