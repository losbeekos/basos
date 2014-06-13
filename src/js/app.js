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
    $main: $('#main'),


    /*==========  Notification  ==========*/

    notifications: {
        cookieLaw: {
            position: 'bottom',
            approveBtnText: 'ok, ik snap het',
            infoBtnShow: true,
            infoBtnLink: '/cookiewet',
            infoBtnText: 'meer informatie',
            notificationText: 'Wij gebruiken cookies om uw gebruikerservaring te verbeteren en statistieken bij te houden.'
        }
    },


    /*==========  Off anvas  ==========*/
    
    offCanvas: {
        toggleLeft: '#off-canvas-toggle-left',
        toggleRight: '#off-canvas-toggle-right',
        width: $('.off-canvas').outerWidth(),
        $el: $('.off-canvas'),
        $link: $('.off-canvas-nav__link')
    },


    /*==========  Fitvids  ==========*/

    fitVids: {
        $el: $('.fitvids')
    },


    /*==========  Jumpto  ==========*/

    jump: {
        $el: $('[data-jumpto]'),
        speed: 300
    },


    /*==========  Primary nav  ==========*/

    navPrimary: {
        $el: $('.nav-primary')
    },


    /*==========  Modals  ==========*/

    modals: {
        $trigger: $('.modal__trigger'),
        $modal: $('.modal')
    },


    /*==========  Cycle  ==========*/

    cycle: {
        $el: $('.cycle-wrap', '.cycle'),
        slides: '> .cycle-item',
        pager : '> .cycle-pager',
        pagerActiveClass: 'cycle-pager-active'
    },


    /*==========  Tooltips  ==========*/

    tooltips: {
        $el: $('.tooltip'),
        tooltipActiveClass: 'tooltip--active',
        tooltipContentClass: 'tooltip__content',
        arrowWidth: 8
    },


    /*==========  Accordion  ==========*/

    accordion: {
        $el: $('.accordion'),
        $group: $('.accordion__group'),
        $trigger: $('.accordion__trigger'),
        contentShowClass: 'accordion-content--show'
    },


    /*==========  Form validation  ==========*/

    formValidation: {
        $el: $('[data-form-validate]'),
        language: 'nl'
    },


    /*==========  Tabs  ==========*/

    tabs: {
        $nav: $('.tabs'),
        $tab: $('.tab'),
        $content: $('.tab-content')
    }

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
    init: function () {
        var self = this;

        if (app.settings.accordion.$el.length > 0) {
            self.setGroupHeight();
            self.toggler();
            self.forceMaxheight();
        }
    },

    setGroupHeight: function () {
        var self = this;

        app.settings.accordion.$group.each(function () {
            var $group = $(this),
                $groupContent = $group.find('.accordion__content');

            $groupContent.removeAttr('style');

            var contentHeight = $groupContent.height();

            $groupContent.attr('data-accordion-content-height', contentHeight);

            if ($groupContent.hasClass(app.settings.accordion.contentShowClass)) {
                $groupContent.css({'max-height': contentHeight});
            } else {
                $groupContent.css({'max-height': 0});
            }
        });
    },

    toggler: function () {
        var self = this;

        app.settings.accordion.$trigger.on('click', function () {
            var $trigger = $(this),
                $content = $trigger.next();

            if (!$content.hasClass(app.settings.accordion.contentShowClass)) {
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
            .addClass(app.settings.accordion.contentShowClass);
    },

    hideGroup: function ($content) {
        var self = this;

        $content
            .css({'max-height': 0})
            .removeClass(app.settings.accordion.contentShowClass);
    },

    forceMaxheight: function () {
        var self = this;

        app.settings.$window.resize(function() {
            self.setGroupHeight();
        });
    }
};
app.cycle = {
    init: function(){
        var self = this;

        if(app.settings.cycle.$el.el.length > 0){
            yepnope.injectJs(app.pathBower + 'cycle2/build/jquery.cycle2.min.js',
                function(){
                    self.el.cycle({
                        slides           : app.settings.cycle.slides,
                        pager            : app.settings.cycle.pager,
                        pagerActiveClass : app.settings.cycle.pagerActiveClass,
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
    init: function(){
        if (app.settings.fitVids.$el.length > 0) {
            yepnope.injectJs(
                app.pathBower + 'fitvids/jquery.fitvids.js' + app.settings.version,
                function(){
                    app.settings.fitVids.$el.fitVids();
                }
            );
        }
    }
};
app.formValidation = {
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

        if(app.settings.formValidation.$el.length > 0){
            yepnope.injectJs(app.pathBower + 'parsleyjs/src/i18n/' + app.settings.formValidation.language + '.js' + app.settings.version, function () {
                yepnope.injectJs(app.pathBower + 'parsleyjs/dist/parsley.js' + app.settings.version,
                    function(){
                        app.settings.formValidation.$el.each(function () {
                            $(this).parsley(parsleyOptions);
                        });

                        window.ParsleyValidator.setLocale(app.settings.formValidation.language);
                    });
            });
        }
    }
};
app.jump = {
    init: function () {
        var self = this;

        app.settings.jump.$el.on('click', function (event) {
            event.preventDefault();

            self.to($(this));
        });
    },

    to: function (_link) {
        var self = this;

        app.settings.$htmlAndBody.animate({scrollTop: $(_link.attr('href')).offset().top}, app.settings.jump.speed);
    }
};
app.modals = {
    scrollTopPosition: null,

    init: function () {
        var self = this;

        if (app.settings.modals.$trigger.length > 0 && app.settings.modals.$modal.length > 0) {
            app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

            self.triggers();
        }
    },

    triggers: function () {
        var self = this;

        app.settings.modals.$trigger.on('click', function (event) {
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

        self.scrollTopPosition = scrollTopPosition;

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

        app.settings.$window.scrollTop(self.scrollTopPosition);
    }
};
app.navPrimary = {
    init: function(){
        if(app.settings.primaryNav.$el.length > 0){
        }
    }
};
app.notifications = {
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
                app.settings.$html.attr('notification-cookie-position', app.settings.notifications.cookieLaw.position);

                if (app.settings.notifications.cookieLaw.infoBtnShow) {
                    info = '<a class="btn btn--alpha btn--small" href="' + app.settings.notifications.cookieLaw.infoBtnLink + '">' + app.settings.notifications.cookieLaw.infoBtnText + '</a>';
                }

                var html = '<div id="notification-cookie" class="notification notification--alpha notification--cookie">'+
                           '<div class="notification__text">' + app.settings.notifications.cookieLaw.notificationText + '</div>'+
                           '<a class="btn btn--beta btn--small" data-notification-close>' + app.settings.notifications.cookieLaw.approveBtnText + '</a> '+ info +
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
    init: function () {

        app.settings.offCanvas.$link.on('click', function(event) {
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

        app.settings.$html.delegate(app.settings.offCanvas.toggleLeft, 'click', function(event) {
            app.offCanvas.toggleLeft();
        });

        app.settings.$html.delegate(app.settings.offCanvas.toggleRight, 'click', function(event) {
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
    init: function(){
        var self = this;

        if (app.settings.tabs.$tab.length > 0) {
            app.settings.tabs.$tab.on('click', function (event) {
                var $tab = $(this);

                event.preventDefault();

                app.settings.tabs.$tab.removeClass('tab--active');
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
    tooltipTrigger: null,

    init: function () {
        var self = this;

        if (app.settings.tooltips.$el.length > 0) {
            app.settings.tooltips.$el.each(function () {
                var $tooltipTrigger = $(this);

                if ($tooltipTrigger.data('tooltipTrigger') === 'click') {
                    self.tooltipTrigger = 'click';
                } else {
                    self.tooltipTrigger = 'hover';
                }

                self.triggers($tooltipTrigger);
                self.appendContent($tooltipTrigger);
            });
        }
    },

    appendContent: function ($tooltipTrigger) {
        var self = this;

        $tooltipTrigger
            .append('<div class="' + app.settings.tooltips.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
            .removeAttr('title');

        self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip__content'));
    },

    triggers: function ($tooltipTrigger) {
        var self = this;

        if (self.tooltipTrigger === 'hover') {
            $tooltipTrigger.on({
                mouseenter: function () {
                    $(this).addClass(app.settings.tooltips.tooltipActiveClass);
                },
                mouseleave: function () {
                    $(this).removeClass(app.settings.tooltips.tooltipActiveClass);
                }
            });
        } else {
            $tooltipTrigger.on('click', function () {
                $(this).toggleClass(app.settings.tooltips.tooltipActiveClass);
            });
        }
    },

    calculatePosition: function ($tooltipTrigger, $tooltipContent) {
        var self = this,
            tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
            tooltipContentHeight = $tooltipContent.outerHeight();

        switch ($tooltipTrigger.data('tooltipPosition')) {
            case 'top':
                $tooltipContent.css({ bottom: tooltipTriggerHeight + app.settings.tooltips.arrowWidth });
                break;
            case 'right':
            case 'left':
                $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                break;
            case 'bottom':
                $tooltipContent.css({ top: tooltipTriggerHeight + app.settings.tooltips.arrowWidth });
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