module.exports = {
	files: [
		'<%= basos.src %>/js/*.js',
		'<%= basos.src %>/js/polyfills/*.js',
		'<%= basos.src %>/js/helpers/*.js',
		'<%= basos.src %>/js/app/*.js',
		'<%= basos.src %>/js/core/*.js',
		'!<%= basos.src %>/js/app.js'
	],

	options: {
		expr: true,
		node: true,
		browser: true,
		esnext: true,
		camelcase: false,
		curly: true,
		eqeqeq: true,
		immed: true,
		indent: 4,
		latedef: true,
		newcap: true,
		noarg: true,
		regexp: true,
		undef: false,
		unused: false,
		strict: false,
		trailing: true,
		smarttabs: true,
		globals: {
			app: true,
			helper: true,
			document: true,
			window: true,
			FastClick: true,
			Modernizr: true,
			url: true,
			$: false,
			jQuery: false,
			console: true,
			module: true
		}
	}
}