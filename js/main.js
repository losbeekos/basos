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
				init: function(){
					var modules = this;

					$(function(){
						// Default modules
						modules.fancybox.init();
						modules.nav.init();
						modules.fastClick.init();
						modules.fitVids.init();
						modules.formValidation.init();

						// App modules
						modules.example.init();
					});
				}




				/*=================================
				=             Example             =
				=================================*/

				,example: {
				    init: function(){
				    	/*
						var self = this;

						if(self.fancybox.length > 0){
							yepnope.injectJs('js/plugins/someplugin/someplugin.js' + settings.version,
								function(){
									
								});
						}
						*/
				    }
				}

				/*-----  End of Example  ------*/
				




				/*================================
				=            Fancybox            =
				================================*/
				
				,fancybox: {
					el: $('.fancybox'),

					init: function(){
						var self = this;

						if(self.el.length > 0){
				        	yepnope.injectJs('js/plugins/jquery.fancybox/jquery.fancybox.min.js' + settings.version);
				        	yepnope.injectJs('js/plugins/jquery.fancybox/helpers/jquery.fancybox-media.min.js' + settings.version,
								function(){
									self.el.fancybox({
							            helpers: {
							                media: true
							            }
							        });
								});
						}
					}
				}
				
				/*-----  End of Fancybox  ------*/




				/*==========================================
				=            Primary navigation            =
				==========================================*/
				
				,nav: {
					el: $('.nav-primary'),

					init: function(){
						var self = this;

						if(self.el.length > 0){
							// Do some stuff to the nav
						}
					}
				}
				
				/*-----  End of Primary navigation  ------*/
				




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