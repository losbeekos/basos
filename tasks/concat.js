module.exports = {
	app: {
		options: {
			sourceMap: false,
			// sourceMap: true,
			// sourceMapStyle: 'link'
		}, 

		src: [
			'<%= basos.src %>/js/polyfills/*.js',
			'<%= basos.src %>/js/_settings.js',
			'<%= basos.src %>/js/_mediaQueries.js',
			'<%= basos.src %>/js/helpers/*.js',
			'<%= basos.src %>/js/core/*.js',
			'<%= basos.src %>/js/app/*.js',
			'<%= basos.src %>/js/_init.js'
		],
		dest: '<%= basos.dist %>/js/app.js',
	},

	all: {
		src: [
			'bower_components/fastclick/lib/fastclick.js',
			'bower_components/fitvids/jquery.fitvids.js',
			'bower_components/parsleyjs/dist/parsley.js',
			'bower_components/parsleyjs/dist/i18n/nl.js',
			'bower_components/svg4everybody/dist/svg4everybody.js',
			'bower_components/rangeslider.js/dist/rangeslider.js',

			'<%= basos.dist %>/js/app.js'
		],
		dest: '<%= basos.dist %>/js/app.js',
	}
}