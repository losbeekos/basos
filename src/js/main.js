'use strict';

var app = app || {},
    helper = helper || {},
    dist = false;

dist ? app.path = 'dist/js/' : app.path = 'src/js/';
dist ? app.pathBower = 'dist/bower_components/' : app.pathBower = 'src/bower_components/';

yepnope.errorTimeout = 2000;

yepnope([
    {
        load: app.pathBower + 'jquery/dist/jquery.min.js',
    },
    {
        load: app.path +'app.js'
    }
]);