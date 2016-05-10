module.exports = {
	dev: {
		bsFiles: {
			src: [
				'<%= basos.dist %>/js/**/*.js',
				'<%= basos.dist %>/css/main.css',
				'<%= basos.dist %>/img/**/*',
				'<%= basos.dist %>/fonts/**/*',
				'*.html',
				'*.php',
				'*.tpl'
			]
		},

		options: {
			// ui: false,
			proxy: '0.0.0.0:9000',
			ghostMode: {
				clicks: false,
				location: false,
				forms: true,
				scroll: false
			},
			scrollProportionally: false,
			startPath: '/index.html'
		}
	}
}