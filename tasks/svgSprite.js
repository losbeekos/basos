module.exports = {
	dev: {
		expand: true, // Doesn't work
		prefix: "svg-%s",
		cwd: '<%= basos.src %>/img/svg/',
		src: ['*.svg'],
		dest: '<%= basos.dist %>/img/',
		shape: {
			id: {
				separator: '__',
				pseudo: '~'
			}
		},
		options: {
			mode: {
				symbol: {
					dest: "",
					sprite: "sprite.svg"
				}
			}
		}
	}
}