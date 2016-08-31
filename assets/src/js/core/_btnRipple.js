app.btnRipple = {
	settings: {
		ripple: true
	},

	init: function() {
		let btns = app.btnRipple.settings.ripple === true ? document.querySelectorAll('.btn') : $('.btn--ripple'),
			btnEventHandler = btn => {
				btn.addEventListener('click', function (event) {
					let ripple = this.querySelector('.btn__ripple');
					
					if (ripple === null) {
						ripple = app.btnRipple.appendRipple(btn);
					}

					this.classList.remove('btn--ripple-animate');

					let size = Math.max(this.offsetWidth, this.offsetHeight),
						x = event.offsetX - size / 2,
						y = event.offsetY - size / 2;

					ripple.style.width = size + 'px';
					ripple.style.height = size + 'px';
					ripple.style.left = x + 'px';
					ripple.style.top = y + 'px';

					this.classList.add('btn--ripple-animate');
				});
			};

		btns.forEach(btnEventHandler);
	},

	appendRipple: function (btn) {
		let ripple = document.createElement('div');

		ripple.classList.add('btn__ripple');
		btn.appendChild(ripple);

		return ripple;
	}

};