app.navBar = {
    settings: {
        $el: $('#nav-bar'),
        $trigger: $('#nav-bar-trigger'),
        navBarOffsetTop: null,
        navBarHeight: null,
        lastWindowScrollTop: 0,
        hideOnScroll: false,
        fixedClass: 'nav-bar--fixed',
        showClass: 'nav-bar--show',
        mobileShowClass: 'nav-bar--mobile-show',
        allwaysShowOnMobile: true,
        allwaysShowOnMobileClass: 'nav-bar--always-show-on-mobile'
    },

    init: function(_scrollTop){
        if (app.navBar.settings.$el.length > 0) {
            app.navBar.settings.navBarOffsetTop = app.navBar.settings.$el.offset().top,
            app.navBar.settings.navBarHeight = app.navBar.settings.$el.height();

            app.navBar.addClasses();
            app.navBar.scroller(_scrollTop);
            app.navBar.trigger();
        }
    },

    addClasses: function () {
        if (app.settings.$html.hasClass('no-csssticky')) {
            if (app.navBar.settings.$el.hasClass(app.navBar.settings.fixedClass)) {
                app.settings.$container.css({'padding-top': app.navBar.settings.navBarHeight});
            }

            if (app.settings.$window.scrollTop() >= (app.navBar.settings.navBarOffsetTop+1)) {
                app.navBar.settings.$el.addClass(app.navBar.settings.fixedClass);
            }
        }

        if (app.navBar.settings.allwaysShowOnMobile) {
            app.navBar.settings.$el.addClass(app.navBar.settings.allwaysShowOnMobileClass);
        }
    },

    scroller: function (_scrollTop) {
        if (_scrollTop >= app.navBar.settings.navBarOffsetTop) {
            app.navBar.settings.$el.addClass(app.navBar.settings.fixedClass);

            if (app.settings.$html.hasClass('no-csssticky')) {
                app.settings.$container.css({'padding-top': app.navBar.settings.navBarHeight});
            }

            if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
                app.navBar.settings.$el.addClass('nav-bar--transform');
                app.navBar.settings.$el.addClass(app.navBar.settings.showClass);
            }
        } else {
            app.navBar.settings.$el.removeClass(app.navBar.settings.fixedClass);

            if (app.settings.$html.hasClass('no-csssticky')) {
                app.settings.$container.css({'padding-top': 0});
            }

            if (app.navBar.settings.hideOnScroll) {
                app.navBar.settings.$el.removeClass('nav-bar--transform');
            }
        }

        if (_scrollTop > app.navBar.settings.lastWindowScrollTop) {
            if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
                app.navBar.settings.$el.removeClass(app.navBar.settings.showClass);
            }
            if (!app.navBar.settings.hideOnScroll){
                app.navBar.settings.$el.removeClass(app.navBar.settings.showClass);
            }
        } else {
            if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
                app.navBar.settings.$el.addClass(app.navBar.settings.showClass);
            }
            if (!app.navBar.settings.hideOnScroll){
                app.navBar.settings.$el.addClass(app.navBar.settings.showClass);
            }
        }

        app.navBar.settings.lastWindowScrollTop = _scrollTop;

    },

    trigger: function () {
        app.navBar.settings.$trigger.on('click', function (event) {
            event.preventDefault();

            app.navBar.settings.$el.toggleClass(app.navBar.settings.mobileShowClass);
        });
    }
};