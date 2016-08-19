app.btnRipple = {
    settings: {
        ripple: true
    },

    init: function() {
        btns = app.btnRipple.settings.ripple === true ? document.querySelectorAll('.btn') : $('.btn--ripple');

        btns.forEach(function (btn) {
            btn.addEventListener('click', function (event) {
                var ripple = this.querySelector('.btn__ripple');
                
                if(ripple === null) {
                    ripple = app.btnRipple.appendRipple(btn);
                }

                this.classList.remove('btn--ripple-animate');

                var size = Math.max(this.offsetWidth, this.offsetHeight),
                    x = event.offsetX - size / 2,
                    y = event.offsetY - size / 2;

                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';

                this.classList.add('btn--ripple-animate');
            });
        });
    },

    appendRipple: function (btn) {
        var ripple = document.createElement('div');

        ripple.classList.add('btn__ripple');
        btn.appendChild(ripple);

        return ripple;
    }

};