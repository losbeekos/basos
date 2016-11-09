;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

/*!
* Parsley.js
* Version 2.4.4 - built Thu, Aug 4th 2016, 9:54 pm
* http://parsleyjs.org
* Guillaume Potier - <guillaume@wisembly.com>
* Marc-Andre Lafortune - <petroselinum@marc-andre.ca>
* MIT Licensed
*/

// The source code below is generated by babel as
// Parsley is written in ECMAScript 6
//
var _slice = Array.prototype.slice;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) : typeof define === 'function' && define.amd ? define(['jquery'], factory) : global.parsley = factory(global.jQuery);
})(this, function ($) {
  'use strict';

  var globalID = 1;
  var pastWarnings = {};

  var ParsleyUtils__ParsleyUtils = {
    // Parsley DOM-API
    // returns object from dom attributes and values
    attr: function attr($element, namespace, obj) {
      var i;
      var attribute;
      var attributes;
      var regex = new RegExp('^' + namespace, 'i');

      if ('undefined' === typeof obj) obj = {};else {
        // Clear all own properties. This won't affect prototype's values
        for (i in obj) {
          if (obj.hasOwnProperty(i)) delete obj[i];
        }
      }

      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return obj;

      attributes = $element[0].attributes;
      for (i = attributes.length; i--;) {
        attribute = attributes[i];

        if (attribute && attribute.specified && regex.test(attribute.name)) {
          obj[this.camelize(attribute.name.slice(namespace.length))] = this.deserializeValue(attribute.value);
        }
      }

      return obj;
    },

    checkAttr: function checkAttr($element, namespace, _checkAttr) {
      return $element.is('[' + namespace + _checkAttr + ']');
    },

    setAttr: function setAttr($element, namespace, attr, value) {
      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
    },

    generateID: function generateID() {
      return '' + globalID++;
    },

    /** Third party functions **/
    // Zepto deserialize function
    deserializeValue: function deserializeValue(value) {
      var num;

      try {
        return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
      } catch (e) {
        return value;
      }
    },

    // Zepto camelize function
    camelize: function camelize(str) {
      return str.replace(/-+(.)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },

    // Zepto dasherize function
    dasherize: function dasherize(str) {
      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
    },

    warn: function warn() {
      var _window$console;

      if (window.console && 'function' === typeof window.console.warn) (_window$console = window.console).warn.apply(_window$console, arguments);
    },

    warnOnce: function warnOnce(msg) {
      if (!pastWarnings[msg]) {
        pastWarnings[msg] = true;
        this.warn.apply(this, arguments);
      }
    },

    _resetWarnings: function _resetWarnings() {
      pastWarnings = {};
    },

    trimString: function trimString(string) {
      return string.replace(/^\s+|\s+$/g, '');
    },

    namespaceEvents: function namespaceEvents(events, namespace) {
      events = this.trimString(events || '').split(/\s+/);
      if (!events[0]) return '';
      return $.map(events, function (evt) {
        return evt + '.' + namespace;
      }).join(' ');
    },

    difference: function difference(array, remove) {
      // This is O(N^2), should be optimized
      var result = [];
      $.each(array, function (_, elem) {
        if (remove.indexOf(elem) == -1) result.push(elem);
      });
      return result;
    },

    // Alter-ego to native Promise.all, but for jQuery
    all: function all(promises) {
      // jQuery treats $.when() and $.when(singlePromise) differently; let's avoid that and add spurious elements
      return $.when.apply($, _toConsumableArray(promises).concat([42, 42]));
    },

    // Object.create polyfill, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill
    objectCreate: Object.create || (function () {
      var Object = function Object() {};
      return function (prototype) {
        if (arguments.length > 1) {
          throw Error('Second argument not supported');
        }
        if (typeof prototype != 'object') {
          throw TypeError('Argument must be an object');
        }
        Object.prototype = prototype;
        var result = new Object();
        Object.prototype = null;
        return result;
      };
    })(),

    _SubmitSelector: 'input[type="submit"], button:submit'
  };

  var ParsleyUtils__default = ParsleyUtils__ParsleyUtils;

  // All these options could be overriden and specified directly in DOM using
  // `data-parsley-` default DOM-API
  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
  // eg: `data-parsley-stop-on-first-failing-constraint="false"`

  var ParsleyDefaults = {
    // ### General

    // Default data-namespace for DOM API
    namespace: 'data-parsley-',

    // Supported inputs by default
    inputs: 'input, textarea, select',

    // Excluded inputs by default
    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',

    // Stop validating field on highest priority failing constraint
    priorityEnabled: true,

    // ### Field only

    // identifier used to group together inputs (e.g. radio buttons...)
    multiple: null,

    // identifier (or array of identifiers) used to validate only a select group of inputs
    group: null,

    // ### UI
    // Enable\Disable error messages
    uiEnabled: true,

    // Key events threshold before validation
    validationThreshold: 3,

    // Focused field on form validation error. 'first'|'last'|'none'
    focus: 'first',

    // event(s) that will trigger validation before first failure. eg: `input`...
    trigger: false,

    // event(s) that will trigger validation after first failure.
    triggerAfterFailure: 'input',

    // Class that would be added on every failing validation Parsley field
    errorClass: 'parsley-error',

    // Same for success validation
    successClass: 'parsley-success',

    // Return the `$element` that will receive these above success or error classes
    // Could also be (and given directly from DOM) a valid selector like `'#div'`
    classHandler: function classHandler(ParsleyField) {},

    // Return the `$element` where errors will be appended
    // Could also be (and given directly from DOM) a valid selector like `'#div'`
    errorsContainer: function errorsContainer(ParsleyField) {},

    // ul elem that would receive errors' list
    errorsWrapper: '<ul class="parsley-errors-list"></ul>',

    // li elem that would receive error message
    errorTemplate: '<li></li>'
  };

  var ParsleyAbstract = function ParsleyAbstract() {
    this.__id__ = ParsleyUtils__default.generateID();
  };

  ParsleyAbstract.prototype = {
    asyncSupport: true, // Deprecated

    _pipeAccordingToValidationResult: function _pipeAccordingToValidationResult() {
      var _this = this;

      var pipe = function pipe() {
        var r = $.Deferred();
        if (true !== _this.validationResult) r.reject();
        return r.resolve().promise();
      };
      return [pipe, pipe];
    },

    actualizeOptions: function actualizeOptions() {
      ParsleyUtils__default.attr(this.$element, this.options.namespace, this.domOptions);
      if (this.parent && this.parent.actualizeOptions) this.parent.actualizeOptions();
      return this;
    },

    _resetOptions: function _resetOptions(initOptions) {
      this.domOptions = ParsleyUtils__default.objectCreate(this.parent.options);
      this.options = ParsleyUtils__default.objectCreate(this.domOptions);
      // Shallow copy of ownProperties of initOptions:
      for (var i in initOptions) {
        if (initOptions.hasOwnProperty(i)) this.options[i] = initOptions[i];
      }
      this.actualizeOptions();
    },

    _listeners: null,

    // Register a callback for the given event name
    // Callback is called with context as the first argument and the `this`
    // The context is the current parsley instance, or window.Parsley if global
    // A return value of `false` will interrupt the calls
    on: function on(name, fn) {
      this._listeners = this._listeners || {};
      var queue = this._listeners[name] = this._listeners[name] || [];
      queue.push(fn);

      return this;
    },

    // Deprecated. Use `on` instead
    subscribe: function subscribe(name, fn) {
      $.listenTo(this, name.toLowerCase(), fn);
    },

    // Unregister a callback (or all if none is given) for the given event name
    off: function off(name, fn) {
      var queue = this._listeners && this._listeners[name];
      if (queue) {
        if (!fn) {
          delete this._listeners[name];
        } else {
          for (var i = queue.length; i--;) if (queue[i] === fn) queue.splice(i, 1);
        }
      }
      return this;
    },

    // Deprecated. Use `off`
    unsubscribe: function unsubscribe(name, fn) {
      $.unsubscribeTo(this, name.toLowerCase());
    },

    // Trigger an event of the given name
    // A return value of `false` interrupts the callback chain
    // Returns false if execution was interrupted
    trigger: function trigger(name, target, extraArg) {
      target = target || this;
      var queue = this._listeners && this._listeners[name];
      var result;
      var parentResult;
      if (queue) {
        for (var i = queue.length; i--;) {
          result = queue[i].call(target, target, extraArg);
          if (result === false) return result;
        }
      }
      if (this.parent) {
        return this.parent.trigger(name, target, extraArg);
      }
      return true;
    },

    // Reset UI
    reset: function reset() {
      // Field case: just emit a reset event for UI
      if ('ParsleyForm' !== this.__class__) {
        this._resetUI();
        return this._trigger('reset');
      }

      // Form case: emit a reset event for each field
      for (var i = 0; i < this.fields.length; i++) this.fields[i].reset();

      this._trigger('reset');
    },

    // Destroy Parsley instance (+ UI)
    destroy: function destroy() {
      // Field case: emit destroy event to clean UI and then destroy stored instance
      this._destroyUI();
      if ('ParsleyForm' !== this.__class__) {
        this.$element.removeData('Parsley');
        this.$element.removeData('ParsleyFieldMultiple');
        this._trigger('destroy');

        return;
      }

      // Form case: destroy all its fields and then destroy stored instance
      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();

      this.$element.removeData('Parsley');
      this._trigger('destroy');
    },

    asyncIsValid: function asyncIsValid(group, force) {
      ParsleyUtils__default.warnOnce("asyncIsValid is deprecated; please use whenValid instead");
      return this.whenValid({ group: group, force: force });
    },

    _findRelated: function _findRelated() {
      return this.options.multiple ? this.parent.$element.find('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]') : this.$element;
    }
  };

  var requirementConverters = {
    string: function string(_string) {
      return _string;
    },
    integer: function integer(string) {
      if (isNaN(string)) throw 'Requirement is not an integer: "' + string + '"';
      return parseInt(string, 10);
    },
    number: function number(string) {
      if (isNaN(string)) throw 'Requirement is not a number: "' + string + '"';
      return parseFloat(string);
    },
    reference: function reference(string) {
      // Unused for now
      var result = $(string);
      if (result.length === 0) throw 'No such reference: "' + string + '"';
      return result;
    },
    boolean: function boolean(string) {
      return string !== 'false';
    },
    object: function object(string) {
      return ParsleyUtils__default.deserializeValue(string);
    },
    regexp: function regexp(_regexp) {
      var flags = '';

      // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
      if (/^\/.*\/(?:[gimy]*)$/.test(_regexp)) {
        // Replace the regexp literal string with the first match group: ([gimy]*)
        // If no flag is present, this will be a blank string
        flags = _regexp.replace(/.*\/([gimy]*)$/, '$1');
        // Again, replace the regexp literal string with the first match group:
        // everything excluding the opening and closing slashes and the flags
        _regexp = _regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
      } else {
        // Anchor regexp:
        _regexp = '^' + _regexp + '$';
      }
      return new RegExp(_regexp, flags);
    }
  };

  var convertArrayRequirement = function convertArrayRequirement(string, length) {
    var m = string.match(/^\s*\[(.*)\]\s*$/);
    if (!m) throw 'Requirement is not an array: "' + string + '"';
    var values = m[1].split(',').map(ParsleyUtils__default.trimString);
    if (values.length !== length) throw 'Requirement has ' + values.length + ' values when ' + length + ' are needed';
    return values;
  };

  var convertRequirement = function convertRequirement(requirementType, string) {
    var converter = requirementConverters[requirementType || 'string'];
    if (!converter) throw 'Unknown requirement specification: "' + requirementType + '"';
    return converter(string);
  };

  var convertExtraOptionRequirement = function convertExtraOptionRequirement(requirementSpec, string, extraOptionReader) {
    var main = null;
    var extra = {};
    for (var key in requirementSpec) {
      if (key) {
        var value = extraOptionReader(key);
        if ('string' === typeof value) value = convertRequirement(requirementSpec[key], value);
        extra[key] = value;
      } else {
        main = convertRequirement(requirementSpec[key], string);
      }
    }
    return [main, extra];
  };

  // A Validator needs to implement the methods `validate` and `parseRequirements`

  var ParsleyValidator = function ParsleyValidator(spec) {
    $.extend(true, this, spec);
  };

  ParsleyValidator.prototype = {
    // Returns `true` iff the given `value` is valid according the given requirements.
    validate: function validate(value, requirementFirstArg) {
      if (this.fn) {
        // Legacy style validator

        if (arguments.length > 3) // If more args then value, requirement, instance...
          requirementFirstArg = [].slice.call(arguments, 1, -1); // Skip first arg (value) and last (instance), combining the rest
        return this.fn.call(this, value, requirementFirstArg);
      }

      if ($.isArray(value)) {
        if (!this.validateMultiple) throw 'Validator `' + this.name + '` does not handle multiple values';
        return this.validateMultiple.apply(this, arguments);
      } else {
        if (this.validateNumber) {
          if (isNaN(value)) return false;
          arguments[0] = parseFloat(arguments[0]);
          return this.validateNumber.apply(this, arguments);
        }
        if (this.validateString) {
          return this.validateString.apply(this, arguments);
        }
        throw 'Validator `' + this.name + '` only handles multiple values';
      }
    },

    // Parses `requirements` into an array of arguments,
    // according to `this.requirementType`
    parseRequirements: function parseRequirements(requirements, extraOptionReader) {
      if ('string' !== typeof requirements) {
        // Assume requirement already parsed
        // but make sure we return an array
        return $.isArray(requirements) ? requirements : [requirements];
      }
      var type = this.requirementType;
      if ($.isArray(type)) {
        var values = convertArrayRequirement(requirements, type.length);
        for (var i = 0; i < values.length; i++) values[i] = convertRequirement(type[i], values[i]);
        return values;
      } else if ($.isPlainObject(type)) {
        return convertExtraOptionRequirement(type, requirements, extraOptionReader);
      } else {
        return [convertRequirement(type, requirements)];
      }
    },
    // Defaults:
    requirementType: 'string',

    priority: 2

  };

  var ParsleyValidatorRegistry = function ParsleyValidatorRegistry(validators, catalog) {
    this.__class__ = 'ParsleyValidatorRegistry';

    // Default Parsley locale is en
    this.locale = 'en';

    this.init(validators || {}, catalog || {});
  };

  var typeRegexes = {
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    // Follow https://www.w3.org/TR/html5/infrastructure.html#floating-point-numbers
    number: /^-?(\d*\.)?\d+(e[-+]?\d+)?$/i,

    integer: /^-?\d+$/,

    digits: /^\d+$/,

    alphanum: /^\w+$/i,

    url: new RegExp("^" +
    // protocol identifier
    "(?:(?:https?|ftp)://)?" + // ** mod: make scheme optional
    // user:pass authentication
    "(?:\\S+(?::\\S*)?@)?" + "(?:" +
    // IP address exclusion
    // private & local networks
    // "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +   // ** mod: allow local networks
    // "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +  // ** mod: allow local networks
    // "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +  // ** mod: allow local networks
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" +
    // host name
    '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
    // domain name
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
    // TLD identifier
    '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + ")" +
    // port number
    "(?::\\d{2,5})?" +
    // resource path
    "(?:/\\S*)?" + "$", 'i')
  };
  typeRegexes.range = typeRegexes.number;

  // See http://stackoverflow.com/a/10454560/8279
  var decimalPlaces = function decimalPlaces(num) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      return 0;
    }
    return Math.max(0,
    // Number of digits right of decimal point.
    (match[1] ? match[1].length : 0) - (
    // Adjust for scientific notation.
    match[2] ? +match[2] : 0));
  };

  ParsleyValidatorRegistry.prototype = {
    init: function init(validators, catalog) {
      this.catalog = catalog;
      // Copy prototype's validators:
      this.validators = $.extend({}, this.validators);

      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority);

      window.Parsley.trigger('parsley:validator:init');
    },

    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
    setLocale: function setLocale(locale) {
      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');

      this.locale = locale;

      return this;
    },

    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
    addCatalog: function addCatalog(locale, messages, set) {
      if ('object' === typeof messages) this.catalog[locale] = messages;

      if (true === set) return this.setLocale(locale);

      return this;
    },

    // Add a specific message for a given constraint in a given locale
    addMessage: function addMessage(locale, name, message) {
      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};

      this.catalog[locale][name] = message;

      return this;
    },

    // Add messages for a given locale
    addMessages: function addMessages(locale, nameMessageObject) {
      for (var name in nameMessageObject) this.addMessage(locale, name, nameMessageObject[name]);

      return this;
    },

    // Add a new validator
    //
    //    addValidator('custom', {
    //        requirementType: ['integer', 'integer'],
    //        validateString: function(value, from, to) {},
    //        priority: 22,
    //        messages: {
    //          en: "Hey, that's no good",
    //          fr: "Aye aye, pas bon du tout",
    //        }
    //    })
    //
    // Old API was addValidator(name, function, priority)
    //
    addValidator: function addValidator(name, arg1, arg2) {
      if (this.validators[name]) ParsleyUtils__default.warn('Validator "' + name + '" is already defined.');else if (ParsleyDefaults.hasOwnProperty(name)) {
        ParsleyUtils__default.warn('"' + name + '" is a restricted keyword and is not a valid validator name.');
        return;
      }
      return this._setValidator.apply(this, arguments);
    },

    updateValidator: function updateValidator(name, arg1, arg2) {
      if (!this.validators[name]) {
        ParsleyUtils__default.warn('Validator "' + name + '" is not already defined.');
        return this.addValidator.apply(this, arguments);
      }
      return this._setValidator.apply(this, arguments);
    },

    removeValidator: function removeValidator(name) {
      if (!this.validators[name]) ParsleyUtils__default.warn('Validator "' + name + '" is not defined.');

      delete this.validators[name];

      return this;
    },

    _setValidator: function _setValidator(name, validator, priority) {
      if ('object' !== typeof validator) {
        // Old style validator, with `fn` and `priority`
        validator = {
          fn: validator,
          priority: priority
        };
      }
      if (!validator.validate) {
        validator = new ParsleyValidator(validator);
      }
      this.validators[name] = validator;

      for (var locale in validator.messages || {}) this.addMessage(locale, name, validator.messages[locale]);

      return this;
    },

    getErrorMessage: function getErrorMessage(constraint) {
      var message;

      // Type constraints are a bit different, we have to match their requirements too to find right error message
      if ('type' === constraint.name) {
        var typeMessages = this.catalog[this.locale][constraint.name] || {};
        message = typeMessages[constraint.requirements];
      } else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);

      return message || this.catalog[this.locale].defaultMessage || this.catalog.en.defaultMessage;
    },

    // Kind of light `sprintf()` implementation
    formatMessage: function formatMessage(string, parameters) {
      if ('object' === typeof parameters) {
        for (var i in parameters) string = this.formatMessage(string, parameters[i]);

        return string;
      }

      return 'string' === typeof string ? string.replace(/%s/i, parameters) : '';
    },

    // Here is the Parsley default validators list.
    // A validator is an object with the following key values:
    //  - priority: an integer
    //  - requirement: 'string' (default), 'integer', 'number', 'regexp' or an Array of these
    //  - validateString, validateMultiple, validateNumber: functions returning `true`, `false` or a promise
    // Alternatively, a validator can be a function that returns such an object
    //
    validators: {
      notblank: {
        validateString: function validateString(value) {
          return (/\S/.test(value)
          );
        },
        priority: 2
      },
      required: {
        validateMultiple: function validateMultiple(values) {
          return values.length > 0;
        },
        validateString: function validateString(value) {
          return (/\S/.test(value)
          );
        },
        priority: 512
      },
      type: {
        validateString: function validateString(value, type) {
          var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

          var _ref$step = _ref.step;
          var step = _ref$step === undefined ? '1' : _ref$step;
          var _ref$base = _ref.base;
          var base = _ref$base === undefined ? 0 : _ref$base;

          var regex = typeRegexes[type];
          if (!regex) {
            throw new Error('validator type `' + type + '` is not supported');
          }
          if (!regex.test(value)) return false;
          if ('number' === type) {
            if (!/^any$/i.test(step || '')) {
              var nb = Number(value);
              var decimals = Math.max(decimalPlaces(step), decimalPlaces(base));
              if (decimalPlaces(nb) > decimals) // Value can't have too many decimals
                return false;
              // Be careful of rounding errors by using integers.
              var toInt = function toInt(f) {
                return Math.round(f * Math.pow(10, decimals));
              };
              if ((toInt(nb) - toInt(base)) % toInt(step) != 0) return false;
            }
          }
          return true;
        },
        requirementType: {
          '': 'string',
          step: 'string',
          base: 'number'
        },
        priority: 256
      },
      pattern: {
        validateString: function validateString(value, regexp) {
          return regexp.test(value);
        },
        requirementType: 'regexp',
        priority: 64
      },
      minlength: {
        validateString: function validateString(value, requirement) {
          return value.length >= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      maxlength: {
        validateString: function validateString(value, requirement) {
          return value.length <= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      length: {
        validateString: function validateString(value, min, max) {
          return value.length >= min && value.length <= max;
        },
        requirementType: ['integer', 'integer'],
        priority: 30
      },
      mincheck: {
        validateMultiple: function validateMultiple(values, requirement) {
          return values.length >= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      maxcheck: {
        validateMultiple: function validateMultiple(values, requirement) {
          return values.length <= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      check: {
        validateMultiple: function validateMultiple(values, min, max) {
          return values.length >= min && values.length <= max;
        },
        requirementType: ['integer', 'integer'],
        priority: 30
      },
      min: {
        validateNumber: function validateNumber(value, requirement) {
          return value >= requirement;
        },
        requirementType: 'number',
        priority: 30
      },
      max: {
        validateNumber: function validateNumber(value, requirement) {
          return value <= requirement;
        },
        requirementType: 'number',
        priority: 30
      },
      range: {
        validateNumber: function validateNumber(value, min, max) {
          return value >= min && value <= max;
        },
        requirementType: ['number', 'number'],
        priority: 30
      },
      equalto: {
        validateString: function validateString(value, refOrValue) {
          var $reference = $(refOrValue);
          if ($reference.length) return value === $reference.val();else return value === refOrValue;
        },
        priority: 256
      }
    }
  };

  var ParsleyUI = {};

  var diffResults = function diffResults(newResult, oldResult, deep) {
    var added = [];
    var kept = [];

    for (var i = 0; i < newResult.length; i++) {
      var found = false;

      for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
        found = true;
        break;
      }

      if (found) kept.push(newResult[i]);else added.push(newResult[i]);
    }

    return {
      kept: kept,
      added: added,
      removed: !deep ? diffResults(oldResult, newResult, true).added : []
    };
  };

  ParsleyUI.Form = {

    _actualizeTriggers: function _actualizeTriggers() {
      var _this2 = this;

      this.$element.on('submit.Parsley', function (evt) {
        _this2.onSubmitValidate(evt);
      });
      this.$element.on('click.Parsley', ParsleyUtils__default._SubmitSelector, function (evt) {
        _this2.onSubmitButton(evt);
      });

      // UI could be disabled
      if (false === this.options.uiEnabled) return;

      this.$element.attr('novalidate', '');
    },

    focus: function focus() {
      this._focusedField = null;

      if (true === this.validationResult || 'none' === this.options.focus) return null;

      for (var i = 0; i < this.fields.length; i++) {
        var field = this.fields[i];
        if (true !== field.validationResult && field.validationResult.length > 0 && 'undefined' === typeof field.options.noFocus) {
          this._focusedField = field.$element;
          if ('first' === this.options.focus) break;
        }
      }

      if (null === this._focusedField) return null;

      return this._focusedField.focus();
    },

    _destroyUI: function _destroyUI() {
      // Reset all event listeners
      this.$element.off('.Parsley');
    }

  };

  ParsleyUI.Field = {

    _reflowUI: function _reflowUI() {
      this._buildUI();

      // If this field doesn't have an active UI don't bother doing something
      if (!this._ui) return;

      // Diff between two validation results
      var diff = diffResults(this.validationResult, this._ui.lastValidationResult);

      // Then store current validation result for next reflow
      this._ui.lastValidationResult = this.validationResult;

      // Handle valid / invalid / none field class
      this._manageStatusClass();

      // Add, remove, updated errors messages
      this._manageErrorsMessages(diff);

      // Triggers impl
      this._actualizeTriggers();

      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
      if ((diff.kept.length || diff.added.length) && !this._failedOnce) {
        this._failedOnce = true;
        this._actualizeTriggers();
      }
    },

    // Returns an array of field's error message(s)
    getErrorsMessages: function getErrorsMessages() {
      // No error message, field is valid
      if (true === this.validationResult) return [];

      var messages = [];

      for (var i = 0; i < this.validationResult.length; i++) messages.push(this.validationResult[i].errorMessage || this._getErrorMessage(this.validationResult[i].assert));

      return messages;
    },

    // It's a goal of Parsley that this method is no longer required [#1073]
    addError: function addError(name) {
      var _ref2 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var message = _ref2.message;
      var assert = _ref2.assert;
      var _ref2$updateClass = _ref2.updateClass;
      var updateClass = _ref2$updateClass === undefined ? true : _ref2$updateClass;

      this._buildUI();
      this._addError(name, { message: message, assert: assert });

      if (updateClass) this._errorClass();
    },

    // It's a goal of Parsley that this method is no longer required [#1073]
    updateError: function updateError(name) {
      var _ref3 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var message = _ref3.message;
      var assert = _ref3.assert;
      var _ref3$updateClass = _ref3.updateClass;
      var updateClass = _ref3$updateClass === undefined ? true : _ref3$updateClass;

      this._buildUI();
      this._updateError(name, { message: message, assert: assert });

      if (updateClass) this._errorClass();
    },

    // It's a goal of Parsley that this method is no longer required [#1073]
    removeError: function removeError(name) {
      var _ref4 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref4$updateClass = _ref4.updateClass;
      var updateClass = _ref4$updateClass === undefined ? true : _ref4$updateClass;

      this._buildUI();
      this._removeError(name);

      // edge case possible here: remove a standard Parsley error that is still failing in this.validationResult
      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
      if (updateClass) this._manageStatusClass();
    },

    _manageStatusClass: function _manageStatusClass() {
      if (this.hasConstraints() && this.needsValidation() && true === this.validationResult) this._successClass();else if (this.validationResult.length > 0) this._errorClass();else this._resetClass();
    },

    _manageErrorsMessages: function _manageErrorsMessages(diff) {
      if ('undefined' !== typeof this.options.errorsMessagesDisabled) return;

      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
      if ('undefined' !== typeof this.options.errorMessage) {
        if (diff.added.length || diff.kept.length) {
          this._insertErrorWrapper();

          if (0 === this._ui.$errorsWrapper.find('.parsley-custom-error-message').length) this._ui.$errorsWrapper.append($(this.options.errorTemplate).addClass('parsley-custom-error-message'));

          return this._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(this.options.errorMessage);
        }

        return this._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
      }

      // Show, hide, update failing constraints messages
      for (var i = 0; i < diff.removed.length; i++) this._removeError(diff.removed[i].assert.name);

      for (i = 0; i < diff.added.length; i++) this._addError(diff.added[i].assert.name, { message: diff.added[i].errorMessage, assert: diff.added[i].assert });

      for (i = 0; i < diff.kept.length; i++) this._updateError(diff.kept[i].assert.name, { message: diff.kept[i].errorMessage, assert: diff.kept[i].assert });
    },

    _addError: function _addError(name, _ref5) {
      var message = _ref5.message;
      var assert = _ref5.assert;

      this._insertErrorWrapper();
      this._ui.$errorsWrapper.addClass('filled').append($(this.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(assert)));
    },

    _updateError: function _updateError(name, _ref6) {
      var message = _ref6.message;
      var assert = _ref6.assert;

      this._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(assert));
    },

    _removeError: function _removeError(name) {
      this._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();
    },

    _getErrorMessage: function _getErrorMessage(constraint) {
      var customConstraintErrorMessage = constraint.name + 'Message';

      if ('undefined' !== typeof this.options[customConstraintErrorMessage]) return window.Parsley.formatMessage(this.options[customConstraintErrorMessage], constraint.requirements);

      return window.Parsley.getErrorMessage(constraint);
    },

    _buildUI: function _buildUI() {
      // UI could be already built or disabled
      if (this._ui || false === this.options.uiEnabled) return;

      var _ui = {};

      // Give field its Parsley id in DOM
      this.$element.attr(this.options.namespace + 'id', this.__id__);

      /** Generate important UI elements and store them in this **/
      // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
      _ui.$errorClassHandler = this._manageClassHandler();

      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
      _ui.errorsWrapperId = 'parsley-id-' + (this.options.multiple ? 'multiple-' + this.options.multiple : this.__id__);
      _ui.$errorsWrapper = $(this.options.errorsWrapper).attr('id', _ui.errorsWrapperId);

      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
      _ui.lastValidationResult = [];
      _ui.validationInformationVisible = false;

      // Store it in this for later
      this._ui = _ui;
    },

    // Determine which element will have `parsley-error` and `parsley-success` classes
    _manageClassHandler: function _manageClassHandler() {
      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
      if ('string' === typeof this.options.classHandler && $(this.options.classHandler).length) return $(this.options.classHandler);

      // Class handled could also be determined by function given in Parsley options
      var $handler = this.options.classHandler.call(this, this);

      // If this function returned a valid existing DOM element, go for it
      if ('undefined' !== typeof $handler && $handler.length) return $handler;

      return this._inputHolder();
    },

    _inputHolder: function _inputHolder() {
      // if simple element (input, texatrea, select...) it will perfectly host the classes and precede the error container
      if (!this.options.multiple || this.$element.is('select')) return this.$element;

      // But if multiple element (radio, checkbox), that would be their parent
      return this.$element.parent();
    },

    _insertErrorWrapper: function _insertErrorWrapper() {
      var $errorsContainer;

      // Nothing to do if already inserted
      if (0 !== this._ui.$errorsWrapper.parent().length) return this._ui.$errorsWrapper.parent();

      if ('string' === typeof this.options.errorsContainer) {
        if ($(this.options.errorsContainer).length) return $(this.options.errorsContainer).append(this._ui.$errorsWrapper);else ParsleyUtils__default.warn('The errors container `' + this.options.errorsContainer + '` does not exist in DOM');
      } else if ('function' === typeof this.options.errorsContainer) $errorsContainer = this.options.errorsContainer.call(this, this);

      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(this._ui.$errorsWrapper);

      return this._inputHolder().after(this._ui.$errorsWrapper);
    },

    _actualizeTriggers: function _actualizeTriggers() {
      var _this3 = this;

      var $toBind = this._findRelated();
      var trigger;

      // Remove Parsley events already bound on this field
      $toBind.off('.Parsley');
      if (this._failedOnce) $toBind.on(ParsleyUtils__default.namespaceEvents(this.options.triggerAfterFailure, 'Parsley'), function () {
        _this3.validate();
      });else if (trigger = ParsleyUtils__default.namespaceEvents(this.options.trigger, 'Parsley')) {
        $toBind.on(trigger, function (event) {
          _this3._eventValidate(event);
        });
      }
    },

    _eventValidate: function _eventValidate(event) {
      // For keyup, keypress, keydown, input... events that could be a little bit obstrusive
      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
      if (/key|input/.test(event.type)) if (!(this._ui && this._ui.validationInformationVisible) && this.getValue().length <= this.options.validationThreshold) return;

      this.validate();
    },

    _resetUI: function _resetUI() {
      // Reset all event listeners
      this._failedOnce = false;
      this._actualizeTriggers();

      // Nothing to do if UI never initialized for this field
      if ('undefined' === typeof this._ui) return;

      // Reset all errors' li
      this._ui.$errorsWrapper.removeClass('filled').children().remove();

      // Reset validation class
      this._resetClass();

      // Reset validation flags and last validation result
      this._ui.lastValidationResult = [];
      this._ui.validationInformationVisible = false;
    },

    _destroyUI: function _destroyUI() {
      this._resetUI();

      if ('undefined' !== typeof this._ui) this._ui.$errorsWrapper.remove();

      delete this._ui;
    },

    _successClass: function _successClass() {
      this._ui.validationInformationVisible = true;
      this._ui.$errorClassHandler.removeClass(this.options.errorClass).addClass(this.options.successClass);
    },
    _errorClass: function _errorClass() {
      this._ui.validationInformationVisible = true;
      this._ui.$errorClassHandler.removeClass(this.options.successClass).addClass(this.options.errorClass);
    },
    _resetClass: function _resetClass() {
      this._ui.$errorClassHandler.removeClass(this.options.successClass).removeClass(this.options.errorClass);
    }
  };

  var ParsleyForm = function ParsleyForm(element, domOptions, options) {
    this.__class__ = 'ParsleyForm';

    this.$element = $(element);
    this.domOptions = domOptions;
    this.options = options;
    this.parent = window.Parsley;

    this.fields = [];
    this.validationResult = null;
  };

  var ParsleyForm__statusMapping = { pending: null, resolved: true, rejected: false };

  ParsleyForm.prototype = {
    onSubmitValidate: function onSubmitValidate(event) {
      var _this4 = this;

      // This is a Parsley generated submit event, do not validate, do not prevent, simply exit and keep normal behavior
      if (true === event.parsley) return;

      // If we didn't come here through a submit button, use the first one in the form
      var $submitSource = this._$submitSource || this.$element.find(ParsleyUtils__default._SubmitSelector).first();
      this._$submitSource = null;
      this.$element.find('.parsley-synthetic-submit-button').prop('disabled', true);
      if ($submitSource.is('[formnovalidate]')) return;

      var promise = this.whenValidate({ event: event });

      if ('resolved' === promise.state() && false !== this._trigger('submit')) {
        // All good, let event go through. We make this distinction because browsers
        // differ in their handling of `submit` being called from inside a submit event [#1047]
      } else {
          // Rejected or pending: cancel this submit
          event.stopImmediatePropagation();
          event.preventDefault();
          if ('pending' === promise.state()) promise.done(function () {
            _this4._submit($submitSource);
          });
        }
    },

    onSubmitButton: function onSubmitButton(event) {
      this._$submitSource = $(event.currentTarget);
    },
    // internal
    // _submit submits the form, this time without going through the validations.
    // Care must be taken to "fake" the actual submit button being clicked.
    _submit: function _submit($submitSource) {
      if (false === this._trigger('submit')) return;
      // Add submit button's data
      if ($submitSource) {
        var $synthetic = this.$element.find('.parsley-synthetic-submit-button').prop('disabled', false);
        if (0 === $synthetic.length) $synthetic = $('<input class="parsley-synthetic-submit-button" type="hidden">').appendTo(this.$element);
        $synthetic.attr({
          name: $submitSource.attr('name'),
          value: $submitSource.attr('value')
        });
      }

      this.$element.trigger($.extend($.Event('submit'), { parsley: true }));
    },

    // Performs validation on fields while triggering events.
    // @returns `true` if all validations succeeds, `false`
    // if a failure is immediately detected, or `null`
    // if dependant on a promise.
    // Consider using `whenValidate` instead.
    validate: function validate(options) {
      if (arguments.length >= 1 && !$.isPlainObject(options)) {
        ParsleyUtils__default.warnOnce('Calling validate on a parsley form without passing arguments as an object is deprecated.');

        var _arguments = _slice.call(arguments);

        var group = _arguments[0];
        var force = _arguments[1];
        var event = _arguments[2];

        options = { group: group, force: force, event: event };
      }
      return ParsleyForm__statusMapping[this.whenValidate(options).state()];
    },

    whenValidate: function whenValidate() {
      var _ParsleyUtils__default$all$done$fail$always,
          _this5 = this;

      var _ref7 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var group = _ref7.group;
      var force = _ref7.force;
      var event = _ref7.event;

      this.submitEvent = event;
      if (event) {
        this.submitEvent = $.extend({}, event, { preventDefault: function preventDefault() {
            ParsleyUtils__default.warnOnce("Using `this.submitEvent.preventDefault()` is deprecated; instead, call `this.validationResult = false`");
            _this5.validationResult = false;
          } });
      }
      this.validationResult = true;

      // fire validate event to eventually modify things before every validation
      this._trigger('validate');

      // Refresh form DOM options and form's fields that could have changed
      this._refreshFields();

      var promises = this._withoutReactualizingFormOptions(function () {
        return $.map(_this5.fields, function (field) {
          return field.whenValidate({ force: force, group: group });
        });
      });

      return (_ParsleyUtils__default$all$done$fail$always = ParsleyUtils__default.all(promises).done(function () {
        _this5._trigger('success');
      }).fail(function () {
        _this5.validationResult = false;
        _this5.focus();
        _this5._trigger('error');
      }).always(function () {
        _this5._trigger('validated');
      })).pipe.apply(_ParsleyUtils__default$all$done$fail$always, _toConsumableArray(this._pipeAccordingToValidationResult()));
    },

    // Iterate over refreshed fields, and stop on first failure.
    // Returns `true` if all fields are valid, `false` if a failure is detected
    // or `null` if the result depends on an unresolved promise.
    // Prefer using `whenValid` instead.
    isValid: function isValid(options) {
      if (arguments.length >= 1 && !$.isPlainObject(options)) {
        ParsleyUtils__default.warnOnce('Calling isValid on a parsley form without passing arguments as an object is deprecated.');

        var _arguments2 = _slice.call(arguments);

        var group = _arguments2[0];
        var force = _arguments2[1];

        options = { group: group, force: force };
      }
      return ParsleyForm__statusMapping[this.whenValid(options).state()];
    },

    // Iterate over refreshed fields and validate them.
    // Returns a promise.
    // A validation that immediately fails will interrupt the validations.
    whenValid: function whenValid() {
      var _this6 = this;

      var _ref8 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var group = _ref8.group;
      var force = _ref8.force;

      this._refreshFields();

      var promises = this._withoutReactualizingFormOptions(function () {
        return $.map(_this6.fields, function (field) {
          return field.whenValid({ group: group, force: force });
        });
      });
      return ParsleyUtils__default.all(promises);
    },

    _refreshFields: function _refreshFields() {
      return this.actualizeOptions()._bindFields();
    },

    _bindFields: function _bindFields() {
      var _this7 = this;

      var oldFields = this.fields;

      this.fields = [];
      this.fieldsMappedById = {};

      this._withoutReactualizingFormOptions(function () {
        _this7.$element.find(_this7.options.inputs).not(_this7.options.excluded).each(function (_, element) {
          var fieldInstance = new window.Parsley.Factory(element, {}, _this7);

          // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
          if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && true !== fieldInstance.options.excluded) if ('undefined' === typeof _this7.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
            _this7.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
            _this7.fields.push(fieldInstance);
          }
        });

        $.each(ParsleyUtils__default.difference(oldFields, _this7.fields), function (_, field) {
          field._trigger('reset');
        });
      });
      return this;
    },

    // Internal only.
    // Looping on a form's fields to do validation or similar
    // will trigger reactualizing options on all of them, which
    // in turn will reactualize the form's options.
    // To avoid calling actualizeOptions so many times on the form
    // for nothing, _withoutReactualizingFormOptions temporarily disables
    // the method actualizeOptions on this form while `fn` is called.
    _withoutReactualizingFormOptions: function _withoutReactualizingFormOptions(fn) {
      var oldActualizeOptions = this.actualizeOptions;
      this.actualizeOptions = function () {
        return this;
      };
      var result = fn();
      this.actualizeOptions = oldActualizeOptions;
      return result;
    },

    // Internal only.
    // Shortcut to trigger an event
    // Returns true iff event is not interrupted and default not prevented.
    _trigger: function _trigger(eventName) {
      return this.trigger('form:' + eventName);
    }

  };

  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
    if (!/ParsleyField/.test(parsleyField.__class__)) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');

    var validatorSpec = window.Parsley._validatorRegistry.validators[name];
    var validator = new ParsleyValidator(validatorSpec);

    $.extend(this, {
      validator: validator,
      name: name,
      requirements: requirements,
      priority: priority || parsleyField.options[name + 'Priority'] || validator.priority,
      isDomConstraint: true === isDomConstraint
    });
    this._parseRequirements(parsleyField.options);
  };

  var capitalize = function capitalize(str) {
    var cap = str[0].toUpperCase();
    return cap + str.slice(1);
  };

  ConstraintFactory.prototype = {
    validate: function validate(value, instance) {
      var _validator;

      return (_validator = this.validator).validate.apply(_validator, [value].concat(_toConsumableArray(this.requirementList), [instance]));
    },

    _parseRequirements: function _parseRequirements(options) {
      var _this8 = this;

      this.requirementList = this.validator.parseRequirements(this.requirements, function (key) {
        return options[_this8.name + capitalize(key)];
      });
    }
  };

  var ParsleyField = function ParsleyField(field, domOptions, options, parsleyFormInstance) {
    this.__class__ = 'ParsleyField';

    this.$element = $(field);

    // Set parent if we have one
    if ('undefined' !== typeof parsleyFormInstance) {
      this.parent = parsleyFormInstance;
    }

    this.options = options;
    this.domOptions = domOptions;

    // Initialize some properties
    this.constraints = [];
    this.constraintsByName = {};
    this.validationResult = true;

    // Bind constraints
    this._bindConstraints();
  };

  var parsley_field__statusMapping = { pending: null, resolved: true, rejected: false };

  ParsleyField.prototype = {
    // # Public API
    // Validate field and trigger some events for mainly `ParsleyUI`
    // @returns `true`, an array of the validators that failed, or
    // `null` if validation is not finished. Prefer using whenValidate
    validate: function validate(options) {
      if (arguments.length >= 1 && !$.isPlainObject(options)) {
        ParsleyUtils__default.warnOnce('Calling validate on a parsley field without passing arguments as an object is deprecated.');
        options = { options: options };
      }
      var promise = this.whenValidate(options);
      if (!promise) // If excluded with `group` option
        return true;
      switch (promise.state()) {
        case 'pending':
          return null;
        case 'resolved':
          return true;
        case 'rejected':
          return this.validationResult;
      }
    },

    // Validate field and trigger some events for mainly `ParsleyUI`
    // @returns a promise that succeeds only when all validations do
    // or `undefined` if field is not in the given `group`.
    whenValidate: function whenValidate() {
      var _whenValid$always$done$fail$always,
          _this9 = this;

      var _ref9 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var force = _ref9.force;
      var group = _ref9.group;

      // do not validate a field if not the same as given validation group
      this.refreshConstraints();
      if (group && !this._isInGroup(group)) return;

      this.value = this.getValue();

      // Field Validate event. `this.value` could be altered for custom needs
      this._trigger('validate');

      return (_whenValid$always$done$fail$always = this.whenValid({ force: force, value: this.value, _refreshed: true }).always(function () {
        _this9._reflowUI();
      }).done(function () {
        _this9._trigger('success');
      }).fail(function () {
        _this9._trigger('error');
      }).always(function () {
        _this9._trigger('validated');
      })).pipe.apply(_whenValid$always$done$fail$always, _toConsumableArray(this._pipeAccordingToValidationResult()));
    },

    hasConstraints: function hasConstraints() {
      return 0 !== this.constraints.length;
    },

    // An empty optional field does not need validation
    needsValidation: function needsValidation(value) {
      if ('undefined' === typeof value) value = this.getValue();

      // If a field is empty and not required, it is valid
      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty) return false;

      return true;
    },

    _isInGroup: function _isInGroup(group) {
      if ($.isArray(this.options.group)) return -1 !== $.inArray(group, this.options.group);
      return this.options.group === group;
    },

    // Just validate field. Do not trigger any event.
    // Returns `true` iff all constraints pass, `false` if there are failures,
    // or `null` if the result can not be determined yet (depends on a promise)
    // See also `whenValid`.
    isValid: function isValid(options) {
      if (arguments.length >= 1 && !$.isPlainObject(options)) {
        ParsleyUtils__default.warnOnce('Calling isValid on a parsley field without passing arguments as an object is deprecated.');

        var _arguments3 = _slice.call(arguments);

        var force = _arguments3[0];
        var value = _arguments3[1];

        options = { force: force, value: value };
      }
      var promise = this.whenValid(options);
      if (!promise) // Excluded via `group`
        return true;
      return parsley_field__statusMapping[promise.state()];
    },

    // Just validate field. Do not trigger any event.
    // @returns a promise that succeeds only when all validations do
    // or `undefined` if the field is not in the given `group`.
    // The argument `force` will force validation of empty fields.
    // If a `value` is given, it will be validated instead of the value of the input.
    whenValid: function whenValid() {
      var _this10 = this;

      var _ref10 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _ref10$force = _ref10.force;
      var force = _ref10$force === undefined ? false : _ref10$force;
      var value = _ref10.value;
      var group = _ref10.group;
      var _refreshed = _ref10._refreshed;

      // Recompute options and rebind constraints to have latest changes
      if (!_refreshed) this.refreshConstraints();
      // do not validate a field if not the same as given validation group
      if (group && !this._isInGroup(group)) return;

      this.validationResult = true;

      // A field without constraint is valid
      if (!this.hasConstraints()) return $.when();

      // Value could be passed as argument, needed to add more power to 'field:validate'
      if ('undefined' === typeof value || null === value) value = this.getValue();

      if (!this.needsValidation(value) && true !== force) return $.when();

      var groupedConstraints = this._getGroupedConstraints();
      var promises = [];
      $.each(groupedConstraints, function (_, constraints) {
        // Process one group of constraints at a time, we validate the constraints
        // and combine the promises together.
        var promise = ParsleyUtils__default.all($.map(constraints, function (constraint) {
          return _this10._validateConstraint(value, constraint);
        }));
        promises.push(promise);
        if (promise.state() === 'rejected') return false; // Interrupt processing if a group has already failed
      });
      return ParsleyUtils__default.all(promises);
    },

    // @returns a promise
    _validateConstraint: function _validateConstraint(value, constraint) {
      var _this11 = this;

      var result = constraint.validate(value, this);
      // Map false to a failed promise
      if (false === result) result = $.Deferred().reject();
      // Make sure we return a promise and that we record failures
      return ParsleyUtils__default.all([result]).fail(function (errorMessage) {
        if (!(_this11.validationResult instanceof Array)) _this11.validationResult = [];
        _this11.validationResult.push({
          assert: constraint,
          errorMessage: 'string' === typeof errorMessage && errorMessage
        });
      });
    },

    // @returns Parsley field computed value that could be overrided or configured in DOM
    getValue: function getValue() {
      var value;

      // Value could be overriden in DOM or with explicit options
      if ('function' === typeof this.options.value) value = this.options.value(this);else if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();

      // Handle wrong DOM or configurations
      if ('undefined' === typeof value || null === value) return '';

      return this._handleWhitespace(value);
    },

    // Actualize options that could have change since previous validation
    // Re-bind accordingly constraints (could be some new, removed or updated)
    refreshConstraints: function refreshConstraints() {
      return this.actualizeOptions()._bindConstraints();
    },

    /**
    * Add a new constraint to a field
    *
    * @param {String}   name
    * @param {Mixed}    requirements      optional
    * @param {Number}   priority          optional
    * @param {Boolean}  isDomConstraint   optional
    */
    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {

      if (window.Parsley._validatorRegistry.validators[name]) {
        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);

        // if constraint already exist, delete it and push new version
        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);

        this.constraints.push(constraint);
        this.constraintsByName[constraint.name] = constraint;
      }

      return this;
    },

    // Remove a constraint
    removeConstraint: function removeConstraint(name) {
      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
        this.constraints.splice(i, 1);
        break;
      }
      delete this.constraintsByName[name];
      return this;
    },

    // Update a constraint (Remove + re-add)
    updateConstraint: function updateConstraint(name, parameters, priority) {
      return this.removeConstraint(name).addConstraint(name, parameters, priority);
    },

    // # Internals

    // Internal only.
    // Bind constraints from config + options + DOM
    _bindConstraints: function _bindConstraints() {
      var constraints = [];
      var constraintsByName = {};

      // clean all existing DOM constraints to only keep javascript user constraints
      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
        constraints.push(this.constraints[i]);
        constraintsByName[this.constraints[i].name] = this.constraints[i];
      }

      this.constraints = constraints;
      this.constraintsByName = constraintsByName;

      // then re-add Parsley DOM-API constraints
      for (var name in this.options) this.addConstraint(name, this.options[name], undefined, true);

      // finally, bind special HTML5 constraints
      return this._bindHtml5Constraints();
    },

    // Internal only.
    // Bind specific HTML5 constraints to be HTML5 compliant
    _bindHtml5Constraints: function _bindHtml5Constraints() {
      // html5 required
      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);

      // html5 pattern
      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);

      // range
      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);

      // HTML5 min
      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);

        // HTML5 max
        else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);

      // length
      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);

      // HTML5 minlength
      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);

        // HTML5 maxlength
        else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);

      // html5 types
      var type = this.$element.attr('type');

      if ('undefined' === typeof type) return this;

      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
      if ('number' === type) {
        return this.addConstraint('type', ['number', {
          step: this.$element.attr('step'),
          base: this.$element.attr('min') || this.$element.attr('value')
        }], undefined, true);
        // Regular other HTML5 supported types
      } else if (/^(email|url|range)$/i.test(type)) {
          return this.addConstraint('type', type, undefined, true);
        }
      return this;
    },

    // Internal only.
    // Field is required if have required constraint without `false` value
    _isRequired: function _isRequired() {
      if ('undefined' === typeof this.constraintsByName.required) return false;

      return false !== this.constraintsByName.required.requirements;
    },

    // Internal only.
    // Shortcut to trigger an event
    _trigger: function _trigger(eventName) {
      return this.trigger('field:' + eventName);
    },

    // Internal only
    // Handles whitespace in a value
    // Use `data-parsley-whitespace="squish"` to auto squish input value
    // Use `data-parsley-whitespace="trim"` to auto trim input value
    _handleWhitespace: function _handleWhitespace(value) {
      if (true === this.options.trimValue) ParsleyUtils__default.warnOnce('data-parsley-trim-value="true" is deprecated, please use data-parsley-whitespace="trim"');

      if ('squish' === this.options.whitespace) value = value.replace(/\s{2,}/g, ' ');

      if ('trim' === this.options.whitespace || 'squish' === this.options.whitespace || true === this.options.trimValue) value = ParsleyUtils__default.trimString(value);

      return value;
    },

    // Internal only.
    // Returns the constraints, grouped by descending priority.
    // The result is thus an array of arrays of constraints.
    _getGroupedConstraints: function _getGroupedConstraints() {
      if (false === this.options.priorityEnabled) return [this.constraints];

      var groupedConstraints = [];
      var index = {};

      // Create array unique of priorities
      for (var i = 0; i < this.constraints.length; i++) {
        var p = this.constraints[i].priority;
        if (!index[p]) groupedConstraints.push(index[p] = []);
        index[p].push(this.constraints[i]);
      }
      // Sort them by priority DESC
      groupedConstraints.sort(function (a, b) {
        return b[0].priority - a[0].priority;
      });

      return groupedConstraints;
    }

  };

  var parsley_field = ParsleyField;

  var ParsleyMultiple = function ParsleyMultiple() {
    this.__class__ = 'ParsleyFieldMultiple';
  };

  ParsleyMultiple.prototype = {
    // Add new `$element` sibling for multiple field
    addElement: function addElement($element) {
      this.$elements.push($element);

      return this;
    },

    // See `ParsleyField.refreshConstraints()`
    refreshConstraints: function refreshConstraints() {
      var fieldConstraints;

      this.constraints = [];

      // Select multiple special treatment
      if (this.$element.is('select')) {
        this.actualizeOptions()._bindConstraints();

        return this;
      }

      // Gather all constraints for each input in the multiple group
      for (var i = 0; i < this.$elements.length; i++) {

        // Check if element have not been dynamically removed since last binding
        if (!$('html').has(this.$elements[i]).length) {
          this.$elements.splice(i, 1);
          continue;
        }

        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;

        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
      }

      return this;
    },

    // See `ParsleyField.getValue()`
    getValue: function getValue() {
      // Value could be overriden in DOM
      if ('function' === typeof this.options.value) return this.options.value(this);else if ('undefined' !== typeof this.options.value) return this.options.value;

      // Radio input case
      if (this.$element.is('input[type=radio]')) return this._findRelated().filter(':checked').val() || '';

      // checkbox input case
      if (this.$element.is('input[type=checkbox]')) {
        var values = [];

        this._findRelated().filter(':checked').each(function () {
          values.push($(this).val());
        });

        return values;
      }

      // Select multiple case
      if (this.$element.is('select') && null === this.$element.val()) return [];

      // Default case that should never happen
      return this.$element.val();
    },

    _init: function _init() {
      this.$elements = [this.$element];

      return this;
    }
  };

  var ParsleyFactory = function ParsleyFactory(element, options, parsleyFormInstance) {
    this.$element = $(element);

    // If the element has already been bound, returns its saved Parsley instance
    var savedparsleyFormInstance = this.$element.data('Parsley');
    if (savedparsleyFormInstance) {

      // If the saved instance has been bound without a ParsleyForm parent and there is one given in this call, add it
      if ('undefined' !== typeof parsleyFormInstance && savedparsleyFormInstance.parent === window.Parsley) {
        savedparsleyFormInstance.parent = parsleyFormInstance;
        savedparsleyFormInstance._resetOptions(savedparsleyFormInstance.options);
      }

      if ('object' === typeof options) {
        $.extend(savedparsleyFormInstance.options, options);
      }

      return savedparsleyFormInstance;
    }

    // Parsley must be instantiated with a DOM element or jQuery $element
    if (!this.$element.length) throw new Error('You must bind Parsley on an existing element.');

    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');

    this.parent = parsleyFormInstance || window.Parsley;
    return this.init(options);
  };

  ParsleyFactory.prototype = {
    init: function init(options) {
      this.__class__ = 'Parsley';
      this.__version__ = '2.4.4';
      this.__id__ = ParsleyUtils__default.generateID();

      // Pre-compute options
      this._resetOptions(options);

      // A ParsleyForm instance is obviously a `<form>` element but also every node that is not an input and has the `data-parsley-validate` attribute
      if (this.$element.is('form') || ParsleyUtils__default.checkAttr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');

      // Every other element is bound as a `ParsleyField` or `ParsleyFieldMultiple`
      return this.isMultiple() ? this.handleMultiple() : this.bind('parsleyField');
    },

    isMultiple: function isMultiple() {
      return this.$element.is('input[type=radio], input[type=checkbox]') || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
    },

    // Multiples fields are a real nightmare :(
    // Maybe some refactoring would be appreciated here...
    handleMultiple: function handleMultiple() {
      var _this12 = this;

      var name;
      var multiple;
      var parsleyMultipleInstance;

      // Handle multiple name
      if (this.options.multiple) ; // We already have our 'multiple' identifier
      else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) this.options.multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) this.options.multiple = this.$element.attr('id');

      // Special select multiple input
      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
        this.options.multiple = this.options.multiple || this.__id__;
        return this.bind('parsleyFieldMultiple');

        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
      } else if (!this.options.multiple) {
          ParsleyUtils__default.warn('To be bound by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
          return this;
        }

      // Remove special chars
      this.options.multiple = this.options.multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');

      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
      if ('undefined' !== typeof name) {
        $('input[name="' + name + '"]').each(function (i, input) {
          if ($(input).is('input[type=radio], input[type=checkbox]')) $(input).attr(_this12.options.namespace + 'multiple', _this12.options.multiple);
        });
      }

      // Check here if we don't already have a related multiple instance saved
      var $previouslyRelated = this._findRelated();
      for (var i = 0; i < $previouslyRelated.length; i++) {
        parsleyMultipleInstance = $($previouslyRelated.get(i)).data('Parsley');
        if ('undefined' !== typeof parsleyMultipleInstance) {

          if (!this.$element.data('ParsleyFieldMultiple')) {
            parsleyMultipleInstance.addElement(this.$element);
          }

          break;
        }
      }

      // Create a secret ParsleyField instance for every multiple field. It will be stored in `data('ParsleyFieldMultiple')`
      // And will be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
      this.bind('parsleyField', true);

      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple');
    },

    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
    bind: function bind(type, doNotStore) {
      var parsleyInstance;

      switch (type) {
        case 'parsleyForm':
          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.domOptions, this.options), new ParsleyAbstract(), window.ParsleyExtend)._bindFields();
          break;
        case 'parsleyField':
          parsleyInstance = $.extend(new parsley_field(this.$element, this.domOptions, this.options, this.parent), new ParsleyAbstract(), window.ParsleyExtend);
          break;
        case 'parsleyFieldMultiple':
          parsleyInstance = $.extend(new parsley_field(this.$element, this.domOptions, this.options, this.parent), new ParsleyMultiple(), new ParsleyAbstract(), window.ParsleyExtend)._init();
          break;
        default:
          throw new Error(type + 'is not a supported Parsley type');
      }

      if (this.options.multiple) ParsleyUtils__default.setAttr(this.$element, this.options.namespace, 'multiple', this.options.multiple);

      if ('undefined' !== typeof doNotStore) {
        this.$element.data('ParsleyFieldMultiple', parsleyInstance);

        return parsleyInstance;
      }

      // Store the freshly bound instance in a DOM element for later access using jQuery `data()`
      this.$element.data('Parsley', parsleyInstance);

      // Tell the world we have a new ParsleyForm or ParsleyField instance!
      parsleyInstance._actualizeTriggers();
      parsleyInstance._trigger('init');

      return parsleyInstance;
    }
  };

  var vernums = $.fn.jquery.split('.');
  if (parseInt(vernums[0]) <= 1 && parseInt(vernums[1]) < 8) {
    throw "The loaded version of jQuery is too old. Please upgrade to 1.8.x or better.";
  }
  if (!vernums.forEach) {
    ParsleyUtils__default.warn('Parsley requires ES5 to run properly. Please include https://github.com/es-shims/es5-shim');
  }
  // Inherit `on`, `off` & `trigger` to Parsley:
  var Parsley = $.extend(new ParsleyAbstract(), {
    $element: $(document),
    actualizeOptions: null,
    _resetOptions: null,
    Factory: ParsleyFactory,
    version: '2.4.4'
  });

  // Supplement ParsleyField and Form with ParsleyAbstract
  // This way, the constructors will have access to those methods
  $.extend(parsley_field.prototype, ParsleyUI.Field, ParsleyAbstract.prototype);
  $.extend(ParsleyForm.prototype, ParsleyUI.Form, ParsleyAbstract.prototype);
  // Inherit actualizeOptions and _resetOptions:
  $.extend(ParsleyFactory.prototype, ParsleyAbstract.prototype);

  // ### jQuery API
  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
  $.fn.parsley = $.fn.psly = function (options) {
    if (this.length > 1) {
      var instances = [];

      this.each(function () {
        instances.push($(this).parsley(options));
      });

      return instances;
    }

    // Return undefined if applied to non existing DOM element
    if (!$(this).length) {
      ParsleyUtils__default.warn('You must bind Parsley on an existing element.');

      return;
    }

    return new ParsleyFactory(this, options);
  };

  // ### ParsleyField and ParsleyForm extension
  // Ensure the extension is now defined if it wasn't previously
  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};

  // ### Parsley config
  // Inherit from ParsleyDefault, and copy over any existing values
  Parsley.options = $.extend(ParsleyUtils__default.objectCreate(ParsleyDefaults), window.ParsleyConfig);
  window.ParsleyConfig = Parsley.options; // Old way of accessing global options

  // ### Globals
  window.Parsley = window.psly = Parsley;
  window.ParsleyUtils = ParsleyUtils__default;

  // ### Define methods that forward to the registry, and deprecate all access except through window.Parsley
  var registry = window.Parsley._validatorRegistry = new ParsleyValidatorRegistry(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
  window.ParsleyValidator = {};
  $.each('setLocale addCatalog addMessage addMessages getErrorMessage formatMessage addValidator updateValidator removeValidator'.split(' '), function (i, method) {
    window.Parsley[method] = $.proxy(registry, method);
    window.ParsleyValidator[method] = function () {
      var _window$Parsley;

      ParsleyUtils__default.warnOnce('Accessing the method \'' + method + '\' through ParsleyValidator is deprecated. Simply call \'window.Parsley.' + method + '(...)\'');
      return (_window$Parsley = window.Parsley)[method].apply(_window$Parsley, arguments);
    };
  });

  // ### ParsleyUI
  // Deprecated global object
  window.Parsley.UI = ParsleyUI;
  window.ParsleyUI = {
    removeError: function removeError(instance, name, doNotUpdateClass) {
      var updateClass = true !== doNotUpdateClass;
      ParsleyUtils__default.warnOnce('Accessing ParsleyUI is deprecated. Call \'removeError\' on the instance directly. Please comment in issue 1073 as to your need to call this method.');
      return instance.removeError(name, { updateClass: updateClass });
    },
    getErrorsMessages: function getErrorsMessages(instance) {
      ParsleyUtils__default.warnOnce('Accessing ParsleyUI is deprecated. Call \'getErrorsMessages\' on the instance directly.');
      return instance.getErrorsMessages();
    }
  };
  $.each('addError updateError'.split(' '), function (i, method) {
    window.ParsleyUI[method] = function (instance, name, message, assert, doNotUpdateClass) {
      var updateClass = true !== doNotUpdateClass;
      ParsleyUtils__default.warnOnce('Accessing ParsleyUI is deprecated. Call \'' + method + '\' on the instance directly. Please comment in issue 1073 as to your need to call this method.');
      return instance[method](name, { message: message, assert: assert, updateClass: updateClass });
    };
  });

  // ### PARSLEY auto-binding
  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
  if (false !== window.ParsleyConfig.autoBind) {
    $(function () {
      // Works only on `data-parsley-validate`.
      if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
    });
  }

  var o = $({});
  var deprecated = function deprecated() {
    ParsleyUtils__default.warnOnce("Parsley's pubsub module is deprecated; use the 'on' and 'off' methods on parsley instances or window.Parsley");
  };

  // Returns an event handler that calls `fn` with the arguments it expects
  function adapt(fn, context) {
    // Store to allow unbinding
    if (!fn.parsleyAdaptedCallback) {
      fn.parsleyAdaptedCallback = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);
        fn.apply(context || o, args);
      };
    }
    return fn.parsleyAdaptedCallback;
  }

  var eventPrefix = 'parsley:';
  // Converts 'parsley:form:validate' into 'form:validate'
  function eventName(name) {
    if (name.lastIndexOf(eventPrefix, 0) === 0) return name.substr(eventPrefix.length);
    return name;
  }

  // $.listen is deprecated. Use Parsley.on instead.
  $.listen = function (name, callback) {
    var context;
    deprecated();
    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) {
      context = arguments[1];
      callback = arguments[2];
    }

    if ('function' !== typeof callback) throw new Error('Wrong parameters');

    window.Parsley.on(eventName(name), adapt(callback, context));
  };

  $.listenTo = function (instance, name, fn) {
    deprecated();
    if (!(instance instanceof parsley_field) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');

    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');

    instance.on(eventName(name), adapt(fn));
  };

  $.unsubscribe = function (name, fn) {
    deprecated();
    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
    window.Parsley.off(eventName(name), fn.parsleyAdaptedCallback);
  };

  $.unsubscribeTo = function (instance, name) {
    deprecated();
    if (!(instance instanceof parsley_field) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
    instance.off(eventName(name));
  };

  $.unsubscribeAll = function (name) {
    deprecated();
    window.Parsley.off(eventName(name));
    $('form,input,textarea,select').each(function () {
      var instance = $(this).data('Parsley');
      if (instance) {
        instance.off(eventName(name));
      }
    });
  };

  // $.emit is deprecated. Use jQuery events instead.
  $.emit = function (name, instance) {
    var _instance;

    deprecated();
    var instanceGiven = instance instanceof parsley_field || instance instanceof ParsleyForm;
    var args = Array.prototype.slice.call(arguments, instanceGiven ? 2 : 1);
    args.unshift(eventName(name));
    if (!instanceGiven) {
      instance = window.Parsley;
    }
    (_instance = instance).trigger.apply(_instance, _toConsumableArray(args));
  };

  var pubsub = {};

  $.extend(true, Parsley, {
    asyncValidators: {
      'default': {
        fn: function fn(xhr) {
          // By default, only status 2xx are deemed successful.
          // Note: we use status instead of state() because responses with status 200
          // but invalid messages (e.g. an empty body for content type set to JSON) will
          // result in state() === 'rejected'.
          return xhr.status >= 200 && xhr.status < 300;
        },
        url: false
      },
      reverse: {
        fn: function fn(xhr) {
          // If reverse option is set, a failing ajax request is considered successful
          return xhr.status < 200 || xhr.status >= 300;
        },
        url: false
      }
    },

    addAsyncValidator: function addAsyncValidator(name, fn, url, options) {
      Parsley.asyncValidators[name] = {
        fn: fn,
        url: url || false,
        options: options || {}
      };

      return this;
    }

  });

  Parsley.addValidator('remote', {
    requirementType: {
      '': 'string',
      'validator': 'string',
      'reverse': 'boolean',
      'options': 'object'
    },

    validateString: function validateString(value, url, options, instance) {
      var data = {};
      var ajaxOptions;
      var csr;
      var validator = options.validator || (true === options.reverse ? 'reverse' : 'default');

      if ('undefined' === typeof Parsley.asyncValidators[validator]) throw new Error('Calling an undefined async validator: `' + validator + '`');

      url = Parsley.asyncValidators[validator].url || url;

      // Fill current value
      if (url.indexOf('{value}') > -1) {
        url = url.replace('{value}', encodeURIComponent(value));
      } else {
        data[instance.$element.attr('name') || instance.$element.attr('id')] = value;
      }

      // Merge options passed in from the function with the ones in the attribute
      var remoteOptions = $.extend(true, options.options || {}, Parsley.asyncValidators[validator].options);

      // All `$.ajax(options)` could be overridden or extended directly from DOM in `data-parsley-remote-options`
      ajaxOptions = $.extend(true, {}, {
        url: url,
        data: data,
        type: 'GET'
      }, remoteOptions);

      // Generate store key based on ajax options
      instance.trigger('field:ajaxoptions', instance, ajaxOptions);

      csr = $.param(ajaxOptions);

      // Initialise querry cache
      if ('undefined' === typeof Parsley._remoteCache) Parsley._remoteCache = {};

      // Try to retrieve stored xhr
      var xhr = Parsley._remoteCache[csr] = Parsley._remoteCache[csr] || $.ajax(ajaxOptions);

      var handleXhr = function handleXhr() {
        var result = Parsley.asyncValidators[validator].fn.call(instance, xhr, url, options);
        if (!result) // Map falsy results to rejected promise
          result = $.Deferred().reject();
        return $.when(result);
      };

      return xhr.then(handleXhr, handleXhr);
    },

    priority: -1
  });

  Parsley.on('form:submit', function () {
    Parsley._remoteCache = {};
  });

  window.ParsleyExtend.addAsyncValidator = function () {
    ParsleyUtils.warnOnce('Accessing the method `addAsyncValidator` through an instance is deprecated. Simply call `Parsley.addAsyncValidator(...)`');
    return Parsley.addAsyncValidator.apply(Parsley, arguments);
  };

  // This is included with the Parsley library itself,
  // thus there is no use in adding it to your project.
  Parsley.addMessages('en', {
    defaultMessage: "This value seems to be invalid.",
    type: {
      email: "This value should be a valid email.",
      url: "This value should be a valid url.",
      number: "This value should be a valid number.",
      integer: "This value should be a valid integer.",
      digits: "This value should be digits.",
      alphanum: "This value should be alphanumeric."
    },
    notblank: "This value should not be blank.",
    required: "This value is required.",
    pattern: "This value seems to be invalid.",
    min: "This value should be greater than or equal to %s.",
    max: "This value should be lower than or equal to %s.",
    range: "This value should be between %s and %s.",
    minlength: "This value is too short. It should have %s characters or more.",
    maxlength: "This value is too long. It should have %s characters or fewer.",
    length: "This value length is invalid. It should be between %s and %s characters long.",
    mincheck: "You must select at least %s choices.",
    maxcheck: "You must select %s choices or fewer.",
    check: "You must select between %s and %s choices.",
    equalto: "This value should be the same."
  });

  Parsley.setLocale('en');

  /**
   * inputevent - Alleviate browser bugs for input events
   * https://github.com/marcandre/inputevent
   * @version v0.0.3 - (built Thu, Apr 14th 2016, 5:58 pm)
   * @author Marc-Andre Lafortune <github@marc-andre.ca>
   * @license MIT
   */

  function InputEvent() {
    var _this13 = this;

    var globals = window || global;

    // Slightly odd way construct our object. This way methods are force bound.
    // Used to test for duplicate library.
    $.extend(this, {

      // For browsers that do not support isTrusted, assumes event is native.
      isNativeEvent: function isNativeEvent(evt) {
        return evt.originalEvent && evt.originalEvent.isTrusted !== false;
      },

      fakeInputEvent: function fakeInputEvent(evt) {
        if (_this13.isNativeEvent(evt)) {
          $(evt.target).trigger('input');
        }
      },

      misbehaves: function misbehaves(evt) {
        if (_this13.isNativeEvent(evt)) {
          _this13.behavesOk(evt);
          $(document).on('change.inputevent', evt.data.selector, _this13.fakeInputEvent);
          _this13.fakeInputEvent(evt);
        }
      },

      behavesOk: function behavesOk(evt) {
        if (_this13.isNativeEvent(evt)) {
          $(document) // Simply unbinds the testing handler
          .off('input.inputevent', evt.data.selector, _this13.behavesOk).off('change.inputevent', evt.data.selector, _this13.misbehaves);
        }
      },

      // Bind the testing handlers
      install: function install() {
        if (globals.inputEventPatched) {
          return;
        }
        globals.inputEventPatched = '0.0.3';
        var _arr = ['select', 'input[type="checkbox"]', 'input[type="radio"]', 'input[type="file"]'];
        for (var _i = 0; _i < _arr.length; _i++) {
          var selector = _arr[_i];
          $(document).on('input.inputevent', selector, { selector: selector }, _this13.behavesOk).on('change.inputevent', selector, { selector: selector }, _this13.misbehaves);
        }
      },

      uninstall: function uninstall() {
        delete globals.inputEventPatched;
        $(document).off('.inputevent');
      }

    });
  };

  var inputevent = new InputEvent();

  inputevent.install();

  var parsley = Parsley;

  return parsley;
});

// Validation errors messages for Parsley
// Load this after Parsley

Parsley.addMessages('nl', {
  defaultMessage: "Deze waarde lijkt onjuist.",
  type: {
    email:        "Dit lijkt geen geldig e-mail adres te zijn.",
    url:          "Dit lijkt geen geldige URL te zijn.",
    number:       "Deze waarde moet een nummer zijn.",
    integer:      "Deze waarde moet een nummer zijn.",
    digits:       "Deze waarde moet numeriek zijn.",
    alphanum:     "Deze waarde moet alfanumeriek zijn."
  },
  notblank:       "Deze waarde mag niet leeg zijn.",
  required:       "Dit veld is verplicht.",
  pattern:        "Deze waarde lijkt onjuist te zijn.",
  min:            "Deze waarde mag niet lager zijn dan %s.",
  max:            "Deze waarde mag niet groter zijn dan %s.",
  range:          "Deze waarde moet tussen %s en %s liggen.",
  minlength:      "Deze tekst is te kort. Deze moet uit minimaal %s karakters bestaan.",
  maxlength:      "Deze waarde is te lang. Deze mag maximaal %s karakters lang zijn.",
  length:         "Deze waarde moet tussen %s en %s karakters lang zijn.",
  equalto:        "Deze waardes moeten identiek zijn."
});

Parsley.setLocale('nl');

!function(root, factory) {
    "function" == typeof define && define.amd ? // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function() {
        return root.svg4everybody = factory();
    }) : "object" == typeof exports ? // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory() : root.svg4everybody = factory();
}(this, function() {
    /*! svg4everybody v2.1.0 | github.com/jonathantneal/svg4everybody */
    function embed(svg, target) {
        // if the target exists
        if (target) {
            // create a document fragment to hold the contents of the target
            var fragment = document.createDocumentFragment(), viewBox = !svg.getAttribute("viewBox") && target.getAttribute("viewBox");
            // conditionally set the viewBox on the svg
            viewBox && svg.setAttribute("viewBox", viewBox);
            // copy the contents of the clone into the fragment
            for (// clone the target
            var clone = target.cloneNode(!0); clone.childNodes.length; ) {
                fragment.appendChild(clone.firstChild);
            }
            // append the fragment into the svg
            svg.appendChild(fragment);
        }
    }
    function loadreadystatechange(xhr) {
        // listen to changes in the request
        xhr.onreadystatechange = function() {
            // if the request is ready
            if (4 === xhr.readyState) {
                // get the cached html document
                var cachedDocument = xhr._cachedDocument;
                // ensure the cached html document based on the xhr response
                cachedDocument || (cachedDocument = xhr._cachedDocument = document.implementation.createHTMLDocument(""), 
                cachedDocument.body.innerHTML = xhr.responseText, xhr._cachedTarget = {}), // clear the xhr embeds list and embed each item
                xhr._embeds.splice(0).map(function(item) {
                    // get the cached target
                    var target = xhr._cachedTarget[item.id];
                    // ensure the cached target
                    target || (target = xhr._cachedTarget[item.id] = cachedDocument.getElementById(item.id)), 
                    // embed the target into the svg
                    embed(item.svg, target);
                });
            }
        }, // test the ready state change immediately
        xhr.onreadystatechange();
    }
    function svg4everybody(rawopts) {
        function oninterval() {
            // while the index exists in the live <use> collection
            for (// get the cached <use> index
            var index = 0; index < uses.length; ) {
                // get the current <use>
                var use = uses[index], svg = use.parentNode;
                if (svg && /svg/i.test(svg.nodeName)) {
                    var src = use.getAttribute("xlink:href");
                    if (polyfill && (!opts.validate || opts.validate(src, svg, use))) {
                        // remove the <use> element
                        svg.removeChild(use);
                        // parse the src and get the url and id
                        var srcSplit = src.split("#"), url = srcSplit.shift(), id = srcSplit.join("#");
                        // if the link is external
                        if (url.length) {
                            // get the cached xhr request
                            var xhr = requests[url];
                            // ensure the xhr request exists
                            xhr || (xhr = requests[url] = new XMLHttpRequest(), xhr.open("GET", url), xhr.send(), 
                            xhr._embeds = []), // add the svg and id as an item to the xhr embeds list
                            xhr._embeds.push({
                                svg: svg,
                                id: id
                            }), // prepare the xhr ready state change event
                            loadreadystatechange(xhr);
                        } else {
                            // embed the local id into the svg
                            embed(svg, document.getElementById(id));
                        }
                    }
                } else {
                    // increase the index when the previous value was not "valid"
                    ++index;
                }
            }
            // continue the interval
            requestAnimationFrame(oninterval, 67);
        }
        var polyfill, opts = Object(rawopts), newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/, webkitUA = /\bAppleWebKit\/(\d+)\b/, olderEdgeUA = /\bEdge\/12\.(\d+)\b/;
        polyfill = "polyfill" in opts ? opts.polyfill : newerIEUA.test(navigator.userAgent) || (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 || (navigator.userAgent.match(webkitUA) || [])[1] < 537;
        // create xhr requests object
        var requests = {}, requestAnimationFrame = window.requestAnimationFrame || setTimeout, uses = document.getElementsByTagName("use");
        // conditionally start the interval if the polyfill is active
        polyfill && oninterval();
    }
    return svg4everybody;
});
'use strict';

/**
 * Return the closest element matching a selector up the DOM tree
 * Credit: https://github.com/jonathantneal/closest
 */

if (typeof Element.prototype.closest !== 'function') {
	Element.prototype.closest = function closest(selector) {
		var element = this;

		while (element && element.nodeType === 1) {
			if (element.matches(selector)) {
				return element;
			}

			element = element.parentNode;
		}

		return null;
	};
}
/**
 * Method of testing whether or not a DOM element matches a given selector. 
 * Formerly known (and largely supported with prefix) as matchesSelector.
 * Credit: https://github.com/jonathantneal/closest
 */

if (typeof Element.prototype.matches !== 'function') {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
		var element = this,
		    elements = (element.document || element.ownerDocument).querySelectorAll(selector),
		    index = 0;

		while (elements[index] && elements[index] !== element) {
			++index;
		}

		return Boolean(elements[index]);
	};
}
/**
 * Transform HTML collections and Nodes to arrays, so the methods are available.
 * @type {Array}
 */

var methods = ['forEach', 'filter'];

for (var n in methods) {
	var method = methods[n];

	if (typeof NodeList.prototype[method] !== 'function') {
		NodeList.prototype[method] = Array.prototype[method];
	}
}
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
	windowWidth: $(window).width()
};

app.mediaQueries = {
	alphaAndUp: '(min-width: 0px)',
	alphaAndBeta: '(max-width: 699px)',
	alpha: '(max-width: 599px)',
	betaAndUp: '(min-width: 600px)',
	beta: '(min-width: 600px) and (max-width: 767px)',
	gammaAndUp: '(min-width: 768px)',
	gamma: '(min-width: 768px) and (max-width: 799px)',
	deltaAndUp: '(min-width: 800px)',
	delta: '(min-width: 800px) and (max-width: 999px)',
	epsilonAndUp: '(min-width: 1000px)',
	epsilon: '(min-width: 1000px) and (max-width: 1199px)',
	zetaAndUp: '(min-width: 1200px)',
	zeta: '(min-width: 1200px) and (max-width: 1399px)',
	etaAndUp: '(min-width: 1400px)'
};
helper.cookies = {
	create: function create(name, value, days) {
		var expires = "";

		if (days) {
			var date = new Date();

			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = "; expires=" + date.toGMTString();
		}

		document.cookie = name + "=" + value + expires + "; path=/";
	},

	read: function read(name) {
		var nameEQ = name + "=",
		    ca = document.cookie.split(';');

		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];

			while (c.charAt(0) === ' ') {
				c = c.substring(1, c.length);
			}

			if (c.indexOf(nameEQ) === 0) {
				return c.substring(nameEQ.length, c.length);
			}
		}

		return null;
	},

	erase: function erase(name) {
		helper.cookies.create(name, "", -1);
	}
};
/**
 * Get coordinates relative to the document,
 * Just like jQuery's offset functiom.
 */

helper.getCoords = function (el) {
	var box = el.getBoundingClientRect();

	var body = document.body;
	var docEl = document.documentElement;

	var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
	var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

	var clientTop = docEl.clientTop || body.clientTop || 0;
	var clientLeft = docEl.clientLeft || body.clientLeft || 0;

	var top = box.top + scrollTop - clientTop;
	var left = box.left + scrollLeft - clientLeft;

	return {
		top: Math.round(top),
		left: Math.round(left) };
};
helper.inView = function (el) {
	if (el instanceof jQuery) {
		el = el[0];
	}

	var rect = el.getBoundingClientRect();

	return rect.top >= 0 && rect.bottom <= document.body.clientHeight;
};
helper.outView = function (el) {
	if (el instanceof jQuery) {
		el = el[0];
	}

	var rect = el.getBoundingClientRect();

	return rect.bottom < 0 || rect.top > document.body.clientHeight;
};
helper.partiallyInView = function (el) {
	if (el instanceof jQuery) {
		el = el[0];
	}

	var rect = el.getBoundingClientRect();

	return rect.bottom - rect.height / 2 <= document.body.clientHeight;
};
app.accordion = {
	settings: {
		el: document.querySelectorAll('.accordion'),
		group: document.querySelectorAll('.accordion__group'),
		trigger: document.querySelectorAll('.accordion__trigger'),
		contentShowClass: 'accordion-content-show'
	},

	init: function init() {
		if (app.accordion.settings.el.length > 0) {
			app.accordion.setGroupHeight();
			app.accordion.toggler();

			window.onresize = function () {
				app.accordion.setGroupHeight();
			};
		}
	},

	setGroupHeight: function setGroupHeight() {
		var groupDelegate = function groupDelegate(group) {
			var groupContent = group.querySelector('.accordion__content');

			groupContent.setAttribute('style', '');

			var contentHeight = groupContent.offsetHeight;

			groupContent.setAttribute('data-accordion-content-height', contentHeight);
			group.classList.contains(app.accordion.settings.contentShowClass) ? groupContent.style.maxHeight = contentHeight : groupContent.style.maxHeight = 0;
		};

		app.accordion.settings.group.forEach(groupDelegate);
	},

	toggler: function toggler() {
		var triggerEventHandler = function triggerEventHandler(trigger) {
			trigger.addEventListener('click', function () {
				var group = trigger.parentNode,
				    content = trigger.nextElementSibling;

				if (group.classList.contains(app.accordion.settings.contentShowClass)) {
					app.accordion.hideGroup(content);
				} else {
					app.accordion.hideGroup(trigger);
					app.accordion.showGroup(trigger, content);
				}
			});
		};

		app.accordion.settings.trigger.forEach(triggerEventHandler);
	},

	showGroup: function showGroup(trigger, content) {
		content.style.maxHeight = trigger.nextElementSibling.getAttribute('data-accordion-content-height') + 'px';
		content.parentNode.classList.add(app.accordion.settings.contentShowClass);
	},

	hideGroup: function hideGroup(trigger) {
		var shownItem = document.querySelector('.accordion-content-show'),
		    content = document.querySelectorAll('.accordion__content'),
		    contentDelegate = function contentDelegate(content) {
			return content.style.maxHeight = 0;
		};

		if (shownItem === null) {
			trigger.classList.add(app.accordion.settings.contentShowClass);
		} else {
			shownItem.classList.remove(app.accordion.settings.contentShowClass);
		}

		content.forEach(contentDelegate);
	}
};
app.affix = {
	settings: {
		el: document.querySelectorAll('[data-affix]'),
		navBar: document.getElementById('nav-bar')
	},

	init: function init(_scrollTop) {
		if (app.affix.settings.el.length > 0) {
			var delegate = function delegate(affix) {
				var affixHeight = affix.offsetHeight;

				if (affixHeight < app.settings.windowHeight) {
					window.onscroll = function () {
						app.affix.scroller(this.scrollY, affix);
					};
				}
			};

			app.affix.resizeWidth();
			app.affix.updateOffsetTop(_scrollTop);
			app.affix.settings.el.forEach(delegate);

			window.onresize = function () {
				app.affix.resizeWidth();
			};
		}
	},

	scroller: function scroller(_scrollTop, _el) {
		var container = _el.closest('.affix-container'),
		    affixOffsetTop = _el.getAttribute('data-affix-offset'),
		    bottomTrigger = helper.getCoords(container).top + container.offsetHeight - _el.offsetHeight;

		if (app.navBar.settings.el && app.navBar.settings.el.classList.contains('nav-bar--fixed')) {
			bottomTrigger = bottomTrigger - app.navBar.settings.navBarHeight;
		}

		// Make it stick
		if (_scrollTop >= affixOffsetTop && _scrollTop < bottomTrigger && _el.offsetHeight < container.offsetHeight) {
			_el.classList.add('affix--fixed');
			_el.classList.remove('affix--absolute');
			app.navBar.settings.el.classList.contains('nav-bar--fixed') ? _el.style.top = app.affix.settings.navBar.offsetHeight : _el.style.top = 0;

			// At the bottom so bottom align it
		} else if (_scrollTop >= bottomTrigger && _el.offsetHeight < container.offsetHeight) {
			_el.classList.remove('affix--fixed');
			_el.classList.add('affix--absolute');

			// Relative positioning
		} else {
			_el.classList.remove('affix--fixed');
			_el.classList.remove('affix--absolute');
			_el.style.top = 0;
		}
	},

	updateOffsetTop: function updateOffsetTop(_scrollTop) {
		var delegate = function delegate(affix) {
			var affixHeight = affix.offsetHeight,
			    offsetTop = affix.getBoundingClientRect().top;

			if (affixHeight < app.settings.windowHeight) {
				if (app.navBar.settings.el && app.navBar.settings.el.classList.contains('nav-bar--fixed')) {
					offsetTop = offsetTop - app.affix.settings.navBar.outerHeight;
				}

				affix.setAttribute('data-affix-offset', Math.round(offsetTop));
				app.affix.scroller(_scrollTop, affix);
			}
		};

		app.affix.settings.el.forEach(delegate);
	},

	resizeWidth: function resizeWidth() {
		var delegate = function delegate(affix) {
			affix.classList.remove('affix--fixed');
			affix.classList.remove('affix--absolute');
			affix.style.top = '';
			affix.style.width = '';
			affix.style.width = affix.offsetWidth + 'px';
		};

		app.affix.settings.el.forEach(delegate);
	}
};
app.btnDropdown = {
	init: function init() {
		// Dropdown toggler
		var toggleEventHandler = function toggleEventHandler(toggle) {
			toggle.addEventListener('click', function (event) {
				event.preventDefault();
				event.stopPropagation();

				btnDropdown = this.closest('.btn-dropdown');

				if (btnDropdown.classList.contains('btn-dropdown--open')) {
					btnDropdown.classList.remove('btn-dropdown--open');
				} else {
					app.btnDropdown.closeOpenDropdown();
					btnDropdown.classList.add('btn-dropdown--open');
				}
			});
		};

		document.querySelectorAll('[data-btn-dropdown-toggle]').forEach(toggleEventHandler);

		// Do not close dropdown on dropdown content clicks
		var dropdownEventHandler = function dropdownEventHandler(btn) {
			btn.addEventListener('click', function (event) {
				var allowProp = btn.getAttribute('data-btn-dropdown');

				if (allowProp !== 'allowPropagation') {
					event.stopPropagation();
				}
			});
		};

		document.querySelectorAll('.btn-dropdown__dropdown, .btn-dropdown__list').forEach(dropdownEventHandler);

		// Close all dropdowns on escape keydown
		var eventCloseDelegate = function eventCloseDelegate(event) {
			return app.btnDropdown.closeOpenDropdown();
		};

		document.onkeydown = function (event) {
			if (event.keyCode === 27) {
				eventCloseDelegate();
			}
		};

		// Close all dropdowns on body click
		document.body.addEventListener('click', function () {
			eventCloseDelegate();
		});
	},

	closeOpenDropdown: function closeOpenDropdown() {
		var openDelegate = function openDelegate(openDropdown) {
			openDropdown.classList.remove('btn-dropdown--open');
		};

		document.querySelectorAll('.btn-dropdown--open').forEach(openDelegate);
	}

};
app.btnRipple = {
	settings: {
		ripple: true
	},

	init: function init() {
		var btns = app.btnRipple.settings.ripple === true ? document.querySelectorAll('.btn') : $('.btn--ripple'),
		    btnEventHandler = function btnEventHandler(btn) {
			btn.addEventListener('click', function (event) {
				var ripple = this.querySelector('.btn__ripple');

				if (ripple === null) {
					ripple = app.btnRipple.appendRipple(btn);
				}

				this.classList.remove('btn--ripple-animate');

				var size = Math.max(this.offsetWidth, this.offsetHeight),
				    x = event.offsetX - size / 2,
				    y = event.offsetY - size / 2;

				ripple.style.width = size + 'px';
				ripple.style.height = size + 'px';
				ripple.style.left = x + 'px';
				ripple.style.top = y + 'px';

				this.classList.add('btn--ripple-animate');
			});
		};

		btns.forEach(btnEventHandler);
	},

	appendRipple: function appendRipple(btn) {
		var ripple = document.createElement('div');

		ripple.classList.add('btn__ripple');
		btn.appendChild(ripple);

		return ripple;
	}

};
app.cycle = {
	settings: {
		$el: $('.cycle__wrap', '.cycle'),
		slides: '> .cycle__item',
		pager: '> .cycle__pager',
		prev: '> .cycle__prev',
		next: '> .cycle__next',
		pagerActiveClass: 'cycle__pager--active'
	},

	init: function init() {
		if (app.cycle.settings.$el.length > 0) {
			app.cycle.settings.$el.cycle({
				slides: app.cycle.settings.slides,
				pager: app.cycle.settings.pager,
				prev: app.cycle.settings.prev,
				next: app.cycle.settings.next,
				pagerActiveClass: app.cycle.settings.pagerActiveClass,
				pauseOnHover: true,
				swipe: true,
				log: false,
				paused: true,
				fx: 'none'
			}).on('cycle-update-view', function (event, optionHash, slideOptionsHash, currentSlideEl) {
				if (optionHash.slideCount > 1) {
					$(this).addClass('cycle-active');
				}
			}).on('cycle-before', function () {
				// $('.thumbnail-grid__item').each(function () {
				//     $(this).removeClass('scrollspy--in-view').removeClass('animation-fadeIn');
				// });
			}).on('cycle-after', function () {
				// app.scrollSpy.init();
			});
		}
	}
};
app.delayedImageLoading = {
	settings: {
		el: '[data-delay-image-loading]'
	},

	init: function init() {
		if (document.documentElement.classList.contains('modernizr_template') && document.querySelector(app.delayedImageLoading.settings.el) !== null) {
			var template = document.querySelector(app.delayedImageLoading.settings.el),
			    parent = template.parentNode,
			    contents = template.innerHTML;

			parent.removeChild(template);
			parent.innerHTML += contents;
		}
	}
};

/*doc
---
title: Delay image loading
name: delay_image_loading
category: Javascript
---

JavaScript method to delay the load of images and make the page respond faster especially on slow connections. 

Idea is kindly borrowed from [Christian Heilmann](https://www.christianheilmann.com/2015/09/08/quick-trick-using-template-to-delay-loading-of-images/).

```html_example
<ul class="list-unstyled">
	<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf" /></li>
	<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf" /></li>
	<template data-delay-image-loading>
		<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf?text=delayed" /></li>
		<li><img src="http://placehold.it/400x100/f1f1f1/cfcfcf?text=delayed" /></li>
	</template>
</ul>
```

*/
app.disableHover = {
	timer: null,

	init: function init() {
		clearTimeout(app.disableHover.timer);

		if (!document.body.classList.contains('disable-hover')) {
			document.body.classList.add('disable-hover');
		}

		app.disableHover.timer = setTimeout(function () {
			document.body.classList.remove('disable-hover');
		}, 100);
	}
};

/*doc
---
title: Disable hover
name: disable_hover
category: Javascript
---

A disable hover (.disable-hover) class is added to the body. 
This class prevents pointer events so there won't be any hover effect repaints, just the repaints for scrolling. This results in a better scrolling performance.

*/
app.dropdowns = {
	settings: {
		el: document.querySelectorAll('.dropdown'),
		showClass: 'dropdown--show'
	},

	init: function init() {
		if (app.dropdowns.settings.el.length > 0) {
			var dropdownDelegate = function dropdownDelegate(dropdown) {
				return dropdown.addEventListener('click', function (event) {
					event.stopPropagation();

					if (document.documentElement.classList.contains('modernizr_touchevents') || this.getAttribute('data-dropdown-trigger')) {
						this.classList.toggle(app.dropdowns.settings.showClass);
					}
				});
			};

			app.dropdowns.settings.el.forEach(dropdownDelegate);

			document.body.onkeydown = function (event) {
				if (event.keyCode === 27) {
					app.dropdowns.closeAllDropdowns();
				}
			};

			document.body.onclick = function (event) {
				app.dropdowns.closeAllDropdowns();
			};
		}
	},

	closeAllDropdowns: function closeAllDropdowns() {
		if (app.dropdowns.settings.el.length > 0) {
			var closeDelegate = function closeDelegate(dropdown) {
				return dropdown.classList.remove('dropdown--show');
			};

			document.querySelectorAll('.dropdown').forEach(closeDelegate);
		}
	}
};
app.equalize = {
	settings: {
		el: document.querySelectorAll('[data-equalize]')
	},

	init: function init() {
		if (app.equalize.settings.el !== null) {
			var equalizeDelegate = function equalizeDelegate(equalize) {
				var currentHeight = 0,
				    mediaQuery = equalize.getAttribute('data-equalize'),
				    targets = equalize.querySelectorAll('[data-equalize-target]');

				if (Modernizr.mq(app.mediaQueries[mediaQuery]) === true || app.mediaQueries[mediaQuery] === undefined) {
					targets.forEach(function (target) {
						var height = null;

						target.style.height = 'auto';
						height = target.offsetHeight;

						if (height > currentHeight) {
							currentHeight = height;
						}
					});

					targets.forEach(function (target) {
						return target.style.height = currentHeight + 'px';
					});
				} else {
					targets.forEach(function (target) {
						return target.style.height = 'auto';
					});
				}
			};

			app.equalize.settings.el.forEach(equalizeDelegate);
		}
	}
};

/*doc
---
title: Equalize
name: equalize
category: Content
---

Equalize targets in just a snap. It can be everything not just columns or blocks.

```html_example
<div class="grid" data-equalize>
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis, beatae, alias? Necessitatibus nulla sint voluptate perspiciatis excepturi, architecto et, incidunt itaque iusto inventore porro! Eum ullam placeat quam, eius aperiam!</div>
		</div>
	</div>
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum.</div>
		</div>
	</div>
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum.</div>
		</div>
	</div>
</div>
```

You can also set a media query from where the equalizer has to kick in, like this.

```html_example
<div class="grid" data-equalize="betaAndUp">
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Omnis, beatae, alias? Necessitatibus nulla sint voluptate perspiciatis excepturi, architecto et, incidunt itaque iusto inventore porro! Eum ullam placeat quam, eius aperiam!</div>
		</div>
	</div>
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum.</div>
		</div>
	</div>
	<div class="column-4">
		<div data-equalize-target class="card">
			<div class="card__content">Lorem ipsum.</div>
		</div>
	</div>
</div>
```

*/
app.fastClick = {
	init: function init() {
		FastClick.attach(document.body);
	}
};

/*doc
---
title: Fastclick
name: fastclick
category: Javascript
---

Polyfill to remove click delays on browsers with touch UIs

*/
app.fitVids = {
	settings: {
		$el: $('.fitvids')
	},

	init: function init() {
		if (app.fitVids.settings.$el.length > 0) {
			app.fitVids.settings.$el.fitVids();
		}
	}
};

/*doc
---
title: Fitvids
name: fitvids
category: Javascript
---

A lightweight, easy-to-use jQuery plugin for fluid width video embeds.
Use the class fitvids as a container for your video and the plugin will take care of the rest.

*/
/**
 * This module is depended on jQuery.
 * Plugin used: Parsley (validation engine).
 */

app.formModules = {
	settings: {
		passwordToggle: document.querySelectorAll('.form__password-toggle'),
		passwordShowClass: 'form__input--show-password',
		$validation: $('[data-form-validate]'),
		validationLanguage: 'nl',
		range: document.querySelectorAll('input[type=range]')
	},

	init: function init() {
		app.formModules.customFileInput();
		app.formModules.validation();
		app.formModules.password();
		app.formModules.ajaxForm();
		app.formModules.floatingLabel();
		app.formModules.range();
	},

	range: function range() {
		var rangeEventHandler = function rangeEventHandler(range) {
			range.addEventListener('input', function () {
				var id = this.getAttribute('id'),
				    val = this.value,
				    measurement = this.getAttribute('data-range-measurement'),
				    range = document.querySelector('[data-range=' + id + ']');

				if (id !== undefined) {
					range.innerHTML = measurement === undefined ? val : val + measurement;
				}
			});
		};

		app.formModules.settings.range.forEach(rangeEventHandler);
	},

	customFileInput: function customFileInput() {
		var fileInput = document.querySelectorAll('.form__file-input');

		if (fileInput.length > 0) {
			fileInput.forEach(function (input) {
				var label = input.nextElementSibling,
				    labelVal = label.innerHTML;

				input.addEventListener('change', function (event) {
					var fileName = '';

					fileName = this.files && this.files.length > 1 ? (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length) : event.target.value.split('\\').pop();
					fileName ? label.querySelector('span').innerHTML = fileName : label.html(labelVal);
				});

				// Firefox bug fix
				input.addEventListener('focus', function (el) {
					return el.classList.add('has-focus');
				});
				input.addEventListener('blur', function (el) {
					return el.classList.remove('has-focus');
				});
			});
		}
	},

	password: function password() {
		var eventHandler = function eventHandler(el) {
			el.addEventListener('click', function () {
				var $this = $(this),
				    $formPassword = $this.closest('.form__input'),
				    $formInput = $formPassword.find('input'),
				    formType = $formInput.attr('type');

				$formInput.attr('type', formType === 'text' ? 'password' : 'text');
				$formPassword.toggleClass(app.formModules.settings.passwordShowClass);
			});
		};

		app.formModules.settings.passwordToggle.forEach(eventHandler);
	},

	validation: function validation() {
		var parsleyOptions = {
			errorClass: 'form__input--error',
			successClass: 'form__input--success',
			errorsWrapper: '<div class="parsley-container"></div>',
			errorTemplate: '<div></div>',
			trigger: 'change',

			classHandler: function classHandler(element) {
				var $element = element.$element[0];

				if ($element.localName === 'select') {
					element.$element.closest('.form__input').addClass('form__input--select-validated');
				}

				if ($element.localName === 'input' && $element.type === 'checkbox' || $element.localName === 'input' && $element.type === 'radio') {
					return element.$element.closest('.form__input-list');
				} else {
					return element.$element.closest('.form__input');
				}
			},

			errorsContainer: function errorsContainer(element) {
				var $container = element.$element.closest('.form__input');

				return $container;
			}
		};

		if (app.formModules.settings.$validation.length > 0) {
			app.formModules.settings.$validation.each(function () {
				$(this).parsley(parsleyOptions);
			});

			window.Parsley.setLocale(app.formModules.settings.validationLanguage);
		}
	},

	ajaxForm: function ajaxForm() {
		app.settings.$body.on('submit', '[data-form-ajax]', function (event) {
			var $form = $(this),
			    action = $form.attr('action'),
			    data = $form.data(),
			    url = null;

			event.preventDefault();

			url === undefined ? url = window.location : url = data.formAjaxUrl;

			if ($form.parsley().isValid()) {
				$.ajax({
					url: url,
					data: $form.serialize(),
					action: action,
					method: data.formAjaxMethod,
					dataType: data.formAjaxDatatype,
					success: function success(response) {

						switch (response.status) {
							case 200:
								app.notifications.add(data.formAjaxMsgContainer, response.message, 'beta', 'success');
								app.formModules.emptyForm($form);
								break;
							case 500:
								app.notifications.add(data.formAjaxMsgContainer, response.message, 'beta', 'error');
								break;
						}

						app.jump.to(data.formAjaxMsgContainer, 40);
					}
				});
			}
		});
	},

	emptyForm: function emptyForm(_form) {
		_form.find('input[type=text], input[type=password], textarea, select').val('');
		_form.find('input[type=radio], input[type=checkbox]').prop('checked', false);
	},

	floatingLabel: function floatingLabel() {
		app.formModules.floatingLabelSetClass($('.form__input--floating-label input'));

		app.settings.$body.on('change', '.form__input--floating-label input', function () {
			app.formModules.floatingLabelSetClass($(this));
		});
	},

	floatingLabelSetClass: function floatingLabelSetClass($input) {
		if ($input.length > 0) {
			$input.val().length > 0 ? $input.addClass('is-filled') : $input.removeClass('is-filled');
		}
	}
};
app.googleMaps = {
	settings: {
		el: document.getElementById('google-maps'),
		map: null,
		markers: [],
		openInfoWindow: null,
		centerLat: 53.199027,
		centerLon: 5.784693
	},

	markerData: [{
		'lat': '53.199027',
		'lng': '5.784693',
		'content': '<b>Company HQ</b><br />Some address 23<br />1234 AB Leeuwarden'
	}, {
		'lat': '53.199810',
		'lng': '5.774750',
		'content': '<b>Company</b><br />Some address 1<br />1234 AB Leeuwarden'
	}],

	init: function init() {
		if (app.googleMaps.settings.el !== null) {
			var script = document.createElement('script');

			script.type = 'text/javascript';
			script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp' + '&callback=app.googleMaps.map';
			document.body.appendChild(script);
		}
	},

	map: function map() {
		var mapOptions = {
			zoom: 16,
			center: new google.maps.LatLng(app.googleMaps.settings.centerLat, app.googleMaps.settings.centerLon),
			scrollwheel: false,
			navigationControl: false,
			mapTypeControl: false,
			scaleControl: false,
			draggable: true,
			zoomControl: false,
			panControl: false,

			// Styles from https://snazzymaps.com
			styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#81a2be" }, { "visibility": "on" }] }]
		};

		if (document.documentElement.classList.contains('modernizr_touchevents')) {
			mapOptions.draggable = false;
		}

		app.googleMaps.settings.map = new google.maps.Map(app.googleMaps.settings.el, mapOptions);

		var geocoder = new google.maps.Geocoder();

		// Creating a global infoWindow object that will be reused by all markers
		var infoWindow = new google.maps.InfoWindow();

		app.googleMaps.setMarkers(app.googleMaps.settings.map);

		google.maps.event.addListener(app.googleMaps.settings.map, 'click', function () {
			app.googleMaps.settings.markers[app.googleMaps.settings.openInfoWindow].infowindow.close();
		});
	},

	setMarkers: function setMarkers(map, marker) {
		var bounds = new google.maps.LatLngBounds();
		// let markerIcon = new google.maps.MarkerImage("/res/assets/dist/img/maps-pointer.png", new google.maps.Size(12, 12), new google.maps.Point(0, 0), new google.maps.Point(6, 6));


		app.googleMaps.markerData.forEach(function (item, index, array) {
			var latLng = new google.maps.LatLng(item.lat, item.lng);

			bounds.extend(latLng);

			// Creating a marker and putting it on the map
			var marker = new google.maps.Marker({
				position: latLng,
				// icon: markerIcon,
				map: map,
				title: item.title
			});

			marker.infowindow = new google.maps.InfoWindow({
				content: item.content
			});

			marker.addListener('click', function () {
				if (app.googleMaps.settings.openInfoWindow) {
					app.googleMaps.settings.markers[app.googleMaps.settings.openInfoWindow].infowindow.close();
				}

				app.googleMaps.settings.openInfoWindow = index;
				marker.infowindow.open(map, marker);
			});

			app.googleMaps.settings.markers.push(marker);
		});
	}

};
app.groupCheckable = {
	init: function init() {

		// Master checkbox
		var checkableDelegate = function checkableDelegate(checkable) {
			return app.groupCheckable.toggleGroup(checkable);
		};

		document.querySelectorAll('[data-group-checkable]').forEach(function (checkable) {
			checkableDelegate(checkable);

			checkable.addEventListener('change', function () {
				return checkableDelegate(checkable);
			});
		});

		// Target checkboxes
		var delegateCheckedCount = function delegateCheckedCount(target) {
			return target.checked;
		},
		    delegateGroupCheckable = function delegateGroupCheckable(target) {
			var group = target.getAttribute('data-group-checkable-target'),
			    targets = [].slice.call(document.querySelectorAll('[data-group-checkable-target=' + group + ']')),
			    trigger = document.querySelector('[data-group-checkable=' + group + ']'),
			    checkedCount = targets.filter(delegateCheckedCount).length;

			trigger.checked = targets.length === checkedCount ? 'checked' : '';
		},
		    checkableEventHandler = function checkableEventHandler(target) {
			target.addEventListener('change', function (event) {
				return delegateGroupCheckable(target);
			});
		};

		document.querySelectorAll('[data-group-checkable-target]').forEach(checkableEventHandler);
	},

	toggleGroup: function toggleGroup(checkable) {
		var group = document.querySelectorAll('[data-group-checkable-target=' + checkable.getAttribute('data-group-checkable') + ']'),
		    delegateGroup = function delegateGroup(checkbox) {
			return checkbox.checked = checkable.checked === true ? 'checked' : '';
		};

		// Check or uncheck boxes based on the checked state of the group checkbox.
		group.forEach(delegateGroup);
	}
};

/*doc
---
title: Group checkable
name: group_checkable
category: Javascript
---

```html_example
<input name="checkbox" type="checkbox" id="checkbox" data-group-checkable="checkable-example" /><label for="checkbox">Check all</label>
<ul class="form__input-list list-unstyled">
	<li><input name="checkbox" type="checkbox" id="checkbox1" data-group-checkable-target="checkable-example" /><label for="checkbox1">Checkbox</label></li>
	<li><input name="checkbox" type="checkbox" id="checkbox2" data-group-checkable-target="checkable-example" /><label for="checkbox2">Checkbox</label></li>
	<li><input name="checkbox" type="checkbox" id="checkbox3" data-group-checkable-target="checkable-example" /><label for="checkbox3">Checkbox</label></li>
</ul>
```

*/
app.jump = {
	settings: {
		speed: 300
	},

	init: function init() {
		document.querySelectorAll('[data-jumpto]').forEach(function (jumper) {
			jumper.addEventListener('click', function () {
				var extraOffset = 0;

				event.preventDefault();

				if (jumper.getAttribute('data-jumpto-extra-offset') !== undefined) {
					extraOffset = jumper.getAttribute('data-jumpto-extra-offset');
				}

				if (jumper.getAttribute('data-jumpto-speed') !== undefined) {
					app.jump.settings.speed = jumper.getAttribute('data-jumpto-speed');
				}

				app.jump.to(jumper.getAttribute('href'), extraOffset, app.jump.settings.speed);
			});
		});
	},

	to: function to(_target, _extraOffset, _speed) {
		var offsetTop = Math.round(helper.getCoords(document.querySelector(_target)).top);

		_extraOffset === undefined ? 0 : '';

		if (app.navBar.settings.el !== null) {
			offsetTop = offsetTop - (app.navBar.settings.el.offsetHeight + _extraOffset);
		} else {
			offsetTop = offsetTop + _extraOffset;
		}

		app.settings.$htmlAndBody.animate({ scrollTop: offsetTop }, _speed, function () {
			window.location.hash = _target;
		});
	}
};

/*doc
---
title: Jump
name: jump
category: Javascript
---

```html_example
<a href="#background" data-jumpto>Jump to background id</a>
```

*/
app.leave = {
	init: function init() {
		document.querySelectorAll('[type=submit]').forEach(function (el) {
			el.addEventListener('click', function () {
				app.leave.inActive();
			});
		});

		document.querySelectorAll('[data-leave-target], [data-leave-target] input:not(submit)').forEach(function (inputs) {
			inputs.addEventListener('change', function () {
				app.leave.active();
			});

			inputs.addEventListener('input', function () {
				app.leave.active();
			});
		});
	},

	active: function active(_message) {
		if (_message === undefined) {
			_message = 'You didn\'t save your changes.';
		}

		window.onbeforeunload = function () {
			return _message;
		};
	},

	inActive: function inActive() {
		window.onbeforeunload = undefined;
	}
};

/*doc
---
title: Leave
name: leave
category: Javascript
---

Show a message when leaving the page and form elements are edited.

## Seperate input
```html_example
<input type="text" data-leave-target />
```

## Entire form
```html_example
<form data-leave-target />
	<input type="text" />
	<input type="text" />
</form>
```

*/
app.modal = {
	settings: {
		scrollTopPosition: null,
		$trigger: $('.modal__trigger'),
		$modal: $('.modal')
	},

	init: function init() {
		app.settings.$body.append('<div class="modal__overlay" data-modal-close></div>');
		app.modal.triggers();
	},

	triggers: function triggers() {
		app.settings.$body.on('click', '.modal__trigger', function (event) {
			event.preventDefault();

			var $trigger = $(this),
			    data = $trigger.data();

			data.modal === 'ajax' ? app.modal.ajax(data.modalAjaxActivity, data.modalAjaxSection) : app.modal.open($trigger, data);
		});

		app.settings.$body.on('keydown', function (event) {
			if (event.keyCode === 27) {
				app.modal.close();
			}
		});

		app.settings.$body.on('click', '[data-modal-close]', function (event) {
			event.preventDefault();
			app.modal.close();
		});
	},

	create: function create(_triggerData, _targetModal) {
		var html = '<div id="' + _triggerData.modalId + '" class="modal"><div class="modal__content">';

		if (_triggerData.modal === 'ajax') {
			html += _triggerData.modalAjaxContent;
			html += '<a class="modal__close" data-modal-close></a>';
		} else {
			if (_triggerData.modalTitle !== undefined) {
				html += '<h2>' + _triggerData.modalTitle + '</h2>';
			}

			if (_triggerData.modalText !== undefined) {
				html += '<p>' + _triggerData.modalText + '</p>';
			}

			html += '<ul class="list-inline">';

			if (_triggerData.modalCloseBtn !== undefined) {
				if (_triggerData.modal === 'confirm') {
					if (typeof _triggerData.modalConfirmAction === "function") {
						html += '<li><a class="btn btn--beta btn--medium confirm-ok" href="javascript:void(0)" data-modal-close>' + _triggerData.modalConfirmBtn + '</a></li>';
					} else {
						html += '<li><a class="btn btn--beta btn--medium" href="' + _triggerData.modalConfirmAction + '">' + _triggerData.modalConfirmBtn + '</a></li>';
					}
					html += '<li><button class="btn btn--alpha btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button></li>';
				} else {
					html += '<li><button class="btn btn--beta btn--medium" data-modal-close>' + _triggerData.modalCloseBtn + '</button></li>';
				}
			}

			html += '</ul>';
		}

		html += '</div></div>';

		app.settings.$body.append(html);

		if (app.settings.$html.find('.confirm-ok').length) {
			app.settings.$body.find('#' + _triggerData.modalId + ' .confirm-ok').click(_triggerData.modalConfirmAction);
		}
	},

	open: function open(_trigger, _triggerData) {
		var scrollTopPosition = app.settings.$window.scrollTop(),
		    $targetModal = typeof _triggerData === 'string' ? $('#' + _triggerData) : $('#' + _triggerData.modalId);

		app.modal.settings.scrollTopPosition = scrollTopPosition;

		if ($targetModal.length > 0) {
			app.modal.show($targetModal, scrollTopPosition, _triggerData.modalOpenCallback);
		} else {
			app.modal.create(_triggerData, $targetModal);

			setTimeout(function () {
				app.modal.show($('#' + _triggerData.modalId), scrollTopPosition, _triggerData.modalOpenCallback);
			}, 100);
		}
	},

	show: function show(_targetModal, _scrollTopPosition, _modalOpenCallback) {
		app.settings.$html.addClass('modal-show');
		_targetModal.addClass('modal-show');

		//app.settings.$background.scrollTop(_scrollTopPosition);
		app.modal.setSize(_targetModal);

		if (_modalOpenCallback && typeof _modalOpenCallback === 'function') {
			_modalOpenCallback();
		}
	},

	close: function close() {
		$('.modal-show').removeClass('modal-show');

		//app.settings.$window.scrollTop(app.modal.settings.scrollTopPosition);
	},

	confirm: function confirm(_options) {
		var modalId = 'js-modal-confirm',
		    options = $.extend({
			modal: 'confirm',
			modalId: modalId,
			modalConfirmBtn: 'bevestigen',
			modalCloseBtn: 'annuleren'
		}, _options);

		$('#' + modalId).remove();

		app.modal.open(this, options);
	},

	/**
  * @TODO: Needs work..
  */
	ajax: function ajax(activity, request) {
		var modalId = 'js-modal-ajax';

		$('#' + modalId).remove();

		$.ajax({
			url: 'modal-ajax.html',
			method: 'GET',
			success: function success(data) {
				app.modal.open(this, {
					modal: 'ajax',
					modalId: modalId,
					modalAjaxContent: data
				});
			}
		});
	},

	setSize: function setSize(_targetModal) {
		// Adding even width and height
		// Because of subpixel rendering in Webkit
		// http://martinkool.com/post/27618832225/beware-of-half-pixels-in-css

		_targetModal.removeAttr('style');

		_targetModal.css({
			width: 2 * Math.ceil(_targetModal.width() / 2),
			height: 2 * Math.ceil(_targetModal.height() / 2)
		});
	}
};
app.navBar = {
	settings: {
		el: document.getElementById('nav-bar'),
		trigger: document.getElementById('nav-bar-trigger'),
		navBarOffsetTop: null,
		navBarHeight: null,
		lastWindowScrollTop: 0,
		hideOnScroll: false,
		fixedClass: 'nav-bar--fixed',
		showClass: 'nav-bar--show',
		mobileShowClass: 'nav-bar--mobile-show',
		transformClass: 'nav-bar--transform',
		allwaysShowOnMobile: true,
		allwaysShowOnMobileClass: 'nav-bar--always-show-on-mobile'
	},

	init: function init(_scrollTop) {
		if (app.navBar.settings.el !== null) {
			app.navBar.resize();
			app.navBar.addClasses();
			app.navBar.scroller(_scrollTop);
			app.navBar.trigger();
		}
	},

	resize: function resize() {
		if (app.navBar.settings.el !== null) {
			app.navBar.settings.navBarOffsetTop = Math.round(app.navBar.settings.el.getBoundingClientRect().top), app.navBar.settings.navBarHeight = app.navBar.settings.el.offsetHeight;
		}
	},

	addClasses: function addClasses() {
		if (app.navBar.settings.el.classList.contains(app.navBar.settings.fixedClass)) {
			app.settings.container.style.marginTop = app.navBar.settings.navBarHeight + 'px';
		}

		if (window.scrollY >= app.navBar.settings.navBarOffsetTop + 1) {
			app.navBar.settings.el.classList.add(app.navBar.settings.fixedClass);
		}

		if (app.navBar.settings.allwaysShowOnMobile) {
			app.navBar.settings.el.classList.add(app.navBar.settings.allwaysShowOnMobileClass);
		}
	},

	scroller: function scroller(_scrollTop) {
		if (app.navBar.settings.el !== null) {
			if (_scrollTop >= app.navBar.settings.navBarOffsetTop) {
				app.navBar.settings.el.classList.add(app.navBar.settings.fixedClass);
				app.settings.container.style.marginTop = app.navBar.settings.navBarHeight + 'px';

				if (app.navBar.settings.hideOnScroll && _scrollTop >= app.navBar.settings.navBarOffsetTop + app.navBar.settings.navBarHeight) {
					app.navBar.settings.el.classList.add(app.navBar.settings.transformClass);
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
			} else {
				app.navBar.settings.el.classList.remove(app.navBar.settings.fixedClass);
				app.settings.container.style.marginTop = 0 + 'px';

				if (app.navBar.settings.hideOnScroll) {
					app.navBar.settings.el.classList.remove(app.navBar.settings.transformClass);
				}
			}

			if (_scrollTop > app.navBar.settings.lastWindowScrollTop) {
				if (app.navBar.settings.hideOnScroll && _scrollTop >= app.navBar.settings.navBarOffsetTop + app.navBar.settings.navBarHeight) {
					app.navBar.settings.el.classList.remove(app.navBar.settings.showClass);
				}
				if (!app.navBar.settings.hideOnScroll) {
					app.navBar.settings.el.classList.remove(app.navBar.settings.showClass);
				}
			} else {
				if (app.navBar.settings.hideOnScroll && _scrollTop >= app.navBar.settings.navBarOffsetTop + app.navBar.settings.navBarHeight) {
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
				if (!app.navBar.settings.hideOnScroll) {
					app.navBar.settings.el.classList.add(app.navBar.settings.showClass);
				}
			}

			app.navBar.settings.lastWindowScrollTop = _scrollTop;
		}
	},

	trigger: function trigger() {
		app.navBar.settings.trigger.addEventListener('click', function (event) {
			event.preventDefault();

			app.navBar.settings.el.classList.toggle(app.navBar.settings.mobileShowClass);
		});
	}
};
app.navPrimary = {
	settings: {
		el: document.getElementById('#nav-primary')
	},

	init: function init() {
		if (app.primaryNav.settings.el !== null) {}
	}
};
app.notifications = {
	settings: {
		cookieLaw: {
			position: 'bottom',
			approveBtnText: 'ok, ik snap het',
			infoBtnShow: true,
			infoBtnLink: '/cookiewet',
			infoBtnText: 'meer informatie',
			notificationText: 'Wij gebruiken cookies om uw gebruikerservaring te verbeteren en statistieken bij te houden.'
		}
	},

	init: function init() {
		var self = this;

		self.close();
		// self.cookieLaw.init(); // Uncomment if you need the notification
	},

	add: function add(_target, _message, _size, _type) {
		$(_target).html('<div class="notification notification--' + _size + ' notification--' + _type + '"><div class="notification__text">' + _message + '</div></div>');
	},

	close: function close() {
		var self = this;

		app.settings.$body.on('click', '[data-notification-close]', function (event) {
			event.preventDefault();

			var $close = $(this),
			    $notification = $close.parent(),
			    notificationId = $notification.attr('id');

			$notification.addClass('notification--close');

			if (notificationId === 'notification-cookie') {
				helper.cookies.create('cookieNotification', 'approved', 365);
			}

			setTimeout(function () {
				$notification.remove();
			}, 500);
		});
	},

	/*==========  Cookie law  ==========*/

	cookieLaw: {
		init: function init() {
			var self = this,
			    cookieValue = helper.cookies.read('cookieNotification'),
			    info = '';

			if (cookieValue !== 'approved' && navigator.CookiesOK === undefined) {
				app.settings.$html.attr('notification-cookie-position', app.notifications.settings.cookieLaw.position);

				if (app.notifications.settings.cookieLaw.infoBtnShow) {
					info = '<a class="btn btn--alpha btn--small" href="' + app.notifications.settings.cookieLaw.infoBtnLink + '">' + app.notifications.settings.cookieLaw.infoBtnText + '</a>';
				}

				var html = '<div id="notification-cookie" class="notification notification--alpha notification--cookie">' + '<div class="notification__text">' + app.notifications.settings.cookieLaw.notificationText + '</div>' + '<a class="btn btn--beta btn--small" data-notification-close>' + app.notifications.settings.cookieLaw.approveBtnText + '</a> ' + info + '</div>';

				app.settings.$background.prepend(html);

				setTimeout(function () {
					app.settings.$html.addClass('notification-cookie-show');
				}, 0);
			}
		}
	}
};
app.offCanvas = {
	settings: {
		toggleLeft: '#off-canvas-toggle-left',
		toggleRight: '#off-canvas-toggle-right',
		width: $('.off-canvas, .off-canvas-nav-bar').outerWidth(),
		$el: $('.off-canvas, .off-canvas-nav-bar'),
		$link: $('.off-canvas-nav__link, .off-canvas-nav-bar__link')
	},

	init: function init() {

		app.offCanvas.settings.$link.on('click', function (event) {
			event.preventDefault();

			var href = window.location,
			    linkHref = $(this).attr('href');

			app.offCanvas.hideLeftAndRight();

			setTimeout(function () {
				if (href !== linkHref) {
					window.location = linkHref;
				}
			}, 400);
		});

		app.settings.$html.on('click', app.offCanvas.settings.toggleLeft, function (event) {
			app.offCanvas.toggleLeft();
		});

		app.settings.$html.on('click', app.offCanvas.settings.toggleRight, function (event) {
			app.offCanvas.toggleRight();
		});

		app.settings.$container.on('click', function () {
			app.offCanvas.hideLeftAndRight();
		});

		app.settings.$body.on('keydown', function (event) {
			if (event.keyCode === 27) {
				app.offCanvas.hideLeftAndRight();
			}
		});
	},

	hideLeftAndRight: function hideLeftAndRight() {
		app.settings.$html.removeClass('off-canvas-show-left').removeClass('off-canvas-show-right').removeClass('off-canvas-nav-bar-show-left').removeClass('off-canvas-nav-bar-show-right');
	},

	showLeft: function showLeft() {
		app.settings.$html.addClass('off-canvas-show-left').addClass('off-canvas-nav-bar-show-left');
	},

	hideLeft: function hideLeft() {
		app.settings.$html.removeClass('off-canvas-show-left').removeClass('off-canvas-nav-bar-show-left');
	},

	toggleLeft: function toggleLeft() {
		app.offCanvas.hideRight();
		app.settings.$html.toggleClass('off-canvas-show-left').toggleClass('off-canvas-nav-bar-show-left');
	},

	showRight: function showRight() {
		app.settings.$html.addClass('off-canvas-show-right').addClass('off-canvas-nav-bar-show-right');
	},

	hideRight: function hideRight() {
		app.settings.$html.removeClass('off-canvas-show-right').removeClass('off-canvas-nav-bar-show-right');
	},

	toggleRight: function toggleRight() {
		app.offCanvas.hideLeft();
		app.settings.$html.toggleClass('off-canvas-show-right').toggleClass('off-canvas-nav-bar-show-right');
	}
};
app.responsiveImages = {
	settings: {},

	init: function init() {
		app.responsiveImages.setBackgroundImage();
	},

	setBackgroundImage: function setBackgroundImage() {
		var setDelegate = function setDelegate(el) {
			return app.responsiveImages.setBackgroundImageStyle(el);
		};

		document.querySelectorAll('[data-responsive-bg-img]').forEach(setDelegate);
	},

	setBackgroundImageStyle: function setBackgroundImageStyle(element) {
		var domNode = element.querySelector('img'),
		    source = null;

		domNode.currentSrc === undefined ? source = domNode.src : source = domNode.currentSrc;
		element.style.backgroundImage = 'url(' + source + ')';
	}
};

/*doc
---
title: Responsive images
name: 8_responsive_images
category: Responsive images
---

If you're new to responsive images check out [this article](https://dev.opera.com/articles/native-responsive-images/).

Picturefill is used for wider browser support. There is a Picturefill [JavaScript API](https://scottjehl.github.io/picturefill/#api) available.

*/

/*doc
---
title: Fixed dimensions
name: fixed_dimensions
category: Responsive images
---
These examples will let the browser decide which image is best to display on the used device.

## Different sizes
This tells the browser the width of each image, the browser decides which image is best to display on the current viewport.

```html_example
<img srcset="http://placehold.it/400x200 400w,
			http://placehold.it/800x400 800w,
			http://placehold.it/1200x600 1024w"
	alt="Responsive image" />
```

## Retina example
Rendered with a width of 200 pixels, different size of images are shown based on the device DPI.

```html_example
<img
	srcset="http://placehold.it/200x200 1x,
			http://placehold.it/400x400 2x,
			http://placehold.it/600x600 3x"
	alt="Responsive image"
	width="200" />
```


*/

/*doc
---
title: Variable width
name: variable_width
category: Responsive images
---

## Different sizes
Here we hint the browser how the image will be displayed eventually based on the CSS media queries used for the design.

```html_example
<img sizes="(max-width: 30em) 100vw,
			(max-width: 50em) 50vw,
			60vw"
	srcset="http://placehold.it/400x200 400w,
			http://placehold.it/800x400 800w,
			http://placehold.it/1600x800 1600w"
	alt="Responsive image" />
```

*/

/*doc
---
title: Art direction
name: art_direction
category: Responsive images
---
This is used when you need to explicity set an image for a certian media query, this way you can create cropped images with different ratios for example. Read more about [art direction](https://dev.opera.com/articles/native-responsive-images/#art-direction).

```html_example
<picture>
	<source srcset="http://placehold.it/1000x400" media="(min-width: 1000px)" />
	<source srcset="http://placehold.it/800x400" media="(min-width: 800px)" />
	<img srcset="http://placehold.it/600x400" alt="" />
</picture>
```

*/

/*doc
---
title: Set background image
name: set_background_image
category: Responsive images
---
Background image is set with the data-responsive-bg-img attribute, it reads the image tag for the current source. So all you have to do is add the attribute and place an image (with srcset) or a picture (like below).

```parse_html_example
<div class="notification notification--alpha">
	<div class="notification__text">The header class is added to add some demo styling, you could and probably should remove it in your code.</div>
</div>
```

```html_example
<div class="header" data-responsive-bg-img>
	<picture class="display-none">
		<source srcset="responsive-bg-img/1200.png" media="(min-width: 800px)" />
		<source srcset="responsive-bg-img/800.png" media="(min-width: 400px)" />
		<img srcset="responsive-bg-img/400.png" />
	</picture>
</div>
```

*/
app.scrollSpy = {
	settings: {
		$el: $('[data-scrollspy]'),
		defaultClass: 'animation-bounceIn',
		repeat: true
	},

	init: function init(_scrollTop, _windowHeight, _load) {
		var self = this,
		    windowHeight = app.settings.$window.height();

		if (app.scrollSpy.settings.$el.length > 0) {
			app.scrollSpy.settings.$el.each(function (index) {
				var $this = $(this),
				    elPositionTop = Math.round($this.offset().top),
				    elHeight = $this.height(),
				    inView = helper.inView($this),
				    outView = helper.outView($this),
				    partiallyInView = helper.partiallyInView($this),
				    data = $this.data(),
				    combinedClasses = data.scrollspyClass === undefined ? app.scrollSpy.settings.defaultClass : data.scrollspyClass;

				combinedClasses += ' scrollspy--in-view';

				if (app.settings.$html.hasClass('touch')) {
					$this.addClass(combinedClasses);
				} else {
					var hasCombinedClasses = $this.hasClass(combinedClasses),
					    delay = data.scrollspyDelay > 0 ? data.scrollspyDelay : 0;

					inView && !hasCombinedClasses ? setTimeout(function () {
						$this.addClass(combinedClasses);
					}, delay) : '';
					_load && partiallyInView && data.scrollspyPartiallyInView !== undefined ? setTimeout(function () {
						$this.addClass(combinedClasses);
					}, delay) : '';

					if (data.scrollspyRepeat !== undefined || app.scrollSpy.settings.repeat) {
						outView && hasCombinedClasses ? $this.removeClass(combinedClasses) : '';
					}

					$this.outerHeight() > windowHeight ? $this.addClass(combinedClasses) : '';
				}
			});
		}
	}
};
app.scrollSpyNav = {
	settings: {
		$el: $('[data-scrollspy-nav]'),
		navLength: $('[data-scrollspy-nav]').length - 1,
		currentNav: 0
	},

	init: function init(_scrollTop) {
		var self = this,
		    windowHeight = app.settings.$window.height();

		if (app.scrollSpyNav.settings.$el.length > 0) {
			app.scrollSpyNav.settings.$el.each(function () {
				var $this = $(this),
				    $target = $($this.attr('href')),
				    targetTop = Math.round($target.position().top),
				    $next = $this.parent().next().find('[data-jumpto-extra-offset]'),
				    nextTop = app.settings.$document.height();

				if (app.navBar.settings.el !== null) {
					targetTop = targetTop - app.navBar.settings.el.offsetHeight;
				}

				$next.length === 0 ? nextTop = app.settings.$document.height() : nextTop = $next.position().top;

				if (_scrollTop >= targetTop) {
					$('.scrollspy-nav--active').not($this).removeClass('scrollspy-nav--active');
					$this.addClass('scrollspy-nav--active');
				}
			});

			app.scrollSpyNav.settings.$el.parent().each(function (index) {
				var $item = $(this);

				if (_scrollTop === app.settings.$document.height() - windowHeight) {
					$('.scrollspy-nav--active').removeClass('scrollspy-nav--active');
					app.scrollSpyNav.settings.$el.parent().eq(app.scrollSpyNav.settings.navLength).find('[data-scrollspy-nav]').addClass('scrollspy-nav--active');
				}
			});
		}
	}
};
app.svg = {
	init: function init() {
		svg4everybody(); // SVG support for IE9-11
	}
};

/*doc
---
title: SVG
name: svg
category: Content
---

There are no SVGs present in basos but you can create an SVG workflow for your project. 

- Just drop SVG files in "/assets/src/img/svg/".
- A grunt task will create an SVG sprite of these files with there filename as an ID.
- You can use these IDs to reference them in your HTML document, see example below.

```parse_html_example
<div class="notification notification--alpha">
	<div class="notification__text">All the SVG files dropped in the src/svg folder will be copied to the dist/svg map so you can use them separately in your document.</div>
</div>
```

```parse_html_example
<div class="notification notification--alpha">
	<div class="notification__text">We use svg4everybody for IE9-11 support.</div>
</div>
```

```html_example
<svg width="20px" height="20px">
	<use xlink:href="assets/dist/img/sprite.svg#ID" />
</svg>
```

*/
app.tabs = {
	settings: {
		tab: document.querySelectorAll('.tab')
	},

	init: function init() {
		var tabsEventHandler = function tabsEventHandler(tab) {
			tab.addEventListener('click', function (event) {
				var item = document.querySelector(tab.getAttribute('href')),
				    content = item.closest('.tab-content');

				event.preventDefault();

				app.tabs.settings.tab.forEach(function (tab) {
					return tab.classList.remove('tab--active');
				});
				tab.classList.add('tab--active');

				content.querySelector('.tab-item--active').classList.remove('tab-item--active');
				item.classList.add('tab-item--active');
			});
		};

		app.tabs.settings.tab.forEach(tabsEventHandler);
	}
};
app.toggle = {
	settings: {
		el: document.querySelectorAll('[data-toggle]')
	},

	init: function init() {
		var toggleEventHandler = function toggleEventHandler(toggle) {
			toggle.addEventListener('click', function (event) {
				event.preventDefault();

				app.toggle.toggler(document.querySelector(this.getAttribute('data-toggle')));
			});
		};

		app.toggle.settings.el.forEach(toggleEventHandler);
	},

	toggler: function toggler(_target) {
		_target.classList.toggle('toggle--hide');
	}
};
app.tooltips = {
	settings: {
		el: document.querySelectorAll('.tooltip'),
		tooltipActiveClass: 'tooltip--active',
		tooltipContentClass: 'tooltip__content',
		arrowWidth: 8,
		tooltipTrigger: null
	},

	init: function init() {
		if (app.tooltips.settings.el.length > 0) {
			var delegate = function delegate(el) {
				if (el.getAttribute('data-tooltip-trigger') === 'click' || document.documentElement.classList.contains('modernizr_touchevents')) {
					app.tooltips.settings.tooltipTrigger = 'click';
				} else {
					app.tooltips.settings.tooltipTrigger = 'hover';
				}

				app.tooltips.triggers(el);
				app.tooltips.appendContent(el);
			};

			app.tooltips.settings.el.forEach(delegate);
		}
	},

	appendContent: function appendContent(tooltipTrigger) {
		var content = document.createElement('div');

		content.classList.add(app.tooltips.settings.tooltipContentClass);
		content.innerHTML = tooltipTrigger.getAttribute('title');

		tooltipTrigger.appendChild(content);
		tooltipTrigger.setAttribute('title', '');
		app.tooltips.calculatePosition(tooltipTrigger, tooltipTrigger.querySelector('.tooltip__content'));
	},

	triggers: function triggers(tooltipTrigger) {
		if (app.tooltips.settings.tooltipTrigger === 'hover') {
			tooltipTrigger.addEventListener('mouseover', function () {
				this.classList.add(app.tooltips.settings.tooltipActiveClass);
			});

			tooltipTrigger.addEventListener('mouseout', function () {
				this.classList.remove(app.tooltips.settings.tooltipActiveClass);
			});
		} else {
			tooltipTrigger.addEventListener('click', function () {
				this.classList.toggle(app.tooltips.settings.tooltipActiveClass);
			});
		}
	},

	calculatePosition: function calculatePosition(tooltipTrigger, tooltipContent) {
		var position = tooltipTrigger.offsetHeight + app.tooltips.settings.arrowWidth + 'px';

		switch (tooltipTrigger.getAttribute('data-tooltip-position')) {
			case 'top':
				tooltipContent.style.bottom = position;
				break;
			case 'bottom':
				tooltipContent.style.top = position;
				break;
		}
	}
};
app.yourModule = {
	settings: {},

	init: function init() {}
};
app.settings.$document.ready(function () {
	var $this = $(this),
	    scrollTop = $this.scrollTop();

	app.settings.html.classList.remove('no-js');
	app.settings.html.classList.add('js');

	app.affix.init();
	app.svg.init();
	app.scrollSpyNav.init(scrollTop);
	app.fastClick.init();
	app.fitVids.init();
	app.navBar.init(scrollTop);
	app.dropdowns.init();
	app.formModules.init();
	app.jump.init();
	app.modal.init();
	app.tooltips.init();
	app.accordion.init();
	app.tabs.init();
	app.notifications.init();
	app.offCanvas.init();
	app.toggle.init();
	app.groupCheckable.init();
	app.leave.init();
	app.btnDropdown.init();
	app.btnRipple.init();
	app.googleMaps.init();

	//app.cycle.init();
	//app.fancybox.init();
	//app.navPrimary.init();
});

app.settings.$window.ready(function () {
	var $this = $(this),
	    scrollTop = $this.scrollTop(),
	    windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, true);
	app.equalize.init();
	app.delayedImageLoading.init();

	setTimeout(function () {
		app.responsiveImages.setBackgroundImage();
	}, 10);
});

app.settings.$window.on('scroll', function () {
	var $this = $(this),
	    scrollTop = $this.scrollTop(),
	    windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, false);
	app.scrollSpyNav.init(scrollTop);
	app.navBar.scroller(scrollTop);
	app.disableHover.init();
});

app.settings.$window.on('touchmove', function () {
	var $this = $(this),
	    scrollTop = $this.scrollTop(),
	    windowHeight = $this.height();

	app.scrollSpy.init(scrollTop, windowHeight, false);
	app.scrollSpyNav.init(scrollTop);
});

app.settings.$window.on('resize', function () {

	app.settings.$html.addClass('disable-transitions');

	if (this.resizeTo) {
		clearTimeout(this.resizeTo);
	}

	this.resizeTo = setTimeout(function () {
		var $this = $(this),
		    scrollTop = $this.scrollTop(),
		    windowHeight = $this.height();

		app.equalize.init();
		app.scrollSpy.init(scrollTop, windowHeight, true);
		app.scrollSpyNav.init(scrollTop);
		app.navBar.resize(scrollTop);
		app.navBar.scroller(scrollTop);
		app.responsiveImages.setBackgroundImage();

		app.settings.$html.removeClass('disable-transitions');
	}, 500);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Jvd2VyX2NvbXBvbmVudHMvZmFzdGNsaWNrL2xpYi9mYXN0Y2xpY2suanMiLCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL2ZpdHZpZHMvanF1ZXJ5LmZpdHZpZHMuanMiLCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL3BhcnNsZXlqcy9kaXN0L3BhcnNsZXkuanMiLCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL3BhcnNsZXlqcy9kaXN0L2kxOG4vbmwuanMiLCIuLi8uLi8uLi9ib3dlcl9jb21wb25lbnRzL3N2ZzRldmVyeWJvZHkvZGlzdC9zdmc0ZXZlcnlib2R5LmpzIiwiLi4vLi4vc3JjL2pzL3BvbHlmaWxscy9fY2xvc2VzdC5qcyIsIi4uLy4uL3NyYy9qcy9wb2x5ZmlsbHMvX21hdGNoZXMuanMiLCIuLi8uLi9zcmMvanMvcG9seWZpbGxzL190b0FycmF5RnVuY3Rpb25zLmpzIiwiLi4vLi4vc3JjL2pzL19zZXR0aW5ncy5qcyIsIi4uLy4uL3NyYy9qcy9fbWVkaWFRdWVyaWVzLmpzIiwiLi4vLi4vc3JjL2pzL2hlbHBlcnMvX2Nvb2tpZXMuanMiLCIuLi8uLi9zcmMvanMvaGVscGVycy9fZ2V0Q29vcmRzLmpzIiwiLi4vLi4vc3JjL2pzL2hlbHBlcnMvX2luVmlldy5qcyIsIi4uLy4uL3NyYy9qcy9oZWxwZXJzL19vdXRWaWV3LmpzIiwiLi4vLi4vc3JjL2pzL2hlbHBlcnMvX3BhcnRpYWxseUluVmlldy5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19hY2NvcmRpb24uanMiLCIuLi8uLi9zcmMvanMvY29yZS9fYWZmaXguanMiLCIuLi8uLi9zcmMvanMvY29yZS9fYnRuRHJvcGRvd24uanMiLCIuLi8uLi9zcmMvanMvY29yZS9fYnRuUmlwcGxlLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX2N5Y2xlLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX2RlbGF5SW1hZ2VMb2FkaW5nLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX2Rpc2FibGVIb3Zlci5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19kcm9wZG93bnMuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fZXF1YWxpemUuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fZmFzdGNsaWNrLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX2ZpdFZpZHMuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fZm9ybU1vZHVsZXMuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fZ29vZ2xlTWFwcy5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19ncm91cENoZWNrYWJsZS5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19qdW1wLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX2xlYXZlLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX21vZGFsLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX25hdkJhci5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19uYXZQcmltYXJ5LmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX25vdGlmaWNhdGlvbnMuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fb2ZmQ2FudmFzLmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX3Jlc3BvbnNpdmVJbWFnZXMuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fc2Nyb2xsU3B5LmpzIiwiLi4vLi4vc3JjL2pzL2NvcmUvX3Njcm9sbFNweU5hdi5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL19zdmcuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fdGFicy5qcyIsIi4uLy4uL3NyYy9qcy9jb3JlL190b2dnbGUuanMiLCIuLi8uLi9zcmMvanMvY29yZS9fdG9vbHRpcHMuanMiLCIuLi8uLi9zcmMvanMvYXBwL195b3VyTW9kdWxlLmpzIiwiLi4vLi4vc3JjL2pzL19pbml0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7QUFDZDtBQUNBLENBQUMsR0FBRztBQUNKLEVBQUUsQ0FB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QUNBLEVBQUUsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLEdBQUcsTUFBTSxDQUFDO0FBQ1YsRUFBRSxDQUFDO0FBQ0g7QUFDQSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSTtBQUNwRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNsQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtBQUNsRSxFQUFFLENBQUM7QUFDSDtBQUNBO0FBQ0EsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxhQUFhLEdBQUc7QUFDckcsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDckIsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkQsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFD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RUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYTtBQUM5QyxFQUFFLEVBQUU7QUFDSixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUN0RCxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDYjtBQUNBLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO0FBQzlYLEVBQUUsRUFBRSxDQUFDLENBQUMs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VUFBVTtBQUMzRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ2hILElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQy9HLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDbkcsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUM7QUFDekgsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQzNILElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM3RSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7QUFDNUUsS0FBSyxLQUFLLENBQUMsY0FBYyxHQUFHO0FBQzVCLEtBQUssTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNsQixJQUFJLENBQUM7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO0FBQ2hEO0FBQ0EsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzVHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUs7QUFDOUQsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHO0FBQzFELElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUM5RyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLO0FBQ2hILElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUMzRyxJQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUU7QUFDM0MsR0FBRyxD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QUFFLENBQUMsQ0FBQztBQUM5QztBQUNBLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUNoUCxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFF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QyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDcFEsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztBQUMzQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM3QixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUM5QixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZixFQUFFLENBQUM7QUFDSDtBQUNBLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7QUFDNVIsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3RCxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDZixFQUFFLENBQUM7QUFDSDtBQUNBLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUNsQztBQUNBLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO0FBQzVLLEVBQUUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUNuQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUM3QixFQUFFLENBQUM7QUFDSDtBQUNBLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDdkUsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ25CLENBQUMsRUFBRTtBQUNIO0FBQ0E7QUFDQSxD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QUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3BHLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0YsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2YsRUFBRSxDQUFDO0FBQ0g7QUFDQSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRO0FBQzlDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUMvRTtBQUNBLEVBQUUsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdCLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTTtBQUM5SDtBQUNBLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJO0FBQ2hFLEdBQUcsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDaEosSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2hCLEdBQUcsQ0FBQztBQUNKLEVBQUUsQ0FBQztBQUNIO0FBQ0EsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTztBQUMzRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSTtBQUN2RSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3pGLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNmLEVBQUUsQ0FBQztBQUNIO0FBQ0EsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2YsQ0FBQyxFQUFFO0FBQ0g7QUFDQTtBQUNBLENBQUMsR0FBRztBQUNKLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDbEQsRUFBRSxDQUFDO0FBQ0gsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDakQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUTtBQUNyRSxFQUFFLEVBQUU7QUFDSixDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzlDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3ZDLENBQUMsRUFBRTtBQUNIO0FBQ0E7QUFDQSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwRjtBQUNBLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDMUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNyQixHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7QUFDcEIsRUFBRSxHQUFHO0FBQ0wsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUs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R0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHO0FBQy9MLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRztBQUNsSCxZQUFZLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDekMsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUk7QUFDOUIsVUFBVSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxFQUFFO0FBQ3BFLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRTtBQUNwQyxRQUFRLENBQUM7QUFDVCxRQUFRLENBQUMsSUFBSSxDQUFD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Q3ZDLE1BQU0sTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHO0FBQzdCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRztBQUNqQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVE7QUFDakMsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3hELE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUNkO0FBQ0EsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNYLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQy9MLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkIsUUFBUSxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3JCLE1BQU0sQ0FBQztBQUNQLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxRQUFRO0FBQzlCLElBQUksUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMzRCxRQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRztBQUM1QyxNQUFNLEdBQUc7QUFDVCxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUTtBQUMvQixJQUFJLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN4QyxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFdBQVcsR0FBRztBQUN0SixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUMxQjtBQUNBLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUNqSixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sRUFBRSxDQUFDLEVBQUUsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDL0IsUUFBUSxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNqQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRTtBQUN6QyxNQUFNLENBQUM7QUFDUCxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksY0FBYyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDL0MsTUFBTSxZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDeEIsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLFVBQVUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUM3QyxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUM5QyxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksZUFBZSxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJO0FBQzFELE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHO0FBQ2hDLE1BQU0sTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDM0MsUUFBUSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNyQyxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRztBQUNuQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3BELE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVM7QUFDNUMsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQ3RCLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4QyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDMUQsTUFBTSxHQUFHO0FBQ1QsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3BCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8s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QUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQzNFLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNO0FBQy9FLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUs7QUFDekQsSUFBSSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQzlDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN0RSxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO0FBQ3JCO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2xCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTztBQUNuQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENB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QUFDbEIsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxVQUFVLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQzNELFVBQVUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzlDLFFBQVEsQ0FBQztBQUNULE1BQU0sQ0FBQztBQUNQLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDeEIsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO0FBQzNELE1BQU0sQ0FBQztBQUNQLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQztBQUNsQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ2YsSUFBSSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM3QixNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNuRCxNQUFNLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUM3QyxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUc7QUFDeEIsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLEdBQUc7QUFDdEMsTUFBTSxDQUFDO0FBQ1A7QUFDQSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSztBQUNyRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDMUU7QUFDQSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxHQUFHO0FBQzdCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QyxJQUFJLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2pDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUTtBQUNwRixNQUFNLElBQUksQ0FBQyxVQUFVLEdBQUc7QUFDeEIsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBUSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLEdBQUc7QUFDNUMsUUFBUSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxvQkFBb0IsR0FBRztBQUN6RCxRQUFRLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTyxHQUFHO0FBQ2pDO0FBQ0EsUUFBUSxNQUFNLENBQUM7QUFDZixNQUFNLENBQUM7QUFDUDtBQUNBLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVE7QUFDM0UsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsT0FBTyxHQUFHO0FBQzVFO0FBQ0EsTUFBTSxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLEdBQUc7QUFDMUMsTUFBTSxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sR0FBRztBQUMvQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0scUJBQXFCLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHO0FBQ2pHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUM1RCxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztBQUMzSixJQUFJLENBQUM7QUFDTCxFQUFFLEVBQUU7QUFDSjtBQUNBLEVBQUUsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLElBQUksTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUNyQixJQUFJLEVBQUU7QUFDTixJQUFJLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2QyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDakYsTUFBTSxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNsQyxJQUFJLEVBQUU7QUFDTixJQUFJLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDL0UsTUFBTSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtBQUNoQyxJQUFJLEVBQUU7QUFDTixJQUFJLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMzQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUc7QUFDdkIsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUM3QixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDM0UsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3BCLElBQUksRUFBRTtBQUNOLElBQUksT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUU7QUFDaEMsSUFBSSxFQUFFO0FBQ04sSUFBSSxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDckMsTUFBTSxNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFO0FBQzVELElBQUksRUFBRTtBQUNOLElBQUksTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRztBQUNyQjtBQUNBLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTztBQUMvRyxNQUFNLEVBQUUsQ0FBQyxhQUFhLElBQUksTUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoRCxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRztBQUNsRixRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQzdELFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxRQUFRLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3hELFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUMvRSxRQUFRLEVBQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLO0FBQzdFLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDOUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3pCLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUN0QyxNQUFNLENBQUM7QUFDUCxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRTtBQUN4QyxJQUFJLENBQUM7QUFDTCxFQUFFLEVBQUU7QUFDSjtBQUNBLEVBQUUsR0FBRyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNsRixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSztBQUM3QyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUNsRSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLEVBQUU7QUFDdkUsSUFBSSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO0FBQ3RILElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQixFQUFFLEVBQUU7QUFDSjtBQUNBLEVBQUUsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNqRixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEdBQUc7QUFDdkUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJO0FBQ3pGLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDN0IsRUFBRSxFQUFFO0FBQ0o7QUFDQSxFQUFFLEdBQUcsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLDZCQUE2QixDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUMxSCxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNwQixJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDbkIsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNoQixRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtBQUMzQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxFQUFFO0FBQy9GLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDM0IsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sRUFBRTtBQUNoRSxNQUFNLENBQUM7QUFDUCxJQUFJLENBQUM7QUFDTCxJQUFJLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRTtBQUN6QixFQUFFLEVBQUU7QUFDSjtBQUNBLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGlCQUFpQixDQUFDO0FBQ2xGO0FBQ0EsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzFELElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQy9CLEVBQUUsRUFBRTtBQUNKO0FBQ0EsRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDaEMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQztBQUN0RixJQUFJLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO0FBQzdELE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEIsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTO0FBQ2pDO0FBQ0EsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsR0FBRztBQUN0RixVQUFVLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJO0FBQ2xJLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLG1CQUFtQixFQUFFO0FBQzlELE1BQU0sQ0FBQztBQUNQO0FBQ0EsTUFBTSxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM3QixRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQzFHLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQzVELE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUNsQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3pDLFVBQVUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRztBQUNsRCxVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDNUQsUUFBUSxDQUFDO0FBQ1QsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUNsQyxVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDNUQsUUFBUSxDQUFDO0FBQ1QsUUFBUSxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQzNFLE1BQU0sQ0FBQztBQUNQLElBQUksRUFBRTtBQUNO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QUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJO0FBQy9DLEVBQUUsRUFBRTtBQUNKO0FBQ0EsRUFBRSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsVUFBVSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsVUFBVSxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssVUFBVSxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLFFBQVEsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLFNBQVMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLFVBQVUsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDO0FBQ3I1QjtBQUNBLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTztBQUNwRixJQUFJLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQztBQUNBLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7QUFDdkI7QUFDQSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJO0FBQ3BCO0FBQ0EsSUFBSSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkI7QUFDQSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO0FBQ3pCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVO0FBQzFCLElBQUksT0FBTyxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO0FBQzlELElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYztBQUMvQixJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVM7QUFDM0IsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUMvQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRO0FBQzdFLElBQUksRUFBRSxDQUFDLE9BQU8sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUN6RixJQUFJLEVBQUUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUM5RixJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTTtBQUN4QyxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTO0FBQzVDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0SixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSTtBQUNoQixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSTtBQUNsQixJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0RSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVTtBQUNyQixJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqRCxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTTtBQUNsQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJO0FBQ3BCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzVCLEVBQUUsRUFBRTtBQUNKLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztBQUN6QztBQUNBLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUk7QUFDakQsRUFBRSxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbkQsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7QUFDckUsSUFBSSxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pCLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQztBQUNmLElBQUksQ0FBQztBQUNMLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUMvQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDO0FBQ3RDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQy9CLEVBQUUsRUFBRTtBQUNKO0FBQ0EsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEMsSUFBSSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDOUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDN0IsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0FBQ3JDLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQ3REO0FBQ0EsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7QUFDM0c7QUFDQSxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHO0FBQ3ZELElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJO0FBQ2pGLElBQUksU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzNDLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHO0FBQ3BIO0FBQ0EsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0I7QUFDQSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbEIsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbkcsSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUQsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN4RTtBQUNBLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDdEQ7QUFDQSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbEIsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU07QUFDdEUsSUFBSSxVQUFVLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElB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QUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHO0FBQzFDLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzVFLElBQUksV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQzFGO0FBQ0EsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQztBQUNoRCxNQUFNLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0FBQ25GO0FBQ0EsTUFBTSxJQUFJLENBQUMsUUFBUSxHQUFHO0FBQ3RCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUU7QUFDOUI7QUFDQSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FB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TUFBTSxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHO0FBQzVHLE1BQU0sQ0FBQztBQUNQO0FBQ0EsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUTtBQUN4RCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDbkc7QUFDQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRztBQUMvSjtBQUNBLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHO0FBQzlKLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxTQUFTLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDaEQsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDO0FBQ2xDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNoQztBQUNBLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixHQUFHO0FBQ2pDLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSTtBQUNsSyxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQztBQUNsQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDaEM7QUFDQSxNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLEdBQUcsSUFBSSxHQUFHLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sR0FBRztBQUN6SCxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsV0FBVyxFQUFFLE1BQU0sR0FBRyxJQUFJLEdBQUcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEdBQUc7QUFDdEYsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLGdCQUFnQixDQUFDLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDN0QsTUFBTSxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3JFO0FBQ0EsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUU7QUFDdEw7QUFDQSxNQUFNLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUU7QUFDeEQsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVE7QUFDOUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQy9EO0FBQ0EsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQ25CO0FBQ0EsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN6QyxNQUFNLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckU7QUFDQSxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQ25FLE1BQU0sRUFBRSxDQUFDLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU87QUFDcEcsTUFBTSxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRztBQUMxRDtBQUNBLE1BQU0sRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxlQUFlO0FBQ3ZILE1BQU0sR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ3hILE1BQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRTtBQUN6RjtBQUNBLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVc7QUFDaEgsTUFBTSxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDcEMsTUFBTSxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMvQztBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSztBQUNuQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU87QUFDdEYsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFDekQsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDO0FBQy9GLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTtBQUNwSTtBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTztBQUNwRixNQUFNLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtBQUNoRTtBQUNBLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQzlFO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRztBQUNqQyxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUztBQUMxSCxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztBQUNyRjtBQUNBLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQzlFLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxHQUFHO0FBQ3BDLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7QUFD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RSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztBQUM1SCxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxDQUFDO0FBQ3ZLO0FBQ0EsTUFBTSxJQUFJLENBQUMsUUFBUSxHQUFHO0FBQ3RCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNuQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTO0FBQ2xDLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQy9CLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixHQUFHO0FBQ2hDO0FBQ0EsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSztBQUM3RCxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUNsRDtBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUM3QixNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLFdBQVcsRUFBRSxNQUFNLEdB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QUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUk7QUFDNUUsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDN0QsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUMzRCxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN0RCxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQ2pDLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDN0MsSUFBSSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDMUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDL0QsUUFBUSxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSTtBQUNuSTtB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LEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRTtBQUNsRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVk7QUFDdEUsSUFBSSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDMUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDL0QsUUFBUSxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSTtBQUNwSSxRQUFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ3ZDLE1BQU0sQ0FBQztBQUNQLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUU7QUFDL0MsTUFBTSxFQUFFLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNO0FBQ3RELFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNwQixNQUFNLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLFFBQVEsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFO0FBQ3ZCLFVBQVUsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN0QixRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRTtBQUN4QixVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDeEIsVUFBVSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3ZDLE1BQU0sQ0FBQztBQUNQLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNwRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDcEUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFO0FBQzNELElBQUksWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDM0MsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM3QyxVQUFVLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hCO0FBQ0EsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDMUY7QUFDQSxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7QUFDOUIsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQzlCO0FBQ0EsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSztBQUMxRSxNQUFNLElBQUksQ0FBQyxrQkFBa0IsR0FBRztBQUNoQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztBQUNuRDtBQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRztBQUNuQztBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQzdFLE1BQU0sSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEdBQUc7QUFDaEM7QUFDQSxNQUFNLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENB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RyxDQUFDLEtBQUssQ0FBQztBQUMxQyxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNyRCxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztBQUM5RSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0FBQy9FLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7QUFDNUIsSUFBSSxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDeEMsTUFBTSxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDL0QsUUFBUSxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsSUFBSTtBQUNuSTtBQUNBLFFBQVEsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDakQ7QUFDQSxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUU7QUFDbkMsUUFBUSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFO0FBQ25DO0FBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNqRCxNQUFNLENBQUM7QUFDUCxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO0FBQzVDLE1BQU0sRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDM0MsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3BCLE1BQU0sTUFBTSxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUk7QUFDM0QsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFDckQsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ3BFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUU7QUFDL0QsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztBQUNyRixJQUFJLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3JDLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3pCO0FBQ0EsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDM0Y7QUFDQSxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ3RDLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7QUFDcEUsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FB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QUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU87QUFDdEUsUUFBUSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtBQUM1RztBQUNBLFFBQVEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO0FBQzFDLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO0FBQzdELE1BQU0sQ0FBQztBQUNQO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2xCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVO0FBQzFCLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEcsUUFBUSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDdEMsUUFBUSxLQUFLLENBQUM7QUFDZCxNQUFNLENBQUM7QUFDUCxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO0FBQzFDLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQztBQUNsQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzVDLElBQUksZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUM3RSxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxRQUFRLEVBQUU7QUFDbkYsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUztBQUNsQjtBQUNBLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDckIsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDbkQsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7QUFDbkQsTUFBTSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQzNCLE1BQU0sR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQ2pDO0FBQ0EsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVc7QUFDcEYsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO0FBQzVHLFFBQVEsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRztBQUM5QyxRQUFRLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRTtBQUMxRSxNQUFNLENBQUM7QUFDUDtBQUNBLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQ3JDLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztBQUNqRDtBQUNBLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVc7QUFDaEQsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUNuRztBQUNBLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVc7QUFDaEQsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHO0FBQzFDLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztBQUNyQixJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUztBQUM1RCxJQUFJLHFCQUFxQixDQUFDLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztBQUM3RCxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUTtBQUN2QixNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUN0STtBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPO0FBQ3RCLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLE9BQU8sR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUMzSTtBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUs7QUFDZCxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQ3JOO0FBQ0EsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUc7QUFDbEIsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUN2STtBQUNBLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ3BCLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUU7QUFDekk7QUFDQSxNQUFNLEVBQUUsQ0FBQyxNQUFNO0FBQ2YsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUM5TztBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTO0FBQ3hCLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUU7QUFDeko7QUFDQSxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUztBQUMxQixRQUFRLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQzNKO0FBQ0EsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDcEIsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUc7QUFDNUM7QUFDQSxNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNuRDtBQUNBLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUztBQUN6SSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHO0FBQzNDLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUN4RSxRQUFRLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUU7QUFDN0IsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUs7QUFDOUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNyRCxVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUNuRSxRQUFRLENBQUM7QUFDVCxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbEIsSUFBSSxFQUFFO0FBQ047QUFDQSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ3JCLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLO0FBQzFFLElBQUksV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDekMsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQy9FO0FBQ0EsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQztBQUNwRSxJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDckIsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUs7QUFDbkMsSUFBSSxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2hELElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUk7QUFDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUs7QUFDcEMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDeEUsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7QUFDcEUsSUFBSSxpQkFBaUIsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQzFELE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxJQUFJO0FBQ3JLO0FBQ0EsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRztBQUN0RjtBQUNBLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRTtBQUN6SztBQUNBLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNuQixJQUFJLEVBQUU7QUFDTjtBQUNBLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7QUFDckIsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7QUFDL0QsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzVELElBQUksc0JBQXNCLENBQUMsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO0FBQy9ELE1BQU0sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDNUU7QUFDQSxNQUFNLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsR0FBRztBQUNsQyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDckI7QUFDQSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsVUFBVTtBQUMxQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDO0FBQzdDLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7QUFDOUQsUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRztBQUMzQyxNQUFNLENBQUM7QUFDUCxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSTtBQUNuQyxNQUFNLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFFBQVEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQztBQUM3QyxNQUFNLEdBQUc7QUFDVDtBQUNBLE1BQU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDO0FBQ2hDLElBQUksQ0FBQztBQUNMO0FBQ0EsRUFBRSxFQUFFO0FBQ0o7QUFDQSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQztBQUNuQztBQUNBLEVBQUUsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7QUFDcEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixFQUFFO0FBQzVDLEVBQUUsRUFBRTtBQUNKO0FBQ0EsRUFBRSxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9CLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLO0FBQ3BELElBQUksVUFBVSxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQy9DLE1BQU0sSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO0FBQ3BDO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2xCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLGtCQUFrQixHQUFHO0FBQzlDLElBQUksa0JBQWtCLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELE1BQU0sR0FBRyxDQUFDLGdCQUFnQixDQUFDO0FBQzNCO0FBQ0EsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQzVCO0FBQ0EsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUztBQUMxQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDdkMsUUFBUSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLEdBQUc7QUFDbkQ7QUFDQSxRQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDcEIsTUFBTSxDQUFDO0FBQ1A7QUFDQSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLO0FBQ3BFLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkQ7QUFDQSxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTztBQUNoRixRQUFRLEVBQUUsQ0FBQyxLQUFLLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2RCxVQUFVLElBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUN0QyxVQUFVLFFBQVEsQ0FBQztBQUNuQixRQUFRLENBQUM7QUFDVDtBQUNBLFFBQVEsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxvQkFBb0IsR0FBRyxrQkFBa0IsR0FBRyxXQUFXLENBQUM7QUFDM0c7QUFDQSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFO0FBQzVNLE1BQU0sQ0FBQztBQUNQO0FBQ0EsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2xCLElBQUksRUFBRTtBQUNOO0FBQ0EsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsR0FBRztBQUNwQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUN4QyxNQUFNLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQ2xLO0FBQ0EsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJO0FBQ3pCLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLEdBQUcsT0FBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQzNHO0FBQ0EsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJO0FBQzVCLE1BQU0sRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO0FBQ3JELFFBQVEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsRUFB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Q0FBQyxRQUFRLENBQUM7QUFDbkIsTUFBTSxHQUFHLENBQUMsdUJBQXVCLENBQUM7QUFDbEM7QUFDQSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUk7QUFDN0IsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVTtBQUMvRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsR0FBRztBQUMvUztBQUNBLE1BQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUs7QUFDdEMsTUFBTSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxFQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDaEcsUUFBUSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDckUsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxvQkFBb0IsR0FBRztBQUNqRDtBQUNBLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN2RyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzFDLFVBQVUscUJBQXFCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtBQUM3SyxVQUFVLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDdEIsUUFBUSxDQUFDO0FBQ1Q7QUFDQSxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUs7QUFDN0IsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsSUFBSTtBQUMxRjtBQUNBLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSTtBQUN4RixNQUFNLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4QyxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbEUsVUFBVSxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDdEosUUFBUSxHQUFHO0FBQ1gsTUFBTSxDQUFDO0FBQ1A7QUFDQSxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FB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QyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ25KLEVBQUUsRUFBRTtBQUNKO0FBQ0EsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTztBQUMzRSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUMvQixJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTO0FBQy9CLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUNyQyxNQUFNLEVBQUUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUM1RCxRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQzNCLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTtBQUNyQyxNQUFNLEVBQUU7QUFDUixJQUFJLENBQUM7QUFDTCxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUM7QUFDckMsRUFBRSxDQUFDO0FBQ0g7QUFDQSxFQUFFLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHO0FBQy9CLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMxRCxFQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7QUFDdkYsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ2hCLEVBQUUsQ0FBQztBQUNIO0FBQ0EsRUFBRSxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUNwRCxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3hDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUNoQixJQUFJLFVBQVUsR0FBRztBQUNqQixJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDakYsTUFBTSxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDN0IsTUFBTSxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDOUIsSUFBSSxDQUFDO0FBQ0w7QUFDQSxJQUFJLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLFVBQVUsR0FBRztBQUM1RTtBQUNBLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEdBQUc7QUFDakUsRUFBRSxFQUFFO0FBQ0o7QUFDQSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzlDLElBQUksVUFBVSxHQUFHO0FBQ2pCLElBQUksRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRztBQUNsSTtBQUNBLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsVUFBVSxHQUFHO0FBQ2xHO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHO0FBQzVDLEVBQUUsRUFB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QUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRztBQUNuRCxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHO0FBQy9DLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUc7QUFDckQsTUFBTSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRztBQUN2RCxNQUFNLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRztBQUM3QyxNQUFNLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRTtBQUNwRCxJQUFJLEVBQUU7QUFDTixJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUc7QUFDaEQsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsR0FBRztBQUN4QyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEdBQUc7QUFDL0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQzdELElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRztBQUMzRCxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUc7QUFDckQsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRztBQUNoRixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHO0FBQ2hGLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHO0FBQzVGLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRztBQUNyRCxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUc7QUFDckQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHO0FBQ3hELElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTtBQUM3QyxFQUFFLEdBQUc7QUFDTDtBQUNBLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxFQUFFLEdBQUc7QUFDMUI7QUFDQSxFQUFFLEdBQUc7QUFDTCxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTTtBQUN6RCxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVTtBQUM1QyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN4RCxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHO0FBQ2pCLEdB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QUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRztBQUN4RCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUc7QUFDdEQsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHO0FBQ3RELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHO0FBQ3BELElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFO0FBQ3ZELEVBQUUsRUFBRTtBQUNKLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRztBQUNwRCxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHO0FBQzNDLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRztBQUN2RCxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHO0FBQzVELEVBQUUsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdB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WUFBWSxDQUFDO0FBQ2IsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRO0FBQ3BDLFlBQVkscUJBQXFCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFO0FBQ2xELFFBQVEsQ0FBQztBQUNULFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzlLLFFBQVEsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNqTixRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNO0FBQ3JDLFFBQVEsR0FBRyxDQUFDLFFBQVEsQ0FB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LEFBQUUsQUFBQyxBQUNqRSxBQUFDLEFBQUMsQUFBRSxBQUFFLEFBQUcsQUFBQyxBQUFHLEFBQUUsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBTyxBQUFDLEFBQU0sQUFBQyxBQUFNLEFBQUMsQUFBQyxBQUFJLEFBQUUsQUFBQyxBQUNqRSxBQUFDLEFBQUMsQUFBUSxBQUFDLEFBQUksQUFBQyxBQUFLLEFBQUMsQUFBSyxBQUFDLEFBQU8sQUFBQyxBQUNwQyxBQUFFLEFBQUMsQUFBRSxBQUFFLEFBQUcsQUFBQyxBQUFHLEFBQUUsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBTyxBQUFDLEFBQU0sQUFBQyxBQUFNLEFBQUMsQUFBSSxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUksQUFBRSxBQUFDLEFBQy9FLEFBQUUsQUFBQyxBQUFFLEFBQUUsQUFBRyxBQUFDLEFBQUcsQUFBRSxBQUFJLEFBQUcsQUFBUyxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBTSxBQUFDLEFBQU0sQUFBQyxBQUFJLEFBQUMsQUFBTyxBQUFDLEFBQUMsQUFBSSxBQUFFLEFBQUMsQUFDL0UsQUFBQyxBQUFFLEFBQVEsQUFBQyxBQUNaLEFBQUUsQUFBRSxBQUFDLEFBQ0wsQUFBRyxBQUNILEFBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdkNBLEFBQUcsSUFBQyxBQUFZLEFBQUMsQUFBQztBQUNqQixBQUFLLEFBQUMsUUFBQyxBQUFJLEFBQUMsQUFDYixBQUNBOztBQUFDLEFBQUksQUFBQyxPQUFDLEFBQVEsQUFBQyxBQUFFLGdCQUFDLEFBQUMsQUFDcEI7QUFBRSxBQUFZLGVBQUMsQUFBRyxJQUFDLEFBQVksYUFBQyxBQUFLLEFBQUUsQUFDdkMsQUFDQTs7QUFBRSxBQUFFLEFBQUMsT0FBRSxBQUFRLFNBQUMsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFRLFNBQUUsQUFBTyxBQUFDLEFBQUssQUFBRyxrQkFBQyxBQUFDLEFBQzNEO0FBQUcsQUFBUSxZQUFDLEFBQUksS0FBQyxBQUFTLFVBQUMsQUFB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QyxBQUFHLEFBQUMsQUFBSSxBQUFDLEFBQVEsQUFBQyxBQUFNLEFBQUMsQUFBSyxBQUFFLEFBQUksQUFBRSxBQUN6QyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRSxBQUFhLEFBQUUsQUFBSyxBQUFDLEFBQUssQUFBQyxBQUFLLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFDLEFBQVcsQUFBQyxBQUFXLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBTSxBQUFDLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBYyxBQUFDLEFBQUssQUFBQyxBQUFJLEFBQUMsQUFBUyxBQUFDLEFBQVksQUFBQyxBQUFTLEFBQUMsQUFBQyxBQUFVLEFBQUMsQUFBRSxBQUFDLEFBQUMsQUFBUSxBQUFDLEFBQU0sQUFBQyxBQUFLLEFBQUMsQUFBUyxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBTyxBQUFDLEFBQUksQUFBQyxBQUFDLEFBQUksQUFBQyxBQUFPLEFBQUcsQUFBRyxBQUFDLEFBQzNRLEFBQUUsQUFBRSxBQUFHLEFBQUMsQUFDUixBQUFDLEFBQUUsQUFBRyxBQUFDLEFBQ1AsQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBTSxBQUFDLEFBQUMsQUFBRSxBQUN2QixBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFRLEFBQUMsQUFBTSxBQUFDLEFBQUssQUFBRSxBQUFJLEFBQUUsQUFDekMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBYSxBQUFFLEFBQUssQUFBQyxBQUFLLEFBQUcsQUFBRyxBQUFDLEFBQ2hELEFBQUUsQUFBRSxBQUFHLEFBQUMsQUFDUixBQUFDLEFBQUUsQUFBRyxBQUFDLEFBQ1AsQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBTSxBQUFDLEFBQUMsQUFBRSxBQUN2QixBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFRLEFBQUMsQUFBTSxBQUFDLEFBQUssQUFBRSxBQUFJLEFBQUUsQUFDekMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBYSxBQUFFLEFBQUssQUFBQyxBQUFLLEFBQUcsQUFBRyxBQUFDLEFBQ2hELEFBQUUsQUFBRSxBQUFHLEFBQUMsQUFDUixBQUFDLEFBQUUsQUFBRyxBQUFDLEFBQ1AsQUFBRSxBQUFHLEFBQUMsQUFDTixBQUFHLEFBQ0gsQUFDQSxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFHLEFBQUMsQUFBQyxBQUFDLEFBQUssQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFDLEFBQUssQUFBQyxBQUFHLEFBQUMsQUFBUyxBQUFDLEFBQUcsQUFBQyxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFDLEFBQUksQUFBQyxBQUFJLEFBQUMsQUFDbEYsQUFDQSxBQUFHLEFBQVksQUFDZixBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBSSxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQVEsQUFBRSxBQUFTLEFBQUUsQUFDNUMsQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBTSxBQUFDLEFBQUMsQUFBRSxBQUN2QixBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFRLEFBQUMsQUFBTSxBQUFDLEFBQUssQUFBRSxBQUFJLEFBQUUsQUFDekMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBYSxBQUFFLEFBQUssQUFBQyxBQUFLLEFBQUMsQUFBSyxBQUFDLEFBQUcsQUFBQyxBQUFJLEFBQUMsQUFBQyxBQUFXLEFBQUMsQUFBVyxBQUFDLEFBQUksQUFBQyxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQU0sQUFBQyxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQWMsQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFDLEFBQVMsQUFBQyxBQUFZLEFBQUMsQUFBUyxBQUFDLEFBQUMsQUFBVSxBQUFDLEFBQUUsQUFBQyxBQUFDLEFBQVEsQUFBQyxBQUFNLEFBQUMsQUFBSyxBQUFDLEFBQVMsQUFBQyxBQUFLLEFBQUMsQUFBQyxB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QUFNLE9BQUMsQUFBSSxLQUFDLEFBQVksQUFBRyxBQUM5QztBQUFFLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBVSxBQUFDLEFBQUMsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFDLEFBQUksQUFBQyxBQUFXLEFBQUcsQUFBRyxBQUFDLEFBQU0sQUFBQyxBQUFJLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFPLEFBQUMsQUFBRyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQU0sQUFBQyxBQUFJLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFDLEFBQUUsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFNLEFBQUMsQUFBSSxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFDLEFBQUksQUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUFHLEFBQ25MLEFBQ0EsQUFDQTs7O0FBQUUsQUFBRyxNQUFDLEFBQVUsV0FBQyxBQUFVLFdBQUMsQUFBTyxRQUFDLEFBQVEsQUFBQyxVQUFDLEFBQUksQUFBQyxNQUFDLEFBQUssQUFBQyxPQUFDLEFBQUssQUFBQyxPQUFDLEFBQUMsQUFDbkU7QUFBRyxBQUFHLE9BQUMsQUFBTSxBQUFDLEFBQUMsU0FBQyxBQUFHLElBQUMsQUFBTSxPQUFDLEFBQUksS0FBQyxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQUcsQUFBQyxLQUFDLEFBQUksS0FBQyxBQUFHLEFBQUUsQUFDM0QsQUFDQTs7QUFBRyxBQUFNLFVBQUMsQUFBTSxPQUFDLEFBQU0sQUFBRSxBQUN6QixBQUNBOztBQUFHLEFBQUUsQUFBQyxBQUFRLEFBQUMsQUFBQyxBQUFDLEFBQU0sQUFBQyxBQUFHLEFBQUMsQUFBTyxBQUFDLEFBQUUsQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFDakQ7QUFBRyxBQUFHLE9BQUMsQUFBTSxBQUFDLEFBQUMsYUFBSyxBQUFNLE9BQUMsQUFBSSxLQUFDLEFBQU07QUFDbEMsQUFBUSxBQUFDLGNBQUMs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TUFBRyxBQUFhLEFBQUMsQUFBQztBQUFDLEFBQVEsQUFBQyxBQUFFLFVBQUMsQUFBUSxTQUFDLEFBQU8sQUFBQyxBQUFDLFVBQUMsQUFBUyxVQUFDLEFBQU8sQUFBQyxBQUFHLFlBQUMsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUMsWUFBQyxBQUFHLEFBQzlGLEFBQ0E7OztBQUFFLEFBQUUsQUFBQyxBQUFLLEFBQUMsQUFBRSxBQUFDLEFBQU8sQUFBQyxBQUFLLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBTyxBQUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFRLEFBQUMsQUFDN0U7QUFBRSxBQUFLLFFBQUMsQUFBTyxRQUFDLEFBQWEsQUFBRSxBQUMvQixBQUFDO0FBQUMsQUFDRixBQUFFLEFBQ0Y7QUFyQ3FCLEFBQUMsQUFDdEI7O0FBcUNBLEFBQUUsQUFBRyxBQUNMLEFBQUcsQUFDSCxBQUFLLEFBQUMsQUFBQyxBQUFLLEFBQUMsQUFBUyxBQUN0QixBQUFJLEFBQUMsQUFBQyxBQUFlLEFBQ3JCLEFBQVEsQUFBQyxBQUFDLEFBQVUsQUFDcEIsQUFBRyxBQUNILEFBQ0EsQUFBRyxBQUFZLEFBQ2YsQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFFLEFBQVEsQUFBQyxBQUFDLEFBQUksQUFBRSxBQUFRLEFBQUMsQUFBQyxBQUFFLEFBQUUsQUFBUSxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQUssQUFBQyxBQUFTLEFBQUUsQUFBUyxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUcsQUFBSyxBQUFDLEFBQUcsQUFBRSxBQUFRLEFBQUUsQUFBSyxBQUFDLEFBQUcsQUFBRSxBQUFLLEFBQUMsQUFDdkksQUFBQyxBQUFFLEFBQUMsQUFBSyxBQUFFLEFBQVcsQUFBQyxBQUFJLEFBQUMsQUFBSSxBQUFDLEFBQVEsQUFBRSxBQUMzQyxBQUFDLEFBQUMsQUFBRSxBQUFFLEFBQUssQUFBQyxBQUFJLEFBQUUsQUFBUSxBQUFDLEFBQUMs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QyxBQUNuSTtBQUFLLEFBQUcsU0FBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQUUsR0FBQyxBQUFTLFVBQUMsQUFBTSxPQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVMsQUFBRSxBQUM1RSxBQUFJO0FBQUMsQUFDTDtBQUFJLEFBQUUsQUFBQyxTQUFFLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVksY0FBRSxBQUMzQztBQUFLLEFBQUcsU0FBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQUUsR0FBQyxBQUFTLFVBQUMsQUFBTSxPQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVMsQUFBRSxBQUM1RSxBQUFJO0FBQUMsQUFDTCxBQUFHO0FBQUMsQUFBQyxBQUFJLFVBQUMsQUFBQyxBQUNYO0FBQUksQUFBRSxBQUFDLFFBQUMsQUFBRyxJQUFDLEFBQU0sT0FBQyxBQUFRLFNBQUMsQUFBWSxBQUFDLEFBQUUsZ0JBQUMsQUFBVSxBQUFDLEFBQUUsQUFBQyxjQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQWUsa0JBQUMsQUFBRyxJQUFDLEFBQU0sT0FBQyxBQUFRLFNBQUMsQUFBWSxBQUFFLGNBQUMsQUFBQyxBQUNuSTtBQUFLLEFBQUcsU0FBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQUUsR0FBQyxBQUFTLFVBQUMsQUFBRyxJQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVMsQUFBRSxBQUN6RSxBQUFJO0FBQUMsQUFDTDtBQUFJLEFBQUUsQUFBQyxTQUFFLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVksY0FBRSxBQUMzQztBQUFLLEFBQUcsU0FBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQUUsR0FBQyxBQUFTLFVBQUMsQUFBRyxJQUFDLEFBQUcsSUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVMsQUFBRSxBQUN6RSxBQUFJO0FBQUMsQUFDTCxBQUFHO0FBQUMsQUFDSixBQUNBOztBQUFHLEFB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TSxBQUFHLEFBQ3RILEFBQ0EsQUFBVyxBQUFDLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFPLEFBQUMsQUFBTyxBQUFDLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFDLEFBQUMsQUFBVyxBQUFDLEFBQUMsQUFBVSxBQUFDLEFBQUcsQUFBRSxBQUFLLEFBQUcsQUFBUyxBQUFDLEFBQU0sQUFBQyxBQUFFLEFBQUMsQUFBVyxBQUFFLEFBQUcsQUFBQyxBQUFDLEFBQVMsQUFBQyxBQUMvSSxBQUNBLEFBQUUsQUFDRixBQUNBOzs7Ozs7Ozs7Ozs7O0FBQ0EsQUFBRSxBQUFHLEFBQ0wsQUFBRyxBQUNILEFBQUssQUFBQyxBQUFDLEFBQUssQUFBQyxBQUFVLEFBQ3ZCLEFBQUksQUFBQyxBQUFDLEFBQWdCLEFBQ3RCLEFBQVEsQUFBQyxBQUFDLEFBQVUsQUFBQyxBQUFNLEFBQzNCLEFBQUcsQUFDSCxBQUFLLEFBQUMsQUFBUSxBQUFDLEFBQUksQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQU8sQUFBQyxBQUFNLEFBQUMsQUFBSyxBQUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFJLEFBQUMsQUFBTSxBQUFDLEFBQzdGLEFBQ0EsQUFBRSxBQUFDLEFBQVMsQUFBQyxBQUFLLEFBQ2xCLEFBQUksQUFBQyxBQUFLLEFBQUMsQUFBRyxBQUFDLEFBQU8sQUFBQyxBQUFHLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBRyxBQUFDLEFBQU8sQUFBQyxBQUFPLEFBQUMsQUFBSyxBQUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFPLEFBQUMsQUFBUSxBQUFDLEFBQzNILEFBQ0EsQUFBRyxBQUFZLEFBQ2YsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFFLEFBQUksQUFBRyxBQUFTLEFBQUMsQUFBRSxBQUFDLEFBQU8sQUFBQyxBQUFJLEFBQUMsQUFDOUMsQUFBRyxBQUFJLEFBQUcsQUFBUyxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBSSxBQUFDLEFBQ3BDLEFBQUcsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBUSxBQUFDLEFBQUssQUFBQyxBQUN0QyxBQUFDLEFBQUcsQUFBRSxBQUFVLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBRSxBQUMxQixBQUFHLEFBQ0gsQUFDQSxBQUFFLEFBQUMsQUFBTSxBQUFDLEFBQU8sQUFDakIsQUFBUSxBQUFDLEFBQUksQUFBQyxBQUFDLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFDLEFBQUMsQUFBUyxBQUFDLEFBQUksQUFBQyxBQUFFLEFBQUMsQUFBTSxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFDLEFBQUcsQUFBQyxBQUNoRyxBQUNBLEFBQUcsQUFBWSxBQUNmLEFBQUMsQUFBRyxBQUNKLEFBQUMsQUFBTSxBQUFFLEFBQUksQUFBRyxBQUFTLEFBQUMsQUFBRSxBQUFDLEFBQU8sQUFBQyxBQUFFLEFBQUMsQUFDeEMsQUFBRyxBQUFJLEFBQUcsQUFBUyxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBRSxBQUFDLEFBQ2xDLEFBQUcsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBTyxBQUFDLEFBQUUsQUFBQyxBQUNsQyxBQUFDLEFBQUcsQUFBRSxBQUFVLEFBQUMsQUFBSyxBQUFDLEFBQ3ZCLEFBQUMsQUFBSyxBQUFFLEFBQUcsQUFBQyxBQUFDLEFBQUUsQUFDZixBQUFHLEFBQ0gsQUFDQSxBQUNBLEFBQUUsQUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsQUFBRSxBQUFHLEFBQ0wsQUFBRyxBQUNILEFBQUssQUFBQyxBQUFDLEFBQVEsQUFBQyxBQUFLLEFBQ3JCLEFBQUksQUFBQyxBQUFDLEFBQWMsQUFDcEIsQUFBUSxBQUFDLEFBQUMsQUFBVSxBQUFDLEFBQU0sQUFDM0IsQUFBRyxBQUNILEFBQ0EsQUFBRSxBQUFDLEFBQVMsQUFBQyxBQUFLLEFBQ2xCLEFBQUksQUFBQyxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUcsQUFBQyxBQUFPLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFTLEFBQUMsQUFBVSxBQUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBTyxBQUFDLEFBQUksQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQU0sQUFBQyxBQUN2SCxBQUNBLEFBQUcsQUFBWSxBQUNmLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRyxBQUFHLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFBSyxBQUFDLEFBQ3BDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQzFCLEFBQUcsQUFBSSxBQUFDLEFBQ1IsQUFBQyxBQUFNLEFBQUUsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBTyxBQUFDLEFBQUksQUFBQyxBQUMxQyxBQUFHLEFBQUksQUFBRyxBQUFTLEFBQUMsQUFBRSxBQUFDLEFBQU8sQUFBQyxBQUFJLEFBQUMsQUFDcEMsQUFBRyxBQUFJLEFBQUcsQUFBUyxBQUFDLEFBQUUsQUFBQyxBQUFRLEFBQUMsQUFBSyxBQUFDLEFBQ3RDLEFBQUMsQUFBRyxBQUFFLEFBQVUsQUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFFLEFBQzFCLEFBQUcsQUFDSCxBQUNBLEFBQUUsQUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLEFBQUUsQUFBRyxBQUNMLEFBQUcsQUFDSCxBQUFLLEFBQUMsQUFBQyxBQUFHLEFBQUMsQUFBUyxBQUNwQixBQUFJLEFBQUMsQUFBQyxBQUFhLEFBQ25CLEFBQVEsQUFBQyxBQUFDLEFBQVUsQUFBQyxBQUFNLEFBQzNCLEFBQUcsQUFDSCxBQUFJLEFBQUMsQUFBRSxBQUFDLEFBQUksQUFBQyxBQUFJLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFFLEFBQUMsQUFBUyxBQUFDLEFBQUcsQUFBQyxBQUFFLEFBQUMsQUFBSyxBQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUMsQUFBTyxBQUFDLEFBQUssQUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFJLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFDLEFBQU8sQUFBQyxBQUFNLEFBQUMsQUFBSSxBQUFDLEFBQVMsQUFBQyxBQUFNLEFBQUMsQUFBRyxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUksQUFBQyxBQUFJLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBRyxBQUFDLEFBQVMsQUFBRSxBQUFLLEFBQUcsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFHLEFBQUMsQUFBUSxBQUFDLEFBQU0sQUFBQyxBQUFVLEFBQUMsQUFBTSxBQUFFLEFBQUcsQUFBQyxBQUFTLEFBQUUsQUFDbFEsQUFDQSxBQUFHLEFBQVksQUFDZixBQUFDLEFBQU8sQUFBQyxBQUNULEFBQUMsQUFBQyxBQUFNLEFBQUMsQUFBTSxBQUFFLEFBQUksQUFBRyxBQUFTLEFBQUMsQUFBRSxBQUFDLEFBQVEsQUFBQyxBQUFDLEFBQUssQUFBRyxBQUFHLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBTSxBQUFFLEFBQUMsQUFBRSxBQUM3RSxBQUFDLEFBQUMsQUFBTSxBQUFDLEFBQU0sQUFBRSxBQUFJLEFBQUcsQUFBUyxBQUFDLEFBQUUsQUFBQyxBQUFPLEFBQUMsQUFBQyxBQUFLLEFBQUcsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQUssQUFBRSxBQUFDLEFBQUUsQUFDM0UsQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFNLEFBQUUsQUFBSSxBQUFHLEFBQVMsQUFBQyxBQUFFLEFBQUMsQUFBTyxBQUFDLEFBQUMsQUFBRyxBQUFHLEFBQUMsQUFBRSxBQUNwRCxBQUFFLEFBQU8sQUFBQyxBQUNWLEFBQUcsQUFDSCxBQUNBLEFBQUUsQUFDRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsQUFBRSxBQUFHLEFBQ0wsQUFBRyxBQUNILEFBQUssQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFVLEFBQUMsQUFBSyxBQUMzQixBQUFJLEFBQUMsQUFBQyxBQUFvQixBQUMxQixBQUFRLEFBQUMsQUFBQyxBQUFVLEFBQUMsQUFBTSxBQUMzQixBQUFHLEFBQ0gsQUFBVSxBQUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFHLEFBQUMsQUFBSSxBQUFDLEFBQVUsQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQVMsQUFBQyxBQUFDLEFBQUUsQUFBQyxBQUFLLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFPLEFBQUMsQUFBTSxBQUFDLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBSSxBQUFDLEFBQUUsQUFBQyxBQUFFLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBUyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBRSxBQUFDLEFBQUssQUFBQyxBQUFDLEFBQUksQUFBQyxBQUFNLEFBQUMsQUFBQyxBQUFFLEFBQUMsQUFBQyxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUksQUFBQyxBQUFLLEFBQUUsQUFDeE4sQUFDQSxBQUFHLEFBQWtCLEFBQ3JCLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRSxBQUFZLEFBQUMsQUFBWSxBQUFFLEFBQUssQUFBRSxBQUM5QyxBQUFDLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRSxBQUFrQixBQUFFLEFBQUcsQUFBQyxBQUFNLEFBQUMsQUFBSyxBQUFDLEFBQUUsQUFBQyxBQUFLLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFJLEFBQUMsQUFBSSxBQUFDLEFBQU8sQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBRyxBQUFDLEFBQVEsQUFBQyxBQUFNLEFBQUMsQUFBTSxBQUFDLEFBQUUsQUFBQyxBQUFFLEFBQUMsQUFBSSxBQUFDLEFBQUksQUFBRyxBQUFHLEFBQUMsQUFDaEosQUFBRSxBQUFHLEFBQUMsQUFDTixBQUFHLEFBQ0gsQUFDQSxBQUFHLEFBQVksQUFDZixBQUFDLEFBQUcsQUFBQyxBQUFLLEFBQUUsQUFBTSxBQUFDLEFBQUMsQUFBSSxBQUFDLEFBQVUsQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQzNDLEFBQUMsQUFBQyxBQUFPLEFBQUMsQUFBSyxBQUFFLEFBQU8sQUFBQyxBQUFJLEFBQUUsQUFDL0IsQUFBRSxBQUFDLEFBQU0sQUFBQyxBQUFNLEFBQUUsQUFBVSxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBSSxBQUFDLEFBQUcsQUFBQyxBQUFDLEFBQUssQUFBRyxBQUFHLEFBQUMsQUFBSyxBQUFDLEFBQUMsQUFBSyxBQUFFLEFBQUMsQUFBRSxBQUMzRSxBQUFFLEFBQUMsQUFBTSxBQUFDLEFBQU0sQUFBRSxBQUFVLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUMsQUFBSyxBQUFHLEFBQUcsQUFBQyxBQUFLLEFBQUMsQUFBQyxBQUFLLEFBQUUsQUFBQyxBQUFFLEFBQzFFLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBTSxBQUFFLEFBQVUsQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBQyxBQUFFLEFBQzVDLEFBQUMsQUFBRSxBQUFPLEFBQUMsQUFDWCxBQUFFLEFBQUcsQUFBQyxBQUNOLEFBQUcsQUFDSCxBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdElBLEFBQUcsSUFBQyxBQUFTLEFBQUMsQUFBQztBQUNkLEFBQVEsQUFBQztBQUNSLEFBQUMsQUFBRSxBQUFDLE9BQUMsRUFBSSxBQUFJLEFBQUMsQUFBUyxBQUFJLEFBQzdCO0FBQUUsQUFBWSxBQUFDLGdCQUFDLEFB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QUFDLEFBQUssQUFBQyxBQUFFLEFBQUMsQUFBRSxBQUFNLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUcsQUFDaEQsQUFBQyxBQUFDLEFBQUMsQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFDLEFBQUksQUFBQyxBQUFNLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFNLEFBQUMsQUFBRSxBQUFDLEFBQUssQUFBQyxBQUFLLEFBQUMsQUFBSSxBQUFDLEFBQUssQUFBQyxBQUFRLEFBQUMsQUFBRSxBQUFDLEFBQUUsQUFBQyxBQUFFLEFBQUMsQUFDckYsQUFBQyxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFHLEFBQUMsQUFBRSxBQUFDLEFBQVMsQUFBQyxBQUFJLEFBQUMsQUFBRSxBQUFDLEFBQUksQUFBQyxBQUFJLEFBQUMsQUFBUSxBQUFDLEFBQUMsQUFBRyxBQUFDLEFBQU8sQUFBQyxBQUFLLEFBQUMsQUFDbkYsQUFDQSxBQUFHLEFBQWtCLEFBQ3JCLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRSxBQUFZLEFBQUMsQUFBWSxBQUFFLEFBQUssQUFBRSxBQUM5QyxBQUFDLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBRSxBQUFrQixBQUFFLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUssQUFBQyxBQUFPLEFBQUMsQUFBRSxBQUFDLEFBQUcsQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQU0sQUFBQyxBQUFJLEFBQUMsQUFBRSxBQUFDLEFBQU0sQUFBQyxBQUFFLEFBQUMsQUFBRyxBQUFDLEFBQUksQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUUsQUFBQyxBQUFHLEFBQUMsQUFBRyxBQUFDLEFBQUcsQUFBQyxBQUFJLEFBQUMsQUFBVSxBQUFDLEFBQUUsQUFBQyxBQUFJLEFBQUMsQUFBUSxBQUFHLEFBQUcsQUFBQyxBQUMxSyxBQUFFLEFBQUcsQUFBQyxBQUNOLEFBQUcsQUFDSCxBQUNBLEFBQUcsQUFBa0IsQUFDckIsQUFBQyxB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RSxBQUNwRDtBQUFFLEFBQUcsTUFBQyxBQUFZLGFBQUMsQUFBSSxLQUFDLEFBQVMsQUFBRSxBQUNuQztBQUFFLEFBQUcsTUFBQyxBQUFNLE9BQUMsQUFBTSxPQUFDLEFBQVMsQUFBRSxBQUMvQjtBQUFFLEFBQUcsTUFBQyxBQUFNLE9BQUMsQUFBUSxTQUFDLEFBQVMsQUFBRSxBQUNqQztBQUFFLEFBQUcsTUFBQyxBQUFnQixpQkFBQyxBQUFrQixBQUFHLEFBQzVDLEFBQ0E7O0FBQUUsQUFBRyxNQUFDLEFBQVEsU0FBRSxBQUFJLE1BQUMsQUFBVyxZQUFFLEFBQU8sQUFBQyxBQUFXLEFBQUcsQUFDeEQsQUFBQztBQUFFLEVBYmMsQUFBVSxFQWF2QixBQUFHLEFBQUUsQUFDVCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyI7KGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdC8qKlxuXHQgKiBAcHJlc2VydmUgRmFzdENsaWNrOiBwb2x5ZmlsbCB0byByZW1vdmUgY2xpY2sgZGVsYXlzIG9uIGJyb3dzZXJzIHdpdGggdG91Y2ggVUlzLlxuXHQgKlxuXHQgKiBAY29kaW5nc3RhbmRhcmQgZnRsYWJzLWpzdjJcblx0ICogQGNvcHlyaWdodCBUaGUgRmluYW5jaWFsIFRpbWVzIExpbWl0ZWQgW0FsbCBSaWdodHMgUmVzZXJ2ZWRdXG5cdCAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlIChzZWUgTElDRU5TRS50eHQpXG5cdCAqL1xuXG5cdC8qanNsaW50IGJyb3dzZXI6dHJ1ZSwgbm9kZTp0cnVlKi9cblx0LypnbG9iYWwgZGVmaW5lLCBFdmVudCwgTm9kZSovXG5cblxuXHQvKipcblx0ICogSW5zdGFudGlhdGUgZmFzdC1jbGlja2luZyBsaXN0ZW5lcnMgb24gdGhlIHNwZWNpZmllZCBsYXllci5cblx0ICpcblx0ICogQGNvbnN0cnVjdG9yXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0c1xuXHQgKi9cblx0ZnVuY3Rpb24gRmFzdENsaWNrKGxheWVyLCBvcHRpb25zKSB7XG5cdFx0dmFyIG9sZE9uQ2xpY2s7XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8qKlxuXHRcdCAqIFdoZXRoZXIgYSBjbGljayBpcyBjdXJyZW50bHkgYmVpbmcgdHJhY2tlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIGJvb2xlYW5cblx0XHQgKi9cblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGltZXN0YW1wIGZvciB3aGVuIGNsaWNrIHRyYWNraW5nIHN0YXJ0ZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBlbGVtZW50IGJlaW5nIHRyYWNrZWQgZm9yIGEgY2xpY2suXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBFdmVudFRhcmdldFxuXHRcdCAqL1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFgtY29vcmRpbmF0ZSBvZiB0b3VjaCBzdGFydCBldmVudC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hTdGFydFggPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBZLWNvb3JkaW5hdGUgb2YgdG91Y2ggc3RhcnQgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoU3RhcnRZID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogSUQgb2YgdGhlIGxhc3QgdG91Y2gsIHJldHJpZXZlZCBmcm9tIFRvdWNoLmlkZW50aWZpZXIuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUb3VjaG1vdmUgYm91bmRhcnksIGJleW9uZCB3aGljaCBhIGNsaWNrIHdpbGwgYmUgY2FuY2VsbGVkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaEJvdW5kYXJ5ID0gb3B0aW9ucy50b3VjaEJvdW5kYXJ5IHx8IDEwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaGUgRmFzdENsaWNrIGxheWVyLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgRWxlbWVudFxuXHRcdCAqL1xuXHRcdHRoaXMubGF5ZXIgPSBsYXllcjtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBtaW5pbXVtIHRpbWUgYmV0d2VlbiB0YXAodG91Y2hzdGFydCBhbmQgdG91Y2hlbmQpIGV2ZW50c1xuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50YXBEZWxheSA9IG9wdGlvbnMudGFwRGVsYXkgfHwgMjAwO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG1heGltdW0gdGltZSBmb3IgYSB0YXBcblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudGFwVGltZW91dCA9IG9wdGlvbnMudGFwVGltZW91dCB8fCA3MDA7XG5cblx0XHRpZiAoRmFzdENsaWNrLm5vdE5lZWRlZChsYXllcikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTb21lIG9sZCB2ZXJzaW9ucyBvZiBBbmRyb2lkIGRvbid0IGhhdmUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcblx0XHRmdW5jdGlvbiBiaW5kKG1ldGhvZCwgY29udGV4dCkge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7IH07XG5cdFx0fVxuXG5cblx0XHR2YXIgbWV0aG9kcyA9IFsnb25Nb3VzZScsICdvbkNsaWNrJywgJ29uVG91Y2hTdGFydCcsICdvblRvdWNoTW92ZScsICdvblRvdWNoRW5kJywgJ29uVG91Y2hDYW5jZWwnXTtcblx0XHR2YXIgY29udGV4dCA9IHRoaXM7XG5cdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBtZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuXHRcdFx0Y29udGV4dFttZXRob2RzW2ldXSA9IGJpbmQoY29udGV4dFttZXRob2RzW2ldXSwgY29udGV4dCk7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHVwIGV2ZW50IGhhbmRsZXJzIGFzIHJlcXVpcmVkXG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHR9XG5cblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljaywgdHJ1ZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9uVG91Y2hDYW5jZWwsIGZhbHNlKTtcblxuXHRcdC8vIEhhY2sgaXMgcmVxdWlyZWQgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBFdmVudCNzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gKGUuZy4gQW5kcm9pZCAyKVxuXHRcdC8vIHdoaWNoIGlzIGhvdyBGYXN0Q2xpY2sgbm9ybWFsbHkgc3RvcHMgY2xpY2sgZXZlbnRzIGJ1YmJsaW5nIHRvIGNhbGxiYWNrcyByZWdpc3RlcmVkIG9uIHRoZSBGYXN0Q2xpY2tcblx0XHQvLyBsYXllciB3aGVuIHRoZXkgYXJlIGNhbmNlbGxlZC5cblx0XHRpZiAoIUV2ZW50LnByb3RvdHlwZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24pIHtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSkge1xuXHRcdFx0XHR2YXIgcm12ID0gTm9kZS5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0aWYgKHR5cGUgPT09ICdjbGljaycpIHtcblx0XHRcdFx0XHRybXYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2suaGlqYWNrZWQgfHwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJtdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSkge1xuXHRcdFx0XHR2YXIgYWR2ID0gTm9kZS5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lcjtcblx0XHRcdFx0aWYgKHR5cGUgPT09ICdjbGljaycpIHtcblx0XHRcdFx0XHRhZHYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2suaGlqYWNrZWQgfHwgKGNhbGxiYWNrLmhpamFja2VkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0XHRcdGlmICghZXZlbnQucHJvcGFnYXRpb25TdG9wcGVkKSB7XG5cdFx0XHRcdFx0XHRcdGNhbGxiYWNrKGV2ZW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSwgY2FwdHVyZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWR2LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBJZiBhIGhhbmRsZXIgaXMgYWxyZWFkeSBkZWNsYXJlZCBpbiB0aGUgZWxlbWVudCdzIG9uY2xpY2sgYXR0cmlidXRlLCBpdCB3aWxsIGJlIGZpcmVkIGJlZm9yZVxuXHRcdC8vIEZhc3RDbGljaydzIG9uQ2xpY2sgaGFuZGxlci4gRml4IHRoaXMgYnkgcHVsbGluZyBvdXQgdGhlIHVzZXItZGVmaW5lZCBoYW5kbGVyIGZ1bmN0aW9uIGFuZFxuXHRcdC8vIGFkZGluZyBpdCBhcyBsaXN0ZW5lci5cblx0XHRpZiAodHlwZW9mIGxheWVyLm9uY2xpY2sgPT09ICdmdW5jdGlvbicpIHtcblxuXHRcdFx0Ly8gQW5kcm9pZCBicm93c2VyIG9uIGF0IGxlYXN0IDMuMiByZXF1aXJlcyBhIG5ldyByZWZlcmVuY2UgdG8gdGhlIGZ1bmN0aW9uIGluIGxheWVyLm9uY2xpY2tcblx0XHRcdC8vIC0gdGhlIG9sZCBvbmUgd29uJ3Qgd29yayBpZiBwYXNzZWQgdG8gYWRkRXZlbnRMaXN0ZW5lciBkaXJlY3RseS5cblx0XHRcdG9sZE9uQ2xpY2sgPSBsYXllci5vbmNsaWNrO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRvbGRPbkNsaWNrKGV2ZW50KTtcblx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdGxheWVyLm9uY2xpY2sgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQqIFdpbmRvd3MgUGhvbmUgOC4xIGZha2VzIHVzZXIgYWdlbnQgc3RyaW5nIHRvIGxvb2sgbGlrZSBBbmRyb2lkIGFuZCBpUGhvbmUuXG5cdCpcblx0KiBAdHlwZSBib29sZWFuXG5cdCovXG5cdHZhciBkZXZpY2VJc1dpbmRvd3NQaG9uZSA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIldpbmRvd3MgUGhvbmVcIikgPj0gMDtcblxuXHQvKipcblx0ICogQW5kcm9pZCByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNBbmRyb2lkID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdBbmRyb2lkJykgPiAwICYmICFkZXZpY2VJc1dpbmRvd3NQaG9uZTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TID0gL2lQKGFkfGhvbmV8b2QpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmICFkZXZpY2VJc1dpbmRvd3NQaG9uZTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgNCByZXF1aXJlcyBhbiBleGNlcHRpb24gZm9yIHNlbGVjdCBlbGVtZW50cy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TNCA9IGRldmljZUlzSU9TICYmICgvT1MgNF9cXGQoX1xcZCk/LykudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuXG5cdC8qKlxuXHQgKiBpT1MgNi4wLTcuKiByZXF1aXJlcyB0aGUgdGFyZ2V0IGVsZW1lbnQgdG8gYmUgbWFudWFsbHkgZGVyaXZlZFxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1NXaXRoQmFkVGFyZ2V0ID0gZGV2aWNlSXNJT1MgJiYgKC9PUyBbNi03XV9cXGQvKS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5cdC8qKlxuXHQgKiBCbGFja0JlcnJ5IHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0JsYWNrQmVycnkxMCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQkIxMCcpID4gMDtcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBnaXZlbiBlbGVtZW50IHJlcXVpcmVzIGEgbmF0aXZlIGNsaWNrLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCBuZWVkcyBhIG5hdGl2ZSBjbGlja1xuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5uZWVkc0NsaWNrID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cdFx0c3dpdGNoICh0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuXG5cdFx0Ly8gRG9uJ3Qgc2VuZCBhIHN5bnRoZXRpYyBjbGljayB0byBkaXNhYmxlZCBpbnB1dHMgKGlzc3VlICM2Milcblx0XHRjYXNlICdidXR0b24nOlxuXHRcdGNhc2UgJ3NlbGVjdCc6XG5cdFx0Y2FzZSAndGV4dGFyZWEnOlxuXHRcdFx0aWYgKHRhcmdldC5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnaW5wdXQnOlxuXG5cdFx0XHQvLyBGaWxlIGlucHV0cyBuZWVkIHJlYWwgY2xpY2tzIG9uIGlPUyA2IGR1ZSB0byBhIGJyb3dzZXIgYnVnIChpc3N1ZSAjNjgpXG5cdFx0XHRpZiAoKGRldmljZUlzSU9TICYmIHRhcmdldC50eXBlID09PSAnZmlsZScpIHx8IHRhcmdldC5kaXNhYmxlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSAnbGFiZWwnOlxuXHRcdGNhc2UgJ2lmcmFtZSc6IC8vIGlPUzggaG9tZXNjcmVlbiBhcHBzIGNhbiBwcmV2ZW50IGV2ZW50cyBidWJibGluZyBpbnRvIGZyYW1lc1xuXHRcdGNhc2UgJ3ZpZGVvJzpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiAoL1xcYm5lZWRzY2xpY2tcXGIvKS50ZXN0KHRhcmdldC5jbGFzc05hbWUpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIERldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCByZXF1aXJlcyBhIGNhbGwgdG8gZm9jdXMgdG8gc2ltdWxhdGUgY2xpY2sgaW50byBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldCBUYXJnZXQgRE9NIGVsZW1lbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiB0aGUgZWxlbWVudCByZXF1aXJlcyBhIGNhbGwgdG8gZm9jdXMgdG8gc2ltdWxhdGUgbmF0aXZlIGNsaWNrLlxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5uZWVkc0ZvY3VzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG5cdFx0c3dpdGNoICh0YXJnZXQubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdGNhc2UgJ3RleHRhcmVhJzpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGNhc2UgJ3NlbGVjdCc6XG5cdFx0XHRyZXR1cm4gIWRldmljZUlzQW5kcm9pZDtcblx0XHRjYXNlICdpbnB1dCc6XG5cdFx0XHRzd2l0Y2ggKHRhcmdldC50eXBlKSB7XG5cdFx0XHRjYXNlICdidXR0b24nOlxuXHRcdFx0Y2FzZSAnY2hlY2tib3gnOlxuXHRcdFx0Y2FzZSAnZmlsZSc6XG5cdFx0XHRjYXNlICdpbWFnZSc6XG5cdFx0XHRjYXNlICdyYWRpbyc6XG5cdFx0XHRjYXNlICdzdWJtaXQnOlxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vIHBvaW50IGluIGF0dGVtcHRpbmcgdG8gZm9jdXMgZGlzYWJsZWQgaW5wdXRzXG5cdFx0XHRyZXR1cm4gIXRhcmdldC5kaXNhYmxlZCAmJiAhdGFyZ2V0LnJlYWRPbmx5O1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gKC9cXGJuZWVkc2ZvY3VzXFxiLykudGVzdCh0YXJnZXQuY2xhc3NOYW1lKTtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogU2VuZCBhIGNsaWNrIGV2ZW50IHRvIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnNlbmRDbGljayA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQsIGV2ZW50KSB7XG5cdFx0dmFyIGNsaWNrRXZlbnQsIHRvdWNoO1xuXG5cdFx0Ly8gT24gc29tZSBBbmRyb2lkIGRldmljZXMgYWN0aXZlRWxlbWVudCBuZWVkcyB0byBiZSBibHVycmVkIG90aGVyd2lzZSB0aGUgc3ludGhldGljIGNsaWNrIHdpbGwgaGF2ZSBubyBlZmZlY3QgKCMyNClcblx0XHRpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50KSB7XG5cdFx0XHRkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcblx0XHR9XG5cblx0XHR0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0Ly8gU3ludGhlc2lzZSBhIGNsaWNrIGV2ZW50LCB3aXRoIGFuIGV4dHJhIGF0dHJpYnV0ZSBzbyBpdCBjYW4gYmUgdHJhY2tlZFxuXHRcdGNsaWNrRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudHMnKTtcblx0XHRjbGlja0V2ZW50LmluaXRNb3VzZUV2ZW50KHRoaXMuZGV0ZXJtaW5lRXZlbnRUeXBlKHRhcmdldEVsZW1lbnQpLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIHRvdWNoLnNjcmVlblgsIHRvdWNoLnNjcmVlblksIHRvdWNoLmNsaWVudFgsIHRvdWNoLmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLCBudWxsKTtcblx0XHRjbGlja0V2ZW50LmZvcndhcmRlZFRvdWNoRXZlbnQgPSB0cnVlO1xuXHRcdHRhcmdldEVsZW1lbnQuZGlzcGF0Y2hFdmVudChjbGlja0V2ZW50KTtcblx0fTtcblxuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmRldGVybWluZUV2ZW50VHlwZSA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblxuXHRcdC8vSXNzdWUgIzE1OTogQW5kcm9pZCBDaHJvbWUgU2VsZWN0IEJveCBkb2VzIG5vdCBvcGVuIHdpdGggYSBzeW50aGV0aWMgY2xpY2sgZXZlbnRcblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkICYmIHRhcmdldEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuXHRcdFx0cmV0dXJuICdtb3VzZWRvd24nO1xuXHRcdH1cblxuXHRcdHJldHVybiAnY2xpY2snO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5mb2N1cyA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblx0XHR2YXIgbGVuZ3RoO1xuXG5cdFx0Ly8gSXNzdWUgIzE2MDogb24gaU9TIDcsIHNvbWUgaW5wdXQgZWxlbWVudHMgKGUuZy4gZGF0ZSBkYXRldGltZSBtb250aCkgdGhyb3cgYSB2YWd1ZSBUeXBlRXJyb3Igb24gc2V0U2VsZWN0aW9uUmFuZ2UuIFRoZXNlIGVsZW1lbnRzIGRvbid0IGhhdmUgYW4gaW50ZWdlciB2YWx1ZSBmb3IgdGhlIHNlbGVjdGlvblN0YXJ0IGFuZCBzZWxlY3Rpb25FbmQgcHJvcGVydGllcywgYnV0IHVuZm9ydHVuYXRlbHkgdGhhdCBjYW4ndCBiZSB1c2VkIGZvciBkZXRlY3Rpb24gYmVjYXVzZSBhY2Nlc3NpbmcgdGhlIHByb3BlcnRpZXMgYWxzbyB0aHJvd3MgYSBUeXBlRXJyb3IuIEp1c3QgY2hlY2sgdGhlIHR5cGUgaW5zdGVhZC4gRmlsZWQgYXMgQXBwbGUgYnVnICMxNTEyMjcyNC5cblx0XHRpZiAoZGV2aWNlSXNJT1MgJiYgdGFyZ2V0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZSAmJiB0YXJnZXRFbGVtZW50LnR5cGUuaW5kZXhPZignZGF0ZScpICE9PSAwICYmIHRhcmdldEVsZW1lbnQudHlwZSAhPT0gJ3RpbWUnICYmIHRhcmdldEVsZW1lbnQudHlwZSAhPT0gJ21vbnRoJykge1xuXHRcdFx0bGVuZ3RoID0gdGFyZ2V0RWxlbWVudC52YWx1ZS5sZW5ndGg7XG5cdFx0XHR0YXJnZXRFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlKGxlbmd0aCwgbGVuZ3RoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5mb2N1cygpO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciBhbmQgaWYgc28sIHNldCBhIGZsYWcgb24gaXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS51cGRhdGVTY3JvbGxQYXJlbnQgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cdFx0dmFyIHNjcm9sbFBhcmVudCwgcGFyZW50RWxlbWVudDtcblxuXHRcdHNjcm9sbFBhcmVudCA9IHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXG5cdFx0Ly8gQXR0ZW1wdCB0byBkaXNjb3ZlciB3aGV0aGVyIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBjb250YWluZWQgd2l0aGluIGEgc2Nyb2xsYWJsZSBsYXllci4gUmUtY2hlY2sgaWYgdGhlXG5cdFx0Ly8gdGFyZ2V0IGVsZW1lbnQgd2FzIG1vdmVkIHRvIGFub3RoZXIgcGFyZW50LlxuXHRcdGlmICghc2Nyb2xsUGFyZW50IHx8ICFzY3JvbGxQYXJlbnQuY29udGFpbnModGFyZ2V0RWxlbWVudCkpIHtcblx0XHRcdHBhcmVudEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXHRcdFx0ZG8ge1xuXHRcdFx0XHRpZiAocGFyZW50RWxlbWVudC5zY3JvbGxIZWlnaHQgPiBwYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCkge1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudCA9IHBhcmVudEVsZW1lbnQ7XG5cdFx0XHRcdFx0dGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQgPSBwYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudDtcblx0XHRcdH0gd2hpbGUgKHBhcmVudEVsZW1lbnQpO1xuXHRcdH1cblxuXHRcdC8vIEFsd2F5cyB1cGRhdGUgdGhlIHNjcm9sbCB0b3AgdHJhY2tlciBpZiBwb3NzaWJsZS5cblx0XHRpZiAoc2Nyb2xsUGFyZW50KSB7XG5cdFx0XHRzY3JvbGxQYXJlbnQuZmFzdENsaWNrTGFzdFNjcm9sbFRvcCA9IHNjcm9sbFBhcmVudC5zY3JvbGxUb3A7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldEVsZW1lbnRcblx0ICogQHJldHVybnMge0VsZW1lbnR8RXZlbnRUYXJnZXR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQgPSBmdW5jdGlvbihldmVudFRhcmdldCkge1xuXG5cdFx0Ly8gT24gc29tZSBvbGRlciBicm93c2VycyAobm90YWJseSBTYWZhcmkgb24gaU9TIDQuMSAtIHNlZSBpc3N1ZSAjNTYpIHRoZSBldmVudCB0YXJnZXQgbWF5IGJlIGEgdGV4dCBub2RlLlxuXHRcdGlmIChldmVudFRhcmdldC5ub2RlVHlwZSA9PT0gTm9kZS5URVhUX05PREUpIHtcblx0XHRcdHJldHVybiBldmVudFRhcmdldC5wYXJlbnROb2RlO1xuXHRcdH1cblxuXHRcdHJldHVybiBldmVudFRhcmdldDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBzdGFydCwgcmVjb3JkIHRoZSBwb3NpdGlvbiBhbmQgc2Nyb2xsIG9mZnNldC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hTdGFydCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHRhcmdldEVsZW1lbnQsIHRvdWNoLCBzZWxlY3Rpb247XG5cblx0XHQvLyBJZ25vcmUgbXVsdGlwbGUgdG91Y2hlcywgb3RoZXJ3aXNlIHBpbmNoLXRvLXpvb20gaXMgcHJldmVudGVkIGlmIGJvdGggZmluZ2VycyBhcmUgb24gdGhlIEZhc3RDbGljayBlbGVtZW50IChpc3N1ZSAjMTExKS5cblx0XHRpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHR0YXJnZXRFbGVtZW50ID0gdGhpcy5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0KGV2ZW50LnRhcmdldCk7XG5cdFx0dG91Y2ggPSBldmVudC50YXJnZXRUb3VjaGVzWzBdO1xuXG5cdFx0aWYgKGRldmljZUlzSU9TKSB7XG5cblx0XHRcdC8vIE9ubHkgdHJ1c3RlZCBldmVudHMgd2lsbCBkZXNlbGVjdCB0ZXh0IG9uIGlPUyAoaXNzdWUgIzQ5KVxuXHRcdFx0c2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0aWYgKHNlbGVjdGlvbi5yYW5nZUNvdW50ICYmICFzZWxlY3Rpb24uaXNDb2xsYXBzZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghZGV2aWNlSXNJT1M0KSB7XG5cblx0XHRcdFx0Ly8gV2VpcmQgdGhpbmdzIGhhcHBlbiBvbiBpT1Mgd2hlbiBhbiBhbGVydCBvciBjb25maXJtIGRpYWxvZyBpcyBvcGVuZWQgZnJvbSBhIGNsaWNrIGV2ZW50IGNhbGxiYWNrIChpc3N1ZSAjMjMpOlxuXHRcdFx0XHQvLyB3aGVuIHRoZSB1c2VyIG5leHQgdGFwcyBhbnl3aGVyZSBlbHNlIG9uIHRoZSBwYWdlLCBuZXcgdG91Y2hzdGFydCBhbmQgdG91Y2hlbmQgZXZlbnRzIGFyZSBkaXNwYXRjaGVkXG5cdFx0XHRcdC8vIHdpdGggdGhlIHNhbWUgaWRlbnRpZmllciBhcyB0aGUgdG91Y2ggZXZlbnQgdGhhdCBwcmV2aW91c2x5IHRyaWdnZXJlZCB0aGUgY2xpY2sgdGhhdCB0cmlnZ2VyZWQgdGhlIGFsZXJ0LlxuXHRcdFx0XHQvLyBTYWRseSwgdGhlcmUgaXMgYW4gaXNzdWUgb24gaU9TIDQgdGhhdCBjYXVzZXMgc29tZSBub3JtYWwgdG91Y2ggZXZlbnRzIHRvIGhhdmUgdGhlIHNhbWUgaWRlbnRpZmllciBhcyBhblxuXHRcdFx0XHQvLyBpbW1lZGlhdGVseSBwcmVjZWVkaW5nIHRvdWNoIGV2ZW50IChpc3N1ZSAjNTIpLCBzbyB0aGlzIGZpeCBpcyB1bmF2YWlsYWJsZSBvbiB0aGF0IHBsYXRmb3JtLlxuXHRcdFx0XHQvLyBJc3N1ZSAxMjA6IHRvdWNoLmlkZW50aWZpZXIgaXMgMCB3aGVuIENocm9tZSBkZXYgdG9vbHMgJ0VtdWxhdGUgdG91Y2ggZXZlbnRzJyBpcyBzZXQgd2l0aCBhbiBpT1MgZGV2aWNlIFVBIHN0cmluZyxcblx0XHRcdFx0Ly8gd2hpY2ggY2F1c2VzIGFsbCB0b3VjaCBldmVudHMgdG8gYmUgaWdub3JlZC4gQXMgdGhpcyBibG9jayBvbmx5IGFwcGxpZXMgdG8gaU9TLCBhbmQgaU9TIGlkZW50aWZpZXJzIGFyZSBhbHdheXMgbG9uZyxcblx0XHRcdFx0Ly8gcmFuZG9tIGludGVnZXJzLCBpdCdzIHNhZmUgdG8gdG8gY29udGludWUgaWYgdGhlIGlkZW50aWZpZXIgaXMgMCBoZXJlLlxuXHRcdFx0XHRpZiAodG91Y2guaWRlbnRpZmllciAmJiB0b3VjaC5pZGVudGlmaWVyID09PSB0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIpIHtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMubGFzdFRvdWNoSWRlbnRpZmllciA9IHRvdWNoLmlkZW50aWZpZXI7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGEgY2hpbGQgb2YgYSBzY3JvbGxhYmxlIGxheWVyICh1c2luZyAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2gpIGFuZDpcblx0XHRcdFx0Ly8gMSkgdGhlIHVzZXIgZG9lcyBhIGZsaW5nIHNjcm9sbCBvbiB0aGUgc2Nyb2xsYWJsZSBsYXllclxuXHRcdFx0XHQvLyAyKSB0aGUgdXNlciBzdG9wcyB0aGUgZmxpbmcgc2Nyb2xsIHdpdGggYW5vdGhlciB0YXBcblx0XHRcdFx0Ly8gdGhlbiB0aGUgZXZlbnQudGFyZ2V0IG9mIHRoZSBsYXN0ICd0b3VjaGVuZCcgZXZlbnQgd2lsbCBiZSB0aGUgZWxlbWVudCB0aGF0IHdhcyB1bmRlciB0aGUgdXNlcidzIGZpbmdlclxuXHRcdFx0XHQvLyB3aGVuIHRoZSBmbGluZyBzY3JvbGwgd2FzIHN0YXJ0ZWQsIGNhdXNpbmcgRmFzdENsaWNrIHRvIHNlbmQgYSBjbGljayBldmVudCB0byB0aGF0IGxheWVyIC0gdW5sZXNzIGEgY2hlY2tcblx0XHRcdFx0Ly8gaXMgbWFkZSB0byBlbnN1cmUgdGhhdCBhIHBhcmVudCBsYXllciB3YXMgbm90IHNjcm9sbGVkIGJlZm9yZSBzZW5kaW5nIGEgc3ludGhldGljIGNsaWNrIChpc3N1ZSAjNDIpLlxuXHRcdFx0XHR0aGlzLnVwZGF0ZVNjcm9sbFBhcmVudCh0YXJnZXRFbGVtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSB0cnVlO1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gZXZlbnQudGltZVN0YW1wO1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG5cblx0XHR0aGlzLnRvdWNoU3RhcnRYID0gdG91Y2gucGFnZVg7XG5cdFx0dGhpcy50b3VjaFN0YXJ0WSA9IHRvdWNoLnBhZ2VZO1xuXG5cdFx0Ly8gUHJldmVudCBwaGFudG9tIGNsaWNrcyBvbiBmYXN0IGRvdWJsZS10YXAgKGlzc3VlICMzNilcblx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRoaXMubGFzdENsaWNrVGltZSkgPCB0aGlzLnRhcERlbGF5KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEJhc2VkIG9uIGEgdG91Y2htb3ZlIGV2ZW50IG9iamVjdCwgY2hlY2sgd2hldGhlciB0aGUgdG91Y2ggaGFzIG1vdmVkIHBhc3QgYSBib3VuZGFyeSBzaW5jZSBpdCBzdGFydGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUudG91Y2hIYXNNb3ZlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0sIGJvdW5kYXJ5ID0gdGhpcy50b3VjaEJvdW5kYXJ5O1xuXG5cdFx0aWYgKE1hdGguYWJzKHRvdWNoLnBhZ2VYIC0gdGhpcy50b3VjaFN0YXJ0WCkgPiBib3VuZGFyeSB8fCBNYXRoLmFicyh0b3VjaC5wYWdlWSAtIHRoaXMudG91Y2hTdGFydFkpID4gYm91bmRhcnkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGxhc3QgcG9zaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoTW92ZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0aWYgKCF0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSB0b3VjaCBoYXMgbW92ZWQsIGNhbmNlbCB0aGUgY2xpY2sgdHJhY2tpbmdcblx0XHRpZiAodGhpcy50YXJnZXRFbGVtZW50ICE9PSB0aGlzLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQoZXZlbnQudGFyZ2V0KSB8fCB0aGlzLnRvdWNoSGFzTW92ZWQoZXZlbnQpKSB7XG5cdFx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogQXR0ZW1wdCB0byBmaW5kIHRoZSBsYWJlbGxlZCBjb250cm9sIGZvciB0aGUgZ2l2ZW4gbGFiZWwgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxIVE1MTGFiZWxFbGVtZW50fSBsYWJlbEVsZW1lbnRcblx0ICogQHJldHVybnMge0VsZW1lbnR8bnVsbH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZmluZENvbnRyb2wgPSBmdW5jdGlvbihsYWJlbEVsZW1lbnQpIHtcblxuXHRcdC8vIEZhc3QgcGF0aCBmb3IgbmV3ZXIgYnJvd3NlcnMgc3VwcG9ydGluZyB0aGUgSFRNTDUgY29udHJvbCBhdHRyaWJ1dGVcblx0XHRpZiAobGFiZWxFbGVtZW50LmNvbnRyb2wgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIGxhYmVsRWxlbWVudC5jb250cm9sO1xuXHRcdH1cblxuXHRcdC8vIEFsbCBicm93c2VycyB1bmRlciB0ZXN0IHRoYXQgc3VwcG9ydCB0b3VjaCBldmVudHMgYWxzbyBzdXBwb3J0IHRoZSBIVE1MNSBodG1sRm9yIGF0dHJpYnV0ZVxuXHRcdGlmIChsYWJlbEVsZW1lbnQuaHRtbEZvcikge1xuXHRcdFx0cmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGxhYmVsRWxlbWVudC5odG1sRm9yKTtcblx0XHR9XG5cblx0XHQvLyBJZiBubyBmb3IgYXR0cmlidXRlIGV4aXN0cywgYXR0ZW1wdCB0byByZXRyaWV2ZSB0aGUgZmlyc3QgbGFiZWxsYWJsZSBkZXNjZW5kYW50IGVsZW1lbnRcblx0XHQvLyB0aGUgbGlzdCBvZiB3aGljaCBpcyBkZWZpbmVkIGhlcmU6IGh0dHA6Ly93d3cudzMub3JnL1RSL2h0bWw1L2Zvcm1zLmh0bWwjY2F0ZWdvcnktbGFiZWxcblx0XHRyZXR1cm4gbGFiZWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvbiwgaW5wdXQ6bm90KFt0eXBlPWhpZGRlbl0pLCBrZXlnZW4sIG1ldGVyLCBvdXRwdXQsIHByb2dyZXNzLCBzZWxlY3QsIHRleHRhcmVhJyk7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggZW5kLCBkZXRlcm1pbmUgd2hldGhlciB0byBzZW5kIGEgY2xpY2sgZXZlbnQgYXQgb25jZS5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hFbmQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBmb3JFbGVtZW50LCB0cmFja2luZ0NsaWNrU3RhcnQsIHRhcmdldFRhZ05hbWUsIHNjcm9sbFBhcmVudCwgdG91Y2gsIHRhcmdldEVsZW1lbnQgPSB0aGlzLnRhcmdldEVsZW1lbnQ7XG5cblx0XHRpZiAoIXRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUHJldmVudCBwaGFudG9tIGNsaWNrcyBvbiBmYXN0IGRvdWJsZS10YXAgKGlzc3VlICMzNilcblx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRoaXMubGFzdENsaWNrVGltZSkgPCB0aGlzLnRhcERlbGF5KSB7XG5cdFx0XHR0aGlzLmNhbmNlbE5leHRDbGljayA9IHRydWU7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0KSA+IHRoaXMudGFwVGltZW91dCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUmVzZXQgdG8gcHJldmVudCB3cm9uZyBjbGljayBjYW5jZWwgb24gaW5wdXQgKGlzc3VlICMxNTYpLlxuXHRcdHRoaXMuY2FuY2VsTmV4dENsaWNrID0gZmFsc2U7XG5cblx0XHR0aGlzLmxhc3RDbGlja1RpbWUgPSBldmVudC50aW1lU3RhbXA7XG5cblx0XHR0cmFja2luZ0NsaWNrU3RhcnQgPSB0aGlzLnRyYWNraW5nQ2xpY2tTdGFydDtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IDA7XG5cblx0XHQvLyBPbiBzb21lIGlPUyBkZXZpY2VzLCB0aGUgdGFyZ2V0RWxlbWVudCBzdXBwbGllZCB3aXRoIHRoZSBldmVudCBpcyBpbnZhbGlkIGlmIHRoZSBsYXllclxuXHRcdC8vIGlzIHBlcmZvcm1pbmcgYSB0cmFuc2l0aW9uIG9yIHNjcm9sbCwgYW5kIGhhcyB0byBiZSByZS1kZXRlY3RlZCBtYW51YWxseS4gTm90ZSB0aGF0XG5cdFx0Ly8gZm9yIHRoaXMgdG8gZnVuY3Rpb24gY29ycmVjdGx5LCBpdCBtdXN0IGJlIGNhbGxlZCAqYWZ0ZXIqIHRoZSBldmVudCB0YXJnZXQgaXMgY2hlY2tlZCFcblx0XHQvLyBTZWUgaXNzdWUgIzU3OyBhbHNvIGZpbGVkIGFzIHJkYXI6Ly8xMzA0ODU4OSAuXG5cdFx0aWYgKGRldmljZUlzSU9TV2l0aEJhZFRhcmdldCkge1xuXHRcdFx0dG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuXHRcdFx0Ly8gSW4gY2VydGFpbiBjYXNlcyBhcmd1bWVudHMgb2YgZWxlbWVudEZyb21Qb2ludCBjYW4gYmUgbmVnYXRpdmUsIHNvIHByZXZlbnQgc2V0dGluZyB0YXJnZXRFbGVtZW50IHRvIG51bGxcblx0XHRcdHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHRvdWNoLnBhZ2VYIC0gd2luZG93LnBhZ2VYT2Zmc2V0LCB0b3VjaC5wYWdlWSAtIHdpbmRvdy5wYWdlWU9mZnNldCkgfHwgdGFyZ2V0RWxlbWVudDtcblx0XHRcdHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50ID0gdGhpcy50YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblx0XHR9XG5cblx0XHR0YXJnZXRUYWdOYW1lID0gdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0aWYgKHRhcmdldFRhZ05hbWUgPT09ICdsYWJlbCcpIHtcblx0XHRcdGZvckVsZW1lbnQgPSB0aGlzLmZpbmRDb250cm9sKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0aWYgKGZvckVsZW1lbnQpIHtcblx0XHRcdFx0dGhpcy5mb2N1cyh0YXJnZXRFbGVtZW50KTtcblx0XHRcdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRhcmdldEVsZW1lbnQgPSBmb3JFbGVtZW50O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGhpcy5uZWVkc0ZvY3VzKHRhcmdldEVsZW1lbnQpKSB7XG5cblx0XHRcdC8vIENhc2UgMTogSWYgdGhlIHRvdWNoIHN0YXJ0ZWQgYSB3aGlsZSBhZ28gKGJlc3QgZ3Vlc3MgaXMgMTAwbXMgYmFzZWQgb24gdGVzdHMgZm9yIGlzc3VlICMzNikgdGhlbiBmb2N1cyB3aWxsIGJlIHRyaWdnZXJlZCBhbnl3YXkuIFJldHVybiBlYXJseSBhbmQgdW5zZXQgdGhlIHRhcmdldCBlbGVtZW50IHJlZmVyZW5jZSBzbyB0aGF0IHRoZSBzdWJzZXF1ZW50IGNsaWNrIHdpbGwgYmUgYWxsb3dlZCB0aHJvdWdoLlxuXHRcdFx0Ly8gQ2FzZSAyOiBXaXRob3V0IHRoaXMgZXhjZXB0aW9uIGZvciBpbnB1dCBlbGVtZW50cyB0YXBwZWQgd2hlbiB0aGUgZG9jdW1lbnQgaXMgY29udGFpbmVkIGluIGFuIGlmcmFtZSwgdGhlbiBhbnkgaW5wdXR0ZWQgdGV4dCB3b24ndCBiZSB2aXNpYmxlIGV2ZW4gdGhvdWdoIHRoZSB2YWx1ZSBhdHRyaWJ1dGUgaXMgdXBkYXRlZCBhcyB0aGUgdXNlciB0eXBlcyAoaXNzdWUgIzM3KS5cblx0XHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdHJhY2tpbmdDbGlja1N0YXJ0KSA+IDEwMCB8fCAoZGV2aWNlSXNJT1MgJiYgd2luZG93LnRvcCAhPT0gd2luZG93ICYmIHRhcmdldFRhZ05hbWUgPT09ICdpbnB1dCcpKSB7XG5cdFx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5mb2N1cyh0YXJnZXRFbGVtZW50KTtcblx0XHRcdHRoaXMuc2VuZENsaWNrKHRhcmdldEVsZW1lbnQsIGV2ZW50KTtcblxuXHRcdFx0Ly8gU2VsZWN0IGVsZW1lbnRzIG5lZWQgdGhlIGV2ZW50IHRvIGdvIHRocm91Z2ggb24gaU9TIDQsIG90aGVyd2lzZSB0aGUgc2VsZWN0b3IgbWVudSB3b24ndCBvcGVuLlxuXHRcdFx0Ly8gQWxzbyB0aGlzIGJyZWFrcyBvcGVuaW5nIHNlbGVjdHMgd2hlbiBWb2ljZU92ZXIgaXMgYWN0aXZlIG9uIGlPUzYsIGlPUzcgKGFuZCBwb3NzaWJseSBvdGhlcnMpXG5cdFx0XHRpZiAoIWRldmljZUlzSU9TIHx8IHRhcmdldFRhZ05hbWUgIT09ICdzZWxlY3QnKSB7XG5cdFx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAoZGV2aWNlSXNJT1MgJiYgIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHQvLyBEb24ndCBzZW5kIGEgc3ludGhldGljIGNsaWNrIGV2ZW50IGlmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBjb250YWluZWQgd2l0aGluIGEgcGFyZW50IGxheWVyIHRoYXQgd2FzIHNjcm9sbGVkXG5cdFx0XHQvLyBhbmQgdGhpcyB0YXAgaXMgYmVpbmcgdXNlZCB0byBzdG9wIHRoZSBzY3JvbGxpbmcgKHVzdWFsbHkgaW5pdGlhdGVkIGJ5IGEgZmxpbmcgLSBpc3N1ZSAjNDIpLlxuXHRcdFx0c2Nyb2xsUGFyZW50ID0gdGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cdFx0XHRpZiAoc2Nyb2xsUGFyZW50ICYmIHNjcm9sbFBhcmVudC5mYXN0Q2xpY2tMYXN0U2Nyb2xsVG9wICE9PSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFByZXZlbnQgdGhlIGFjdHVhbCBjbGljayBmcm9tIGdvaW5nIHRob3VnaCAtIHVubGVzcyB0aGUgdGFyZ2V0IG5vZGUgaXMgbWFya2VkIGFzIHJlcXVpcmluZ1xuXHRcdC8vIHJlYWwgY2xpY2tzIG9yIGlmIGl0IGlzIGluIHRoZSB3aGl0ZWxpc3QgaW4gd2hpY2ggY2FzZSBvbmx5IG5vbi1wcm9ncmFtbWF0aWMgY2xpY2tzIGFyZSBwZXJtaXR0ZWQuXG5cdFx0aWYgKCF0aGlzLm5lZWRzQ2xpY2sodGFyZ2V0RWxlbWVudCkpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLnNlbmRDbGljayh0YXJnZXRFbGVtZW50LCBldmVudCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIGNhbmNlbCwgc3RvcCB0cmFja2luZyB0aGUgY2xpY2suXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoQ2FuY2VsID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgbW91c2UgZXZlbnRzIHdoaWNoIHNob3VsZCBiZSBwZXJtaXR0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vbk1vdXNlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuXHRcdC8vIElmIGEgdGFyZ2V0IGVsZW1lbnQgd2FzIG5ldmVyIHNldCAoYmVjYXVzZSBhIHRvdWNoIGV2ZW50IHdhcyBuZXZlciBmaXJlZCkgYWxsb3cgdGhlIGV2ZW50XG5cdFx0aWYgKCF0aGlzLnRhcmdldEVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmIChldmVudC5mb3J3YXJkZWRUb3VjaEV2ZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBQcm9ncmFtbWF0aWNhbGx5IGdlbmVyYXRlZCBldmVudHMgdGFyZ2V0aW5nIGEgc3BlY2lmaWMgZWxlbWVudCBzaG91bGQgYmUgcGVybWl0dGVkXG5cdFx0aWYgKCFldmVudC5jYW5jZWxhYmxlKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBEZXJpdmUgYW5kIGNoZWNrIHRoZSB0YXJnZXQgZWxlbWVudCB0byBzZWUgd2hldGhlciB0aGUgbW91c2UgZXZlbnQgbmVlZHMgdG8gYmUgcGVybWl0dGVkO1xuXHRcdC8vIHVubGVzcyBleHBsaWNpdGx5IGVuYWJsZWQsIHByZXZlbnQgbm9uLXRvdWNoIGNsaWNrIGV2ZW50cyBmcm9tIHRyaWdnZXJpbmcgYWN0aW9ucyxcblx0XHQvLyB0byBwcmV2ZW50IGdob3N0L2RvdWJsZWNsaWNrcy5cblx0XHRpZiAoIXRoaXMubmVlZHNDbGljayh0aGlzLnRhcmdldEVsZW1lbnQpIHx8IHRoaXMuY2FuY2VsTmV4dENsaWNrKSB7XG5cblx0XHRcdC8vIFByZXZlbnQgYW55IHVzZXItYWRkZWQgbGlzdGVuZXJzIGRlY2xhcmVkIG9uIEZhc3RDbGljayBlbGVtZW50IGZyb20gYmVpbmcgZmlyZWQuXG5cdFx0XHRpZiAoZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG5cdFx0XHRcdGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQYXJ0IG9mIHRoZSBoYWNrIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgRXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIChlLmcuIEFuZHJvaWQgMilcblx0XHRcdFx0ZXZlbnQucHJvcGFnYXRpb25TdG9wcGVkID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2FuY2VsIHRoZSBldmVudFxuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIG1vdXNlIGV2ZW50IGlzIHBlcm1pdHRlZCwgcmV0dXJuIHRydWUgZm9yIHRoZSBhY3Rpb24gdG8gZ28gdGhyb3VnaC5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiBhY3R1YWwgY2xpY2tzLCBkZXRlcm1pbmUgd2hldGhlciB0aGlzIGlzIGEgdG91Y2gtZ2VuZXJhdGVkIGNsaWNrLCBhIGNsaWNrIGFjdGlvbiBvY2N1cnJpbmdcblx0ICogbmF0dXJhbGx5IGFmdGVyIGEgZGVsYXkgYWZ0ZXIgYSB0b3VjaCAod2hpY2ggbmVlZHMgdG8gYmUgY2FuY2VsbGVkIHRvIGF2b2lkIGR1cGxpY2F0aW9uKSwgb3Jcblx0ICogYW4gYWN0dWFsIGNsaWNrIHdoaWNoIHNob3VsZCBiZSBwZXJtaXR0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vbkNsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgcGVybWl0dGVkO1xuXG5cdFx0Ly8gSXQncyBwb3NzaWJsZSBmb3IgYW5vdGhlciBGYXN0Q2xpY2stbGlrZSBsaWJyYXJ5IGRlbGl2ZXJlZCB3aXRoIHRoaXJkLXBhcnR5IGNvZGUgdG8gZmlyZSBhIGNsaWNrIGV2ZW50IGJlZm9yZSBGYXN0Q2xpY2sgZG9lcyAoaXNzdWUgIzQ0KS4gSW4gdGhhdCBjYXNlLCBzZXQgdGhlIGNsaWNrLXRyYWNraW5nIGZsYWcgYmFjayB0byBmYWxzZSBhbmQgcmV0dXJuIGVhcmx5LiBUaGlzIHdpbGwgY2F1c2Ugb25Ub3VjaEVuZCB0byByZXR1cm4gZWFybHkuXG5cdFx0aWYgKHRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gVmVyeSBvZGQgYmVoYXZpb3VyIG9uIGlPUyAoaXNzdWUgIzE4KTogaWYgYSBzdWJtaXQgZWxlbWVudCBpcyBwcmVzZW50IGluc2lkZSBhIGZvcm0gYW5kIHRoZSB1c2VyIGhpdHMgZW50ZXIgaW4gdGhlIGlPUyBzaW11bGF0b3Igb3IgY2xpY2tzIHRoZSBHbyBidXR0b24gb24gdGhlIHBvcC11cCBPUyBrZXlib2FyZCB0aGUgYSBraW5kIG9mICdmYWtlJyBjbGljayBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB3aXRoIHRoZSBzdWJtaXQtdHlwZSBpbnB1dCBlbGVtZW50IGFzIHRoZSB0YXJnZXQuXG5cdFx0aWYgKGV2ZW50LnRhcmdldC50eXBlID09PSAnc3VibWl0JyAmJiBldmVudC5kZXRhaWwgPT09IDApIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHBlcm1pdHRlZCA9IHRoaXMub25Nb3VzZShldmVudCk7XG5cblx0XHQvLyBPbmx5IHVuc2V0IHRhcmdldEVsZW1lbnQgaWYgdGhlIGNsaWNrIGlzIG5vdCBwZXJtaXR0ZWQuIFRoaXMgd2lsbCBlbnN1cmUgdGhhdCB0aGUgY2hlY2sgZm9yICF0YXJnZXRFbGVtZW50IGluIG9uTW91c2UgZmFpbHMgYW5kIHRoZSBicm93c2VyJ3MgY2xpY2sgZG9lc24ndCBnbyB0aHJvdWdoLlxuXHRcdGlmICghcGVybWl0dGVkKSB7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIElmIGNsaWNrcyBhcmUgcGVybWl0dGVkLCByZXR1cm4gdHJ1ZSBmb3IgdGhlIGFjdGlvbiB0byBnbyB0aHJvdWdoLlxuXHRcdHJldHVybiBwZXJtaXR0ZWQ7XG5cdH07XG5cblxuXHQvKipcblx0ICogUmVtb3ZlIGFsbCBGYXN0Q2xpY2sncyBldmVudCBsaXN0ZW5lcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxheWVyID0gdGhpcy5sYXllcjtcblxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRydWUpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5vblRvdWNoQ2FuY2VsLCBmYWxzZSk7XG5cdH07XG5cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciBGYXN0Q2xpY2sgaXMgbmVlZGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICovXG5cdEZhc3RDbGljay5ub3ROZWVkZWQgPSBmdW5jdGlvbihsYXllcikge1xuXHRcdHZhciBtZXRhVmlld3BvcnQ7XG5cdFx0dmFyIGNocm9tZVZlcnNpb247XG5cdFx0dmFyIGJsYWNrYmVycnlWZXJzaW9uO1xuXHRcdHZhciBmaXJlZm94VmVyc2lvbjtcblxuXHRcdC8vIERldmljZXMgdGhhdCBkb24ndCBzdXBwb3J0IHRvdWNoIGRvbid0IG5lZWQgRmFzdENsaWNrXG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cub250b3VjaHN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gQ2hyb21lIHZlcnNpb24gLSB6ZXJvIGZvciBvdGhlciBicm93c2Vyc1xuXHRcdGNocm9tZVZlcnNpb24gPSArKC9DaHJvbWVcXC8oWzAtOV0rKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSB8fCBbLDBdKVsxXTtcblxuXHRcdGlmIChjaHJvbWVWZXJzaW9uKSB7XG5cblx0XHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXG5cdFx0XHRcdGlmIChtZXRhVmlld3BvcnQpIHtcblx0XHRcdFx0XHQvLyBDaHJvbWUgb24gQW5kcm9pZCB3aXRoIHVzZXItc2NhbGFibGU9XCJub1wiIGRvZXNuJ3QgbmVlZCBGYXN0Q2xpY2sgKGlzc3VlICM4OSlcblx0XHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIENocm9tZSAzMiBhbmQgYWJvdmUgd2l0aCB3aWR0aD1kZXZpY2Utd2lkdGggb3IgbGVzcyBkb24ndCBuZWVkIEZhc3RDbGlja1xuXHRcdFx0XHRcdGlmIChjaHJvbWVWZXJzaW9uID4gMzEgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0Ly8gQ2hyb21lIGRlc2t0b3AgZG9lc24ndCBuZWVkIEZhc3RDbGljayAoaXNzdWUgIzE1KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKGRldmljZUlzQmxhY2tCZXJyeTEwKSB7XG5cdFx0XHRibGFja2JlcnJ5VmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1ZlcnNpb25cXC8oWzAtOV0qKVxcLihbMC05XSopLyk7XG5cblx0XHRcdC8vIEJsYWNrQmVycnkgMTAuMysgZG9lcyBub3QgcmVxdWlyZSBGYXN0Y2xpY2sgbGlicmFyeS5cblx0XHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mdGxhYnMvZmFzdGNsaWNrL2lzc3Vlcy8yNTFcblx0XHRcdGlmIChibGFja2JlcnJ5VmVyc2lvblsxXSA+PSAxMCAmJiBibGFja2JlcnJ5VmVyc2lvblsyXSA+PSAzKSB7XG5cdFx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblxuXHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0KSB7XG5cdFx0XHRcdFx0Ly8gdXNlci1zY2FsYWJsZT1ubyBlbGltaW5hdGVzIGNsaWNrIGRlbGF5LlxuXHRcdFx0XHRcdGlmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gd2lkdGg9ZGV2aWNlLXdpZHRoIChvciBsZXNzIHRoYW4gZGV2aWNlLXdpZHRoKSBlbGltaW5hdGVzIGNsaWNrIGRlbGF5LlxuXHRcdFx0XHRcdGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElFMTAgd2l0aCAtbXMtdG91Y2gtYWN0aW9uOiBub25lIG9yIG1hbmlwdWxhdGlvbiwgd2hpY2ggZGlzYWJsZXMgZG91YmxlLXRhcC10by16b29tIChpc3N1ZSAjOTcpXG5cdFx0aWYgKGxheWVyLnN0eWxlLm1zVG91Y2hBY3Rpb24gPT09ICdub25lJyB8fCBsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ21hbmlwdWxhdGlvbicpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEZpcmVmb3ggdmVyc2lvbiAtIHplcm8gZm9yIG90aGVyIGJyb3dzZXJzXG5cdFx0ZmlyZWZveFZlcnNpb24gPSArKC9GaXJlZm94XFwvKFswLTldKykvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWywwXSlbMV07XG5cblx0XHRpZiAoZmlyZWZveFZlcnNpb24gPj0gMjcpIHtcblx0XHRcdC8vIEZpcmVmb3ggMjcrIGRvZXMgbm90IGhhdmUgdGFwIGRlbGF5IGlmIHRoZSBjb250ZW50IGlzIG5vdCB6b29tYWJsZSAtIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTkyMjg5NlxuXG5cdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cdFx0XHRpZiAobWV0YVZpZXdwb3J0ICYmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSUUxMTogcHJlZml4ZWQgLW1zLXRvdWNoLWFjdGlvbiBpcyBubyBsb25nZXIgc3VwcG9ydGVkIGFuZCBpdCdzIHJlY29tZW5kZWQgdG8gdXNlIG5vbi1wcmVmaXhlZCB2ZXJzaW9uXG5cdFx0Ly8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L3dpbmRvd3MvYXBwcy9IaDc2NzMxMy5hc3B4XG5cdFx0aWYgKGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbm9uZScgfHwgbGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdtYW5pcHVsYXRpb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogRmFjdG9yeSBtZXRob2QgZm9yIGNyZWF0aW5nIGEgRmFzdENsaWNrIG9iamVjdFxuXHQgKlxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHNcblx0ICovXG5cdEZhc3RDbGljay5hdHRhY2ggPSBmdW5jdGlvbihsYXllciwgb3B0aW9ucykge1xuXHRcdHJldHVybiBuZXcgRmFzdENsaWNrKGxheWVyLCBvcHRpb25zKTtcblx0fTtcblxuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBkZWZpbmUuYW1kID09PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKSB7XG5cblx0XHQvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIEZhc3RDbGljaztcblx0XHR9KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gRmFzdENsaWNrLmF0dGFjaDtcblx0XHRtb2R1bGUuZXhwb3J0cy5GYXN0Q2xpY2sgPSBGYXN0Q2xpY2s7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LkZhc3RDbGljayA9IEZhc3RDbGljaztcblx0fVxufSgpKTtcbiIsIi8qZ2xvYmFsIGpRdWVyeSAqL1xuLypqc2hpbnQgYnJvd3Nlcjp0cnVlICovXG4vKiFcbiogRml0VmlkcyAxLjFcbipcbiogQ29weXJpZ2h0IDIwMTMsIENocmlzIENveWllciAtIGh0dHA6Ly9jc3MtdHJpY2tzLmNvbSArIERhdmUgUnVwZXJ0IC0gaHR0cDovL2RhdmVydXBlcnQuY29tXG4qIENyZWRpdCB0byBUaGllcnJ5IEtvYmxlbnR6IC0gaHR0cDovL3d3dy5hbGlzdGFwYXJ0LmNvbS9hcnRpY2xlcy9jcmVhdGluZy1pbnRyaW5zaWMtcmF0aW9zLWZvci12aWRlby9cbiogUmVsZWFzZWQgdW5kZXIgdGhlIFdURlBMIGxpY2Vuc2UgLSBodHRwOi8vc2FtLnpveS5vcmcvd3RmcGwvXG4qXG4qL1xuXG4oZnVuY3Rpb24oICQgKXtcblxuICBcInVzZSBzdHJpY3RcIjtcblxuICAkLmZuLmZpdFZpZHMgPSBmdW5jdGlvbiggb3B0aW9ucyApIHtcbiAgICB2YXIgc2V0dGluZ3MgPSB7XG4gICAgICBjdXN0b21TZWxlY3RvcjogbnVsbFxuICAgIH07XG5cbiAgICBpZighZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZpdC12aWRzLXN0eWxlJykpIHtcbiAgICAgIC8vIGFwcGVuZFN0eWxlczogaHR0cHM6Ly9naXRodWIuY29tL3RvZGRtb3R0by9mbHVpZHZpZHMvYmxvYi9tYXN0ZXIvZGlzdC9mbHVpZHZpZHMuanNcbiAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgdmFyIGNzcyA9ICcuZmx1aWQtd2lkdGgtdmlkZW8td3JhcHBlcnt3aWR0aDoxMDAlO3Bvc2l0aW9uOnJlbGF0aXZlO3BhZGRpbmc6MDt9LmZsdWlkLXdpZHRoLXZpZGVvLXdyYXBwZXIgaWZyYW1lLC5mbHVpZC13aWR0aC12aWRlby13cmFwcGVyIG9iamVjdCwuZmx1aWQtd2lkdGgtdmlkZW8td3JhcHBlciBlbWJlZCB7cG9zaXRpb246YWJzb2x1dGU7dG9wOjA7bGVmdDowO3dpZHRoOjEwMCU7aGVpZ2h0OjEwMCU7fSc7XG4gICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBkaXYuaW5uZXJIVE1MID0gJzxwPng8L3A+PHN0eWxlIGlkPVwiZml0LXZpZHMtc3R5bGVcIj4nICsgY3NzICsgJzwvc3R5bGU+JztcbiAgICAgIGhlYWQuYXBwZW5kQ2hpbGQoZGl2LmNoaWxkTm9kZXNbMV0pO1xuICAgIH1cblxuICAgIGlmICggb3B0aW9ucyApIHtcbiAgICAgICQuZXh0ZW5kKCBzZXR0aW5ncywgb3B0aW9ucyApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciBzZWxlY3RvcnMgPSBbXG4gICAgICAgIFwiaWZyYW1lW3NyYyo9J3BsYXllci52aW1lby5jb20nXVwiLFxuICAgICAgICBcImlmcmFtZVtzcmMqPSd5b3V0dWJlLmNvbSddXCIsXG4gICAgICAgIFwiaWZyYW1lW3NyYyo9J3lvdXR1YmUtbm9jb29raWUuY29tJ11cIixcbiAgICAgICAgXCJpZnJhbWVbc3JjKj0na2lja3N0YXJ0ZXIuY29tJ11bc3JjKj0ndmlkZW8uaHRtbCddXCIsXG4gICAgICAgIFwib2JqZWN0XCIsXG4gICAgICAgIFwiZW1iZWRcIlxuICAgICAgXTtcblxuICAgICAgaWYgKHNldHRpbmdzLmN1c3RvbVNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKHNldHRpbmdzLmN1c3RvbVNlbGVjdG9yKTtcbiAgICAgIH1cblxuICAgICAgdmFyICRhbGxWaWRlb3MgPSAkKHRoaXMpLmZpbmQoc2VsZWN0b3JzLmpvaW4oJywnKSk7XG4gICAgICAkYWxsVmlkZW9zID0gJGFsbFZpZGVvcy5ub3QoXCJvYmplY3Qgb2JqZWN0XCIpOyAvLyBTd2ZPYmogY29uZmxpY3QgcGF0Y2hcblxuICAgICAgJGFsbFZpZGVvcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2VtYmVkJyAmJiAkdGhpcy5wYXJlbnQoJ29iamVjdCcpLmxlbmd0aCB8fCAkdGhpcy5wYXJlbnQoJy5mbHVpZC13aWR0aC12aWRlby13cmFwcGVyJykubGVuZ3RoKSB7IHJldHVybjsgfVxuICAgICAgICB2YXIgaGVpZ2h0ID0gKCB0aGlzLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ29iamVjdCcgfHwgKCR0aGlzLmF0dHIoJ2hlaWdodCcpICYmICFpc05hTihwYXJzZUludCgkdGhpcy5hdHRyKCdoZWlnaHQnKSwgMTApKSkgKSA/IHBhcnNlSW50KCR0aGlzLmF0dHIoJ2hlaWdodCcpLCAxMCkgOiAkdGhpcy5oZWlnaHQoKSxcbiAgICAgICAgICAgIHdpZHRoID0gIWlzTmFOKHBhcnNlSW50KCR0aGlzLmF0dHIoJ3dpZHRoJyksIDEwKSkgPyBwYXJzZUludCgkdGhpcy5hdHRyKCd3aWR0aCcpLCAxMCkgOiAkdGhpcy53aWR0aCgpLFxuICAgICAgICAgICAgYXNwZWN0UmF0aW8gPSBoZWlnaHQgLyB3aWR0aDtcbiAgICAgICAgaWYoISR0aGlzLmF0dHIoJ2lkJykpe1xuICAgICAgICAgIHZhciB2aWRlb0lEID0gJ2ZpdHZpZCcgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqOTk5OTk5KTtcbiAgICAgICAgICAkdGhpcy5hdHRyKCdpZCcsIHZpZGVvSUQpO1xuICAgICAgICB9XG4gICAgICAgICR0aGlzLndyYXAoJzxkaXYgY2xhc3M9XCJmbHVpZC13aWR0aC12aWRlby13cmFwcGVyXCI+PC9kaXY+JykucGFyZW50KCcuZmx1aWQtd2lkdGgtdmlkZW8td3JhcHBlcicpLmNzcygncGFkZGluZy10b3AnLCAoYXNwZWN0UmF0aW8gKiAxMDApK1wiJVwiKTtcbiAgICAgICAgJHRoaXMucmVtb3ZlQXR0cignaGVpZ2h0JykucmVtb3ZlQXR0cignd2lkdGgnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuLy8gV29ya3Mgd2l0aCBlaXRoZXIgalF1ZXJ5IG9yIFplcHRvXG59KSggd2luZG93LmpRdWVyeSB8fCB3aW5kb3cuWmVwdG8gKTtcbiIsIi8qIVxuKiBQYXJzbGV5LmpzXG4qIFZlcnNpb24gMi40LjQgLSBidWlsdCBUaHUsIEF1ZyA0dGggMjAxNiwgOTo1NCBwbVxuKiBodHRwOi8vcGFyc2xleWpzLm9yZ1xuKiBHdWlsbGF1bWUgUG90aWVyIC0gPGd1aWxsYXVtZUB3aXNlbWJseS5jb20+XG4qIE1hcmMtQW5kcmUgTGFmb3J0dW5lIC0gPHBldHJvc2VsaW51bUBtYXJjLWFuZHJlLmNhPlxuKiBNSVQgTGljZW5zZWRcbiovXG5cbi8vIFRoZSBzb3VyY2UgY29kZSBiZWxvdyBpcyBnZW5lcmF0ZWQgYnkgYmFiZWwgYXNcbi8vIFBhcnNsZXkgaXMgd3JpdHRlbiBpbiBFQ01BU2NyaXB0IDZcbi8vXG52YXIgX3NsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZSgnanF1ZXJ5JykpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpIDogZ2xvYmFsLnBhcnNsZXkgPSBmYWN0b3J5KGdsb2JhbC5qUXVlcnkpO1xufSkodGhpcywgZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBnbG9iYWxJRCA9IDE7XG4gIHZhciBwYXN0V2FybmluZ3MgPSB7fTtcblxuICB2YXIgUGFyc2xleVV0aWxzX19QYXJzbGV5VXRpbHMgPSB7XG4gICAgLy8gUGFyc2xleSBET00tQVBJXG4gICAgLy8gcmV0dXJucyBvYmplY3QgZnJvbSBkb20gYXR0cmlidXRlcyBhbmQgdmFsdWVzXG4gICAgYXR0cjogZnVuY3Rpb24gYXR0cigkZWxlbWVudCwgbmFtZXNwYWNlLCBvYmopIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGF0dHJpYnV0ZTtcbiAgICAgIHZhciBhdHRyaWJ1dGVzO1xuICAgICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2UsICdpJyk7XG5cbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIG9iaikgb2JqID0ge307ZWxzZSB7XG4gICAgICAgIC8vIENsZWFyIGFsbCBvd24gcHJvcGVydGllcy4gVGhpcyB3b24ndCBhZmZlY3QgcHJvdG90eXBlJ3MgdmFsdWVzXG4gICAgICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGkpKSBkZWxldGUgb2JqW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mICRlbGVtZW50IHx8ICd1bmRlZmluZWQnID09PSB0eXBlb2YgJGVsZW1lbnRbMF0pIHJldHVybiBvYmo7XG5cbiAgICAgIGF0dHJpYnV0ZXMgPSAkZWxlbWVudFswXS5hdHRyaWJ1dGVzO1xuICAgICAgZm9yIChpID0gYXR0cmlidXRlcy5sZW5ndGg7IGktLTspIHtcbiAgICAgICAgYXR0cmlidXRlID0gYXR0cmlidXRlc1tpXTtcblxuICAgICAgICBpZiAoYXR0cmlidXRlICYmIGF0dHJpYnV0ZS5zcGVjaWZpZWQgJiYgcmVnZXgudGVzdChhdHRyaWJ1dGUubmFtZSkpIHtcbiAgICAgICAgICBvYmpbdGhpcy5jYW1lbGl6ZShhdHRyaWJ1dGUubmFtZS5zbGljZShuYW1lc3BhY2UubGVuZ3RoKSldID0gdGhpcy5kZXNlcmlhbGl6ZVZhbHVlKGF0dHJpYnV0ZS52YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgY2hlY2tBdHRyOiBmdW5jdGlvbiBjaGVja0F0dHIoJGVsZW1lbnQsIG5hbWVzcGFjZSwgX2NoZWNrQXR0cikge1xuICAgICAgcmV0dXJuICRlbGVtZW50LmlzKCdbJyArIG5hbWVzcGFjZSArIF9jaGVja0F0dHIgKyAnXScpO1xuICAgIH0sXG5cbiAgICBzZXRBdHRyOiBmdW5jdGlvbiBzZXRBdHRyKCRlbGVtZW50LCBuYW1lc3BhY2UsIGF0dHIsIHZhbHVlKSB7XG4gICAgICAkZWxlbWVudFswXS5zZXRBdHRyaWJ1dGUodGhpcy5kYXNoZXJpemUobmFtZXNwYWNlICsgYXR0ciksIFN0cmluZyh2YWx1ZSkpO1xuICAgIH0sXG5cbiAgICBnZW5lcmF0ZUlEOiBmdW5jdGlvbiBnZW5lcmF0ZUlEKCkge1xuICAgICAgcmV0dXJuICcnICsgZ2xvYmFsSUQrKztcbiAgICB9LFxuXG4gICAgLyoqIFRoaXJkIHBhcnR5IGZ1bmN0aW9ucyAqKi9cbiAgICAvLyBaZXB0byBkZXNlcmlhbGl6ZSBmdW5jdGlvblxuICAgIGRlc2VyaWFsaXplVmFsdWU6IGZ1bmN0aW9uIGRlc2VyaWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICAgIHZhciBudW07XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlID09IFwidHJ1ZVwiIHx8ICh2YWx1ZSA9PSBcImZhbHNlXCIgPyBmYWxzZSA6IHZhbHVlID09IFwibnVsbFwiID8gbnVsbCA6ICFpc05hTihudW0gPSBOdW1iZXIodmFsdWUpKSA/IG51bSA6IC9eW1xcW1xce10vLnRlc3QodmFsdWUpID8gJC5wYXJzZUpTT04odmFsdWUpIDogdmFsdWUpIDogdmFsdWU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gWmVwdG8gY2FtZWxpemUgZnVuY3Rpb25cbiAgICBjYW1lbGl6ZTogZnVuY3Rpb24gY2FtZWxpemUoc3RyKSB7XG4gICAgICByZXR1cm4gc3RyLnJlcGxhY2UoLy0rKC4pPy9nLCBmdW5jdGlvbiAobWF0Y2gsIGNocikge1xuICAgICAgICByZXR1cm4gY2hyID8gY2hyLnRvVXBwZXJDYXNlKCkgOiAnJztcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBaZXB0byBkYXNoZXJpemUgZnVuY3Rpb25cbiAgICBkYXNoZXJpemU6IGZ1bmN0aW9uIGRhc2hlcml6ZShzdHIpIHtcbiAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvOjovZywgJy8nKS5yZXBsYWNlKC8oW0EtWl0rKShbQS1aXVthLXpdKS9nLCAnJDFfJDInKS5yZXBsYWNlKC8oW2EtelxcZF0pKFtBLVpdKS9nLCAnJDFfJDInKS5yZXBsYWNlKC9fL2csICctJykudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuXG4gICAgd2FybjogZnVuY3Rpb24gd2FybigpIHtcbiAgICAgIHZhciBfd2luZG93JGNvbnNvbGU7XG5cbiAgICAgIGlmICh3aW5kb3cuY29uc29sZSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2Ygd2luZG93LmNvbnNvbGUud2FybikgKF93aW5kb3ckY29uc29sZSA9IHdpbmRvdy5jb25zb2xlKS53YXJuLmFwcGx5KF93aW5kb3ckY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgd2Fybk9uY2U6IGZ1bmN0aW9uIHdhcm5PbmNlKG1zZykge1xuICAgICAgaWYgKCFwYXN0V2FybmluZ3NbbXNnXSkge1xuICAgICAgICBwYXN0V2FybmluZ3NbbXNnXSA9IHRydWU7XG4gICAgICAgIHRoaXMud2Fybi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBfcmVzZXRXYXJuaW5nczogZnVuY3Rpb24gX3Jlc2V0V2FybmluZ3MoKSB7XG4gICAgICBwYXN0V2FybmluZ3MgPSB7fTtcbiAgICB9LFxuXG4gICAgdHJpbVN0cmluZzogZnVuY3Rpb24gdHJpbVN0cmluZyhzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgIH0sXG5cbiAgICBuYW1lc3BhY2VFdmVudHM6IGZ1bmN0aW9uIG5hbWVzcGFjZUV2ZW50cyhldmVudHMsIG5hbWVzcGFjZSkge1xuICAgICAgZXZlbnRzID0gdGhpcy50cmltU3RyaW5nKGV2ZW50cyB8fCAnJykuc3BsaXQoL1xccysvKTtcbiAgICAgIGlmICghZXZlbnRzWzBdKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gJC5tYXAoZXZlbnRzLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIHJldHVybiBldnQgKyAnLicgKyBuYW1lc3BhY2U7XG4gICAgICB9KS5qb2luKCcgJyk7XG4gICAgfSxcblxuICAgIGRpZmZlcmVuY2U6IGZ1bmN0aW9uIGRpZmZlcmVuY2UoYXJyYXksIHJlbW92ZSkge1xuICAgICAgLy8gVGhpcyBpcyBPKE5eMiksIHNob3VsZCBiZSBvcHRpbWl6ZWRcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICQuZWFjaChhcnJheSwgZnVuY3Rpb24gKF8sIGVsZW0pIHtcbiAgICAgICAgaWYgKHJlbW92ZS5pbmRleE9mKGVsZW0pID09IC0xKSByZXN1bHQucHVzaChlbGVtKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLy8gQWx0ZXItZWdvIHRvIG5hdGl2ZSBQcm9taXNlLmFsbCwgYnV0IGZvciBqUXVlcnlcbiAgICBhbGw6IGZ1bmN0aW9uIGFsbChwcm9taXNlcykge1xuICAgICAgLy8galF1ZXJ5IHRyZWF0cyAkLndoZW4oKSBhbmQgJC53aGVuKHNpbmdsZVByb21pc2UpIGRpZmZlcmVudGx5OyBsZXQncyBhdm9pZCB0aGF0IGFuZCBhZGQgc3B1cmlvdXMgZWxlbWVudHNcbiAgICAgIHJldHVybiAkLndoZW4uYXBwbHkoJCwgX3RvQ29uc3VtYWJsZUFycmF5KHByb21pc2VzKS5jb25jYXQoWzQyLCA0Ml0pKTtcbiAgICB9LFxuXG4gICAgLy8gT2JqZWN0LmNyZWF0ZSBwb2x5ZmlsbCwgc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9jcmVhdGUjUG9seWZpbGxcbiAgICBvYmplY3RDcmVhdGU6IE9iamVjdC5jcmVhdGUgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBPYmplY3QgPSBmdW5jdGlvbiBPYmplY3QoKSB7fTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAocHJvdG90eXBlKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdTZWNvbmQgYXJndW1lbnQgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG90eXBlICE9ICdvYmplY3QnKSB7XG4gICAgICAgICAgdGhyb3cgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgT2JqZWN0KCk7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICB9KSgpLFxuXG4gICAgX1N1Ym1pdFNlbGVjdG9yOiAnaW5wdXRbdHlwZT1cInN1Ym1pdFwiXSwgYnV0dG9uOnN1Ym1pdCdcbiAgfTtcblxuICB2YXIgUGFyc2xleVV0aWxzX19kZWZhdWx0ID0gUGFyc2xleVV0aWxzX19QYXJzbGV5VXRpbHM7XG5cbiAgLy8gQWxsIHRoZXNlIG9wdGlvbnMgY291bGQgYmUgb3ZlcnJpZGVuIGFuZCBzcGVjaWZpZWQgZGlyZWN0bHkgaW4gRE9NIHVzaW5nXG4gIC8vIGBkYXRhLXBhcnNsZXktYCBkZWZhdWx0IERPTS1BUElcbiAgLy8gZWc6IGBpbnB1dHNgIGNhbiBiZSBzZXQgaW4gRE9NIHVzaW5nIGBkYXRhLXBhcnNsZXktaW5wdXRzPVwiaW5wdXQsIHRleHRhcmVhXCJgXG4gIC8vIGVnOiBgZGF0YS1wYXJzbGV5LXN0b3Atb24tZmlyc3QtZmFpbGluZy1jb25zdHJhaW50PVwiZmFsc2VcImBcblxuICB2YXIgUGFyc2xleURlZmF1bHRzID0ge1xuICAgIC8vICMjIyBHZW5lcmFsXG5cbiAgICAvLyBEZWZhdWx0IGRhdGEtbmFtZXNwYWNlIGZvciBET00gQVBJXG4gICAgbmFtZXNwYWNlOiAnZGF0YS1wYXJzbGV5LScsXG5cbiAgICAvLyBTdXBwb3J0ZWQgaW5wdXRzIGJ5IGRlZmF1bHRcbiAgICBpbnB1dHM6ICdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCcsXG5cbiAgICAvLyBFeGNsdWRlZCBpbnB1dHMgYnkgZGVmYXVsdFxuICAgIGV4Y2x1ZGVkOiAnaW5wdXRbdHlwZT1idXR0b25dLCBpbnB1dFt0eXBlPXN1Ym1pdF0sIGlucHV0W3R5cGU9cmVzZXRdLCBpbnB1dFt0eXBlPWhpZGRlbl0nLFxuXG4gICAgLy8gU3RvcCB2YWxpZGF0aW5nIGZpZWxkIG9uIGhpZ2hlc3QgcHJpb3JpdHkgZmFpbGluZyBjb25zdHJhaW50XG4gICAgcHJpb3JpdHlFbmFibGVkOiB0cnVlLFxuXG4gICAgLy8gIyMjIEZpZWxkIG9ubHlcblxuICAgIC8vIGlkZW50aWZpZXIgdXNlZCB0byBncm91cCB0b2dldGhlciBpbnB1dHMgKGUuZy4gcmFkaW8gYnV0dG9ucy4uLilcbiAgICBtdWx0aXBsZTogbnVsbCxcblxuICAgIC8vIGlkZW50aWZpZXIgKG9yIGFycmF5IG9mIGlkZW50aWZpZXJzKSB1c2VkIHRvIHZhbGlkYXRlIG9ubHkgYSBzZWxlY3QgZ3JvdXAgb2YgaW5wdXRzXG4gICAgZ3JvdXA6IG51bGwsXG5cbiAgICAvLyAjIyMgVUlcbiAgICAvLyBFbmFibGVcXERpc2FibGUgZXJyb3IgbWVzc2FnZXNcbiAgICB1aUVuYWJsZWQ6IHRydWUsXG5cbiAgICAvLyBLZXkgZXZlbnRzIHRocmVzaG9sZCBiZWZvcmUgdmFsaWRhdGlvblxuICAgIHZhbGlkYXRpb25UaHJlc2hvbGQ6IDMsXG5cbiAgICAvLyBGb2N1c2VkIGZpZWxkIG9uIGZvcm0gdmFsaWRhdGlvbiBlcnJvci4gJ2ZpcnN0J3wnbGFzdCd8J25vbmUnXG4gICAgZm9jdXM6ICdmaXJzdCcsXG5cbiAgICAvLyBldmVudChzKSB0aGF0IHdpbGwgdHJpZ2dlciB2YWxpZGF0aW9uIGJlZm9yZSBmaXJzdCBmYWlsdXJlLiBlZzogYGlucHV0YC4uLlxuICAgIHRyaWdnZXI6IGZhbHNlLFxuXG4gICAgLy8gZXZlbnQocykgdGhhdCB3aWxsIHRyaWdnZXIgdmFsaWRhdGlvbiBhZnRlciBmaXJzdCBmYWlsdXJlLlxuICAgIHRyaWdnZXJBZnRlckZhaWx1cmU6ICdpbnB1dCcsXG5cbiAgICAvLyBDbGFzcyB0aGF0IHdvdWxkIGJlIGFkZGVkIG9uIGV2ZXJ5IGZhaWxpbmcgdmFsaWRhdGlvbiBQYXJzbGV5IGZpZWxkXG4gICAgZXJyb3JDbGFzczogJ3BhcnNsZXktZXJyb3InLFxuXG4gICAgLy8gU2FtZSBmb3Igc3VjY2VzcyB2YWxpZGF0aW9uXG4gICAgc3VjY2Vzc0NsYXNzOiAncGFyc2xleS1zdWNjZXNzJyxcblxuICAgIC8vIFJldHVybiB0aGUgYCRlbGVtZW50YCB0aGF0IHdpbGwgcmVjZWl2ZSB0aGVzZSBhYm92ZSBzdWNjZXNzIG9yIGVycm9yIGNsYXNzZXNcbiAgICAvLyBDb3VsZCBhbHNvIGJlIChhbmQgZ2l2ZW4gZGlyZWN0bHkgZnJvbSBET00pIGEgdmFsaWQgc2VsZWN0b3IgbGlrZSBgJyNkaXYnYFxuICAgIGNsYXNzSGFuZGxlcjogZnVuY3Rpb24gY2xhc3NIYW5kbGVyKFBhcnNsZXlGaWVsZCkge30sXG5cbiAgICAvLyBSZXR1cm4gdGhlIGAkZWxlbWVudGAgd2hlcmUgZXJyb3JzIHdpbGwgYmUgYXBwZW5kZWRcbiAgICAvLyBDb3VsZCBhbHNvIGJlIChhbmQgZ2l2ZW4gZGlyZWN0bHkgZnJvbSBET00pIGEgdmFsaWQgc2VsZWN0b3IgbGlrZSBgJyNkaXYnYFxuICAgIGVycm9yc0NvbnRhaW5lcjogZnVuY3Rpb24gZXJyb3JzQ29udGFpbmVyKFBhcnNsZXlGaWVsZCkge30sXG5cbiAgICAvLyB1bCBlbGVtIHRoYXQgd291bGQgcmVjZWl2ZSBlcnJvcnMnIGxpc3RcbiAgICBlcnJvcnNXcmFwcGVyOiAnPHVsIGNsYXNzPVwicGFyc2xleS1lcnJvcnMtbGlzdFwiPjwvdWw+JyxcblxuICAgIC8vIGxpIGVsZW0gdGhhdCB3b3VsZCByZWNlaXZlIGVycm9yIG1lc3NhZ2VcbiAgICBlcnJvclRlbXBsYXRlOiAnPGxpPjwvbGk+J1xuICB9O1xuXG4gIHZhciBQYXJzbGV5QWJzdHJhY3QgPSBmdW5jdGlvbiBQYXJzbGV5QWJzdHJhY3QoKSB7XG4gICAgdGhpcy5fX2lkX18gPSBQYXJzbGV5VXRpbHNfX2RlZmF1bHQuZ2VuZXJhdGVJRCgpO1xuICB9O1xuXG4gIFBhcnNsZXlBYnN0cmFjdC5wcm90b3R5cGUgPSB7XG4gICAgYXN5bmNTdXBwb3J0OiB0cnVlLCAvLyBEZXByZWNhdGVkXG5cbiAgICBfcGlwZUFjY29yZGluZ1RvVmFsaWRhdGlvblJlc3VsdDogZnVuY3Rpb24gX3BpcGVBY2NvcmRpbmdUb1ZhbGlkYXRpb25SZXN1bHQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgcGlwZSA9IGZ1bmN0aW9uIHBpcGUoKSB7XG4gICAgICAgIHZhciByID0gJC5EZWZlcnJlZCgpO1xuICAgICAgICBpZiAodHJ1ZSAhPT0gX3RoaXMudmFsaWRhdGlvblJlc3VsdCkgci5yZWplY3QoKTtcbiAgICAgICAgcmV0dXJuIHIucmVzb2x2ZSgpLnByb21pc2UoKTtcbiAgICAgIH07XG4gICAgICByZXR1cm4gW3BpcGUsIHBpcGVdO1xuICAgIH0sXG5cbiAgICBhY3R1YWxpemVPcHRpb25zOiBmdW5jdGlvbiBhY3R1YWxpemVPcHRpb25zKCkge1xuICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0LmF0dHIodGhpcy4kZWxlbWVudCwgdGhpcy5vcHRpb25zLm5hbWVzcGFjZSwgdGhpcy5kb21PcHRpb25zKTtcbiAgICAgIGlmICh0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5hY3R1YWxpemVPcHRpb25zKSB0aGlzLnBhcmVudC5hY3R1YWxpemVPcHRpb25zKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3Jlc2V0T3B0aW9uczogZnVuY3Rpb24gX3Jlc2V0T3B0aW9ucyhpbml0T3B0aW9ucykge1xuICAgICAgdGhpcy5kb21PcHRpb25zID0gUGFyc2xleVV0aWxzX19kZWZhdWx0Lm9iamVjdENyZWF0ZSh0aGlzLnBhcmVudC5vcHRpb25zKTtcbiAgICAgIHRoaXMub3B0aW9ucyA9IFBhcnNsZXlVdGlsc19fZGVmYXVsdC5vYmplY3RDcmVhdGUodGhpcy5kb21PcHRpb25zKTtcbiAgICAgIC8vIFNoYWxsb3cgY29weSBvZiBvd25Qcm9wZXJ0aWVzIG9mIGluaXRPcHRpb25zOlxuICAgICAgZm9yICh2YXIgaSBpbiBpbml0T3B0aW9ucykge1xuICAgICAgICBpZiAoaW5pdE9wdGlvbnMuaGFzT3duUHJvcGVydHkoaSkpIHRoaXMub3B0aW9uc1tpXSA9IGluaXRPcHRpb25zW2ldO1xuICAgICAgfVxuICAgICAgdGhpcy5hY3R1YWxpemVPcHRpb25zKCk7XG4gICAgfSxcblxuICAgIF9saXN0ZW5lcnM6IG51bGwsXG5cbiAgICAvLyBSZWdpc3RlciBhIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gZXZlbnQgbmFtZVxuICAgIC8vIENhbGxiYWNrIGlzIGNhbGxlZCB3aXRoIGNvbnRleHQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCB0aGUgYHRoaXNgXG4gICAgLy8gVGhlIGNvbnRleHQgaXMgdGhlIGN1cnJlbnQgcGFyc2xleSBpbnN0YW5jZSwgb3Igd2luZG93LlBhcnNsZXkgaWYgZ2xvYmFsXG4gICAgLy8gQSByZXR1cm4gdmFsdWUgb2YgYGZhbHNlYCB3aWxsIGludGVycnVwdCB0aGUgY2FsbHNcbiAgICBvbjogZnVuY3Rpb24gb24obmFtZSwgZm4pIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycyB8fCB7fTtcbiAgICAgIHZhciBxdWV1ZSA9IHRoaXMuX2xpc3RlbmVyc1tuYW1lXSA9IHRoaXMuX2xpc3RlbmVyc1tuYW1lXSB8fCBbXTtcbiAgICAgIHF1ZXVlLnB1c2goZm4pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRGVwcmVjYXRlZC4gVXNlIGBvbmAgaW5zdGVhZFxuICAgIHN1YnNjcmliZTogZnVuY3Rpb24gc3Vic2NyaWJlKG5hbWUsIGZuKSB7XG4gICAgICAkLmxpc3RlblRvKHRoaXMsIG5hbWUudG9Mb3dlckNhc2UoKSwgZm4pO1xuICAgIH0sXG5cbiAgICAvLyBVbnJlZ2lzdGVyIGEgY2FsbGJhY2sgKG9yIGFsbCBpZiBub25lIGlzIGdpdmVuKSBmb3IgdGhlIGdpdmVuIGV2ZW50IG5hbWVcbiAgICBvZmY6IGZ1bmN0aW9uIG9mZihuYW1lLCBmbikge1xuICAgICAgdmFyIHF1ZXVlID0gdGhpcy5fbGlzdGVuZXJzICYmIHRoaXMuX2xpc3RlbmVyc1tuYW1lXTtcbiAgICAgIGlmIChxdWV1ZSkge1xuICAgICAgICBpZiAoIWZuKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gcXVldWUubGVuZ3RoOyBpLS07KSBpZiAocXVldWVbaV0gPT09IGZuKSBxdWV1ZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBEZXByZWNhdGVkLiBVc2UgYG9mZmBcbiAgICB1bnN1YnNjcmliZTogZnVuY3Rpb24gdW5zdWJzY3JpYmUobmFtZSwgZm4pIHtcbiAgICAgICQudW5zdWJzY3JpYmVUbyh0aGlzLCBuYW1lLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0sXG5cbiAgICAvLyBUcmlnZ2VyIGFuIGV2ZW50IG9mIHRoZSBnaXZlbiBuYW1lXG4gICAgLy8gQSByZXR1cm4gdmFsdWUgb2YgYGZhbHNlYCBpbnRlcnJ1cHRzIHRoZSBjYWxsYmFjayBjaGFpblxuICAgIC8vIFJldHVybnMgZmFsc2UgaWYgZXhlY3V0aW9uIHdhcyBpbnRlcnJ1cHRlZFxuICAgIHRyaWdnZXI6IGZ1bmN0aW9uIHRyaWdnZXIobmFtZSwgdGFyZ2V0LCBleHRyYUFyZykge1xuICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHRoaXM7XG4gICAgICB2YXIgcXVldWUgPSB0aGlzLl9saXN0ZW5lcnMgJiYgdGhpcy5fbGlzdGVuZXJzW25hbWVdO1xuICAgICAgdmFyIHJlc3VsdDtcbiAgICAgIHZhciBwYXJlbnRSZXN1bHQ7XG4gICAgICBpZiAocXVldWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHF1ZXVlLmxlbmd0aDsgaS0tOykge1xuICAgICAgICAgIHJlc3VsdCA9IHF1ZXVlW2ldLmNhbGwodGFyZ2V0LCB0YXJnZXQsIGV4dHJhQXJnKTtcbiAgICAgICAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudC50cmlnZ2VyKG5hbWUsIHRhcmdldCwgZXh0cmFBcmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8vIFJlc2V0IFVJXG4gICAgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgLy8gRmllbGQgY2FzZToganVzdCBlbWl0IGEgcmVzZXQgZXZlbnQgZm9yIFVJXG4gICAgICBpZiAoJ1BhcnNsZXlGb3JtJyAhPT0gdGhpcy5fX2NsYXNzX18pIHtcbiAgICAgICAgdGhpcy5fcmVzZXRVSSgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fdHJpZ2dlcigncmVzZXQnKTtcbiAgICAgIH1cblxuICAgICAgLy8gRm9ybSBjYXNlOiBlbWl0IGEgcmVzZXQgZXZlbnQgZm9yIGVhY2ggZmllbGRcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5maWVsZHMubGVuZ3RoOyBpKyspIHRoaXMuZmllbGRzW2ldLnJlc2V0KCk7XG5cbiAgICAgIHRoaXMuX3RyaWdnZXIoJ3Jlc2V0Jyk7XG4gICAgfSxcblxuICAgIC8vIERlc3Ryb3kgUGFyc2xleSBpbnN0YW5jZSAoKyBVSSlcbiAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgLy8gRmllbGQgY2FzZTogZW1pdCBkZXN0cm95IGV2ZW50IHRvIGNsZWFuIFVJIGFuZCB0aGVuIGRlc3Ryb3kgc3RvcmVkIGluc3RhbmNlXG4gICAgICB0aGlzLl9kZXN0cm95VUkoKTtcbiAgICAgIGlmICgnUGFyc2xleUZvcm0nICE9PSB0aGlzLl9fY2xhc3NfXykge1xuICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZURhdGEoJ1BhcnNsZXknKTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdQYXJzbGV5RmllbGRNdWx0aXBsZScpO1xuICAgICAgICB0aGlzLl90cmlnZ2VyKCdkZXN0cm95Jyk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBGb3JtIGNhc2U6IGRlc3Ryb3kgYWxsIGl0cyBmaWVsZHMgYW5kIHRoZW4gZGVzdHJveSBzdG9yZWQgaW5zdGFuY2VcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5maWVsZHMubGVuZ3RoOyBpKyspIHRoaXMuZmllbGRzW2ldLmRlc3Ryb3koKTtcblxuICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVEYXRhKCdQYXJzbGV5Jyk7XG4gICAgICB0aGlzLl90cmlnZ2VyKCdkZXN0cm95Jyk7XG4gICAgfSxcblxuICAgIGFzeW5jSXNWYWxpZDogZnVuY3Rpb24gYXN5bmNJc1ZhbGlkKGdyb3VwLCBmb3JjZSkge1xuICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm5PbmNlKFwiYXN5bmNJc1ZhbGlkIGlzIGRlcHJlY2F0ZWQ7IHBsZWFzZSB1c2Ugd2hlblZhbGlkIGluc3RlYWRcIik7XG4gICAgICByZXR1cm4gdGhpcy53aGVuVmFsaWQoeyBncm91cDogZ3JvdXAsIGZvcmNlOiBmb3JjZSB9KTtcbiAgICB9LFxuXG4gICAgX2ZpbmRSZWxhdGVkOiBmdW5jdGlvbiBfZmluZFJlbGF0ZWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLm11bHRpcGxlID8gdGhpcy5wYXJlbnQuJGVsZW1lbnQuZmluZCgnWycgKyB0aGlzLm9wdGlvbnMubmFtZXNwYWNlICsgJ211bHRpcGxlPVwiJyArIHRoaXMub3B0aW9ucy5tdWx0aXBsZSArICdcIl0nKSA6IHRoaXMuJGVsZW1lbnQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciByZXF1aXJlbWVudENvbnZlcnRlcnMgPSB7XG4gICAgc3RyaW5nOiBmdW5jdGlvbiBzdHJpbmcoX3N0cmluZykge1xuICAgICAgcmV0dXJuIF9zdHJpbmc7XG4gICAgfSxcbiAgICBpbnRlZ2VyOiBmdW5jdGlvbiBpbnRlZ2VyKHN0cmluZykge1xuICAgICAgaWYgKGlzTmFOKHN0cmluZykpIHRocm93ICdSZXF1aXJlbWVudCBpcyBub3QgYW4gaW50ZWdlcjogXCInICsgc3RyaW5nICsgJ1wiJztcbiAgICAgIHJldHVybiBwYXJzZUludChzdHJpbmcsIDEwKTtcbiAgICB9LFxuICAgIG51bWJlcjogZnVuY3Rpb24gbnVtYmVyKHN0cmluZykge1xuICAgICAgaWYgKGlzTmFOKHN0cmluZykpIHRocm93ICdSZXF1aXJlbWVudCBpcyBub3QgYSBudW1iZXI6IFwiJyArIHN0cmluZyArICdcIic7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHJpbmcpO1xuICAgIH0sXG4gICAgcmVmZXJlbmNlOiBmdW5jdGlvbiByZWZlcmVuY2Uoc3RyaW5nKSB7XG4gICAgICAvLyBVbnVzZWQgZm9yIG5vd1xuICAgICAgdmFyIHJlc3VsdCA9ICQoc3RyaW5nKTtcbiAgICAgIGlmIChyZXN1bHQubGVuZ3RoID09PSAwKSB0aHJvdyAnTm8gc3VjaCByZWZlcmVuY2U6IFwiJyArIHN0cmluZyArICdcIic7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sXG4gICAgYm9vbGVhbjogZnVuY3Rpb24gYm9vbGVhbihzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcgIT09ICdmYWxzZSc7XG4gICAgfSxcbiAgICBvYmplY3Q6IGZ1bmN0aW9uIG9iamVjdChzdHJpbmcpIHtcbiAgICAgIHJldHVybiBQYXJzbGV5VXRpbHNfX2RlZmF1bHQuZGVzZXJpYWxpemVWYWx1ZShzdHJpbmcpO1xuICAgIH0sXG4gICAgcmVnZXhwOiBmdW5jdGlvbiByZWdleHAoX3JlZ2V4cCkge1xuICAgICAgdmFyIGZsYWdzID0gJyc7XG5cbiAgICAgIC8vIFRlc3QgaWYgUmVnRXhwIGlzIGxpdGVyYWwsIGlmIG5vdCwgbm90aGluZyB0byBiZSBkb25lLCBvdGhlcndpc2UsIHdlIG5lZWQgdG8gaXNvbGF0ZSBmbGFncyBhbmQgcGF0dGVyblxuICAgICAgaWYgKC9eXFwvLipcXC8oPzpbZ2lteV0qKSQvLnRlc3QoX3JlZ2V4cCkpIHtcbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgcmVnZXhwIGxpdGVyYWwgc3RyaW5nIHdpdGggdGhlIGZpcnN0IG1hdGNoIGdyb3VwOiAoW2dpbXldKilcbiAgICAgICAgLy8gSWYgbm8gZmxhZyBpcyBwcmVzZW50LCB0aGlzIHdpbGwgYmUgYSBibGFuayBzdHJpbmdcbiAgICAgICAgZmxhZ3MgPSBfcmVnZXhwLnJlcGxhY2UoLy4qXFwvKFtnaW15XSopJC8sICckMScpO1xuICAgICAgICAvLyBBZ2FpbiwgcmVwbGFjZSB0aGUgcmVnZXhwIGxpdGVyYWwgc3RyaW5nIHdpdGggdGhlIGZpcnN0IG1hdGNoIGdyb3VwOlxuICAgICAgICAvLyBldmVyeXRoaW5nIGV4Y2x1ZGluZyB0aGUgb3BlbmluZyBhbmQgY2xvc2luZyBzbGFzaGVzIGFuZCB0aGUgZmxhZ3NcbiAgICAgICAgX3JlZ2V4cCA9IF9yZWdleHAucmVwbGFjZShuZXcgUmVnRXhwKCdeLyguKj8pLycgKyBmbGFncyArICckJyksICckMScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQW5jaG9yIHJlZ2V4cDpcbiAgICAgICAgX3JlZ2V4cCA9ICdeJyArIF9yZWdleHAgKyAnJCc7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChfcmVnZXhwLCBmbGFncyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBjb252ZXJ0QXJyYXlSZXF1aXJlbWVudCA9IGZ1bmN0aW9uIGNvbnZlcnRBcnJheVJlcXVpcmVtZW50KHN0cmluZywgbGVuZ3RoKSB7XG4gICAgdmFyIG0gPSBzdHJpbmcubWF0Y2goL15cXHMqXFxbKC4qKVxcXVxccyokLyk7XG4gICAgaWYgKCFtKSB0aHJvdyAnUmVxdWlyZW1lbnQgaXMgbm90IGFuIGFycmF5OiBcIicgKyBzdHJpbmcgKyAnXCInO1xuICAgIHZhciB2YWx1ZXMgPSBtWzFdLnNwbGl0KCcsJykubWFwKFBhcnNsZXlVdGlsc19fZGVmYXVsdC50cmltU3RyaW5nKTtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCAhPT0gbGVuZ3RoKSB0aHJvdyAnUmVxdWlyZW1lbnQgaGFzICcgKyB2YWx1ZXMubGVuZ3RoICsgJyB2YWx1ZXMgd2hlbiAnICsgbGVuZ3RoICsgJyBhcmUgbmVlZGVkJztcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIHZhciBjb252ZXJ0UmVxdWlyZW1lbnQgPSBmdW5jdGlvbiBjb252ZXJ0UmVxdWlyZW1lbnQocmVxdWlyZW1lbnRUeXBlLCBzdHJpbmcpIHtcbiAgICB2YXIgY29udmVydGVyID0gcmVxdWlyZW1lbnRDb252ZXJ0ZXJzW3JlcXVpcmVtZW50VHlwZSB8fCAnc3RyaW5nJ107XG4gICAgaWYgKCFjb252ZXJ0ZXIpIHRocm93ICdVbmtub3duIHJlcXVpcmVtZW50IHNwZWNpZmljYXRpb246IFwiJyArIHJlcXVpcmVtZW50VHlwZSArICdcIic7XG4gICAgcmV0dXJuIGNvbnZlcnRlcihzdHJpbmcpO1xuICB9O1xuXG4gIHZhciBjb252ZXJ0RXh0cmFPcHRpb25SZXF1aXJlbWVudCA9IGZ1bmN0aW9uIGNvbnZlcnRFeHRyYU9wdGlvblJlcXVpcmVtZW50KHJlcXVpcmVtZW50U3BlYywgc3RyaW5nLCBleHRyYU9wdGlvblJlYWRlcikge1xuICAgIHZhciBtYWluID0gbnVsbDtcbiAgICB2YXIgZXh0cmEgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gcmVxdWlyZW1lbnRTcGVjKSB7XG4gICAgICBpZiAoa2V5KSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGV4dHJhT3B0aW9uUmVhZGVyKGtleSk7XG4gICAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHZhbHVlKSB2YWx1ZSA9IGNvbnZlcnRSZXF1aXJlbWVudChyZXF1aXJlbWVudFNwZWNba2V5XSwgdmFsdWUpO1xuICAgICAgICBleHRyYVtrZXldID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYWluID0gY29udmVydFJlcXVpcmVtZW50KHJlcXVpcmVtZW50U3BlY1trZXldLCBzdHJpbmcpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW21haW4sIGV4dHJhXTtcbiAgfTtcblxuICAvLyBBIFZhbGlkYXRvciBuZWVkcyB0byBpbXBsZW1lbnQgdGhlIG1ldGhvZHMgYHZhbGlkYXRlYCBhbmQgYHBhcnNlUmVxdWlyZW1lbnRzYFxuXG4gIHZhciBQYXJzbGV5VmFsaWRhdG9yID0gZnVuY3Rpb24gUGFyc2xleVZhbGlkYXRvcihzcGVjKSB7XG4gICAgJC5leHRlbmQodHJ1ZSwgdGhpcywgc3BlYyk7XG4gIH07XG5cbiAgUGFyc2xleVZhbGlkYXRvci5wcm90b3R5cGUgPSB7XG4gICAgLy8gUmV0dXJucyBgdHJ1ZWAgaWZmIHRoZSBnaXZlbiBgdmFsdWVgIGlzIHZhbGlkIGFjY29yZGluZyB0aGUgZ2l2ZW4gcmVxdWlyZW1lbnRzLlxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZSh2YWx1ZSwgcmVxdWlyZW1lbnRGaXJzdEFyZykge1xuICAgICAgaWYgKHRoaXMuZm4pIHtcbiAgICAgICAgLy8gTGVnYWN5IHN0eWxlIHZhbGlkYXRvclxuXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykgLy8gSWYgbW9yZSBhcmdzIHRoZW4gdmFsdWUsIHJlcXVpcmVtZW50LCBpbnN0YW5jZS4uLlxuICAgICAgICAgIHJlcXVpcmVtZW50Rmlyc3RBcmcgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSwgLTEpOyAvLyBTa2lwIGZpcnN0IGFyZyAodmFsdWUpIGFuZCBsYXN0IChpbnN0YW5jZSksIGNvbWJpbmluZyB0aGUgcmVzdFxuICAgICAgICByZXR1cm4gdGhpcy5mbi5jYWxsKHRoaXMsIHZhbHVlLCByZXF1aXJlbWVudEZpcnN0QXJnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCQuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkYXRlTXVsdGlwbGUpIHRocm93ICdWYWxpZGF0b3IgYCcgKyB0aGlzLm5hbWUgKyAnYCBkb2VzIG5vdCBoYW5kbGUgbXVsdGlwbGUgdmFsdWVzJztcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGVNdWx0aXBsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVOdW1iZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgYXJndW1lbnRzWzBdID0gcGFyc2VGbG9hdChhcmd1bWVudHNbMF0pO1xuICAgICAgICAgIHJldHVybiB0aGlzLnZhbGlkYXRlTnVtYmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVTdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy52YWxpZGF0ZVN0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93ICdWYWxpZGF0b3IgYCcgKyB0aGlzLm5hbWUgKyAnYCBvbmx5IGhhbmRsZXMgbXVsdGlwbGUgdmFsdWVzJztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUGFyc2VzIGByZXF1aXJlbWVudHNgIGludG8gYW4gYXJyYXkgb2YgYXJndW1lbnRzLFxuICAgIC8vIGFjY29yZGluZyB0byBgdGhpcy5yZXF1aXJlbWVudFR5cGVgXG4gICAgcGFyc2VSZXF1aXJlbWVudHM6IGZ1bmN0aW9uIHBhcnNlUmVxdWlyZW1lbnRzKHJlcXVpcmVtZW50cywgZXh0cmFPcHRpb25SZWFkZXIpIHtcbiAgICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIHJlcXVpcmVtZW50cykge1xuICAgICAgICAvLyBBc3N1bWUgcmVxdWlyZW1lbnQgYWxyZWFkeSBwYXJzZWRcbiAgICAgICAgLy8gYnV0IG1ha2Ugc3VyZSB3ZSByZXR1cm4gYW4gYXJyYXlcbiAgICAgICAgcmV0dXJuICQuaXNBcnJheShyZXF1aXJlbWVudHMpID8gcmVxdWlyZW1lbnRzIDogW3JlcXVpcmVtZW50c107XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IHRoaXMucmVxdWlyZW1lbnRUeXBlO1xuICAgICAgaWYgKCQuaXNBcnJheSh0eXBlKSkge1xuICAgICAgICB2YXIgdmFsdWVzID0gY29udmVydEFycmF5UmVxdWlyZW1lbnQocmVxdWlyZW1lbnRzLCB0eXBlLmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB2YWx1ZXNbaV0gPSBjb252ZXJ0UmVxdWlyZW1lbnQodHlwZVtpXSwgdmFsdWVzW2ldKTtcbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0gZWxzZSBpZiAoJC5pc1BsYWluT2JqZWN0KHR5cGUpKSB7XG4gICAgICAgIHJldHVybiBjb252ZXJ0RXh0cmFPcHRpb25SZXF1aXJlbWVudCh0eXBlLCByZXF1aXJlbWVudHMsIGV4dHJhT3B0aW9uUmVhZGVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbY29udmVydFJlcXVpcmVtZW50KHR5cGUsIHJlcXVpcmVtZW50cyldO1xuICAgICAgfVxuICAgIH0sXG4gICAgLy8gRGVmYXVsdHM6XG4gICAgcmVxdWlyZW1lbnRUeXBlOiAnc3RyaW5nJyxcblxuICAgIHByaW9yaXR5OiAyXG5cbiAgfTtcblxuICB2YXIgUGFyc2xleVZhbGlkYXRvclJlZ2lzdHJ5ID0gZnVuY3Rpb24gUGFyc2xleVZhbGlkYXRvclJlZ2lzdHJ5KHZhbGlkYXRvcnMsIGNhdGFsb2cpIHtcbiAgICB0aGlzLl9fY2xhc3NfXyA9ICdQYXJzbGV5VmFsaWRhdG9yUmVnaXN0cnknO1xuXG4gICAgLy8gRGVmYXVsdCBQYXJzbGV5IGxvY2FsZSBpcyBlblxuICAgIHRoaXMubG9jYWxlID0gJ2VuJztcblxuICAgIHRoaXMuaW5pdCh2YWxpZGF0b3JzIHx8IHt9LCBjYXRhbG9nIHx8IHt9KTtcbiAgfTtcblxuICB2YXIgdHlwZVJlZ2V4ZXMgPSB7XG4gICAgZW1haWw6IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKSQvaSxcblxuICAgIC8vIEZvbGxvdyBodHRwczovL3d3dy53My5vcmcvVFIvaHRtbDUvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNmbG9hdGluZy1wb2ludC1udW1iZXJzXG4gICAgbnVtYmVyOiAvXi0/KFxcZCpcXC4pP1xcZCsoZVstK10/XFxkKyk/JC9pLFxuXG4gICAgaW50ZWdlcjogL14tP1xcZCskLyxcblxuICAgIGRpZ2l0czogL15cXGQrJC8sXG5cbiAgICBhbHBoYW51bTogL15cXHcrJC9pLFxuXG4gICAgdXJsOiBuZXcgUmVnRXhwKFwiXlwiICtcbiAgICAvLyBwcm90b2NvbCBpZGVudGlmaWVyXG4gICAgXCIoPzooPzpodHRwcz98ZnRwKTovLyk/XCIgKyAvLyAqKiBtb2Q6IG1ha2Ugc2NoZW1lIG9wdGlvbmFsXG4gICAgLy8gdXNlcjpwYXNzIGF1dGhlbnRpY2F0aW9uXG4gICAgXCIoPzpcXFxcUysoPzo6XFxcXFMqKT9AKT9cIiArIFwiKD86XCIgK1xuICAgIC8vIElQIGFkZHJlc3MgZXhjbHVzaW9uXG4gICAgLy8gcHJpdmF0ZSAmIGxvY2FsIG5ldHdvcmtzXG4gICAgLy8gXCIoPyEoPzoxMHwxMjcpKD86XFxcXC5cXFxcZHsxLDN9KXszfSlcIiArICAgLy8gKiogbW9kOiBhbGxvdyBsb2NhbCBuZXR3b3Jrc1xuICAgIC8vIFwiKD8hKD86MTY5XFxcXC4yNTR8MTkyXFxcXC4xNjgpKD86XFxcXC5cXFxcZHsxLDN9KXsyfSlcIiArICAvLyAqKiBtb2Q6IGFsbG93IGxvY2FsIG5ldHdvcmtzXG4gICAgLy8gXCIoPyExNzJcXFxcLig/OjFbNi05XXwyXFxcXGR8M1swLTFdKSg/OlxcXFwuXFxcXGR7MSwzfSl7Mn0pXCIgKyAgLy8gKiogbW9kOiBhbGxvdyBsb2NhbCBuZXR3b3Jrc1xuICAgIC8vIElQIGFkZHJlc3MgZG90dGVkIG5vdGF0aW9uIG9jdGV0c1xuICAgIC8vIGV4Y2x1ZGVzIGxvb3BiYWNrIG5ldHdvcmsgMC4wLjAuMFxuICAgIC8vIGV4Y2x1ZGVzIHJlc2VydmVkIHNwYWNlID49IDIyNC4wLjAuMFxuICAgIC8vIGV4Y2x1ZGVzIG5ldHdvcmsgJiBicm9hY2FzdCBhZGRyZXNzZXNcbiAgICAvLyAoZmlyc3QgJiBsYXN0IElQIGFkZHJlc3Mgb2YgZWFjaCBjbGFzcylcbiAgICBcIig/OlsxLTldXFxcXGQ/fDFcXFxcZFxcXFxkfDJbMDFdXFxcXGR8MjJbMC0zXSlcIiArIFwiKD86XFxcXC4oPzoxP1xcXFxkezEsMn18MlswLTRdXFxcXGR8MjVbMC01XSkpezJ9XCIgKyBcIig/OlxcXFwuKD86WzEtOV1cXFxcZD98MVxcXFxkXFxcXGR8MlswLTRdXFxcXGR8MjVbMC00XSkpXCIgKyBcInxcIiArXG4gICAgLy8gaG9zdCBuYW1lXG4gICAgJyg/Oig/OlthLXpcXFxcdTAwYTEtXFxcXHVmZmZmMC05XS0qKSpbYS16XFxcXHUwMGExLVxcXFx1ZmZmZjAtOV0rKScgK1xuICAgIC8vIGRvbWFpbiBuYW1lXG4gICAgJyg/OlxcXFwuKD86W2EtelxcXFx1MDBhMS1cXFxcdWZmZmYwLTldLSopKlthLXpcXFxcdTAwYTEtXFxcXHVmZmZmMC05XSspKicgK1xuICAgIC8vIFRMRCBpZGVudGlmaWVyXG4gICAgJyg/OlxcXFwuKD86W2EtelxcXFx1MDBhMS1cXFxcdWZmZmZdezIsfSkpJyArIFwiKVwiICtcbiAgICAvLyBwb3J0IG51bWJlclxuICAgIFwiKD86OlxcXFxkezIsNX0pP1wiICtcbiAgICAvLyByZXNvdXJjZSBwYXRoXG4gICAgXCIoPzovXFxcXFMqKT9cIiArIFwiJFwiLCAnaScpXG4gIH07XG4gIHR5cGVSZWdleGVzLnJhbmdlID0gdHlwZVJlZ2V4ZXMubnVtYmVyO1xuXG4gIC8vIFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDQ1NDU2MC84Mjc5XG4gIHZhciBkZWNpbWFsUGxhY2VzID0gZnVuY3Rpb24gZGVjaW1hbFBsYWNlcyhudW0pIHtcbiAgICB2YXIgbWF0Y2ggPSAoJycgKyBudW0pLm1hdGNoKC8oPzpcXC4oXFxkKykpPyg/OltlRV0oWystXT9cXGQrKSk/JC8pO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5tYXgoMCxcbiAgICAvLyBOdW1iZXIgb2YgZGlnaXRzIHJpZ2h0IG9mIGRlY2ltYWwgcG9pbnQuXG4gICAgKG1hdGNoWzFdID8gbWF0Y2hbMV0ubGVuZ3RoIDogMCkgLSAoXG4gICAgLy8gQWRqdXN0IGZvciBzY2llbnRpZmljIG5vdGF0aW9uLlxuICAgIG1hdGNoWzJdID8gK21hdGNoWzJdIDogMCkpO1xuICB9O1xuXG4gIFBhcnNsZXlWYWxpZGF0b3JSZWdpc3RyeS5wcm90b3R5cGUgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24gaW5pdCh2YWxpZGF0b3JzLCBjYXRhbG9nKSB7XG4gICAgICB0aGlzLmNhdGFsb2cgPSBjYXRhbG9nO1xuICAgICAgLy8gQ29weSBwcm90b3R5cGUncyB2YWxpZGF0b3JzOlxuICAgICAgdGhpcy52YWxpZGF0b3JzID0gJC5leHRlbmQoe30sIHRoaXMudmFsaWRhdG9ycyk7XG5cbiAgICAgIGZvciAodmFyIG5hbWUgaW4gdmFsaWRhdG9ycykgdGhpcy5hZGRWYWxpZGF0b3IobmFtZSwgdmFsaWRhdG9yc1tuYW1lXS5mbiwgdmFsaWRhdG9yc1tuYW1lXS5wcmlvcml0eSk7XG5cbiAgICAgIHdpbmRvdy5QYXJzbGV5LnRyaWdnZXIoJ3BhcnNsZXk6dmFsaWRhdG9yOmluaXQnKTtcbiAgICB9LFxuXG4gICAgLy8gU2V0IG5ldyBtZXNzYWdlcyBsb2NhbGUgaWYgd2UgaGF2ZSBkaWN0aW9uYXJ5IGxvYWRlZCBpbiBQYXJzbGV5Q29uZmlnLmkxOG5cbiAgICBzZXRMb2NhbGU6IGZ1bmN0aW9uIHNldExvY2FsZShsb2NhbGUpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMuY2F0YWxvZ1tsb2NhbGVdKSB0aHJvdyBuZXcgRXJyb3IobG9jYWxlICsgJyBpcyBub3QgYXZhaWxhYmxlIGluIHRoZSBjYXRhbG9nJyk7XG5cbiAgICAgIHRoaXMubG9jYWxlID0gbG9jYWxlO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgbmV3IG1lc3NhZ2VzIGNhdGFsb2cgZm9yIGEgZ2l2ZW4gbG9jYWxlLiBTZXQgbG9jYWxlIGZvciB0aGlzIGNhdGFsb2cgaWYgc2V0ID09PSBgdHJ1ZWBcbiAgICBhZGRDYXRhbG9nOiBmdW5jdGlvbiBhZGRDYXRhbG9nKGxvY2FsZSwgbWVzc2FnZXMsIHNldCkge1xuICAgICAgaWYgKCdvYmplY3QnID09PSB0eXBlb2YgbWVzc2FnZXMpIHRoaXMuY2F0YWxvZ1tsb2NhbGVdID0gbWVzc2FnZXM7XG5cbiAgICAgIGlmICh0cnVlID09PSBzZXQpIHJldHVybiB0aGlzLnNldExvY2FsZShsb2NhbGUpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gQWRkIGEgc3BlY2lmaWMgbWVzc2FnZSBmb3IgYSBnaXZlbiBjb25zdHJhaW50IGluIGEgZ2l2ZW4gbG9jYWxlXG4gICAgYWRkTWVzc2FnZTogZnVuY3Rpb24gYWRkTWVzc2FnZShsb2NhbGUsIG5hbWUsIG1lc3NhZ2UpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMuY2F0YWxvZ1tsb2NhbGVdKSB0aGlzLmNhdGFsb2dbbG9jYWxlXSA9IHt9O1xuXG4gICAgICB0aGlzLmNhdGFsb2dbbG9jYWxlXVtuYW1lXSA9IG1lc3NhZ2U7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBBZGQgbWVzc2FnZXMgZm9yIGEgZ2l2ZW4gbG9jYWxlXG4gICAgYWRkTWVzc2FnZXM6IGZ1bmN0aW9uIGFkZE1lc3NhZ2VzKGxvY2FsZSwgbmFtZU1lc3NhZ2VPYmplY3QpIHtcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gbmFtZU1lc3NhZ2VPYmplY3QpIHRoaXMuYWRkTWVzc2FnZShsb2NhbGUsIG5hbWUsIG5hbWVNZXNzYWdlT2JqZWN0W25hbWVdKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEFkZCBhIG5ldyB2YWxpZGF0b3JcbiAgICAvL1xuICAgIC8vICAgIGFkZFZhbGlkYXRvcignY3VzdG9tJywge1xuICAgIC8vICAgICAgICByZXF1aXJlbWVudFR5cGU6IFsnaW50ZWdlcicsICdpbnRlZ2VyJ10sXG4gICAgLy8gICAgICAgIHZhbGlkYXRlU3RyaW5nOiBmdW5jdGlvbih2YWx1ZSwgZnJvbSwgdG8pIHt9LFxuICAgIC8vICAgICAgICBwcmlvcml0eTogMjIsXG4gICAgLy8gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgLy8gICAgICAgICAgZW46IFwiSGV5LCB0aGF0J3Mgbm8gZ29vZFwiLFxuICAgIC8vICAgICAgICAgIGZyOiBcIkF5ZSBheWUsIHBhcyBib24gZHUgdG91dFwiLFxuICAgIC8vICAgICAgICB9XG4gICAgLy8gICAgfSlcbiAgICAvL1xuICAgIC8vIE9sZCBBUEkgd2FzIGFkZFZhbGlkYXRvcihuYW1lLCBmdW5jdGlvbiwgcHJpb3JpdHkpXG4gICAgLy9cbiAgICBhZGRWYWxpZGF0b3I6IGZ1bmN0aW9uIGFkZFZhbGlkYXRvcihuYW1lLCBhcmcxLCBhcmcyKSB7XG4gICAgICBpZiAodGhpcy52YWxpZGF0b3JzW25hbWVdKSBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2FybignVmFsaWRhdG9yIFwiJyArIG5hbWUgKyAnXCIgaXMgYWxyZWFkeSBkZWZpbmVkLicpO2Vsc2UgaWYgKFBhcnNsZXlEZWZhdWx0cy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2FybignXCInICsgbmFtZSArICdcIiBpcyBhIHJlc3RyaWN0ZWQga2V5d29yZCBhbmQgaXMgbm90IGEgdmFsaWQgdmFsaWRhdG9yIG5hbWUuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9zZXRWYWxpZGF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlVmFsaWRhdG9yOiBmdW5jdGlvbiB1cGRhdGVWYWxpZGF0b3IobmFtZSwgYXJnMSwgYXJnMikge1xuICAgICAgaWYgKCF0aGlzLnZhbGlkYXRvcnNbbmFtZV0pIHtcbiAgICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm4oJ1ZhbGlkYXRvciBcIicgKyBuYW1lICsgJ1wiIGlzIG5vdCBhbHJlYWR5IGRlZmluZWQuJyk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZFZhbGlkYXRvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3NldFZhbGlkYXRvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0sXG5cbiAgICByZW1vdmVWYWxpZGF0b3I6IGZ1bmN0aW9uIHJlbW92ZVZhbGlkYXRvcihuYW1lKSB7XG4gICAgICBpZiAoIXRoaXMudmFsaWRhdG9yc1tuYW1lXSkgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm4oJ1ZhbGlkYXRvciBcIicgKyBuYW1lICsgJ1wiIGlzIG5vdCBkZWZpbmVkLicpO1xuXG4gICAgICBkZWxldGUgdGhpcy52YWxpZGF0b3JzW25hbWVdO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX3NldFZhbGlkYXRvcjogZnVuY3Rpb24gX3NldFZhbGlkYXRvcihuYW1lLCB2YWxpZGF0b3IsIHByaW9yaXR5KSB7XG4gICAgICBpZiAoJ29iamVjdCcgIT09IHR5cGVvZiB2YWxpZGF0b3IpIHtcbiAgICAgICAgLy8gT2xkIHN0eWxlIHZhbGlkYXRvciwgd2l0aCBgZm5gIGFuZCBgcHJpb3JpdHlgXG4gICAgICAgIHZhbGlkYXRvciA9IHtcbiAgICAgICAgICBmbjogdmFsaWRhdG9yLFxuICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKCF2YWxpZGF0b3IudmFsaWRhdGUpIHtcbiAgICAgICAgdmFsaWRhdG9yID0gbmV3IFBhcnNsZXlWYWxpZGF0b3IodmFsaWRhdG9yKTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsaWRhdG9yc1tuYW1lXSA9IHZhbGlkYXRvcjtcblxuICAgICAgZm9yICh2YXIgbG9jYWxlIGluIHZhbGlkYXRvci5tZXNzYWdlcyB8fCB7fSkgdGhpcy5hZGRNZXNzYWdlKGxvY2FsZSwgbmFtZSwgdmFsaWRhdG9yLm1lc3NhZ2VzW2xvY2FsZV0pO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZ2V0RXJyb3JNZXNzYWdlOiBmdW5jdGlvbiBnZXRFcnJvck1lc3NhZ2UoY29uc3RyYWludCkge1xuICAgICAgdmFyIG1lc3NhZ2U7XG5cbiAgICAgIC8vIFR5cGUgY29uc3RyYWludHMgYXJlIGEgYml0IGRpZmZlcmVudCwgd2UgaGF2ZSB0byBtYXRjaCB0aGVpciByZXF1aXJlbWVudHMgdG9vIHRvIGZpbmQgcmlnaHQgZXJyb3IgbWVzc2FnZVxuICAgICAgaWYgKCd0eXBlJyA9PT0gY29uc3RyYWludC5uYW1lKSB7XG4gICAgICAgIHZhciB0eXBlTWVzc2FnZXMgPSB0aGlzLmNhdGFsb2dbdGhpcy5sb2NhbGVdW2NvbnN0cmFpbnQubmFtZV0gfHwge307XG4gICAgICAgIG1lc3NhZ2UgPSB0eXBlTWVzc2FnZXNbY29uc3RyYWludC5yZXF1aXJlbWVudHNdO1xuICAgICAgfSBlbHNlIG1lc3NhZ2UgPSB0aGlzLmZvcm1hdE1lc3NhZ2UodGhpcy5jYXRhbG9nW3RoaXMubG9jYWxlXVtjb25zdHJhaW50Lm5hbWVdLCBjb25zdHJhaW50LnJlcXVpcmVtZW50cyk7XG5cbiAgICAgIHJldHVybiBtZXNzYWdlIHx8IHRoaXMuY2F0YWxvZ1t0aGlzLmxvY2FsZV0uZGVmYXVsdE1lc3NhZ2UgfHwgdGhpcy5jYXRhbG9nLmVuLmRlZmF1bHRNZXNzYWdlO1xuICAgIH0sXG5cbiAgICAvLyBLaW5kIG9mIGxpZ2h0IGBzcHJpbnRmKClgIGltcGxlbWVudGF0aW9uXG4gICAgZm9ybWF0TWVzc2FnZTogZnVuY3Rpb24gZm9ybWF0TWVzc2FnZShzdHJpbmcsIHBhcmFtZXRlcnMpIHtcbiAgICAgIGlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIHBhcmFtZXRlcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwYXJhbWV0ZXJzKSBzdHJpbmcgPSB0aGlzLmZvcm1hdE1lc3NhZ2Uoc3RyaW5nLCBwYXJhbWV0ZXJzW2ldKTtcblxuICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJ3N0cmluZycgPT09IHR5cGVvZiBzdHJpbmcgPyBzdHJpbmcucmVwbGFjZSgvJXMvaSwgcGFyYW1ldGVycykgOiAnJztcbiAgICB9LFxuXG4gICAgLy8gSGVyZSBpcyB0aGUgUGFyc2xleSBkZWZhdWx0IHZhbGlkYXRvcnMgbGlzdC5cbiAgICAvLyBBIHZhbGlkYXRvciBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGtleSB2YWx1ZXM6XG4gICAgLy8gIC0gcHJpb3JpdHk6IGFuIGludGVnZXJcbiAgICAvLyAgLSByZXF1aXJlbWVudDogJ3N0cmluZycgKGRlZmF1bHQpLCAnaW50ZWdlcicsICdudW1iZXInLCAncmVnZXhwJyBvciBhbiBBcnJheSBvZiB0aGVzZVxuICAgIC8vICAtIHZhbGlkYXRlU3RyaW5nLCB2YWxpZGF0ZU11bHRpcGxlLCB2YWxpZGF0ZU51bWJlcjogZnVuY3Rpb25zIHJldHVybmluZyBgdHJ1ZWAsIGBmYWxzZWAgb3IgYSBwcm9taXNlXG4gICAgLy8gQWx0ZXJuYXRpdmVseSwgYSB2YWxpZGF0b3IgY2FuIGJlIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHN1Y2ggYW4gb2JqZWN0XG4gICAgLy9cbiAgICB2YWxpZGF0b3JzOiB7XG4gICAgICBub3RibGFuazoge1xuICAgICAgICB2YWxpZGF0ZVN0cmluZzogZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcodmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gKC9cXFMvLnRlc3QodmFsdWUpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJpb3JpdHk6IDJcbiAgICAgIH0sXG4gICAgICByZXF1aXJlZDoge1xuICAgICAgICB2YWxpZGF0ZU11bHRpcGxlOiBmdW5jdGlvbiB2YWxpZGF0ZU11bHRpcGxlKHZhbHVlcykge1xuICAgICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMDtcbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlKSB7XG4gICAgICAgICAgcmV0dXJuICgvXFxTLy50ZXN0KHZhbHVlKVxuICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgIHByaW9yaXR5OiA1MTJcbiAgICAgIH0sXG4gICAgICB0eXBlOiB7XG4gICAgICAgIHZhbGlkYXRlU3RyaW5nOiBmdW5jdGlvbiB2YWxpZGF0ZVN0cmluZyh2YWx1ZSwgdHlwZSkge1xuICAgICAgICAgIHZhciBfcmVmID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMl07XG5cbiAgICAgICAgICB2YXIgX3JlZiRzdGVwID0gX3JlZi5zdGVwO1xuICAgICAgICAgIHZhciBzdGVwID0gX3JlZiRzdGVwID09PSB1bmRlZmluZWQgPyAnMScgOiBfcmVmJHN0ZXA7XG4gICAgICAgICAgdmFyIF9yZWYkYmFzZSA9IF9yZWYuYmFzZTtcbiAgICAgICAgICB2YXIgYmFzZSA9IF9yZWYkYmFzZSA9PT0gdW5kZWZpbmVkID8gMCA6IF9yZWYkYmFzZTtcblxuICAgICAgICAgIHZhciByZWdleCA9IHR5cGVSZWdleGVzW3R5cGVdO1xuICAgICAgICAgIGlmICghcmVnZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndmFsaWRhdG9yIHR5cGUgYCcgKyB0eXBlICsgJ2AgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXJlZ2V4LnRlc3QodmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgaWYgKCdudW1iZXInID09PSB0eXBlKSB7XG4gICAgICAgICAgICBpZiAoIS9eYW55JC9pLnRlc3Qoc3RlcCB8fCAnJykpIHtcbiAgICAgICAgICAgICAgdmFyIG5iID0gTnVtYmVyKHZhbHVlKTtcbiAgICAgICAgICAgICAgdmFyIGRlY2ltYWxzID0gTWF0aC5tYXgoZGVjaW1hbFBsYWNlcyhzdGVwKSwgZGVjaW1hbFBsYWNlcyhiYXNlKSk7XG4gICAgICAgICAgICAgIGlmIChkZWNpbWFsUGxhY2VzKG5iKSA+IGRlY2ltYWxzKSAvLyBWYWx1ZSBjYW4ndCBoYXZlIHRvbyBtYW55IGRlY2ltYWxzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAvLyBCZSBjYXJlZnVsIG9mIHJvdW5kaW5nIGVycm9ycyBieSB1c2luZyBpbnRlZ2Vycy5cbiAgICAgICAgICAgICAgdmFyIHRvSW50ID0gZnVuY3Rpb24gdG9JbnQoZikge1xuICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKGYgKiBNYXRoLnBvdygxMCwgZGVjaW1hbHMpKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgaWYgKCh0b0ludChuYikgLSB0b0ludChiYXNlKSkgJSB0b0ludChzdGVwKSAhPSAwKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlbWVudFR5cGU6IHtcbiAgICAgICAgICAnJzogJ3N0cmluZycsXG4gICAgICAgICAgc3RlcDogJ3N0cmluZycsXG4gICAgICAgICAgYmFzZTogJ251bWJlcidcbiAgICAgICAgfSxcbiAgICAgICAgcHJpb3JpdHk6IDI1NlxuICAgICAgfSxcbiAgICAgIHBhdHRlcm46IHtcbiAgICAgICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlLCByZWdleHApIHtcbiAgICAgICAgICByZXR1cm4gcmVnZXhwLnRlc3QodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlbWVudFR5cGU6ICdyZWdleHAnLFxuICAgICAgICBwcmlvcml0eTogNjRcbiAgICAgIH0sXG4gICAgICBtaW5sZW5ndGg6IHtcbiAgICAgICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlLCByZXF1aXJlbWVudCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gcmVxdWlyZW1lbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVtZW50VHlwZTogJ2ludGVnZXInLFxuICAgICAgICBwcmlvcml0eTogMzBcbiAgICAgIH0sXG4gICAgICBtYXhsZW5ndGg6IHtcbiAgICAgICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlLCByZXF1aXJlbWVudCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPD0gcmVxdWlyZW1lbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVtZW50VHlwZTogJ2ludGVnZXInLFxuICAgICAgICBwcmlvcml0eTogMzBcbiAgICAgIH0sXG4gICAgICBsZW5ndGg6IHtcbiAgICAgICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlLCBtaW4sIG1heCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGggPj0gbWluICYmIHZhbHVlLmxlbmd0aCA8PSBtYXg7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVtZW50VHlwZTogWydpbnRlZ2VyJywgJ2ludGVnZXInXSxcbiAgICAgICAgcHJpb3JpdHk6IDMwXG4gICAgICB9LFxuICAgICAgbWluY2hlY2s6IHtcbiAgICAgICAgdmFsaWRhdGVNdWx0aXBsZTogZnVuY3Rpb24gdmFsaWRhdGVNdWx0aXBsZSh2YWx1ZXMsIHJlcXVpcmVtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPj0gcmVxdWlyZW1lbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVtZW50VHlwZTogJ2ludGVnZXInLFxuICAgICAgICBwcmlvcml0eTogMzBcbiAgICAgIH0sXG4gICAgICBtYXhjaGVjazoge1xuICAgICAgICB2YWxpZGF0ZU11bHRpcGxlOiBmdW5jdGlvbiB2YWxpZGF0ZU11bHRpcGxlKHZhbHVlcywgcmVxdWlyZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA8PSByZXF1aXJlbWVudDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZW1lbnRUeXBlOiAnaW50ZWdlcicsXG4gICAgICAgIHByaW9yaXR5OiAzMFxuICAgICAgfSxcbiAgICAgIGNoZWNrOiB7XG4gICAgICAgIHZhbGlkYXRlTXVsdGlwbGU6IGZ1bmN0aW9uIHZhbGlkYXRlTXVsdGlwbGUodmFsdWVzLCBtaW4sIG1heCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID49IG1pbiAmJiB2YWx1ZXMubGVuZ3RoIDw9IG1heDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZW1lbnRUeXBlOiBbJ2ludGVnZXInLCAnaW50ZWdlciddLFxuICAgICAgICBwcmlvcml0eTogMzBcbiAgICAgIH0sXG4gICAgICBtaW46IHtcbiAgICAgICAgdmFsaWRhdGVOdW1iZXI6IGZ1bmN0aW9uIHZhbGlkYXRlTnVtYmVyKHZhbHVlLCByZXF1aXJlbWVudCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZSA+PSByZXF1aXJlbWVudDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZW1lbnRUeXBlOiAnbnVtYmVyJyxcbiAgICAgICAgcHJpb3JpdHk6IDMwXG4gICAgICB9LFxuICAgICAgbWF4OiB7XG4gICAgICAgIHZhbGlkYXRlTnVtYmVyOiBmdW5jdGlvbiB2YWxpZGF0ZU51bWJlcih2YWx1ZSwgcmVxdWlyZW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPD0gcmVxdWlyZW1lbnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJlcXVpcmVtZW50VHlwZTogJ251bWJlcicsXG4gICAgICAgIHByaW9yaXR5OiAzMFxuICAgICAgfSxcbiAgICAgIHJhbmdlOiB7XG4gICAgICAgIHZhbGlkYXRlTnVtYmVyOiBmdW5jdGlvbiB2YWxpZGF0ZU51bWJlcih2YWx1ZSwgbWluLCBtYXgpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgPj0gbWluICYmIHZhbHVlIDw9IG1heDtcbiAgICAgICAgfSxcbiAgICAgICAgcmVxdWlyZW1lbnRUeXBlOiBbJ251bWJlcicsICdudW1iZXInXSxcbiAgICAgICAgcHJpb3JpdHk6IDMwXG4gICAgICB9LFxuICAgICAgZXF1YWx0bzoge1xuICAgICAgICB2YWxpZGF0ZVN0cmluZzogZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcodmFsdWUsIHJlZk9yVmFsdWUpIHtcbiAgICAgICAgICB2YXIgJHJlZmVyZW5jZSA9ICQocmVmT3JWYWx1ZSk7XG4gICAgICAgICAgaWYgKCRyZWZlcmVuY2UubGVuZ3RoKSByZXR1cm4gdmFsdWUgPT09ICRyZWZlcmVuY2UudmFsKCk7ZWxzZSByZXR1cm4gdmFsdWUgPT09IHJlZk9yVmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHByaW9yaXR5OiAyNTZcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIFBhcnNsZXlVSSA9IHt9O1xuXG4gIHZhciBkaWZmUmVzdWx0cyA9IGZ1bmN0aW9uIGRpZmZSZXN1bHRzKG5ld1Jlc3VsdCwgb2xkUmVzdWx0LCBkZWVwKSB7XG4gICAgdmFyIGFkZGVkID0gW107XG4gICAgdmFyIGtlcHQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbmV3UmVzdWx0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZm91bmQgPSBmYWxzZTtcblxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBvbGRSZXN1bHQubGVuZ3RoOyBqKyspIGlmIChuZXdSZXN1bHRbaV0uYXNzZXJ0Lm5hbWUgPT09IG9sZFJlc3VsdFtqXS5hc3NlcnQubmFtZSkge1xuICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm91bmQpIGtlcHQucHVzaChuZXdSZXN1bHRbaV0pO2Vsc2UgYWRkZWQucHVzaChuZXdSZXN1bHRbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBrZXB0OiBrZXB0LFxuICAgICAgYWRkZWQ6IGFkZGVkLFxuICAgICAgcmVtb3ZlZDogIWRlZXAgPyBkaWZmUmVzdWx0cyhvbGRSZXN1bHQsIG5ld1Jlc3VsdCwgdHJ1ZSkuYWRkZWQgOiBbXVxuICAgIH07XG4gIH07XG5cbiAgUGFyc2xleVVJLkZvcm0gPSB7XG5cbiAgICBfYWN0dWFsaXplVHJpZ2dlcnM6IGZ1bmN0aW9uIF9hY3R1YWxpemVUcmlnZ2VycygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdzdWJtaXQuUGFyc2xleScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgX3RoaXMyLm9uU3VibWl0VmFsaWRhdGUoZXZ0KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy4kZWxlbWVudC5vbignY2xpY2suUGFyc2xleScsIFBhcnNsZXlVdGlsc19fZGVmYXVsdC5fU3VibWl0U2VsZWN0b3IsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgX3RoaXMyLm9uU3VibWl0QnV0dG9uKGV2dCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gVUkgY291bGQgYmUgZGlzYWJsZWRcbiAgICAgIGlmIChmYWxzZSA9PT0gdGhpcy5vcHRpb25zLnVpRW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ25vdmFsaWRhdGUnLCAnJyk7XG4gICAgfSxcblxuICAgIGZvY3VzOiBmdW5jdGlvbiBmb2N1cygpIHtcbiAgICAgIHRoaXMuX2ZvY3VzZWRGaWVsZCA9IG51bGw7XG5cbiAgICAgIGlmICh0cnVlID09PSB0aGlzLnZhbGlkYXRpb25SZXN1bHQgfHwgJ25vbmUnID09PSB0aGlzLm9wdGlvbnMuZm9jdXMpIHJldHVybiBudWxsO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmllbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBmaWVsZCA9IHRoaXMuZmllbGRzW2ldO1xuICAgICAgICBpZiAodHJ1ZSAhPT0gZmllbGQudmFsaWRhdGlvblJlc3VsdCAmJiBmaWVsZC52YWxpZGF0aW9uUmVzdWx0Lmxlbmd0aCA+IDAgJiYgJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBmaWVsZC5vcHRpb25zLm5vRm9jdXMpIHtcbiAgICAgICAgICB0aGlzLl9mb2N1c2VkRmllbGQgPSBmaWVsZC4kZWxlbWVudDtcbiAgICAgICAgICBpZiAoJ2ZpcnN0JyA9PT0gdGhpcy5vcHRpb25zLmZvY3VzKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAobnVsbCA9PT0gdGhpcy5fZm9jdXNlZEZpZWxkKSByZXR1cm4gbnVsbDtcblxuICAgICAgcmV0dXJuIHRoaXMuX2ZvY3VzZWRGaWVsZC5mb2N1cygpO1xuICAgIH0sXG5cbiAgICBfZGVzdHJveVVJOiBmdW5jdGlvbiBfZGVzdHJveVVJKCkge1xuICAgICAgLy8gUmVzZXQgYWxsIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJy5QYXJzbGV5Jyk7XG4gICAgfVxuXG4gIH07XG5cbiAgUGFyc2xleVVJLkZpZWxkID0ge1xuXG4gICAgX3JlZmxvd1VJOiBmdW5jdGlvbiBfcmVmbG93VUkoKSB7XG4gICAgICB0aGlzLl9idWlsZFVJKCk7XG5cbiAgICAgIC8vIElmIHRoaXMgZmllbGQgZG9lc24ndCBoYXZlIGFuIGFjdGl2ZSBVSSBkb24ndCBib3RoZXIgZG9pbmcgc29tZXRoaW5nXG4gICAgICBpZiAoIXRoaXMuX3VpKSByZXR1cm47XG5cbiAgICAgIC8vIERpZmYgYmV0d2VlbiB0d28gdmFsaWRhdGlvbiByZXN1bHRzXG4gICAgICB2YXIgZGlmZiA9IGRpZmZSZXN1bHRzKHRoaXMudmFsaWRhdGlvblJlc3VsdCwgdGhpcy5fdWkubGFzdFZhbGlkYXRpb25SZXN1bHQpO1xuXG4gICAgICAvLyBUaGVuIHN0b3JlIGN1cnJlbnQgdmFsaWRhdGlvbiByZXN1bHQgZm9yIG5leHQgcmVmbG93XG4gICAgICB0aGlzLl91aS5sYXN0VmFsaWRhdGlvblJlc3VsdCA9IHRoaXMudmFsaWRhdGlvblJlc3VsdDtcblxuICAgICAgLy8gSGFuZGxlIHZhbGlkIC8gaW52YWxpZCAvIG5vbmUgZmllbGQgY2xhc3NcbiAgICAgIHRoaXMuX21hbmFnZVN0YXR1c0NsYXNzKCk7XG5cbiAgICAgIC8vIEFkZCwgcmVtb3ZlLCB1cGRhdGVkIGVycm9ycyBtZXNzYWdlc1xuICAgICAgdGhpcy5fbWFuYWdlRXJyb3JzTWVzc2FnZXMoZGlmZik7XG5cbiAgICAgIC8vIFRyaWdnZXJzIGltcGxcbiAgICAgIHRoaXMuX2FjdHVhbGl6ZVRyaWdnZXJzKCk7XG5cbiAgICAgIC8vIElmIGZpZWxkIGlzIG5vdCB2YWxpZCBmb3IgdGhlIGZpcnN0IHRpbWUsIGJpbmQga2V5dXAgdHJpZ2dlciB0byBlYXNlIFVYIGFuZCBxdWlja2x5IGluZm9ybSB1c2VyXG4gICAgICBpZiAoKGRpZmYua2VwdC5sZW5ndGggfHwgZGlmZi5hZGRlZC5sZW5ndGgpICYmICF0aGlzLl9mYWlsZWRPbmNlKSB7XG4gICAgICAgIHRoaXMuX2ZhaWxlZE9uY2UgPSB0cnVlO1xuICAgICAgICB0aGlzLl9hY3R1YWxpemVUcmlnZ2VycygpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGZpZWxkJ3MgZXJyb3IgbWVzc2FnZShzKVxuICAgIGdldEVycm9yc01lc3NhZ2VzOiBmdW5jdGlvbiBnZXRFcnJvcnNNZXNzYWdlcygpIHtcbiAgICAgIC8vIE5vIGVycm9yIG1lc3NhZ2UsIGZpZWxkIGlzIHZhbGlkXG4gICAgICBpZiAodHJ1ZSA9PT0gdGhpcy52YWxpZGF0aW9uUmVzdWx0KSByZXR1cm4gW107XG5cbiAgICAgIHZhciBtZXNzYWdlcyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudmFsaWRhdGlvblJlc3VsdC5sZW5ndGg7IGkrKykgbWVzc2FnZXMucHVzaCh0aGlzLnZhbGlkYXRpb25SZXN1bHRbaV0uZXJyb3JNZXNzYWdlIHx8IHRoaXMuX2dldEVycm9yTWVzc2FnZSh0aGlzLnZhbGlkYXRpb25SZXN1bHRbaV0uYXNzZXJ0KSk7XG5cbiAgICAgIHJldHVybiBtZXNzYWdlcztcbiAgICB9LFxuXG4gICAgLy8gSXQncyBhIGdvYWwgb2YgUGFyc2xleSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vIGxvbmdlciByZXF1aXJlZCBbIzEwNzNdXG4gICAgYWRkRXJyb3I6IGZ1bmN0aW9uIGFkZEVycm9yKG5hbWUpIHtcbiAgICAgIHZhciBfcmVmMiA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgbWVzc2FnZSA9IF9yZWYyLm1lc3NhZ2U7XG4gICAgICB2YXIgYXNzZXJ0ID0gX3JlZjIuYXNzZXJ0O1xuICAgICAgdmFyIF9yZWYyJHVwZGF0ZUNsYXNzID0gX3JlZjIudXBkYXRlQ2xhc3M7XG4gICAgICB2YXIgdXBkYXRlQ2xhc3MgPSBfcmVmMiR1cGRhdGVDbGFzcyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9yZWYyJHVwZGF0ZUNsYXNzO1xuXG4gICAgICB0aGlzLl9idWlsZFVJKCk7XG4gICAgICB0aGlzLl9hZGRFcnJvcihuYW1lLCB7IG1lc3NhZ2U6IG1lc3NhZ2UsIGFzc2VydDogYXNzZXJ0IH0pO1xuXG4gICAgICBpZiAodXBkYXRlQ2xhc3MpIHRoaXMuX2Vycm9yQ2xhc3MoKTtcbiAgICB9LFxuXG4gICAgLy8gSXQncyBhIGdvYWwgb2YgUGFyc2xleSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vIGxvbmdlciByZXF1aXJlZCBbIzEwNzNdXG4gICAgdXBkYXRlRXJyb3I6IGZ1bmN0aW9uIHVwZGF0ZUVycm9yKG5hbWUpIHtcbiAgICAgIHZhciBfcmVmMyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgbWVzc2FnZSA9IF9yZWYzLm1lc3NhZ2U7XG4gICAgICB2YXIgYXNzZXJ0ID0gX3JlZjMuYXNzZXJ0O1xuICAgICAgdmFyIF9yZWYzJHVwZGF0ZUNsYXNzID0gX3JlZjMudXBkYXRlQ2xhc3M7XG4gICAgICB2YXIgdXBkYXRlQ2xhc3MgPSBfcmVmMyR1cGRhdGVDbGFzcyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9yZWYzJHVwZGF0ZUNsYXNzO1xuXG4gICAgICB0aGlzLl9idWlsZFVJKCk7XG4gICAgICB0aGlzLl91cGRhdGVFcnJvcihuYW1lLCB7IG1lc3NhZ2U6IG1lc3NhZ2UsIGFzc2VydDogYXNzZXJ0IH0pO1xuXG4gICAgICBpZiAodXBkYXRlQ2xhc3MpIHRoaXMuX2Vycm9yQ2xhc3MoKTtcbiAgICB9LFxuXG4gICAgLy8gSXQncyBhIGdvYWwgb2YgUGFyc2xleSB0aGF0IHRoaXMgbWV0aG9kIGlzIG5vIGxvbmdlciByZXF1aXJlZCBbIzEwNzNdXG4gICAgcmVtb3ZlRXJyb3I6IGZ1bmN0aW9uIHJlbW92ZUVycm9yKG5hbWUpIHtcbiAgICAgIHZhciBfcmVmNCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgICB2YXIgX3JlZjQkdXBkYXRlQ2xhc3MgPSBfcmVmNC51cGRhdGVDbGFzcztcbiAgICAgIHZhciB1cGRhdGVDbGFzcyA9IF9yZWY0JHVwZGF0ZUNsYXNzID09PSB1bmRlZmluZWQgPyB0cnVlIDogX3JlZjQkdXBkYXRlQ2xhc3M7XG5cbiAgICAgIHRoaXMuX2J1aWxkVUkoKTtcbiAgICAgIHRoaXMuX3JlbW92ZUVycm9yKG5hbWUpO1xuXG4gICAgICAvLyBlZGdlIGNhc2UgcG9zc2libGUgaGVyZTogcmVtb3ZlIGEgc3RhbmRhcmQgUGFyc2xleSBlcnJvciB0aGF0IGlzIHN0aWxsIGZhaWxpbmcgaW4gdGhpcy52YWxpZGF0aW9uUmVzdWx0XG4gICAgICAvLyBidXQgaGlnaGx5IGltcHJvYmFibGUgY3V6JyBtYW51YWxseSByZW1vdmluZyBhIHdlbGwgUGFyc2xleSBoYW5kbGVkIGVycm9yIG1ha2VzIG5vIHNlbnNlLlxuICAgICAgaWYgKHVwZGF0ZUNsYXNzKSB0aGlzLl9tYW5hZ2VTdGF0dXNDbGFzcygpO1xuICAgIH0sXG5cbiAgICBfbWFuYWdlU3RhdHVzQ2xhc3M6IGZ1bmN0aW9uIF9tYW5hZ2VTdGF0dXNDbGFzcygpIHtcbiAgICAgIGlmICh0aGlzLmhhc0NvbnN0cmFpbnRzKCkgJiYgdGhpcy5uZWVkc1ZhbGlkYXRpb24oKSAmJiB0cnVlID09PSB0aGlzLnZhbGlkYXRpb25SZXN1bHQpIHRoaXMuX3N1Y2Nlc3NDbGFzcygpO2Vsc2UgaWYgKHRoaXMudmFsaWRhdGlvblJlc3VsdC5sZW5ndGggPiAwKSB0aGlzLl9lcnJvckNsYXNzKCk7ZWxzZSB0aGlzLl9yZXNldENsYXNzKCk7XG4gICAgfSxcblxuICAgIF9tYW5hZ2VFcnJvcnNNZXNzYWdlczogZnVuY3Rpb24gX21hbmFnZUVycm9yc01lc3NhZ2VzKGRpZmYpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMub3B0aW9ucy5lcnJvcnNNZXNzYWdlc0Rpc2FibGVkKSByZXR1cm47XG5cbiAgICAgIC8vIENhc2Ugd2hlcmUgd2UgaGF2ZSBlcnJvck1lc3NhZ2Ugb3B0aW9uIHRoYXQgY29uZmlndXJlIGFuIHVuaXF1ZSBmaWVsZCBlcnJvciBtZXNzYWdlLCByZWdhcmRsZXNzIGZhaWxpbmcgdmFsaWRhdG9yc1xuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy5vcHRpb25zLmVycm9yTWVzc2FnZSkge1xuICAgICAgICBpZiAoZGlmZi5hZGRlZC5sZW5ndGggfHwgZGlmZi5rZXB0Lmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuX2luc2VydEVycm9yV3JhcHBlcigpO1xuXG4gICAgICAgICAgaWYgKDAgPT09IHRoaXMuX3VpLiRlcnJvcnNXcmFwcGVyLmZpbmQoJy5wYXJzbGV5LWN1c3RvbS1lcnJvci1tZXNzYWdlJykubGVuZ3RoKSB0aGlzLl91aS4kZXJyb3JzV3JhcHBlci5hcHBlbmQoJCh0aGlzLm9wdGlvbnMuZXJyb3JUZW1wbGF0ZSkuYWRkQ2xhc3MoJ3BhcnNsZXktY3VzdG9tLWVycm9yLW1lc3NhZ2UnKSk7XG5cbiAgICAgICAgICByZXR1cm4gdGhpcy5fdWkuJGVycm9yc1dyYXBwZXIuYWRkQ2xhc3MoJ2ZpbGxlZCcpLmZpbmQoJy5wYXJzbGV5LWN1c3RvbS1lcnJvci1tZXNzYWdlJykuaHRtbCh0aGlzLm9wdGlvbnMuZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl91aS4kZXJyb3JzV3JhcHBlci5yZW1vdmVDbGFzcygnZmlsbGVkJykuZmluZCgnLnBhcnNsZXktY3VzdG9tLWVycm9yLW1lc3NhZ2UnKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvdywgaGlkZSwgdXBkYXRlIGZhaWxpbmcgY29uc3RyYWludHMgbWVzc2FnZXNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlmZi5yZW1vdmVkLmxlbmd0aDsgaSsrKSB0aGlzLl9yZW1vdmVFcnJvcihkaWZmLnJlbW92ZWRbaV0uYXNzZXJ0Lm5hbWUpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgZGlmZi5hZGRlZC5sZW5ndGg7IGkrKykgdGhpcy5fYWRkRXJyb3IoZGlmZi5hZGRlZFtpXS5hc3NlcnQubmFtZSwgeyBtZXNzYWdlOiBkaWZmLmFkZGVkW2ldLmVycm9yTWVzc2FnZSwgYXNzZXJ0OiBkaWZmLmFkZGVkW2ldLmFzc2VydCB9KTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IGRpZmYua2VwdC5sZW5ndGg7IGkrKykgdGhpcy5fdXBkYXRlRXJyb3IoZGlmZi5rZXB0W2ldLmFzc2VydC5uYW1lLCB7IG1lc3NhZ2U6IGRpZmYua2VwdFtpXS5lcnJvck1lc3NhZ2UsIGFzc2VydDogZGlmZi5rZXB0W2ldLmFzc2VydCB9KTtcbiAgICB9LFxuXG4gICAgX2FkZEVycm9yOiBmdW5jdGlvbiBfYWRkRXJyb3IobmFtZSwgX3JlZjUpIHtcbiAgICAgIHZhciBtZXNzYWdlID0gX3JlZjUubWVzc2FnZTtcbiAgICAgIHZhciBhc3NlcnQgPSBfcmVmNS5hc3NlcnQ7XG5cbiAgICAgIHRoaXMuX2luc2VydEVycm9yV3JhcHBlcigpO1xuICAgICAgdGhpcy5fdWkuJGVycm9yc1dyYXBwZXIuYWRkQ2xhc3MoJ2ZpbGxlZCcpLmFwcGVuZCgkKHRoaXMub3B0aW9ucy5lcnJvclRlbXBsYXRlKS5hZGRDbGFzcygncGFyc2xleS0nICsgbmFtZSkuaHRtbChtZXNzYWdlIHx8IHRoaXMuX2dldEVycm9yTWVzc2FnZShhc3NlcnQpKSk7XG4gICAgfSxcblxuICAgIF91cGRhdGVFcnJvcjogZnVuY3Rpb24gX3VwZGF0ZUVycm9yKG5hbWUsIF9yZWY2KSB7XG4gICAgICB2YXIgbWVzc2FnZSA9IF9yZWY2Lm1lc3NhZ2U7XG4gICAgICB2YXIgYXNzZXJ0ID0gX3JlZjYuYXNzZXJ0O1xuXG4gICAgICB0aGlzLl91aS4kZXJyb3JzV3JhcHBlci5hZGRDbGFzcygnZmlsbGVkJykuZmluZCgnLnBhcnNsZXktJyArIG5hbWUpLmh0bWwobWVzc2FnZSB8fCB0aGlzLl9nZXRFcnJvck1lc3NhZ2UoYXNzZXJ0KSk7XG4gICAgfSxcblxuICAgIF9yZW1vdmVFcnJvcjogZnVuY3Rpb24gX3JlbW92ZUVycm9yKG5hbWUpIHtcbiAgICAgIHRoaXMuX3VpLiRlcnJvcnNXcmFwcGVyLnJlbW92ZUNsYXNzKCdmaWxsZWQnKS5maW5kKCcucGFyc2xleS0nICsgbmFtZSkucmVtb3ZlKCk7XG4gICAgfSxcblxuICAgIF9nZXRFcnJvck1lc3NhZ2U6IGZ1bmN0aW9uIF9nZXRFcnJvck1lc3NhZ2UoY29uc3RyYWludCkge1xuICAgICAgdmFyIGN1c3RvbUNvbnN0cmFpbnRFcnJvck1lc3NhZ2UgPSBjb25zdHJhaW50Lm5hbWUgKyAnTWVzc2FnZSc7XG5cbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMub3B0aW9uc1tjdXN0b21Db25zdHJhaW50RXJyb3JNZXNzYWdlXSkgcmV0dXJuIHdpbmRvdy5QYXJzbGV5LmZvcm1hdE1lc3NhZ2UodGhpcy5vcHRpb25zW2N1c3RvbUNvbnN0cmFpbnRFcnJvck1lc3NhZ2VdLCBjb25zdHJhaW50LnJlcXVpcmVtZW50cyk7XG5cbiAgICAgIHJldHVybiB3aW5kb3cuUGFyc2xleS5nZXRFcnJvck1lc3NhZ2UoY29uc3RyYWludCk7XG4gICAgfSxcblxuICAgIF9idWlsZFVJOiBmdW5jdGlvbiBfYnVpbGRVSSgpIHtcbiAgICAgIC8vIFVJIGNvdWxkIGJlIGFscmVhZHkgYnVpbHQgb3IgZGlzYWJsZWRcbiAgICAgIGlmICh0aGlzLl91aSB8fCBmYWxzZSA9PT0gdGhpcy5vcHRpb25zLnVpRW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgICB2YXIgX3VpID0ge307XG5cbiAgICAgIC8vIEdpdmUgZmllbGQgaXRzIFBhcnNsZXkgaWQgaW4gRE9NXG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIodGhpcy5vcHRpb25zLm5hbWVzcGFjZSArICdpZCcsIHRoaXMuX19pZF9fKTtcblxuICAgICAgLyoqIEdlbmVyYXRlIGltcG9ydGFudCBVSSBlbGVtZW50cyBhbmQgc3RvcmUgdGhlbSBpbiB0aGlzICoqL1xuICAgICAgLy8gJGVycm9yQ2xhc3NIYW5kbGVyIGlzIHRoZSAkZWxlbWVudCB0aGF0IHdvdWwgaGF2ZSBwYXJzbGV5LWVycm9yIGFuZCBwYXJzbGV5LXN1Y2Nlc3MgY2xhc3Nlc1xuICAgICAgX3VpLiRlcnJvckNsYXNzSGFuZGxlciA9IHRoaXMuX21hbmFnZUNsYXNzSGFuZGxlcigpO1xuXG4gICAgICAvLyAkZXJyb3JzV3JhcHBlciBpcyBhIGRpdiB0aGF0IHdvdWxkIGNvbnRhaW4gdGhlIHZhcmlvdXMgZmllbGQgZXJyb3JzLCBpdCB3aWxsIGJlIGFwcGVuZGVkIGludG8gJGVycm9yc0NvbnRhaW5lclxuICAgICAgX3VpLmVycm9yc1dyYXBwZXJJZCA9ICdwYXJzbGV5LWlkLScgKyAodGhpcy5vcHRpb25zLm11bHRpcGxlID8gJ211bHRpcGxlLScgKyB0aGlzLm9wdGlvbnMubXVsdGlwbGUgOiB0aGlzLl9faWRfXyk7XG4gICAgICBfdWkuJGVycm9yc1dyYXBwZXIgPSAkKHRoaXMub3B0aW9ucy5lcnJvcnNXcmFwcGVyKS5hdHRyKCdpZCcsIF91aS5lcnJvcnNXcmFwcGVySWQpO1xuXG4gICAgICAvLyBWYWxpZGF0aW9uUmVzdWx0IFVJIHN0b3JhZ2UgdG8gZGV0ZWN0IHdoYXQgaGF2ZSBjaGFuZ2VkIGJ3dCB0d28gdmFsaWRhdGlvbnMsIGFuZCB1cGRhdGUgRE9NIGFjY29yZGluZ2x5XG4gICAgICBfdWkubGFzdFZhbGlkYXRpb25SZXN1bHQgPSBbXTtcbiAgICAgIF91aS52YWxpZGF0aW9uSW5mb3JtYXRpb25WaXNpYmxlID0gZmFsc2U7XG5cbiAgICAgIC8vIFN0b3JlIGl0IGluIHRoaXMgZm9yIGxhdGVyXG4gICAgICB0aGlzLl91aSA9IF91aTtcbiAgICB9LFxuXG4gICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGVsZW1lbnQgd2lsbCBoYXZlIGBwYXJzbGV5LWVycm9yYCBhbmQgYHBhcnNsZXktc3VjY2Vzc2AgY2xhc3Nlc1xuICAgIF9tYW5hZ2VDbGFzc0hhbmRsZXI6IGZ1bmN0aW9uIF9tYW5hZ2VDbGFzc0hhbmRsZXIoKSB7XG4gICAgICAvLyBBbiBlbGVtZW50IHNlbGVjdG9yIGNvdWxkIGJlIHBhc3NlZCB0aHJvdWdoIERPTSB3aXRoIGBkYXRhLXBhcnNsZXktY2xhc3MtaGFuZGxlcj0jZm9vYFxuICAgICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgdGhpcy5vcHRpb25zLmNsYXNzSGFuZGxlciAmJiAkKHRoaXMub3B0aW9ucy5jbGFzc0hhbmRsZXIpLmxlbmd0aCkgcmV0dXJuICQodGhpcy5vcHRpb25zLmNsYXNzSGFuZGxlcik7XG5cbiAgICAgIC8vIENsYXNzIGhhbmRsZWQgY291bGQgYWxzbyBiZSBkZXRlcm1pbmVkIGJ5IGZ1bmN0aW9uIGdpdmVuIGluIFBhcnNsZXkgb3B0aW9uc1xuICAgICAgdmFyICRoYW5kbGVyID0gdGhpcy5vcHRpb25zLmNsYXNzSGFuZGxlci5jYWxsKHRoaXMsIHRoaXMpO1xuXG4gICAgICAvLyBJZiB0aGlzIGZ1bmN0aW9uIHJldHVybmVkIGEgdmFsaWQgZXhpc3RpbmcgRE9NIGVsZW1lbnQsIGdvIGZvciBpdFxuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGhhbmRsZXIgJiYgJGhhbmRsZXIubGVuZ3RoKSByZXR1cm4gJGhhbmRsZXI7XG5cbiAgICAgIHJldHVybiB0aGlzLl9pbnB1dEhvbGRlcigpO1xuICAgIH0sXG5cbiAgICBfaW5wdXRIb2xkZXI6IGZ1bmN0aW9uIF9pbnB1dEhvbGRlcigpIHtcbiAgICAgIC8vIGlmIHNpbXBsZSBlbGVtZW50IChpbnB1dCwgdGV4YXRyZWEsIHNlbGVjdC4uLikgaXQgd2lsbCBwZXJmZWN0bHkgaG9zdCB0aGUgY2xhc3NlcyBhbmQgcHJlY2VkZSB0aGUgZXJyb3IgY29udGFpbmVyXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5tdWx0aXBsZSB8fCB0aGlzLiRlbGVtZW50LmlzKCdzZWxlY3QnKSkgcmV0dXJuIHRoaXMuJGVsZW1lbnQ7XG5cbiAgICAgIC8vIEJ1dCBpZiBtdWx0aXBsZSBlbGVtZW50IChyYWRpbywgY2hlY2tib3gpLCB0aGF0IHdvdWxkIGJlIHRoZWlyIHBhcmVudFxuICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XG4gICAgfSxcblxuICAgIF9pbnNlcnRFcnJvcldyYXBwZXI6IGZ1bmN0aW9uIF9pbnNlcnRFcnJvcldyYXBwZXIoKSB7XG4gICAgICB2YXIgJGVycm9yc0NvbnRhaW5lcjtcblxuICAgICAgLy8gTm90aGluZyB0byBkbyBpZiBhbHJlYWR5IGluc2VydGVkXG4gICAgICBpZiAoMCAhPT0gdGhpcy5fdWkuJGVycm9yc1dyYXBwZXIucGFyZW50KCkubGVuZ3RoKSByZXR1cm4gdGhpcy5fdWkuJGVycm9yc1dyYXBwZXIucGFyZW50KCk7XG5cbiAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHRoaXMub3B0aW9ucy5lcnJvcnNDb250YWluZXIpIHtcbiAgICAgICAgaWYgKCQodGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lcikubGVuZ3RoKSByZXR1cm4gJCh0aGlzLm9wdGlvbnMuZXJyb3JzQ29udGFpbmVyKS5hcHBlbmQodGhpcy5fdWkuJGVycm9yc1dyYXBwZXIpO2Vsc2UgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm4oJ1RoZSBlcnJvcnMgY29udGFpbmVyIGAnICsgdGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lciArICdgIGRvZXMgbm90IGV4aXN0IGluIERPTScpO1xuICAgICAgfSBlbHNlIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgdGhpcy5vcHRpb25zLmVycm9yc0NvbnRhaW5lcikgJGVycm9yc0NvbnRhaW5lciA9IHRoaXMub3B0aW9ucy5lcnJvcnNDb250YWluZXIuY2FsbCh0aGlzLCB0aGlzKTtcblxuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgJGVycm9yc0NvbnRhaW5lciAmJiAkZXJyb3JzQ29udGFpbmVyLmxlbmd0aCkgcmV0dXJuICRlcnJvcnNDb250YWluZXIuYXBwZW5kKHRoaXMuX3VpLiRlcnJvcnNXcmFwcGVyKTtcblxuICAgICAgcmV0dXJuIHRoaXMuX2lucHV0SG9sZGVyKCkuYWZ0ZXIodGhpcy5fdWkuJGVycm9yc1dyYXBwZXIpO1xuICAgIH0sXG5cbiAgICBfYWN0dWFsaXplVHJpZ2dlcnM6IGZ1bmN0aW9uIF9hY3R1YWxpemVUcmlnZ2VycygpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICB2YXIgJHRvQmluZCA9IHRoaXMuX2ZpbmRSZWxhdGVkKCk7XG4gICAgICB2YXIgdHJpZ2dlcjtcblxuICAgICAgLy8gUmVtb3ZlIFBhcnNsZXkgZXZlbnRzIGFscmVhZHkgYm91bmQgb24gdGhpcyBmaWVsZFxuICAgICAgJHRvQmluZC5vZmYoJy5QYXJzbGV5Jyk7XG4gICAgICBpZiAodGhpcy5fZmFpbGVkT25jZSkgJHRvQmluZC5vbihQYXJzbGV5VXRpbHNfX2RlZmF1bHQubmFtZXNwYWNlRXZlbnRzKHRoaXMub3B0aW9ucy50cmlnZ2VyQWZ0ZXJGYWlsdXJlLCAnUGFyc2xleScpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzMy52YWxpZGF0ZSgpO1xuICAgICAgfSk7ZWxzZSBpZiAodHJpZ2dlciA9IFBhcnNsZXlVdGlsc19fZGVmYXVsdC5uYW1lc3BhY2VFdmVudHModGhpcy5vcHRpb25zLnRyaWdnZXIsICdQYXJzbGV5JykpIHtcbiAgICAgICAgJHRvQmluZC5vbih0cmlnZ2VyLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICBfdGhpczMuX2V2ZW50VmFsaWRhdGUoZXZlbnQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX2V2ZW50VmFsaWRhdGU6IGZ1bmN0aW9uIF9ldmVudFZhbGlkYXRlKGV2ZW50KSB7XG4gICAgICAvLyBGb3Iga2V5dXAsIGtleXByZXNzLCBrZXlkb3duLCBpbnB1dC4uLiBldmVudHMgdGhhdCBjb3VsZCBiZSBhIGxpdHRsZSBiaXQgb2JzdHJ1c2l2ZVxuICAgICAgLy8gZG8gbm90IHZhbGlkYXRlIGlmIHZhbCBsZW5ndGggPCBtaW4gdGhyZXNob2xkIG9uIGZpcnN0IHZhbGlkYXRpb24uIE9uY2UgZmllbGQgaGF2ZSBiZWVuIHZhbGlkYXRlZCBvbmNlIGFuZCBpbmZvXG4gICAgICAvLyBhYm91dCBzdWNjZXNzIG9yIGZhaWx1cmUgaGF2ZSBiZWVuIGRpc3BsYXllZCwgYWx3YXlzIHZhbGlkYXRlIHdpdGggdGhpcyB0cmlnZ2VyIHRvIHJlZmxlY3QgZXZlcnkgeWFsaWRhdGlvbiBjaGFuZ2UuXG4gICAgICBpZiAoL2tleXxpbnB1dC8udGVzdChldmVudC50eXBlKSkgaWYgKCEodGhpcy5fdWkgJiYgdGhpcy5fdWkudmFsaWRhdGlvbkluZm9ybWF0aW9uVmlzaWJsZSkgJiYgdGhpcy5nZXRWYWx1ZSgpLmxlbmd0aCA8PSB0aGlzLm9wdGlvbnMudmFsaWRhdGlvblRocmVzaG9sZCkgcmV0dXJuO1xuXG4gICAgICB0aGlzLnZhbGlkYXRlKCk7XG4gICAgfSxcblxuICAgIF9yZXNldFVJOiBmdW5jdGlvbiBfcmVzZXRVSSgpIHtcbiAgICAgIC8vIFJlc2V0IGFsbCBldmVudCBsaXN0ZW5lcnNcbiAgICAgIHRoaXMuX2ZhaWxlZE9uY2UgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2FjdHVhbGl6ZVRyaWdnZXJzKCk7XG5cbiAgICAgIC8vIE5vdGhpbmcgdG8gZG8gaWYgVUkgbmV2ZXIgaW5pdGlhbGl6ZWQgZm9yIHRoaXMgZmllbGRcbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMuX3VpKSByZXR1cm47XG5cbiAgICAgIC8vIFJlc2V0IGFsbCBlcnJvcnMnIGxpXG4gICAgICB0aGlzLl91aS4kZXJyb3JzV3JhcHBlci5yZW1vdmVDbGFzcygnZmlsbGVkJykuY2hpbGRyZW4oKS5yZW1vdmUoKTtcblxuICAgICAgLy8gUmVzZXQgdmFsaWRhdGlvbiBjbGFzc1xuICAgICAgdGhpcy5fcmVzZXRDbGFzcygpO1xuXG4gICAgICAvLyBSZXNldCB2YWxpZGF0aW9uIGZsYWdzIGFuZCBsYXN0IHZhbGlkYXRpb24gcmVzdWx0XG4gICAgICB0aGlzLl91aS5sYXN0VmFsaWRhdGlvblJlc3VsdCA9IFtdO1xuICAgICAgdGhpcy5fdWkudmFsaWRhdGlvbkluZm9ybWF0aW9uVmlzaWJsZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBfZGVzdHJveVVJOiBmdW5jdGlvbiBfZGVzdHJveVVJKCkge1xuICAgICAgdGhpcy5fcmVzZXRVSSgpO1xuXG4gICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLl91aSkgdGhpcy5fdWkuJGVycm9yc1dyYXBwZXIucmVtb3ZlKCk7XG5cbiAgICAgIGRlbGV0ZSB0aGlzLl91aTtcbiAgICB9LFxuXG4gICAgX3N1Y2Nlc3NDbGFzczogZnVuY3Rpb24gX3N1Y2Nlc3NDbGFzcygpIHtcbiAgICAgIHRoaXMuX3VpLnZhbGlkYXRpb25JbmZvcm1hdGlvblZpc2libGUgPSB0cnVlO1xuICAgICAgdGhpcy5fdWkuJGVycm9yQ2xhc3NIYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5lcnJvckNsYXNzKS5hZGRDbGFzcyh0aGlzLm9wdGlvbnMuc3VjY2Vzc0NsYXNzKTtcbiAgICB9LFxuICAgIF9lcnJvckNsYXNzOiBmdW5jdGlvbiBfZXJyb3JDbGFzcygpIHtcbiAgICAgIHRoaXMuX3VpLnZhbGlkYXRpb25JbmZvcm1hdGlvblZpc2libGUgPSB0cnVlO1xuICAgICAgdGhpcy5fdWkuJGVycm9yQ2xhc3NIYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5zdWNjZXNzQ2xhc3MpLmFkZENsYXNzKHRoaXMub3B0aW9ucy5lcnJvckNsYXNzKTtcbiAgICB9LFxuICAgIF9yZXNldENsYXNzOiBmdW5jdGlvbiBfcmVzZXRDbGFzcygpIHtcbiAgICAgIHRoaXMuX3VpLiRlcnJvckNsYXNzSGFuZGxlci5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuc3VjY2Vzc0NsYXNzKS5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuZXJyb3JDbGFzcyk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBQYXJzbGV5Rm9ybSA9IGZ1bmN0aW9uIFBhcnNsZXlGb3JtKGVsZW1lbnQsIGRvbU9wdGlvbnMsIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9fY2xhc3NfXyA9ICdQYXJzbGV5Rm9ybSc7XG5cbiAgICB0aGlzLiRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICB0aGlzLmRvbU9wdGlvbnMgPSBkb21PcHRpb25zO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5wYXJlbnQgPSB3aW5kb3cuUGFyc2xleTtcblxuICAgIHRoaXMuZmllbGRzID0gW107XG4gICAgdGhpcy52YWxpZGF0aW9uUmVzdWx0ID0gbnVsbDtcbiAgfTtcblxuICB2YXIgUGFyc2xleUZvcm1fX3N0YXR1c01hcHBpbmcgPSB7IHBlbmRpbmc6IG51bGwsIHJlc29sdmVkOiB0cnVlLCByZWplY3RlZDogZmFsc2UgfTtcblxuICBQYXJzbGV5Rm9ybS5wcm90b3R5cGUgPSB7XG4gICAgb25TdWJtaXRWYWxpZGF0ZTogZnVuY3Rpb24gb25TdWJtaXRWYWxpZGF0ZShldmVudCkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7XG5cbiAgICAgIC8vIFRoaXMgaXMgYSBQYXJzbGV5IGdlbmVyYXRlZCBzdWJtaXQgZXZlbnQsIGRvIG5vdCB2YWxpZGF0ZSwgZG8gbm90IHByZXZlbnQsIHNpbXBseSBleGl0IGFuZCBrZWVwIG5vcm1hbCBiZWhhdmlvclxuICAgICAgaWYgKHRydWUgPT09IGV2ZW50LnBhcnNsZXkpIHJldHVybjtcblxuICAgICAgLy8gSWYgd2UgZGlkbid0IGNvbWUgaGVyZSB0aHJvdWdoIGEgc3VibWl0IGJ1dHRvbiwgdXNlIHRoZSBmaXJzdCBvbmUgaW4gdGhlIGZvcm1cbiAgICAgIHZhciAkc3VibWl0U291cmNlID0gdGhpcy5fJHN1Ym1pdFNvdXJjZSB8fCB0aGlzLiRlbGVtZW50LmZpbmQoUGFyc2xleVV0aWxzX19kZWZhdWx0Ll9TdWJtaXRTZWxlY3RvcikuZmlyc3QoKTtcbiAgICAgIHRoaXMuXyRzdWJtaXRTb3VyY2UgPSBudWxsO1xuICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcucGFyc2xleS1zeW50aGV0aWMtc3VibWl0LWJ1dHRvbicpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICBpZiAoJHN1Ym1pdFNvdXJjZS5pcygnW2Zvcm1ub3ZhbGlkYXRlXScpKSByZXR1cm47XG5cbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy53aGVuVmFsaWRhdGUoeyBldmVudDogZXZlbnQgfSk7XG5cbiAgICAgIGlmICgncmVzb2x2ZWQnID09PSBwcm9taXNlLnN0YXRlKCkgJiYgZmFsc2UgIT09IHRoaXMuX3RyaWdnZXIoJ3N1Ym1pdCcpKSB7XG4gICAgICAgIC8vIEFsbCBnb29kLCBsZXQgZXZlbnQgZ28gdGhyb3VnaC4gV2UgbWFrZSB0aGlzIGRpc3RpbmN0aW9uIGJlY2F1c2UgYnJvd3NlcnNcbiAgICAgICAgLy8gZGlmZmVyIGluIHRoZWlyIGhhbmRsaW5nIG9mIGBzdWJtaXRgIGJlaW5nIGNhbGxlZCBmcm9tIGluc2lkZSBhIHN1Ym1pdCBldmVudCBbIzEwNDddXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlamVjdGVkIG9yIHBlbmRpbmc6IGNhbmNlbCB0aGlzIHN1Ym1pdFxuICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgaWYgKCdwZW5kaW5nJyA9PT0gcHJvbWlzZS5zdGF0ZSgpKSBwcm9taXNlLmRvbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM0Ll9zdWJtaXQoJHN1Ym1pdFNvdXJjZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25TdWJtaXRCdXR0b246IGZ1bmN0aW9uIG9uU3VibWl0QnV0dG9uKGV2ZW50KSB7XG4gICAgICB0aGlzLl8kc3VibWl0U291cmNlID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcbiAgICB9LFxuICAgIC8vIGludGVybmFsXG4gICAgLy8gX3N1Ym1pdCBzdWJtaXRzIHRoZSBmb3JtLCB0aGlzIHRpbWUgd2l0aG91dCBnb2luZyB0aHJvdWdoIHRoZSB2YWxpZGF0aW9ucy5cbiAgICAvLyBDYXJlIG11c3QgYmUgdGFrZW4gdG8gXCJmYWtlXCIgdGhlIGFjdHVhbCBzdWJtaXQgYnV0dG9uIGJlaW5nIGNsaWNrZWQuXG4gICAgX3N1Ym1pdDogZnVuY3Rpb24gX3N1Ym1pdCgkc3VibWl0U291cmNlKSB7XG4gICAgICBpZiAoZmFsc2UgPT09IHRoaXMuX3RyaWdnZXIoJ3N1Ym1pdCcpKSByZXR1cm47XG4gICAgICAvLyBBZGQgc3VibWl0IGJ1dHRvbidzIGRhdGFcbiAgICAgIGlmICgkc3VibWl0U291cmNlKSB7XG4gICAgICAgIHZhciAkc3ludGhldGljID0gdGhpcy4kZWxlbWVudC5maW5kKCcucGFyc2xleS1zeW50aGV0aWMtc3VibWl0LWJ1dHRvbicpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgICBpZiAoMCA9PT0gJHN5bnRoZXRpYy5sZW5ndGgpICRzeW50aGV0aWMgPSAkKCc8aW5wdXQgY2xhc3M9XCJwYXJzbGV5LXN5bnRoZXRpYy1zdWJtaXQtYnV0dG9uXCIgdHlwZT1cImhpZGRlblwiPicpLmFwcGVuZFRvKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICAkc3ludGhldGljLmF0dHIoe1xuICAgICAgICAgIG5hbWU6ICRzdWJtaXRTb3VyY2UuYXR0cignbmFtZScpLFxuICAgICAgICAgIHZhbHVlOiAkc3VibWl0U291cmNlLmF0dHIoJ3ZhbHVlJylcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigkLmV4dGVuZCgkLkV2ZW50KCdzdWJtaXQnKSwgeyBwYXJzbGV5OiB0cnVlIH0pKTtcbiAgICB9LFxuXG4gICAgLy8gUGVyZm9ybXMgdmFsaWRhdGlvbiBvbiBmaWVsZHMgd2hpbGUgdHJpZ2dlcmluZyBldmVudHMuXG4gICAgLy8gQHJldHVybnMgYHRydWVgIGlmIGFsbCB2YWxpZGF0aW9ucyBzdWNjZWVkcywgYGZhbHNlYFxuICAgIC8vIGlmIGEgZmFpbHVyZSBpcyBpbW1lZGlhdGVseSBkZXRlY3RlZCwgb3IgYG51bGxgXG4gICAgLy8gaWYgZGVwZW5kYW50IG9uIGEgcHJvbWlzZS5cbiAgICAvLyBDb25zaWRlciB1c2luZyBgd2hlblZhbGlkYXRlYCBpbnN0ZWFkLlxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiB2YWxpZGF0ZShvcHRpb25zKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAxICYmICEkLmlzUGxhaW5PYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm5PbmNlKCdDYWxsaW5nIHZhbGlkYXRlIG9uIGEgcGFyc2xleSBmb3JtIHdpdGhvdXQgcGFzc2luZyBhcmd1bWVudHMgYXMgYW4gb2JqZWN0IGlzIGRlcHJlY2F0ZWQuJyk7XG5cbiAgICAgICAgdmFyIF9hcmd1bWVudHMgPSBfc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgICAgIHZhciBncm91cCA9IF9hcmd1bWVudHNbMF07XG4gICAgICAgIHZhciBmb3JjZSA9IF9hcmd1bWVudHNbMV07XG4gICAgICAgIHZhciBldmVudCA9IF9hcmd1bWVudHNbMl07XG5cbiAgICAgICAgb3B0aW9ucyA9IHsgZ3JvdXA6IGdyb3VwLCBmb3JjZTogZm9yY2UsIGV2ZW50OiBldmVudCB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFBhcnNsZXlGb3JtX19zdGF0dXNNYXBwaW5nW3RoaXMud2hlblZhbGlkYXRlKG9wdGlvbnMpLnN0YXRlKCldO1xuICAgIH0sXG5cbiAgICB3aGVuVmFsaWRhdGU6IGZ1bmN0aW9uIHdoZW5WYWxpZGF0ZSgpIHtcbiAgICAgIHZhciBfUGFyc2xleVV0aWxzX19kZWZhdWx0JGFsbCRkb25lJGZhaWwkYWx3YXlzLFxuICAgICAgICAgIF90aGlzNSA9IHRoaXM7XG5cbiAgICAgIHZhciBfcmVmNyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gICAgICB2YXIgZ3JvdXAgPSBfcmVmNy5ncm91cDtcbiAgICAgIHZhciBmb3JjZSA9IF9yZWY3LmZvcmNlO1xuICAgICAgdmFyIGV2ZW50ID0gX3JlZjcuZXZlbnQ7XG5cbiAgICAgIHRoaXMuc3VibWl0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmIChldmVudCkge1xuICAgICAgICB0aGlzLnN1Ym1pdEV2ZW50ID0gJC5leHRlbmQoe30sIGV2ZW50LCB7IHByZXZlbnREZWZhdWx0OiBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdCgpIHtcbiAgICAgICAgICAgIFBhcnNsZXlVdGlsc19fZGVmYXVsdC53YXJuT25jZShcIlVzaW5nIGB0aGlzLnN1Ym1pdEV2ZW50LnByZXZlbnREZWZhdWx0KClgIGlzIGRlcHJlY2F0ZWQ7IGluc3RlYWQsIGNhbGwgYHRoaXMudmFsaWRhdGlvblJlc3VsdCA9IGZhbHNlYFwiKTtcbiAgICAgICAgICAgIF90aGlzNS52YWxpZGF0aW9uUmVzdWx0ID0gZmFsc2U7XG4gICAgICAgICAgfSB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMudmFsaWRhdGlvblJlc3VsdCA9IHRydWU7XG5cbiAgICAgIC8vIGZpcmUgdmFsaWRhdGUgZXZlbnQgdG8gZXZlbnR1YWxseSBtb2RpZnkgdGhpbmdzIGJlZm9yZSBldmVyeSB2YWxpZGF0aW9uXG4gICAgICB0aGlzLl90cmlnZ2VyKCd2YWxpZGF0ZScpO1xuXG4gICAgICAvLyBSZWZyZXNoIGZvcm0gRE9NIG9wdGlvbnMgYW5kIGZvcm0ncyBmaWVsZHMgdGhhdCBjb3VsZCBoYXZlIGNoYW5nZWRcbiAgICAgIHRoaXMuX3JlZnJlc2hGaWVsZHMoKTtcblxuICAgICAgdmFyIHByb21pc2VzID0gdGhpcy5fd2l0aG91dFJlYWN0dWFsaXppbmdGb3JtT3B0aW9ucyhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkLm1hcChfdGhpczUuZmllbGRzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQud2hlblZhbGlkYXRlKHsgZm9yY2U6IGZvcmNlLCBncm91cDogZ3JvdXAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoX1BhcnNsZXlVdGlsc19fZGVmYXVsdCRhbGwkZG9uZSRmYWlsJGFsd2F5cyA9IFBhcnNsZXlVdGlsc19fZGVmYXVsdC5hbGwocHJvbWlzZXMpLmRvbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczUuX3RyaWdnZXIoJ3N1Y2Nlc3MnKTtcbiAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczUudmFsaWRhdGlvblJlc3VsdCA9IGZhbHNlO1xuICAgICAgICBfdGhpczUuZm9jdXMoKTtcbiAgICAgICAgX3RoaXM1Ll90cmlnZ2VyKCdlcnJvcicpO1xuICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXM1Ll90cmlnZ2VyKCd2YWxpZGF0ZWQnKTtcbiAgICAgIH0pKS5waXBlLmFwcGx5KF9QYXJzbGV5VXRpbHNfX2RlZmF1bHQkYWxsJGRvbmUkZmFpbCRhbHdheXMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9waXBlQWNjb3JkaW5nVG9WYWxpZGF0aW9uUmVzdWx0KCkpKTtcbiAgICB9LFxuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHJlZnJlc2hlZCBmaWVsZHMsIGFuZCBzdG9wIG9uIGZpcnN0IGZhaWx1cmUuXG4gICAgLy8gUmV0dXJucyBgdHJ1ZWAgaWYgYWxsIGZpZWxkcyBhcmUgdmFsaWQsIGBmYWxzZWAgaWYgYSBmYWlsdXJlIGlzIGRldGVjdGVkXG4gICAgLy8gb3IgYG51bGxgIGlmIHRoZSByZXN1bHQgZGVwZW5kcyBvbiBhbiB1bnJlc29sdmVkIHByb21pc2UuXG4gICAgLy8gUHJlZmVyIHVzaW5nIGB3aGVuVmFsaWRgIGluc3RlYWQuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24gaXNWYWxpZChvcHRpb25zKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAxICYmICEkLmlzUGxhaW5PYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm5PbmNlKCdDYWxsaW5nIGlzVmFsaWQgb24gYSBwYXJzbGV5IGZvcm0gd2l0aG91dCBwYXNzaW5nIGFyZ3VtZW50cyBhcyBhbiBvYmplY3QgaXMgZGVwcmVjYXRlZC4nKTtcblxuICAgICAgICB2YXIgX2FyZ3VtZW50czIgPSBfc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgICAgIHZhciBncm91cCA9IF9hcmd1bWVudHMyWzBdO1xuICAgICAgICB2YXIgZm9yY2UgPSBfYXJndW1lbnRzMlsxXTtcblxuICAgICAgICBvcHRpb25zID0geyBncm91cDogZ3JvdXAsIGZvcmNlOiBmb3JjZSB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFBhcnNsZXlGb3JtX19zdGF0dXNNYXBwaW5nW3RoaXMud2hlblZhbGlkKG9wdGlvbnMpLnN0YXRlKCldO1xuICAgIH0sXG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgcmVmcmVzaGVkIGZpZWxkcyBhbmQgdmFsaWRhdGUgdGhlbS5cbiAgICAvLyBSZXR1cm5zIGEgcHJvbWlzZS5cbiAgICAvLyBBIHZhbGlkYXRpb24gdGhhdCBpbW1lZGlhdGVseSBmYWlscyB3aWxsIGludGVycnVwdCB0aGUgdmFsaWRhdGlvbnMuXG4gICAgd2hlblZhbGlkOiBmdW5jdGlvbiB3aGVuVmFsaWQoKSB7XG4gICAgICB2YXIgX3RoaXM2ID0gdGhpcztcblxuICAgICAgdmFyIF9yZWY4ID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG5cbiAgICAgIHZhciBncm91cCA9IF9yZWY4Lmdyb3VwO1xuICAgICAgdmFyIGZvcmNlID0gX3JlZjguZm9yY2U7XG5cbiAgICAgIHRoaXMuX3JlZnJlc2hGaWVsZHMoKTtcblxuICAgICAgdmFyIHByb21pc2VzID0gdGhpcy5fd2l0aG91dFJlYWN0dWFsaXppbmdGb3JtT3B0aW9ucyhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkLm1hcChfdGhpczYuZmllbGRzLCBmdW5jdGlvbiAoZmllbGQpIHtcbiAgICAgICAgICByZXR1cm4gZmllbGQud2hlblZhbGlkKHsgZ3JvdXA6IGdyb3VwLCBmb3JjZTogZm9yY2UgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gUGFyc2xleVV0aWxzX19kZWZhdWx0LmFsbChwcm9taXNlcyk7XG4gICAgfSxcblxuICAgIF9yZWZyZXNoRmllbGRzOiBmdW5jdGlvbiBfcmVmcmVzaEZpZWxkcygpIHtcbiAgICAgIHJldHVybiB0aGlzLmFjdHVhbGl6ZU9wdGlvbnMoKS5fYmluZEZpZWxkcygpO1xuICAgIH0sXG5cbiAgICBfYmluZEZpZWxkczogZnVuY3Rpb24gX2JpbmRGaWVsZHMoKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgdmFyIG9sZEZpZWxkcyA9IHRoaXMuZmllbGRzO1xuXG4gICAgICB0aGlzLmZpZWxkcyA9IFtdO1xuICAgICAgdGhpcy5maWVsZHNNYXBwZWRCeUlkID0ge307XG5cbiAgICAgIHRoaXMuX3dpdGhvdXRSZWFjdHVhbGl6aW5nRm9ybU9wdGlvbnMoZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczcuJGVsZW1lbnQuZmluZChfdGhpczcub3B0aW9ucy5pbnB1dHMpLm5vdChfdGhpczcub3B0aW9ucy5leGNsdWRlZCkuZWFjaChmdW5jdGlvbiAoXywgZWxlbWVudCkge1xuICAgICAgICAgIHZhciBmaWVsZEluc3RhbmNlID0gbmV3IHdpbmRvdy5QYXJzbGV5LkZhY3RvcnkoZWxlbWVudCwge30sIF90aGlzNyk7XG5cbiAgICAgICAgICAvLyBPbmx5IGFkZCB2YWxpZCBhbmQgbm90IGV4Y2x1ZGVkIGBQYXJzbGV5RmllbGRgIGFuZCBgUGFyc2xleUZpZWxkTXVsdGlwbGVgIGNoaWxkcmVuXG4gICAgICAgICAgaWYgKCgnUGFyc2xleUZpZWxkJyA9PT0gZmllbGRJbnN0YW5jZS5fX2NsYXNzX18gfHwgJ1BhcnNsZXlGaWVsZE11bHRpcGxlJyA9PT0gZmllbGRJbnN0YW5jZS5fX2NsYXNzX18pICYmIHRydWUgIT09IGZpZWxkSW5zdGFuY2Uub3B0aW9ucy5leGNsdWRlZCkgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgX3RoaXM3LmZpZWxkc01hcHBlZEJ5SWRbZmllbGRJbnN0YW5jZS5fX2NsYXNzX18gKyAnLScgKyBmaWVsZEluc3RhbmNlLl9faWRfX10pIHtcbiAgICAgICAgICAgIF90aGlzNy5maWVsZHNNYXBwZWRCeUlkW2ZpZWxkSW5zdGFuY2UuX19jbGFzc19fICsgJy0nICsgZmllbGRJbnN0YW5jZS5fX2lkX19dID0gZmllbGRJbnN0YW5jZTtcbiAgICAgICAgICAgIF90aGlzNy5maWVsZHMucHVzaChmaWVsZEluc3RhbmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQuZWFjaChQYXJzbGV5VXRpbHNfX2RlZmF1bHQuZGlmZmVyZW5jZShvbGRGaWVsZHMsIF90aGlzNy5maWVsZHMpLCBmdW5jdGlvbiAoXywgZmllbGQpIHtcbiAgICAgICAgICBmaWVsZC5fdHJpZ2dlcigncmVzZXQnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBJbnRlcm5hbCBvbmx5LlxuICAgIC8vIExvb3Bpbmcgb24gYSBmb3JtJ3MgZmllbGRzIHRvIGRvIHZhbGlkYXRpb24gb3Igc2ltaWxhclxuICAgIC8vIHdpbGwgdHJpZ2dlciByZWFjdHVhbGl6aW5nIG9wdGlvbnMgb24gYWxsIG9mIHRoZW0sIHdoaWNoXG4gICAgLy8gaW4gdHVybiB3aWxsIHJlYWN0dWFsaXplIHRoZSBmb3JtJ3Mgb3B0aW9ucy5cbiAgICAvLyBUbyBhdm9pZCBjYWxsaW5nIGFjdHVhbGl6ZU9wdGlvbnMgc28gbWFueSB0aW1lcyBvbiB0aGUgZm9ybVxuICAgIC8vIGZvciBub3RoaW5nLCBfd2l0aG91dFJlYWN0dWFsaXppbmdGb3JtT3B0aW9ucyB0ZW1wb3JhcmlseSBkaXNhYmxlc1xuICAgIC8vIHRoZSBtZXRob2QgYWN0dWFsaXplT3B0aW9ucyBvbiB0aGlzIGZvcm0gd2hpbGUgYGZuYCBpcyBjYWxsZWQuXG4gICAgX3dpdGhvdXRSZWFjdHVhbGl6aW5nRm9ybU9wdGlvbnM6IGZ1bmN0aW9uIF93aXRob3V0UmVhY3R1YWxpemluZ0Zvcm1PcHRpb25zKGZuKSB7XG4gICAgICB2YXIgb2xkQWN0dWFsaXplT3B0aW9ucyA9IHRoaXMuYWN0dWFsaXplT3B0aW9ucztcbiAgICAgIHRoaXMuYWN0dWFsaXplT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgdmFyIHJlc3VsdCA9IGZuKCk7XG4gICAgICB0aGlzLmFjdHVhbGl6ZU9wdGlvbnMgPSBvbGRBY3R1YWxpemVPcHRpb25zO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LFxuXG4gICAgLy8gSW50ZXJuYWwgb25seS5cbiAgICAvLyBTaG9ydGN1dCB0byB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgLy8gUmV0dXJucyB0cnVlIGlmZiBldmVudCBpcyBub3QgaW50ZXJydXB0ZWQgYW5kIGRlZmF1bHQgbm90IHByZXZlbnRlZC5cbiAgICBfdHJpZ2dlcjogZnVuY3Rpb24gX3RyaWdnZXIoZXZlbnROYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmlnZ2VyKCdmb3JtOicgKyBldmVudE5hbWUpO1xuICAgIH1cblxuICB9O1xuXG4gIHZhciBDb25zdHJhaW50RmFjdG9yeSA9IGZ1bmN0aW9uIENvbnN0cmFpbnRGYWN0b3J5KHBhcnNsZXlGaWVsZCwgbmFtZSwgcmVxdWlyZW1lbnRzLCBwcmlvcml0eSwgaXNEb21Db25zdHJhaW50KSB7XG4gICAgaWYgKCEvUGFyc2xleUZpZWxkLy50ZXN0KHBhcnNsZXlGaWVsZC5fX2NsYXNzX18pKSB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNsZXlGaWVsZCBvciBQYXJzbGV5RmllbGRNdWx0aXBsZSBpbnN0YW5jZSBleHBlY3RlZCcpO1xuXG4gICAgdmFyIHZhbGlkYXRvclNwZWMgPSB3aW5kb3cuUGFyc2xleS5fdmFsaWRhdG9yUmVnaXN0cnkudmFsaWRhdG9yc1tuYW1lXTtcbiAgICB2YXIgdmFsaWRhdG9yID0gbmV3IFBhcnNsZXlWYWxpZGF0b3IodmFsaWRhdG9yU3BlYyk7XG5cbiAgICAkLmV4dGVuZCh0aGlzLCB7XG4gICAgICB2YWxpZGF0b3I6IHZhbGlkYXRvcixcbiAgICAgIG5hbWU6IG5hbWUsXG4gICAgICByZXF1aXJlbWVudHM6IHJlcXVpcmVtZW50cyxcbiAgICAgIHByaW9yaXR5OiBwcmlvcml0eSB8fCBwYXJzbGV5RmllbGQub3B0aW9uc1tuYW1lICsgJ1ByaW9yaXR5J10gfHwgdmFsaWRhdG9yLnByaW9yaXR5LFxuICAgICAgaXNEb21Db25zdHJhaW50OiB0cnVlID09PSBpc0RvbUNvbnN0cmFpbnRcbiAgICB9KTtcbiAgICB0aGlzLl9wYXJzZVJlcXVpcmVtZW50cyhwYXJzbGV5RmllbGQub3B0aW9ucyk7XG4gIH07XG5cbiAgdmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiBjYXBpdGFsaXplKHN0cikge1xuICAgIHZhciBjYXAgPSBzdHJbMF0udG9VcHBlckNhc2UoKTtcbiAgICByZXR1cm4gY2FwICsgc3RyLnNsaWNlKDEpO1xuICB9O1xuXG4gIENvbnN0cmFpbnRGYWN0b3J5LnByb3RvdHlwZSA9IHtcbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24gdmFsaWRhdGUodmFsdWUsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgX3ZhbGlkYXRvcjtcblxuICAgICAgcmV0dXJuIChfdmFsaWRhdG9yID0gdGhpcy52YWxpZGF0b3IpLnZhbGlkYXRlLmFwcGx5KF92YWxpZGF0b3IsIFt2YWx1ZV0uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheSh0aGlzLnJlcXVpcmVtZW50TGlzdCksIFtpbnN0YW5jZV0pKTtcbiAgICB9LFxuXG4gICAgX3BhcnNlUmVxdWlyZW1lbnRzOiBmdW5jdGlvbiBfcGFyc2VSZXF1aXJlbWVudHMob3B0aW9ucykge1xuICAgICAgdmFyIF90aGlzOCA9IHRoaXM7XG5cbiAgICAgIHRoaXMucmVxdWlyZW1lbnRMaXN0ID0gdGhpcy52YWxpZGF0b3IucGFyc2VSZXF1aXJlbWVudHModGhpcy5yZXF1aXJlbWVudHMsIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnNbX3RoaXM4Lm5hbWUgKyBjYXBpdGFsaXplKGtleSldO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBQYXJzbGV5RmllbGQgPSBmdW5jdGlvbiBQYXJzbGV5RmllbGQoZmllbGQsIGRvbU9wdGlvbnMsIG9wdGlvbnMsIHBhcnNsZXlGb3JtSW5zdGFuY2UpIHtcbiAgICB0aGlzLl9fY2xhc3NfXyA9ICdQYXJzbGV5RmllbGQnO1xuXG4gICAgdGhpcy4kZWxlbWVudCA9ICQoZmllbGQpO1xuXG4gICAgLy8gU2V0IHBhcmVudCBpZiB3ZSBoYXZlIG9uZVxuICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHBhcnNsZXlGb3JtSW5zdGFuY2UpIHtcbiAgICAgIHRoaXMucGFyZW50ID0gcGFyc2xleUZvcm1JbnN0YW5jZTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuZG9tT3B0aW9ucyA9IGRvbU9wdGlvbnM7XG5cbiAgICAvLyBJbml0aWFsaXplIHNvbWUgcHJvcGVydGllc1xuICAgIHRoaXMuY29uc3RyYWludHMgPSBbXTtcbiAgICB0aGlzLmNvbnN0cmFpbnRzQnlOYW1lID0ge307XG4gICAgdGhpcy52YWxpZGF0aW9uUmVzdWx0ID0gdHJ1ZTtcblxuICAgIC8vIEJpbmQgY29uc3RyYWludHNcbiAgICB0aGlzLl9iaW5kQ29uc3RyYWludHMoKTtcbiAgfTtcblxuICB2YXIgcGFyc2xleV9maWVsZF9fc3RhdHVzTWFwcGluZyA9IHsgcGVuZGluZzogbnVsbCwgcmVzb2x2ZWQ6IHRydWUsIHJlamVjdGVkOiBmYWxzZSB9O1xuXG4gIFBhcnNsZXlGaWVsZC5wcm90b3R5cGUgPSB7XG4gICAgLy8gIyBQdWJsaWMgQVBJXG4gICAgLy8gVmFsaWRhdGUgZmllbGQgYW5kIHRyaWdnZXIgc29tZSBldmVudHMgZm9yIG1haW5seSBgUGFyc2xleVVJYFxuICAgIC8vIEByZXR1cm5zIGB0cnVlYCwgYW4gYXJyYXkgb2YgdGhlIHZhbGlkYXRvcnMgdGhhdCBmYWlsZWQsIG9yXG4gICAgLy8gYG51bGxgIGlmIHZhbGlkYXRpb24gaXMgbm90IGZpbmlzaGVkLiBQcmVmZXIgdXNpbmcgd2hlblZhbGlkYXRlXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uIHZhbGlkYXRlKG9wdGlvbnMpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID49IDEgJiYgISQuaXNQbGFpbk9iamVjdChvcHRpb25zKSkge1xuICAgICAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2Fybk9uY2UoJ0NhbGxpbmcgdmFsaWRhdGUgb24gYSBwYXJzbGV5IGZpZWxkIHdpdGhvdXQgcGFzc2luZyBhcmd1bWVudHMgYXMgYW4gb2JqZWN0IGlzIGRlcHJlY2F0ZWQuJyk7XG4gICAgICAgIG9wdGlvbnMgPSB7IG9wdGlvbnM6IG9wdGlvbnMgfTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy53aGVuVmFsaWRhdGUob3B0aW9ucyk7XG4gICAgICBpZiAoIXByb21pc2UpIC8vIElmIGV4Y2x1ZGVkIHdpdGggYGdyb3VwYCBvcHRpb25cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBzd2l0Y2ggKHByb21pc2Uuc3RhdGUoKSkge1xuICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgY2FzZSAncmVzb2x2ZWQnOlxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlICdyZWplY3RlZCc6XG4gICAgICAgICAgcmV0dXJuIHRoaXMudmFsaWRhdGlvblJlc3VsdDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gVmFsaWRhdGUgZmllbGQgYW5kIHRyaWdnZXIgc29tZSBldmVudHMgZm9yIG1haW5seSBgUGFyc2xleVVJYFxuICAgIC8vIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHN1Y2NlZWRzIG9ubHkgd2hlbiBhbGwgdmFsaWRhdGlvbnMgZG9cbiAgICAvLyBvciBgdW5kZWZpbmVkYCBpZiBmaWVsZCBpcyBub3QgaW4gdGhlIGdpdmVuIGBncm91cGAuXG4gICAgd2hlblZhbGlkYXRlOiBmdW5jdGlvbiB3aGVuVmFsaWRhdGUoKSB7XG4gICAgICB2YXIgX3doZW5WYWxpZCRhbHdheXMkZG9uZSRmYWlsJGFsd2F5cyxcbiAgICAgICAgICBfdGhpczkgPSB0aGlzO1xuXG4gICAgICB2YXIgX3JlZjkgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIGZvcmNlID0gX3JlZjkuZm9yY2U7XG4gICAgICB2YXIgZ3JvdXAgPSBfcmVmOS5ncm91cDtcblxuICAgICAgLy8gZG8gbm90IHZhbGlkYXRlIGEgZmllbGQgaWYgbm90IHRoZSBzYW1lIGFzIGdpdmVuIHZhbGlkYXRpb24gZ3JvdXBcbiAgICAgIHRoaXMucmVmcmVzaENvbnN0cmFpbnRzKCk7XG4gICAgICBpZiAoZ3JvdXAgJiYgIXRoaXMuX2lzSW5Hcm91cChncm91cCkpIHJldHVybjtcblxuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgLy8gRmllbGQgVmFsaWRhdGUgZXZlbnQuIGB0aGlzLnZhbHVlYCBjb3VsZCBiZSBhbHRlcmVkIGZvciBjdXN0b20gbmVlZHNcbiAgICAgIHRoaXMuX3RyaWdnZXIoJ3ZhbGlkYXRlJyk7XG5cbiAgICAgIHJldHVybiAoX3doZW5WYWxpZCRhbHdheXMkZG9uZSRmYWlsJGFsd2F5cyA9IHRoaXMud2hlblZhbGlkKHsgZm9yY2U6IGZvcmNlLCB2YWx1ZTogdGhpcy52YWx1ZSwgX3JlZnJlc2hlZDogdHJ1ZSB9KS5hbHdheXMoZnVuY3Rpb24gKCkge1xuICAgICAgICBfdGhpczkuX3JlZmxvd1VJKCk7XG4gICAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXM5Ll90cmlnZ2VyKCdzdWNjZXNzJyk7XG4gICAgICB9KS5mYWlsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXM5Ll90cmlnZ2VyKCdlcnJvcicpO1xuICAgICAgfSkuYWx3YXlzKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgX3RoaXM5Ll90cmlnZ2VyKCd2YWxpZGF0ZWQnKTtcbiAgICAgIH0pKS5waXBlLmFwcGx5KF93aGVuVmFsaWQkYWx3YXlzJGRvbmUkZmFpbCRhbHdheXMsIF90b0NvbnN1bWFibGVBcnJheSh0aGlzLl9waXBlQWNjb3JkaW5nVG9WYWxpZGF0aW9uUmVzdWx0KCkpKTtcbiAgICB9LFxuXG4gICAgaGFzQ29uc3RyYWludHM6IGZ1bmN0aW9uIGhhc0NvbnN0cmFpbnRzKCkge1xuICAgICAgcmV0dXJuIDAgIT09IHRoaXMuY29uc3RyYWludHMubGVuZ3RoO1xuICAgIH0sXG5cbiAgICAvLyBBbiBlbXB0eSBvcHRpb25hbCBmaWVsZCBkb2VzIG5vdCBuZWVkIHZhbGlkYXRpb25cbiAgICBuZWVkc1ZhbGlkYXRpb246IGZ1bmN0aW9uIG5lZWRzVmFsaWRhdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgdmFsdWUpIHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG4gICAgICAvLyBJZiBhIGZpZWxkIGlzIGVtcHR5IGFuZCBub3QgcmVxdWlyZWQsIGl0IGlzIHZhbGlkXG4gICAgICAvLyBFeGNlcHQgaWYgYGRhdGEtcGFyc2xleS12YWxpZGF0ZS1pZi1lbXB0eWAgZXhwbGljaXRlbHkgYWRkZWQsIHVzZWZ1bCBmb3Igc29tZSBjdXN0b20gdmFsaWRhdG9yc1xuICAgICAgaWYgKCF2YWx1ZS5sZW5ndGggJiYgIXRoaXMuX2lzUmVxdWlyZWQoKSAmJiAndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMub3B0aW9ucy52YWxpZGF0ZUlmRW1wdHkpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIF9pc0luR3JvdXA6IGZ1bmN0aW9uIF9pc0luR3JvdXAoZ3JvdXApIHtcbiAgICAgIGlmICgkLmlzQXJyYXkodGhpcy5vcHRpb25zLmdyb3VwKSkgcmV0dXJuIC0xICE9PSAkLmluQXJyYXkoZ3JvdXAsIHRoaXMub3B0aW9ucy5ncm91cCk7XG4gICAgICByZXR1cm4gdGhpcy5vcHRpb25zLmdyb3VwID09PSBncm91cDtcbiAgICB9LFxuXG4gICAgLy8gSnVzdCB2YWxpZGF0ZSBmaWVsZC4gRG8gbm90IHRyaWdnZXIgYW55IGV2ZW50LlxuICAgIC8vIFJldHVybnMgYHRydWVgIGlmZiBhbGwgY29uc3RyYWludHMgcGFzcywgYGZhbHNlYCBpZiB0aGVyZSBhcmUgZmFpbHVyZXMsXG4gICAgLy8gb3IgYG51bGxgIGlmIHRoZSByZXN1bHQgY2FuIG5vdCBiZSBkZXRlcm1pbmVkIHlldCAoZGVwZW5kcyBvbiBhIHByb21pc2UpXG4gICAgLy8gU2VlIGFsc28gYHdoZW5WYWxpZGAuXG4gICAgaXNWYWxpZDogZnVuY3Rpb24gaXNWYWxpZChvcHRpb25zKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSAxICYmICEkLmlzUGxhaW5PYmplY3Qob3B0aW9ucykpIHtcbiAgICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm5PbmNlKCdDYWxsaW5nIGlzVmFsaWQgb24gYSBwYXJzbGV5IGZpZWxkIHdpdGhvdXQgcGFzc2luZyBhcmd1bWVudHMgYXMgYW4gb2JqZWN0IGlzIGRlcHJlY2F0ZWQuJyk7XG5cbiAgICAgICAgdmFyIF9hcmd1bWVudHMzID0gX3NsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgICAgICB2YXIgZm9yY2UgPSBfYXJndW1lbnRzM1swXTtcbiAgICAgICAgdmFyIHZhbHVlID0gX2FyZ3VtZW50czNbMV07XG5cbiAgICAgICAgb3B0aW9ucyA9IHsgZm9yY2U6IGZvcmNlLCB2YWx1ZTogdmFsdWUgfTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy53aGVuVmFsaWQob3B0aW9ucyk7XG4gICAgICBpZiAoIXByb21pc2UpIC8vIEV4Y2x1ZGVkIHZpYSBgZ3JvdXBgXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgcmV0dXJuIHBhcnNsZXlfZmllbGRfX3N0YXR1c01hcHBpbmdbcHJvbWlzZS5zdGF0ZSgpXTtcbiAgICB9LFxuXG4gICAgLy8gSnVzdCB2YWxpZGF0ZSBmaWVsZC4gRG8gbm90IHRyaWdnZXIgYW55IGV2ZW50LlxuICAgIC8vIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHN1Y2NlZWRzIG9ubHkgd2hlbiBhbGwgdmFsaWRhdGlvbnMgZG9cbiAgICAvLyBvciBgdW5kZWZpbmVkYCBpZiB0aGUgZmllbGQgaXMgbm90IGluIHRoZSBnaXZlbiBgZ3JvdXBgLlxuICAgIC8vIFRoZSBhcmd1bWVudCBgZm9yY2VgIHdpbGwgZm9yY2UgdmFsaWRhdGlvbiBvZiBlbXB0eSBmaWVsZHMuXG4gICAgLy8gSWYgYSBgdmFsdWVgIGlzIGdpdmVuLCBpdCB3aWxsIGJlIHZhbGlkYXRlZCBpbnN0ZWFkIG9mIHRoZSB2YWx1ZSBvZiB0aGUgaW5wdXQuXG4gICAgd2hlblZhbGlkOiBmdW5jdGlvbiB3aGVuVmFsaWQoKSB7XG4gICAgICB2YXIgX3RoaXMxMCA9IHRoaXM7XG5cbiAgICAgIHZhciBfcmVmMTAgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgdmFyIF9yZWYxMCRmb3JjZSA9IF9yZWYxMC5mb3JjZTtcbiAgICAgIHZhciBmb3JjZSA9IF9yZWYxMCRmb3JjZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBfcmVmMTAkZm9yY2U7XG4gICAgICB2YXIgdmFsdWUgPSBfcmVmMTAudmFsdWU7XG4gICAgICB2YXIgZ3JvdXAgPSBfcmVmMTAuZ3JvdXA7XG4gICAgICB2YXIgX3JlZnJlc2hlZCA9IF9yZWYxMC5fcmVmcmVzaGVkO1xuXG4gICAgICAvLyBSZWNvbXB1dGUgb3B0aW9ucyBhbmQgcmViaW5kIGNvbnN0cmFpbnRzIHRvIGhhdmUgbGF0ZXN0IGNoYW5nZXNcbiAgICAgIGlmICghX3JlZnJlc2hlZCkgdGhpcy5yZWZyZXNoQ29uc3RyYWludHMoKTtcbiAgICAgIC8vIGRvIG5vdCB2YWxpZGF0ZSBhIGZpZWxkIGlmIG5vdCB0aGUgc2FtZSBhcyBnaXZlbiB2YWxpZGF0aW9uIGdyb3VwXG4gICAgICBpZiAoZ3JvdXAgJiYgIXRoaXMuX2lzSW5Hcm91cChncm91cCkpIHJldHVybjtcblxuICAgICAgdGhpcy52YWxpZGF0aW9uUmVzdWx0ID0gdHJ1ZTtcblxuICAgICAgLy8gQSBmaWVsZCB3aXRob3V0IGNvbnN0cmFpbnQgaXMgdmFsaWRcbiAgICAgIGlmICghdGhpcy5oYXNDb25zdHJhaW50cygpKSByZXR1cm4gJC53aGVuKCk7XG5cbiAgICAgIC8vIFZhbHVlIGNvdWxkIGJlIHBhc3NlZCBhcyBhcmd1bWVudCwgbmVlZGVkIHRvIGFkZCBtb3JlIHBvd2VyIHRvICdmaWVsZDp2YWxpZGF0ZSdcbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHZhbHVlIHx8IG51bGwgPT09IHZhbHVlKSB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuICAgICAgaWYgKCF0aGlzLm5lZWRzVmFsaWRhdGlvbih2YWx1ZSkgJiYgdHJ1ZSAhPT0gZm9yY2UpIHJldHVybiAkLndoZW4oKTtcblxuICAgICAgdmFyIGdyb3VwZWRDb25zdHJhaW50cyA9IHRoaXMuX2dldEdyb3VwZWRDb25zdHJhaW50cygpO1xuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICAkLmVhY2goZ3JvdXBlZENvbnN0cmFpbnRzLCBmdW5jdGlvbiAoXywgY29uc3RyYWludHMpIHtcbiAgICAgICAgLy8gUHJvY2VzcyBvbmUgZ3JvdXAgb2YgY29uc3RyYWludHMgYXQgYSB0aW1lLCB3ZSB2YWxpZGF0ZSB0aGUgY29uc3RyYWludHNcbiAgICAgICAgLy8gYW5kIGNvbWJpbmUgdGhlIHByb21pc2VzIHRvZ2V0aGVyLlxuICAgICAgICB2YXIgcHJvbWlzZSA9IFBhcnNsZXlVdGlsc19fZGVmYXVsdC5hbGwoJC5tYXAoY29uc3RyYWludHMsIGZ1bmN0aW9uIChjb25zdHJhaW50KSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzMTAuX3ZhbGlkYXRlQ29uc3RyYWludCh2YWx1ZSwgY29uc3RyYWludCk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgcHJvbWlzZXMucHVzaChwcm9taXNlKTtcbiAgICAgICAgaWYgKHByb21pc2Uuc3RhdGUoKSA9PT0gJ3JlamVjdGVkJykgcmV0dXJuIGZhbHNlOyAvLyBJbnRlcnJ1cHQgcHJvY2Vzc2luZyBpZiBhIGdyb3VwIGhhcyBhbHJlYWR5IGZhaWxlZFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gUGFyc2xleVV0aWxzX19kZWZhdWx0LmFsbChwcm9taXNlcyk7XG4gICAgfSxcblxuICAgIC8vIEByZXR1cm5zIGEgcHJvbWlzZVxuICAgIF92YWxpZGF0ZUNvbnN0cmFpbnQ6IGZ1bmN0aW9uIF92YWxpZGF0ZUNvbnN0cmFpbnQodmFsdWUsIGNvbnN0cmFpbnQpIHtcbiAgICAgIHZhciBfdGhpczExID0gdGhpcztcblxuICAgICAgdmFyIHJlc3VsdCA9IGNvbnN0cmFpbnQudmFsaWRhdGUodmFsdWUsIHRoaXMpO1xuICAgICAgLy8gTWFwIGZhbHNlIHRvIGEgZmFpbGVkIHByb21pc2VcbiAgICAgIGlmIChmYWxzZSA9PT0gcmVzdWx0KSByZXN1bHQgPSAkLkRlZmVycmVkKCkucmVqZWN0KCk7XG4gICAgICAvLyBNYWtlIHN1cmUgd2UgcmV0dXJuIGEgcHJvbWlzZSBhbmQgdGhhdCB3ZSByZWNvcmQgZmFpbHVyZXNcbiAgICAgIHJldHVybiBQYXJzbGV5VXRpbHNfX2RlZmF1bHQuYWxsKFtyZXN1bHRdKS5mYWlsKGZ1bmN0aW9uIChlcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKCEoX3RoaXMxMS52YWxpZGF0aW9uUmVzdWx0IGluc3RhbmNlb2YgQXJyYXkpKSBfdGhpczExLnZhbGlkYXRpb25SZXN1bHQgPSBbXTtcbiAgICAgICAgX3RoaXMxMS52YWxpZGF0aW9uUmVzdWx0LnB1c2goe1xuICAgICAgICAgIGFzc2VydDogY29uc3RyYWludCxcbiAgICAgICAgICBlcnJvck1lc3NhZ2U6ICdzdHJpbmcnID09PSB0eXBlb2YgZXJyb3JNZXNzYWdlICYmIGVycm9yTWVzc2FnZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBAcmV0dXJucyBQYXJzbGV5IGZpZWxkIGNvbXB1dGVkIHZhbHVlIHRoYXQgY291bGQgYmUgb3ZlcnJpZGVkIG9yIGNvbmZpZ3VyZWQgaW4gRE9NXG4gICAgZ2V0VmFsdWU6IGZ1bmN0aW9uIGdldFZhbHVlKCkge1xuICAgICAgdmFyIHZhbHVlO1xuXG4gICAgICAvLyBWYWx1ZSBjb3VsZCBiZSBvdmVycmlkZW4gaW4gRE9NIG9yIHdpdGggZXhwbGljaXQgb3B0aW9uc1xuICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiB0aGlzLm9wdGlvbnMudmFsdWUpIHZhbHVlID0gdGhpcy5vcHRpb25zLnZhbHVlKHRoaXMpO2Vsc2UgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy5vcHRpb25zLnZhbHVlKSB2YWx1ZSA9IHRoaXMub3B0aW9ucy52YWx1ZTtlbHNlIHZhbHVlID0gdGhpcy4kZWxlbWVudC52YWwoKTtcblxuICAgICAgLy8gSGFuZGxlIHdyb25nIERPTSBvciBjb25maWd1cmF0aW9uc1xuICAgICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgdmFsdWUgfHwgbnVsbCA9PT0gdmFsdWUpIHJldHVybiAnJztcblxuICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZVdoaXRlc3BhY2UodmFsdWUpO1xuICAgIH0sXG5cbiAgICAvLyBBY3R1YWxpemUgb3B0aW9ucyB0aGF0IGNvdWxkIGhhdmUgY2hhbmdlIHNpbmNlIHByZXZpb3VzIHZhbGlkYXRpb25cbiAgICAvLyBSZS1iaW5kIGFjY29yZGluZ2x5IGNvbnN0cmFpbnRzIChjb3VsZCBiZSBzb21lIG5ldywgcmVtb3ZlZCBvciB1cGRhdGVkKVxuICAgIHJlZnJlc2hDb25zdHJhaW50czogZnVuY3Rpb24gcmVmcmVzaENvbnN0cmFpbnRzKCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWN0dWFsaXplT3B0aW9ucygpLl9iaW5kQ29uc3RyYWludHMoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgKiBBZGQgYSBuZXcgY29uc3RyYWludCB0byBhIGZpZWxkXG4gICAgKlxuICAgICogQHBhcmFtIHtTdHJpbmd9ICAgbmFtZVxuICAgICogQHBhcmFtIHtNaXhlZH0gICAgcmVxdWlyZW1lbnRzICAgICAgb3B0aW9uYWxcbiAgICAqIEBwYXJhbSB7TnVtYmVyfSAgIHByaW9yaXR5ICAgICAgICAgIG9wdGlvbmFsXG4gICAgKiBAcGFyYW0ge0Jvb2xlYW59ICBpc0RvbUNvbnN0cmFpbnQgICBvcHRpb25hbFxuICAgICovXG4gICAgYWRkQ29uc3RyYWludDogZnVuY3Rpb24gYWRkQ29uc3RyYWludChuYW1lLCByZXF1aXJlbWVudHMsIHByaW9yaXR5LCBpc0RvbUNvbnN0cmFpbnQpIHtcblxuICAgICAgaWYgKHdpbmRvdy5QYXJzbGV5Ll92YWxpZGF0b3JSZWdpc3RyeS52YWxpZGF0b3JzW25hbWVdKSB7XG4gICAgICAgIHZhciBjb25zdHJhaW50ID0gbmV3IENvbnN0cmFpbnRGYWN0b3J5KHRoaXMsIG5hbWUsIHJlcXVpcmVtZW50cywgcHJpb3JpdHksIGlzRG9tQ29uc3RyYWludCk7XG5cbiAgICAgICAgLy8gaWYgY29uc3RyYWludCBhbHJlYWR5IGV4aXN0LCBkZWxldGUgaXQgYW5kIHB1c2ggbmV3IHZlcnNpb25cbiAgICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0aGlzLmNvbnN0cmFpbnRzQnlOYW1lW2NvbnN0cmFpbnQubmFtZV0pIHRoaXMucmVtb3ZlQ29uc3RyYWludChjb25zdHJhaW50Lm5hbWUpO1xuXG4gICAgICAgIHRoaXMuY29uc3RyYWludHMucHVzaChjb25zdHJhaW50KTtcbiAgICAgICAgdGhpcy5jb25zdHJhaW50c0J5TmFtZVtjb25zdHJhaW50Lm5hbWVdID0gY29uc3RyYWludDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIFJlbW92ZSBhIGNvbnN0cmFpbnRcbiAgICByZW1vdmVDb25zdHJhaW50OiBmdW5jdGlvbiByZW1vdmVDb25zdHJhaW50KG5hbWUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb25zdHJhaW50cy5sZW5ndGg7IGkrKykgaWYgKG5hbWUgPT09IHRoaXMuY29uc3RyYWludHNbaV0ubmFtZSkge1xuICAgICAgICB0aGlzLmNvbnN0cmFpbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWxldGUgdGhpcy5jb25zdHJhaW50c0J5TmFtZVtuYW1lXTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBVcGRhdGUgYSBjb25zdHJhaW50IChSZW1vdmUgKyByZS1hZGQpXG4gICAgdXBkYXRlQ29uc3RyYWludDogZnVuY3Rpb24gdXBkYXRlQ29uc3RyYWludChuYW1lLCBwYXJhbWV0ZXJzLCBwcmlvcml0eSkge1xuICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlQ29uc3RyYWludChuYW1lKS5hZGRDb25zdHJhaW50KG5hbWUsIHBhcmFtZXRlcnMsIHByaW9yaXR5KTtcbiAgICB9LFxuXG4gICAgLy8gIyBJbnRlcm5hbHNcblxuICAgIC8vIEludGVybmFsIG9ubHkuXG4gICAgLy8gQmluZCBjb25zdHJhaW50cyBmcm9tIGNvbmZpZyArIG9wdGlvbnMgKyBET01cbiAgICBfYmluZENvbnN0cmFpbnRzOiBmdW5jdGlvbiBfYmluZENvbnN0cmFpbnRzKCkge1xuICAgICAgdmFyIGNvbnN0cmFpbnRzID0gW107XG4gICAgICB2YXIgY29uc3RyYWludHNCeU5hbWUgPSB7fTtcblxuICAgICAgLy8gY2xlYW4gYWxsIGV4aXN0aW5nIERPTSBjb25zdHJhaW50cyB0byBvbmx5IGtlZXAgamF2YXNjcmlwdCB1c2VyIGNvbnN0cmFpbnRzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIGlmIChmYWxzZSA9PT0gdGhpcy5jb25zdHJhaW50c1tpXS5pc0RvbUNvbnN0cmFpbnQpIHtcbiAgICAgICAgY29uc3RyYWludHMucHVzaCh0aGlzLmNvbnN0cmFpbnRzW2ldKTtcbiAgICAgICAgY29uc3RyYWludHNCeU5hbWVbdGhpcy5jb25zdHJhaW50c1tpXS5uYW1lXSA9IHRoaXMuY29uc3RyYWludHNbaV07XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29uc3RyYWludHMgPSBjb25zdHJhaW50cztcbiAgICAgIHRoaXMuY29uc3RyYWludHNCeU5hbWUgPSBjb25zdHJhaW50c0J5TmFtZTtcblxuICAgICAgLy8gdGhlbiByZS1hZGQgUGFyc2xleSBET00tQVBJIGNvbnN0cmFpbnRzXG4gICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMub3B0aW9ucykgdGhpcy5hZGRDb25zdHJhaW50KG5hbWUsIHRoaXMub3B0aW9uc1tuYW1lXSwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgLy8gZmluYWxseSwgYmluZCBzcGVjaWFsIEhUTUw1IGNvbnN0cmFpbnRzXG4gICAgICByZXR1cm4gdGhpcy5fYmluZEh0bWw1Q29uc3RyYWludHMoKTtcbiAgICB9LFxuXG4gICAgLy8gSW50ZXJuYWwgb25seS5cbiAgICAvLyBCaW5kIHNwZWNpZmljIEhUTUw1IGNvbnN0cmFpbnRzIHRvIGJlIEhUTUw1IGNvbXBsaWFudFxuICAgIF9iaW5kSHRtbDVDb25zdHJhaW50czogZnVuY3Rpb24gX2JpbmRIdG1sNUNvbnN0cmFpbnRzKCkge1xuICAgICAgLy8gaHRtbDUgcmVxdWlyZWRcbiAgICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdyZXF1aXJlZCcpIHx8IHRoaXMuJGVsZW1lbnQuYXR0cigncmVxdWlyZWQnKSkgdGhpcy5hZGRDb25zdHJhaW50KCdyZXF1aXJlZCcsIHRydWUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIC8vIGh0bWw1IHBhdHRlcm5cbiAgICAgIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIHRoaXMuJGVsZW1lbnQuYXR0cigncGF0dGVybicpKSB0aGlzLmFkZENvbnN0cmFpbnQoJ3BhdHRlcm4nLCB0aGlzLiRlbGVtZW50LmF0dHIoJ3BhdHRlcm4nKSwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgLy8gcmFuZ2VcbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMuJGVsZW1lbnQuYXR0cignbWluJykgJiYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ21heCcpKSB0aGlzLmFkZENvbnN0cmFpbnQoJ3JhbmdlJywgW3RoaXMuJGVsZW1lbnQuYXR0cignbWluJyksIHRoaXMuJGVsZW1lbnQuYXR0cignbWF4JyldLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICAvLyBIVE1MNSBtaW5cbiAgICAgIGVsc2UgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy4kZWxlbWVudC5hdHRyKCdtaW4nKSkgdGhpcy5hZGRDb25zdHJhaW50KCdtaW4nLCB0aGlzLiRlbGVtZW50LmF0dHIoJ21pbicpLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICAgIC8vIEhUTUw1IG1heFxuICAgICAgICBlbHNlIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMuJGVsZW1lbnQuYXR0cignbWF4JykpIHRoaXMuYWRkQ29uc3RyYWludCgnbWF4JywgdGhpcy4kZWxlbWVudC5hdHRyKCdtYXgnKSwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgLy8gbGVuZ3RoXG4gICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ21pbmxlbmd0aCcpICYmICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy4kZWxlbWVudC5hdHRyKCdtYXhsZW5ndGgnKSkgdGhpcy5hZGRDb25zdHJhaW50KCdsZW5ndGgnLCBbdGhpcy4kZWxlbWVudC5hdHRyKCdtaW5sZW5ndGgnKSwgdGhpcy4kZWxlbWVudC5hdHRyKCdtYXhsZW5ndGgnKV0sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIC8vIEhUTUw1IG1pbmxlbmd0aFxuICAgICAgZWxzZSBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ21pbmxlbmd0aCcpKSB0aGlzLmFkZENvbnN0cmFpbnQoJ21pbmxlbmd0aCcsIHRoaXMuJGVsZW1lbnQuYXR0cignbWlubGVuZ3RoJyksIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgICAgLy8gSFRNTDUgbWF4bGVuZ3RoXG4gICAgICAgIGVsc2UgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgdGhpcy4kZWxlbWVudC5hdHRyKCdtYXhsZW5ndGgnKSkgdGhpcy5hZGRDb25zdHJhaW50KCdtYXhsZW5ndGgnLCB0aGlzLiRlbGVtZW50LmF0dHIoJ21heGxlbmd0aCcpLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICAvLyBodG1sNSB0eXBlc1xuICAgICAgdmFyIHR5cGUgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ3R5cGUnKTtcblxuICAgICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgdHlwZSkgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIFNtYWxsIHNwZWNpYWwgY2FzZSBoZXJlIGZvciBIVE1MNSBudW1iZXI6IGludGVnZXIgdmFsaWRhdG9yIGlmIHN0ZXAgYXR0cmlidXRlIGlzIHVuZGVmaW5lZCBvciBhbiBpbnRlZ2VyIHZhbHVlLCBudW1iZXIgb3RoZXJ3aXNlXG4gICAgICBpZiAoJ251bWJlcicgPT09IHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkQ29uc3RyYWludCgndHlwZScsIFsnbnVtYmVyJywge1xuICAgICAgICAgIHN0ZXA6IHRoaXMuJGVsZW1lbnQuYXR0cignc3RlcCcpLFxuICAgICAgICAgIGJhc2U6IHRoaXMuJGVsZW1lbnQuYXR0cignbWluJykgfHwgdGhpcy4kZWxlbWVudC5hdHRyKCd2YWx1ZScpXG4gICAgICAgIH1dLCB1bmRlZmluZWQsIHRydWUpO1xuICAgICAgICAvLyBSZWd1bGFyIG90aGVyIEhUTUw1IHN1cHBvcnRlZCB0eXBlc1xuICAgICAgfSBlbHNlIGlmICgvXihlbWFpbHx1cmx8cmFuZ2UpJC9pLnRlc3QodHlwZSkpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5hZGRDb25zdHJhaW50KCd0eXBlJywgdHlwZSwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG9ubHkuXG4gICAgLy8gRmllbGQgaXMgcmVxdWlyZWQgaWYgaGF2ZSByZXF1aXJlZCBjb25zdHJhaW50IHdpdGhvdXQgYGZhbHNlYCB2YWx1ZVxuICAgIF9pc1JlcXVpcmVkOiBmdW5jdGlvbiBfaXNSZXF1aXJlZCgpIHtcbiAgICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHRoaXMuY29uc3RyYWludHNCeU5hbWUucmVxdWlyZWQpIHJldHVybiBmYWxzZTtcblxuICAgICAgcmV0dXJuIGZhbHNlICE9PSB0aGlzLmNvbnN0cmFpbnRzQnlOYW1lLnJlcXVpcmVkLnJlcXVpcmVtZW50cztcbiAgICB9LFxuXG4gICAgLy8gSW50ZXJuYWwgb25seS5cbiAgICAvLyBTaG9ydGN1dCB0byB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgX3RyaWdnZXI6IGZ1bmN0aW9uIF90cmlnZ2VyKGV2ZW50TmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcignZmllbGQ6JyArIGV2ZW50TmFtZSk7XG4gICAgfSxcblxuICAgIC8vIEludGVybmFsIG9ubHlcbiAgICAvLyBIYW5kbGVzIHdoaXRlc3BhY2UgaW4gYSB2YWx1ZVxuICAgIC8vIFVzZSBgZGF0YS1wYXJzbGV5LXdoaXRlc3BhY2U9XCJzcXVpc2hcImAgdG8gYXV0byBzcXVpc2ggaW5wdXQgdmFsdWVcbiAgICAvLyBVc2UgYGRhdGEtcGFyc2xleS13aGl0ZXNwYWNlPVwidHJpbVwiYCB0byBhdXRvIHRyaW0gaW5wdXQgdmFsdWVcbiAgICBfaGFuZGxlV2hpdGVzcGFjZTogZnVuY3Rpb24gX2hhbmRsZVdoaXRlc3BhY2UodmFsdWUpIHtcbiAgICAgIGlmICh0cnVlID09PSB0aGlzLm9wdGlvbnMudHJpbVZhbHVlKSBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2Fybk9uY2UoJ2RhdGEtcGFyc2xleS10cmltLXZhbHVlPVwidHJ1ZVwiIGlzIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgZGF0YS1wYXJzbGV5LXdoaXRlc3BhY2U9XCJ0cmltXCInKTtcblxuICAgICAgaWYgKCdzcXVpc2gnID09PSB0aGlzLm9wdGlvbnMud2hpdGVzcGFjZSkgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXHN7Mix9L2csICcgJyk7XG5cbiAgICAgIGlmICgndHJpbScgPT09IHRoaXMub3B0aW9ucy53aGl0ZXNwYWNlIHx8ICdzcXVpc2gnID09PSB0aGlzLm9wdGlvbnMud2hpdGVzcGFjZSB8fCB0cnVlID09PSB0aGlzLm9wdGlvbnMudHJpbVZhbHVlKSB2YWx1ZSA9IFBhcnNsZXlVdGlsc19fZGVmYXVsdC50cmltU3RyaW5nKHZhbHVlKTtcblxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH0sXG5cbiAgICAvLyBJbnRlcm5hbCBvbmx5LlxuICAgIC8vIFJldHVybnMgdGhlIGNvbnN0cmFpbnRzLCBncm91cGVkIGJ5IGRlc2NlbmRpbmcgcHJpb3JpdHkuXG4gICAgLy8gVGhlIHJlc3VsdCBpcyB0aHVzIGFuIGFycmF5IG9mIGFycmF5cyBvZiBjb25zdHJhaW50cy5cbiAgICBfZ2V0R3JvdXBlZENvbnN0cmFpbnRzOiBmdW5jdGlvbiBfZ2V0R3JvdXBlZENvbnN0cmFpbnRzKCkge1xuICAgICAgaWYgKGZhbHNlID09PSB0aGlzLm9wdGlvbnMucHJpb3JpdHlFbmFibGVkKSByZXR1cm4gW3RoaXMuY29uc3RyYWludHNdO1xuXG4gICAgICB2YXIgZ3JvdXBlZENvbnN0cmFpbnRzID0gW107XG4gICAgICB2YXIgaW5kZXggPSB7fTtcblxuICAgICAgLy8gQ3JlYXRlIGFycmF5IHVuaXF1ZSBvZiBwcmlvcml0aWVzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHAgPSB0aGlzLmNvbnN0cmFpbnRzW2ldLnByaW9yaXR5O1xuICAgICAgICBpZiAoIWluZGV4W3BdKSBncm91cGVkQ29uc3RyYWludHMucHVzaChpbmRleFtwXSA9IFtdKTtcbiAgICAgICAgaW5kZXhbcF0ucHVzaCh0aGlzLmNvbnN0cmFpbnRzW2ldKTtcbiAgICAgIH1cbiAgICAgIC8vIFNvcnQgdGhlbSBieSBwcmlvcml0eSBERVNDXG4gICAgICBncm91cGVkQ29uc3RyYWludHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICByZXR1cm4gYlswXS5wcmlvcml0eSAtIGFbMF0ucHJpb3JpdHk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGdyb3VwZWRDb25zdHJhaW50cztcbiAgICB9XG5cbiAgfTtcblxuICB2YXIgcGFyc2xleV9maWVsZCA9IFBhcnNsZXlGaWVsZDtcblxuICB2YXIgUGFyc2xleU11bHRpcGxlID0gZnVuY3Rpb24gUGFyc2xleU11bHRpcGxlKCkge1xuICAgIHRoaXMuX19jbGFzc19fID0gJ1BhcnNsZXlGaWVsZE11bHRpcGxlJztcbiAgfTtcblxuICBQYXJzbGV5TXVsdGlwbGUucHJvdG90eXBlID0ge1xuICAgIC8vIEFkZCBuZXcgYCRlbGVtZW50YCBzaWJsaW5nIGZvciBtdWx0aXBsZSBmaWVsZFxuICAgIGFkZEVsZW1lbnQ6IGZ1bmN0aW9uIGFkZEVsZW1lbnQoJGVsZW1lbnQpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRzLnB1c2goJGVsZW1lbnQpO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gU2VlIGBQYXJzbGV5RmllbGQucmVmcmVzaENvbnN0cmFpbnRzKClgXG4gICAgcmVmcmVzaENvbnN0cmFpbnRzOiBmdW5jdGlvbiByZWZyZXNoQ29uc3RyYWludHMoKSB7XG4gICAgICB2YXIgZmllbGRDb25zdHJhaW50cztcblxuICAgICAgdGhpcy5jb25zdHJhaW50cyA9IFtdO1xuXG4gICAgICAvLyBTZWxlY3QgbXVsdGlwbGUgc3BlY2lhbCB0cmVhdG1lbnRcbiAgICAgIGlmICh0aGlzLiRlbGVtZW50LmlzKCdzZWxlY3QnKSkge1xuICAgICAgICB0aGlzLmFjdHVhbGl6ZU9wdGlvbnMoKS5fYmluZENvbnN0cmFpbnRzKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIEdhdGhlciBhbGwgY29uc3RyYWludHMgZm9yIGVhY2ggaW5wdXQgaW4gdGhlIG11bHRpcGxlIGdyb3VwXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuJGVsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZWxlbWVudCBoYXZlIG5vdCBiZWVuIGR5bmFtaWNhbGx5IHJlbW92ZWQgc2luY2UgbGFzdCBiaW5kaW5nXG4gICAgICAgIGlmICghJCgnaHRtbCcpLmhhcyh0aGlzLiRlbGVtZW50c1tpXSkubGVuZ3RoKSB7XG4gICAgICAgICAgdGhpcy4kZWxlbWVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZmllbGRDb25zdHJhaW50cyA9IHRoaXMuJGVsZW1lbnRzW2ldLmRhdGEoJ1BhcnNsZXlGaWVsZE11bHRpcGxlJykucmVmcmVzaENvbnN0cmFpbnRzKCkuY29uc3RyYWludHM7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmaWVsZENvbnN0cmFpbnRzLmxlbmd0aDsgaisrKSB0aGlzLmFkZENvbnN0cmFpbnQoZmllbGRDb25zdHJhaW50c1tqXS5uYW1lLCBmaWVsZENvbnN0cmFpbnRzW2pdLnJlcXVpcmVtZW50cywgZmllbGRDb25zdHJhaW50c1tqXS5wcmlvcml0eSwgZmllbGRDb25zdHJhaW50c1tqXS5pc0RvbUNvbnN0cmFpbnQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gU2VlIGBQYXJzbGV5RmllbGQuZ2V0VmFsdWUoKWBcbiAgICBnZXRWYWx1ZTogZnVuY3Rpb24gZ2V0VmFsdWUoKSB7XG4gICAgICAvLyBWYWx1ZSBjb3VsZCBiZSBvdmVycmlkZW4gaW4gRE9NXG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHRoaXMub3B0aW9ucy52YWx1ZSkgcmV0dXJuIHRoaXMub3B0aW9ucy52YWx1ZSh0aGlzKTtlbHNlIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMub3B0aW9ucy52YWx1ZSkgcmV0dXJuIHRoaXMub3B0aW9ucy52YWx1ZTtcblxuICAgICAgLy8gUmFkaW8gaW5wdXQgY2FzZVxuICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaXMoJ2lucHV0W3R5cGU9cmFkaW9dJykpIHJldHVybiB0aGlzLl9maW5kUmVsYXRlZCgpLmZpbHRlcignOmNoZWNrZWQnKS52YWwoKSB8fCAnJztcblxuICAgICAgLy8gY2hlY2tib3ggaW5wdXQgY2FzZVxuICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaXMoJ2lucHV0W3R5cGU9Y2hlY2tib3hdJykpIHtcbiAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMuX2ZpbmRSZWxhdGVkKCkuZmlsdGVyKCc6Y2hlY2tlZCcpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKCQodGhpcykudmFsKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfVxuXG4gICAgICAvLyBTZWxlY3QgbXVsdGlwbGUgY2FzZVxuICAgICAgaWYgKHRoaXMuJGVsZW1lbnQuaXMoJ3NlbGVjdCcpICYmIG51bGwgPT09IHRoaXMuJGVsZW1lbnQudmFsKCkpIHJldHVybiBbXTtcblxuICAgICAgLy8gRGVmYXVsdCBjYXNlIHRoYXQgc2hvdWxkIG5ldmVyIGhhcHBlblxuICAgICAgcmV0dXJuIHRoaXMuJGVsZW1lbnQudmFsKCk7XG4gICAgfSxcblxuICAgIF9pbml0OiBmdW5jdGlvbiBfaW5pdCgpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnRzID0gW3RoaXMuJGVsZW1lbnRdO1xuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgdmFyIFBhcnNsZXlGYWN0b3J5ID0gZnVuY3Rpb24gUGFyc2xleUZhY3RvcnkoZWxlbWVudCwgb3B0aW9ucywgcGFyc2xleUZvcm1JbnN0YW5jZSkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuXG4gICAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIGFscmVhZHkgYmVlbiBib3VuZCwgcmV0dXJucyBpdHMgc2F2ZWQgUGFyc2xleSBpbnN0YW5jZVxuICAgIHZhciBzYXZlZHBhcnNsZXlGb3JtSW5zdGFuY2UgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ1BhcnNsZXknKTtcbiAgICBpZiAoc2F2ZWRwYXJzbGV5Rm9ybUluc3RhbmNlKSB7XG5cbiAgICAgIC8vIElmIHRoZSBzYXZlZCBpbnN0YW5jZSBoYXMgYmVlbiBib3VuZCB3aXRob3V0IGEgUGFyc2xleUZvcm0gcGFyZW50IGFuZCB0aGVyZSBpcyBvbmUgZ2l2ZW4gaW4gdGhpcyBjYWxsLCBhZGQgaXRcbiAgICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHBhcnNsZXlGb3JtSW5zdGFuY2UgJiYgc2F2ZWRwYXJzbGV5Rm9ybUluc3RhbmNlLnBhcmVudCA9PT0gd2luZG93LlBhcnNsZXkpIHtcbiAgICAgICAgc2F2ZWRwYXJzbGV5Rm9ybUluc3RhbmNlLnBhcmVudCA9IHBhcnNsZXlGb3JtSW5zdGFuY2U7XG4gICAgICAgIHNhdmVkcGFyc2xleUZvcm1JbnN0YW5jZS5fcmVzZXRPcHRpb25zKHNhdmVkcGFyc2xleUZvcm1JbnN0YW5jZS5vcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCdvYmplY3QnID09PSB0eXBlb2Ygb3B0aW9ucykge1xuICAgICAgICAkLmV4dGVuZChzYXZlZHBhcnNsZXlGb3JtSW5zdGFuY2Uub3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzYXZlZHBhcnNsZXlGb3JtSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgLy8gUGFyc2xleSBtdXN0IGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgRE9NIGVsZW1lbnQgb3IgalF1ZXJ5ICRlbGVtZW50XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdZb3UgbXVzdCBiaW5kIFBhcnNsZXkgb24gYW4gZXhpc3RpbmcgZWxlbWVudC4nKTtcblxuICAgIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHBhcnNsZXlGb3JtSW5zdGFuY2UgJiYgJ1BhcnNsZXlGb3JtJyAhPT0gcGFyc2xleUZvcm1JbnN0YW5jZS5fX2NsYXNzX18pIHRocm93IG5ldyBFcnJvcignUGFyZW50IGluc3RhbmNlIG11c3QgYmUgYSBQYXJzbGV5Rm9ybSBpbnN0YW5jZScpO1xuXG4gICAgdGhpcy5wYXJlbnQgPSBwYXJzbGV5Rm9ybUluc3RhbmNlIHx8IHdpbmRvdy5QYXJzbGV5O1xuICAgIHJldHVybiB0aGlzLmluaXQob3B0aW9ucyk7XG4gIH07XG5cbiAgUGFyc2xleUZhY3RvcnkucHJvdG90eXBlID0ge1xuICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQob3B0aW9ucykge1xuICAgICAgdGhpcy5fX2NsYXNzX18gPSAnUGFyc2xleSc7XG4gICAgICB0aGlzLl9fdmVyc2lvbl9fID0gJzIuNC40JztcbiAgICAgIHRoaXMuX19pZF9fID0gUGFyc2xleVV0aWxzX19kZWZhdWx0LmdlbmVyYXRlSUQoKTtcblxuICAgICAgLy8gUHJlLWNvbXB1dGUgb3B0aW9uc1xuICAgICAgdGhpcy5fcmVzZXRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgICAvLyBBIFBhcnNsZXlGb3JtIGluc3RhbmNlIGlzIG9idmlvdXNseSBhIGA8Zm9ybT5gIGVsZW1lbnQgYnV0IGFsc28gZXZlcnkgbm9kZSB0aGF0IGlzIG5vdCBhbiBpbnB1dCBhbmQgaGFzIHRoZSBgZGF0YS1wYXJzbGV5LXZhbGlkYXRlYCBhdHRyaWJ1dGVcbiAgICAgIGlmICh0aGlzLiRlbGVtZW50LmlzKCdmb3JtJykgfHwgUGFyc2xleVV0aWxzX19kZWZhdWx0LmNoZWNrQXR0cih0aGlzLiRlbGVtZW50LCB0aGlzLm9wdGlvbnMubmFtZXNwYWNlLCAndmFsaWRhdGUnKSAmJiAhdGhpcy4kZWxlbWVudC5pcyh0aGlzLm9wdGlvbnMuaW5wdXRzKSkgcmV0dXJuIHRoaXMuYmluZCgncGFyc2xleUZvcm0nKTtcblxuICAgICAgLy8gRXZlcnkgb3RoZXIgZWxlbWVudCBpcyBib3VuZCBhcyBhIGBQYXJzbGV5RmllbGRgIG9yIGBQYXJzbGV5RmllbGRNdWx0aXBsZWBcbiAgICAgIHJldHVybiB0aGlzLmlzTXVsdGlwbGUoKSA/IHRoaXMuaGFuZGxlTXVsdGlwbGUoKSA6IHRoaXMuYmluZCgncGFyc2xleUZpZWxkJyk7XG4gICAgfSxcblxuICAgIGlzTXVsdGlwbGU6IGZ1bmN0aW9uIGlzTXVsdGlwbGUoKSB7XG4gICAgICByZXR1cm4gdGhpcy4kZWxlbWVudC5pcygnaW5wdXRbdHlwZT1yYWRpb10sIGlucHV0W3R5cGU9Y2hlY2tib3hdJykgfHwgdGhpcy4kZWxlbWVudC5pcygnc2VsZWN0JykgJiYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ211bHRpcGxlJyk7XG4gICAgfSxcblxuICAgIC8vIE11bHRpcGxlcyBmaWVsZHMgYXJlIGEgcmVhbCBuaWdodG1hcmUgOihcbiAgICAvLyBNYXliZSBzb21lIHJlZmFjdG9yaW5nIHdvdWxkIGJlIGFwcHJlY2lhdGVkIGhlcmUuLi5cbiAgICBoYW5kbGVNdWx0aXBsZTogZnVuY3Rpb24gaGFuZGxlTXVsdGlwbGUoKSB7XG4gICAgICB2YXIgX3RoaXMxMiA9IHRoaXM7XG5cbiAgICAgIHZhciBuYW1lO1xuICAgICAgdmFyIG11bHRpcGxlO1xuICAgICAgdmFyIHBhcnNsZXlNdWx0aXBsZUluc3RhbmNlO1xuXG4gICAgICAvLyBIYW5kbGUgbXVsdGlwbGUgbmFtZVxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aXBsZSkgOyAvLyBXZSBhbHJlYWR5IGhhdmUgb3VyICdtdWx0aXBsZScgaWRlbnRpZmllclxuICAgICAgZWxzZSBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ25hbWUnKSAmJiB0aGlzLiRlbGVtZW50LmF0dHIoJ25hbWUnKS5sZW5ndGgpIHRoaXMub3B0aW9ucy5tdWx0aXBsZSA9IG5hbWUgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ25hbWUnKTtlbHNlIGlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHRoaXMuJGVsZW1lbnQuYXR0cignaWQnKSAmJiB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJykubGVuZ3RoKSB0aGlzLm9wdGlvbnMubXVsdGlwbGUgPSB0aGlzLiRlbGVtZW50LmF0dHIoJ2lkJyk7XG5cbiAgICAgIC8vIFNwZWNpYWwgc2VsZWN0IG11bHRpcGxlIGlucHV0XG4gICAgICBpZiAodGhpcy4kZWxlbWVudC5pcygnc2VsZWN0JykgJiYgJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiB0aGlzLiRlbGVtZW50LmF0dHIoJ211bHRpcGxlJykpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLm11bHRpcGxlID0gdGhpcy5vcHRpb25zLm11bHRpcGxlIHx8IHRoaXMuX19pZF9fO1xuICAgICAgICByZXR1cm4gdGhpcy5iaW5kKCdwYXJzbGV5RmllbGRNdWx0aXBsZScpO1xuXG4gICAgICAgIC8vIEVsc2UgZm9yIHJhZGlvIC8gY2hlY2tib3hlcywgd2UgbmVlZCBhIGBuYW1lYCBvciBgZGF0YS1wYXJzbGV5LW11bHRpcGxlYCB0byBwcm9wZXJseSBiaW5kIGl0XG4gICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMubXVsdGlwbGUpIHtcbiAgICAgICAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2FybignVG8gYmUgYm91bmQgYnkgUGFyc2xleSwgYSByYWRpbywgYSBjaGVja2JveCBhbmQgYSBtdWx0aXBsZSBzZWxlY3QgaW5wdXQgbXVzdCBoYXZlIGVpdGhlciBhIG5hbWUgb3IgYSBtdWx0aXBsZSBvcHRpb24uJywgdGhpcy4kZWxlbWVudCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIHNwZWNpYWwgY2hhcnNcbiAgICAgIHRoaXMub3B0aW9ucy5tdWx0aXBsZSA9IHRoaXMub3B0aW9ucy5tdWx0aXBsZS5yZXBsYWNlKC8oOnxcXC58XFxbfFxcXXxcXHt8XFx9fFxcJCkvZywgJycpO1xuXG4gICAgICAvLyBBZGQgcHJvcGVyIGBkYXRhLXBhcnNsZXktbXVsdGlwbGVgIHRvIHNpYmxpbmdzIGlmIHdlIGhhdmUgYSB2YWxpZCBtdWx0aXBsZSBuYW1lXG4gICAgICBpZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBuYW1lKSB7XG4gICAgICAgICQoJ2lucHV0W25hbWU9XCInICsgbmFtZSArICdcIl0nKS5lYWNoKGZ1bmN0aW9uIChpLCBpbnB1dCkge1xuICAgICAgICAgIGlmICgkKGlucHV0KS5pcygnaW5wdXRbdHlwZT1yYWRpb10sIGlucHV0W3R5cGU9Y2hlY2tib3hdJykpICQoaW5wdXQpLmF0dHIoX3RoaXMxMi5vcHRpb25zLm5hbWVzcGFjZSArICdtdWx0aXBsZScsIF90aGlzMTIub3B0aW9ucy5tdWx0aXBsZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBoZXJlIGlmIHdlIGRvbid0IGFscmVhZHkgaGF2ZSBhIHJlbGF0ZWQgbXVsdGlwbGUgaW5zdGFuY2Ugc2F2ZWRcbiAgICAgIHZhciAkcHJldmlvdXNseVJlbGF0ZWQgPSB0aGlzLl9maW5kUmVsYXRlZCgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkcHJldmlvdXNseVJlbGF0ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFyc2xleU11bHRpcGxlSW5zdGFuY2UgPSAkKCRwcmV2aW91c2x5UmVsYXRlZC5nZXQoaSkpLmRhdGEoJ1BhcnNsZXknKTtcbiAgICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgcGFyc2xleU11bHRpcGxlSW5zdGFuY2UpIHtcblxuICAgICAgICAgIGlmICghdGhpcy4kZWxlbWVudC5kYXRhKCdQYXJzbGV5RmllbGRNdWx0aXBsZScpKSB7XG4gICAgICAgICAgICBwYXJzbGV5TXVsdGlwbGVJbnN0YW5jZS5hZGRFbGVtZW50KHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIHNlY3JldCBQYXJzbGV5RmllbGQgaW5zdGFuY2UgZm9yIGV2ZXJ5IG11bHRpcGxlIGZpZWxkLiBJdCB3aWxsIGJlIHN0b3JlZCBpbiBgZGF0YSgnUGFyc2xleUZpZWxkTXVsdGlwbGUnKWBcbiAgICAgIC8vIEFuZCB3aWxsIGJlIHVzZWZ1bCBsYXRlciB0byBhY2Nlc3MgY2xhc3NpYyBgUGFyc2xleUZpZWxkYCBzdHVmZiB3aGlsZSBiZWluZyBpbiBhIGBQYXJzbGV5RmllbGRNdWx0aXBsZWAgaW5zdGFuY2VcbiAgICAgIHRoaXMuYmluZCgncGFyc2xleUZpZWxkJywgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiBwYXJzbGV5TXVsdGlwbGVJbnN0YW5jZSB8fCB0aGlzLmJpbmQoJ3BhcnNsZXlGaWVsZE11bHRpcGxlJyk7XG4gICAgfSxcblxuICAgIC8vIFJldHVybiBwcm9wZXIgYFBhcnNsZXlGb3JtYCwgYFBhcnNsZXlGaWVsZGAgb3IgYFBhcnNsZXlGaWVsZE11bHRpcGxlYFxuICAgIGJpbmQ6IGZ1bmN0aW9uIGJpbmQodHlwZSwgZG9Ob3RTdG9yZSkge1xuICAgICAgdmFyIHBhcnNsZXlJbnN0YW5jZTtcblxuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ3BhcnNsZXlGb3JtJzpcbiAgICAgICAgICBwYXJzbGV5SW5zdGFuY2UgPSAkLmV4dGVuZChuZXcgUGFyc2xleUZvcm0odGhpcy4kZWxlbWVudCwgdGhpcy5kb21PcHRpb25zLCB0aGlzLm9wdGlvbnMpLCBuZXcgUGFyc2xleUFic3RyYWN0KCksIHdpbmRvdy5QYXJzbGV5RXh0ZW5kKS5fYmluZEZpZWxkcygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwYXJzbGV5RmllbGQnOlxuICAgICAgICAgIHBhcnNsZXlJbnN0YW5jZSA9ICQuZXh0ZW5kKG5ldyBwYXJzbGV5X2ZpZWxkKHRoaXMuJGVsZW1lbnQsIHRoaXMuZG9tT3B0aW9ucywgdGhpcy5vcHRpb25zLCB0aGlzLnBhcmVudCksIG5ldyBQYXJzbGV5QWJzdHJhY3QoKSwgd2luZG93LlBhcnNsZXlFeHRlbmQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwYXJzbGV5RmllbGRNdWx0aXBsZSc6XG4gICAgICAgICAgcGFyc2xleUluc3RhbmNlID0gJC5leHRlbmQobmV3IHBhcnNsZXlfZmllbGQodGhpcy4kZWxlbWVudCwgdGhpcy5kb21PcHRpb25zLCB0aGlzLm9wdGlvbnMsIHRoaXMucGFyZW50KSwgbmV3IFBhcnNsZXlNdWx0aXBsZSgpLCBuZXcgUGFyc2xleUFic3RyYWN0KCksIHdpbmRvdy5QYXJzbGV5RXh0ZW5kKS5faW5pdCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0eXBlICsgJ2lzIG5vdCBhIHN1cHBvcnRlZCBQYXJzbGV5IHR5cGUnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5tdWx0aXBsZSkgUGFyc2xleVV0aWxzX19kZWZhdWx0LnNldEF0dHIodGhpcy4kZWxlbWVudCwgdGhpcy5vcHRpb25zLm5hbWVzcGFjZSwgJ211bHRpcGxlJywgdGhpcy5vcHRpb25zLm11bHRpcGxlKTtcblxuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgZG9Ob3RTdG9yZSkge1xuICAgICAgICB0aGlzLiRlbGVtZW50LmRhdGEoJ1BhcnNsZXlGaWVsZE11bHRpcGxlJywgcGFyc2xleUluc3RhbmNlKTtcblxuICAgICAgICByZXR1cm4gcGFyc2xleUluc3RhbmNlO1xuICAgICAgfVxuXG4gICAgICAvLyBTdG9yZSB0aGUgZnJlc2hseSBib3VuZCBpbnN0YW5jZSBpbiBhIERPTSBlbGVtZW50IGZvciBsYXRlciBhY2Nlc3MgdXNpbmcgalF1ZXJ5IGBkYXRhKClgXG4gICAgICB0aGlzLiRlbGVtZW50LmRhdGEoJ1BhcnNsZXknLCBwYXJzbGV5SW5zdGFuY2UpO1xuXG4gICAgICAvLyBUZWxsIHRoZSB3b3JsZCB3ZSBoYXZlIGEgbmV3IFBhcnNsZXlGb3JtIG9yIFBhcnNsZXlGaWVsZCBpbnN0YW5jZSFcbiAgICAgIHBhcnNsZXlJbnN0YW5jZS5fYWN0dWFsaXplVHJpZ2dlcnMoKTtcbiAgICAgIHBhcnNsZXlJbnN0YW5jZS5fdHJpZ2dlcignaW5pdCcpO1xuXG4gICAgICByZXR1cm4gcGFyc2xleUluc3RhbmNlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgdmVybnVtcyA9ICQuZm4uanF1ZXJ5LnNwbGl0KCcuJyk7XG4gIGlmIChwYXJzZUludCh2ZXJudW1zWzBdKSA8PSAxICYmIHBhcnNlSW50KHZlcm51bXNbMV0pIDwgOCkge1xuICAgIHRocm93IFwiVGhlIGxvYWRlZCB2ZXJzaW9uIG9mIGpRdWVyeSBpcyB0b28gb2xkLiBQbGVhc2UgdXBncmFkZSB0byAxLjgueCBvciBiZXR0ZXIuXCI7XG4gIH1cbiAgaWYgKCF2ZXJudW1zLmZvckVhY2gpIHtcbiAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2FybignUGFyc2xleSByZXF1aXJlcyBFUzUgdG8gcnVuIHByb3Blcmx5LiBQbGVhc2UgaW5jbHVkZSBodHRwczovL2dpdGh1Yi5jb20vZXMtc2hpbXMvZXM1LXNoaW0nKTtcbiAgfVxuICAvLyBJbmhlcml0IGBvbmAsIGBvZmZgICYgYHRyaWdnZXJgIHRvIFBhcnNsZXk6XG4gIHZhciBQYXJzbGV5ID0gJC5leHRlbmQobmV3IFBhcnNsZXlBYnN0cmFjdCgpLCB7XG4gICAgJGVsZW1lbnQ6ICQoZG9jdW1lbnQpLFxuICAgIGFjdHVhbGl6ZU9wdGlvbnM6IG51bGwsXG4gICAgX3Jlc2V0T3B0aW9uczogbnVsbCxcbiAgICBGYWN0b3J5OiBQYXJzbGV5RmFjdG9yeSxcbiAgICB2ZXJzaW9uOiAnMi40LjQnXG4gIH0pO1xuXG4gIC8vIFN1cHBsZW1lbnQgUGFyc2xleUZpZWxkIGFuZCBGb3JtIHdpdGggUGFyc2xleUFic3RyYWN0XG4gIC8vIFRoaXMgd2F5LCB0aGUgY29uc3RydWN0b3JzIHdpbGwgaGF2ZSBhY2Nlc3MgdG8gdGhvc2UgbWV0aG9kc1xuICAkLmV4dGVuZChwYXJzbGV5X2ZpZWxkLnByb3RvdHlwZSwgUGFyc2xleVVJLkZpZWxkLCBQYXJzbGV5QWJzdHJhY3QucHJvdG90eXBlKTtcbiAgJC5leHRlbmQoUGFyc2xleUZvcm0ucHJvdG90eXBlLCBQYXJzbGV5VUkuRm9ybSwgUGFyc2xleUFic3RyYWN0LnByb3RvdHlwZSk7XG4gIC8vIEluaGVyaXQgYWN0dWFsaXplT3B0aW9ucyBhbmQgX3Jlc2V0T3B0aW9uczpcbiAgJC5leHRlbmQoUGFyc2xleUZhY3RvcnkucHJvdG90eXBlLCBQYXJzbGV5QWJzdHJhY3QucHJvdG90eXBlKTtcblxuICAvLyAjIyMgalF1ZXJ5IEFQSVxuICAvLyBgJCgnLmVsZW0nKS5wYXJzbGV5KG9wdGlvbnMpYCBvciBgJCgnLmVsZW0nKS5wc2x5KG9wdGlvbnMpYFxuICAkLmZuLnBhcnNsZXkgPSAkLmZuLnBzbHkgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIGlmICh0aGlzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHZhciBpbnN0YW5jZXMgPSBbXTtcblxuICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaW5zdGFuY2VzLnB1c2goJCh0aGlzKS5wYXJzbGV5KG9wdGlvbnMpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gaW5zdGFuY2VzO1xuICAgIH1cblxuICAgIC8vIFJldHVybiB1bmRlZmluZWQgaWYgYXBwbGllZCB0byBub24gZXhpc3RpbmcgRE9NIGVsZW1lbnRcbiAgICBpZiAoISQodGhpcykubGVuZ3RoKSB7XG4gICAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2FybignWW91IG11c3QgYmluZCBQYXJzbGV5IG9uIGFuIGV4aXN0aW5nIGVsZW1lbnQuJyk7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFBhcnNsZXlGYWN0b3J5KHRoaXMsIG9wdGlvbnMpO1xuICB9O1xuXG4gIC8vICMjIyBQYXJzbGV5RmllbGQgYW5kIFBhcnNsZXlGb3JtIGV4dGVuc2lvblxuICAvLyBFbnN1cmUgdGhlIGV4dGVuc2lvbiBpcyBub3cgZGVmaW5lZCBpZiBpdCB3YXNuJ3QgcHJldmlvdXNseVxuICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiB3aW5kb3cuUGFyc2xleUV4dGVuZCkgd2luZG93LlBhcnNsZXlFeHRlbmQgPSB7fTtcblxuICAvLyAjIyMgUGFyc2xleSBjb25maWdcbiAgLy8gSW5oZXJpdCBmcm9tIFBhcnNsZXlEZWZhdWx0LCBhbmQgY29weSBvdmVyIGFueSBleGlzdGluZyB2YWx1ZXNcbiAgUGFyc2xleS5vcHRpb25zID0gJC5leHRlbmQoUGFyc2xleVV0aWxzX19kZWZhdWx0Lm9iamVjdENyZWF0ZShQYXJzbGV5RGVmYXVsdHMpLCB3aW5kb3cuUGFyc2xleUNvbmZpZyk7XG4gIHdpbmRvdy5QYXJzbGV5Q29uZmlnID0gUGFyc2xleS5vcHRpb25zOyAvLyBPbGQgd2F5IG9mIGFjY2Vzc2luZyBnbG9iYWwgb3B0aW9uc1xuXG4gIC8vICMjIyBHbG9iYWxzXG4gIHdpbmRvdy5QYXJzbGV5ID0gd2luZG93LnBzbHkgPSBQYXJzbGV5O1xuICB3aW5kb3cuUGFyc2xleVV0aWxzID0gUGFyc2xleVV0aWxzX19kZWZhdWx0O1xuXG4gIC8vICMjIyBEZWZpbmUgbWV0aG9kcyB0aGF0IGZvcndhcmQgdG8gdGhlIHJlZ2lzdHJ5LCBhbmQgZGVwcmVjYXRlIGFsbCBhY2Nlc3MgZXhjZXB0IHRocm91Z2ggd2luZG93LlBhcnNsZXlcbiAgdmFyIHJlZ2lzdHJ5ID0gd2luZG93LlBhcnNsZXkuX3ZhbGlkYXRvclJlZ2lzdHJ5ID0gbmV3IFBhcnNsZXlWYWxpZGF0b3JSZWdpc3RyeSh3aW5kb3cuUGFyc2xleUNvbmZpZy52YWxpZGF0b3JzLCB3aW5kb3cuUGFyc2xleUNvbmZpZy5pMThuKTtcbiAgd2luZG93LlBhcnNsZXlWYWxpZGF0b3IgPSB7fTtcbiAgJC5lYWNoKCdzZXRMb2NhbGUgYWRkQ2F0YWxvZyBhZGRNZXNzYWdlIGFkZE1lc3NhZ2VzIGdldEVycm9yTWVzc2FnZSBmb3JtYXRNZXNzYWdlIGFkZFZhbGlkYXRvciB1cGRhdGVWYWxpZGF0b3IgcmVtb3ZlVmFsaWRhdG9yJy5zcGxpdCgnICcpLCBmdW5jdGlvbiAoaSwgbWV0aG9kKSB7XG4gICAgd2luZG93LlBhcnNsZXlbbWV0aG9kXSA9ICQucHJveHkocmVnaXN0cnksIG1ldGhvZCk7XG4gICAgd2luZG93LlBhcnNsZXlWYWxpZGF0b3JbbWV0aG9kXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfd2luZG93JFBhcnNsZXk7XG5cbiAgICAgIFBhcnNsZXlVdGlsc19fZGVmYXVsdC53YXJuT25jZSgnQWNjZXNzaW5nIHRoZSBtZXRob2QgXFwnJyArIG1ldGhvZCArICdcXCcgdGhyb3VnaCBQYXJzbGV5VmFsaWRhdG9yIGlzIGRlcHJlY2F0ZWQuIFNpbXBseSBjYWxsIFxcJ3dpbmRvdy5QYXJzbGV5LicgKyBtZXRob2QgKyAnKC4uLilcXCcnKTtcbiAgICAgIHJldHVybiAoX3dpbmRvdyRQYXJzbGV5ID0gd2luZG93LlBhcnNsZXkpW21ldGhvZF0uYXBwbHkoX3dpbmRvdyRQYXJzbGV5LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vICMjIyBQYXJzbGV5VUlcbiAgLy8gRGVwcmVjYXRlZCBnbG9iYWwgb2JqZWN0XG4gIHdpbmRvdy5QYXJzbGV5LlVJID0gUGFyc2xleVVJO1xuICB3aW5kb3cuUGFyc2xleVVJID0ge1xuICAgIHJlbW92ZUVycm9yOiBmdW5jdGlvbiByZW1vdmVFcnJvcihpbnN0YW5jZSwgbmFtZSwgZG9Ob3RVcGRhdGVDbGFzcykge1xuICAgICAgdmFyIHVwZGF0ZUNsYXNzID0gdHJ1ZSAhPT0gZG9Ob3RVcGRhdGVDbGFzcztcbiAgICAgIFBhcnNsZXlVdGlsc19fZGVmYXVsdC53YXJuT25jZSgnQWNjZXNzaW5nIFBhcnNsZXlVSSBpcyBkZXByZWNhdGVkLiBDYWxsIFxcJ3JlbW92ZUVycm9yXFwnIG9uIHRoZSBpbnN0YW5jZSBkaXJlY3RseS4gUGxlYXNlIGNvbW1lbnQgaW4gaXNzdWUgMTA3MyBhcyB0byB5b3VyIG5lZWQgdG8gY2FsbCB0aGlzIG1ldGhvZC4nKTtcbiAgICAgIHJldHVybiBpbnN0YW5jZS5yZW1vdmVFcnJvcihuYW1lLCB7IHVwZGF0ZUNsYXNzOiB1cGRhdGVDbGFzcyB9KTtcbiAgICB9LFxuICAgIGdldEVycm9yc01lc3NhZ2VzOiBmdW5jdGlvbiBnZXRFcnJvcnNNZXNzYWdlcyhpbnN0YW5jZSkge1xuICAgICAgUGFyc2xleVV0aWxzX19kZWZhdWx0Lndhcm5PbmNlKCdBY2Nlc3NpbmcgUGFyc2xleVVJIGlzIGRlcHJlY2F0ZWQuIENhbGwgXFwnZ2V0RXJyb3JzTWVzc2FnZXNcXCcgb24gdGhlIGluc3RhbmNlIGRpcmVjdGx5LicpO1xuICAgICAgcmV0dXJuIGluc3RhbmNlLmdldEVycm9yc01lc3NhZ2VzKCk7XG4gICAgfVxuICB9O1xuICAkLmVhY2goJ2FkZEVycm9yIHVwZGF0ZUVycm9yJy5zcGxpdCgnICcpLCBmdW5jdGlvbiAoaSwgbWV0aG9kKSB7XG4gICAgd2luZG93LlBhcnNsZXlVSVttZXRob2RdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBuYW1lLCBtZXNzYWdlLCBhc3NlcnQsIGRvTm90VXBkYXRlQ2xhc3MpIHtcbiAgICAgIHZhciB1cGRhdGVDbGFzcyA9IHRydWUgIT09IGRvTm90VXBkYXRlQ2xhc3M7XG4gICAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2Fybk9uY2UoJ0FjY2Vzc2luZyBQYXJzbGV5VUkgaXMgZGVwcmVjYXRlZC4gQ2FsbCBcXCcnICsgbWV0aG9kICsgJ1xcJyBvbiB0aGUgaW5zdGFuY2UgZGlyZWN0bHkuIFBsZWFzZSBjb21tZW50IGluIGlzc3VlIDEwNzMgYXMgdG8geW91ciBuZWVkIHRvIGNhbGwgdGhpcyBtZXRob2QuJyk7XG4gICAgICByZXR1cm4gaW5zdGFuY2VbbWV0aG9kXShuYW1lLCB7IG1lc3NhZ2U6IG1lc3NhZ2UsIGFzc2VydDogYXNzZXJ0LCB1cGRhdGVDbGFzczogdXBkYXRlQ2xhc3MgfSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gIyMjIFBBUlNMRVkgYXV0by1iaW5kaW5nXG4gIC8vIFByZXZlbnQgaXQgYnkgc2V0dGluZyBgUGFyc2xleUNvbmZpZy5hdXRvQmluZGAgdG8gYGZhbHNlYFxuICBpZiAoZmFsc2UgIT09IHdpbmRvdy5QYXJzbGV5Q29uZmlnLmF1dG9CaW5kKSB7XG4gICAgJChmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBXb3JrcyBvbmx5IG9uIGBkYXRhLXBhcnNsZXktdmFsaWRhdGVgLlxuICAgICAgaWYgKCQoJ1tkYXRhLXBhcnNsZXktdmFsaWRhdGVdJykubGVuZ3RoKSAkKCdbZGF0YS1wYXJzbGV5LXZhbGlkYXRlXScpLnBhcnNsZXkoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBvID0gJCh7fSk7XG4gIHZhciBkZXByZWNhdGVkID0gZnVuY3Rpb24gZGVwcmVjYXRlZCgpIHtcbiAgICBQYXJzbGV5VXRpbHNfX2RlZmF1bHQud2Fybk9uY2UoXCJQYXJzbGV5J3MgcHVic3ViIG1vZHVsZSBpcyBkZXByZWNhdGVkOyB1c2UgdGhlICdvbicgYW5kICdvZmYnIG1ldGhvZHMgb24gcGFyc2xleSBpbnN0YW5jZXMgb3Igd2luZG93LlBhcnNsZXlcIik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhbiBldmVudCBoYW5kbGVyIHRoYXQgY2FsbHMgYGZuYCB3aXRoIHRoZSBhcmd1bWVudHMgaXQgZXhwZWN0c1xuICBmdW5jdGlvbiBhZGFwdChmbiwgY29udGV4dCkge1xuICAgIC8vIFN0b3JlIHRvIGFsbG93IHVuYmluZGluZ1xuICAgIGlmICghZm4ucGFyc2xleUFkYXB0ZWRDYWxsYmFjaykge1xuICAgICAgZm4ucGFyc2xleUFkYXB0ZWRDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICBhcmdzLnVuc2hpZnQodGhpcyk7XG4gICAgICAgIGZuLmFwcGx5KGNvbnRleHQgfHwgbywgYXJncyk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZm4ucGFyc2xleUFkYXB0ZWRDYWxsYmFjaztcbiAgfVxuXG4gIHZhciBldmVudFByZWZpeCA9ICdwYXJzbGV5Oic7XG4gIC8vIENvbnZlcnRzICdwYXJzbGV5OmZvcm06dmFsaWRhdGUnIGludG8gJ2Zvcm06dmFsaWRhdGUnXG4gIGZ1bmN0aW9uIGV2ZW50TmFtZShuYW1lKSB7XG4gICAgaWYgKG5hbWUubGFzdEluZGV4T2YoZXZlbnRQcmVmaXgsIDApID09PSAwKSByZXR1cm4gbmFtZS5zdWJzdHIoZXZlbnRQcmVmaXgubGVuZ3RoKTtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuXG4gIC8vICQubGlzdGVuIGlzIGRlcHJlY2F0ZWQuIFVzZSBQYXJzbGV5Lm9uIGluc3RlYWQuXG4gICQubGlzdGVuID0gZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNvbnRleHQ7XG4gICAgZGVwcmVjYXRlZCgpO1xuICAgIGlmICgnb2JqZWN0JyA9PT0gdHlwZW9mIGFyZ3VtZW50c1sxXSAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgYXJndW1lbnRzWzJdKSB7XG4gICAgICBjb250ZXh0ID0gYXJndW1lbnRzWzFdO1xuICAgICAgY2FsbGJhY2sgPSBhcmd1bWVudHNbMl07XG4gICAgfVxuXG4gICAgaWYgKCdmdW5jdGlvbicgIT09IHR5cGVvZiBjYWxsYmFjaykgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBwYXJhbWV0ZXJzJyk7XG5cbiAgICB3aW5kb3cuUGFyc2xleS5vbihldmVudE5hbWUobmFtZSksIGFkYXB0KGNhbGxiYWNrLCBjb250ZXh0KSk7XG4gIH07XG5cbiAgJC5saXN0ZW5UbyA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgbmFtZSwgZm4pIHtcbiAgICBkZXByZWNhdGVkKCk7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBwYXJzbGV5X2ZpZWxkKSAmJiAhKGluc3RhbmNlIGluc3RhbmNlb2YgUGFyc2xleUZvcm0pKSB0aHJvdyBuZXcgRXJyb3IoJ011c3QgZ2l2ZSBQYXJzbGV5IGluc3RhbmNlJyk7XG5cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBuYW1lIHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBmbikgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBwYXJhbWV0ZXJzJyk7XG5cbiAgICBpbnN0YW5jZS5vbihldmVudE5hbWUobmFtZSksIGFkYXB0KGZuKSk7XG4gIH07XG5cbiAgJC51bnN1YnNjcmliZSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIGRlcHJlY2F0ZWQoKTtcbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBuYW1lIHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBmbikgdGhyb3cgbmV3IEVycm9yKCdXcm9uZyBhcmd1bWVudHMnKTtcbiAgICB3aW5kb3cuUGFyc2xleS5vZmYoZXZlbnROYW1lKG5hbWUpLCBmbi5wYXJzbGV5QWRhcHRlZENhbGxiYWNrKTtcbiAgfTtcblxuICAkLnVuc3Vic2NyaWJlVG8gPSBmdW5jdGlvbiAoaW5zdGFuY2UsIG5hbWUpIHtcbiAgICBkZXByZWNhdGVkKCk7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBwYXJzbGV5X2ZpZWxkKSAmJiAhKGluc3RhbmNlIGluc3RhbmNlb2YgUGFyc2xleUZvcm0pKSB0aHJvdyBuZXcgRXJyb3IoJ011c3QgZ2l2ZSBQYXJzbGV5IGluc3RhbmNlJyk7XG4gICAgaW5zdGFuY2Uub2ZmKGV2ZW50TmFtZShuYW1lKSk7XG4gIH07XG5cbiAgJC51bnN1YnNjcmliZUFsbCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgZGVwcmVjYXRlZCgpO1xuICAgIHdpbmRvdy5QYXJzbGV5Lm9mZihldmVudE5hbWUobmFtZSkpO1xuICAgICQoJ2Zvcm0saW5wdXQsdGV4dGFyZWEsc2VsZWN0JykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSAkKHRoaXMpLmRhdGEoJ1BhcnNsZXknKTtcbiAgICAgIGlmIChpbnN0YW5jZSkge1xuICAgICAgICBpbnN0YW5jZS5vZmYoZXZlbnROYW1lKG5hbWUpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyAkLmVtaXQgaXMgZGVwcmVjYXRlZC4gVXNlIGpRdWVyeSBldmVudHMgaW5zdGVhZC5cbiAgJC5lbWl0ID0gZnVuY3Rpb24gKG5hbWUsIGluc3RhbmNlKSB7XG4gICAgdmFyIF9pbnN0YW5jZTtcblxuICAgIGRlcHJlY2F0ZWQoKTtcbiAgICB2YXIgaW5zdGFuY2VHaXZlbiA9IGluc3RhbmNlIGluc3RhbmNlb2YgcGFyc2xleV9maWVsZCB8fCBpbnN0YW5jZSBpbnN0YW5jZW9mIFBhcnNsZXlGb3JtO1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCBpbnN0YW5jZUdpdmVuID8gMiA6IDEpO1xuICAgIGFyZ3MudW5zaGlmdChldmVudE5hbWUobmFtZSkpO1xuICAgIGlmICghaW5zdGFuY2VHaXZlbikge1xuICAgICAgaW5zdGFuY2UgPSB3aW5kb3cuUGFyc2xleTtcbiAgICB9XG4gICAgKF9pbnN0YW5jZSA9IGluc3RhbmNlKS50cmlnZ2VyLmFwcGx5KF9pbnN0YW5jZSwgX3RvQ29uc3VtYWJsZUFycmF5KGFyZ3MpKTtcbiAgfTtcblxuICB2YXIgcHVic3ViID0ge307XG5cbiAgJC5leHRlbmQodHJ1ZSwgUGFyc2xleSwge1xuICAgIGFzeW5jVmFsaWRhdG9yczoge1xuICAgICAgJ2RlZmF1bHQnOiB7XG4gICAgICAgIGZuOiBmdW5jdGlvbiBmbih4aHIpIHtcbiAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBvbmx5IHN0YXR1cyAyeHggYXJlIGRlZW1lZCBzdWNjZXNzZnVsLlxuICAgICAgICAgIC8vIE5vdGU6IHdlIHVzZSBzdGF0dXMgaW5zdGVhZCBvZiBzdGF0ZSgpIGJlY2F1c2UgcmVzcG9uc2VzIHdpdGggc3RhdHVzIDIwMFxuICAgICAgICAgIC8vIGJ1dCBpbnZhbGlkIG1lc3NhZ2VzIChlLmcuIGFuIGVtcHR5IGJvZHkgZm9yIGNvbnRlbnQgdHlwZSBzZXQgdG8gSlNPTikgd2lsbFxuICAgICAgICAgIC8vIHJlc3VsdCBpbiBzdGF0ZSgpID09PSAncmVqZWN0ZWQnLlxuICAgICAgICAgIHJldHVybiB4aHIuc3RhdHVzID49IDIwMCAmJiB4aHIuc3RhdHVzIDwgMzAwO1xuICAgICAgICB9LFxuICAgICAgICB1cmw6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcmV2ZXJzZToge1xuICAgICAgICBmbjogZnVuY3Rpb24gZm4oeGhyKSB7XG4gICAgICAgICAgLy8gSWYgcmV2ZXJzZSBvcHRpb24gaXMgc2V0LCBhIGZhaWxpbmcgYWpheCByZXF1ZXN0IGlzIGNvbnNpZGVyZWQgc3VjY2Vzc2Z1bFxuICAgICAgICAgIHJldHVybiB4aHIuc3RhdHVzIDwgMjAwIHx8IHhoci5zdGF0dXMgPj0gMzAwO1xuICAgICAgICB9LFxuICAgICAgICB1cmw6IGZhbHNlXG4gICAgICB9XG4gICAgfSxcblxuICAgIGFkZEFzeW5jVmFsaWRhdG9yOiBmdW5jdGlvbiBhZGRBc3luY1ZhbGlkYXRvcihuYW1lLCBmbiwgdXJsLCBvcHRpb25zKSB7XG4gICAgICBQYXJzbGV5LmFzeW5jVmFsaWRhdG9yc1tuYW1lXSA9IHtcbiAgICAgICAgZm46IGZuLFxuICAgICAgICB1cmw6IHVybCB8fCBmYWxzZSxcbiAgICAgICAgb3B0aW9uczogb3B0aW9ucyB8fCB7fVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gIH0pO1xuXG4gIFBhcnNsZXkuYWRkVmFsaWRhdG9yKCdyZW1vdGUnLCB7XG4gICAgcmVxdWlyZW1lbnRUeXBlOiB7XG4gICAgICAnJzogJ3N0cmluZycsXG4gICAgICAndmFsaWRhdG9yJzogJ3N0cmluZycsXG4gICAgICAncmV2ZXJzZSc6ICdib29sZWFuJyxcbiAgICAgICdvcHRpb25zJzogJ29iamVjdCdcbiAgICB9LFxuXG4gICAgdmFsaWRhdGVTdHJpbmc6IGZ1bmN0aW9uIHZhbGlkYXRlU3RyaW5nKHZhbHVlLCB1cmwsIG9wdGlvbnMsIGluc3RhbmNlKSB7XG4gICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgdmFyIGFqYXhPcHRpb25zO1xuICAgICAgdmFyIGNzcjtcbiAgICAgIHZhciB2YWxpZGF0b3IgPSBvcHRpb25zLnZhbGlkYXRvciB8fCAodHJ1ZSA9PT0gb3B0aW9ucy5yZXZlcnNlID8gJ3JldmVyc2UnIDogJ2RlZmF1bHQnKTtcblxuICAgICAgaWYgKCd1bmRlZmluZWQnID09PSB0eXBlb2YgUGFyc2xleS5hc3luY1ZhbGlkYXRvcnNbdmFsaWRhdG9yXSkgdGhyb3cgbmV3IEVycm9yKCdDYWxsaW5nIGFuIHVuZGVmaW5lZCBhc3luYyB2YWxpZGF0b3I6IGAnICsgdmFsaWRhdG9yICsgJ2AnKTtcblxuICAgICAgdXJsID0gUGFyc2xleS5hc3luY1ZhbGlkYXRvcnNbdmFsaWRhdG9yXS51cmwgfHwgdXJsO1xuXG4gICAgICAvLyBGaWxsIGN1cnJlbnQgdmFsdWVcbiAgICAgIGlmICh1cmwuaW5kZXhPZigne3ZhbHVlfScpID4gLTEpIHtcbiAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoJ3t2YWx1ZX0nLCBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFbaW5zdGFuY2UuJGVsZW1lbnQuYXR0cignbmFtZScpIHx8IGluc3RhbmNlLiRlbGVtZW50LmF0dHIoJ2lkJyldID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIC8vIE1lcmdlIG9wdGlvbnMgcGFzc2VkIGluIGZyb20gdGhlIGZ1bmN0aW9uIHdpdGggdGhlIG9uZXMgaW4gdGhlIGF0dHJpYnV0ZVxuICAgICAgdmFyIHJlbW90ZU9wdGlvbnMgPSAkLmV4dGVuZCh0cnVlLCBvcHRpb25zLm9wdGlvbnMgfHwge30sIFBhcnNsZXkuYXN5bmNWYWxpZGF0b3JzW3ZhbGlkYXRvcl0ub3B0aW9ucyk7XG5cbiAgICAgIC8vIEFsbCBgJC5hamF4KG9wdGlvbnMpYCBjb3VsZCBiZSBvdmVycmlkZGVuIG9yIGV4dGVuZGVkIGRpcmVjdGx5IGZyb20gRE9NIGluIGBkYXRhLXBhcnNsZXktcmVtb3RlLW9wdGlvbnNgXG4gICAgICBhamF4T3B0aW9ucyA9ICQuZXh0ZW5kKHRydWUsIHt9LCB7XG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICB0eXBlOiAnR0VUJ1xuICAgICAgfSwgcmVtb3RlT3B0aW9ucyk7XG5cbiAgICAgIC8vIEdlbmVyYXRlIHN0b3JlIGtleSBiYXNlZCBvbiBhamF4IG9wdGlvbnNcbiAgICAgIGluc3RhbmNlLnRyaWdnZXIoJ2ZpZWxkOmFqYXhvcHRpb25zJywgaW5zdGFuY2UsIGFqYXhPcHRpb25zKTtcblxuICAgICAgY3NyID0gJC5wYXJhbShhamF4T3B0aW9ucyk7XG5cbiAgICAgIC8vIEluaXRpYWxpc2UgcXVlcnJ5IGNhY2hlXG4gICAgICBpZiAoJ3VuZGVmaW5lZCcgPT09IHR5cGVvZiBQYXJzbGV5Ll9yZW1vdGVDYWNoZSkgUGFyc2xleS5fcmVtb3RlQ2FjaGUgPSB7fTtcblxuICAgICAgLy8gVHJ5IHRvIHJldHJpZXZlIHN0b3JlZCB4aHJcbiAgICAgIHZhciB4aHIgPSBQYXJzbGV5Ll9yZW1vdGVDYWNoZVtjc3JdID0gUGFyc2xleS5fcmVtb3RlQ2FjaGVbY3NyXSB8fCAkLmFqYXgoYWpheE9wdGlvbnMpO1xuXG4gICAgICB2YXIgaGFuZGxlWGhyID0gZnVuY3Rpb24gaGFuZGxlWGhyKCkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gUGFyc2xleS5hc3luY1ZhbGlkYXRvcnNbdmFsaWRhdG9yXS5mbi5jYWxsKGluc3RhbmNlLCB4aHIsIHVybCwgb3B0aW9ucyk7XG4gICAgICAgIGlmICghcmVzdWx0KSAvLyBNYXAgZmFsc3kgcmVzdWx0cyB0byByZWplY3RlZCBwcm9taXNlXG4gICAgICAgICAgcmVzdWx0ID0gJC5EZWZlcnJlZCgpLnJlamVjdCgpO1xuICAgICAgICByZXR1cm4gJC53aGVuKHJlc3VsdCk7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4geGhyLnRoZW4oaGFuZGxlWGhyLCBoYW5kbGVYaHIpO1xuICAgIH0sXG5cbiAgICBwcmlvcml0eTogLTFcbiAgfSk7XG5cbiAgUGFyc2xleS5vbignZm9ybTpzdWJtaXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2xleS5fcmVtb3RlQ2FjaGUgPSB7fTtcbiAgfSk7XG5cbiAgd2luZG93LlBhcnNsZXlFeHRlbmQuYWRkQXN5bmNWYWxpZGF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2xleVV0aWxzLndhcm5PbmNlKCdBY2Nlc3NpbmcgdGhlIG1ldGhvZCBgYWRkQXN5bmNWYWxpZGF0b3JgIHRocm91Z2ggYW4gaW5zdGFuY2UgaXMgZGVwcmVjYXRlZC4gU2ltcGx5IGNhbGwgYFBhcnNsZXkuYWRkQXN5bmNWYWxpZGF0b3IoLi4uKWAnKTtcbiAgICByZXR1cm4gUGFyc2xleS5hZGRBc3luY1ZhbGlkYXRvci5hcHBseShQYXJzbGV5LCBhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIFRoaXMgaXMgaW5jbHVkZWQgd2l0aCB0aGUgUGFyc2xleSBsaWJyYXJ5IGl0c2VsZixcbiAgLy8gdGh1cyB0aGVyZSBpcyBubyB1c2UgaW4gYWRkaW5nIGl0IHRvIHlvdXIgcHJvamVjdC5cbiAgUGFyc2xleS5hZGRNZXNzYWdlcygnZW4nLCB7XG4gICAgZGVmYXVsdE1lc3NhZ2U6IFwiVGhpcyB2YWx1ZSBzZWVtcyB0byBiZSBpbnZhbGlkLlwiLFxuICAgIHR5cGU6IHtcbiAgICAgIGVtYWlsOiBcIlRoaXMgdmFsdWUgc2hvdWxkIGJlIGEgdmFsaWQgZW1haWwuXCIsXG4gICAgICB1cmw6IFwiVGhpcyB2YWx1ZSBzaG91bGQgYmUgYSB2YWxpZCB1cmwuXCIsXG4gICAgICBudW1iZXI6IFwiVGhpcyB2YWx1ZSBzaG91bGQgYmUgYSB2YWxpZCBudW1iZXIuXCIsXG4gICAgICBpbnRlZ2VyOiBcIlRoaXMgdmFsdWUgc2hvdWxkIGJlIGEgdmFsaWQgaW50ZWdlci5cIixcbiAgICAgIGRpZ2l0czogXCJUaGlzIHZhbHVlIHNob3VsZCBiZSBkaWdpdHMuXCIsXG4gICAgICBhbHBoYW51bTogXCJUaGlzIHZhbHVlIHNob3VsZCBiZSBhbHBoYW51bWVyaWMuXCJcbiAgICB9LFxuICAgIG5vdGJsYW5rOiBcIlRoaXMgdmFsdWUgc2hvdWxkIG5vdCBiZSBibGFuay5cIixcbiAgICByZXF1aXJlZDogXCJUaGlzIHZhbHVlIGlzIHJlcXVpcmVkLlwiLFxuICAgIHBhdHRlcm46IFwiVGhpcyB2YWx1ZSBzZWVtcyB0byBiZSBpbnZhbGlkLlwiLFxuICAgIG1pbjogXCJUaGlzIHZhbHVlIHNob3VsZCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gJXMuXCIsXG4gICAgbWF4OiBcIlRoaXMgdmFsdWUgc2hvdWxkIGJlIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gJXMuXCIsXG4gICAgcmFuZ2U6IFwiVGhpcyB2YWx1ZSBzaG91bGQgYmUgYmV0d2VlbiAlcyBhbmQgJXMuXCIsXG4gICAgbWlubGVuZ3RoOiBcIlRoaXMgdmFsdWUgaXMgdG9vIHNob3J0LiBJdCBzaG91bGQgaGF2ZSAlcyBjaGFyYWN0ZXJzIG9yIG1vcmUuXCIsXG4gICAgbWF4bGVuZ3RoOiBcIlRoaXMgdmFsdWUgaXMgdG9vIGxvbmcuIEl0IHNob3VsZCBoYXZlICVzIGNoYXJhY3RlcnMgb3IgZmV3ZXIuXCIsXG4gICAgbGVuZ3RoOiBcIlRoaXMgdmFsdWUgbGVuZ3RoIGlzIGludmFsaWQuIEl0IHNob3VsZCBiZSBiZXR3ZWVuICVzIGFuZCAlcyBjaGFyYWN0ZXJzIGxvbmcuXCIsXG4gICAgbWluY2hlY2s6IFwiWW91IG11c3Qgc2VsZWN0IGF0IGxlYXN0ICVzIGNob2ljZXMuXCIsXG4gICAgbWF4Y2hlY2s6IFwiWW91IG11c3Qgc2VsZWN0ICVzIGNob2ljZXMgb3IgZmV3ZXIuXCIsXG4gICAgY2hlY2s6IFwiWW91IG11c3Qgc2VsZWN0IGJldHdlZW4gJXMgYW5kICVzIGNob2ljZXMuXCIsXG4gICAgZXF1YWx0bzogXCJUaGlzIHZhbHVlIHNob3VsZCBiZSB0aGUgc2FtZS5cIlxuICB9KTtcblxuICBQYXJzbGV5LnNldExvY2FsZSgnZW4nKTtcblxuICAvKipcbiAgICogaW5wdXRldmVudCAtIEFsbGV2aWF0ZSBicm93c2VyIGJ1Z3MgZm9yIGlucHV0IGV2ZW50c1xuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWFyY2FuZHJlL2lucHV0ZXZlbnRcbiAgICogQHZlcnNpb24gdjAuMC4zIC0gKGJ1aWx0IFRodSwgQXByIDE0dGggMjAxNiwgNTo1OCBwbSlcbiAgICogQGF1dGhvciBNYXJjLUFuZHJlIExhZm9ydHVuZSA8Z2l0aHViQG1hcmMtYW5kcmUuY2E+XG4gICAqIEBsaWNlbnNlIE1JVFxuICAgKi9cblxuICBmdW5jdGlvbiBJbnB1dEV2ZW50KCkge1xuICAgIHZhciBfdGhpczEzID0gdGhpcztcblxuICAgIHZhciBnbG9iYWxzID0gd2luZG93IHx8IGdsb2JhbDtcblxuICAgIC8vIFNsaWdodGx5IG9kZCB3YXkgY29uc3RydWN0IG91ciBvYmplY3QuIFRoaXMgd2F5IG1ldGhvZHMgYXJlIGZvcmNlIGJvdW5kLlxuICAgIC8vIFVzZWQgdG8gdGVzdCBmb3IgZHVwbGljYXRlIGxpYnJhcnkuXG4gICAgJC5leHRlbmQodGhpcywge1xuXG4gICAgICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBkbyBub3Qgc3VwcG9ydCBpc1RydXN0ZWQsIGFzc3VtZXMgZXZlbnQgaXMgbmF0aXZlLlxuICAgICAgaXNOYXRpdmVFdmVudDogZnVuY3Rpb24gaXNOYXRpdmVFdmVudChldnQpIHtcbiAgICAgICAgcmV0dXJuIGV2dC5vcmlnaW5hbEV2ZW50ICYmIGV2dC5vcmlnaW5hbEV2ZW50LmlzVHJ1c3RlZCAhPT0gZmFsc2U7XG4gICAgICB9LFxuXG4gICAgICBmYWtlSW5wdXRFdmVudDogZnVuY3Rpb24gZmFrZUlucHV0RXZlbnQoZXZ0KSB7XG4gICAgICAgIGlmIChfdGhpczEzLmlzTmF0aXZlRXZlbnQoZXZ0KSkge1xuICAgICAgICAgICQoZXZ0LnRhcmdldCkudHJpZ2dlcignaW5wdXQnKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgbWlzYmVoYXZlczogZnVuY3Rpb24gbWlzYmVoYXZlcyhldnQpIHtcbiAgICAgICAgaWYgKF90aGlzMTMuaXNOYXRpdmVFdmVudChldnQpKSB7XG4gICAgICAgICAgX3RoaXMxMy5iZWhhdmVzT2soZXZ0KTtcbiAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlLmlucHV0ZXZlbnQnLCBldnQuZGF0YS5zZWxlY3RvciwgX3RoaXMxMy5mYWtlSW5wdXRFdmVudCk7XG4gICAgICAgICAgX3RoaXMxMy5mYWtlSW5wdXRFdmVudChldnQpO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBiZWhhdmVzT2s6IGZ1bmN0aW9uIGJlaGF2ZXNPayhldnQpIHtcbiAgICAgICAgaWYgKF90aGlzMTMuaXNOYXRpdmVFdmVudChldnQpKSB7XG4gICAgICAgICAgJChkb2N1bWVudCkgLy8gU2ltcGx5IHVuYmluZHMgdGhlIHRlc3RpbmcgaGFuZGxlclxuICAgICAgICAgIC5vZmYoJ2lucHV0LmlucHV0ZXZlbnQnLCBldnQuZGF0YS5zZWxlY3RvciwgX3RoaXMxMy5iZWhhdmVzT2spLm9mZignY2hhbmdlLmlucHV0ZXZlbnQnLCBldnQuZGF0YS5zZWxlY3RvciwgX3RoaXMxMy5taXNiZWhhdmVzKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gQmluZCB0aGUgdGVzdGluZyBoYW5kbGVyc1xuICAgICAgaW5zdGFsbDogZnVuY3Rpb24gaW5zdGFsbCgpIHtcbiAgICAgICAgaWYgKGdsb2JhbHMuaW5wdXRFdmVudFBhdGNoZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZ2xvYmFscy5pbnB1dEV2ZW50UGF0Y2hlZCA9ICcwLjAuMyc7XG4gICAgICAgIHZhciBfYXJyID0gWydzZWxlY3QnLCAnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgJ2lucHV0W3R5cGU9XCJyYWRpb1wiXScsICdpbnB1dFt0eXBlPVwiZmlsZVwiXSddO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgX2Fyci5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICB2YXIgc2VsZWN0b3IgPSBfYXJyW19pXTtcbiAgICAgICAgICAkKGRvY3VtZW50KS5vbignaW5wdXQuaW5wdXRldmVudCcsIHNlbGVjdG9yLCB7IHNlbGVjdG9yOiBzZWxlY3RvciB9LCBfdGhpczEzLmJlaGF2ZXNPaykub24oJ2NoYW5nZS5pbnB1dGV2ZW50Jywgc2VsZWN0b3IsIHsgc2VsZWN0b3I6IHNlbGVjdG9yIH0sIF90aGlzMTMubWlzYmVoYXZlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIHVuaW5zdGFsbDogZnVuY3Rpb24gdW5pbnN0YWxsKCkge1xuICAgICAgICBkZWxldGUgZ2xvYmFscy5pbnB1dEV2ZW50UGF0Y2hlZDtcbiAgICAgICAgJChkb2N1bWVudCkub2ZmKCcuaW5wdXRldmVudCcpO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH07XG5cbiAgdmFyIGlucHV0ZXZlbnQgPSBuZXcgSW5wdXRFdmVudCgpO1xuXG4gIGlucHV0ZXZlbnQuaW5zdGFsbCgpO1xuXG4gIHZhciBwYXJzbGV5ID0gUGFyc2xleTtcblxuICByZXR1cm4gcGFyc2xleTtcbn0pO1xuIiwiLy8gVmFsaWRhdGlvbiBlcnJvcnMgbWVzc2FnZXMgZm9yIFBhcnNsZXlcbi8vIExvYWQgdGhpcyBhZnRlciBQYXJzbGV5XG5cblBhcnNsZXkuYWRkTWVzc2FnZXMoJ25sJywge1xuICBkZWZhdWx0TWVzc2FnZTogXCJEZXplIHdhYXJkZSBsaWprdCBvbmp1aXN0LlwiLFxuICB0eXBlOiB7XG4gICAgZW1haWw6ICAgICAgICBcIkRpdCBsaWprdCBnZWVuIGdlbGRpZyBlLW1haWwgYWRyZXMgdGUgemlqbi5cIixcbiAgICB1cmw6ICAgICAgICAgIFwiRGl0IGxpamt0IGdlZW4gZ2VsZGlnZSBVUkwgdGUgemlqbi5cIixcbiAgICBudW1iZXI6ICAgICAgIFwiRGV6ZSB3YWFyZGUgbW9ldCBlZW4gbnVtbWVyIHppam4uXCIsXG4gICAgaW50ZWdlcjogICAgICBcIkRlemUgd2FhcmRlIG1vZXQgZWVuIG51bW1lciB6aWpuLlwiLFxuICAgIGRpZ2l0czogICAgICAgXCJEZXplIHdhYXJkZSBtb2V0IG51bWVyaWVrIHppam4uXCIsXG4gICAgYWxwaGFudW06ICAgICBcIkRlemUgd2FhcmRlIG1vZXQgYWxmYW51bWVyaWVrIHppam4uXCJcbiAgfSxcbiAgbm90Ymxhbms6ICAgICAgIFwiRGV6ZSB3YWFyZGUgbWFnIG5pZXQgbGVlZyB6aWpuLlwiLFxuICByZXF1aXJlZDogICAgICAgXCJEaXQgdmVsZCBpcyB2ZXJwbGljaHQuXCIsXG4gIHBhdHRlcm46ICAgICAgICBcIkRlemUgd2FhcmRlIGxpamt0IG9uanVpc3QgdGUgemlqbi5cIixcbiAgbWluOiAgICAgICAgICAgIFwiRGV6ZSB3YWFyZGUgbWFnIG5pZXQgbGFnZXIgemlqbiBkYW4gJXMuXCIsXG4gIG1heDogICAgICAgICAgICBcIkRlemUgd2FhcmRlIG1hZyBuaWV0IGdyb3RlciB6aWpuIGRhbiAlcy5cIixcbiAgcmFuZ2U6ICAgICAgICAgIFwiRGV6ZSB3YWFyZGUgbW9ldCB0dXNzZW4gJXMgZW4gJXMgbGlnZ2VuLlwiLFxuICBtaW5sZW5ndGg6ICAgICAgXCJEZXplIHRla3N0IGlzIHRlIGtvcnQuIERlemUgbW9ldCB1aXQgbWluaW1hYWwgJXMga2FyYWt0ZXJzIGJlc3RhYW4uXCIsXG4gIG1heGxlbmd0aDogICAgICBcIkRlemUgd2FhcmRlIGlzIHRlIGxhbmcuIERlemUgbWFnIG1heGltYWFsICVzIGthcmFrdGVycyBsYW5nIHppam4uXCIsXG4gIGxlbmd0aDogICAgICAgICBcIkRlemUgd2FhcmRlIG1vZXQgdHVzc2VuICVzIGVuICVzIGthcmFrdGVycyBsYW5nIHppam4uXCIsXG4gIGVxdWFsdG86ICAgICAgICBcIkRlemUgd2FhcmRlcyBtb2V0ZW4gaWRlbnRpZWsgemlqbi5cIlxufSk7XG5cblBhcnNsZXkuc2V0TG9jYWxlKCdubCcpO1xuIiwiIWZ1bmN0aW9uKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlIHVubGVzcyBhbWRNb2R1bGVJZCBpcyBzZXRcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcm9vdC5zdmc0ZXZlcnlib2R5ID0gZmFjdG9yeSgpO1xuICAgIH0pIDogXCJvYmplY3RcIiA9PSB0eXBlb2YgZXhwb3J0cyA/IC8vIE5vZGUuIERvZXMgbm90IHdvcmsgd2l0aCBzdHJpY3QgQ29tbW9uSlMsIGJ1dFxuICAgIC8vIG9ubHkgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLFxuICAgIC8vIGxpa2UgTm9kZS5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6IHJvb3Quc3ZnNGV2ZXJ5Ym9keSA9IGZhY3RvcnkoKTtcbn0odGhpcywgZnVuY3Rpb24oKSB7XG4gICAgLyohIHN2ZzRldmVyeWJvZHkgdjIuMS4wIHwgZ2l0aHViLmNvbS9qb25hdGhhbnRuZWFsL3N2ZzRldmVyeWJvZHkgKi9cbiAgICBmdW5jdGlvbiBlbWJlZChzdmcsIHRhcmdldCkge1xuICAgICAgICAvLyBpZiB0aGUgdGFyZ2V0IGV4aXN0c1xuICAgICAgICBpZiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBkb2N1bWVudCBmcmFnbWVudCB0byBob2xkIHRoZSBjb250ZW50cyBvZiB0aGUgdGFyZ2V0XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIHZpZXdCb3ggPSAhc3ZnLmdldEF0dHJpYnV0ZShcInZpZXdCb3hcIikgJiYgdGFyZ2V0LmdldEF0dHJpYnV0ZShcInZpZXdCb3hcIik7XG4gICAgICAgICAgICAvLyBjb25kaXRpb25hbGx5IHNldCB0aGUgdmlld0JveCBvbiB0aGUgc3ZnXG4gICAgICAgICAgICB2aWV3Qm94ICYmIHN2Zy5zZXRBdHRyaWJ1dGUoXCJ2aWV3Qm94XCIsIHZpZXdCb3gpO1xuICAgICAgICAgICAgLy8gY29weSB0aGUgY29udGVudHMgb2YgdGhlIGNsb25lIGludG8gdGhlIGZyYWdtZW50XG4gICAgICAgICAgICBmb3IgKC8vIGNsb25lIHRoZSB0YXJnZXRcbiAgICAgICAgICAgIHZhciBjbG9uZSA9IHRhcmdldC5jbG9uZU5vZGUoITApOyBjbG9uZS5jaGlsZE5vZGVzLmxlbmd0aDsgKSB7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoY2xvbmUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhcHBlbmQgdGhlIGZyYWdtZW50IGludG8gdGhlIHN2Z1xuICAgICAgICAgICAgc3ZnLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBsb2FkcmVhZHlzdGF0ZWNoYW5nZSh4aHIpIHtcbiAgICAgICAgLy8gbGlzdGVuIHRvIGNoYW5nZXMgaW4gdGhlIHJlcXVlc3RcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHJlcXVlc3QgaXMgcmVhZHlcbiAgICAgICAgICAgIGlmICg0ID09PSB4aHIucmVhZHlTdGF0ZSkge1xuICAgICAgICAgICAgICAgIC8vIGdldCB0aGUgY2FjaGVkIGh0bWwgZG9jdW1lbnRcbiAgICAgICAgICAgICAgICB2YXIgY2FjaGVkRG9jdW1lbnQgPSB4aHIuX2NhY2hlZERvY3VtZW50O1xuICAgICAgICAgICAgICAgIC8vIGVuc3VyZSB0aGUgY2FjaGVkIGh0bWwgZG9jdW1lbnQgYmFzZWQgb24gdGhlIHhociByZXNwb25zZVxuICAgICAgICAgICAgICAgIGNhY2hlZERvY3VtZW50IHx8IChjYWNoZWREb2N1bWVudCA9IHhoci5fY2FjaGVkRG9jdW1lbnQgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoXCJcIiksIFxuICAgICAgICAgICAgICAgIGNhY2hlZERvY3VtZW50LmJvZHkuaW5uZXJIVE1MID0geGhyLnJlc3BvbnNlVGV4dCwgeGhyLl9jYWNoZWRUYXJnZXQgPSB7fSksIC8vIGNsZWFyIHRoZSB4aHIgZW1iZWRzIGxpc3QgYW5kIGVtYmVkIGVhY2ggaXRlbVxuICAgICAgICAgICAgICAgIHhoci5fZW1iZWRzLnNwbGljZSgwKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGNhY2hlZCB0YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IHhoci5fY2FjaGVkVGFyZ2V0W2l0ZW0uaWRdO1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIGNhY2hlZCB0YXJnZXRcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0IHx8ICh0YXJnZXQgPSB4aHIuX2NhY2hlZFRhcmdldFtpdGVtLmlkXSA9IGNhY2hlZERvY3VtZW50LmdldEVsZW1lbnRCeUlkKGl0ZW0uaWQpKSwgXG4gICAgICAgICAgICAgICAgICAgIC8vIGVtYmVkIHRoZSB0YXJnZXQgaW50byB0aGUgc3ZnXG4gICAgICAgICAgICAgICAgICAgIGVtYmVkKGl0ZW0uc3ZnLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAvLyB0ZXN0IHRoZSByZWFkeSBzdGF0ZSBjaGFuZ2UgaW1tZWRpYXRlbHlcbiAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdmc0ZXZlcnlib2R5KHJhd29wdHMpIHtcbiAgICAgICAgZnVuY3Rpb24gb25pbnRlcnZhbCgpIHtcbiAgICAgICAgICAgIC8vIHdoaWxlIHRoZSBpbmRleCBleGlzdHMgaW4gdGhlIGxpdmUgPHVzZT4gY29sbGVjdGlvblxuICAgICAgICAgICAgZm9yICgvLyBnZXQgdGhlIGNhY2hlZCA8dXNlPiBpbmRleFxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDsgaW5kZXggPCB1c2VzLmxlbmd0aDsgKSB7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjdXJyZW50IDx1c2U+XG4gICAgICAgICAgICAgICAgdmFyIHVzZSA9IHVzZXNbaW5kZXhdLCBzdmcgPSB1c2UucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBpZiAoc3ZnICYmIC9zdmcvaS50ZXN0KHN2Zy5ub2RlTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNyYyA9IHVzZS5nZXRBdHRyaWJ1dGUoXCJ4bGluazpocmVmXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocG9seWZpbGwgJiYgKCFvcHRzLnZhbGlkYXRlIHx8IG9wdHMudmFsaWRhdGUoc3JjLCBzdmcsIHVzZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIDx1c2U+IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5yZW1vdmVDaGlsZCh1c2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcGFyc2UgdGhlIHNyYyBhbmQgZ2V0IHRoZSB1cmwgYW5kIGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3JjU3BsaXQgPSBzcmMuc3BsaXQoXCIjXCIpLCB1cmwgPSBzcmNTcGxpdC5zaGlmdCgpLCBpZCA9IHNyY1NwbGl0LmpvaW4oXCIjXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlIGxpbmsgaXMgZXh0ZXJuYWxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBjYWNoZWQgeGhyIHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeGhyID0gcmVxdWVzdHNbdXJsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnN1cmUgdGhlIHhociByZXF1ZXN0IGV4aXN0c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhociB8fCAoeGhyID0gcmVxdWVzdHNbdXJsXSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLCB4aHIub3BlbihcIkdFVFwiLCB1cmwpLCB4aHIuc2VuZCgpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHIuX2VtYmVkcyA9IFtdKSwgLy8gYWRkIHRoZSBzdmcgYW5kIGlkIGFzIGFuIGl0ZW0gdG8gdGhlIHhociBlbWJlZHMgbGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhoci5fZW1iZWRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdmc6IHN2ZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksIC8vIHByZXBhcmUgdGhlIHhociByZWFkeSBzdGF0ZSBjaGFuZ2UgZXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkcmVhZHlzdGF0ZWNoYW5nZSh4aHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlbWJlZCB0aGUgbG9jYWwgaWQgaW50byB0aGUgc3ZnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1iZWQoc3ZnLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jcmVhc2UgdGhlIGluZGV4IHdoZW4gdGhlIHByZXZpb3VzIHZhbHVlIHdhcyBub3QgXCJ2YWxpZFwiXG4gICAgICAgICAgICAgICAgICAgICsraW5kZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29udGludWUgdGhlIGludGVydmFsXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUob25pbnRlcnZhbCwgNjcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwb2x5ZmlsbCwgb3B0cyA9IE9iamVjdChyYXdvcHRzKSwgbmV3ZXJJRVVBID0gL1xcYlRyaWRlbnRcXC9bNTY3XVxcYnxcXGJNU0lFICg/Ojl8MTApXFwuMFxcYi8sIHdlYmtpdFVBID0gL1xcYkFwcGxlV2ViS2l0XFwvKFxcZCspXFxiLywgb2xkZXJFZGdlVUEgPSAvXFxiRWRnZVxcLzEyXFwuKFxcZCspXFxiLztcbiAgICAgICAgcG9seWZpbGwgPSBcInBvbHlmaWxsXCIgaW4gb3B0cyA/IG9wdHMucG9seWZpbGwgOiBuZXdlcklFVUEudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSB8fCAobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaChvbGRlckVkZ2VVQSkgfHwgW10pWzFdIDwgMTA1NDcgfHwgKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2god2Via2l0VUEpIHx8IFtdKVsxXSA8IDUzNztcbiAgICAgICAgLy8gY3JlYXRlIHhociByZXF1ZXN0cyBvYmplY3RcbiAgICAgICAgdmFyIHJlcXVlc3RzID0ge30sIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgc2V0VGltZW91dCwgdXNlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwidXNlXCIpO1xuICAgICAgICAvLyBjb25kaXRpb25hbGx5IHN0YXJ0IHRoZSBpbnRlcnZhbCBpZiB0aGUgcG9seWZpbGwgaXMgYWN0aXZlXG4gICAgICAgIHBvbHlmaWxsICYmIG9uaW50ZXJ2YWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN2ZzRldmVyeWJvZHk7XG59KTsiLCIvKipcbiAqIFJldHVybiB0aGUgY2xvc2VzdCBlbGVtZW50IG1hdGNoaW5nIGEgc2VsZWN0b3IgdXAgdGhlIERPTSB0cmVlXG4gKiBDcmVkaXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9qb25hdGhhbnRuZWFsL2Nsb3Nlc3RcbiAqL1xuXG5pZiAodHlwZW9mIEVsZW1lbnQucHJvdG90eXBlLmNsb3Nlc3QgIT09ICdmdW5jdGlvbicpIHtcblx0RWxlbWVudC5wcm90b3R5cGUuY2xvc2VzdCA9IGZ1bmN0aW9uIGNsb3Nlc3Qoc2VsZWN0b3IpIHtcblx0XHR2YXIgZWxlbWVudCA9IHRoaXM7XG5cblx0XHR3aGlsZSAoZWxlbWVudCAmJiBlbGVtZW50Lm5vZGVUeXBlID09PSAxKSB7XG5cdFx0XHRpZiAoZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbWVudDtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fTtcbn0iLCIvKipcbiAqIE1ldGhvZCBvZiB0ZXN0aW5nIHdoZXRoZXIgb3Igbm90IGEgRE9NIGVsZW1lbnQgbWF0Y2hlcyBhIGdpdmVuIHNlbGVjdG9yLiBcbiAqIEZvcm1lcmx5IGtub3duIChhbmQgbGFyZ2VseSBzdXBwb3J0ZWQgd2l0aCBwcmVmaXgpIGFzIG1hdGNoZXNTZWxlY3Rvci5cbiAqIENyZWRpdDogaHR0cHM6Ly9naXRodWIuY29tL2pvbmF0aGFudG5lYWwvY2xvc2VzdFxuICovXG5cbmlmICh0eXBlb2YgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID0gRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHwgRWxlbWVudC5wcm90b3R5cGUubW96TWF0Y2hlc1NlbGVjdG9yIHx8IEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBmdW5jdGlvbiBtYXRjaGVzKHNlbGVjdG9yKSB7XG5cdFx0dmFyIGVsZW1lbnQgPSB0aGlzLFxuXHRcdFx0ZWxlbWVudHMgPSAoZWxlbWVudC5kb2N1bWVudCB8fCBlbGVtZW50Lm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpLFxuXHRcdFx0aW5kZXggPSAwO1xuXG5cdFx0d2hpbGUgKGVsZW1lbnRzW2luZGV4XSAmJiBlbGVtZW50c1tpbmRleF0gIT09IGVsZW1lbnQpIHtcblx0XHRcdCsraW5kZXg7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEJvb2xlYW4oZWxlbWVudHNbaW5kZXhdKTtcblx0fTtcbn0iLCIvKipcbiAqIFRyYW5zZm9ybSBIVE1MIGNvbGxlY3Rpb25zIGFuZCBOb2RlcyB0byBhcnJheXMsIHNvIHRoZSBtZXRob2RzIGFyZSBhdmFpbGFibGUuXG4gKiBAdHlwZSB7QXJyYXl9XG4gKi9cblxubGV0IG1ldGhvZHMgPSBbJ2ZvckVhY2gnLCdmaWx0ZXInXTtcblxuZm9yIChsZXQgbiBpbiBtZXRob2RzKSB7XG5cdGxldCBtZXRob2QgPSBtZXRob2RzW25dO1xuXG5cdGlmICh0eXBlb2YgTm9kZUxpc3QucHJvdG90eXBlW21ldGhvZF0gIT09ICdmdW5jdGlvbicpIHtcblx0XHROb2RlTGlzdC5wcm90b3R5cGVbbWV0aG9kXSA9IEFycmF5LnByb3RvdHlwZVttZXRob2RdO1xuXHR9XG59IiwiLypkb2Ncbi0tLVxudGl0bGU6IEphdmFzY3JpcHRcbm5hbWU6IDlfamF2YXNjcmlwdFxuY2F0ZWdvcnk6IEphdmFzY3JpcHRcbi0tLVxuXG4qL1xuXG52YXIgYXBwID0gYXBwIHx8IHt9LFxuXHRoZWxwZXIgPSBoZWxwZXIgfHwge307XG5cbmFwcC5zZXR0aW5ncyA9IHtcblx0Ly8gTm9kZXNcblx0aHRtbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaHRtbCcpLFxuXHRib2R5OiBkb2N1bWVudC5ib2R5LFxuXHRjb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKSxcblxuXHQvLyBqUXVlcnkgb2JqZWN0c1xuXHQkZG9jdW1lbnQ6ICQoZG9jdW1lbnQpLFxuXHQkd2luZG93OiAkKHdpbmRvdyksXG5cdCRodG1sOiAkKCdodG1sJyksXG5cdCRib2R5OiAkKCdib2R5JyksXG5cdCRodG1sQW5kQm9keTogJCgnaHRtbCwgYm9keScpLFxuXHQkYmFja2dyb3VuZDogJCgnI2JhY2tncm91bmQnKSxcblx0JGNvbnRhaW5lcjogJCgnI2NvbnRhaW5lcicpLFxuXHQkbWFpbjogJCgnI21haW4nKSxcblxuXHQvLyBNaXNjLlxuXHR3aW5kb3dIZWlnaHQ6ICQod2luZG93KS5oZWlnaHQoKSxcblx0d2luZG93V2lkdGg6ICQod2luZG93KS53aWR0aCgpLFxufTsiLCJcbmFwcC5tZWRpYVF1ZXJpZXMgPSB7XG5cdGFscGhhQW5kVXA6ICcobWluLXdpZHRoOiAwcHgpJyxcblx0YWxwaGFBbmRCZXRhOiAnKG1heC13aWR0aDogNjk5cHgpJyxcblx0YWxwaGE6ICcobWF4LXdpZHRoOiA1OTlweCknLFxuXHRiZXRhQW5kVXA6ICcobWluLXdpZHRoOiA2MDBweCknLFxuXHRiZXRhOiAnKG1pbi13aWR0aDogNjAwcHgpIGFuZCAobWF4LXdpZHRoOiA3NjdweCknLFxuXHRnYW1tYUFuZFVwOiAnKG1pbi13aWR0aDogNzY4cHgpJyxcblx0Z2FtbWE6ICcobWluLXdpZHRoOiA3NjhweCkgYW5kIChtYXgtd2lkdGg6IDc5OXB4KScsXG5cdGRlbHRhQW5kVXA6ICcobWluLXdpZHRoOiA4MDBweCknLFxuXHRkZWx0YTogJyhtaW4td2lkdGg6IDgwMHB4KSBhbmQgKG1heC13aWR0aDogOTk5cHgpJyxcblx0ZXBzaWxvbkFuZFVwOiAnKG1pbi13aWR0aDogMTAwMHB4KScsXG5cdGVwc2lsb246ICcobWluLXdpZHRoOiAxMDAwcHgpIGFuZCAobWF4LXdpZHRoOiAxMTk5cHgpJyxcblx0emV0YUFuZFVwOiAnKG1pbi13aWR0aDogMTIwMHB4KScsXG5cdHpldGE6ICcobWluLXdpZHRoOiAxMjAwcHgpIGFuZCAobWF4LXdpZHRoOiAxMzk5cHgpJyxcblx0ZXRhQW5kVXA6ICcobWluLXdpZHRoOiAxNDAwcHgpJ1xufTsiLCJoZWxwZXIuY29va2llcyA9IHtcblx0Y3JlYXRlOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgZGF5cykge1xuXHRcdHZhciBleHBpcmVzID0gXCJcIjtcblxuXHRcdGlmIChkYXlzKSB7XG5cdFx0XHR2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG5cblx0XHRcdGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSsoZGF5cyoyNCo2MCo2MCoxMDAwKSk7XG5cdFx0XHRleHBpcmVzID0gXCI7IGV4cGlyZXM9XCIrZGF0ZS50b0dNVFN0cmluZygpO1xuXHRcdH1cblxuXHRcdGRvY3VtZW50LmNvb2tpZSA9IG5hbWUgKyBcIj1cIiArIHZhbHVlICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIjtcblx0fSxcblxuXHRyZWFkOiBmdW5jdGlvbihuYW1lKSB7XG5cdFx0dmFyIG5hbWVFUSA9IG5hbWUgKyBcIj1cIixcblx0XHRcdGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG5cblx0XHRmb3IodmFyIGk9MDtpIDwgY2EubGVuZ3RoO2krKykge1xuXHRcdFx0dmFyIGMgPSBjYVtpXTtcblxuXHRcdFx0d2hpbGUgKGMuY2hhckF0KDApID09PSAnICcpIHtcblx0XHRcdFx0YyA9IGMuc3Vic3RyaW5nKDEsYy5sZW5ndGgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYy5pbmRleE9mKG5hbWVFUSkgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIGMuc3Vic3RyaW5nKG5hbWVFUS5sZW5ndGgsYy5sZW5ndGgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsO1xuXHR9LFxuXG5cdGVyYXNlOiBmdW5jdGlvbihuYW1lKSB7XG5cdFx0aGVscGVyLmNvb2tpZXMuY3JlYXRlKG5hbWUsXCJcIiwtMSk7XG5cdH1cbn07IiwiLyoqXG4gKiBHZXQgY29vcmRpbmF0ZXMgcmVsYXRpdmUgdG8gdGhlIGRvY3VtZW50LFxuICogSnVzdCBsaWtlIGpRdWVyeSdzIG9mZnNldCBmdW5jdGlvbS5cbiAqL1xuXG5oZWxwZXIuZ2V0Q29vcmRzID0gZnVuY3Rpb24oZWwpIHtcblx0dmFyIGJveCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdHZhciBib2R5ID0gZG9jdW1lbnQuYm9keTtcblx0dmFyIGRvY0VsID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG5cdHZhciBzY3JvbGxUb3AgPSB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jRWwuc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wO1xuXHR2YXIgc2Nyb2xsTGVmdCA9IHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2NFbC5zY3JvbGxMZWZ0IHx8IGJvZHkuc2Nyb2xsTGVmdDtcblxuXHR2YXIgY2xpZW50VG9wID0gZG9jRWwuY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDA7XG5cdHZhciBjbGllbnRMZWZ0ID0gZG9jRWwuY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMDtcblxuXHR2YXIgdG9wICA9IGJveC50b3AgKyAgc2Nyb2xsVG9wIC0gY2xpZW50VG9wO1xuXHR2YXIgbGVmdCA9IGJveC5sZWZ0ICsgc2Nyb2xsTGVmdCAtIGNsaWVudExlZnQ7XG5cblx0cmV0dXJuIHsgXG5cdFx0dG9wOiBNYXRoLnJvdW5kKHRvcCksIFxuXHRcdGxlZnQ6IE1hdGgucm91bmQobGVmdCkgfTtcbn07IiwiaGVscGVyLmluVmlldyA9IGZ1bmN0aW9uKGVsKSB7XG5cdGlmIChlbCBpbnN0YW5jZW9mIGpRdWVyeSkge1xuXHRcdGVsID0gZWxbMF07XG5cdH1cblxuXHR2YXIgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG5cdHJldHVybiAoXG5cdFx0cmVjdC50b3AgPj0gMCAmJlxuXHRcdHJlY3QuYm90dG9tIDw9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG5cdCk7XG59OyIsImhlbHBlci5vdXRWaWV3ID0gZnVuY3Rpb24oZWwpIHtcblx0aWYgKGVsIGluc3RhbmNlb2YgalF1ZXJ5KSB7XG5cdFx0ZWwgPSBlbFswXTtcblx0fVxuXG5cdHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0cmV0dXJuIChcblx0XHRyZWN0LmJvdHRvbSA8IDAgfHxcblx0XHRyZWN0LnRvcCA+IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG5cdCk7XG59OyIsImhlbHBlci5wYXJ0aWFsbHlJblZpZXcgPSBmdW5jdGlvbihlbCkge1xuXHRpZiAoZWwgaW5zdGFuY2VvZiBqUXVlcnkpIHtcblx0XHRlbCA9IGVsWzBdO1xuXHR9XG5cblx0dmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRyZXR1cm4gKFxuXHRcdHJlY3QuYm90dG9tIC0gKHJlY3QuaGVpZ2h0LzIpIDw9IGRvY3VtZW50LmJvZHkuY2xpZW50SGVpZ2h0XG5cdCk7XG59OyIsImFwcC5hY2NvcmRpb24gPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0ZWw6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hY2NvcmRpb24nKSxcblx0XHRncm91cDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFjY29yZGlvbl9fZ3JvdXAnKSxcblx0XHR0cmlnZ2VyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWNjb3JkaW9uX190cmlnZ2VyJyksXG5cdFx0Y29udGVudFNob3dDbGFzczogJ2FjY29yZGlvbi1jb250ZW50LXNob3cnXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdGlmIChhcHAuYWNjb3JkaW9uLnNldHRpbmdzLmVsLmxlbmd0aCA+IDApIHtcblx0XHRcdGFwcC5hY2NvcmRpb24uc2V0R3JvdXBIZWlnaHQoKTtcblx0XHRcdGFwcC5hY2NvcmRpb24udG9nZ2xlcigpO1xuXHRcdFx0XG5cdFx0XHR3aW5kb3cub25yZXNpemUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0YXBwLmFjY29yZGlvbi5zZXRHcm91cEhlaWdodCgpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH0sXG5cblx0c2V0R3JvdXBIZWlnaHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgZ3JvdXBEZWxlZ2F0ZSA9IGdyb3VwID0+IHtcblx0XHRcdGxldCBncm91cENvbnRlbnQgPSBncm91cC5xdWVyeVNlbGVjdG9yKCcuYWNjb3JkaW9uX19jb250ZW50Jyk7XG5cblx0XHRcdGdyb3VwQ29udGVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJycpO1xuXG5cdFx0XHRsZXQgY29udGVudEhlaWdodCA9IGdyb3VwQ29udGVudC5vZmZzZXRIZWlnaHQ7XG5cblx0XHRcdGdyb3VwQ29udGVudC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWNjb3JkaW9uLWNvbnRlbnQtaGVpZ2h0JywgY29udGVudEhlaWdodCk7XG5cdFx0XHRncm91cC5jbGFzc0xpc3QuY29udGFpbnMoYXBwLmFjY29yZGlvbi5zZXR0aW5ncy5jb250ZW50U2hvd0NsYXNzKSA/IGdyb3VwQ29udGVudC5zdHlsZS5tYXhIZWlnaHQgPSBjb250ZW50SGVpZ2h0IDogZ3JvdXBDb250ZW50LnN0eWxlLm1heEhlaWdodCA9IDA7XG5cdFx0fTtcblx0XHRcblx0XHRhcHAuYWNjb3JkaW9uLnNldHRpbmdzLmdyb3VwLmZvckVhY2goZ3JvdXBEZWxlZ2F0ZSk7XG5cdH0sXG5cblx0dG9nZ2xlcjogZnVuY3Rpb24gKCkge1xuXHRcdGxldCB0cmlnZ2VyRXZlbnRIYW5kbGVyID0gdHJpZ2dlciA9PiB7XG5cdFx0XHR0cmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgZ3JvdXAgPSB0cmlnZ2VyLnBhcmVudE5vZGUsXG5cdFx0XHRcdFx0Y29udGVudCA9IHRyaWdnZXIubmV4dEVsZW1lbnRTaWJsaW5nO1xuXG5cdFx0XHRcdGlmIChncm91cC5jbGFzc0xpc3QuY29udGFpbnMoYXBwLmFjY29yZGlvbi5zZXR0aW5ncy5jb250ZW50U2hvd0NsYXNzKSkge1xuXHRcdFx0XHRcdGFwcC5hY2NvcmRpb24uaGlkZUdyb3VwKGNvbnRlbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFwcC5hY2NvcmRpb24uaGlkZUdyb3VwKHRyaWdnZXIpO1xuXHRcdFx0XHRcdGFwcC5hY2NvcmRpb24uc2hvd0dyb3VwKHRyaWdnZXIsIGNvbnRlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YXBwLmFjY29yZGlvbi5zZXR0aW5ncy50cmlnZ2VyLmZvckVhY2godHJpZ2dlckV2ZW50SGFuZGxlcik7XG5cdH0sXG5cblx0c2hvd0dyb3VwOiBmdW5jdGlvbiAodHJpZ2dlciwgY29udGVudCkge1xuXHRcdGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gdHJpZ2dlci5uZXh0RWxlbWVudFNpYmxpbmcuZ2V0QXR0cmlidXRlKCdkYXRhLWFjY29yZGlvbi1jb250ZW50LWhlaWdodCcpICsgJ3B4Jztcblx0XHRjb250ZW50LnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChhcHAuYWNjb3JkaW9uLnNldHRpbmdzLmNvbnRlbnRTaG93Q2xhc3MpO1xuXHR9LFxuXG5cdGhpZGVHcm91cDogZnVuY3Rpb24gKHRyaWdnZXIpIHtcblx0XHRsZXQgc2hvd25JdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmFjY29yZGlvbi1jb250ZW50LXNob3cnKSxcblx0XHRcdGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWNjb3JkaW9uX19jb250ZW50JyksXG5cdFx0XHRjb250ZW50RGVsZWdhdGUgPSBjb250ZW50ID0+IGNvbnRlbnQuc3R5bGUubWF4SGVpZ2h0ID0gMDtcblxuXHRcdGlmIChzaG93bkl0ZW0gPT09IG51bGwpICB7XG5cdFx0XHR0cmlnZ2VyLmNsYXNzTGlzdC5hZGQoYXBwLmFjY29yZGlvbi5zZXR0aW5ncy5jb250ZW50U2hvd0NsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2hvd25JdGVtLmNsYXNzTGlzdC5yZW1vdmUoYXBwLmFjY29yZGlvbi5zZXR0aW5ncy5jb250ZW50U2hvd0NsYXNzKTtcblx0XHR9XG5cblx0XHRjb250ZW50LmZvckVhY2goY29udGVudERlbGVnYXRlKTtcblx0fVxufTsiLCJhcHAuYWZmaXggPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0ZWw6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFmZml4XScpLFxuXHRcdG5hdkJhcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdi1iYXInKVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uIChfc2Nyb2xsVG9wKSB7XG5cdFx0aWYgKGFwcC5hZmZpeC5zZXR0aW5ncy5lbC5sZW5ndGggPiAwKSB7XG5cdFx0XHRsZXQgZGVsZWdhdGUgPSBhZmZpeCA9PiB7XG5cdFx0XHRcdHZhciBhZmZpeEhlaWdodCA9IGFmZml4Lm9mZnNldEhlaWdodDtcblxuXHRcdFx0XHRpZiAoYWZmaXhIZWlnaHQgPCBhcHAuc2V0dGluZ3Mud2luZG93SGVpZ2h0KSB7XG5cdFx0XHRcdFx0d2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0YXBwLmFmZml4LnNjcm9sbGVyKHRoaXMuc2Nyb2xsWSwgYWZmaXgpO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGFwcC5hZmZpeC5yZXNpemVXaWR0aCgpO1xuXHRcdFx0YXBwLmFmZml4LnVwZGF0ZU9mZnNldFRvcChfc2Nyb2xsVG9wKTtcblx0XHRcdGFwcC5hZmZpeC5zZXR0aW5ncy5lbC5mb3JFYWNoKGRlbGVnYXRlKTtcblxuXHRcdFx0d2luZG93Lm9ucmVzaXplID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRhcHAuYWZmaXgucmVzaXplV2lkdGgoKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdHNjcm9sbGVyOiBmdW5jdGlvbiAoX3Njcm9sbFRvcCwgX2VsKSB7XG5cdFx0dmFyIGNvbnRhaW5lciA9IF9lbC5jbG9zZXN0KCcuYWZmaXgtY29udGFpbmVyJyksXG5cdFx0XHRhZmZpeE9mZnNldFRvcCA9IF9lbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtYWZmaXgtb2Zmc2V0JyksXG5cdFx0XHRib3R0b21UcmlnZ2VyID0gKChoZWxwZXIuZ2V0Q29vcmRzKGNvbnRhaW5lcikudG9wICsgY29udGFpbmVyLm9mZnNldEhlaWdodCkgLSBfZWwub2Zmc2V0SGVpZ2h0KTtcblxuXHRcdGlmIChhcHAubmF2QmFyLnNldHRpbmdzLmVsICYmIGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCduYXYtYmFyLS1maXhlZCcpKSB7XG5cdFx0XHRib3R0b21UcmlnZ2VyID0gKGJvdHRvbVRyaWdnZXIgLSBhcHAubmF2QmFyLnNldHRpbmdzLm5hdkJhckhlaWdodCk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFrZSBpdCBzdGlja1xuXHRcdGlmIChfc2Nyb2xsVG9wID49IGFmZml4T2Zmc2V0VG9wICYmIF9zY3JvbGxUb3AgPCBib3R0b21UcmlnZ2VyICYmIF9lbC5vZmZzZXRIZWlnaHQgPCBjb250YWluZXIub2Zmc2V0SGVpZ2h0KSB7XG5cdFx0XHRfZWwuY2xhc3NMaXN0LmFkZCgnYWZmaXgtLWZpeGVkJyk7XG5cdFx0XHRfZWwuY2xhc3NMaXN0LnJlbW92ZSgnYWZmaXgtLWFic29sdXRlJyk7XG5cdFx0XHQgYXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuY29udGFpbnMoJ25hdi1iYXItLWZpeGVkJykgPyBfZWwuc3R5bGUudG9wID0gYXBwLmFmZml4LnNldHRpbmdzLm5hdkJhci5vZmZzZXRIZWlnaHQgOiBfZWwuc3R5bGUudG9wID0gMDtcblxuXHRcdC8vIEF0IHRoZSBib3R0b20gc28gYm90dG9tIGFsaWduIGl0XG5cdFx0fSBlbHNlIGlmIChfc2Nyb2xsVG9wID49IGJvdHRvbVRyaWdnZXIgJiYgX2VsLm9mZnNldEhlaWdodCA8IGNvbnRhaW5lci5vZmZzZXRIZWlnaHQpIHtcblx0XHRcdF9lbC5jbGFzc0xpc3QucmVtb3ZlKCdhZmZpeC0tZml4ZWQnKTtcblx0XHRcdF9lbC5jbGFzc0xpc3QuYWRkKCdhZmZpeC0tYWJzb2x1dGUnKTtcblxuXHRcdC8vIFJlbGF0aXZlIHBvc2l0aW9uaW5nXG5cdFx0fSBlbHNlIHtcblx0XHRcdF9lbC5jbGFzc0xpc3QucmVtb3ZlKCdhZmZpeC0tZml4ZWQnKTtcblx0XHRcdF9lbC5jbGFzc0xpc3QucmVtb3ZlKCdhZmZpeC0tYWJzb2x1dGUnKTtcblx0XHRcdF9lbC5zdHlsZS50b3AgPSAwO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVPZmZzZXRUb3A6IGZ1bmN0aW9uIChfc2Nyb2xsVG9wKSB7XG5cdFx0bGV0IGRlbGVnYXRlID0gYWZmaXggPT4ge1xuXHRcdFx0dmFyIGFmZml4SGVpZ2h0ID0gYWZmaXgub2Zmc2V0SGVpZ2h0LFxuXHRcdFx0XHRvZmZzZXRUb3AgPSBhZmZpeC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG5cblx0XHRcdGlmIChhZmZpeEhlaWdodCA8IGFwcC5zZXR0aW5ncy53aW5kb3dIZWlnaHQpIHtcblx0XHRcdFx0aWYgKGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwgJiYgYXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuY29udGFpbnMoJ25hdi1iYXItLWZpeGVkJykpIHtcblx0XHRcdFx0XHRvZmZzZXRUb3AgPSAob2Zmc2V0VG9wIC0gYXBwLmFmZml4LnNldHRpbmdzLm5hdkJhci5vdXRlckhlaWdodCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhZmZpeC5zZXRBdHRyaWJ1dGUoJ2RhdGEtYWZmaXgtb2Zmc2V0JywgTWF0aC5yb3VuZChvZmZzZXRUb3ApKTtcblx0XHRcdFx0YXBwLmFmZml4LnNjcm9sbGVyKF9zY3JvbGxUb3AsIGFmZml4KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0YXBwLmFmZml4LnNldHRpbmdzLmVsLmZvckVhY2goZGVsZWdhdGUpO1xuXHR9LFxuXG5cdHJlc2l6ZVdpZHRoOiBmdW5jdGlvbiAoKSB7XG5cdFx0bGV0IGRlbGVnYXRlID0gYWZmaXggPT4ge1xuXHRcdFx0YWZmaXguY2xhc3NMaXN0LnJlbW92ZSgnYWZmaXgtLWZpeGVkJyk7XG5cdFx0XHRhZmZpeC5jbGFzc0xpc3QucmVtb3ZlKCdhZmZpeC0tYWJzb2x1dGUnKTtcblx0XHRcdGFmZml4LnN0eWxlLnRvcCA9ICcnO1xuXHRcdFx0YWZmaXguc3R5bGUud2lkdGggPSAnJztcblx0XHRcdGFmZml4LnN0eWxlLndpZHRoID0gYWZmaXgub2Zmc2V0V2lkdGggKyAncHgnO1xuXHRcdH07XG5cblx0XHRhcHAuYWZmaXguc2V0dGluZ3MuZWwuZm9yRWFjaChkZWxlZ2F0ZSk7XG5cdH1cbn07IiwiYXBwLmJ0bkRyb3Bkb3duID0ge1xuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHQvLyBEcm9wZG93biB0b2dnbGVyXG5cdFx0bGV0IHRvZ2dsZUV2ZW50SGFuZGxlciA9IHRvZ2dsZSA9PiB7XG5cdFx0XHR0b2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0YnRuRHJvcGRvd24gPSB0aGlzLmNsb3Nlc3QoJy5idG4tZHJvcGRvd24nKTtcblxuXHRcdFx0XHRpZiAoYnRuRHJvcGRvd24uY2xhc3NMaXN0LmNvbnRhaW5zKCdidG4tZHJvcGRvd24tLW9wZW4nKSkge1xuXHRcdFx0XHRcdGJ0bkRyb3Bkb3duLmNsYXNzTGlzdC5yZW1vdmUoJ2J0bi1kcm9wZG93bi0tb3BlbicpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFwcC5idG5Ecm9wZG93bi5jbG9zZU9wZW5Ecm9wZG93bigpO1xuXHRcdFx0XHRcdGJ0bkRyb3Bkb3duLmNsYXNzTGlzdC5hZGQoJ2J0bi1kcm9wZG93bi0tb3BlbicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYnRuLWRyb3Bkb3duLXRvZ2dsZV0nKS5mb3JFYWNoKHRvZ2dsZUV2ZW50SGFuZGxlcik7XG5cblx0XHQvLyBEbyBub3QgY2xvc2UgZHJvcGRvd24gb24gZHJvcGRvd24gY29udGVudCBjbGlja3Ncblx0XHRsZXQgZHJvcGRvd25FdmVudEhhbmRsZXIgPSBidG4gPT4ge1xuXHRcdFx0YnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdHZhciBhbGxvd1Byb3AgPSBidG4uZ2V0QXR0cmlidXRlKCdkYXRhLWJ0bi1kcm9wZG93bicpO1xuXG5cdFx0XHRcdGlmIChhbGxvd1Byb3AgIT09ICdhbGxvd1Byb3BhZ2F0aW9uJykge1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJ0bi1kcm9wZG93bl9fZHJvcGRvd24sIC5idG4tZHJvcGRvd25fX2xpc3QnKS5mb3JFYWNoKGRyb3Bkb3duRXZlbnRIYW5kbGVyKTtcblxuXHRcdC8vIENsb3NlIGFsbCBkcm9wZG93bnMgb24gZXNjYXBlIGtleWRvd25cblx0XHRsZXQgZXZlbnRDbG9zZURlbGVnYXRlID0gZXZlbnQgPT4gYXBwLmJ0bkRyb3Bkb3duLmNsb3NlT3BlbkRyb3Bkb3duKCk7XG5cblx0XHRkb2N1bWVudC5vbmtleWRvd24gPSBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRldmVudENsb3NlRGVsZWdhdGUoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gQ2xvc2UgYWxsIGRyb3Bkb3ducyBvbiBib2R5IGNsaWNrXG5cdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGV2ZW50Q2xvc2VEZWxlZ2F0ZSgpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGNsb3NlT3BlbkRyb3Bkb3duOiBmdW5jdGlvbiAoKSB7XG5cdFx0bGV0IG9wZW5EZWxlZ2F0ZSA9IG9wZW5Ecm9wZG93biA9PiB7XG5cdFx0XHRvcGVuRHJvcGRvd24uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLWRyb3Bkb3duLS1vcGVuJyk7XG5cdFx0fTtcblxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5idG4tZHJvcGRvd24tLW9wZW4nKS5mb3JFYWNoKG9wZW5EZWxlZ2F0ZSk7XG5cdH1cblxufTsiLCJhcHAuYnRuUmlwcGxlID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdHJpcHBsZTogdHJ1ZVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdGxldCBidG5zID0gYXBwLmJ0blJpcHBsZS5zZXR0aW5ncy5yaXBwbGUgPT09IHRydWUgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYnRuJykgOiAkKCcuYnRuLS1yaXBwbGUnKSxcblx0XHRcdGJ0bkV2ZW50SGFuZGxlciA9IGJ0biA9PiB7XG5cdFx0XHRcdGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0XHRcdGxldCByaXBwbGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJy5idG5fX3JpcHBsZScpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmIChyaXBwbGUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdHJpcHBsZSA9IGFwcC5idG5SaXBwbGUuYXBwZW5kUmlwcGxlKGJ0bik7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdidG4tLXJpcHBsZS1hbmltYXRlJyk7XG5cblx0XHRcdFx0XHRsZXQgc2l6ZSA9IE1hdGgubWF4KHRoaXMub2Zmc2V0V2lkdGgsIHRoaXMub2Zmc2V0SGVpZ2h0KSxcblx0XHRcdFx0XHRcdHggPSBldmVudC5vZmZzZXRYIC0gc2l6ZSAvIDIsXG5cdFx0XHRcdFx0XHR5ID0gZXZlbnQub2Zmc2V0WSAtIHNpemUgLyAyO1xuXG5cdFx0XHRcdFx0cmlwcGxlLnN0eWxlLndpZHRoID0gc2l6ZSArICdweCc7XG5cdFx0XHRcdFx0cmlwcGxlLnN0eWxlLmhlaWdodCA9IHNpemUgKyAncHgnO1xuXHRcdFx0XHRcdHJpcHBsZS5zdHlsZS5sZWZ0ID0geCArICdweCc7XG5cdFx0XHRcdFx0cmlwcGxlLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuXG5cdFx0XHRcdFx0dGhpcy5jbGFzc0xpc3QuYWRkKCdidG4tLXJpcHBsZS1hbmltYXRlJyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdGJ0bnMuZm9yRWFjaChidG5FdmVudEhhbmRsZXIpO1xuXHR9LFxuXG5cdGFwcGVuZFJpcHBsZTogZnVuY3Rpb24gKGJ0bikge1xuXHRcdGxldCByaXBwbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuXHRcdHJpcHBsZS5jbGFzc0xpc3QuYWRkKCdidG5fX3JpcHBsZScpO1xuXHRcdGJ0bi5hcHBlbmRDaGlsZChyaXBwbGUpO1xuXG5cdFx0cmV0dXJuIHJpcHBsZTtcblx0fVxuXG59OyIsImFwcC5jeWNsZSA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHQkZWw6ICQoJy5jeWNsZV9fd3JhcCcsICcuY3ljbGUnKSxcblx0XHRzbGlkZXM6ICc+IC5jeWNsZV9faXRlbScsXG5cdFx0cGFnZXI6ICc+IC5jeWNsZV9fcGFnZXInLFxuXHRcdHByZXY6ICc+IC5jeWNsZV9fcHJldicsXG5cdFx0bmV4dDogJz4gLmN5Y2xlX19uZXh0Jyxcblx0XHRwYWdlckFjdGl2ZUNsYXNzOiAnY3ljbGVfX3BhZ2VyLS1hY3RpdmUnXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHRpZihhcHAuY3ljbGUuc2V0dGluZ3MuJGVsLmxlbmd0aCA+IDApe1xuXHRcdFx0YXBwLmN5Y2xlLnNldHRpbmdzLiRlbFxuXHRcdFx0XHQuY3ljbGUoe1xuXHRcdFx0XHRcdHNsaWRlcyAgICAgICAgICAgOiBhcHAuY3ljbGUuc2V0dGluZ3Muc2xpZGVzLFxuXHRcdFx0XHRcdHBhZ2VyICAgICAgICAgICAgOiBhcHAuY3ljbGUuc2V0dGluZ3MucGFnZXIsXG5cdFx0XHRcdFx0cHJldiAgICAgICAgICAgICA6IGFwcC5jeWNsZS5zZXR0aW5ncy5wcmV2LFxuXHRcdFx0XHRcdG5leHQgICAgICAgICAgICAgOiBhcHAuY3ljbGUuc2V0dGluZ3MubmV4dCxcblx0XHRcdFx0XHRwYWdlckFjdGl2ZUNsYXNzIDogYXBwLmN5Y2xlLnNldHRpbmdzLnBhZ2VyQWN0aXZlQ2xhc3MsXG5cdFx0XHRcdFx0cGF1c2VPbkhvdmVyICAgICA6IHRydWUsXG5cdFx0XHRcdFx0c3dpcGUgICAgICAgICAgICA6IHRydWUsXG5cdFx0XHRcdFx0bG9nICAgICAgICAgICAgICA6IGZhbHNlLFxuXHRcdFx0XHRcdHBhdXNlZCAgICAgICAgICAgOiB0cnVlLFxuXHRcdFx0XHRcdGZ4ICAgICAgICAgICAgICAgOiAnbm9uZSdcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9uKCdjeWNsZS11cGRhdGUtdmlldycsIGZ1bmN0aW9uIChldmVudCwgb3B0aW9uSGFzaCwgc2xpZGVPcHRpb25zSGFzaCwgY3VycmVudFNsaWRlRWwpIHtcblx0XHRcdFx0XHRpZiAob3B0aW9uSGFzaC5zbGlkZUNvdW50ID4gMSkge1xuXHRcdFx0XHRcdFx0JCh0aGlzKS5hZGRDbGFzcygnY3ljbGUtYWN0aXZlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQub24oJ2N5Y2xlLWJlZm9yZScsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyAkKCcudGh1bWJuYWlsLWdyaWRfX2l0ZW0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnc2Nyb2xsc3B5LS1pbi12aWV3JykucmVtb3ZlQ2xhc3MoJ2FuaW1hdGlvbi1mYWRlSW4nKTtcblx0XHRcdFx0XHQvLyB9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0Lm9uKCdjeWNsZS1hZnRlcicsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBhcHAuc2Nyb2xsU3B5LmluaXQoKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59OyIsImFwcC5kZWxheWVkSW1hZ2VMb2FkaW5nID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdGVsOiAnW2RhdGEtZGVsYXktaW1hZ2UtbG9hZGluZ10nXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGVybml6cl90ZW1wbGF0ZScpICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYXBwLmRlbGF5ZWRJbWFnZUxvYWRpbmcuc2V0dGluZ3MuZWwpICE9PSBudWxsKSB7XG5cdFx0XHRsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGFwcC5kZWxheWVkSW1hZ2VMb2FkaW5nLnNldHRpbmdzLmVsKSxcblx0XHRcdFx0cGFyZW50ID0gdGVtcGxhdGUucGFyZW50Tm9kZSxcblx0XHRcdFx0Y29udGVudHMgPSB0ZW1wbGF0ZS5pbm5lckhUTUw7XG5cblx0XHRcdHBhcmVudC5yZW1vdmVDaGlsZCh0ZW1wbGF0ZSk7XG5cdFx0XHRwYXJlbnQuaW5uZXJIVE1MICs9IGNvbnRlbnRzO1xuXHRcdH1cblx0fVxufTtcblxuLypkb2Ncbi0tLVxudGl0bGU6IERlbGF5IGltYWdlIGxvYWRpbmdcbm5hbWU6IGRlbGF5X2ltYWdlX2xvYWRpbmdcbmNhdGVnb3J5OiBKYXZhc2NyaXB0XG4tLS1cblxuSmF2YVNjcmlwdCBtZXRob2QgdG8gZGVsYXkgdGhlIGxvYWQgb2YgaW1hZ2VzIGFuZCBtYWtlIHRoZSBwYWdlIHJlc3BvbmQgZmFzdGVyIGVzcGVjaWFsbHkgb24gc2xvdyBjb25uZWN0aW9ucy4gXG5cbklkZWEgaXMga2luZGx5IGJvcnJvd2VkIGZyb20gW0NocmlzdGlhbiBIZWlsbWFubl0oaHR0cHM6Ly93d3cuY2hyaXN0aWFuaGVpbG1hbm4uY29tLzIwMTUvMDkvMDgvcXVpY2stdHJpY2stdXNpbmctdGVtcGxhdGUtdG8tZGVsYXktbG9hZGluZy1vZi1pbWFnZXMvKS5cblxuYGBgaHRtbF9leGFtcGxlXG48dWwgY2xhc3M9XCJsaXN0LXVuc3R5bGVkXCI+XG5cdDxsaT48aW1nIHNyYz1cImh0dHA6Ly9wbGFjZWhvbGQuaXQvNDAweDEwMC9mMWYxZjEvY2ZjZmNmXCIgLz48L2xpPlxuXHQ8bGk+PGltZyBzcmM9XCJodHRwOi8vcGxhY2Vob2xkLml0LzQwMHgxMDAvZjFmMWYxL2NmY2ZjZlwiIC8+PC9saT5cblx0PHRlbXBsYXRlIGRhdGEtZGVsYXktaW1hZ2UtbG9hZGluZz5cblx0XHQ8bGk+PGltZyBzcmM9XCJodHRwOi8vcGxhY2Vob2xkLml0LzQwMHgxMDAvZjFmMWYxL2NmY2ZjZj90ZXh0PWRlbGF5ZWRcIiAvPjwvbGk+XG5cdFx0PGxpPjxpbWcgc3JjPVwiaHR0cDovL3BsYWNlaG9sZC5pdC80MDB4MTAwL2YxZjFmMS9jZmNmY2Y/dGV4dD1kZWxheWVkXCIgLz48L2xpPlxuXHQ8L3RlbXBsYXRlPlxuPC91bD5cbmBgYFxuXG4qLyIsImFwcC5kaXNhYmxlSG92ZXIgPSB7XG5cdHRpbWVyOiBudWxsLFxuXG5cdGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRjbGVhclRpbWVvdXQoYXBwLmRpc2FibGVIb3Zlci50aW1lcik7XG5cblx0XHRpZiAoIWRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdkaXNhYmxlLWhvdmVyJykpIHtcblx0XHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZS1ob3ZlcicpO1xuXHRcdH1cblxuXHRcdGFwcC5kaXNhYmxlSG92ZXIudGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc2FibGUtaG92ZXInKTtcblx0XHR9LCAxMDApO1xuXHR9XG59O1xuXG4vKmRvY1xuLS0tXG50aXRsZTogRGlzYWJsZSBob3ZlclxubmFtZTogZGlzYWJsZV9ob3ZlclxuY2F0ZWdvcnk6IEphdmFzY3JpcHRcbi0tLVxuXG5BIGRpc2FibGUgaG92ZXIgKC5kaXNhYmxlLWhvdmVyKSBjbGFzcyBpcyBhZGRlZCB0byB0aGUgYm9keS4gXG5UaGlzIGNsYXNzIHByZXZlbnRzIHBvaW50ZXIgZXZlbnRzIHNvIHRoZXJlIHdvbid0IGJlIGFueSBob3ZlciBlZmZlY3QgcmVwYWludHMsIGp1c3QgdGhlIHJlcGFpbnRzIGZvciBzY3JvbGxpbmcuIFRoaXMgcmVzdWx0cyBpbiBhIGJldHRlciBzY3JvbGxpbmcgcGVyZm9ybWFuY2UuXG5cbiovIiwiYXBwLmRyb3Bkb3ducyA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHRlbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRyb3Bkb3duJyksXG5cdFx0c2hvd0NsYXNzOiAnZHJvcGRvd24tLXNob3cnXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdGlmIChhcHAuZHJvcGRvd25zLnNldHRpbmdzLmVsLmxlbmd0aCA+IDApIHtcblx0XHRcdGxldCBkcm9wZG93bkRlbGVnYXRlID0gZHJvcGRvd24gPT4gZHJvcGRvd24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cblx0XHRcdFx0aWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ21vZGVybml6cl90b3VjaGV2ZW50cycpIHx8IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWRyb3Bkb3duLXRyaWdnZXInKSkge1xuXHRcdFx0XHRcdHRoaXMuY2xhc3NMaXN0LnRvZ2dsZShhcHAuZHJvcGRvd25zLnNldHRpbmdzLnNob3dDbGFzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRhcHAuZHJvcGRvd25zLnNldHRpbmdzLmVsLmZvckVhY2goZHJvcGRvd25EZWxlZ2F0ZSk7XG5cblx0XHRcdGRvY3VtZW50LmJvZHkub25rZXlkb3duID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdGlmIChldmVudC5rZXlDb2RlID09PSAyNykge1xuXHRcdFx0XHRcdGFwcC5kcm9wZG93bnMuY2xvc2VBbGxEcm9wZG93bnMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0ZG9jdW1lbnQuYm9keS5vbmNsaWNrID0gZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdGFwcC5kcm9wZG93bnMuY2xvc2VBbGxEcm9wZG93bnMoKTtcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdGNsb3NlQWxsRHJvcGRvd25zOiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKGFwcC5kcm9wZG93bnMuc2V0dGluZ3MuZWwubGVuZ3RoID4gMCkge1xuXHRcdFx0bGV0IGNsb3NlRGVsZWdhdGUgPSBkcm9wZG93biA9PiBkcm9wZG93bi5jbGFzc0xpc3QucmVtb3ZlKCdkcm9wZG93bi0tc2hvdycpO1xuXG5cdFx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZHJvcGRvd24nKS5mb3JFYWNoKGNsb3NlRGVsZWdhdGUpO1xuXHRcdH1cblx0fVxufTsiLCJhcHAuZXF1YWxpemUgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0ZWw6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVxdWFsaXplXScpXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHRpZiAoYXBwLmVxdWFsaXplLnNldHRpbmdzLmVsICE9PSBudWxsKSB7XG5cdFx0XHRsZXQgZXF1YWxpemVEZWxlZ2F0ZSA9IGVxdWFsaXplID0+IHtcblx0XHRcdFx0dmFyIGN1cnJlbnRIZWlnaHQgPSAwLFxuXHRcdFx0XHRcdG1lZGlhUXVlcnkgPSBlcXVhbGl6ZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZXF1YWxpemUnKSxcblx0XHRcdFx0XHR0YXJnZXRzID0gZXF1YWxpemUucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZXF1YWxpemUtdGFyZ2V0XScpO1xuXG5cdFx0XHRcdGlmIChNb2Rlcm5penIubXEoYXBwLm1lZGlhUXVlcmllc1ttZWRpYVF1ZXJ5XSkgPT09IHRydWUgfHwgYXBwLm1lZGlhUXVlcmllc1ttZWRpYVF1ZXJ5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiB7XG5cdFx0XHRcdFx0XHR2YXIgaGVpZ2h0ID0gbnVsbDtcblxuXHRcdFx0XHRcdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9ICdhdXRvJztcblx0XHRcdFx0XHRcdGhlaWdodCA9IHRhcmdldC5vZmZzZXRIZWlnaHQ7XG5cblx0XHRcdFx0XHRcdGlmIChoZWlnaHQgPiBjdXJyZW50SGVpZ2h0KSB7XG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRIZWlnaHQgPSBoZWlnaHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHR0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IHRhcmdldC5zdHlsZS5oZWlnaHQgPSBjdXJyZW50SGVpZ2h0ICsgJ3B4Jyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiB0YXJnZXQuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0YXBwLmVxdWFsaXplLnNldHRpbmdzLmVsLmZvckVhY2goZXF1YWxpemVEZWxlZ2F0ZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKmRvY1xuLS0tXG50aXRsZTogRXF1YWxpemVcbm5hbWU6IGVxdWFsaXplXG5jYXRlZ29yeTogQ29udGVudFxuLS0tXG5cbkVxdWFsaXplIHRhcmdldHMgaW4ganVzdCBhIHNuYXAuIEl0IGNhbiBiZSBldmVyeXRoaW5nIG5vdCBqdXN0IGNvbHVtbnMgb3IgYmxvY2tzLlxuXG5gYGBodG1sX2V4YW1wbGVcbjxkaXYgY2xhc3M9XCJncmlkXCIgZGF0YS1lcXVhbGl6ZT5cblx0PGRpdiBjbGFzcz1cImNvbHVtbi00XCI+XG5cdFx0PGRpdiBkYXRhLWVxdWFsaXplLXRhcmdldCBjbGFzcz1cImNhcmRcIj5cblx0XHRcdDxkaXYgY2xhc3M9XCJjYXJkX19jb250ZW50XCI+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIE9tbmlzLCBiZWF0YWUsIGFsaWFzPyBOZWNlc3NpdGF0aWJ1cyBudWxsYSBzaW50IHZvbHVwdGF0ZSBwZXJzcGljaWF0aXMgZXhjZXB0dXJpLCBhcmNoaXRlY3RvIGV0LCBpbmNpZHVudCBpdGFxdWUgaXVzdG8gaW52ZW50b3JlIHBvcnJvISBFdW0gdWxsYW0gcGxhY2VhdCBxdWFtLCBlaXVzIGFwZXJpYW0hPC9kaXY+XG5cdFx0PC9kaXY+XG5cdDwvZGl2PlxuXHQ8ZGl2IGNsYXNzPVwiY29sdW1uLTRcIj5cblx0XHQ8ZGl2IGRhdGEtZXF1YWxpemUtdGFyZ2V0IGNsYXNzPVwiY2FyZFwiPlxuXHRcdFx0PGRpdiBjbGFzcz1cImNhcmRfX2NvbnRlbnRcIj5Mb3JlbSBpcHN1bS48L2Rpdj5cblx0XHQ8L2Rpdj5cblx0PC9kaXY+XG5cdDxkaXYgY2xhc3M9XCJjb2x1bW4tNFwiPlxuXHRcdDxkaXYgZGF0YS1lcXVhbGl6ZS10YXJnZXQgY2xhc3M9XCJjYXJkXCI+XG5cdFx0XHQ8ZGl2IGNsYXNzPVwiY2FyZF9fY29udGVudFwiPkxvcmVtIGlwc3VtLjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQ8L2Rpdj5cbjwvZGl2PlxuYGBgXG5cbllvdSBjYW4gYWxzbyBzZXQgYSBtZWRpYSBxdWVyeSBmcm9tIHdoZXJlIHRoZSBlcXVhbGl6ZXIgaGFzIHRvIGtpY2sgaW4sIGxpa2UgdGhpcy5cblxuYGBgaHRtbF9leGFtcGxlXG48ZGl2IGNsYXNzPVwiZ3JpZFwiIGRhdGEtZXF1YWxpemU9XCJiZXRhQW5kVXBcIj5cblx0PGRpdiBjbGFzcz1cImNvbHVtbi00XCI+XG5cdFx0PGRpdiBkYXRhLWVxdWFsaXplLXRhcmdldCBjbGFzcz1cImNhcmRcIj5cblx0XHRcdDxkaXYgY2xhc3M9XCJjYXJkX19jb250ZW50XCI+TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIE9tbmlzLCBiZWF0YWUsIGFsaWFzPyBOZWNlc3NpdGF0aWJ1cyBudWxsYSBzaW50IHZvbHVwdGF0ZSBwZXJzcGljaWF0aXMgZXhjZXB0dXJpLCBhcmNoaXRlY3RvIGV0LCBpbmNpZHVudCBpdGFxdWUgaXVzdG8gaW52ZW50b3JlIHBvcnJvISBFdW0gdWxsYW0gcGxhY2VhdCBxdWFtLCBlaXVzIGFwZXJpYW0hPC9kaXY+XG5cdFx0PC9kaXY+XG5cdDwvZGl2PlxuXHQ8ZGl2IGNsYXNzPVwiY29sdW1uLTRcIj5cblx0XHQ8ZGl2IGRhdGEtZXF1YWxpemUtdGFyZ2V0IGNsYXNzPVwiY2FyZFwiPlxuXHRcdFx0PGRpdiBjbGFzcz1cImNhcmRfX2NvbnRlbnRcIj5Mb3JlbSBpcHN1bS48L2Rpdj5cblx0XHQ8L2Rpdj5cblx0PC9kaXY+XG5cdDxkaXYgY2xhc3M9XCJjb2x1bW4tNFwiPlxuXHRcdDxkaXYgZGF0YS1lcXVhbGl6ZS10YXJnZXQgY2xhc3M9XCJjYXJkXCI+XG5cdFx0XHQ8ZGl2IGNsYXNzPVwiY2FyZF9fY29udGVudFwiPkxvcmVtIGlwc3VtLjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQ8L2Rpdj5cbjwvZGl2PlxuYGBgXG5cbiovIiwiYXBwLmZhc3RDbGljayA9IHtcblx0aW5pdDogZnVuY3Rpb24oKXtcblx0XHRGYXN0Q2xpY2suYXR0YWNoKGRvY3VtZW50LmJvZHkpO1xuXHR9XG59O1xuXG4vKmRvY1xuLS0tXG50aXRsZTogRmFzdGNsaWNrXG5uYW1lOiBmYXN0Y2xpY2tcbmNhdGVnb3J5OiBKYXZhc2NyaXB0XG4tLS1cblxuUG9seWZpbGwgdG8gcmVtb3ZlIGNsaWNrIGRlbGF5cyBvbiBicm93c2VycyB3aXRoIHRvdWNoIFVJc1xuXG4qLyIsImFwcC5maXRWaWRzID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdCRlbDogJCgnLmZpdHZpZHMnKVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XG5cdFx0aWYgKGFwcC5maXRWaWRzLnNldHRpbmdzLiRlbC5sZW5ndGggPiAwKSB7XG5cdFx0XHRhcHAuZml0Vmlkcy5zZXR0aW5ncy4kZWwuZml0VmlkcygpO1xuXHRcdH1cblx0fVxufTtcblxuLypkb2Ncbi0tLVxudGl0bGU6IEZpdHZpZHNcbm5hbWU6IGZpdHZpZHNcbmNhdGVnb3J5OiBKYXZhc2NyaXB0XG4tLS1cblxuQSBsaWdodHdlaWdodCwgZWFzeS10by11c2UgalF1ZXJ5IHBsdWdpbiBmb3IgZmx1aWQgd2lkdGggdmlkZW8gZW1iZWRzLlxuVXNlIHRoZSBjbGFzcyBmaXR2aWRzIGFzIGEgY29udGFpbmVyIGZvciB5b3VyIHZpZGVvIGFuZCB0aGUgcGx1Z2luIHdpbGwgdGFrZSBjYXJlIG9mIHRoZSByZXN0LlxuXG4qLyIsIi8qKlxuICogVGhpcyBtb2R1bGUgaXMgZGVwZW5kZWQgb24galF1ZXJ5LlxuICogUGx1Z2luIHVzZWQ6IFBhcnNsZXkgKHZhbGlkYXRpb24gZW5naW5lKS5cbiAqL1xuXG5hcHAuZm9ybU1vZHVsZXMgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0cGFzc3dvcmRUb2dnbGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5mb3JtX19wYXNzd29yZC10b2dnbGUnKSxcblx0XHRwYXNzd29yZFNob3dDbGFzczogJ2Zvcm1fX2lucHV0LS1zaG93LXBhc3N3b3JkJyxcblx0XHQkdmFsaWRhdGlvbjogJCgnW2RhdGEtZm9ybS12YWxpZGF0ZV0nKSxcblx0XHR2YWxpZGF0aW9uTGFuZ3VhZ2U6ICdubCcsXG5cdFx0cmFuZ2U6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9cmFuZ2VdJylcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLmZvcm1Nb2R1bGVzLmN1c3RvbUZpbGVJbnB1dCgpO1xuXHRcdGFwcC5mb3JtTW9kdWxlcy52YWxpZGF0aW9uKCk7XG5cdFx0YXBwLmZvcm1Nb2R1bGVzLnBhc3N3b3JkKCk7XG5cdFx0YXBwLmZvcm1Nb2R1bGVzLmFqYXhGb3JtKCk7XG5cdFx0YXBwLmZvcm1Nb2R1bGVzLmZsb2F0aW5nTGFiZWwoKTtcblx0XHRhcHAuZm9ybU1vZHVsZXMucmFuZ2UoKTtcblx0fSxcblxuXHRyYW5nZTogZnVuY3Rpb24gKCkge1xuXHRcdGxldCByYW5nZUV2ZW50SGFuZGxlciA9IHJhbmdlID0+IHtcblx0XHRcdHJhbmdlLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRsZXQgaWQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnaWQnKSxcblx0XHRcdFx0XHR2YWwgPSB0aGlzLnZhbHVlLFxuXHRcdFx0XHRcdG1lYXN1cmVtZW50ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmFuZ2UtbWVhc3VyZW1lbnQnKSxcblx0XHRcdFx0XHRyYW5nZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLXJhbmdlPScgKyBpZCArJ10nKTtcblxuXHRcdFx0XHRpZiAoaWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJhbmdlLmlubmVySFRNTCA9IG1lYXN1cmVtZW50ID09PSB1bmRlZmluZWQgPyB2YWwgOiB2YWwgKyBtZWFzdXJlbWVudDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFwcC5mb3JtTW9kdWxlcy5zZXR0aW5ncy5yYW5nZS5mb3JFYWNoKHJhbmdlRXZlbnRIYW5kbGVyKTtcblx0fSxcblxuXHRjdXN0b21GaWxlSW5wdXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgZmlsZUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmZvcm1fX2ZpbGUtaW5wdXQnKTtcblxuXHRcdGlmKGZpbGVJbnB1dC5sZW5ndGggPiAwKSB7XG5cdFx0XHRmaWxlSW5wdXQuZm9yRWFjaChpbnB1dCA9PiB7XG5cdFx0XHRcdGxldCBsYWJlbCA9IGlucHV0Lm5leHRFbGVtZW50U2libGluZyxcblx0XHRcdFx0XHRsYWJlbFZhbCA9IGxhYmVsLmlubmVySFRNTDtcblxuXHRcdFx0XHRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdGxldCBmaWxlTmFtZSA9ICcnO1xuXG5cdFx0XHRcdFx0ZmlsZU5hbWUgPSB0aGlzLmZpbGVzICYmIHRoaXMuZmlsZXMubGVuZ3RoID4gMSA/ICh0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1tdWx0aXBsZS1jYXB0aW9uJykgfHwgJycpLnJlcGxhY2UoJ3tjb3VudH0nLCB0aGlzLmZpbGVzLmxlbmd0aCkgOiBldmVudC50YXJnZXQudmFsdWUuc3BsaXQoJ1xcXFwnKS5wb3AoKTtcblx0XHRcdFx0XHRmaWxlTmFtZSA/IGxhYmVsLnF1ZXJ5U2VsZWN0b3IoJ3NwYW4nKS5pbm5lckhUTUwgPSBmaWxlTmFtZSA6IGxhYmVsLmh0bWwobGFiZWxWYWwpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQvLyBGaXJlZm94IGJ1ZyBmaXhcblx0XHRcdFx0aW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBlbCA9PiBlbC5jbGFzc0xpc3QuYWRkKCdoYXMtZm9jdXMnKSk7XG5cdFx0XHRcdGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCBlbCA9PiBlbC5jbGFzc0xpc3QucmVtb3ZlKCdoYXMtZm9jdXMnKSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0cGFzc3dvcmQ6IGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgZXZlbnRIYW5kbGVyID0gZWwgPT4ge1xuXHRcdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGxldCAkdGhpcyA9ICQodGhpcyksXG5cdFx0XHRcdFx0JGZvcm1QYXNzd29yZCA9ICR0aGlzLmNsb3Nlc3QoJy5mb3JtX19pbnB1dCcpLFxuXHRcdFx0XHRcdCRmb3JtSW5wdXQgPSAkZm9ybVBhc3N3b3JkLmZpbmQoJ2lucHV0JyksXG5cdFx0XHRcdFx0Zm9ybVR5cGUgPSAkZm9ybUlucHV0LmF0dHIoJ3R5cGUnKTtcblxuXHRcdFx0XHQkZm9ybUlucHV0LmF0dHIoJ3R5cGUnLCBmb3JtVHlwZSA9PT0gJ3RleHQnID8gJ3Bhc3N3b3JkJzogJ3RleHQnKTtcblx0XHRcdFx0JGZvcm1QYXNzd29yZC50b2dnbGVDbGFzcyhhcHAuZm9ybU1vZHVsZXMuc2V0dGluZ3MucGFzc3dvcmRTaG93Q2xhc3MpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFwcC5mb3JtTW9kdWxlcy5zZXR0aW5ncy5wYXNzd29yZFRvZ2dsZS5mb3JFYWNoKGV2ZW50SGFuZGxlcik7XG5cdH0sXG5cblx0dmFsaWRhdGlvbjogZnVuY3Rpb24oKXtcblx0XHRsZXQgcGFyc2xleU9wdGlvbnMgPSB7XG5cdFx0XHRcdGVycm9yQ2xhc3M6ICdmb3JtX19pbnB1dC0tZXJyb3InLFxuXHRcdFx0XHRzdWNjZXNzQ2xhc3M6ICdmb3JtX19pbnB1dC0tc3VjY2VzcycsXG5cdFx0XHRcdGVycm9yc1dyYXBwZXI6ICc8ZGl2IGNsYXNzPVwicGFyc2xleS1jb250YWluZXJcIj48L2Rpdj4nLFxuXHRcdFx0XHRlcnJvclRlbXBsYXRlOiAnPGRpdj48L2Rpdj4nLFxuXHRcdFx0XHR0cmlnZ2VyOiAnY2hhbmdlJyxcblxuXHRcdFx0XHRjbGFzc0hhbmRsZXI6IGZ1bmN0aW9uIChlbGVtZW50KXtcblx0XHRcdFx0XHRsZXQgJGVsZW1lbnQgPSBlbGVtZW50LiRlbGVtZW50WzBdO1xuXG5cdFx0XHRcdFx0aWYgKCRlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdFx0XHRcdGVsZW1lbnQuJGVsZW1lbnQuY2xvc2VzdCgnLmZvcm1fX2lucHV0JykuYWRkQ2xhc3MoJ2Zvcm1fX2lucHV0LS1zZWxlY3QtdmFsaWRhdGVkJyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCRlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2lucHV0JyAmJiAkZWxlbWVudC50eXBlID09PSAnY2hlY2tib3gnIHx8ICRlbGVtZW50LmxvY2FsTmFtZSA9PT0gJ2lucHV0JyAmJiAkZWxlbWVudC50eXBlID09PSAncmFkaW8nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudC4kZWxlbWVudC5jbG9zZXN0KCcuZm9ybV9faW5wdXQtbGlzdCcpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudC4kZWxlbWVudC5jbG9zZXN0KCcuZm9ybV9faW5wdXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZXJyb3JzQ29udGFpbmVyOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0XHRcdGxldCAkY29udGFpbmVyID0gZWxlbWVudC4kZWxlbWVudC5jbG9zZXN0KCcuZm9ybV9faW5wdXQnKTtcblxuXHRcdFx0XHRcdHJldHVybiAkY29udGFpbmVyO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0aWYgKGFwcC5mb3JtTW9kdWxlcy5zZXR0aW5ncy4kdmFsaWRhdGlvbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRhcHAuZm9ybU1vZHVsZXMuc2V0dGluZ3MuJHZhbGlkYXRpb24uZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQodGhpcykucGFyc2xleShwYXJzbGV5T3B0aW9ucyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0d2luZG93LlBhcnNsZXkuc2V0TG9jYWxlKGFwcC5mb3JtTW9kdWxlcy5zZXR0aW5ncy52YWxpZGF0aW9uTGFuZ3VhZ2UpO1xuXHRcdH1cblx0fSxcblxuXHRhamF4Rm9ybTogZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5zZXR0aW5ncy4kYm9keS5vbignc3VibWl0JywgJ1tkYXRhLWZvcm0tYWpheF0nLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGxldCAkZm9ybSA9ICQodGhpcyksXG5cdFx0XHRcdGFjdGlvbiA9ICRmb3JtLmF0dHIoJ2FjdGlvbicpLFxuXHRcdFx0XHRkYXRhID0gJGZvcm0uZGF0YSgpLFxuXHRcdFx0XHR1cmwgPSBudWxsO1xuXG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR1cmwgPT09IHVuZGVmaW5lZCA/IHVybCA9IHdpbmRvdy5sb2NhdGlvbiA6IHVybCA9IGRhdGEuZm9ybUFqYXhVcmw7XG5cblx0XHRcdGlmICgkZm9ybS5wYXJzbGV5KCkuaXNWYWxpZCgpKSB7XG5cdFx0XHRcdCQuYWpheCh7XG5cdFx0XHRcdFx0dXJsOiB1cmwsXG5cdFx0XHRcdFx0ZGF0YTogJGZvcm0uc2VyaWFsaXplKCksXG5cdFx0XHRcdFx0YWN0aW9uOiBhY3Rpb24sXG5cdFx0XHRcdFx0bWV0aG9kOiBkYXRhLmZvcm1BamF4TWV0aG9kLFxuXHRcdFx0XHRcdGRhdGFUeXBlOiBkYXRhLmZvcm1BamF4RGF0YXR5cGUsXG5cdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cblx0XHRcdFx0XHRcdHN3aXRjaCAocmVzcG9uc2Uuc3RhdHVzKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgMjAwOlxuXHRcdFx0XHRcdFx0XHRcdGFwcC5ub3RpZmljYXRpb25zLmFkZChkYXRhLmZvcm1BamF4TXNnQ29udGFpbmVyLCByZXNwb25zZS5tZXNzYWdlLCAnYmV0YScsICdzdWNjZXNzJyk7XG5cdFx0XHRcdFx0XHRcdFx0YXBwLmZvcm1Nb2R1bGVzLmVtcHR5Rm9ybSgkZm9ybSk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgNTAwOlxuXHRcdFx0XHRcdFx0XHRcdGFwcC5ub3RpZmljYXRpb25zLmFkZChkYXRhLmZvcm1BamF4TXNnQ29udGFpbmVyLCByZXNwb25zZS5tZXNzYWdlLCAnYmV0YScsICdlcnJvcicpO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRhcHAuanVtcC50byhkYXRhLmZvcm1BamF4TXNnQ29udGFpbmVyLCA0MCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRlbXB0eUZvcm06IGZ1bmN0aW9uIChfZm9ybSkge1xuXHRcdF9mb3JtLmZpbmQoJ2lucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9cGFzc3dvcmRdLCB0ZXh0YXJlYSwgc2VsZWN0JykudmFsKCcnKTtcblx0XHRfZm9ybS5maW5kKCdpbnB1dFt0eXBlPXJhZGlvXSwgaW5wdXRbdHlwZT1jaGVja2JveF0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuXHR9LFxuXG5cdGZsb2F0aW5nTGFiZWw6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuZm9ybU1vZHVsZXMuZmxvYXRpbmdMYWJlbFNldENsYXNzKCQoJy5mb3JtX19pbnB1dC0tZmxvYXRpbmctbGFiZWwgaW5wdXQnKSk7XG5cblx0XHRhcHAuc2V0dGluZ3MuJGJvZHkub24oJ2NoYW5nZScsICcuZm9ybV9faW5wdXQtLWZsb2F0aW5nLWxhYmVsIGlucHV0JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0YXBwLmZvcm1Nb2R1bGVzLmZsb2F0aW5nTGFiZWxTZXRDbGFzcygkKHRoaXMpKTtcblx0XHR9KTtcblx0fSxcblxuXHRmbG9hdGluZ0xhYmVsU2V0Q2xhc3M6IGZ1bmN0aW9uICgkaW5wdXQpIHtcblx0XHRpZiAoJGlucHV0Lmxlbmd0aCA+IDApIHtcblx0XHRcdCRpbnB1dC52YWwoKS5sZW5ndGggPiAwID8gJGlucHV0LmFkZENsYXNzKCdpcy1maWxsZWQnKSA6ICRpbnB1dC5yZW1vdmVDbGFzcygnaXMtZmlsbGVkJyk7XG5cdFx0fVxuXHR9XG59OyIsImFwcC5nb29nbGVNYXBzID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdGVsOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ29vZ2xlLW1hcHMnKSxcblx0XHRtYXA6IG51bGwsXG5cdFx0bWFya2VyczogW10sXG5cdFx0b3BlbkluZm9XaW5kb3c6IG51bGwsXG5cdFx0Y2VudGVyTGF0OiA1My4xOTkwMjcsXG5cdFx0Y2VudGVyTG9uOiA1Ljc4NDY5M1xuXHR9LFxuXG5cdG1hcmtlckRhdGE6IFtcblx0XHR7XG5cdFx0XHQnbGF0JzogJzUzLjE5OTAyNycsXG5cdFx0XHQnbG5nJzogJzUuNzg0NjkzJyxcblx0XHRcdCdjb250ZW50JzogJzxiPkNvbXBhbnkgSFE8L2I+PGJyIC8+U29tZSBhZGRyZXNzIDIzPGJyIC8+MTIzNCBBQiBMZWV1d2FyZGVuJ1xuXHRcdH0sXG5cdFx0e1xuXHRcdFx0J2xhdCc6ICc1My4xOTk4MTAnLFxuXHRcdFx0J2xuZyc6ICc1Ljc3NDc1MCcsXG5cdFx0XHQnY29udGVudCc6ICc8Yj5Db21wYW55PC9iPjxiciAvPlNvbWUgYWRkcmVzcyAxPGJyIC8+MTIzNCBBQiBMZWV1d2FyZGVuJ1xuXHRcdH1cblx0XSxcblxuXHRpbml0OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoYXBwLmdvb2dsZU1hcHMuc2V0dGluZ3MuZWwgIT09IG51bGwpe1xuXHRcdFx0bGV0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuXG5cdFx0XHRzY3JpcHQudHlwZSA9ICd0ZXh0L2phdmFzY3JpcHQnO1xuXHRcdFx0c2NyaXB0LnNyYyA9ICdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/dj0zLmV4cCcgKyAnJmNhbGxiYWNrPWFwcC5nb29nbGVNYXBzLm1hcCc7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG5cdFx0fVxuXHR9LFxuXG5cdG1hcDogZnVuY3Rpb24gKCkge1xuXHRcdGxldCBtYXBPcHRpb25zID0ge1xuXHRcdFx0em9vbTogMTYsXG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoYXBwLmdvb2dsZU1hcHMuc2V0dGluZ3MuY2VudGVyTGF0LCBhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5jZW50ZXJMb24pLFxuXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlLFxuXHRcdFx0bmF2aWdhdGlvbkNvbnRyb2w6IGZhbHNlLFxuXHRcdFx0bWFwVHlwZUNvbnRyb2w6IGZhbHNlLFxuXHRcdFx0c2NhbGVDb250cm9sOiBmYWxzZSxcblx0XHRcdGRyYWdnYWJsZTogdHJ1ZSxcblx0XHRcdHpvb21Db250cm9sOiBmYWxzZSxcblx0XHRcdHBhbkNvbnRyb2w6IGZhbHNlLFxuXG5cdFx0XHQvLyBTdHlsZXMgZnJvbSBodHRwczovL3NuYXp6eW1hcHMuY29tXG5cdFx0XHRzdHlsZXM6IFt7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNDQ0NDQ0XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImFsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2YyZjJmMlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOi0xMDB9LHtcImxpZ2h0bmVzc1wiOjQ1fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwic2ltcGxpZmllZFwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmFydGVyaWFsXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLmljb25cIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInRyYW5zaXRcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjODFhMmJlXCJ9LHtcInZpc2liaWxpdHlcIjpcIm9uXCJ9XX1dXG5cdFx0fTtcblxuXHRcdGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKCdtb2Rlcm5penJfdG91Y2hldmVudHMnKSkge1xuXHRcdFx0bWFwT3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcblx0XHR9XG5cblx0XHRhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5tYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGFwcC5nb29nbGVNYXBzLnNldHRpbmdzLmVsLCBtYXBPcHRpb25zKTtcblxuXHRcdGxldCBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG5cdFx0Ly8gQ3JlYXRpbmcgYSBnbG9iYWwgaW5mb1dpbmRvdyBvYmplY3QgdGhhdCB3aWxsIGJlIHJldXNlZCBieSBhbGwgbWFya2Vyc1xuXHRcdGxldCBpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKTtcblxuXHRcdGFwcC5nb29nbGVNYXBzLnNldE1hcmtlcnMoYXBwLmdvb2dsZU1hcHMuc2V0dGluZ3MubWFwKTtcblxuXHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKGFwcC5nb29nbGVNYXBzLnNldHRpbmdzLm1hcCwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG5cdFx0XHRhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5tYXJrZXJzW2FwcC5nb29nbGVNYXBzLnNldHRpbmdzLm9wZW5JbmZvV2luZG93XS5pbmZvd2luZG93LmNsb3NlKCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0c2V0TWFya2VyczogZnVuY3Rpb24gKG1hcCwgbWFya2VyKSB7XG5cdFx0bGV0IGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblx0XHQvLyBsZXQgbWFya2VySWNvbiA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXJJbWFnZShcIi9yZXMvYXNzZXRzL2Rpc3QvaW1nL21hcHMtcG9pbnRlci5wbmdcIiwgbmV3IGdvb2dsZS5tYXBzLlNpemUoMTIsIDEyKSwgbmV3IGdvb2dsZS5tYXBzLlBvaW50KDAsIDApLCBuZXcgZ29vZ2xlLm1hcHMuUG9pbnQoNiwgNikpO1xuXG5cblx0XHRhcHAuZ29vZ2xlTWFwcy5tYXJrZXJEYXRhLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0sIGluZGV4LCBhcnJheSkge1xuXHRcdFx0bGV0IGxhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoaXRlbS5sYXQsIGl0ZW0ubG5nKTtcblxuXHRcdFx0Ym91bmRzLmV4dGVuZChsYXRMbmcpO1xuXG5cdFx0XHQvLyBDcmVhdGluZyBhIG1hcmtlciBhbmQgcHV0dGluZyBpdCBvbiB0aGUgbWFwXG5cdFx0XHRsZXQgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG5cdFx0XHRcdHBvc2l0aW9uOiBsYXRMbmcsXG5cdFx0XHRcdC8vIGljb246IG1hcmtlckljb24sXG5cdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHR0aXRsZTogaXRlbS50aXRsZSxcblx0XHRcdH0pO1xuXG5cdFx0XHRtYXJrZXIuaW5mb3dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KHtcblx0XHRcdFx0Y29udGVudDogaXRlbS5jb250ZW50XG5cdFx0XHR9KTtcblxuXHRcdFx0bWFya2VyLmFkZExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRpZiAoYXBwLmdvb2dsZU1hcHMuc2V0dGluZ3Mub3BlbkluZm9XaW5kb3cpIHtcblx0XHRcdFx0XHRhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5tYXJrZXJzW2FwcC5nb29nbGVNYXBzLnNldHRpbmdzLm9wZW5JbmZvV2luZG93XS5pbmZvd2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5vcGVuSW5mb1dpbmRvdyA9IGluZGV4O1xuXHRcdFx0XHRtYXJrZXIuaW5mb3dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhcHAuZ29vZ2xlTWFwcy5zZXR0aW5ncy5tYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHR9KTtcblx0fVxuXG59OyIsImFwcC5ncm91cENoZWNrYWJsZSA9IHtcblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXG5cdFx0Ly8gTWFzdGVyIGNoZWNrYm94XG5cdFx0bGV0IGNoZWNrYWJsZURlbGVnYXRlID0gY2hlY2thYmxlID0+IGFwcC5ncm91cENoZWNrYWJsZS50b2dnbGVHcm91cChjaGVja2FibGUpO1xuXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZ3JvdXAtY2hlY2thYmxlXScpLmZvckVhY2goY2hlY2thYmxlID0+IHtcblx0XHRcdGNoZWNrYWJsZURlbGVnYXRlKGNoZWNrYWJsZSk7XG5cblx0XHRcdGNoZWNrYWJsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiBjaGVja2FibGVEZWxlZ2F0ZShjaGVja2FibGUpKTtcblx0XHR9KTtcblxuXHRcdC8vIFRhcmdldCBjaGVja2JveGVzXG5cdFx0bGV0IGRlbGVnYXRlQ2hlY2tlZENvdW50ID0gdGFyZ2V0ID0+IHRhcmdldC5jaGVja2VkLFxuXHRcdFx0ZGVsZWdhdGVHcm91cENoZWNrYWJsZSA9IHRhcmdldCA9PiB7XG5cdFx0XHRcdGxldCBncm91cCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXAtY2hlY2thYmxlLXRhcmdldCcpLFxuXHRcdFx0XHRcdHRhcmdldHMgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWdyb3VwLWNoZWNrYWJsZS10YXJnZXQ9JyArIGdyb3VwICsgJ10nKSksXG5cdFx0XHRcdFx0dHJpZ2dlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWdyb3VwLWNoZWNrYWJsZT0nICsgZ3JvdXAgKyAnXScpLFxuXHRcdFx0XHRcdGNoZWNrZWRDb3VudCA9IHRhcmdldHMuZmlsdGVyKGRlbGVnYXRlQ2hlY2tlZENvdW50KS5sZW5ndGg7XG5cblx0XHRcdFx0dHJpZ2dlci5jaGVja2VkID0gdGFyZ2V0cy5sZW5ndGggPT09IGNoZWNrZWRDb3VudCA/ICAnY2hlY2tlZCcgOiAnJztcblx0XHRcdH0sXG5cdFx0XHRjaGVja2FibGVFdmVudEhhbmRsZXIgPSB0YXJnZXQgPT4ge1xuXHRcdFx0XHR0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZXZlbnQgPT4gZGVsZWdhdGVHcm91cENoZWNrYWJsZSh0YXJnZXQpKTtcblx0XHRcdH07XG5cblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ncm91cC1jaGVja2FibGUtdGFyZ2V0XScpLmZvckVhY2goY2hlY2thYmxlRXZlbnRIYW5kbGVyKTtcblx0fSxcblxuXHR0b2dnbGVHcm91cDogZnVuY3Rpb24gKGNoZWNrYWJsZSkge1xuXHRcdGxldCBncm91cCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWdyb3VwLWNoZWNrYWJsZS10YXJnZXQ9JyArIGNoZWNrYWJsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZ3JvdXAtY2hlY2thYmxlJykgKyAnXScpLFxuXHRcdFx0ZGVsZWdhdGVHcm91cCA9IGNoZWNrYm94ID0+IGNoZWNrYm94LmNoZWNrZWQgPSBjaGVja2FibGUuY2hlY2tlZCA9PT0gdHJ1ZSA/ICdjaGVja2VkJyA6ICcnO1xuXG5cdFx0Ly8gQ2hlY2sgb3IgdW5jaGVjayBib3hlcyBiYXNlZCBvbiB0aGUgY2hlY2tlZCBzdGF0ZSBvZiB0aGUgZ3JvdXAgY2hlY2tib3guXG5cdFx0Z3JvdXAuZm9yRWFjaChkZWxlZ2F0ZUdyb3VwKTtcblx0fVxufTtcblxuLypkb2Ncbi0tLVxudGl0bGU6IEdyb3VwIGNoZWNrYWJsZVxubmFtZTogZ3JvdXBfY2hlY2thYmxlXG5jYXRlZ29yeTogSmF2YXNjcmlwdFxuLS0tXG5cbmBgYGh0bWxfZXhhbXBsZVxuPGlucHV0IG5hbWU9XCJjaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIGlkPVwiY2hlY2tib3hcIiBkYXRhLWdyb3VwLWNoZWNrYWJsZT1cImNoZWNrYWJsZS1leGFtcGxlXCIgLz48bGFiZWwgZm9yPVwiY2hlY2tib3hcIj5DaGVjayBhbGw8L2xhYmVsPlxuPHVsIGNsYXNzPVwiZm9ybV9faW5wdXQtbGlzdCBsaXN0LXVuc3R5bGVkXCI+XG5cdDxsaT48aW5wdXQgbmFtZT1cImNoZWNrYm94XCIgdHlwZT1cImNoZWNrYm94XCIgaWQ9XCJjaGVja2JveDFcIiBkYXRhLWdyb3VwLWNoZWNrYWJsZS10YXJnZXQ9XCJjaGVja2FibGUtZXhhbXBsZVwiIC8+PGxhYmVsIGZvcj1cImNoZWNrYm94MVwiPkNoZWNrYm94PC9sYWJlbD48L2xpPlxuXHQ8bGk+PGlucHV0IG5hbWU9XCJjaGVja2JveFwiIHR5cGU9XCJjaGVja2JveFwiIGlkPVwiY2hlY2tib3gyXCIgZGF0YS1ncm91cC1jaGVja2FibGUtdGFyZ2V0PVwiY2hlY2thYmxlLWV4YW1wbGVcIiAvPjxsYWJlbCBmb3I9XCJjaGVja2JveDJcIj5DaGVja2JveDwvbGFiZWw+PC9saT5cblx0PGxpPjxpbnB1dCBuYW1lPVwiY2hlY2tib3hcIiB0eXBlPVwiY2hlY2tib3hcIiBpZD1cImNoZWNrYm94M1wiIGRhdGEtZ3JvdXAtY2hlY2thYmxlLXRhcmdldD1cImNoZWNrYWJsZS1leGFtcGxlXCIgLz48bGFiZWwgZm9yPVwiY2hlY2tib3gzXCI+Q2hlY2tib3g8L2xhYmVsPjwvbGk+XG48L3VsPlxuYGBgXG5cbiovIiwiYXBwLmp1bXAgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0c3BlZWQ6IDMwMFxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1qdW1wdG9dJykuZm9yRWFjaChmdW5jdGlvbiAoanVtcGVyKSB7XG5cdFx0XHRqdW1wZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBleHRyYU9mZnNldCA9IDA7XG5cblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0XHRpZiAoanVtcGVyLmdldEF0dHJpYnV0ZSgnZGF0YS1qdW1wdG8tZXh0cmEtb2Zmc2V0JykgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdGV4dHJhT2Zmc2V0ID0ganVtcGVyLmdldEF0dHJpYnV0ZSgnZGF0YS1qdW1wdG8tZXh0cmEtb2Zmc2V0Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoanVtcGVyLmdldEF0dHJpYnV0ZSgnZGF0YS1qdW1wdG8tc3BlZWQnKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0YXBwLmp1bXAuc2V0dGluZ3Muc3BlZWQgPSBqdW1wZXIuZ2V0QXR0cmlidXRlKCdkYXRhLWp1bXB0by1zcGVlZCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXBwLmp1bXAudG8oanVtcGVyLmdldEF0dHJpYnV0ZSgnaHJlZicpLCBleHRyYU9mZnNldCwgYXBwLmp1bXAuc2V0dGluZ3Muc3BlZWQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0dG86IGZ1bmN0aW9uIChfdGFyZ2V0LCBfZXh0cmFPZmZzZXQsIF9zcGVlZCkge1xuXHRcdHZhciBvZmZzZXRUb3AgPSBNYXRoLnJvdW5kKGhlbHBlci5nZXRDb29yZHMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihfdGFyZ2V0KSkudG9wKTtcblxuXHRcdF9leHRyYU9mZnNldCA9PT0gdW5kZWZpbmVkID8gMCA6ICcnO1xuXG5cdFx0aWYgKGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwgIT09IG51bGwpIHtcblx0XHRcdG9mZnNldFRvcCA9IG9mZnNldFRvcCAtIChhcHAubmF2QmFyLnNldHRpbmdzLmVsLm9mZnNldEhlaWdodCArIF9leHRyYU9mZnNldCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9mZnNldFRvcCA9IG9mZnNldFRvcCArIF9leHRyYU9mZnNldDtcblx0XHR9XG5cblx0XHRhcHAuc2V0dGluZ3MuJGh0bWxBbmRCb2R5LmFuaW1hdGUoe3Njcm9sbFRvcDogb2Zmc2V0VG9wfSwgX3NwZWVkLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IF90YXJnZXQ7XG5cdFx0fSk7XG5cdH1cbn07XG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBKdW1wXG5uYW1lOiBqdW1wXG5jYXRlZ29yeTogSmF2YXNjcmlwdFxuLS0tXG5cbmBgYGh0bWxfZXhhbXBsZVxuPGEgaHJlZj1cIiNiYWNrZ3JvdW5kXCIgZGF0YS1qdW1wdG8+SnVtcCB0byBiYWNrZ3JvdW5kIGlkPC9hPlxuYGBgXG5cbiovIiwiYXBwLmxlYXZlID0ge1xuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW3R5cGU9c3VibWl0XScpLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0YXBwLmxlYXZlLmluQWN0aXZlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWxlYXZlLXRhcmdldF0sIFtkYXRhLWxlYXZlLXRhcmdldF0gaW5wdXQ6bm90KHN1Ym1pdCknKS5mb3JFYWNoKGZ1bmN0aW9uIChpbnB1dHMpIHtcblx0XHRcdGlucHV0cy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGFwcC5sZWF2ZS5hY3RpdmUoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpbnB1dHMuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGFwcC5sZWF2ZS5hY3RpdmUoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGFjdGl2ZTogZnVuY3Rpb24gKF9tZXNzYWdlKSB7XG5cdFx0aWYgKF9tZXNzYWdlID09PSB1bmRlZmluZWQpIHtcblx0XHRcdF9tZXNzYWdlID0gJ1lvdSBkaWRuXFwndCBzYXZlIHlvdXIgY2hhbmdlcy4nO1xuXHRcdH1cblxuXHRcdHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIF9tZXNzYWdlO1xuXHRcdH07XG5cdH0sXG5cblx0aW5BY3RpdmU6IGZ1bmN0aW9uICgpIHtcblx0XHR3aW5kb3cub25iZWZvcmV1bmxvYWQgPSB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBMZWF2ZVxubmFtZTogbGVhdmVcbmNhdGVnb3J5OiBKYXZhc2NyaXB0XG4tLS1cblxuU2hvdyBhIG1lc3NhZ2Ugd2hlbiBsZWF2aW5nIHRoZSBwYWdlIGFuZCBmb3JtIGVsZW1lbnRzIGFyZSBlZGl0ZWQuXG5cbiMjIFNlcGVyYXRlIGlucHV0XG5gYGBodG1sX2V4YW1wbGVcbjxpbnB1dCB0eXBlPVwidGV4dFwiIGRhdGEtbGVhdmUtdGFyZ2V0IC8+XG5gYGBcblxuIyMgRW50aXJlIGZvcm1cbmBgYGh0bWxfZXhhbXBsZVxuPGZvcm0gZGF0YS1sZWF2ZS10YXJnZXQgLz5cblx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgLz5cblx0PGlucHV0IHR5cGU9XCJ0ZXh0XCIgLz5cbjwvZm9ybT5cbmBgYFxuXG4qLyIsImFwcC5tb2RhbCA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHRzY3JvbGxUb3BQb3NpdGlvbjogbnVsbCxcblx0XHQkdHJpZ2dlcjogJCgnLm1vZGFsX190cmlnZ2VyJyksXG5cdFx0JG1vZGFsOiAkKCcubW9kYWwnKVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuc2V0dGluZ3MuJGJvZHkuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibW9kYWxfX292ZXJsYXlcIiBkYXRhLW1vZGFsLWNsb3NlPjwvZGl2PicpO1xuXHRcdGFwcC5tb2RhbC50cmlnZ2VycygpO1xuXHR9LFxuXG5cdHRyaWdnZXJzOiBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLnNldHRpbmdzLiRib2R5Lm9uKCdjbGljaycsICcubW9kYWxfX3RyaWdnZXInLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHZhciAkdHJpZ2dlciA9ICQodGhpcyksXG5cdFx0XHRcdGRhdGEgPSAkdHJpZ2dlci5kYXRhKCk7XG5cblx0XHRcdGRhdGEubW9kYWwgPT09ICdhamF4JyA/IGFwcC5tb2RhbC5hamF4KGRhdGEubW9kYWxBamF4QWN0aXZpdHksIGRhdGEubW9kYWxBamF4U2VjdGlvbikgOiBhcHAubW9kYWwub3BlbigkdHJpZ2dlciwgZGF0YSk7XG5cdFx0fSk7XG5cblx0XHRhcHAuc2V0dGluZ3MuJGJvZHkub24oJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCl7XG5cdFx0XHRpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdFx0YXBwLm1vZGFsLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRhcHAuc2V0dGluZ3MuJGJvZHkub24oJ2NsaWNrJywgJ1tkYXRhLW1vZGFsLWNsb3NlXScsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0YXBwLm1vZGFsLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH0sXG5cblx0Y3JlYXRlOiBmdW5jdGlvbiAoX3RyaWdnZXJEYXRhLCBfdGFyZ2V0TW9kYWwpIHtcblx0XHR2YXIgaHRtbCA9ICc8ZGl2IGlkPVwiJyArIF90cmlnZ2VyRGF0YS5tb2RhbElkICsgJ1wiIGNsYXNzPVwibW9kYWxcIj48ZGl2IGNsYXNzPVwibW9kYWxfX2NvbnRlbnRcIj4nO1xuXG5cdFx0aWYgKF90cmlnZ2VyRGF0YS5tb2RhbCA9PT0gJ2FqYXgnKSB7XG5cdFx0XHRodG1sICs9IF90cmlnZ2VyRGF0YS5tb2RhbEFqYXhDb250ZW50O1xuXHRcdFx0aHRtbCArPSAnPGEgY2xhc3M9XCJtb2RhbF9fY2xvc2VcIiBkYXRhLW1vZGFsLWNsb3NlPjwvYT4nO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoX3RyaWdnZXJEYXRhLm1vZGFsVGl0bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRodG1sICs9JzxoMj4nICsgX3RyaWdnZXJEYXRhLm1vZGFsVGl0bGUgKyAnPC9oMj4nO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX3RyaWdnZXJEYXRhLm1vZGFsVGV4dCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGh0bWwgKz0gJzxwPicgKyBfdHJpZ2dlckRhdGEubW9kYWxUZXh0ICsgJzwvcD4nO1xuXHRcdFx0fVxuXG5cdFx0XHRodG1sICs9ICc8dWwgY2xhc3M9XCJsaXN0LWlubGluZVwiPic7XG5cblx0XHRcdGlmIChfdHJpZ2dlckRhdGEubW9kYWxDbG9zZUJ0biAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmIChfdHJpZ2dlckRhdGEubW9kYWwgPT09ICdjb25maXJtJykge1xuXHRcdFx0XHRcdGlmICggdHlwZW9mIF90cmlnZ2VyRGF0YS5tb2RhbENvbmZpcm1BY3Rpb24gPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHRcdFx0aHRtbCArPSAnPGxpPjxhIGNsYXNzPVwiYnRuIGJ0bi0tYmV0YSBidG4tLW1lZGl1bSBjb25maXJtLW9rXCIgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGRhdGEtbW9kYWwtY2xvc2U+JyArIF90cmlnZ2VyRGF0YS5tb2RhbENvbmZpcm1CdG4gKyAnPC9hPjwvbGk+Jztcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aHRtbCArPSAnPGxpPjxhIGNsYXNzPVwiYnRuIGJ0bi0tYmV0YSBidG4tLW1lZGl1bVwiIGhyZWY9XCInICsgX3RyaWdnZXJEYXRhLm1vZGFsQ29uZmlybUFjdGlvbiArICdcIj4nICsgX3RyaWdnZXJEYXRhLm1vZGFsQ29uZmlybUJ0biArICc8L2E+PC9saT4nO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRodG1sICs9ICc8bGk+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLWFscGhhIGJ0bi0tbWVkaXVtXCIgZGF0YS1tb2RhbC1jbG9zZT4nICsgX3RyaWdnZXJEYXRhLm1vZGFsQ2xvc2VCdG4gKyAnPC9idXR0b24+PC9saT4nO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGh0bWwgKz0gJzxsaT48YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tYmV0YSBidG4tLW1lZGl1bVwiIGRhdGEtbW9kYWwtY2xvc2U+JyArIF90cmlnZ2VyRGF0YS5tb2RhbENsb3NlQnRuICsgJzwvYnV0dG9uPjwvbGk+Jztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRodG1sICs9ICc8L3VsPic7XG5cdFx0fVxuXG5cdFx0aHRtbCArPSAnPC9kaXY+PC9kaXY+JztcblxuXHRcdGFwcC5zZXR0aW5ncy4kYm9keS5hcHBlbmQoaHRtbCk7XG5cblx0XHRpZiAoIGFwcC5zZXR0aW5ncy4kaHRtbC5maW5kKCcuY29uZmlybS1vaycpLmxlbmd0aCApIHtcblx0XHRcdGFwcC5zZXR0aW5ncy4kYm9keS5maW5kKCcjJyArIF90cmlnZ2VyRGF0YS5tb2RhbElkICsgJyAuY29uZmlybS1vaycpLmNsaWNrKF90cmlnZ2VyRGF0YS5tb2RhbENvbmZpcm1BY3Rpb24pO1xuXHRcdH1cblx0fSxcblxuXHRvcGVuOiBmdW5jdGlvbiAoX3RyaWdnZXIsIF90cmlnZ2VyRGF0YSkge1xuXHRcdHZhciBzY3JvbGxUb3BQb3NpdGlvbiA9IGFwcC5zZXR0aW5ncy4kd2luZG93LnNjcm9sbFRvcCgpLFxuXHRcdFx0JHRhcmdldE1vZGFsID0gKHR5cGVvZiBfdHJpZ2dlckRhdGEgPT09ICdzdHJpbmcnKSA/ICQoJyMnICsgX3RyaWdnZXJEYXRhKSA6ICQoJyMnICsgX3RyaWdnZXJEYXRhLm1vZGFsSWQpO1xuXG5cdFx0YXBwLm1vZGFsLnNldHRpbmdzLnNjcm9sbFRvcFBvc2l0aW9uID0gc2Nyb2xsVG9wUG9zaXRpb247XG5cblx0XHRpZiAoJHRhcmdldE1vZGFsLmxlbmd0aCA+IDApIHtcblx0XHRcdGFwcC5tb2RhbC5zaG93KCR0YXJnZXRNb2RhbCwgc2Nyb2xsVG9wUG9zaXRpb24sIF90cmlnZ2VyRGF0YS5tb2RhbE9wZW5DYWxsYmFjayk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFwcC5tb2RhbC5jcmVhdGUoX3RyaWdnZXJEYXRhLCAkdGFyZ2V0TW9kYWwpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0YXBwLm1vZGFsLnNob3coJCgnIycgKyBfdHJpZ2dlckRhdGEubW9kYWxJZCksIHNjcm9sbFRvcFBvc2l0aW9uLCBfdHJpZ2dlckRhdGEubW9kYWxPcGVuQ2FsbGJhY2spO1xuXHRcdFx0fSwgMTAwKTtcblx0XHR9XG5cdH0sXG5cblx0c2hvdzogZnVuY3Rpb24gKF90YXJnZXRNb2RhbCwgX3Njcm9sbFRvcFBvc2l0aW9uLCBfbW9kYWxPcGVuQ2FsbGJhY2spIHtcblx0XHRhcHAuc2V0dGluZ3MuJGh0bWwuYWRkQ2xhc3MoJ21vZGFsLXNob3cnKTtcblx0XHRfdGFyZ2V0TW9kYWwuYWRkQ2xhc3MoJ21vZGFsLXNob3cnKTtcblxuXHRcdC8vYXBwLnNldHRpbmdzLiRiYWNrZ3JvdW5kLnNjcm9sbFRvcChfc2Nyb2xsVG9wUG9zaXRpb24pO1xuXHRcdGFwcC5tb2RhbC5zZXRTaXplKF90YXJnZXRNb2RhbCk7XG5cblx0XHRpZiAoX21vZGFsT3BlbkNhbGxiYWNrICYmIHR5cGVvZiBfbW9kYWxPcGVuQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdF9tb2RhbE9wZW5DYWxsYmFjaygpO1xuXHRcdH1cblx0fSxcblxuXHRjbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdCQoJy5tb2RhbC1zaG93JykucmVtb3ZlQ2xhc3MoJ21vZGFsLXNob3cnKTtcblxuXHRcdC8vYXBwLnNldHRpbmdzLiR3aW5kb3cuc2Nyb2xsVG9wKGFwcC5tb2RhbC5zZXR0aW5ncy5zY3JvbGxUb3BQb3NpdGlvbik7XG5cdH0sXG5cblx0Y29uZmlybTogZnVuY3Rpb24gKF9vcHRpb25zKSB7XG5cdFx0dmFyIG1vZGFsSWQgPSAnanMtbW9kYWwtY29uZmlybScsXG5cdFx0XHRvcHRpb25zID0gJC5leHRlbmQoe1xuXHRcdFx0XHRcdFx0XHRtb2RhbDogJ2NvbmZpcm0nLFxuXHRcdFx0XHRcdFx0XHRtb2RhbElkOiBtb2RhbElkLFxuXHRcdFx0XHRcdFx0XHRtb2RhbENvbmZpcm1CdG46ICdiZXZlc3RpZ2VuJyxcblx0XHRcdFx0XHRcdFx0bW9kYWxDbG9zZUJ0bjogJ2FubnVsZXJlbicsXG5cdFx0XHRcdFx0XHR9LCBfb3B0aW9ucyk7XG5cblx0XHQkKCcjJyArIG1vZGFsSWQpLnJlbW92ZSgpO1xuXG5cdFx0YXBwLm1vZGFsLm9wZW4odGhpcywgb3B0aW9ucyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBUT0RPOiBOZWVkcyB3b3JrLi5cblx0ICovXG5cdGFqYXg6IGZ1bmN0aW9uIChhY3Rpdml0eSwgcmVxdWVzdCkge1xuXHRcdHZhciBtb2RhbElkID0gJ2pzLW1vZGFsLWFqYXgnO1xuXG5cdFx0JCgnIycgKyBtb2RhbElkKS5yZW1vdmUoKTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6ICdtb2RhbC1hamF4Lmh0bWwnLFxuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRcdGFwcC5tb2RhbC5vcGVuKHRoaXMsIHtcblx0XHRcdFx0XHRtb2RhbDogJ2FqYXgnLFxuXHRcdFx0XHRcdG1vZGFsSWQ6IG1vZGFsSWQsXG5cdFx0XHRcdFx0bW9kYWxBamF4Q29udGVudDogZGF0YVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRzZXRTaXplOiBmdW5jdGlvbiAoX3RhcmdldE1vZGFsKSB7XG5cdFx0Ly8gQWRkaW5nIGV2ZW4gd2lkdGggYW5kIGhlaWdodFxuXHRcdC8vIEJlY2F1c2Ugb2Ygc3VicGl4ZWwgcmVuZGVyaW5nIGluIFdlYmtpdFxuXHRcdC8vIGh0dHA6Ly9tYXJ0aW5rb29sLmNvbS9wb3N0LzI3NjE4ODMyMjI1L2Jld2FyZS1vZi1oYWxmLXBpeGVscy1pbi1jc3NcblxuXHRcdF90YXJnZXRNb2RhbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuXG5cdFx0X3RhcmdldE1vZGFsLmNzcyh7XG5cdFx0XHR3aWR0aDogKDIgKiBNYXRoLmNlaWwoX3RhcmdldE1vZGFsLndpZHRoKCkgLyAyKSksXG5cdFx0XHRoZWlnaHQ6ICgyICogTWF0aC5jZWlsKF90YXJnZXRNb2RhbC5oZWlnaHQoKSAvIDIpKVxuXHRcdH0pO1xuXHR9XG59OyIsImFwcC5uYXZCYXIgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0ZWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXYtYmFyJyksXG5cdFx0dHJpZ2dlcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdi1iYXItdHJpZ2dlcicpLFxuXHRcdG5hdkJhck9mZnNldFRvcDogbnVsbCxcblx0XHRuYXZCYXJIZWlnaHQ6IG51bGwsXG5cdFx0bGFzdFdpbmRvd1Njcm9sbFRvcDogMCxcblx0XHRoaWRlT25TY3JvbGw6IGZhbHNlLFxuXHRcdGZpeGVkQ2xhc3M6ICduYXYtYmFyLS1maXhlZCcsXG5cdFx0c2hvd0NsYXNzOiAnbmF2LWJhci0tc2hvdycsXG5cdFx0bW9iaWxlU2hvd0NsYXNzOiAnbmF2LWJhci0tbW9iaWxlLXNob3cnLFxuXHRcdHRyYW5zZm9ybUNsYXNzOiAnbmF2LWJhci0tdHJhbnNmb3JtJyxcblx0XHRhbGx3YXlzU2hvd09uTW9iaWxlOiB0cnVlLFxuXHRcdGFsbHdheXNTaG93T25Nb2JpbGVDbGFzczogJ25hdi1iYXItLWFsd2F5cy1zaG93LW9uLW1vYmlsZSdcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbihfc2Nyb2xsVG9wKXtcblx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5lbCAhPT0gbnVsbCkge1xuXHRcdFx0YXBwLm5hdkJhci5yZXNpemUoKTtcblx0XHRcdGFwcC5uYXZCYXIuYWRkQ2xhc3NlcygpO1xuXHRcdFx0YXBwLm5hdkJhci5zY3JvbGxlcihfc2Nyb2xsVG9wKTtcblx0XHRcdGFwcC5uYXZCYXIudHJpZ2dlcigpO1xuXHRcdH1cblx0fSxcblxuXHRyZXNpemU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5lbCAhPT0gbnVsbCkge1xuXHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJPZmZzZXRUb3AgPSBNYXRoLnJvdW5kKGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wKSxcblx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MubmF2QmFySGVpZ2h0ID0gYXBwLm5hdkJhci5zZXR0aW5ncy5lbC5vZmZzZXRIZWlnaHQ7XG5cdFx0fVxuXHR9LFxuXG5cdGFkZENsYXNzZXM6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuY29udGFpbnMoYXBwLm5hdkJhci5zZXR0aW5ncy5maXhlZENsYXNzKSkge1xuXHRcdFx0YXBwLnNldHRpbmdzLmNvbnRhaW5lci5zdHlsZS5tYXJnaW5Ub3AgPSBhcHAubmF2QmFyLnNldHRpbmdzLm5hdkJhckhlaWdodCArICdweCc7XG5cdFx0fVxuXG5cdFx0aWYgKHdpbmRvdy5zY3JvbGxZID49IChhcHAubmF2QmFyLnNldHRpbmdzLm5hdkJhck9mZnNldFRvcCsxKSkge1xuXHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuYWRkKGFwcC5uYXZCYXIuc2V0dGluZ3MuZml4ZWRDbGFzcyk7XG5cdFx0fVxuXG5cdFx0aWYgKGFwcC5uYXZCYXIuc2V0dGluZ3MuYWxsd2F5c1Nob3dPbk1vYmlsZSkge1xuXHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuYWRkKGFwcC5uYXZCYXIuc2V0dGluZ3MuYWxsd2F5c1Nob3dPbk1vYmlsZUNsYXNzKTtcblx0XHR9XG5cdH0sXG5cblx0c2Nyb2xsZXI6IGZ1bmN0aW9uIChfc2Nyb2xsVG9wKSB7XG5cdFx0aWYgKGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwgIT09IG51bGwpIHtcblx0XHRcdGlmIChfc2Nyb2xsVG9wID49IGFwcC5uYXZCYXIuc2V0dGluZ3MubmF2QmFyT2Zmc2V0VG9wKSB7XG5cdFx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LmFkZChhcHAubmF2QmFyLnNldHRpbmdzLmZpeGVkQ2xhc3MpO1xuXHRcdFx0XHRhcHAuc2V0dGluZ3MuY29udGFpbmVyLnN0eWxlLm1hcmdpblRvcCA9IGFwcC5uYXZCYXIuc2V0dGluZ3MubmF2QmFySGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5oaWRlT25TY3JvbGwgJiYgX3Njcm9sbFRvcCA+PSAoYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJPZmZzZXRUb3ArYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJIZWlnaHQpKSB7XG5cdFx0XHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuYWRkKGFwcC5uYXZCYXIuc2V0dGluZ3MudHJhbnNmb3JtQ2xhc3MpO1xuXHRcdFx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LmFkZChhcHAubmF2QmFyLnNldHRpbmdzLnNob3dDbGFzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LnJlbW92ZShhcHAubmF2QmFyLnNldHRpbmdzLmZpeGVkQ2xhc3MpO1xuXHRcdFx0XHRhcHAuc2V0dGluZ3MuY29udGFpbmVyLnN0eWxlLm1hcmdpblRvcCA9IDAgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChhcHAubmF2QmFyLnNldHRpbmdzLmhpZGVPblNjcm9sbCkge1xuXHRcdFx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LnJlbW92ZShhcHAubmF2QmFyLnNldHRpbmdzLnRyYW5zZm9ybUNsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX3Njcm9sbFRvcCA+IGFwcC5uYXZCYXIuc2V0dGluZ3MubGFzdFdpbmRvd1Njcm9sbFRvcCkge1xuXHRcdFx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5oaWRlT25TY3JvbGwgJiYgX3Njcm9sbFRvcCA+PSAoYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJPZmZzZXRUb3ArYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJIZWlnaHQpKSB7XG5cdFx0XHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QucmVtb3ZlKGFwcC5uYXZCYXIuc2V0dGluZ3Muc2hvd0NsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWFwcC5uYXZCYXIuc2V0dGluZ3MuaGlkZU9uU2Nyb2xsKXtcblx0XHRcdFx0XHRhcHAubmF2QmFyLnNldHRpbmdzLmVsLmNsYXNzTGlzdC5yZW1vdmUoYXBwLm5hdkJhci5zZXR0aW5ncy5zaG93Q2xhc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAoYXBwLm5hdkJhci5zZXR0aW5ncy5oaWRlT25TY3JvbGwgJiYgX3Njcm9sbFRvcCA+PSAoYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJPZmZzZXRUb3ArYXBwLm5hdkJhci5zZXR0aW5ncy5uYXZCYXJIZWlnaHQpKSB7XG5cdFx0XHRcdFx0YXBwLm5hdkJhci5zZXR0aW5ncy5lbC5jbGFzc0xpc3QuYWRkKGFwcC5uYXZCYXIuc2V0dGluZ3Muc2hvd0NsYXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWFwcC5uYXZCYXIuc2V0dGluZ3MuaGlkZU9uU2Nyb2xsKXtcblx0XHRcdFx0XHRhcHAubmF2QmFyLnNldHRpbmdzLmVsLmNsYXNzTGlzdC5hZGQoYXBwLm5hdkJhci5zZXR0aW5ncy5zaG93Q2xhc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MubGFzdFdpbmRvd1Njcm9sbFRvcCA9IF9zY3JvbGxUb3A7XG5cdFx0fVxuXHR9LFxuXG5cdHRyaWdnZXI6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAubmF2QmFyLnNldHRpbmdzLnRyaWdnZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGFwcC5uYXZCYXIuc2V0dGluZ3MuZWwuY2xhc3NMaXN0LnRvZ2dsZShhcHAubmF2QmFyLnNldHRpbmdzLm1vYmlsZVNob3dDbGFzcyk7XG5cdFx0fSk7XG5cdH1cbn07IiwiYXBwLm5hdlByaW1hcnkgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0ZWw6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCcjbmF2LXByaW1hcnknKVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uKCl7XG5cdFx0aWYoYXBwLnByaW1hcnlOYXYuc2V0dGluZ3MuZWwgIT09IG51bGwpe31cblx0fVxufTsiLCJhcHAubm90aWZpY2F0aW9ucyA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHRjb29raWVMYXc6IHtcblx0XHRcdHBvc2l0aW9uOiAnYm90dG9tJyxcblx0XHRcdGFwcHJvdmVCdG5UZXh0OiAnb2ssIGlrIHNuYXAgaGV0Jyxcblx0XHRcdGluZm9CdG5TaG93OiB0cnVlLFxuXHRcdFx0aW5mb0J0bkxpbms6ICcvY29va2lld2V0Jyxcblx0XHRcdGluZm9CdG5UZXh0OiAnbWVlciBpbmZvcm1hdGllJyxcblx0XHRcdG5vdGlmaWNhdGlvblRleHQ6ICdXaWogZ2VicnVpa2VuIGNvb2tpZXMgb20gdXcgZ2VicnVpa2Vyc2VydmFyaW5nIHRlIHZlcmJldGVyZW4gZW4gc3RhdGlzdGlla2VuIGJpaiB0ZSBob3VkZW4uJ1xuXHRcdH1cblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0c2VsZi5jbG9zZSgpO1xuXHRcdC8vIHNlbGYuY29va2llTGF3LmluaXQoKTsgLy8gVW5jb21tZW50IGlmIHlvdSBuZWVkIHRoZSBub3RpZmljYXRpb25cblx0fSxcblxuXHRhZGQ6IGZ1bmN0aW9uIChfdGFyZ2V0LCBfbWVzc2FnZSwgX3NpemUsIF90eXBlKSB7XG5cdFx0JChfdGFyZ2V0KS5odG1sKCc8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uIG5vdGlmaWNhdGlvbi0tJyArIF9zaXplICsgJyBub3RpZmljYXRpb24tLScgKyBfdHlwZSArICdcIj48ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uX190ZXh0XCI+JyArIF9tZXNzYWdlICsgJzwvZGl2PjwvZGl2PicpO1xuXHR9LFxuXG5cdGNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0YXBwLnNldHRpbmdzLiRib2R5Lm9uKCdjbGljaycsICdbZGF0YS1ub3RpZmljYXRpb24tY2xvc2VdJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHR2YXIgJGNsb3NlID0gJCh0aGlzKSxcblx0XHRcdFx0JG5vdGlmaWNhdGlvbiA9ICRjbG9zZS5wYXJlbnQoKSxcblx0XHRcdFx0bm90aWZpY2F0aW9uSWQgPSAkbm90aWZpY2F0aW9uLmF0dHIoJ2lkJyk7XG5cblx0XHRcdCRub3RpZmljYXRpb24uYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbi0tY2xvc2UnKTtcblxuXHRcdFx0aWYgKG5vdGlmaWNhdGlvbklkID09PSAnbm90aWZpY2F0aW9uLWNvb2tpZScpIHtcblx0XHRcdFx0aGVscGVyLmNvb2tpZXMuY3JlYXRlKCdjb29raWVOb3RpZmljYXRpb24nLCAnYXBwcm92ZWQnLCAzNjUpO1xuXHRcdFx0fVxuXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0JG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcblx0XHRcdH0sIDUwMCk7XG5cdFx0fSk7XG5cdH0sXG5cblxuXHQvKj09PT09PT09PT0gIENvb2tpZSBsYXcgID09PT09PT09PT0qL1xuXG5cdGNvb2tpZUxhdzoge1xuXHRcdGluaXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdFx0Y29va2llVmFsdWUgPSBoZWxwZXIuY29va2llcy5yZWFkKCdjb29raWVOb3RpZmljYXRpb24nKSxcblx0XHRcdFx0aW5mbyA9ICcnO1xuXG5cdFx0XHRpZiAoY29va2llVmFsdWUgIT09ICdhcHByb3ZlZCcgJiYgbmF2aWdhdG9yLkNvb2tpZXNPSyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGFwcC5zZXR0aW5ncy4kaHRtbC5hdHRyKCdub3RpZmljYXRpb24tY29va2llLXBvc2l0aW9uJywgYXBwLm5vdGlmaWNhdGlvbnMuc2V0dGluZ3MuY29va2llTGF3LnBvc2l0aW9uKTtcblxuXHRcdFx0XHRpZiAoYXBwLm5vdGlmaWNhdGlvbnMuc2V0dGluZ3MuY29va2llTGF3LmluZm9CdG5TaG93KSB7XG5cdFx0XHRcdFx0aW5mbyA9ICc8YSBjbGFzcz1cImJ0biBidG4tLWFscGhhIGJ0bi0tc21hbGxcIiBocmVmPVwiJyArIGFwcC5ub3RpZmljYXRpb25zLnNldHRpbmdzLmNvb2tpZUxhdy5pbmZvQnRuTGluayArICdcIj4nICsgYXBwLm5vdGlmaWNhdGlvbnMuc2V0dGluZ3MuY29va2llTGF3LmluZm9CdG5UZXh0ICsgJzwvYT4nO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dmFyIGh0bWwgPSAnPGRpdiBpZD1cIm5vdGlmaWNhdGlvbi1jb29raWVcIiBjbGFzcz1cIm5vdGlmaWNhdGlvbiBub3RpZmljYXRpb24tLWFscGhhIG5vdGlmaWNhdGlvbi0tY29va2llXCI+Jytcblx0XHRcdFx0XHRcdCAgICc8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uX190ZXh0XCI+JyArIGFwcC5ub3RpZmljYXRpb25zLnNldHRpbmdzLmNvb2tpZUxhdy5ub3RpZmljYXRpb25UZXh0ICsgJzwvZGl2PicrXG5cdFx0XHRcdFx0XHQgICAnPGEgY2xhc3M9XCJidG4gYnRuLS1iZXRhIGJ0bi0tc21hbGxcIiBkYXRhLW5vdGlmaWNhdGlvbi1jbG9zZT4nICsgYXBwLm5vdGlmaWNhdGlvbnMuc2V0dGluZ3MuY29va2llTGF3LmFwcHJvdmVCdG5UZXh0ICsgJzwvYT4gJysgaW5mbyArXG5cdFx0XHRcdFx0XHQgICAnPC9kaXY+JztcblxuXHRcdFx0XHRhcHAuc2V0dGluZ3MuJGJhY2tncm91bmQucHJlcGVuZChodG1sKTtcblxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRhcHAuc2V0dGluZ3MuJGh0bWwuYWRkQ2xhc3MoJ25vdGlmaWNhdGlvbi1jb29raWUtc2hvdycpO1xuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07IiwiYXBwLm9mZkNhbnZhcyA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHR0b2dnbGVMZWZ0OiAnI29mZi1jYW52YXMtdG9nZ2xlLWxlZnQnLFxuXHRcdHRvZ2dsZVJpZ2h0OiAnI29mZi1jYW52YXMtdG9nZ2xlLXJpZ2h0Jyxcblx0XHR3aWR0aDogJCgnLm9mZi1jYW52YXMsIC5vZmYtY2FudmFzLW5hdi1iYXInKS5vdXRlcldpZHRoKCksXG5cdFx0JGVsOiAkKCcub2ZmLWNhbnZhcywgLm9mZi1jYW52YXMtbmF2LWJhcicpLFxuXHRcdCRsaW5rOiAkKCcub2ZmLWNhbnZhcy1uYXZfX2xpbmssIC5vZmYtY2FudmFzLW5hdi1iYXJfX2xpbmsnKVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uICgpIHtcblxuXHRcdGFwcC5vZmZDYW52YXMuc2V0dGluZ3MuJGxpbmsub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHZhciBocmVmID0gd2luZG93LmxvY2F0aW9uLFxuXHRcdFx0XHRsaW5rSHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xuXG5cdFx0XHRhcHAub2ZmQ2FudmFzLmhpZGVMZWZ0QW5kUmlnaHQoKTtcblxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChocmVmICE9PSBsaW5rSHJlZikge1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbiA9IGxpbmtIcmVmO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCA0MDApO1xuXHRcdH0pO1xuXG5cdFx0YXBwLnNldHRpbmdzLiRodG1sLm9uKCdjbGljaycsIGFwcC5vZmZDYW52YXMuc2V0dGluZ3MudG9nZ2xlTGVmdCwgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGFwcC5vZmZDYW52YXMudG9nZ2xlTGVmdCgpO1xuXHRcdH0pO1xuXG5cdFx0YXBwLnNldHRpbmdzLiRodG1sLm9uKCdjbGljaycsIGFwcC5vZmZDYW52YXMuc2V0dGluZ3MudG9nZ2xlUmlnaHQsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRhcHAub2ZmQ2FudmFzLnRvZ2dsZVJpZ2h0KCk7XG5cdFx0fSk7XG5cblx0XHRhcHAuc2V0dGluZ3MuJGNvbnRhaW5lci5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRhcHAub2ZmQ2FudmFzLmhpZGVMZWZ0QW5kUmlnaHQoKTtcblx0XHR9KTtcblxuXHRcdGFwcC5zZXR0aW5ncy4kYm9keVxuXHRcdFx0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24oZXZlbnQpe1xuXHRcdFx0XHRpZiAoZXZlbnQua2V5Q29kZSA9PT0gMjcpIHtcblx0XHRcdFx0XHRhcHAub2ZmQ2FudmFzLmhpZGVMZWZ0QW5kUmlnaHQoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH0sXG5cblx0aGlkZUxlZnRBbmRSaWdodDogZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5zZXR0aW5ncy4kaHRtbFxuXHRcdFx0LnJlbW92ZUNsYXNzKCdvZmYtY2FudmFzLXNob3ctbGVmdCcpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ29mZi1jYW52YXMtc2hvdy1yaWdodCcpXG5cdFx0XHQucmVtb3ZlQ2xhc3MoJ29mZi1jYW52YXMtbmF2LWJhci1zaG93LWxlZnQnKVxuXHRcdFx0LnJlbW92ZUNsYXNzKCdvZmYtY2FudmFzLW5hdi1iYXItc2hvdy1yaWdodCcpO1xuXHR9LFxuXG5cdHNob3dMZWZ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLnNldHRpbmdzLiRodG1sLmFkZENsYXNzKCdvZmYtY2FudmFzLXNob3ctbGVmdCcpLmFkZENsYXNzKCdvZmYtY2FudmFzLW5hdi1iYXItc2hvdy1sZWZ0Jyk7XG5cdH0sXG5cblx0aGlkZUxlZnQ6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuc2V0dGluZ3MuJGh0bWwucmVtb3ZlQ2xhc3MoJ29mZi1jYW52YXMtc2hvdy1sZWZ0JykucmVtb3ZlQ2xhc3MoJ29mZi1jYW52YXMtbmF2LWJhci1zaG93LWxlZnQnKTtcblx0fSxcblxuXHR0b2dnbGVMZWZ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLm9mZkNhbnZhcy5oaWRlUmlnaHQoKTtcblx0XHRhcHAuc2V0dGluZ3MuJGh0bWwudG9nZ2xlQ2xhc3MoJ29mZi1jYW52YXMtc2hvdy1sZWZ0JykudG9nZ2xlQ2xhc3MoJ29mZi1jYW52YXMtbmF2LWJhci1zaG93LWxlZnQnKTtcblx0fSxcblxuXHRzaG93UmlnaHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAuc2V0dGluZ3MuJGh0bWwuYWRkQ2xhc3MoJ29mZi1jYW52YXMtc2hvdy1yaWdodCcpLmFkZENsYXNzKCdvZmYtY2FudmFzLW5hdi1iYXItc2hvdy1yaWdodCcpO1xuXHR9LFxuXG5cdGhpZGVSaWdodDogZnVuY3Rpb24gKCkge1xuXHRcdGFwcC5zZXR0aW5ncy4kaHRtbC5yZW1vdmVDbGFzcygnb2ZmLWNhbnZhcy1zaG93LXJpZ2h0JykucmVtb3ZlQ2xhc3MoJ29mZi1jYW52YXMtbmF2LWJhci1zaG93LXJpZ2h0Jyk7XG5cdH0sXG5cblx0dG9nZ2xlUmlnaHQ6IGZ1bmN0aW9uICgpIHtcblx0XHRhcHAub2ZmQ2FudmFzLmhpZGVMZWZ0KCk7XG5cdFx0YXBwLnNldHRpbmdzLiRodG1sLnRvZ2dsZUNsYXNzKCdvZmYtY2FudmFzLXNob3ctcmlnaHQnKS50b2dnbGVDbGFzcygnb2ZmLWNhbnZhcy1uYXYtYmFyLXNob3ctcmlnaHQnKTtcblx0fVxufTsiLCJhcHAucmVzcG9uc2l2ZUltYWdlcyA9IHtcblx0c2V0dGluZ3M6IHtcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0YXBwLnJlc3BvbnNpdmVJbWFnZXMuc2V0QmFja2dyb3VuZEltYWdlKCk7XG5cdH0sXG5cblx0c2V0QmFja2dyb3VuZEltYWdlOiBmdW5jdGlvbiAoKSB7XG5cdFx0bGV0IHNldERlbGVnYXRlID0gZWwgPT4gYXBwLnJlc3BvbnNpdmVJbWFnZXMuc2V0QmFja2dyb3VuZEltYWdlU3R5bGUoZWwpO1xuXG5cdFx0ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzcG9uc2l2ZS1iZy1pbWddJykuZm9yRWFjaChzZXREZWxlZ2F0ZSk7XG5cdH0sXG5cblx0c2V0QmFja2dyb3VuZEltYWdlU3R5bGU6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0dmFyIGRvbU5vZGUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2ltZycpLFxuXHRcdFx0c291cmNlID0gbnVsbDtcblxuXHRcdGRvbU5vZGUuY3VycmVudFNyYyA9PT0gdW5kZWZpbmVkID8gc291cmNlID0gZG9tTm9kZS5zcmMgOiBzb3VyY2UgPSBkb21Ob2RlLmN1cnJlbnRTcmM7XG5cdFx0ZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyBzb3VyY2UgKyAnKSc7XG5cdH1cbn07XG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBSZXNwb25zaXZlIGltYWdlc1xubmFtZTogOF9yZXNwb25zaXZlX2ltYWdlc1xuY2F0ZWdvcnk6IFJlc3BvbnNpdmUgaW1hZ2VzXG4tLS1cblxuSWYgeW91J3JlIG5ldyB0byByZXNwb25zaXZlIGltYWdlcyBjaGVjayBvdXQgW3RoaXMgYXJ0aWNsZV0oaHR0cHM6Ly9kZXYub3BlcmEuY29tL2FydGljbGVzL25hdGl2ZS1yZXNwb25zaXZlLWltYWdlcy8pLlxuXG5QaWN0dXJlZmlsbCBpcyB1c2VkIGZvciB3aWRlciBicm93c2VyIHN1cHBvcnQuIFRoZXJlIGlzIGEgUGljdHVyZWZpbGwgW0phdmFTY3JpcHQgQVBJXShodHRwczovL3Njb3R0amVobC5naXRodWIuaW8vcGljdHVyZWZpbGwvI2FwaSkgYXZhaWxhYmxlLlxuXG4qL1xuXG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBGaXhlZCBkaW1lbnNpb25zXG5uYW1lOiBmaXhlZF9kaW1lbnNpb25zXG5jYXRlZ29yeTogUmVzcG9uc2l2ZSBpbWFnZXNcbi0tLVxuVGhlc2UgZXhhbXBsZXMgd2lsbCBsZXQgdGhlIGJyb3dzZXIgZGVjaWRlIHdoaWNoIGltYWdlIGlzIGJlc3QgdG8gZGlzcGxheSBvbiB0aGUgdXNlZCBkZXZpY2UuXG5cbiMjIERpZmZlcmVudCBzaXplc1xuVGhpcyB0ZWxscyB0aGUgYnJvd3NlciB0aGUgd2lkdGggb2YgZWFjaCBpbWFnZSwgdGhlIGJyb3dzZXIgZGVjaWRlcyB3aGljaCBpbWFnZSBpcyBiZXN0IHRvIGRpc3BsYXkgb24gdGhlIGN1cnJlbnQgdmlld3BvcnQuXG5cbmBgYGh0bWxfZXhhbXBsZVxuPGltZyBzcmNzZXQ9XCJodHRwOi8vcGxhY2Vob2xkLml0LzQwMHgyMDAgNDAwdyxcblx0XHRcdGh0dHA6Ly9wbGFjZWhvbGQuaXQvODAweDQwMCA4MDB3LFxuXHRcdFx0aHR0cDovL3BsYWNlaG9sZC5pdC8xMjAweDYwMCAxMDI0d1wiXG5cdGFsdD1cIlJlc3BvbnNpdmUgaW1hZ2VcIiAvPlxuYGBgXG5cbiMjIFJldGluYSBleGFtcGxlXG5SZW5kZXJlZCB3aXRoIGEgd2lkdGggb2YgMjAwIHBpeGVscywgZGlmZmVyZW50IHNpemUgb2YgaW1hZ2VzIGFyZSBzaG93biBiYXNlZCBvbiB0aGUgZGV2aWNlIERQSS5cblxuYGBgaHRtbF9leGFtcGxlXG48aW1nXG5cdHNyY3NldD1cImh0dHA6Ly9wbGFjZWhvbGQuaXQvMjAweDIwMCAxeCxcblx0XHRcdGh0dHA6Ly9wbGFjZWhvbGQuaXQvNDAweDQwMCAyeCxcblx0XHRcdGh0dHA6Ly9wbGFjZWhvbGQuaXQvNjAweDYwMCAzeFwiXG5cdGFsdD1cIlJlc3BvbnNpdmUgaW1hZ2VcIlxuXHR3aWR0aD1cIjIwMFwiIC8+XG5gYGBcblxuXG4qL1xuXG4vKmRvY1xuLS0tXG50aXRsZTogVmFyaWFibGUgd2lkdGhcbm5hbWU6IHZhcmlhYmxlX3dpZHRoXG5jYXRlZ29yeTogUmVzcG9uc2l2ZSBpbWFnZXNcbi0tLVxuXG4jIyBEaWZmZXJlbnQgc2l6ZXNcbkhlcmUgd2UgaGludCB0aGUgYnJvd3NlciBob3cgdGhlIGltYWdlIHdpbGwgYmUgZGlzcGxheWVkIGV2ZW50dWFsbHkgYmFzZWQgb24gdGhlIENTUyBtZWRpYSBxdWVyaWVzIHVzZWQgZm9yIHRoZSBkZXNpZ24uXG5cbmBgYGh0bWxfZXhhbXBsZVxuPGltZyBzaXplcz1cIihtYXgtd2lkdGg6IDMwZW0pIDEwMHZ3LFxuXHRcdFx0KG1heC13aWR0aDogNTBlbSkgNTB2dyxcblx0XHRcdDYwdndcIlxuXHRzcmNzZXQ9XCJodHRwOi8vcGxhY2Vob2xkLml0LzQwMHgyMDAgNDAwdyxcblx0XHRcdGh0dHA6Ly9wbGFjZWhvbGQuaXQvODAweDQwMCA4MDB3LFxuXHRcdFx0aHR0cDovL3BsYWNlaG9sZC5pdC8xNjAweDgwMCAxNjAwd1wiXG5cdGFsdD1cIlJlc3BvbnNpdmUgaW1hZ2VcIiAvPlxuYGBgXG5cbiovXG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBBcnQgZGlyZWN0aW9uXG5uYW1lOiBhcnRfZGlyZWN0aW9uXG5jYXRlZ29yeTogUmVzcG9uc2l2ZSBpbWFnZXNcbi0tLVxuVGhpcyBpcyB1c2VkIHdoZW4geW91IG5lZWQgdG8gZXhwbGljaXR5IHNldCBhbiBpbWFnZSBmb3IgYSBjZXJ0aWFuIG1lZGlhIHF1ZXJ5LCB0aGlzIHdheSB5b3UgY2FuIGNyZWF0ZSBjcm9wcGVkIGltYWdlcyB3aXRoIGRpZmZlcmVudCByYXRpb3MgZm9yIGV4YW1wbGUuIFJlYWQgbW9yZSBhYm91dCBbYXJ0IGRpcmVjdGlvbl0oaHR0cHM6Ly9kZXYub3BlcmEuY29tL2FydGljbGVzL25hdGl2ZS1yZXNwb25zaXZlLWltYWdlcy8jYXJ0LWRpcmVjdGlvbikuXG5cbmBgYGh0bWxfZXhhbXBsZVxuPHBpY3R1cmU+XG5cdDxzb3VyY2Ugc3Jjc2V0PVwiaHR0cDovL3BsYWNlaG9sZC5pdC8xMDAweDQwMFwiIG1lZGlhPVwiKG1pbi13aWR0aDogMTAwMHB4KVwiIC8+XG5cdDxzb3VyY2Ugc3Jjc2V0PVwiaHR0cDovL3BsYWNlaG9sZC5pdC84MDB4NDAwXCIgbWVkaWE9XCIobWluLXdpZHRoOiA4MDBweClcIiAvPlxuXHQ8aW1nIHNyY3NldD1cImh0dHA6Ly9wbGFjZWhvbGQuaXQvNjAweDQwMFwiIGFsdD1cIlwiIC8+XG48L3BpY3R1cmU+XG5gYGBcblxuKi9cblxuLypkb2Ncbi0tLVxudGl0bGU6IFNldCBiYWNrZ3JvdW5kIGltYWdlXG5uYW1lOiBzZXRfYmFja2dyb3VuZF9pbWFnZVxuY2F0ZWdvcnk6IFJlc3BvbnNpdmUgaW1hZ2VzXG4tLS1cbkJhY2tncm91bmQgaW1hZ2UgaXMgc2V0IHdpdGggdGhlIGRhdGEtcmVzcG9uc2l2ZS1iZy1pbWcgYXR0cmlidXRlLCBpdCByZWFkcyB0aGUgaW1hZ2UgdGFnIGZvciB0aGUgY3VycmVudCBzb3VyY2UuIFNvIGFsbCB5b3UgaGF2ZSB0byBkbyBpcyBhZGQgdGhlIGF0dHJpYnV0ZSBhbmQgcGxhY2UgYW4gaW1hZ2UgKHdpdGggc3Jjc2V0KSBvciBhIHBpY3R1cmUgKGxpa2UgYmVsb3cpLlxuXG5gYGBwYXJzZV9odG1sX2V4YW1wbGVcbjxkaXYgY2xhc3M9XCJub3RpZmljYXRpb24gbm90aWZpY2F0aW9uLS1hbHBoYVwiPlxuXHQ8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uX190ZXh0XCI+VGhlIGhlYWRlciBjbGFzcyBpcyBhZGRlZCB0byBhZGQgc29tZSBkZW1vIHN0eWxpbmcsIHlvdSBjb3VsZCBhbmQgcHJvYmFibHkgc2hvdWxkIHJlbW92ZSBpdCBpbiB5b3VyIGNvZGUuPC9kaXY+XG48L2Rpdj5cbmBgYFxuXG5gYGBodG1sX2V4YW1wbGVcbjxkaXYgY2xhc3M9XCJoZWFkZXJcIiBkYXRhLXJlc3BvbnNpdmUtYmctaW1nPlxuXHQ8cGljdHVyZSBjbGFzcz1cImRpc3BsYXktbm9uZVwiPlxuXHRcdDxzb3VyY2Ugc3Jjc2V0PVwicmVzcG9uc2l2ZS1iZy1pbWcvMTIwMC5wbmdcIiBtZWRpYT1cIihtaW4td2lkdGg6IDgwMHB4KVwiIC8+XG5cdFx0PHNvdXJjZSBzcmNzZXQ9XCJyZXNwb25zaXZlLWJnLWltZy84MDAucG5nXCIgbWVkaWE9XCIobWluLXdpZHRoOiA0MDBweClcIiAvPlxuXHRcdDxpbWcgc3Jjc2V0PVwicmVzcG9uc2l2ZS1iZy1pbWcvNDAwLnBuZ1wiIC8+XG5cdDwvcGljdHVyZT5cbjwvZGl2PlxuYGBgXG5cbiovIiwiYXBwLnNjcm9sbFNweSA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHQkZWw6ICQoJ1tkYXRhLXNjcm9sbHNweV0nKSxcblx0XHRkZWZhdWx0Q2xhc3M6ICdhbmltYXRpb24tYm91bmNlSW4nLFxuXHRcdHJlcGVhdDogdHJ1ZVxuXHR9LFxuXG5cdGluaXQ6IGZ1bmN0aW9uIChfc2Nyb2xsVG9wLCBfd2luZG93SGVpZ2h0LCBfbG9hZCkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdHdpbmRvd0hlaWdodCA9IGFwcC5zZXR0aW5ncy4kd2luZG93LmhlaWdodCgpO1xuXG5cdFx0aWYgKGFwcC5zY3JvbGxTcHkuc2V0dGluZ3MuJGVsLmxlbmd0aCA+IDApIHtcblx0XHRcdGFwcC5zY3JvbGxTcHkuc2V0dGluZ3MuJGVsLmVhY2goZnVuY3Rpb24gKGluZGV4KSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9ICQodGhpcyksXG5cdFx0XHRcdFx0ZWxQb3NpdGlvblRvcCA9IE1hdGgucm91bmQoJHRoaXMub2Zmc2V0KCkudG9wKSxcblx0XHRcdFx0XHRlbEhlaWdodCA9ICR0aGlzLmhlaWdodCgpLFxuXHRcdFx0XHRcdGluVmlldyA9IGhlbHBlci5pblZpZXcoJHRoaXMpLFxuXHRcdFx0XHRcdG91dFZpZXcgPSBoZWxwZXIub3V0VmlldygkdGhpcyksXG5cdFx0XHRcdFx0cGFydGlhbGx5SW5WaWV3ID0gaGVscGVyLnBhcnRpYWxseUluVmlldygkdGhpcyksXG5cdFx0XHRcdFx0ZGF0YSA9ICR0aGlzLmRhdGEoKSxcblx0XHRcdFx0XHRjb21iaW5lZENsYXNzZXMgPSAoZGF0YS5zY3JvbGxzcHlDbGFzcyA9PT0gdW5kZWZpbmVkKSA/IGFwcC5zY3JvbGxTcHkuc2V0dGluZ3MuZGVmYXVsdENsYXNzIDogZGF0YS5zY3JvbGxzcHlDbGFzcztcblxuXHRcdFx0XHRjb21iaW5lZENsYXNzZXMgKz0gJyBzY3JvbGxzcHktLWluLXZpZXcnO1xuXG5cdFx0XHRcdGlmIChhcHAuc2V0dGluZ3MuJGh0bWwuaGFzQ2xhc3MoJ3RvdWNoJykpIHtcblx0XHRcdFx0XHQkdGhpcy5hZGRDbGFzcyhjb21iaW5lZENsYXNzZXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBoYXNDb21iaW5lZENsYXNzZXMgPSAkdGhpcy5oYXNDbGFzcyhjb21iaW5lZENsYXNzZXMpLFxuXHRcdFx0XHRcdFx0ZGVsYXkgPSAoZGF0YS5zY3JvbGxzcHlEZWxheSA+IDApID8gZGF0YS5zY3JvbGxzcHlEZWxheSA6IDA7XG5cblx0XHRcdFx0XHRpblZpZXcgJiYgIWhhc0NvbWJpbmVkQ2xhc3NlcyA/IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyAkdGhpcy5hZGRDbGFzcyhjb21iaW5lZENsYXNzZXMpOyB9LCBkZWxheSkgOiAnJztcblx0XHRcdFx0XHRfbG9hZCAmJiBwYXJ0aWFsbHlJblZpZXcgJiYgZGF0YS5zY3JvbGxzcHlQYXJ0aWFsbHlJblZpZXcgIT09IHVuZGVmaW5lZCA/IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyAkdGhpcy5hZGRDbGFzcyhjb21iaW5lZENsYXNzZXMpOyB9LCBkZWxheSkgOiAnJztcblxuXHRcdFx0XHRcdGlmIChkYXRhLnNjcm9sbHNweVJlcGVhdCAhPT0gdW5kZWZpbmVkIHx8IGFwcC5zY3JvbGxTcHkuc2V0dGluZ3MucmVwZWF0KSB7XG5cdFx0XHRcdFx0XHRvdXRWaWV3ICYmIGhhc0NvbWJpbmVkQ2xhc3NlcyA/ICAkdGhpcy5yZW1vdmVDbGFzcyhjb21iaW5lZENsYXNzZXMpIDogJyc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0JHRoaXMub3V0ZXJIZWlnaHQoKSA+IHdpbmRvd0hlaWdodCA/ICR0aGlzLmFkZENsYXNzKGNvbWJpbmVkQ2xhc3NlcykgOiAnJztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59OyIsImFwcC5zY3JvbGxTcHlOYXYgPSB7XG5cdHNldHRpbmdzOiB7XG5cdFx0JGVsOiAkKCdbZGF0YS1zY3JvbGxzcHktbmF2XScpLFxuXHRcdG5hdkxlbmd0aDogKCQoJ1tkYXRhLXNjcm9sbHNweS1uYXZdJykubGVuZ3RoLTEpLFxuXHRcdGN1cnJlbnROYXY6IDBcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbiAoX3Njcm9sbFRvcCkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdHdpbmRvd0hlaWdodCA9IGFwcC5zZXR0aW5ncy4kd2luZG93LmhlaWdodCgpO1xuXG5cdFx0aWYgKGFwcC5zY3JvbGxTcHlOYXYuc2V0dGluZ3MuJGVsLmxlbmd0aCA+IDApIHtcblx0XHRcdGFwcC5zY3JvbGxTcHlOYXYuc2V0dGluZ3MuJGVsLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0XHRcdCR0YXJnZXQgPSAkKCR0aGlzLmF0dHIoJ2hyZWYnKSksXG5cdFx0XHRcdFx0dGFyZ2V0VG9wID0gTWF0aC5yb3VuZCgkdGFyZ2V0LnBvc2l0aW9uKCkudG9wKSxcblx0XHRcdFx0XHQkbmV4dCA9ICR0aGlzLnBhcmVudCgpLm5leHQoKS5maW5kKCdbZGF0YS1qdW1wdG8tZXh0cmEtb2Zmc2V0XScpLFxuXHRcdFx0XHRcdG5leHRUb3AgPSBhcHAuc2V0dGluZ3MuJGRvY3VtZW50LmhlaWdodCgpO1xuXG5cdFx0XHRcdGlmIChhcHAubmF2QmFyLnNldHRpbmdzLmVsICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0dGFyZ2V0VG9wID0gdGFyZ2V0VG9wIC0gYXBwLm5hdkJhci5zZXR0aW5ncy5lbC5vZmZzZXRIZWlnaHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQkbmV4dC5sZW5ndGggPT09IDAgPyBuZXh0VG9wID0gYXBwLnNldHRpbmdzLiRkb2N1bWVudC5oZWlnaHQoKSA6IG5leHRUb3AgPSAkbmV4dC5wb3NpdGlvbigpLnRvcDtcblxuXHRcdFx0XHRpZiAoX3Njcm9sbFRvcCA+PSB0YXJnZXRUb3ApIHtcblx0XHRcdFx0XHQkKCcuc2Nyb2xsc3B5LW5hdi0tYWN0aXZlJykubm90KCR0aGlzKS5yZW1vdmVDbGFzcygnc2Nyb2xsc3B5LW5hdi0tYWN0aXZlJyk7XG5cdFx0XHRcdFx0JHRoaXMuYWRkQ2xhc3MoJ3Njcm9sbHNweS1uYXYtLWFjdGl2ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0YXBwLnNjcm9sbFNweU5hdi5zZXR0aW5ncy4kZWwucGFyZW50KCkuZWFjaChmdW5jdGlvbiAoaW5kZXgpIHtcblx0XHRcdFx0dmFyICRpdGVtID0gJCh0aGlzKTtcblxuXHRcdFx0XHRpZiAoX3Njcm9sbFRvcCA9PT0gKGFwcC5zZXR0aW5ncy4kZG9jdW1lbnQuaGVpZ2h0KCktd2luZG93SGVpZ2h0KSkge1xuXHRcdFx0XHRcdCQoJy5zY3JvbGxzcHktbmF2LS1hY3RpdmUnKS5yZW1vdmVDbGFzcygnc2Nyb2xsc3B5LW5hdi0tYWN0aXZlJyk7XG5cdFx0XHRcdFx0YXBwLnNjcm9sbFNweU5hdi5zZXR0aW5ncy4kZWwucGFyZW50KCkuZXEoYXBwLnNjcm9sbFNweU5hdi5zZXR0aW5ncy5uYXZMZW5ndGgpLmZpbmQoJ1tkYXRhLXNjcm9sbHNweS1uYXZdJykuYWRkQ2xhc3MoJ3Njcm9sbHNweS1uYXYtLWFjdGl2ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn07IiwiYXBwLnN2ZyA9IHtcblx0aW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0c3ZnNGV2ZXJ5Ym9keSgpOyAvLyBTVkcgc3VwcG9ydCBmb3IgSUU5LTExXG5cdH1cbn07XG5cbi8qZG9jXG4tLS1cbnRpdGxlOiBTVkdcbm5hbWU6IHN2Z1xuY2F0ZWdvcnk6IENvbnRlbnRcbi0tLVxuXG5UaGVyZSBhcmUgbm8gU1ZHcyBwcmVzZW50IGluIGJhc29zIGJ1dCB5b3UgY2FuIGNyZWF0ZSBhbiBTVkcgd29ya2Zsb3cgZm9yIHlvdXIgcHJvamVjdC4gXG5cbi0gSnVzdCBkcm9wIFNWRyBmaWxlcyBpbiBcIi9hc3NldHMvc3JjL2ltZy9zdmcvXCIuXG4tIEEgZ3J1bnQgdGFzayB3aWxsIGNyZWF0ZSBhbiBTVkcgc3ByaXRlIG9mIHRoZXNlIGZpbGVzIHdpdGggdGhlcmUgZmlsZW5hbWUgYXMgYW4gSUQuXG4tIFlvdSBjYW4gdXNlIHRoZXNlIElEcyB0byByZWZlcmVuY2UgdGhlbSBpbiB5b3VyIEhUTUwgZG9jdW1lbnQsIHNlZSBleGFtcGxlIGJlbG93LlxuXG5gYGBwYXJzZV9odG1sX2V4YW1wbGVcbjxkaXYgY2xhc3M9XCJub3RpZmljYXRpb24gbm90aWZpY2F0aW9uLS1hbHBoYVwiPlxuXHQ8ZGl2IGNsYXNzPVwibm90aWZpY2F0aW9uX190ZXh0XCI+QWxsIHRoZSBTVkcgZmlsZXMgZHJvcHBlZCBpbiB0aGUgc3JjL3N2ZyBmb2xkZXIgd2lsbCBiZSBjb3BpZWQgdG8gdGhlIGRpc3Qvc3ZnIG1hcCBzbyB5b3UgY2FuIHVzZSB0aGVtIHNlcGFyYXRlbHkgaW4geW91ciBkb2N1bWVudC48L2Rpdj5cbjwvZGl2PlxuYGBgXG5cbmBgYHBhcnNlX2h0bWxfZXhhbXBsZVxuPGRpdiBjbGFzcz1cIm5vdGlmaWNhdGlvbiBub3RpZmljYXRpb24tLWFscGhhXCI+XG5cdDxkaXYgY2xhc3M9XCJub3RpZmljYXRpb25fX3RleHRcIj5XZSB1c2Ugc3ZnNGV2ZXJ5Ym9keSBmb3IgSUU5LTExIHN1cHBvcnQuPC9kaXY+XG48L2Rpdj5cbmBgYFxuXG5gYGBodG1sX2V4YW1wbGVcbjxzdmcgd2lkdGg9XCIyMHB4XCIgaGVpZ2h0PVwiMjBweFwiPlxuXHQ8dXNlIHhsaW5rOmhyZWY9XCJhc3NldHMvZGlzdC9pbWcvc3ByaXRlLnN2ZyNJRFwiIC8+XG48L3N2Zz5cbmBgYFxuXG4qLyIsImFwcC50YWJzID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdHRhYjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRhYicpXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdGxldCB0YWJzRXZlbnRIYW5kbGVyID0gdGFiID0+IHtcblx0XHRcdHRhYi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0XHR2YXIgaXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGFiLmdldEF0dHJpYnV0ZSgnaHJlZicpKSxcblx0XHRcdFx0XHRjb250ZW50ID0gaXRlbS5jbG9zZXN0KCcudGFiLWNvbnRlbnQnKTtcblxuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcblx0XHRcdFx0YXBwLnRhYnMuc2V0dGluZ3MudGFiLmZvckVhY2godGFiID0+IHRhYi5jbGFzc0xpc3QucmVtb3ZlKCd0YWItLWFjdGl2ZScpKTtcblx0XHRcdFx0dGFiLmNsYXNzTGlzdC5hZGQoJ3RhYi0tYWN0aXZlJyk7XG5cblx0XHRcdFx0Y29udGVudC5xdWVyeVNlbGVjdG9yKCcudGFiLWl0ZW0tLWFjdGl2ZScpLmNsYXNzTGlzdC5yZW1vdmUoJ3RhYi1pdGVtLS1hY3RpdmUnKTtcblx0XHRcdFx0aXRlbS5jbGFzc0xpc3QuYWRkKCd0YWItaXRlbS0tYWN0aXZlJyk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YXBwLnRhYnMuc2V0dGluZ3MudGFiLmZvckVhY2godGFic0V2ZW50SGFuZGxlcik7XG5cdH1cbn07IiwiYXBwLnRvZ2dsZSA9IHtcblx0c2V0dGluZ3M6IHtcblx0XHRlbDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdG9nZ2xlXScpXG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHRcdGxldCB0b2dnbGVFdmVudEhhbmRsZXIgPSB0b2dnbGUgPT4ge1xuXHRcdFx0dG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdFx0YXBwLnRvZ2dsZS50b2dnbGVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9nZ2xlJykpKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhcHAudG9nZ2xlLnNldHRpbmdzLmVsLmZvckVhY2godG9nZ2xlRXZlbnRIYW5kbGVyKTtcblx0fSxcblxuXHR0b2dnbGVyOiBmdW5jdGlvbiAoX3RhcmdldCkge1xuXHRcdF90YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgndG9nZ2xlLS1oaWRlJyk7XG5cdH1cbn07IiwiYXBwLnRvb2x0aXBzID0ge1xuXHRzZXR0aW5nczoge1xuXHRcdGVsOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9vbHRpcCcpLFxuXHRcdHRvb2x0aXBBY3RpdmVDbGFzczogJ3Rvb2x0aXAtLWFjdGl2ZScsXG5cdFx0dG9vbHRpcENvbnRlbnRDbGFzczogJ3Rvb2x0aXBfX2NvbnRlbnQnLFxuXHRcdGFycm93V2lkdGg6IDgsXG5cdFx0dG9vbHRpcFRyaWdnZXI6IG51bGxcblx0fSxcblxuXHRpbml0OiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKGFwcC50b29sdGlwcy5zZXR0aW5ncy5lbC5sZW5ndGggPiAwKSB7XG5cdFx0XHRsZXQgZGVsZWdhdGUgPSBlbCA9PiB7XG5cdFx0XHRcdGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtdG9vbHRpcC10cmlnZ2VyJykgPT09ICdjbGljaycgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnbW9kZXJuaXpyX3RvdWNoZXZlbnRzJykpIHtcblx0XHRcdFx0XHRhcHAudG9vbHRpcHMuc2V0dGluZ3MudG9vbHRpcFRyaWdnZXIgPSAnY2xpY2snO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFwcC50b29sdGlwcy5zZXR0aW5ncy50b29sdGlwVHJpZ2dlciA9ICdob3Zlcic7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhcHAudG9vbHRpcHMudHJpZ2dlcnMoZWwpO1xuXHRcdFx0XHRhcHAudG9vbHRpcHMuYXBwZW5kQ29udGVudChlbCk7XG5cdFx0XHR9O1xuXG5cdFx0XHRhcHAudG9vbHRpcHMuc2V0dGluZ3MuZWwuZm9yRWFjaChkZWxlZ2F0ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdGFwcGVuZENvbnRlbnQ6IGZ1bmN0aW9uICh0b29sdGlwVHJpZ2dlcikge1xuXHRcdGxldCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cblx0XHRjb250ZW50LmNsYXNzTGlzdC5hZGQoYXBwLnRvb2x0aXBzLnNldHRpbmdzLnRvb2x0aXBDb250ZW50Q2xhc3MpO1xuXHRcdGNvbnRlbnQuaW5uZXJIVE1MID0gdG9vbHRpcFRyaWdnZXIuZ2V0QXR0cmlidXRlKCd0aXRsZScpO1xuXG5cdFx0dG9vbHRpcFRyaWdnZXIuYXBwZW5kQ2hpbGQoY29udGVudCk7XG5cdFx0dG9vbHRpcFRyaWdnZXIuc2V0QXR0cmlidXRlKCd0aXRsZScsICcnKTtcblx0XHRhcHAudG9vbHRpcHMuY2FsY3VsYXRlUG9zaXRpb24odG9vbHRpcFRyaWdnZXIsIHRvb2x0aXBUcmlnZ2VyLnF1ZXJ5U2VsZWN0b3IoJy50b29sdGlwX19jb250ZW50JykpO1xuXHR9LFxuXG5cdHRyaWdnZXJzOiBmdW5jdGlvbiAodG9vbHRpcFRyaWdnZXIpIHtcblx0XHRpZiAoYXBwLnRvb2x0aXBzLnNldHRpbmdzLnRvb2x0aXBUcmlnZ2VyID09PSAnaG92ZXInKSB7XG5cdFx0XHR0b29sdGlwVHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRoaXMuY2xhc3NMaXN0LmFkZChhcHAudG9vbHRpcHMuc2V0dGluZ3MudG9vbHRpcEFjdGl2ZUNsYXNzKTtcblx0XHRcdH0pO1xuXG5cdFx0XHR0b29sdGlwVHJpZ2dlci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhpcy5jbGFzc0xpc3QucmVtb3ZlKGFwcC50b29sdGlwcy5zZXR0aW5ncy50b29sdGlwQWN0aXZlQ2xhc3MpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRvb2x0aXBUcmlnZ2VyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aGlzLmNsYXNzTGlzdC50b2dnbGUoYXBwLnRvb2x0aXBzLnNldHRpbmdzLnRvb2x0aXBBY3RpdmVDbGFzcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0Y2FsY3VsYXRlUG9zaXRpb246IGZ1bmN0aW9uICh0b29sdGlwVHJpZ2dlciwgdG9vbHRpcENvbnRlbnQpIHtcblx0XHRsZXQgcG9zaXRpb24gPSB0b29sdGlwVHJpZ2dlci5vZmZzZXRIZWlnaHQgKyBhcHAudG9vbHRpcHMuc2V0dGluZ3MuYXJyb3dXaWR0aCArICdweCc7XG5cblx0XHRzd2l0Y2ggKHRvb2x0aXBUcmlnZ2VyLmdldEF0dHJpYnV0ZSgnZGF0YS10b29sdGlwLXBvc2l0aW9uJykpIHtcblx0XHRcdGNhc2UgJ3RvcCc6XG5cdFx0XHRcdHRvb2x0aXBDb250ZW50LnN0eWxlLmJvdHRvbSA9IHBvc2l0aW9uO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2JvdHRvbSc6XG5cdFx0XHRcdHRvb2x0aXBDb250ZW50LnN0eWxlLnRvcCA9IHBvc2l0aW9uO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn07IiwiYXBwLnlvdXJNb2R1bGUgPSB7XG5cdHNldHRpbmdzOiB7XG5cdH0sXG5cblx0aW5pdDogZnVuY3Rpb24gKCkge1xuXHR9XG59OyIsImFwcC5zZXR0aW5ncy4kZG9jdW1lbnQucmVhZHkoZnVuY3Rpb24gKCkge1xuXHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdHNjcm9sbFRvcCA9ICR0aGlzLnNjcm9sbFRvcCgpO1xuXG5cdGFwcC5zZXR0aW5ncy5odG1sLmNsYXNzTGlzdC5yZW1vdmUoJ25vLWpzJyk7XG5cdGFwcC5zZXR0aW5ncy5odG1sLmNsYXNzTGlzdC5hZGQoJ2pzJyk7XG5cblx0YXBwLmFmZml4LmluaXQoKTtcblx0YXBwLnN2Zy5pbml0KCk7XG5cdGFwcC5zY3JvbGxTcHlOYXYuaW5pdChzY3JvbGxUb3ApO1xuXHRhcHAuZmFzdENsaWNrLmluaXQoKTtcblx0YXBwLmZpdFZpZHMuaW5pdCgpO1xuXHRhcHAubmF2QmFyLmluaXQoc2Nyb2xsVG9wKTtcblx0YXBwLmRyb3Bkb3ducy5pbml0KCk7XG5cdGFwcC5mb3JtTW9kdWxlcy5pbml0KCk7XG5cdGFwcC5qdW1wLmluaXQoKTtcblx0YXBwLm1vZGFsLmluaXQoKTtcblx0YXBwLnRvb2x0aXBzLmluaXQoKTtcblx0YXBwLmFjY29yZGlvbi5pbml0KCk7XG5cdGFwcC50YWJzLmluaXQoKTtcblx0YXBwLm5vdGlmaWNhdGlvbnMuaW5pdCgpO1xuXHRhcHAub2ZmQ2FudmFzLmluaXQoKTtcblx0YXBwLnRvZ2dsZS5pbml0KCk7XG5cdGFwcC5ncm91cENoZWNrYWJsZS5pbml0KCk7XG5cdGFwcC5sZWF2ZS5pbml0KCk7XG5cdGFwcC5idG5Ecm9wZG93bi5pbml0KCk7XG5cdGFwcC5idG5SaXBwbGUuaW5pdCgpO1xuXHRhcHAuZ29vZ2xlTWFwcy5pbml0KCk7XG5cblx0Ly9hcHAuY3ljbGUuaW5pdCgpO1xuXHQvL2FwcC5mYW5jeWJveC5pbml0KCk7XG5cdC8vYXBwLm5hdlByaW1hcnkuaW5pdCgpO1xuXG59KTtcblxuYXBwLnNldHRpbmdzLiR3aW5kb3cucmVhZHkoZnVuY3Rpb24gKCkge1xuXHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdHNjcm9sbFRvcCA9ICR0aGlzLnNjcm9sbFRvcCgpLFxuXHRcdHdpbmRvd0hlaWdodCA9ICR0aGlzLmhlaWdodCgpO1xuXG5cdGFwcC5zY3JvbGxTcHkuaW5pdChzY3JvbGxUb3AsIHdpbmRvd0hlaWdodCwgdHJ1ZSk7XG5cdGFwcC5lcXVhbGl6ZS5pbml0KCk7XG5cdGFwcC5kZWxheWVkSW1hZ2VMb2FkaW5nLmluaXQoKTtcblxuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRhcHAucmVzcG9uc2l2ZUltYWdlcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoKTtcblx0fSwgMTApO1xufSk7XG5cbmFwcC5zZXR0aW5ncy4kd2luZG93Lm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoKSB7XG5cdHZhciAkdGhpcyA9ICQodGhpcyksXG5cdFx0c2Nyb2xsVG9wID0gJHRoaXMuc2Nyb2xsVG9wKCksXG5cdFx0d2luZG93SGVpZ2h0ID0gJHRoaXMuaGVpZ2h0KCk7XG5cblx0YXBwLnNjcm9sbFNweS5pbml0KHNjcm9sbFRvcCwgd2luZG93SGVpZ2h0LCBmYWxzZSk7XG5cdGFwcC5zY3JvbGxTcHlOYXYuaW5pdChzY3JvbGxUb3ApO1xuXHRhcHAubmF2QmFyLnNjcm9sbGVyKHNjcm9sbFRvcCk7XG5cdGFwcC5kaXNhYmxlSG92ZXIuaW5pdCgpO1xufSk7XG5cbmFwcC5zZXR0aW5ncy4kd2luZG93Lm9uKCd0b3VjaG1vdmUnLCBmdW5jdGlvbigpe1xuXHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdHNjcm9sbFRvcCA9ICR0aGlzLnNjcm9sbFRvcCgpLFxuXHRcdHdpbmRvd0hlaWdodCA9ICR0aGlzLmhlaWdodCgpO1xuXG5cdGFwcC5zY3JvbGxTcHkuaW5pdChzY3JvbGxUb3AsIHdpbmRvd0hlaWdodCwgZmFsc2UpO1xuXHRhcHAuc2Nyb2xsU3B5TmF2LmluaXQoc2Nyb2xsVG9wKTtcbn0pO1xuXG5hcHAuc2V0dGluZ3MuJHdpbmRvdy5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xuXG5cdGFwcC5zZXR0aW5ncy4kaHRtbC5hZGRDbGFzcygnZGlzYWJsZS10cmFuc2l0aW9ucycpO1xuXG5cdGlmKHRoaXMucmVzaXplVG8pIHtcblx0XHRjbGVhclRpbWVvdXQodGhpcy5yZXNpemVUbyk7XG5cdH1cblxuXHR0aGlzLnJlc2l6ZVRvID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHR2YXIgJHRoaXMgPSAkKHRoaXMpLFxuXHRcdFx0c2Nyb2xsVG9wID0gJHRoaXMuc2Nyb2xsVG9wKCksXG5cdFx0XHR3aW5kb3dIZWlnaHQgPSAkdGhpcy5oZWlnaHQoKTtcblxuXHRcdGFwcC5lcXVhbGl6ZS5pbml0KCk7XG5cdFx0YXBwLnNjcm9sbFNweS5pbml0KHNjcm9sbFRvcCwgd2luZG93SGVpZ2h0LCB0cnVlKTtcblx0XHRhcHAuc2Nyb2xsU3B5TmF2LmluaXQoc2Nyb2xsVG9wKTtcblx0XHRhcHAubmF2QmFyLnJlc2l6ZShzY3JvbGxUb3ApO1xuXHRcdGFwcC5uYXZCYXIuc2Nyb2xsZXIoc2Nyb2xsVG9wKTtcblx0XHRhcHAucmVzcG9uc2l2ZUltYWdlcy5zZXRCYWNrZ3JvdW5kSW1hZ2UoKTtcblxuXHRcdGFwcC5zZXR0aW5ncy4kaHRtbC5yZW1vdmVDbGFzcygnZGlzYWJsZS10cmFuc2l0aW9ucycpO1xuXHR9LCA1MDApO1xufSk7Il19