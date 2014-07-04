'use strict';
app.settings = {
    version: '?v=0.1', // If the file changes, update this number
    $document: $(document),
    $window: $(window),
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
app.accordion = {
    settings: {
        $el: $('.accordion'),
        $group: $('.accordion__group'),
        $trigger: $('.accordion__trigger'),
        contentShowClass: 'accordion-content--show'
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

            if ($groupContent.hasClass(app.accordion.settings.contentShowClass)) {
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
                $content = $trigger.next();

            if (!$content.hasClass(app.accordion.settings.contentShowClass)) {
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
            .addClass(app.accordion.settings.contentShowClass);
    },

    hideGroup: function ($content) {
        var self = this;

        $content
            .css({'max-height': 0})
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
        $el: $('.cycle-wrap', '.cycle'),
        slides: '> .cycle-item',
        pager : '> .cycle-pager',
        pagerActiveClass: 'cycle-pager-active'
    },

    init: function(){
        var self = this;

        if(app.cycle.settings.$el.el.length > 0){
            yepnope.injectJs(app.pathBower + 'cycle2/build/jquery.cycle2.min.js',
                function(){
                    self.el.cycle({
                        slides           : app.cycle.settings.slides,
                        pager            : app.cycle.settings.pager,
                        pagerActiveClass : app.cycle.settings.pagerActiveClass,
                        pauseOnHover     : true,
                        swipe            : true,
                        log              : false
                    });
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
                app.pathBower + 'fastclick/lib/fastclick.js' + app.settings.version,
                function(){
                    new FastClick(document.body);
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
app.formValidation = {
    settings: {
        $el: $('[data-form-validate]'),
        language: 'nl'
    },

    init: function(){
        var self = this,
            parsleyOptions = {
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

        if(app.formValidation.settings.$el.length > 0){
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.formValidation.settings.language + '.js' + app.settings.version, function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js' + app.settings.version,
                    function(){
                        app.formValidation.settings.$el.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.formValidation.settings.language);
                    });
            });
        }
    }
};
app.jump = {
    settings: {
        $el: $('[data-jumpto]'),
        speed: 300
    },

    init: function () {
        var self = this;

        app.jump.settings.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this).attr('href'));
        });
    },

    to: function (_target) {
        var self = this;

        app.settings.$htmlAndBody.animate({scrollTop: $(_target).offset().top}, app.jump.settings.speed);
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
        width: $('.off-canvas').outerWidth(),
        $el: $('.off-canvas'),
        $link: $('.off-canvas-nav__link')
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
            .removeClass('off-canvas-show-right');
    },

    showLeft: function () {
        app.settings.$html.addClass('off-canvas-show-left');
    },

    hideLeft: function () {
        app.settings.$html.removeClass('off-canvas-show-left');
    },

    toggleLeft: function () {
        app.offCanvas.hideRight();
        app.settings.$html.toggleClass('off-canvas-show-left');
    },

    showRight: function () {
        app.settings.$html.addClass('off-canvas-show-right');
    },

    hideRight: function () {
        app.settings.$html.removeClass('off-canvas-show-right');
    },

    toggleRight: function () {
        app.offCanvas.hideLeft();
        app.settings.$html.toggleClass('off-canvas-show-right');
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

                if ($tooltipTrigger.data('tooltipTrigger') === 'click') {
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
$(document).ready(function () {

    app.fastClick.init();
    app.fitVids.init();
    app.formValidation.init();
    app.jump.init();
    app.modals.init();
    app.tooltips.init();
    app.accordion.init();
    app.tabs.init();
    app.notifications.init();
    app.offCanvas.init();

    //app.cycle.init();
    //app.fancybox.init();
    //app.navPrimary.init();

});