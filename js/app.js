'use strict';



/*================================
=            Settings            =
================================*/

var settings = {
    version: '?v=0.1', // If the file changes, update this number
    $document: $(document),
    $window: $(window),
    $html: $('html'),
    $body: $('body'),
    $htmlAndBody: $('html, body'),
    $container: $('#container'),
    $main: $('#main'),


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
        $el: $('.spotlight-wrap', '#spotlight'),
        slides: '> .spotlight-item',
        pager : '> .spotlight-pager',
        pagerActiveClass: 'spotlight-pager-active'
    },


    /*==========  Tooltips  ==========*/

    tooltips: {
        $el: $('.tooltip'),
        tooltipActiveClass: 'tooltip--active',
        tooltipContentClass: 'tooltip__content',
        arrowWidth: 8
    },


    /*==========  Notifications  ==========*/

    notifications: {
        $close: $('[data-notification-close]')
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
        $el: $('[parsley-validate]')
    },


    /*==========  Tabs  ==========*/

    tabs: {
        $nav: $('.tabs'),
        $tab: $('.tab'),
        $content: $('.tab-content')
    }

};

/*-----  End of Settings  ------*/



/*===============================
=            Modules            =
===============================*/

var modules = {
    init: function(){

        $(function(){
            // Default modules
            modules.fastClick.init();
            modules.fitVids.init();
            modules.formValidation.init();
            modules.jump.init();
            modules.modals.init();
            modules.tooltips.init();
            modules.accordion.init();
            modules.tabs.init();
            modules.notifications.init();
            //modules.fancybox.init();

            // App modules
            //modules.nav.init();
            //modules.example.init();
        });

    },



    /*=================================
    =             Example             =
    =================================*/
    /*
    example: {
        init: function(){
            var self = this;

            if(settings.something.$el.length > 0){
                yepnope.injectJs(basosJsPath + 'plugins/someplugin/someplugin.js' + settings.version,
                    function(){
                });
            }
        }
    },
    */
    /*-----  End of Example  ------*/



    /*==========================================
    =            Primary navigation            =
    ==========================================*/
    /*
    navPrimary: {
        init: function(){
            if(settings.primaryNav.$el.length > 0){
            }
        }
    },
    */
    /*-----  End of Primary navigation  ------*/




    /*=================================
    =              Cycle              =
    =================================*/
    /*
    cycle: {
        init: function(){
            var self = this;

            if(settings.cycle.$el.el.length > 0){
                yepnope.injectJs(basosJsPath + 'plugins/jquery.cycle2/jquery.cycle2.min.js',
                    function(){
                        self.el.cycle({
                            slides           : settings.cycle.slides,
                            pager            : settings.cycle.pager,
                            pagerActiveClass : settings.cycle.pagerActiveClass,
                            pauseOnHover     : true,
                            swipe            : true,
                            log              : false
                        });
                    });
            }
        }
    },
    */
    /*-----  End of Cycle  ------*/



    /*================================
    =            Fancybox            =
    ================================*/
    /*
    fancybox: {
        el: $('.fancybox'),

        init: function(){
            var self = this,
                urlFancybox = basosJsPath + 'plugins/jquery.fancybox/jquery.fancybox.pack.js',
                urlFancyboxMediaHelper = basosJsPath + 'plugins/jquery.fancybox/helpers/jquery.fancybox-media.min.js';

            yepnope({
                test : self.el,
                yep  : [urlFancybox, urlFancyboxMediaHelper],
                callback: function () {
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
    },
    */
    /*-----  End of Fancybox  ------*/



    /*=================================
    =            Fastclick            =
    =================================*/

    fastClick: {
        init: function(){
            if (settings.$html.hasClass('touch')) {
                yepnope.injectJs(
                    basosJsPath + 'plugins/fastclick/fastclick.min.js' + settings.version,
                    function(){
                        new FastClick(document.body);
                    }
                );
            }
        }
    },

    /*-----  End of Fastclick  ------*/



    /*===============================
    =            Fitvids            =
    ===============================*/

    fitVids: {
        init: function(){
            if (settings.fitVids.$el.length > 0) {
                yepnope.injectJs(
                    basosJsPath + 'plugins/jquery.fitvids/jquery.fitvids.min.js' + settings.version,
                    function(){
                        settings.fitVids.$el.fitVids();
                    }
                );
            }
        }
    },

    /*-----  End of Fitvids  ------*/



    /*==============================
    =            Jumpto            =
    ==============================*/

    jump: {
        init: function () {
            var self = this;

            settings.jump.$el.on('click', function (event) {
                event.preventDefault();

                self.to($(this));
            });
        },

        to: function (_link) {
            var self = this;

            settings.$htmlAndBody.animate({scrollTop: $(_link.attr('href')).offset().top}, settings.jump.speed);
        }
    },

    /*-----  End of Jumpto  ------*/



    /*================================
    =             Modals             =
    ================================*/

    modals: {
        scrollTopPosition: null,

        init: function () {
            var self = this;

            if (settings.modals.$trigger.length > 0 && settings.modals.$modal.length > 0) {
                settings.$body.append('<div class="modal__overlay" data-modal-close></div>');

                self.triggers();
            }
        },

        triggers: function () {
            var self = this;

            settings.modals.$trigger.on('click', function (event) {
                event.preventDefault();

                var $trigger = $(this);

                self.openModal($trigger, $trigger.data('modalId'));
            });

            settings.$body.on('keydown', function(event){
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
                scrollTopPosition = settings.$window.scrollTop(),
                $targetModal = $('#' + _modalId);

            self.scrollTopPosition = scrollTopPosition;

            settings.$html
                .addClass('modal-show')
                .attr('data-modal-effect', $targetModal.data('modal-effect'));

            $targetModal.addClass('modal-show');

            settings.$container.scrollTop(scrollTopPosition);
        },

        closeModal: function () {
            var self = this;

            $('.modal-show').removeClass('modal-show');
            settings.$html
                .removeClass('modal-show')
                .removeAttr('data-modal-effect');

            settings.$window.scrollTop(self.scrollTopPosition);
        }
    },

    /*-----  End of Fitvids  ------*/



    /*================================
    =            Tooltips            =
    ================================*/

    tooltips: {
        tooltipTrigger: null,

        init: function () {
            var self = this;

            if (settings.tooltips.$el.length > 0) {
                settings.tooltips.$el.each(function () {
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
                .append('<div class="' + settings.tooltips.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
                .removeAttr('title');

            self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip__content'));
        },

        triggers: function ($tooltipTrigger) {
            var self = this;

            if (self.tooltipTrigger === 'hover') {
                $tooltipTrigger.on({
                    mouseenter: function () {
                        $(this).addClass(settings.tooltips.tooltipActiveClass);
                    },
                    mouseleave: function () {
                        $(this).removeClass(settings.tooltips.tooltipActiveClass);
                    }
                });
            } else {
                $tooltipTrigger.on('click', function () {
                    $(this).toggleClass(settings.tooltips.tooltipActiveClass);
                });
            }
        },

        calculatePosition: function ($tooltipTrigger, $tooltipContent) {
            var self = this,
                tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
                tooltipContentHeight = $tooltipContent.outerHeight();

            switch ($tooltipTrigger.data('tooltipPosition')) {
                case 'top':
                    $tooltipContent.css({ bottom: tooltipTriggerHeight + settings.tooltips.arrowWidth });
                    break;
                case 'right':
                case 'left':
                    $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                    break;
                case 'bottom':
                    $tooltipContent.css({ top: tooltipTriggerHeight + settings.tooltips.arrowWidth });
                    break;
            }
        }
    },

    /*-----  End of Tooltips  ------*/



    /*=====================================
    =            Notifications            =
    =====================================*/

    notifications: {
        init: function () {
            settings.notifications.$close.on('click', function (event) {
                event.preventDefault();

                var $close = $(this),
                    $notification = $close.parent();

                $notification.addClass('notification--close');

                setTimeout(function () {
                    $notification.remove();
                }, 500);
            });
        }
    },

    /*-----  End of Notifications  ------*/



    /*=================================
    =            Accordion            =
    =================================*/

    accordion: {
        init: function () {
            var self = this;

            if (settings.accordion.$el.length > 0) {
                self.setGroupHeight();
                self.toggler();
                self.forceMaxheight();
            }
        },

        setGroupHeight: function () {
            var self = this;

            settings.accordion.$group.each(function () {
                var $group = $(this),
                    $groupContent = $group.find('.accordion__content');

                $groupContent.removeAttr('style');

                var contentHeight = $groupContent.height();

                $groupContent.attr('data-accordion-content-height', contentHeight);

                if ($groupContent.hasClass(settings.accordion.contentShowClass)) {
                    $groupContent.css({'max-height': contentHeight});
                } else {
                    $groupContent.css({'max-height': 0});
                }
            });
        },

        toggler: function () {
            var self = this;

            settings.accordion.$trigger.on('click', function () {
                var $trigger = $(this),
                    $content = $trigger.next();

                if (!$content.hasClass(settings.accordion.contentShowClass)) {
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
                .addClass(settings.accordion.contentShowClass);
        },

        hideGroup: function ($content) {
            var self = this;

            $content
                .css({'max-height': 0})
                .removeClass(settings.accordion.contentShowClass);
        },

        forceMaxheight: function () {
            var self = this;

            settings.$window.resize(function() {
                self.setGroupHeight();
            });
        }
    },

    /*-----  End of Accordion  ------*/



    /*=======================================
    =            Form validation            =
    =======================================*/

    formValidation: {
        init: function(){
            var self = this;

            if(settings.formValidation.$el.length > 0){
                yepnope.injectJs(basosJsPath + 'plugins/jquery.parsley/i18n/messages.nl.js' + settings.version, function () {
                    yepnope.injectJs(basosJsPath + 'plugins/jquery.parsley/parsley.js' + settings.version,
                        function(){
                            settings.formValidation.$el.parsley({
                                trigger: 'change',
                                successClass: 'form__input--success',
                                errorClass: 'form__input--error',
                                errors: {
                                    classHandler: function (element, isRadioOrCheckbox){
                                        var $element = $(element);

                                        if ($element[0].localName === 'select') {
                                            $($element[0].offsetParent).closest('.form__input').addClass('form__input--select-validated');
                                        }

                                        if (isRadioOrCheckbox) {
                                            return $element.closest('.form__input-list');
                                        } else {
                                            return $element.closest('.form__input');
                                        }
                                    },

                                    container: function (element, isRadioOrCheckbox) {
                                        var $container = element.closest('.form__input');

                                        if ($container.length === 0) {
                                            $container = $("<ul class='parsley-container'></ul>").append($container);
                                        }

                                        return $container;
                                    }
                                }
                            });
                        });
                });
            }
        }
    },

    /*-----  End of Form validation  ------*/



    /*============================
    =            Tabs            =
    ============================*/

    tabs: {
        init: function(){
            var self = this;

            if (settings.tabs.$tab.length > 0) {
                settings.tabs.$tab.on('click', function (event) {
                    var $tab = $(this);

                    event.preventDefault();

                    settings.tabs.$tab.removeClass('tab--active');
                    $tab.addClass('tab--active');

                    $($tab.attr('href'))
                        .addClass('tab-item--active')
                        .siblings()
                        .removeClass('tab-item--active');
                });
            }
        }
    }

    /*-----  End of Tabs  ------*/


};

/*-----  End of Modules  ------*/

modules.init();