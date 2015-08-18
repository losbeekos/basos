'use strict';

/*doc
---
title: Javascript
name: javascript
category: Javascript
---

Javascript

*/

var app = app || {},
    helper = helper || {};

app.path = 'assets/dist/js/';
app.pathBower = 'bower_components/';

yepnope.errorTimeout = 2000;

yepnope([
    {
        load: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js',
        callback: function () {
            if (!window.jQuery) {
                yepnope.injectJs(app.pathBower + 'jquery/dist/jquery.min.js');
            }
        }
    },
    {
        load: app.path + 'app.js'
    }
]);