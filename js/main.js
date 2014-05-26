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



/*===============================
=            Helpers            =
===============================*/

var helpers = {
    createCookie: function(name,value,days) {
        var expires = "";

        if (days) {
            var date = new Date();

            date.setTime(date.getTime()+(days*24*60*60*1000));
            expires = "; expires="+date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
    },

    readCookie: function(name) {
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

    eraseCookie: function(name) {
        helpers.createCookie(name,"",-1);
    }
};

/*-----  End of Helpers  ------*/



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


