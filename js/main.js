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
    version: '?v=0.1', // If the file changes, update this number
}

/*-----  End of Default settings  ------*/




/*======================================
=            Modernizr load            =
======================================*/

yepnope.errorTimeout = 2000;

Modernizr.load([


    /*==========  Feature tests  ==========*/

    {
        test : Modernizr.input.placeholder,
        nope : 'js/plugins/jquery.placeholder/jquery.placeholder.min.js'
    },


    /*==========  jQuery  ==========*/

    {
        load: ['http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js'],
        complete: function(url, result, key){
            if (!window.jQuery){
                Modernizr.load('js/vendor/jquery-1.9.1.min.js');
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

                    // Default modules
                    //modules.fancybox.init();
                    //modules.nav.init();
                    modules.fastClick.init();
                    modules.fitVids.init();
                    modules.formValidation.init();
                    modules.modals.init();

                    // App modules
                    //modules.example.init();

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

                    init: function(){
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
                    },

                    openModal: function (_trigger, _modalId) {
                        var self = this,
                            scrollTopPosition = modules.$window.scrollTop(),
                            perspective = _trigger.data('modal-perspective'),
                            $targetModal = $('#' + _modalId);

                        self.scrollTopPosition = scrollTopPosition;

                        if (perspective) {
                            modules.$html.attr('data-modal-perspective', true);
                        }

                        modules.$html
                            .attr('data-modal-show', 'true')
                            .attr('data-modal-effect', $targetModal.data('modal-effect'));

                        $targetModal.addClass('modal-show');

                        modules.$container.scrollTop(scrollTopPosition);
                    },

                    closeModal: function () {
                        var self = this;

                        $('.modal-show').removeClass('modal-show');
                        modules.$html
                            .removeAttr('data-modal-show')
                            .removeAttr('data-modal-effect')
                            .removeAttr('data-modal-perspective');

                        modules.$window.scrollTop(self.scrollTopPosition);
                    }
                }

                /*-----  End of Fitvids  ------*/





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
                                                return $(el).closest('.form-input');
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






            }

            /*-----  End of Modules  ------*/

            modules.init();
        }
    }
]);