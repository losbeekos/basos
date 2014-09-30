'use strict';
app.mediaQueries = {
    alphaAndUp:   '(min-width: 0px)',
    alpha:        '(max-width: 650px)',
    betaAndUp:    '(min-width: 650px)',
    beta:         '(min-width: 650px) and (max-width: 900px)',
    alphaAndBeta: '(max-width: 900px)',
    gammaAndUp:   '(min-width: 900px)'
};
app.settings = {
    version: '?v=1.0', // If the file changes, update this number
    $document: $(document),
    $window: $(window),
    windowHeight: $(window).height(),
    windowWidth: $(window).width(),
    $html: $('html'),
    $body: $('body'),
    $htmlAndBody: $('html, body'),
    $background: $('#background'),
    $container: $('#container'),
    $main: $('#main')
};
helper.cookies = {
    create: function(name,value,days) {
        var expires = "";

        if (days) {
            var date = new Date();

            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
    },

    read: function(name) {
        var nameEQ = name + "=",
            ca = document.cookie.split(';');

        for(var i=0;i < ca.length;i++) {
            var c = ca[i];

            while (c.charAt(0) === ' ') {
                c = c.substring(1,c.length);
            }

            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length,c.length);
            }
        }

        return null;
    },

    erase: function(name) {
        helper.cookies.create(name,"",-1);
    }
};
helper.inView = function(el) {
    if (el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.bottom <= app.settings.$window.height()
    );
};
helper.outView = function(el) {
    if (el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.bottom < 0 ||
        rect.top > app.settings.$window.height()
    );
};
helper.partiallyInView = function(el) {
    if (el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.bottom - (rect.height/2) <= app.settings.$window.height()
    );
};
app.accordion = {
    settings: {
        $el: $('.accordion'),
        $group: $('.accordion__group'),
        $trigger: $('.accordion__trigger'),
        contentShowClass: 'accordion-content-show'
    },

    init: function () {
        var self = this;

        if (app.accordion.settings.$el.length > 0) {
            self.setGroupHeight();
            self.toggler();
            self.forceMaxheight();
        }
    },

    setGroupHeight: function () {
        var self = this;

        app.accordion.settings.$group.each(function () {
            var $group = $(this),
                $groupContent = $group.find('.accordion__content');

            $groupContent.removeAttr('style');

            var contentHeight = $groupContent.height();

            $groupContent.attr('data-accordion-content-height', contentHeight);

            if ($group.hasClass(app.accordion.settings.contentShowClass)) {
                $groupContent.css({'max-height': contentHeight});
            } else {
                $groupContent.css({'max-height': 0});
            }
        });
    },

    toggler: function () {
        var self = this;

        app.accordion.settings.$trigger.on('click', function () {
            var $trigger = $(this),
                $group = $trigger.parent(),
                $content = $trigger.next();

            if (!$group.hasClass(app.accordion.settings.contentShowClass)) {
                self.hideGroup($trigger.closest('.accordion').find('.accordion__content'));
                self.showGroup($trigger, $content);
            } else {
                self.hideGroup($content);
            }
        });
    },

    showGroup: function ($trigger, $content) {
        var self = this;

        $content
            .css({'max-height': $trigger.next().data('accordionContentHeight')})
            .parent()
            .addClass(app.accordion.settings.contentShowClass);
    },

    hideGroup: function ($content) {
        var self = this;

        $content
            .css({'max-height': 0})
            .parent()
            .removeClass(app.accordion.settings.contentShowClass);
    },

    forceMaxheight: function () {
        var self = this;

        app.settings.$window.resize(function() {
            self.setGroupHeight();
        });
    }
};
app.cycle = {
    settings: {
        $el: $('.cycle__wrap', '.cycle'),
        slides: '> .cycle__item',
        pager: '> .cycle__pager',
        prev: '> .cycle__prev',
        next: '> .cycle__next',
        pagerActiveClass: 'cycle__pager--active'
    },

    init: function(){
        var self = this;

        if(app.cycle.settings.$el.length > 0){
            yepnope.injectJs(app.pathBower + 'jquery-cycle2/build/jquery.cycle2.min.js',
                function(){
                    app.cycle.settings.$el
                        .cycle({
                            slides           : app.cycle.settings.slides,
                            pager            : app.cycle.settings.pager,
                            prev             : app.cycle.settings.prev,
                            next             : app.cycle.settings.next,
                            pagerActiveClass : app.cycle.settings.pagerActiveClass,
                            pauseOnHover     : true,
                            swipe            : true,
                            log              : false,
                            paused           : true,
                            fx               : 'none'
                        })
                        .on('cycle-update-view', function (event, optionHash, slideOptionsHash, currentSlideEl) {
                            if (optionHash.slideCount > 1) {
                                $(this).addClass('cycle-active');
                            }
                        })
                        .on('cycle-before', function () {
                            // $('.thumbnail-grid__item').each(function () {
                            //     $(this).removeClass('scrollspy--in-view').removeClass('animation-fadeIn');
                            // });
                        })
                        .on('cycle-after', function () {
                            // app.scrollSpy.init();
                        });
                });
        }
    }
};
app.disableHover = {
    timer: null,

    init: function(){
        clearTimeout(app.disableHover.timer);
        if(!app.settings.$body.hasClass('disable-hover')) {
            app.settings.$body.addClass('disable-hover');
        }

        app.disableHover.timer = setTimeout(function(){
            app.settings.$body.removeClass('disable-hover');
        }, 100);
    }
};
app.dropdowns = {
    settings: {
        $el: $('.dropdown'),
        showClass: 'dropdown--show'
    },

    init: function () {
        app.dropdowns.settings.$el.on('click', function () {
            var $this = $(this);

            if (app.settings.$html.hasClass('touch') || $this.data('dropdownTrigger')) {
                app.dropdowns.settings.$el.not($this).removeClass(app.dropdowns.settings.showClass);
                $this.toggleClass(app.dropdowns.settings.showClass);
            }
        });
    }
};
app.equalize = {
    settings: {
        $el: $('[data-equalize]')
    },

    init: function(){
        if (app.equalize.settings.$el.length > 0) {
            app.equalize.settings.$el.each(function () {
                var currentHeight = 0,
                    $this = $(this);

                $this.find('[data-equalize-target]')
                    .each(function () {
                        var $this = $(this),
                            height = null;

                        $this.css({height: 'auto'});

                        height = $(this).height();

                        if (height > currentHeight) {
                            currentHeight = height;
                        }
                    })
                    .height(currentHeight);
            });
        }
    }
};
app.fancybox = {
    el: $('.fancybox'),

    init: function(){
        var self = this,
            urlFancybox = app.pathBower + 'fancybox/jquery.fancybox.pack.js',
            urlFancyboxMediaHelper = app.pathBower + 'fancybox/helpers/jquery.fancybox-media.js';

        yepnope({
            test : self.el,
            yep  : [urlFancybox, urlFancyboxMediaHelper],
            callback: function (url) {
                if(url === urlFancyboxMediaHelper){
                    self.el.fancybox({
                        helpers: {
                            media: true
                        }
                    });
                }
            }
        });
    }
};
app.fastClick = {
    init: function(){
        if (app.settings.$html.hasClass('touch')) {
            yepnope.injectJs(
                app.pathBower + 'fastclick/lib/fastclick.js',
                function(){
                    FastClick.attach(document.body);
                }
            );
        }
    }
};
app.fitVids = {
    settings: {
        $el: $('.fitvids')
    },

    init: function(){
        if (app.fitVids.settings.$el.length > 0) {
            yepnope.injectJs(
                app.pathBower + 'fitvids/jquery.fitvids.js' + app.settings.version,
                function(){
                    app.fitVids.settings.$el.fitVids();
                }
            );
        }
    }
};
app.formModules = {
    settings: {
        $passwordToggle: $('.form__password-toggle'),
        passwordShowClass: 'form__input--show-password',
        $validation: $('[data-form-validate]'),
        validationLanguage: 'nl'
    },

    init: function () {
        app.formModules.validation();
        app.formModules.password();
    },

    password: function () {
        app.formModules.settings.$passwordToggle.on('click', function () {
            var $this = $(this),
                $formPassword = $this.closest('.form__input'),
                $formInput = $formPassword.find('input'),
                formType = $formInput.attr('type');

            $formInput.attr('type', formType === 'text' ? 'password': 'text');
            $formPassword.toggleClass(app.formModules.settings.passwordShowClass);
        });
    },

    validation: function(){
        var parsleyOptions = {
                errorClass: 'form__input--error',
                successClass: 'form__input--success',
                errorsWrapper: '<div class="parsley-container"></div>',
                errorTemplate: '<div></div>',
                trigger: 'change',

                classHandler: function (element){
                    var $element = element.$element[0];

                    if ($element.localName === 'select') {
                        element.$element.closest('.form__input').addClass('form__input--select-validated');
                    }

                    if ($element.localName === 'input' && $element.type === 'checkbox' || $element.localName === 'input' && $element.type === 'radio') {
                        return element.$element.closest('.form__input-list');
                    } else {
                        return element.$element.closest('.form__input');
                    }
                },

                errorsContainer: function (element) {
                    var $container = element.$element.closest('.form__input');

                    return $container;
                }
            };

        if(app.formModules.settings.$validation.length > 0){
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.formModules.settings.validationLanguage + '.js' + app.settings.version, function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js' + app.settings.version,
                    function(){
                        app.formModules.settings.$validation.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.formModules.settings.validationLanguage);
                    });
            });
        }
    }
};
app.jump = {
    settings: {
        speed: 300,
        $el: $('[data-jumpto]')
    },

    init: function () {
        var self = this;

        app.jump.settings.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this).attr('href'));
        });
    },

    to: function (_target) {
        var self = this,
            offsetTop = Math.round($(_target).offset().top);

        if (app.navBar.settings.$el.length > 0) {
            offsetTop = offsetTop - app.navBar.settings.$el.height();
        }

        app.settings.$htmlAndBody.animate({scrollTop: offsetTop}, app.jump.settings.speed);
    }
};
app.modals = {
    settings: {
        scrollTopPosition: null,
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },

    init: function () {
        var self = this;

        if (app.modals.settings.$trigger.length > 0 && app.modals.settings.$modal.length > 0) {
            app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

            self.triggers();
        }
    },

    triggers: function () {
        var self = this;

        app.modals.settings.$trigger.on('click', function (event) {
            event.preventDefault();

            var $trigger = $(this);

            self.openModal($trigger, $trigger.data('modalId'));
        });

        app.settings.$body.on('keydown', function(event){
            if (event.keyCode === 27) {
                self.closeModal();
            }
        });

        $('[data-modal-close]').on('click', function(event) {
            event.preventDefault();
            self.closeModal();
        });
    },

    openModal: function (_trigger, _modalId) {
        var self = this,
            scrollTopPosition = app.settings.$window.scrollTop(),
            $targetModal = $('#' + _modalId);

        app.modals.settings.scrollTopPosition = scrollTopPosition;

        app.settings.$html
            .addClass('modal-show')
            .attr('data-modal-effect', $targetModal.data('modal-effect'));

        $targetModal.addClass('modal-show');

        app.settings.$background.scrollTop(scrollTopPosition);
    },

    closeModal: function () {
        var self = this;

        $('.modal-show').removeClass('modal-show');
        app.settings.$html
            .removeClass('modal-show')
            .removeAttr('data-modal-effect');

        app.settings.$window.scrollTop(app.modals.settings.scrollTopPosition);
    }
};
app.navBar = {
    settings: {
        $el: $('#nav-bar, #off-canvas-nav-bar'),
        $trigger: $('#nav-bar-trigger'),
        navBarOffsetTop: null,
        navBarHeight: null,
        lastWindowScrollTop: 0,
        hideOnScroll: false,
        fixedClass: 'nav-bar--fixed',
        showClass: 'nav-bar--show',
        mobileShowClass: 'nav-bar--mobile-show',
        transformClass: 'nav-bar--transform',
        allwaysShowOnMobile: true,
        allwaysShowOnMobileClass: 'nav-bar--always-show-on-mobile'
    },

    init: function(_scrollTop){
        if (app.navBar.settings.$el.length > 0) {

            if (app.navBar.settings.$el.attr('id') === 'off-canvas-nav-bar') {
                app.navBar.settings.fixedClass =  'off-canvas-' + app.navBar.settings.fixedClass;
                app.navBar.settings.showClass = 'off-canvas-' + app.navBar.settings.showClass;
                app.navBar.settings.mobileShowClass = 'off-canvas-' + app.navBar.settings.mobileShowClass;
                app.navBar.settings.transformClass = 'off-canvas-' + app.navBar.settings.transformClass;
            }

            app.navBar.settings.navBarOffsetTop = app.navBar.settings.$el.offset().top,
            app.navBar.settings.navBarHeight = app.navBar.settings.$el.height();

            app.navBar.addClasses();
            app.navBar.scroller(_scrollTop);
            app.navBar.trigger();
        }
    },

    addClasses: function () {
        if (app.settings.$html.hasClass('no-csspositionsticky')) {
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

            if (app.settings.$html.hasClass('no-csspositionsticky')) {
                app.settings.$container.css({'padding-top': app.navBar.settings.navBarHeight});
            }

            if (app.navBar.settings.hideOnScroll && _scrollTop >= (app.navBar.settings.navBarOffsetTop+app.navBar.settings.navBarHeight)) {
                app.navBar.settings.$el.addClass(app.navBar.settings.transformClass);
                app.navBar.settings.$el.addClass(app.navBar.settings.showClass);
            }
        } else {
            app.navBar.settings.$el.removeClass(app.navBar.settings.fixedClass);

            if (app.settings.$html.hasClass('no-csspositionsticky')) {
                app.settings.$container.css({'padding-top': 0});
            }

            if (app.navBar.settings.hideOnScroll) {
                app.navBar.settings.$el.removeClass(app.navBar.settings.transformClass);
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
app.navPrimary = {
    settings: {
        $el: $('.nav-primary')
    },

    init: function(){
        if(app.primaryNav.settings.$el.length > 0){
        }
    }
};
app.notifications = {
    settings: {
        cookieLaw: {
            position: 'bottom',
            approveBtnText: 'ok, ik snap het',
            infoBtnShow: true,
            infoBtnLink: '/cookiewet',
            infoBtnText: 'meer informatie',
            notificationText: 'Wij gebruiken cookies om uw gebruikerservaring te verbeteren en statistieken bij te houden.'
        }
    },

    init: function () {
        var self = this;

        self.close();
        self.cookieLaw.init();
    },

    close: function () {
        var self = this;

        app.settings.$body.on('click', '[data-notification-close]', function (event) {
            event.preventDefault();

            var $close = $(this),
                $notification = $close.parent(),
                notificationId = $notification.attr('id');

            $notification.addClass('notification--close');

            if (notificationId === 'notification-cookie') {
                helper.cookies.create('basosCookieNotification', 'approved', 365);
            }

            setTimeout(function () {
                $notification.remove();
            }, 500);
        });
    },


    /*==========  Cookie law  ==========*/

    cookieLaw: {
        init: function () {
            var self = this,
                cookieValue = helper.cookies.read('basosCookieNotification'),
                info = '';

            if (cookieValue !== 'approved') {
                app.settings.$html.attr('notification-cookie-position', app.notifications.settings.cookieLaw.position);

                if (app.notifications.settings.cookieLaw.infoBtnShow) {
                    info = '<a class="btn btn--alpha btn--small" href="' + app.notifications.settings.cookieLaw.infoBtnLink + '">' + app.notifications.settings.cookieLaw.infoBtnText + '</a>';
                }

                var html = '<div id="notification-cookie" class="notification notification--alpha notification--cookie">'+
                           '<div class="notification__text">' + app.notifications.settings.cookieLaw.notificationText + '</div>'+
                           '<a class="btn btn--beta btn--small" data-notification-close>' + app.notifications.settings.cookieLaw.approveBtnText + '</a> '+ info +
                           '</div>';

                app.settings.$background.prepend(html);

                setTimeout(function () {
                    app.settings.$html.addClass('notification-cookie-show');
                }, 0);
            }
        }
    }
};
app.offCanvas = {
    settings: {
        toggleLeft: '#off-canvas-toggle-left',
        toggleRight: '#off-canvas-toggle-right',
        width: $('.off-canvas, .off-canvas-nav-bar').outerWidth(),
        $el: $('.off-canvas, .off-canvas-nav-bar'),
        $link: $('.off-canvas-nav__link, .off-canvas-nav-bar__link')
    },

    init: function () {

        app.offCanvas.settings.$link.on('click', function(event) {
            event.preventDefault();

            var href = window.location,
                linkHref = $(this).attr('href');

            app.offCanvas.hideLeftAndRight();

            setTimeout(function () {
                if (href !== linkHref) {
                    window.location = linkHref;
                }
            }, 400);
        });

        app.settings.$html.delegate(app.offCanvas.settings.toggleLeft, 'click', function(event) {
            app.offCanvas.toggleLeft();
        });

        app.settings.$html.delegate(app.offCanvas.settings.toggleRight, 'click', function(event) {
            app.offCanvas.toggleRight();
        });

        app.settings.$container.on('click', function () {
            app.offCanvas.hideLeftAndRight();
        });
    },

    hideLeftAndRight: function () {
        app.settings.$html
            .removeClass('off-canvas-show-left')
            .removeClass('off-canvas-show-right')
            .removeClass('off-canvas-nav-bar-show-left')
            .removeClass('off-canvas-nav-bar-show-right');
    },

    showLeft: function () {
        app.settings.$html.addClass('off-canvas-show-left').addClass('off-canvas-nav-bar-show-left');
    },

    hideLeft: function () {
        app.settings.$html.removeClass('off-canvas-show-left').removeClass('off-canvas-nav-bar-show-left');
    },

    toggleLeft: function () {
        app.offCanvas.hideRight();
        app.settings.$html.toggleClass('off-canvas-show-left').toggleClass('off-canvas-nav-bar-show-left');
    },

    showRight: function () {
        app.settings.$html.addClass('off-canvas-show-right').addClass('off-canvas-nav-bar-show-right');
    },

    hideRight: function () {
        app.settings.$html.removeClass('off-canvas-show-right').removeClass('off-canvas-nav-bar-show-right');
    },

    toggleRight: function () {
        app.offCanvas.hideLeft();
        app.settings.$html.toggleClass('off-canvas-show-right').toggleClass('off-canvas-nav-bar-show-right');
    }
};
app.parallax = {
    settings: {
        $el: $('.parallax'),
    },

    init: function (_scrollTop) {
        var self = this;

        if (app.parallax.settings.$el.length > 0) {
            app.parallax.settings.$el.each(function () {
                var $parallax = $(this),
                    parallaxData = $parallax.data(),
                    parallaxSpeed = parallaxData.parallaxSpeed,
                    parallaxOffset = $parallax.offset(),
                    parallaxOffsetTop = parallaxOffset.top,
                    $img = $parallax.find('.parallax__img');

                if (parallaxSpeed === undefined) {
                    parallaxSpeed = -4;
                }

                if (Modernizr.mq(app.mediaQueries.alpha)) {
                    $img.removeAttr('style');
                }

                if (!helper.outView($parallax) && Modernizr.mq(app.mediaQueries.betaAndUp && app.settings.$html.hasClass('no-touch'))) {
                    var yPos = (_scrollTop / parallaxSpeed);

                    if (parallaxOffsetTop > app.settings.windowHeight) {
                        yPos = (_scrollTop - Math.round(parallaxOffsetTop - app.settings.windowHeight)) / parallaxSpeed;
                    }

                    $img.css({
                        'transform': 'translate3d(0, ' + yPos +  'px, 0)',
                        'transition': 'none'
                    });
                }

                $parallax.show();
            });
        }
    }
};
app.scrollSpy = {
    settings: {
        $el: $('[data-scrollspy]'),
        defaultClass: 'animation-bounceIn',
        repeat: true
    },

    init: function (_scrollTop, _windowHeight, _load) {
        var self = this,
            windowHeight = app.settings.$window.height();

        if (app.scrollSpy.settings.$el.length > 0) {
            app.scrollSpy.settings.$el.each(function (index) {
                var $this = $(this),
                    elPositionTop = Math.round($this.offset().top),
                    elHeight = $this.height(),
                    inView = helper.inView($this),
                    outView = helper.outView($this),
                    partiallyInView = helper.partiallyInView($this),
                    data = $this.data(),
                    combinedClasses = (data.scrollspyClass === undefined) ? app.scrollSpy.settings.defaultClass : data.scrollspyClass;

                combinedClasses += ' scrollspy--in-view';

                if (app.settings.$html.hasClass('touch')) {
                    $this.addClass(combinedClasses);
                } else {
                    var hasCombinedClasses = $this.hasClass(combinedClasses),
                        delay = (data.scrollspyDelay > 0) ? data.scrollspyDelay : 0;

                    inView && !hasCombinedClasses ? setTimeout(function () { $this.addClass(combinedClasses); }, delay) : '';
                    _load && partiallyInView && data.scrollspyPartiallyInView !== undefined ? setTimeout(function () { $this.addClass(combinedClasses); }, delay) : '';

                    if (data.scrollspyRepeat !== undefined || app.scrollSpy.settings.repeat) {
                        outView && hasCombinedClasses ?  $this.removeClass(combinedClasses) : '';
                    }

                    $this.outerHeight() > windowHeight ? $this.addClass(combinedClasses) : '';
                }
            });
        }
    }
};
app.scrollSpyNav = {
    settings: {
        $el: $('[data-scrollspy-nav]')
    },

    init: function (_scrollTop) {
        var self = this,
            windowHeight = app.settings.$window.height();

        if (app.scrollSpyNav.settings.$el.length > 0) {
            app.scrollSpyNav.settings.$el.each(function () {
                var $this = $(this),
                    $target = $('#' + $this.data('scrollspyNav')),
                    targetTop = Math.round($target.position().top);

                if (app.navBar.settings.$el.length > 0) {
                    targetTop = targetTop - app.navBar.settings.$el.height();
                }

                if (_scrollTop >= targetTop) {
                    _scrollTop >= (targetTop + $target.outerHeight()) ? $this.removeClass('scrollspy-nav--active') : $this.addClass('scrollspy-nav--active');
                } else {
                    $this.removeClass('scrollspy-nav--active');
                }
            });
        }
    }
};
app.tabs = {
    settings: {
        $nav: $('.tabs'),
        $tab: $('.tab'),
        $content: $('.tab-content')
    },

    init: function(){
        var self = this;

        if (app.tabs.settings.$tab.length > 0) {
            app.tabs.settings.$tab.on('click', function (event) {
                var $tab = $(this);

                event.preventDefault();

                app.tabs.settings.$tab.removeClass('tab--active');
                $tab.addClass('tab--active');

                $($tab.attr('href'))
                    .addClass('tab-item--active')
                    .siblings()
                    .removeClass('tab-item--active');
            });
        }
    }
};
app.toggle = {
    settings: {
        $el: $('[data-toggle]')
    },

    init: function () {
        app.toggle.settings.$el.on('click', function (event) {
            event.preventDefault();

            app.toggle.toggler($($(this).data('toggle')));
        });
    },

    toggler: function (_target) {
        _target.toggleClass('toggle--hide');
    }
};
app.tooltips = {
    settings: {
        $el: $('.tooltip'),
        tooltipActiveClass: 'tooltip--active',
        tooltipContentClass: 'tooltip__content',
        arrowWidth: 8,
        tooltipTrigger: null
    },

    init: function () {
        var self = this;

        if (app.tooltips.settings.$el.length > 0) {
            app.tooltips.settings.$el.each(function () {
                var $tooltipTrigger = $(this);

                if ($tooltipTrigger.data('tooltipTrigger') === 'click' || app.settings.$html.hasClass('touch')) {
                    app.tooltips.settings.tooltipTrigger = 'click';
                } else {
                    app.tooltips.settings.tooltipTrigger = 'hover';
                }

                self.triggers($tooltipTrigger);
                self.appendContent($tooltipTrigger);
            });
        }
    },

    appendContent: function ($tooltipTrigger) {
        var self = this;

        $tooltipTrigger
            .append('<div class="' + app.tooltips.settings.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
            .removeAttr('title');

        self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip__content'));
    },

    triggers: function ($tooltipTrigger) {
        var self = this;

        if (app.tooltips.settings.tooltipTrigger === 'hover') {
            $tooltipTrigger.on({
                mouseenter: function () {
                    $(this).addClass(app.tooltips.settings.tooltipActiveClass);
                },
                mouseleave: function () {
                    $(this).removeClass(app.tooltips.settings.tooltipActiveClass);
                }
            });
        } else {
            $tooltipTrigger.on('click', function () {
                $(this).toggleClass(app.tooltips.settings.tooltipActiveClass);
            });
        }
    },

    calculatePosition: function ($tooltipTrigger, $tooltipContent) {
        var self = this,
            tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
            tooltipContentHeight = $tooltipContent.outerHeight();

        switch ($tooltipTrigger.data('tooltipPosition')) {
            case 'top':
                $tooltipContent.css({ bottom: tooltipTriggerHeight + app.tooltips.settings.arrowWidth });
                break;
            case 'right':
            case 'left':
                $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                break;
            case 'bottom':
                $tooltipContent.css({ top: tooltipTriggerHeight + app.tooltips.settings.arrowWidth });
                break;
        }
    }
};
app.settings.$document.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop();

    app.equalize.init();
    app.scrollSpyNav.init(scrollTop);
    app.fastClick.init();
    app.fitVids.init();
    app.navBar.init(scrollTop);
    app.dropdowns.init();
    app.formModules.init();
    app.jump.init();
    app.modals.init();
    app.tooltips.init();
    app.accordion.init();
    app.tabs.init();
    app.notifications.init();
    app.offCanvas.init();
    app.toggle.init();
    app.parallax.init(scrollTop);

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});

app.settings.$window.ready(function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, true);
});

app.settings.$window.on('scroll', function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
    app.disableHover.init();
});

app.settings.$window.on('touchmove', function(){
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.scrollSpy.init(scrollTop, windowHeight, false);
    app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {
    var $this = $(this),
        scrollTop = $this.scrollTop(),
        windowHeight = $this.height();

    app.navBar.init(scrollTop);
    app.equalize.init();
    app.scrollSpy.init(scrollTop, windowHeight, true);
    app.scrollSpyNav.init(scrollTop);
    app.parallax.init(scrollTop);
    app.navBar.scroller(scrollTop);
});