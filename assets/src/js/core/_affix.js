app.affix = {
    settings: {
        el: document.querySelectorAll('[data-affix]'),
        navBar: document.querySelector('#nav-bar, #off-canvas-nav-bar')
    },

    init: function (_scrollTop) {
        if (app.affix.settings.el.length > 0) {
            app.affix.resizeWidth();
            app.affix.updateOffsetTop(_scrollTop);

            app.affix.settings.el.forEach(function (affix) {
                var affixHeight = affix.offsetHeight;

                if (affixHeight < app.settings.windowHeight) {
                    window.onscroll = function () {
                        app.affix.scroller(this.scrollY, affix);
                    };
                }
            });

            window.onresize = function () {
                app.affix.resizeWidth();
            };
        }
    },

    scroller: function (_scrollTop, _el) {
        var $container = $(_el).closest('.affix-container'),
            affixOffsetTop = _el.getAttribute('data-affix-offset'),
            bottomTrigger = (($container.offset().top + $container.height()) - _el.offsetHeight);

        if (app.navBar.settings.$el.length > 0 && app.navBar.settings.$el.hasClass('app nav-bar--fixed')) {
            bottomTrigger = (bottomTrigger - app.navBar.settings.navBarHeight);
        }

        if (_scrollTop >= affixOffsetTop && _scrollTop < bottomTrigger && _el.offsetHeight < container.offsetHeight) {
            _el.classList.add('affix--fixed');
            _el.classList.remove('affix--absolute');

             app.navBar.settings.$el.hasClass('app nav-bar--fixed') ? _el.style.top = app.affix.settings.navBar.offsetHeight : _el.style.top = 0;
        } else if (_scrollTop >= bottomTrigger && _el.offsetHeight < container.offsetHeight) {
            _el.classList.remove('affix--fixed');
            _el.classList.add('affix--absolute');
        } else {
            _el.classList.remove('affix--fixed');
            _el.classList.remove('affix--absolute');
            _el.style.top = 0;
        }
    },

    updateOffsetTop: function (_scrollTop) {
        app.affix.settings.el.forEach(function (affix) {
            var affixHeight = affix.offsetHeight,
                offsetTop = $(affix).closest('.affix-container').offset().top;

            if (affixHeight < app.settings.windowHeight) {
                if (app.navBar.settings.$el.length > 0 && app.navBar.settings.$el.hasClass('app nav-bar--fixed')) {
                    offsetTop = (offsetTop - app.affix.settings.navBar.outerHeight);
                }

                affix.setAttribute('data-affix-offset', Math.round(offsetTop));
                app.affix.scroller(_scrollTop, affix);
            }
        });
    },

    resizeWidth: function () {
        app.affix.settings.el.forEach(function (affix) {
            affix.classList.remove('affix--fixed');
            affix.classList.remove('affix--absolute');
            affix.style.top = '';
            affix.style.width = '';
            affix.style.width = affix.offsetWidth + 'px';
        });
    }
};