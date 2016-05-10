/*doc
---
title: Javascript
name: 9_javascript
category: Javascript
---

*/

var app = app || {},
	helper = helper || {};

app.settings = {
	$document: $(document),
	$window: $(window),
	windowHeight: $(window).height(),
	windowWidth: $(window).width(),
	$html: $('html'),
	$body: $('body'),
	$htmlAndBody: $('html, body'),
	$background: $('#background'),
	$container: $('#container'),
	$main: $('#main')
};