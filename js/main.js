"use strict";


/*===============================================
=            Avoid console.log errors           =
===============================================*/

(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/*-----  End of Avoid console.log errors  ------*/




/*========================================
=            Default settings            =
========================================*/

var settings = {
    version: '?v=0.1' // If the file changes, update this number
}

/*-----  End of Default settings  ------*/




/*======================================
=            Modernizr load            =
======================================*/

yepnope.errorTimeout = 2000;

Modernizr.load([


    /*==========  Feature tests  ==========*/
    /*
    {
        test : Modernizr.input.placeholder,
        nope : 'js/plugins/jquery.placeholder/jquery.placeholder.min.js'
    },
    */


    /*==========  jQuery  ==========*/

    {
        load: ['http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'],
        complete: function(url, result, key){
            if (!window.jQuery){
                Modernizr.load('js/vendor/jquery-1.10.2.min.js');
            }

            /*===============================
            =            Modules            =
            ===============================*/

            var modules = {
                $window: $(window),
                $html: $('html'),
                $body: $('body'),
                $container: $('.container'),

                init: function(){

                    $(function(){
                        // Default mzodules
                        //modules.fancybox.init();
                        modules.fastClick.init();
                        modules.fitVids.init();
                        modules.formValidation.init();
                        modules.modals.init();
                        modules.tooltips.init();
                        modules.accordion.init();
                        modules.tabs.init();

                        // App modules
                        //modules.nav.init();
                        //modules.example.init();
                    });

                }




                /*=================================
                =             Example             =
                =================================*/
                /*
                ,example: {
                    init: function(){
                        var self = this;

                        if(self.fancybox.length > 0){
                            yepnope.injectJs('js/plugins/someplugin/someplugin.js' + settings.version,
                                function(){

                                });
                        }
                    }
                }
                */
                /*-----  End of Example  ------*/




                /*==========================================
                =            Primary navigation            =
                ==========================================*/
                /*
                ,nav: {
                    el: $('.nav-primary'),

                    init: function(){
                        var self = this;

                        if(self.el.length > 0){
                            // Do some stuff to the nav
                        }
                    }
                }
                */
                /*-----  End of Primary navigation  ------*/





                /*=================================
                =              Cycle              =
                =================================*/
                /*
                ,cycle: {
                    el: $('.spotlight-wrap', '#spotlight'),

                    init: function(){
                        var self = this;

                        if(self.el.length > 0){
                            yepnope.injectJs('js/plugins/jquery.cycle2/jquery.cycle2.min.js',
                                function(){
                                    self.el.cycle({
                                        slides           : '> .spotlight-item',
                                        pager            : '> .spotlight-pager',
                                        pagerActiveClass : 'spotlight-pager-active',
                                        pauseOnHover     : true,
                                        swipe            : true,
                                        log              : false
                                    });
                                });
                        }
                    }
                }
                */
                /*-----  End of Cycle  ------*/






                /*================================
                =            Fancybox            =
                ================================*/
                /*
                ,fancybox: {
                    el: $('.fancybox'),

                    init: function(){
                        var self = this,
                            urlFancybox = 'js/plugins/jquery.fancybox/jquery.fancybox.pack.js',
                            urlFancyboxMediaHelper = 'js/plugins/jquery.fancybox/helpers/jquery.fancybox-media.min.js';

                        yepnope({
                            test : self.el,
                            yep  : [urlFancybox, urlFancyboxMediaHelper],
                            callback: function (url, result, key) {
                                if(url === urlFancyboxMediaHelper){
                                    self.el.fancybox({
                                        helpers: {
                                            media: true
                                        }
                                    })
                                }
                            }
                        });
                    }
                }
                */
                /*-----  End of Fancybox  ------*/





                /*=================================
                =            Fastclick            =
                =================================*/

                ,fastClick: {
                    init: function(){
                        yepnope.injectJs(
                            'js/plugins/fastclick/fastclick.min.js' + settings.version,
                            function(url, result, key){
                                new FastClick(document.body);
                            }
                        );
                    }
                }

                /*-----  End of Fastclick  ------*/





                /*===============================
                =            Fitvids            =
                ===============================*/

                ,fitVids: {
                    init: function(){
                        yepnope.injectJs(
                            'js/plugins/jquery.fitvids/jquery.fitvids.min.js' + settings.version,
                            function(url, result, key){
                                $('.content').fitVids();
                            }
                        );
                    }
                }

                /*-----  End of Fitvids  ------*/





                /*================================
                =             Modals             =
                ================================*/

                ,modals: {
                    trigger: $('.modal-trigger'),
                    modal: $('.modal'),
                    scrollTopPosition: null,

                    init: function () {
                        var self = this;

                        if (self.trigger.length > 0 && self.modal.length > 0) {
                            modules.$body.append('<div class="modal-overlay"></div>');

                            self.triggers();
                        }
                    },

                    triggers: function () {
                        var self = this;

                        self.trigger.on('click', function (e) {
                            e.preventDefault();

                            var $trigger = $(this);

                            self.openModal($trigger, $trigger.data('modalId'));
                        });

                        $('.modal-overlay').on('click', function (e) {
                            e.preventDefault();
                            self.closeModal();
                        });

                        modules.$body.on('keydown', function(e){
                            if (e.keyCode === 27) {
                                self.closeModal();
                            }
                        });

                        $('.modal-close').on('click', function(e) {
                            e.preventDefault();
                            self.closeModal();
                        });
                    },

                    openModal: function (_trigger, _modalId) {
                        var self = this,
                            scrollTopPosition = modules.$window.scrollTop(),
                            $targetModal = $('#' + _modalId);

                        self.scrollTopPosition = scrollTopPosition;

                        modules.$html
                            .addClass('modal-show')
                            .attr('data-modal-effect', $targetModal.data('modal-effect'));

                        $targetModal.addClass('modal-show');

                        modules.$container.scrollTop(scrollTopPosition);
                    },

                    closeModal: function () {
                        var self = this;

                        $('.modal-show').removeClass('modal-show');
                        modules.$html
                            .removeClass('modal-show')
                            .removeAttr('data-modal-effect');

                        modules.$window.scrollTop(self.scrollTopPosition);
                    }
                }

                /*-----  End of Fitvids  ------*/





                /*================================
                =            Tooltips            =
                ================================*/

                ,tooltips: {
                    el: $('.tooltip'),
                    tooltipTrigger: null,
                    tooltipActiveClass: 'tooltip-active',
                    tooltipContentClass: 'tooltip-content',
                    arrowWidth: 8,

                    init: function () {
                        var self = this;

                        if (self.el.length > 0) {
                            self.el.each(function () {
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
                            .append('<div class="' + self.tooltipContentClass + '">' + $tooltipTrigger.attr('title') + '</div>')
                            .removeAttr('title');

                        self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip-content'));
                    },

                    triggers: function ($tooltipTrigger) {
                        var self = this;

                        if (self.tooltipTrigger === 'hover') {
                            $tooltipTrigger.on({
                                mouseenter: function () {
                                    $(this).addClass(self.tooltipActiveClass);
                                },
                                mouseleave: function () {
                                    $(this).removeClass(self.tooltipActiveClass);
                                }
                            });
                        } else {
                            $tooltipTrigger.on('click', function () {
                                $(this).toggleClass(self.tooltipActiveClass);
                            });
                        }
                    },

                    calculatePosition: function ($tooltipTrigger, $tooltipContent) {
                        var self = this,
                            tooltipTriggerHeight = $tooltipTrigger.outerHeight(),
                            tooltipContentHeight = $tooltipContent.outerHeight();

                        switch ($tooltipTrigger.data('tooltipPosition')) {
                            case 'top':
                                $tooltipContent.css({ bottom: tooltipTriggerHeight + self.arrowWidth });
                                break;
                            case 'right':
                            case 'left':
                                $tooltipContent.css({ 'margin-top': -(tooltipContentHeight/2) });
                                break;
                            case 'bottom':
                                $tooltipContent.css({ top: tooltipTriggerHeight + self.arrowWidth });
                                break;
                        }
                    }
                }

                /*-----  End of Tooltips  ------*/




                /*=================================
                =            Accordion            =
                =================================*/

                ,accordion: {
                    el: $('.accordion'),
                    group: $('.accordion-group'),
                    trigger: $('.accordion-trigger'),
                    content: $('.accordion-content'),
                    contentShowClass: 'accordion-show',

                    init: function () {
                        var self = this;

                        if (self.el.length > 0) {
                            self.group.each(function () {
                                var $group = $(this),
                                    $groupContent = $group.find('.accordion-content'),
                                    contentHeight = $groupContent.height();

                                $groupContent.attr('data-accordion-content-height', contentHeight)

                                if ($groupContent.hasClass(self.contentShowClass)) {
                                    $groupContent.css({'max-height': contentHeight});
                                } else {
                                    $groupContent.css({'max-height': 0});
                                }
                            });

                            self.toggler();
                            self.forceMaxheight();
                        }
                    },

                    toggler: function () {
                        var self = this;

                        self.trigger.on('click', function () {
                            var $trigger = $(this),
                                $content = $trigger.next();

                            if (!$content.hasClass(self.contentShowClass)) {
                                self.hideGroup(self.content);
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
                            .addClass(self.contentShowClass);
                    },

                    hideGroup: function ($content) {
                        var self = this;

                        $content
                            .css({'max-height': 0})
                            .removeClass(self.contentShowClass);
                    },

                    forceMaxheight: function () {
                        var self = this;

                        modules.$window.resize(function() {
                            self.content.addClass('accordion-force-maxheight');
                        });
                    }
                }

                /*-----  End of Accordion  ------*/





                /*=======================================
                =            Form validation            =
                =======================================*/

                ,formValidation: {
                    el: $('.form-validate'),

                    init: function(){
                        var self = this;

                        if(self.el.length > 0){
                            yepnope.injectJs('js/plugins/jquery.parsley/i18n/messages.nl.js' + settings.version);
                            yepnope.injectJs('js/plugins/jquery.parsley/parsley.js' + settings.version,
                                function(){
                                    self.el.parsley({
                                        trigger: 'change',
                                        errors: {
                                            classHandler: function (el, isRadioOrCheckbox){
                                                return $(el).closest('.form-input, .form-select');
                                            }
                                        },

                                        validators: {
                                            iban: function () {
                                                return val % multiple === 0;
                                            }
                                        },

                                        messages: {
                                          iban: "Dit is geen geldig IBAN-nummer."
                                        }

                                    });
                                });
                        }
                    }
                }

                /*-----  End of Form validation  ------*/





                /*============================
                =            Tabs            =
                ============================*/



                ,tabs: {
                    nav: $('.tabs'),
                    tab: $('.tab'),
                    content: $('.tab-content'),

                    init: function(){
                        var self = this;

                        if (self.tab.length > 0) {
                            self.tab.on('click', function (e) {
                                var $tab = $(this);

                                e.preventDefault();

                                self.tab.removeClass('active');
                                $tab.addClass('active');

                                $($tab.attr('href'))
                                    .addClass('active')
                                    .siblings()
                                    .removeClass('active');
                            });
                        }
                    }
                }

                /*-----  End of Tabs  ------*/






            }

            /*-----  End of Modules  ------*/

            modules.init();
        }
    }
]);