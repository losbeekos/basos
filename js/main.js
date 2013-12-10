'use strict';


/*===============================================
=            Avoid console.log errors           =
===============================================*/

(function () {
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
        complete: function (url, result, key) {
            if (!window.jQuery) {
                Modernizr.load('js/vendor/jquery-1.10.2.min.js');
            }


            /*==================================
            =             Settings             =
            ==================================*/

            var settings = {
                version: '?v=0.1', // If the file changes, update this number
                $document: $(document)
                ,$window: $(window)
                ,$html: $('html')
                ,$body: $('body')
                ,$container: $('#container')
                ,$main: $('#main')


                /*==========  Primary nav  ==========*/

                ,navPrimary: {
                    $el: $('.nav-primary')
                }


                /*==========  Modals  ==========*/

                ,modals: {
                    $trigger: $('.modal-trigger')
                    ,$modal: $('.modal')
                }


                /*==========  Cycle  ==========*/

                ,cycle: {
                    $el: $('.spotlight-wrap', '#spotlight')
                    ,slides: '> .spotlight-item'
                    ,pager : '> .spotlight-pager'
                    ,pagerActiveClass: 'spotlight-pager-active'
                }


                /*==========  Tooltips  ==========*/

                ,tooltips: {
                    $el: $('.tooltip')
                    ,tooltipActiveClass: 'tooltip-active'
                    ,tooltipContentClass: 'tooltip-content'
                    ,arrowWidth: 8
                }

                /*==========  Accordion  ==========*/

                ,accordion: {
                    $el: $('.accordion')
                    ,$group: $('.accordion-group')
                    ,$trigger: $('.accordion-trigger')
                    ,$content: $('.accordion-content')
                    ,contentShowClass: 'accordion-show'
                }


                /*==========  Form validation  ==========*/

                ,formValidation: {
                    $el: $('.form-validate')
                }


                /*==========  Tabs  ==========*/

                ,tabs: {
                    $nav: $('.tabs')
                    ,$tab: $('.tab')
                    ,$content: $('.tab-content')
                }

            }



            /*===============================
            =            Modules            =
            ===============================*/

            ,modules = {
                init: function(){

                    $(function(){
                        // Default modules
                        modules.fastClick.init();
                        modules.fitVids.init();
                        modules.formValidation.init();
                        modules.modals.init();
                        modules.tooltips.init();
                        modules.accordion.init();
                        modules.tabs.init();
                        //modules.fancybox.init();

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

                        if(settings.something.$el.length > 0){
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
                ,navPrimary: {
                    var self = this;

                    init: function(){
                        var self = this;

                        if(settings.primaryNav.$el.length > 0){
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
                    init: function(){
                        var self = this;

                        if(settings.cycle.$el.el.length > 0){
                            yepnope.injectJs('js/plugins/jquery.cycle2/jquery.cycle2.min.js',
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
                                settings.$main.fitVids();
                            }
                        );
                    }
                }

                /*-----  End of Fitvids  ------*/





                /*================================
                =             Modals             =
                ================================*/

                ,modals: {
                    scrollTopPosition: null

                    ,init: function () {
                        var self = this;

                        if (settings.modals.$trigger.length > 0 && settings.modals.$modal.length > 0) {
                            settings.$body.append('<div class="modal-overlay"></div>');

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

                        $('.modal-overlay').on('click', function (event) {
                            event.preventDefault();
                            self.closeModal();
                        });

                        settings.$body.on('keydown', function(event){
                            if (e.keyCode === 27) {
                                self.closeModal();
                            }
                        });

                        $('.modal-close').on('click', function(event) {
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
                }

                /*-----  End of Fitvids  ------*/





                /*================================
                =            Tooltips            =
                ================================*/

                ,tooltips: {
                    tooltipTrigger: null

                    ,init: function () {
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

                        self.calculatePosition($tooltipTrigger, $tooltipTrigger.find('.tooltip-content'));
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
                }

                /*-----  End of Tooltips  ------*/




                /*=================================
                =            Accordion            =
                =================================*/

                ,accordion: {
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
                                $groupContent = $group.find('.accordion-content');

                            $groupContent.removeAttr('style');

                            var contentHeight = $groupContent.height();

                            $groupContent.attr('data-accordion-content-height', contentHeight)

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
                                self.hideGroup(settings.accordion.$content);
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
                }

                /*-----  End of Accordion  ------*/





                /*=======================================
                =            Form validation            =
                =======================================*/

                ,formValidation: {
                    init: function(){
                        var self = this;

                        if(settings.formValidation.$el.length > 0){
                            yepnope.injectJs('js/plugins/jquery.parsley/i18n/messages.nl.js' + settings.version);
                            yepnope.injectJs('js/plugins/jquery.parsley/parsley.js' + settings.version,
                                function(){
                                    settings.formValidation.$el.parsley({
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
                    init: function(){
                        var self = this;

                        if (settings.tabs.$tab.length > 0) {
                            settings.tabs.$tab.on('click', function (event) {
                                var $tab = $(this);

                                event.preventDefault();

                                settings.tabs.$tab.removeClass('active');
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