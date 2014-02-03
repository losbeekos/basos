'use strict';



/*====================================
=            Base JS path            =
====================================*/

var basosJsPath = 'js/';



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

yepnope([
    {
        load: 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',
        callback: function () {
            if (!window.jQuery) {
                yepnope(basosJsPath + 'vendor/jquery-1.11.0.min.js');
            }
        }
    },

    {
        load: basosJsPath +'app.js'
    }
]);

/*-----  End of Modernizr load  ------*/


