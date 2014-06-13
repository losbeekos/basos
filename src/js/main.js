'use strict';

var app = app || {},
    helper = helper || {},
    dist = false,
    cwd = null;

dist ? cwd = 'dist/' : cwd = 'src/';
dist ? app.path = cwd + 'js/' : app.path = cwd + 'js/';
dist ? app.pathBower = cwd + 'bower_components/' : app.pathBower = cwd + 'bower_components/';

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