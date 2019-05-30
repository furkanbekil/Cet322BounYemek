/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/**
 * Initialize main helper object
 */
var PZTJS = {
    is_safari    : /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    is_firefox   : navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
    is_chrome    : /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
    is_ie10      : navigator.appVersion.indexOf('MSIE 10') !== -1,
    transitionEnd: 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',
    animIteration: 'animationiteration webkitAnimationIteration oAnimationIteration MSAnimationIteration',
    animationEnd : 'animationend webkitAnimationEnd'
};


/**
 * RequestAnimationFrame polyfill
 */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


/**
 * Set proper transition & animation event names
 */
(function (m) {
    var transEndEventNames = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition'   : 'transitionend',
            'OTransition'     : 'oTransitionEnd',
            'msTransition'    : 'MSTransitionEnd',
            'transition'      : 'transitionend'
        },
        animIterationEventNames = {
            'WebkitAnimation': 'webkitAnimationIteration',
            'MozAnimation'   : 'animationiteration',
            'OAnimation'     : 'oAnimationIteration',
            'msAnimation'    : 'MSAnimationIteration',
            'animation'      : 'animationiteration'
        },
        animEndEventNames = {
            'WebkitAnimation' : 'webkitAnimationEnd',
            'MozTAnimation'   : 'animationend',
            'animation'       : 'animationend'
        };

    PZTJS.transitionEnd = transEndEventNames[m.prefixed('transition')];
    PZTJS.animIteration = animIterationEventNames[m.prefixed('animation')];
    PZTJS.animationEnd = animEndEventNames[m.prefixed('animation')];
})(Modernizr);


/**
 * RequestAnimationFrame wrapper
 * @param callback
 * @constructor
 */
PZTJS.RAFit = function (callback) {
    var new_callback = function() {
        callback();
        window.requestAnimationFrame(new_callback);
    };

    new_callback();
};


/**
 * RequestAnimationFrame for scrolling-related callbacks
 */
PZTJS.scrollRAF = function(callback) {
    var lastScrollPos = -1;

    var new_callback = function() {
        var currentScrollPos = window.pageYOffset / document.body.clientHeight;

        if (lastScrollPos !== currentScrollPos) { // avoid calculations if not needed
            lastScrollPos = currentScrollPos;
            callback();
        }
    };

    PZTJS.RAFit(new_callback);
};


/**
 * Returns PHP-defined value
 */
PZTJS.phpData = function (key, default_value) {
    if (typeof default_value === 'undefined') {
        default_value = 'translation not found';
    }

    if (typeof PZT_PHP_DATA !== 'undefined' && PZT_PHP_DATA.hasOwnProperty(key)) {
        return PZT_PHP_DATA[key];
    }

    return default_value;
};


/**
 * Detects whether user is viewing site from a mobile device
 * @param agent
 * @returns {boolean}
 */
PZTJS.isMobile = function (agent) {
    agent = agent || navigator.userAgent;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
};


/**
 * Date.now() polyfill
 */
if (!Date.now) {
    Date.now = function () { return new Date().getTime(); };
}


/**
 * Trigger document ready event on window element (shorthand)
 */
jQuery(document).ready(function () {
    jQuery(window).trigger('docready');
});


/**
 * Shuffle.js proper layout recalculation shorthand
 */
jQuery.fn.pzt_shuffle = function (options) {
    var $ = jQuery,
        $el = $(this);

    $el.each(function () {
        var $current = $(this),
            throttledLayout = $.throttle(300, function () {
                $current.shuffle('update');
            });

        // instantiate the plugin
        $el.shuffle(options);

        // rebuild shuffle layout everytime image gets loaded
        $el.find('img').each(function () {
            if (this.complete && this.naturalWidth !== undefined) {
                return;
            }

            var proxyImage = new Image();
            $(proxyImage).one('load', throttledLayout);
            proxyImage.src = this.src;
        });
    });

    // rebuild all shuffle grids on page load
    $(window).one('load', function () {
        $el.shuffle('update');
    });

    return this;
};


/**
 * Checks if element is visible in current viewport
 * @param el
 * @returns {boolean}
 */
PZTJS.isElementInViewport = function (el) {
    // special bonus for those using jQuery
    if (typeof jQuery === 'function' && el instanceof jQuery) {
        el = el[0];
    }

    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    while (el.offsetParent) {
        el = el.offsetParent;
        top += el.offsetTop;
        left += el.offsetLeft;
    }

    return (
        top < (window.pageYOffset + window.innerHeight) &&
        left < (window.pageXOffset + window.innerWidth) &&
        (top + height) > window.pageYOffset &&
        (left + width) > window.pageXOffset
    );
};
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwenRfaGVscGVycy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IFJvbWFuIE5hemFya2luLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEluaXRpYWxpemUgbWFpbiBoZWxwZXIgb2JqZWN0XG4gKi9cbnZhciBQWlRKUyA9IHtcbiAgICBpc19zYWZhcmkgICAgOiAvXigoPyFjaHJvbWV8YW5kcm9pZCkuKSpzYWZhcmkvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpLFxuICAgIGlzX2ZpcmVmb3ggICA6IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMSxcbiAgICBpc19jaHJvbWUgICAgOiAvQ2hyb21lLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpICYmIC9Hb29nbGUgSW5jLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpLFxuICAgIGlzX2llMTAgICAgICA6IG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ01TSUUgMTAnKSAhPT0gLTEsXG4gICAgdHJhbnNpdGlvbkVuZDogJ3RyYW5zaXRpb25lbmQgd2Via2l0VHJhbnNpdGlvbkVuZCBvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCBNU1RyYW5zaXRpb25FbmQnLFxuICAgIGFuaW1JdGVyYXRpb246ICdhbmltYXRpb25pdGVyYXRpb24gd2Via2l0QW5pbWF0aW9uSXRlcmF0aW9uIG9BbmltYXRpb25JdGVyYXRpb24gTVNBbmltYXRpb25JdGVyYXRpb24nLFxuICAgIGFuaW1hdGlvbkVuZCA6ICdhbmltYXRpb25lbmQgd2Via2l0QW5pbWF0aW9uRW5kJ1xufTtcblxuXG4vKipcbiAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSBwb2x5ZmlsbFxuICovXG4oZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB2YXIgdmVuZG9ycyA9IFsnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJ107XG4gICAgZm9yKHZhciB4ID0gMDsgeCA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK3gpIHtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW3hdKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbeF0rJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgIHx8IHdpbmRvd1t2ZW5kb3JzW3hdKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICB9XG5cbiAgICBpZiAoIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGN1cnJUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICB2YXIgdGltZVRvQ2FsbCA9IE1hdGgubWF4KDAsIDE2IC0gKGN1cnJUaW1lIC0gbGFzdFRpbWUpKTtcbiAgICAgICAgICAgIHZhciBpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhjdXJyVGltZSArIHRpbWVUb0NhbGwpOyB9LFxuICAgICAgICAgICAgICAgIHRpbWVUb0NhbGwpO1xuICAgICAgICAgICAgbGFzdFRpbWUgPSBjdXJyVGltZSArIHRpbWVUb0NhbGw7XG4gICAgICAgICAgICByZXR1cm4gaWQ7XG4gICAgICAgIH07XG5cbiAgICBpZiAoIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSlcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChpZCk7XG4gICAgICAgIH07XG59KCkpO1xuXG5cbi8qKlxuICogU2V0IHByb3BlciB0cmFuc2l0aW9uICYgYW5pbWF0aW9uIGV2ZW50IG5hbWVzXG4gKi9cbihmdW5jdGlvbiAobSkge1xuICAgIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XG4gICAgICAgICAgICAnV2Via2l0VHJhbnNpdGlvbic6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgICAgICdNb3pUcmFuc2l0aW9uJyAgIDogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICAgICAgJ09UcmFuc2l0aW9uJyAgICAgOiAnb1RyYW5zaXRpb25FbmQnLFxuICAgICAgICAgICAgJ21zVHJhbnNpdGlvbicgICAgOiAnTVNUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgICAgICd0cmFuc2l0aW9uJyAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1JdGVyYXRpb25FdmVudE5hbWVzID0ge1xuICAgICAgICAgICAgJ1dlYmtpdEFuaW1hdGlvbic6ICd3ZWJraXRBbmltYXRpb25JdGVyYXRpb24nLFxuICAgICAgICAgICAgJ01vekFuaW1hdGlvbicgICA6ICdhbmltYXRpb25pdGVyYXRpb24nLFxuICAgICAgICAgICAgJ09BbmltYXRpb24nICAgICA6ICdvQW5pbWF0aW9uSXRlcmF0aW9uJyxcbiAgICAgICAgICAgICdtc0FuaW1hdGlvbicgICAgOiAnTVNBbmltYXRpb25JdGVyYXRpb24nLFxuICAgICAgICAgICAgJ2FuaW1hdGlvbicgICAgICA6ICdhbmltYXRpb25pdGVyYXRpb24nXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1FbmRFdmVudE5hbWVzID0ge1xuICAgICAgICAgICAgJ1dlYmtpdEFuaW1hdGlvbicgOiAnd2Via2l0QW5pbWF0aW9uRW5kJyxcbiAgICAgICAgICAgICdNb3pUQW5pbWF0aW9uJyAgIDogJ2FuaW1hdGlvbmVuZCcsXG4gICAgICAgICAgICAnYW5pbWF0aW9uJyAgICAgICA6ICdhbmltYXRpb25lbmQnXG4gICAgICAgIH07XG5cbiAgICBQWlRKUy50cmFuc2l0aW9uRW5kID0gdHJhbnNFbmRFdmVudE5hbWVzW20ucHJlZml4ZWQoJ3RyYW5zaXRpb24nKV07XG4gICAgUFpUSlMuYW5pbUl0ZXJhdGlvbiA9IGFuaW1JdGVyYXRpb25FdmVudE5hbWVzW20ucHJlZml4ZWQoJ2FuaW1hdGlvbicpXTtcbiAgICBQWlRKUy5hbmltYXRpb25FbmQgPSBhbmltRW5kRXZlbnROYW1lc1ttLnByZWZpeGVkKCdhbmltYXRpb24nKV07XG59KShNb2Rlcm5penIpO1xuXG5cbi8qKlxuICogUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHdyYXBwZXJcbiAqIEBwYXJhbSBjYWxsYmFja1xuICogQGNvbnN0cnVjdG9yXG4gKi9cblBaVEpTLlJBRml0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIG5ld19jYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG5ld19jYWxsYmFjayk7XG4gICAgfTtcblxuICAgIG5ld19jYWxsYmFjaygpO1xufTtcblxuXG4vKipcbiAqIFJlcXVlc3RBbmltYXRpb25GcmFtZSBmb3Igc2Nyb2xsaW5nLXJlbGF0ZWQgY2FsbGJhY2tzXG4gKi9cblBaVEpTLnNjcm9sbFJBRiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGxhc3RTY3JvbGxQb3MgPSAtMTtcblxuICAgIHZhciBuZXdfY2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRTY3JvbGxQb3MgPSB3aW5kb3cucGFnZVlPZmZzZXQgLyBkb2N1bWVudC5ib2R5LmNsaWVudEhlaWdodDtcblxuICAgICAgICBpZiAobGFzdFNjcm9sbFBvcyAhPT0gY3VycmVudFNjcm9sbFBvcykgeyAvLyBhdm9pZCBjYWxjdWxhdGlvbnMgaWYgbm90IG5lZWRlZFxuICAgICAgICAgICAgbGFzdFNjcm9sbFBvcyA9IGN1cnJlbnRTY3JvbGxQb3M7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFBaVEpTLlJBRml0KG5ld19jYWxsYmFjayk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyBQSFAtZGVmaW5lZCB2YWx1ZVxuICovXG5QWlRKUy5waHBEYXRhID0gZnVuY3Rpb24gKGtleSwgZGVmYXVsdF92YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgZGVmYXVsdF92YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgZGVmYXVsdF92YWx1ZSA9ICd0cmFuc2xhdGlvbiBub3QgZm91bmQnO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgUFpUX1BIUF9EQVRBICE9PSAndW5kZWZpbmVkJyAmJiBQWlRfUEhQX0RBVEEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICByZXR1cm4gUFpUX1BIUF9EQVRBW2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmF1bHRfdmFsdWU7XG59O1xuXG5cbi8qKlxuICogRGV0ZWN0cyB3aGV0aGVyIHVzZXIgaXMgdmlld2luZyBzaXRlIGZyb20gYSBtb2JpbGUgZGV2aWNlXG4gKiBAcGFyYW0gYWdlbnRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5QWlRKUy5pc01vYmlsZSA9IGZ1bmN0aW9uIChhZ2VudCkge1xuICAgIGFnZW50ID0gYWdlbnQgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICByZXR1cm4gL0FuZHJvaWR8d2ViT1N8aVBob25lfGlQYWR8aVBvZHxCbGFja0JlcnJ5fElFTW9iaWxlfE9wZXJhIE1pbmkvaS50ZXN0KGFnZW50KTtcbn07XG5cblxuLyoqXG4gKiBEYXRlLm5vdygpIHBvbHlmaWxsXG4gKi9cbmlmICghRGF0ZS5ub3cpIHtcbiAgICBEYXRlLm5vdyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xufVxuXG5cbi8qKlxuICogVHJpZ2dlciBkb2N1bWVudCByZWFkeSBldmVudCBvbiB3aW5kb3cgZWxlbWVudCAoc2hvcnRoYW5kKVxuICovXG5qUXVlcnkoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICBqUXVlcnkod2luZG93KS50cmlnZ2VyKCdkb2NyZWFkeScpO1xufSk7XG5cblxuLyoqXG4gKiBTaHVmZmxlLmpzIHByb3BlciBsYXlvdXQgcmVjYWxjdWxhdGlvbiBzaG9ydGhhbmRcbiAqL1xualF1ZXJ5LmZuLnB6dF9zaHVmZmxlID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB2YXIgJCA9IGpRdWVyeSxcbiAgICAgICAgJGVsID0gJCh0aGlzKTtcblxuICAgICRlbC5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRjdXJyZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAgIHRocm90dGxlZExheW91dCA9ICQudGhyb3R0bGUoMzAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJGN1cnJlbnQuc2h1ZmZsZSgndXBkYXRlJyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBpbnN0YW50aWF0ZSB0aGUgcGx1Z2luXG4gICAgICAgICRlbC5zaHVmZmxlKG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIHJlYnVpbGQgc2h1ZmZsZSBsYXlvdXQgZXZlcnl0aW1lIGltYWdlIGdldHMgbG9hZGVkXG4gICAgICAgICRlbC5maW5kKCdpbWcnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbXBsZXRlICYmIHRoaXMubmF0dXJhbFdpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwcm94eUltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAkKHByb3h5SW1hZ2UpLm9uZSgnbG9hZCcsIHRocm90dGxlZExheW91dCk7XG4gICAgICAgICAgICBwcm94eUltYWdlLnNyYyA9IHRoaXMuc3JjO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIHJlYnVpbGQgYWxsIHNodWZmbGUgZ3JpZHMgb24gcGFnZSBsb2FkXG4gICAgJCh3aW5kb3cpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGVsLnNodWZmbGUoJ3VwZGF0ZScpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cbi8qKlxuICogQ2hlY2tzIGlmIGVsZW1lbnQgaXMgdmlzaWJsZSBpbiBjdXJyZW50IHZpZXdwb3J0XG4gKiBAcGFyYW0gZWxcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5QWlRKUy5pc0VsZW1lbnRJblZpZXdwb3J0ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgLy8gc3BlY2lhbCBib251cyBmb3IgdGhvc2UgdXNpbmcgalF1ZXJ5XG4gICAgaWYgKHR5cGVvZiBqUXVlcnkgPT09ICdmdW5jdGlvbicgJiYgZWwgaW5zdGFuY2VvZiBqUXVlcnkpIHtcbiAgICAgICAgZWwgPSBlbFswXTtcbiAgICB9XG5cbiAgICB2YXIgdG9wID0gZWwub2Zmc2V0VG9wO1xuICAgIHZhciBsZWZ0ID0gZWwub2Zmc2V0TGVmdDtcbiAgICB2YXIgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgICB2YXIgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xuXG4gICAgd2hpbGUgKGVsLm9mZnNldFBhcmVudCkge1xuICAgICAgICBlbCA9IGVsLm9mZnNldFBhcmVudDtcbiAgICAgICAgdG9wICs9IGVsLm9mZnNldFRvcDtcbiAgICAgICAgbGVmdCArPSBlbC5vZmZzZXRMZWZ0O1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIHRvcCA8ICh3aW5kb3cucGFnZVlPZmZzZXQgKyB3aW5kb3cuaW5uZXJIZWlnaHQpICYmXG4gICAgICAgIGxlZnQgPCAod2luZG93LnBhZ2VYT2Zmc2V0ICsgd2luZG93LmlubmVyV2lkdGgpICYmXG4gICAgICAgICh0b3AgKyBoZWlnaHQpID4gd2luZG93LnBhZ2VZT2Zmc2V0ICYmXG4gICAgICAgIChsZWZ0ICsgd2lkdGgpID4gd2luZG93LnBhZ2VYT2Zmc2V0XG4gICAgKTtcbn07Il0sImZpbGUiOiJwenRfaGVscGVycy5qcyJ9
