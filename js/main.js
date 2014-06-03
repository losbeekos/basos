'use strict';

var app = app || {},
    helper = helper || {};

app.path = 'js/';

yepnope.errorTimeout = 2000;

yepnope([
    {
        load: 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js',
        callback: function () {
            if (!window.jQuery) {
                yepnope(app.path + 'vendor/jquery-1.11.0.min.js');
            }
        }
    },

    {
        load: app.path +'app.js'
    }
]);