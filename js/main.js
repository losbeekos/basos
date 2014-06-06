'use strict';

var app = app || {},
    helper = helper || {},
    dist = false;

app.path = 'js/';
dist ? app.pathBower = app.path+'components/' : app.pathBower = app.path+'bower_components/';

yepnope.errorTimeout = 2000;

yepnope([
    {
        load: app.pathBower + 'jquery/dist/jquery.min.js',
    },
    {
        load: app.path +'app.js'
    }
]);