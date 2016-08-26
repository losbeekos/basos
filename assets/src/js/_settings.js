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
	// Nodes
	html: document.querySelector('html'),
	body: document.body,
	container: document.getElementById('container'),

	// jQuery objects
	$document: $(document),
	$window: $(window),
	$html: $('html'),
	$body: $('body'),
	$htmlAndBody: $('html, body'),
	$background: $('#background'),
	$container: $('#container'),
	$main: $('#main'),

	// Misc.
	windowHeight: $(window).height(),
	windowWidth: $(window).width(),
};