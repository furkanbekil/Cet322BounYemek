/*!
 * Name    : Just Another Parallax [Jarallax]
 * Version : 1.8.0
 * Author  : _nK https://nkdev.info
 * GitHub  : https://github.com/nk-o/jarallax
 */
(function (window) {
    'use strict';

    // Adapted from https://gist.github.com/paulirish/1579671
    if(!Date.now) {
        Date.now = function () { return new Date().getTime(); };
    }
    if(!window.requestAnimationFrame) {
        (function () {

            var vendors = ['webkit', 'moz'];
            for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
                var vp = vendors[i];
                window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
                window.cancelAnimationFrame = window[vp+'CancelAnimationFrame']
                    || window[vp+'CancelRequestAnimationFrame'];
            }
            if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
                || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
                var lastTime = 0;
                window.requestAnimationFrame = function (callback) {
                    var now = Date.now();
                    var nextTime = Math.max(lastTime + 16, now);
                    return setTimeout(function () { callback(lastTime = nextTime); },
                        nextTime - now);
                };
                window.cancelAnimationFrame = clearTimeout;
            }
        }());
    }

    // test if css property supported by browser
    // like "transform"
    var tempDiv = document.createElement('div');
    function isPropertySupported (property) {
        var prefixes = ['O','Moz','ms','Ms','Webkit'];
        var i = prefixes.length;
        if (tempDiv.style[property] !== undefined) {
            return true;
        }
        property = property.charAt(0).toUpperCase() + property.substr(1);
        while (--i > -1 && tempDiv.style[prefixes[i] + property] === undefined) { }
        return i >= 0;
    }

    var supportTransform = isPropertySupported('transform');
    var supportTransform3D = isPropertySupported('perspective');

    var ua = navigator.userAgent;
    var isAndroid = ua.toLowerCase().indexOf('android') > -1;
    var isIOs = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    var isFirefox = ua.toLowerCase().indexOf('firefox') > -1;
    var isIE = ua.indexOf('MSIE ') > -1    // IE 10 or older
        || ua.indexOf('Trident/') > -1 // IE 11
        || ua.indexOf('Edge/') > -1;   // Edge
    var isIElt10 = document.all && !window.atob; // IE 9 or older

    var wndW;
    var wndH;
    function updateWndVars () {
        wndW = window.innerWidth || document.documentElement.clientWidth;
        wndH = window.innerHeight || document.documentElement.clientHeight;
    }
    updateWndVars();

    // list with all jarallax instances
    // need to render all in one scroll/resize event
    var jarallaxList = [];

    // Jarallax instance
    var Jarallax = (function () {
        var instanceID = 0;

        function Jarallax_inner (item, userOptions) {
            var _this = this,
                dataOptions;

            _this.$item      = item;

            _this.defaults   = {
                type              : 'scroll', // type of parallax: scroll, scale, opacity, scale-opacity, scroll-opacity
                speed             : 0.5, // supported value from -1 to 2
                imgSrc            : null,
                imgWidth          : null,
                imgHeight         : null,
                elementInViewport : null,
                zIndex            : -100,
                noAndroid         : false,
                noIos             : true,

                // events
                onScroll          : null, // function(calculations) {}
                onInit            : null, // function() {}
                onDestroy         : null, // function() {}
                onCoverImage      : null  // function() {}
            };
            dataOptions      = JSON.parse(_this.$item.getAttribute('data-jarallax') || '{}');
            _this.options    = _this.extend({}, _this.defaults, dataOptions, userOptions);

            // stop init if android or ios
            if(!supportTransform || isAndroid && _this.options.noAndroid || isIOs && _this.options.noIos) {
                return;
            }

            // fix speed option [-1.0, 2.0]
            _this.options.speed = Math.min(2, Math.max(-1, parseFloat(_this.options.speed)));

            // custom element to check if parallax in viewport
            var elementInVP = _this.options.elementInViewport;
            // get first item from array
            if(elementInVP && typeof elementInVP === 'object' && typeof elementInVP.length !== 'undefined') {
                elementInVP = elementInVP[0];
            }
            // check if dom element
            if(!elementInVP instanceof Element) {
                elementInVP = null;
            }
            _this.options.elementInViewport = elementInVP;

            _this.instanceID = instanceID++;

            _this.image      = {
                src        : _this.options.imgSrc || null,
                $container : null,
                $item      : null,
                width      : _this.options.imgWidth || null,
                height     : _this.options.imgHeight || null,
                // fix for some devices
                // use <img> instead of background image - more smoothly
                useImgTag  : isIOs || isAndroid || isIE,

                // position absolute is needed on IE9 and FireFox because fixed position have glitches
                position   : !supportTransform3D || isFirefox ? 'absolute' : 'fixed'
            };

            if(_this.initImg()) {
                _this.init();
            }
        }

        return Jarallax_inner;
    }());

    // add styles to element
    Jarallax.prototype.css = function (el, styles) {
        if(typeof styles === 'string') {
            if(window.getComputedStyle) {
                return window.getComputedStyle(el).getPropertyValue(styles);
            }
            return el.style[styles];
        }

        // add transform property with vendor prefixes
        if(styles.transform) {
            if (supportTransform3D) {
                styles.transform += ' translateZ(0)';
            }
            styles.WebkitTransform = styles.MozTransform = styles.msTransform = styles.OTransform = styles.transform;
        }

        for(var k in styles) {
            el.style[k] = styles[k];
        }
        return el;
    };
    // Extend like jQuery.extend
    Jarallax.prototype.extend = function (out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }
        return out;
    };

    // Jarallax functions
    Jarallax.prototype.initImg = function () {
        var _this = this;

        // get image src
        if(_this.image.src === null) {
            _this.image.src = _this.css(_this.$item, 'background-image').replace(/^url\(['"]?/g,'').replace(/['"]?\)$/g,'');
        }
        return !(!_this.image.src || _this.image.src === 'none');
    };

    Jarallax.prototype.init = function () {
        var _this = this,
            containerStyles = {
                position         : 'absolute',
                top              : 0,
                left             : 0,
                width            : '100%',
                height           : '100%',
                overflow         : 'hidden',
                pointerEvents    : 'none'
            },
            imageStyles = {};

        // save default user styles
        _this.$item.setAttribute('data-jarallax-original-styles', _this.$item.getAttribute('style'));

        // set relative position and z-index to the parent
        if (_this.css(_this.$item, 'position') === 'static') {
            _this.css(_this.$item, {
                position: 'relative'
            });
        }
        if (_this.css(_this.$item, 'z-index') === 'auto') {
            _this.css(_this.$item, {
                zIndex: 0
            });
        }

        // container for parallax image
        _this.image.$container = document.createElement('div');
        _this.css(_this.image.$container, containerStyles);
        _this.css(_this.image.$container, {
            visibility : 'hidden',
            'z-index'  : _this.options.zIndex
        });
        _this.image.$container.setAttribute('id', 'jarallax-container-' + _this.instanceID);
        _this.$item.appendChild(_this.image.$container);

        // use img tag
        if(_this.image.useImgTag) {
            _this.image.$item = document.createElement('img');
            _this.image.$item.setAttribute('src', _this.image.src);
            imageStyles = _this.extend({
                'max-width' : 'none'
            }, containerStyles, imageStyles);
        }

        // use div with background image
        else {
            _this.image.$item = document.createElement('div');
            imageStyles = _this.extend({
                'background-position' : '50% 50%',
                'background-size'     : '100% auto',
                'background-repeat'   : 'no-repeat no-repeat',
                'background-image'    : 'url("' + _this.image.src + '")'
            }, containerStyles, imageStyles);
        }

        // check if one of parents have transform style (without this check, scroll transform will be inverted)
        // discussion - https://github.com/nk-o/jarallax/issues/9
        var parentWithTransform = 0;
        var $itemParents = _this.$item;
        while ($itemParents !== null && $itemParents !== document && parentWithTransform === 0) {
            var parent_transform = _this.css($itemParents, '-webkit-transform') || _this.css($itemParents, '-moz-transform') || _this.css($itemParents, 'transform');
            if(parent_transform && parent_transform !== 'none') {
                parentWithTransform = 1;

                // add transform on parallax container if there is parent with transform
                _this.css(_this.image.$container, {
                    transform: 'translateX(0) translateY(0)'
                });
            }
            $itemParents = $itemParents.parentNode;
        }

        // absolute position if one of parents have transformations or parallax without scroll
        if (parentWithTransform || _this.options.type === 'opacity'|| _this.options.type === 'scale' || _this.options.type === 'scale-opacity') {
            _this.image.position = 'absolute';
        }

        // add position to parallax block
        imageStyles.position = _this.image.position;

        // parallax image
        _this.css(_this.image.$item, imageStyles);
        _this.image.$container.appendChild(_this.image.$item);

        // cover image if width and height is ready
        function initAfterReady () {
            _this.coverImage();
            _this.clipContainer();
            _this.onScroll(true);

            // call onInit event
            if(_this.options.onInit) {
                _this.options.onInit.call(_this);
            }

            // timeout to fix IE blinking
            setTimeout(function () {
                if(_this.$item) {
                    // remove default user background
                    _this.css(_this.$item, {
                        'background-image'      : 'none',
                        'background-attachment' : 'scroll',
                        'background-size'       : 'auto'
                    });
                }
            }, 0);
        }

        if(_this.image.width && _this.image.height) {
            // init if width and height already exists
            initAfterReady();
        } else {
            // load image and get width and height
            _this.getImageSize(_this.image.src, function (width, height) {
                _this.image.width  = width;
                _this.image.height = height;
                initAfterReady();
            });
        }

        jarallaxList.push(_this);
    };

    Jarallax.prototype.destroy = function () {
        var _this = this;

        // remove from instances list
        for(var k = 0, len = jarallaxList.length; k < len; k++) {
            if(jarallaxList[k].instanceID === _this.instanceID) {
                jarallaxList.splice(k, 1);
                break;
            }
        }

        // return styles on container as before jarallax init
        var originalStylesTag = _this.$item.getAttribute('data-jarallax-original-styles');
        _this.$item.removeAttribute('data-jarallax-original-styles');
        // null occurs if there is no style tag before jarallax init
        if(originalStylesTag === 'null') {
            _this.$item.removeAttribute('style');
        } else {
            _this.$item.setAttribute('style', originalStylesTag);
        }

        // remove additional dom elements
        if(_this.$clipStyles) {
            _this.$clipStyles.parentNode.removeChild(_this.$clipStyles);
        }
        _this.image.$container.parentNode.removeChild(_this.image.$container);

        // call onDestroy event
        if(_this.options.onDestroy) {
            _this.options.onDestroy.call(_this);
        }

        // delete jarallax from item
        delete _this.$item.jarallax;

        // delete all variables
        for(var n in _this) {
            delete _this[n];
        }
    };

    Jarallax.prototype.getImageSize = function (src, callback) {
        if(!src || !callback) {
            return;
        }

        var tempImg = new Image();
        tempImg.onload = function () {
            callback(tempImg.width, tempImg.height);
        };
        tempImg.src = src;
    };

    // it will remove some image overlapping
    // overlapping occur due to an image position fixed inside absolute position element (webkit based browsers works without any fix)
    Jarallax.prototype.clipContainer = function () {
        // clip is not working properly on real IE9 and less
        if(isIElt10) {
            return;
        }

        var _this  = this,
            rect   = _this.image.$container.getBoundingClientRect(),
            width  = rect.width,
            height = rect.height;

        if(!_this.$clipStyles) {
            _this.$clipStyles = document.createElement('style');
            _this.$clipStyles.setAttribute('type', 'text/css');
            _this.$clipStyles.setAttribute('id', '#jarallax-clip-' + _this.instanceID);
            var head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(_this.$clipStyles);
        }

        var styles = [
            '#jarallax-container-' + _this.instanceID + ' {',
            '   clip: rect(0 ' + width + 'px ' + height + 'px 0);',
            '   clip: rect(0, ' + width + 'px, ' + height + 'px, 0);',
            '}'
        ].join('\n');

        // add clip styles inline (this method need for support IE8 and less browsers)
        if (_this.$clipStyles.styleSheet){
            _this.$clipStyles.styleSheet.cssText = styles;
        } else {
            _this.$clipStyles.innerHTML = styles;
        }
    };

    Jarallax.prototype.coverImage = function () {
        var _this = this;

        if(!_this.image.width || !_this.image.height) {
            return;
        }

        var rect       = _this.image.$container.getBoundingClientRect(),
            contW      = rect.width,
            contH      = rect.height,
            contL      = rect.left,
            imgW       = _this.image.width,
            imgH       = _this.image.height,
            speed      = _this.options.speed,
            isScroll   = _this.options.type === 'scroll' || _this.options.type === 'scroll-opacity',
            scrollDist = 0,
            resultW    = 0,
            resultH    = contH,
            resultML   = 0,
            resultMT   = 0;

        // scroll parallax
        if(isScroll) {
            // scroll distance and height for image
            if (speed < 0) {
                scrollDist = speed * Math.max(contH, wndH);
            } else {
                scrollDist = speed * (contH + wndH);
            }

            // size for scroll parallax
            if (speed > 1) {
                resultH = Math.abs(scrollDist - wndH);
            } else if (speed < 0) {
                resultH = scrollDist / speed + Math.abs(scrollDist);
            }  else {
                resultH += Math.abs(wndH - contH) * (1 - speed);
            }

            scrollDist /= 2;
        }

        // calculate width relative to height and image size
        resultW = resultH * imgW / imgH;
        if(resultW < contW) {
            resultW = contW;
            resultH = resultW * imgH / imgW;
        }

        // center parallax image
        if(isScroll) {
            resultML = contL + (contW - resultW) / 2;
            resultMT = (wndH - resultH) / 2;
        } else {
            resultML = (contW - resultW) / 2;
            resultMT = (contH - resultH) / 2;
        }

        // fix if parallax block in absolute position
        if(_this.image.position === 'absolute') {
            resultML -= contL;
        }

        // store scroll distance
        _this.parallaxScrollDistance = scrollDist;

        // apply result to item
        _this.css(_this.image.$item, {
            width: resultW + 'px',
            height: resultH + 'px',
            marginLeft: resultML + 'px',
            marginTop: resultMT + 'px'
        });

        // call onCoverImage event
        if(_this.options.onCoverImage) {
            _this.options.onCoverImage.call(_this);
        }
    };

    Jarallax.prototype.isVisible = function () {
        return this.isElementInViewport || false;
    };

    Jarallax.prototype.onScroll = function (force) {
        var _this = this;

        if(!_this.image.width || !_this.image.height) {
            return;
        }

        var rect   = _this.$item.getBoundingClientRect(),
            contT  = rect.top,
            contH  = rect.height,
            styles = {
                visibility         : 'visible',
                backgroundPosition : '50% 50%'
            };

        // check if in viewport
        var viewportRect = rect;
        if(_this.options.elementInViewport) {
            viewportRect = _this.options.elementInViewport.getBoundingClientRect();
        }
        _this.isElementInViewport =
            viewportRect.bottom >= 0 &&
            viewportRect.right >= 0 &&
            viewportRect.top <= wndH &&
            viewportRect.left <= wndW;

        // stop calculations if item is not in viewport
        if (force ? false : !_this.isElementInViewport) {
            return;
        }

        // calculate parallax helping variables
        var beforeTop = Math.max(0, contT),
            beforeTopEnd = Math.max(0, contH + contT),
            afterTop = Math.max(0, -contT),
            beforeBottom = Math.max(0, contT + contH - wndH),
            beforeBottomEnd = Math.max(0, contH - (contT + contH - wndH)),
            afterBottom = Math.max(0, -contT + wndH - contH),
            fromViewportCenter = 1 - 2 * (wndH - contT) / (wndH + contH);

        // calculate on how percent of section is visible
        var visiblePercent = 1;
        if(contH < wndH) {
            visiblePercent = 1 - (afterTop || beforeBottom) / contH;
        } else {
            if(beforeTopEnd <= wndH) {
                visiblePercent = beforeTopEnd / wndH;
            } else if (beforeBottomEnd <= wndH) {
                visiblePercent = beforeBottomEnd / wndH;
            }
        }

        // opacity
        if(_this.options.type === 'opacity' || _this.options.type === 'scale-opacity' || _this.options.type === 'scroll-opacity') {
            styles.transform = ''; // empty to add translateZ(0) where it is possible
            styles.opacity = visiblePercent;
        }

        // scale
        if(_this.options.type === 'scale' || _this.options.type === 'scale-opacity') {
            var scale = 1;
            if(_this.options.speed < 0) {
                scale -= _this.options.speed * visiblePercent;
            } else {
                scale += _this.options.speed * (1 - visiblePercent);
            }
            styles.transform = 'scale(' + scale + ')';
        }

        // scroll
        if(_this.options.type === 'scroll' || _this.options.type === 'scroll-opacity') {
            var positionY = _this.parallaxScrollDistance * fromViewportCenter;

            // fix if parallax block in absolute position
            if(_this.image.position === 'absolute') {
                positionY -= contT;
            }

            styles.transform = 'translateY(' + positionY + 'px)';
        }

        _this.css(_this.image.$item, styles);

        // call onScroll event
        if(_this.options.onScroll) {
            _this.options.onScroll.call(_this, {
                section: rect,

                beforeTop: beforeTop,
                beforeTopEnd: beforeTopEnd,
                afterTop: afterTop,
                beforeBottom: beforeBottom,
                beforeBottomEnd: beforeBottomEnd,
                afterBottom: afterBottom,

                visiblePercent: visiblePercent,
                fromViewportCenter: fromViewportCenter
            });
        }
    };


    // init events
    function addEventListener (el, eventName, handler) {
        if (el.addEventListener) {
            el.addEventListener(eventName, handler);
        } else {
            el.attachEvent('on' + eventName, function (){
                handler.call(el);
            });
        }
    }

    function update (e) {
        window.requestAnimationFrame(function () {
            if(e.type !== 'scroll') {
                updateWndVars();
            }
            for(var k = 0, len = jarallaxList.length; k < len; k++) {
                // cover image and clip needed only when parallax container was changed
                if(e.type !== 'scroll') {
                    jarallaxList[k].coverImage();
                    jarallaxList[k].clipContainer();
                }
                jarallaxList[k].onScroll();
            }
        });
    }
    addEventListener(window, 'scroll', update);
    addEventListener(window, 'resize', update);
    addEventListener(window, 'orientationchange', update);
    addEventListener(window, 'load', update);


    // global definition
    var plugin = function (items) {
        // check for dom element
        // thanks: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
        if(typeof HTMLElement === "object" ? items instanceof HTMLElement : items && typeof items === "object" && items !== null && items.nodeType === 1 && typeof items.nodeName==="string") {
            items = [items];
        }

        var options = arguments[1],
            args = Array.prototype.slice.call(arguments, 2),
            len = items.length,
            k = 0,
            ret;

        for (k; k < len; k++) {
            if (typeof options === 'object' || typeof options === 'undefined') {
                if(!items[k].jarallax) {
                    items[k].jarallax = new Jarallax(items[k], options);
                }
            }
            else if(items[k].jarallax) {
                ret = items[k].jarallax[options].apply(items[k].jarallax, args);
            }
            if (typeof ret !== 'undefined') {
                return ret;
            }
        }

        return items;
    };
    plugin.constructor = Jarallax;

    // no conflict
    var oldPlugin = window.jarallax;
    window.jarallax = plugin;
    window.jarallax.noConflict = function () {
        window.jarallax = oldPlugin;
        return this;
    };

    // jQuery support
    if(typeof jQuery !== 'undefined') {
        var jQueryPlugin = function () {
            var args = arguments || [];
            Array.prototype.unshift.call(args, this);
            var res = plugin.apply(window, args);
            return typeof res !== 'object' ? res : this;
        };
        jQueryPlugin.constructor = Jarallax;

        // no conflict
        var oldJqPlugin = jQuery.fn.jarallax;
        jQuery.fn.jarallax = jQueryPlugin;
        jQuery.fn.jarallax.noConflict = function () {
            jQuery.fn.jarallax = oldJqPlugin;
            return this;
        };
    }

    // data-jarallax initialization
    addEventListener(window, 'DOMContentLoaded', function () {
        plugin(document.querySelectorAll('[data-jarallax], [data-jarallax-video]'));
    });
}(window));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqYXJhbGxheC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIE5hbWUgICAgOiBKdXN0IEFub3RoZXIgUGFyYWxsYXggW0phcmFsbGF4XVxuICogVmVyc2lvbiA6IDEuOC4wXG4gKiBBdXRob3IgIDogX25LIGh0dHBzOi8vbmtkZXYuaW5mb1xuICogR2l0SHViICA6IGh0dHBzOi8vZ2l0aHViLmNvbS9uay1vL2phcmFsbGF4XG4gKi9cbihmdW5jdGlvbiAod2luZG93KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC8xNTc5NjcxXG4gICAgaWYoIURhdGUubm93KSB7XG4gICAgICAgIERhdGUubm93ID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG4gICAgfVxuICAgIGlmKCF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgICAgIChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgdnAgPSB2ZW5kb3JzW2ldO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICB8fCB3aW5kb3dbdnArJ0NhbmNlbFJlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkgLy8gaU9TNiBpcyBidWdneVxuICAgICAgICAgICAgICAgIHx8ICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICF3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0VGltZSAtIG5vdyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0oKSk7XG4gICAgfVxuXG4gICAgLy8gdGVzdCBpZiBjc3MgcHJvcGVydHkgc3VwcG9ydGVkIGJ5IGJyb3dzZXJcbiAgICAvLyBsaWtlIFwidHJhbnNmb3JtXCJcbiAgICB2YXIgdGVtcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGZ1bmN0aW9uIGlzUHJvcGVydHlTdXBwb3J0ZWQgKHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBwcmVmaXhlcyA9IFsnTycsJ01veicsJ21zJywnTXMnLCdXZWJraXQnXTtcbiAgICAgICAgdmFyIGkgPSBwcmVmaXhlcy5sZW5ndGg7XG4gICAgICAgIGlmICh0ZW1wRGl2LnN0eWxlW3Byb3BlcnR5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBwcm9wZXJ0eSA9IHByb3BlcnR5LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcHJvcGVydHkuc3Vic3RyKDEpO1xuICAgICAgICB3aGlsZSAoLS1pID4gLTEgJiYgdGVtcERpdi5zdHlsZVtwcmVmaXhlc1tpXSArIHByb3BlcnR5XSA9PT0gdW5kZWZpbmVkKSB7IH1cbiAgICAgICAgcmV0dXJuIGkgPj0gMDtcbiAgICB9XG5cbiAgICB2YXIgc3VwcG9ydFRyYW5zZm9ybSA9IGlzUHJvcGVydHlTdXBwb3J0ZWQoJ3RyYW5zZm9ybScpO1xuICAgIHZhciBzdXBwb3J0VHJhbnNmb3JtM0QgPSBpc1Byb3BlcnR5U3VwcG9ydGVkKCdwZXJzcGVjdGl2ZScpO1xuXG4gICAgdmFyIHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICB2YXIgaXNBbmRyb2lkID0gdWEudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdhbmRyb2lkJykgPiAtMTtcbiAgICB2YXIgaXNJT3MgPSAvaVBhZHxpUGhvbmV8aVBvZC8udGVzdCh1YSkgJiYgIXdpbmRvdy5NU1N0cmVhbTtcbiAgICB2YXIgaXNGaXJlZm94ID0gdWEudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMTtcbiAgICB2YXIgaXNJRSA9IHVhLmluZGV4T2YoJ01TSUUgJykgPiAtMSAgICAvLyBJRSAxMCBvciBvbGRlclxuICAgICAgICB8fCB1YS5pbmRleE9mKCdUcmlkZW50LycpID4gLTEgLy8gSUUgMTFcbiAgICAgICAgfHwgdWEuaW5kZXhPZignRWRnZS8nKSA+IC0xOyAgIC8vIEVkZ2VcbiAgICB2YXIgaXNJRWx0MTAgPSBkb2N1bWVudC5hbGwgJiYgIXdpbmRvdy5hdG9iOyAvLyBJRSA5IG9yIG9sZGVyXG5cbiAgICB2YXIgd25kVztcbiAgICB2YXIgd25kSDtcbiAgICBmdW5jdGlvbiB1cGRhdGVXbmRWYXJzICgpIHtcbiAgICAgICAgd25kVyA9IHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgd25kSCA9IHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xuICAgIH1cbiAgICB1cGRhdGVXbmRWYXJzKCk7XG5cbiAgICAvLyBsaXN0IHdpdGggYWxsIGphcmFsbGF4IGluc3RhbmNlc1xuICAgIC8vIG5lZWQgdG8gcmVuZGVyIGFsbCBpbiBvbmUgc2Nyb2xsL3Jlc2l6ZSBldmVudFxuICAgIHZhciBqYXJhbGxheExpc3QgPSBbXTtcblxuICAgIC8vIEphcmFsbGF4IGluc3RhbmNlXG4gICAgdmFyIEphcmFsbGF4ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlSUQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIEphcmFsbGF4X2lubmVyIChpdGVtLCB1c2VyT3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkYXRhT3B0aW9ucztcblxuICAgICAgICAgICAgX3RoaXMuJGl0ZW0gICAgICA9IGl0ZW07XG5cbiAgICAgICAgICAgIF90aGlzLmRlZmF1bHRzICAgPSB7XG4gICAgICAgICAgICAgICAgdHlwZSAgICAgICAgICAgICAgOiAnc2Nyb2xsJywgLy8gdHlwZSBvZiBwYXJhbGxheDogc2Nyb2xsLCBzY2FsZSwgb3BhY2l0eSwgc2NhbGUtb3BhY2l0eSwgc2Nyb2xsLW9wYWNpdHlcbiAgICAgICAgICAgICAgICBzcGVlZCAgICAgICAgICAgICA6IDAuNSwgLy8gc3VwcG9ydGVkIHZhbHVlIGZyb20gLTEgdG8gMlxuICAgICAgICAgICAgICAgIGltZ1NyYyAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgICAgICAgICBpbWdXaWR0aCAgICAgICAgICA6IG51bGwsXG4gICAgICAgICAgICAgICAgaW1nSGVpZ2h0ICAgICAgICAgOiBudWxsLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRJblZpZXdwb3J0IDogbnVsbCxcbiAgICAgICAgICAgICAgICB6SW5kZXggICAgICAgICAgICA6IC0xMDAsXG4gICAgICAgICAgICAgICAgbm9BbmRyb2lkICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub0lvcyAgICAgICAgICAgICA6IHRydWUsXG5cbiAgICAgICAgICAgICAgICAvLyBldmVudHNcbiAgICAgICAgICAgICAgICBvblNjcm9sbCAgICAgICAgICA6IG51bGwsIC8vIGZ1bmN0aW9uKGNhbGN1bGF0aW9ucykge31cbiAgICAgICAgICAgICAgICBvbkluaXQgICAgICAgICAgICA6IG51bGwsIC8vIGZ1bmN0aW9uKCkge31cbiAgICAgICAgICAgICAgICBvbkRlc3Ryb3kgICAgICAgICA6IG51bGwsIC8vIGZ1bmN0aW9uKCkge31cbiAgICAgICAgICAgICAgICBvbkNvdmVySW1hZ2UgICAgICA6IG51bGwgIC8vIGZ1bmN0aW9uKCkge31cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBkYXRhT3B0aW9ucyAgICAgID0gSlNPTi5wYXJzZShfdGhpcy4kaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtamFyYWxsYXgnKSB8fCAne30nKTtcbiAgICAgICAgICAgIF90aGlzLm9wdGlvbnMgICAgPSBfdGhpcy5leHRlbmQoe30sIF90aGlzLmRlZmF1bHRzLCBkYXRhT3B0aW9ucywgdXNlck9wdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBzdG9wIGluaXQgaWYgYW5kcm9pZCBvciBpb3NcbiAgICAgICAgICAgIGlmKCFzdXBwb3J0VHJhbnNmb3JtIHx8IGlzQW5kcm9pZCAmJiBfdGhpcy5vcHRpb25zLm5vQW5kcm9pZCB8fCBpc0lPcyAmJiBfdGhpcy5vcHRpb25zLm5vSW9zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBmaXggc3BlZWQgb3B0aW9uIFstMS4wLCAyLjBdXG4gICAgICAgICAgICBfdGhpcy5vcHRpb25zLnNwZWVkID0gTWF0aC5taW4oMiwgTWF0aC5tYXgoLTEsIHBhcnNlRmxvYXQoX3RoaXMub3B0aW9ucy5zcGVlZCkpKTtcblxuICAgICAgICAgICAgLy8gY3VzdG9tIGVsZW1lbnQgdG8gY2hlY2sgaWYgcGFyYWxsYXggaW4gdmlld3BvcnRcbiAgICAgICAgICAgIHZhciBlbGVtZW50SW5WUCA9IF90aGlzLm9wdGlvbnMuZWxlbWVudEluVmlld3BvcnQ7XG4gICAgICAgICAgICAvLyBnZXQgZmlyc3QgaXRlbSBmcm9tIGFycmF5XG4gICAgICAgICAgICBpZihlbGVtZW50SW5WUCAmJiB0eXBlb2YgZWxlbWVudEluVlAgPT09ICdvYmplY3QnICYmIHR5cGVvZiBlbGVtZW50SW5WUC5sZW5ndGggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudEluVlAgPSBlbGVtZW50SW5WUFswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGRvbSBlbGVtZW50XG4gICAgICAgICAgICBpZighZWxlbWVudEluVlAgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudEluVlAgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX3RoaXMub3B0aW9ucy5lbGVtZW50SW5WaWV3cG9ydCA9IGVsZW1lbnRJblZQO1xuXG4gICAgICAgICAgICBfdGhpcy5pbnN0YW5jZUlEID0gaW5zdGFuY2VJRCsrO1xuXG4gICAgICAgICAgICBfdGhpcy5pbWFnZSAgICAgID0ge1xuICAgICAgICAgICAgICAgIHNyYyAgICAgICAgOiBfdGhpcy5vcHRpb25zLmltZ1NyYyB8fCBudWxsLFxuICAgICAgICAgICAgICAgICRjb250YWluZXIgOiBudWxsLFxuICAgICAgICAgICAgICAgICRpdGVtICAgICAgOiBudWxsLFxuICAgICAgICAgICAgICAgIHdpZHRoICAgICAgOiBfdGhpcy5vcHRpb25zLmltZ1dpZHRoIHx8IG51bGwsXG4gICAgICAgICAgICAgICAgaGVpZ2h0ICAgICA6IF90aGlzLm9wdGlvbnMuaW1nSGVpZ2h0IHx8IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gZml4IGZvciBzb21lIGRldmljZXNcbiAgICAgICAgICAgICAgICAvLyB1c2UgPGltZz4gaW5zdGVhZCBvZiBiYWNrZ3JvdW5kIGltYWdlIC0gbW9yZSBzbW9vdGhseVxuICAgICAgICAgICAgICAgIHVzZUltZ1RhZyAgOiBpc0lPcyB8fCBpc0FuZHJvaWQgfHwgaXNJRSxcblxuICAgICAgICAgICAgICAgIC8vIHBvc2l0aW9uIGFic29sdXRlIGlzIG5lZWRlZCBvbiBJRTkgYW5kIEZpcmVGb3ggYmVjYXVzZSBmaXhlZCBwb3NpdGlvbiBoYXZlIGdsaXRjaGVzXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gICA6ICFzdXBwb3J0VHJhbnNmb3JtM0QgfHwgaXNGaXJlZm94ID8gJ2Fic29sdXRlJyA6ICdmaXhlZCdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmKF90aGlzLmluaXRJbWcoKSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBKYXJhbGxheF9pbm5lcjtcbiAgICB9KCkpO1xuXG4gICAgLy8gYWRkIHN0eWxlcyB0byBlbGVtZW50XG4gICAgSmFyYWxsYXgucHJvdG90eXBlLmNzcyA9IGZ1bmN0aW9uIChlbCwgc3R5bGVzKSB7XG4gICAgICAgIGlmKHR5cGVvZiBzdHlsZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZih3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsLnN0eWxlW3N0eWxlc107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgdHJhbnNmb3JtIHByb3BlcnR5IHdpdGggdmVuZG9yIHByZWZpeGVzXG4gICAgICAgIGlmKHN0eWxlcy50cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgIGlmIChzdXBwb3J0VHJhbnNmb3JtM0QpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHlsZXMuV2Via2l0VHJhbnNmb3JtID0gc3R5bGVzLk1velRyYW5zZm9ybSA9IHN0eWxlcy5tc1RyYW5zZm9ybSA9IHN0eWxlcy5PVHJhbnNmb3JtID0gc3R5bGVzLnRyYW5zZm9ybTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgayBpbiBzdHlsZXMpIHtcbiAgICAgICAgICAgIGVsLnN0eWxlW2tdID0gc3R5bGVzW2tdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbDtcbiAgICB9O1xuICAgIC8vIEV4dGVuZCBsaWtlIGpRdWVyeS5leHRlbmRcbiAgICBKYXJhbGxheC5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24gKG91dCkge1xuICAgICAgICBvdXQgPSBvdXQgfHwge307XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIWFyZ3VtZW50c1tpXSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBvdXRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG5cbiAgICAvLyBKYXJhbGxheCBmdW5jdGlvbnNcbiAgICBKYXJhbGxheC5wcm90b3R5cGUuaW5pdEltZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICAvLyBnZXQgaW1hZ2Ugc3JjXG4gICAgICAgIGlmKF90aGlzLmltYWdlLnNyYyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgX3RoaXMuaW1hZ2Uuc3JjID0gX3RoaXMuY3NzKF90aGlzLiRpdGVtLCAnYmFja2dyb3VuZC1pbWFnZScpLnJlcGxhY2UoL151cmxcXChbJ1wiXT8vZywnJykucmVwbGFjZSgvWydcIl0/XFwpJC9nLCcnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gISghX3RoaXMuaW1hZ2Uuc3JjIHx8IF90aGlzLmltYWdlLnNyYyA9PT0gJ25vbmUnKTtcbiAgICB9O1xuXG4gICAgSmFyYWxsYXgucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICAgICBjb250YWluZXJTdHlsZXMgPSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gICAgICAgICA6ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICAgICAgdG9wICAgICAgICAgICAgICA6IDAsXG4gICAgICAgICAgICAgICAgbGVmdCAgICAgICAgICAgICA6IDAsXG4gICAgICAgICAgICAgICAgd2lkdGggICAgICAgICAgICA6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICBoZWlnaHQgICAgICAgICAgIDogJzEwMCUnLFxuICAgICAgICAgICAgICAgIG92ZXJmbG93ICAgICAgICAgOiAnaGlkZGVuJyxcbiAgICAgICAgICAgICAgICBwb2ludGVyRXZlbnRzICAgIDogJ25vbmUnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW1hZ2VTdHlsZXMgPSB7fTtcblxuICAgICAgICAvLyBzYXZlIGRlZmF1bHQgdXNlciBzdHlsZXNcbiAgICAgICAgX3RoaXMuJGl0ZW0uc2V0QXR0cmlidXRlKCdkYXRhLWphcmFsbGF4LW9yaWdpbmFsLXN0eWxlcycsIF90aGlzLiRpdGVtLmdldEF0dHJpYnV0ZSgnc3R5bGUnKSk7XG5cbiAgICAgICAgLy8gc2V0IHJlbGF0aXZlIHBvc2l0aW9uIGFuZCB6LWluZGV4IHRvIHRoZSBwYXJlbnRcbiAgICAgICAgaWYgKF90aGlzLmNzcyhfdGhpcy4kaXRlbSwgJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICBfdGhpcy5jc3MoX3RoaXMuJGl0ZW0sIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF90aGlzLmNzcyhfdGhpcy4kaXRlbSwgJ3otaW5kZXgnKSA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICBfdGhpcy5jc3MoX3RoaXMuJGl0ZW0sIHtcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29udGFpbmVyIGZvciBwYXJhbGxheCBpbWFnZVxuICAgICAgICBfdGhpcy5pbWFnZS4kY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIF90aGlzLmNzcyhfdGhpcy5pbWFnZS4kY29udGFpbmVyLCBjb250YWluZXJTdHlsZXMpO1xuICAgICAgICBfdGhpcy5jc3MoX3RoaXMuaW1hZ2UuJGNvbnRhaW5lciwge1xuICAgICAgICAgICAgdmlzaWJpbGl0eSA6ICdoaWRkZW4nLFxuICAgICAgICAgICAgJ3otaW5kZXgnICA6IF90aGlzLm9wdGlvbnMuekluZGV4XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5pbWFnZS4kY29udGFpbmVyLnNldEF0dHJpYnV0ZSgnaWQnLCAnamFyYWxsYXgtY29udGFpbmVyLScgKyBfdGhpcy5pbnN0YW5jZUlEKTtcbiAgICAgICAgX3RoaXMuJGl0ZW0uYXBwZW5kQ2hpbGQoX3RoaXMuaW1hZ2UuJGNvbnRhaW5lcik7XG5cbiAgICAgICAgLy8gdXNlIGltZyB0YWdcbiAgICAgICAgaWYoX3RoaXMuaW1hZ2UudXNlSW1nVGFnKSB7XG4gICAgICAgICAgICBfdGhpcy5pbWFnZS4kaXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgX3RoaXMuaW1hZ2UuJGl0ZW0uc2V0QXR0cmlidXRlKCdzcmMnLCBfdGhpcy5pbWFnZS5zcmMpO1xuICAgICAgICAgICAgaW1hZ2VTdHlsZXMgPSBfdGhpcy5leHRlbmQoe1xuICAgICAgICAgICAgICAgICdtYXgtd2lkdGgnIDogJ25vbmUnXG4gICAgICAgICAgICB9LCBjb250YWluZXJTdHlsZXMsIGltYWdlU3R5bGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVzZSBkaXYgd2l0aCBiYWNrZ3JvdW5kIGltYWdlXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgX3RoaXMuaW1hZ2UuJGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGltYWdlU3R5bGVzID0gX3RoaXMuZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1wb3NpdGlvbicgOiAnNTAlIDUwJScsXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtc2l6ZScgICAgIDogJzEwMCUgYXV0bycsXG4gICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtcmVwZWF0JyAgIDogJ25vLXJlcGVhdCBuby1yZXBlYXQnLFxuICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWltYWdlJyAgICA6ICd1cmwoXCInICsgX3RoaXMuaW1hZ2Uuc3JjICsgJ1wiKSdcbiAgICAgICAgICAgIH0sIGNvbnRhaW5lclN0eWxlcywgaW1hZ2VTdHlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgb25lIG9mIHBhcmVudHMgaGF2ZSB0cmFuc2Zvcm0gc3R5bGUgKHdpdGhvdXQgdGhpcyBjaGVjaywgc2Nyb2xsIHRyYW5zZm9ybSB3aWxsIGJlIGludmVydGVkKVxuICAgICAgICAvLyBkaXNjdXNzaW9uIC0gaHR0cHM6Ly9naXRodWIuY29tL25rLW8vamFyYWxsYXgvaXNzdWVzLzlcbiAgICAgICAgdmFyIHBhcmVudFdpdGhUcmFuc2Zvcm0gPSAwO1xuICAgICAgICB2YXIgJGl0ZW1QYXJlbnRzID0gX3RoaXMuJGl0ZW07XG4gICAgICAgIHdoaWxlICgkaXRlbVBhcmVudHMgIT09IG51bGwgJiYgJGl0ZW1QYXJlbnRzICE9PSBkb2N1bWVudCAmJiBwYXJlbnRXaXRoVHJhbnNmb3JtID09PSAwKSB7XG4gICAgICAgICAgICB2YXIgcGFyZW50X3RyYW5zZm9ybSA9IF90aGlzLmNzcygkaXRlbVBhcmVudHMsICctd2Via2l0LXRyYW5zZm9ybScpIHx8IF90aGlzLmNzcygkaXRlbVBhcmVudHMsICctbW96LXRyYW5zZm9ybScpIHx8IF90aGlzLmNzcygkaXRlbVBhcmVudHMsICd0cmFuc2Zvcm0nKTtcbiAgICAgICAgICAgIGlmKHBhcmVudF90cmFuc2Zvcm0gJiYgcGFyZW50X3RyYW5zZm9ybSAhPT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50V2l0aFRyYW5zZm9ybSA9IDE7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgdHJhbnNmb3JtIG9uIHBhcmFsbGF4IGNvbnRhaW5lciBpZiB0aGVyZSBpcyBwYXJlbnQgd2l0aCB0cmFuc2Zvcm1cbiAgICAgICAgICAgICAgICBfdGhpcy5jc3MoX3RoaXMuaW1hZ2UuJGNvbnRhaW5lciwge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDApIHRyYW5zbGF0ZVkoMCknXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkaXRlbVBhcmVudHMgPSAkaXRlbVBhcmVudHMucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFic29sdXRlIHBvc2l0aW9uIGlmIG9uZSBvZiBwYXJlbnRzIGhhdmUgdHJhbnNmb3JtYXRpb25zIG9yIHBhcmFsbGF4IHdpdGhvdXQgc2Nyb2xsXG4gICAgICAgIGlmIChwYXJlbnRXaXRoVHJhbnNmb3JtIHx8IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ29wYWNpdHknfHwgX3RoaXMub3B0aW9ucy50eXBlID09PSAnc2NhbGUnIHx8IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3NjYWxlLW9wYWNpdHknKSB7XG4gICAgICAgICAgICBfdGhpcy5pbWFnZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhZGQgcG9zaXRpb24gdG8gcGFyYWxsYXggYmxvY2tcbiAgICAgICAgaW1hZ2VTdHlsZXMucG9zaXRpb24gPSBfdGhpcy5pbWFnZS5wb3NpdGlvbjtcblxuICAgICAgICAvLyBwYXJhbGxheCBpbWFnZVxuICAgICAgICBfdGhpcy5jc3MoX3RoaXMuaW1hZ2UuJGl0ZW0sIGltYWdlU3R5bGVzKTtcbiAgICAgICAgX3RoaXMuaW1hZ2UuJGNvbnRhaW5lci5hcHBlbmRDaGlsZChfdGhpcy5pbWFnZS4kaXRlbSk7XG5cbiAgICAgICAgLy8gY292ZXIgaW1hZ2UgaWYgd2lkdGggYW5kIGhlaWdodCBpcyByZWFkeVxuICAgICAgICBmdW5jdGlvbiBpbml0QWZ0ZXJSZWFkeSAoKSB7XG4gICAgICAgICAgICBfdGhpcy5jb3ZlckltYWdlKCk7XG4gICAgICAgICAgICBfdGhpcy5jbGlwQ29udGFpbmVyKCk7XG4gICAgICAgICAgICBfdGhpcy5vblNjcm9sbCh0cnVlKTtcblxuICAgICAgICAgICAgLy8gY2FsbCBvbkluaXQgZXZlbnRcbiAgICAgICAgICAgIGlmKF90aGlzLm9wdGlvbnMub25Jbml0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMub3B0aW9ucy5vbkluaXQuY2FsbChfdGhpcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHRpbWVvdXQgdG8gZml4IElFIGJsaW5raW5nXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZihfdGhpcy4kaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgZGVmYXVsdCB1c2VyIGJhY2tncm91bmRcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuY3NzKF90aGlzLiRpdGVtLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1pbWFnZScgICAgICA6ICdub25lJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWF0dGFjaG1lbnQnIDogJ3Njcm9sbCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1zaXplJyAgICAgICA6ICdhdXRvJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKF90aGlzLmltYWdlLndpZHRoICYmIF90aGlzLmltYWdlLmhlaWdodCkge1xuICAgICAgICAgICAgLy8gaW5pdCBpZiB3aWR0aCBhbmQgaGVpZ2h0IGFscmVhZHkgZXhpc3RzXG4gICAgICAgICAgICBpbml0QWZ0ZXJSZWFkeSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbG9hZCBpbWFnZSBhbmQgZ2V0IHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgICAgICAgIF90aGlzLmdldEltYWdlU2l6ZShfdGhpcy5pbWFnZS5zcmMsIGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuaW1hZ2Uud2lkdGggID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgX3RoaXMuaW1hZ2UuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGluaXRBZnRlclJlYWR5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGphcmFsbGF4TGlzdC5wdXNoKF90aGlzKTtcbiAgICB9O1xuXG4gICAgSmFyYWxsYXgucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgLy8gcmVtb3ZlIGZyb20gaW5zdGFuY2VzIGxpc3RcbiAgICAgICAgZm9yKHZhciBrID0gMCwgbGVuID0gamFyYWxsYXhMaXN0Lmxlbmd0aDsgayA8IGxlbjsgaysrKSB7XG4gICAgICAgICAgICBpZihqYXJhbGxheExpc3Rba10uaW5zdGFuY2VJRCA9PT0gX3RoaXMuaW5zdGFuY2VJRCkge1xuICAgICAgICAgICAgICAgIGphcmFsbGF4TGlzdC5zcGxpY2UoaywgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXR1cm4gc3R5bGVzIG9uIGNvbnRhaW5lciBhcyBiZWZvcmUgamFyYWxsYXggaW5pdFxuICAgICAgICB2YXIgb3JpZ2luYWxTdHlsZXNUYWcgPSBfdGhpcy4kaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtamFyYWxsYXgtb3JpZ2luYWwtc3R5bGVzJyk7XG4gICAgICAgIF90aGlzLiRpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1qYXJhbGxheC1vcmlnaW5hbC1zdHlsZXMnKTtcbiAgICAgICAgLy8gbnVsbCBvY2N1cnMgaWYgdGhlcmUgaXMgbm8gc3R5bGUgdGFnIGJlZm9yZSBqYXJhbGxheCBpbml0XG4gICAgICAgIGlmKG9yaWdpbmFsU3R5bGVzVGFnID09PSAnbnVsbCcpIHtcbiAgICAgICAgICAgIF90aGlzLiRpdGVtLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLiRpdGVtLnNldEF0dHJpYnV0ZSgnc3R5bGUnLCBvcmlnaW5hbFN0eWxlc1RhZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZW1vdmUgYWRkaXRpb25hbCBkb20gZWxlbWVudHNcbiAgICAgICAgaWYoX3RoaXMuJGNsaXBTdHlsZXMpIHtcbiAgICAgICAgICAgIF90aGlzLiRjbGlwU3R5bGVzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoX3RoaXMuJGNsaXBTdHlsZXMpO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLmltYWdlLiRjb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChfdGhpcy5pbWFnZS4kY29udGFpbmVyKTtcblxuICAgICAgICAvLyBjYWxsIG9uRGVzdHJveSBldmVudFxuICAgICAgICBpZihfdGhpcy5vcHRpb25zLm9uRGVzdHJveSkge1xuICAgICAgICAgICAgX3RoaXMub3B0aW9ucy5vbkRlc3Ryb3kuY2FsbChfdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZWxldGUgamFyYWxsYXggZnJvbSBpdGVtXG4gICAgICAgIGRlbGV0ZSBfdGhpcy4kaXRlbS5qYXJhbGxheDtcblxuICAgICAgICAvLyBkZWxldGUgYWxsIHZhcmlhYmxlc1xuICAgICAgICBmb3IodmFyIG4gaW4gX3RoaXMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBfdGhpc1tuXTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBKYXJhbGxheC5wcm90b3R5cGUuZ2V0SW1hZ2VTaXplID0gZnVuY3Rpb24gKHNyYywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYoIXNyYyB8fCAhY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wSW1nID0gbmV3IEltYWdlKCk7XG4gICAgICAgIHRlbXBJbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2sodGVtcEltZy53aWR0aCwgdGVtcEltZy5oZWlnaHQpO1xuICAgICAgICB9O1xuICAgICAgICB0ZW1wSW1nLnNyYyA9IHNyYztcbiAgICB9O1xuXG4gICAgLy8gaXQgd2lsbCByZW1vdmUgc29tZSBpbWFnZSBvdmVybGFwcGluZ1xuICAgIC8vIG92ZXJsYXBwaW5nIG9jY3VyIGR1ZSB0byBhbiBpbWFnZSBwb3NpdGlvbiBmaXhlZCBpbnNpZGUgYWJzb2x1dGUgcG9zaXRpb24gZWxlbWVudCAod2Via2l0IGJhc2VkIGJyb3dzZXJzIHdvcmtzIHdpdGhvdXQgYW55IGZpeClcbiAgICBKYXJhbGxheC5wcm90b3R5cGUuY2xpcENvbnRhaW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gY2xpcCBpcyBub3Qgd29ya2luZyBwcm9wZXJseSBvbiByZWFsIElFOSBhbmQgbGVzc1xuICAgICAgICBpZihpc0lFbHQxMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIF90aGlzICA9IHRoaXMsXG4gICAgICAgICAgICByZWN0ICAgPSBfdGhpcy5pbWFnZS4kY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgd2lkdGggID0gcmVjdC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodCA9IHJlY3QuaGVpZ2h0O1xuXG4gICAgICAgIGlmKCFfdGhpcy4kY2xpcFN0eWxlcykge1xuICAgICAgICAgICAgX3RoaXMuJGNsaXBTdHlsZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuICAgICAgICAgICAgX3RoaXMuJGNsaXBTdHlsZXMuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgICAgICAgICBfdGhpcy4kY2xpcFN0eWxlcy5zZXRBdHRyaWJ1dGUoJ2lkJywgJyNqYXJhbGxheC1jbGlwLScgKyBfdGhpcy5pbnN0YW5jZUlEKTtcbiAgICAgICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChfdGhpcy4kY2xpcFN0eWxlcyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc3R5bGVzID0gW1xuICAgICAgICAgICAgJyNqYXJhbGxheC1jb250YWluZXItJyArIF90aGlzLmluc3RhbmNlSUQgKyAnIHsnLFxuICAgICAgICAgICAgJyAgIGNsaXA6IHJlY3QoMCAnICsgd2lkdGggKyAncHggJyArIGhlaWdodCArICdweCAwKTsnLFxuICAgICAgICAgICAgJyAgIGNsaXA6IHJlY3QoMCwgJyArIHdpZHRoICsgJ3B4LCAnICsgaGVpZ2h0ICsgJ3B4LCAwKTsnLFxuICAgICAgICAgICAgJ30nXG4gICAgICAgIF0uam9pbignXFxuJyk7XG5cbiAgICAgICAgLy8gYWRkIGNsaXAgc3R5bGVzIGlubGluZSAodGhpcyBtZXRob2QgbmVlZCBmb3Igc3VwcG9ydCBJRTggYW5kIGxlc3MgYnJvd3NlcnMpXG4gICAgICAgIGlmIChfdGhpcy4kY2xpcFN0eWxlcy5zdHlsZVNoZWV0KXtcbiAgICAgICAgICAgIF90aGlzLiRjbGlwU3R5bGVzLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHN0eWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLiRjbGlwU3R5bGVzLmlubmVySFRNTCA9IHN0eWxlcztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBKYXJhbGxheC5wcm90b3R5cGUuY292ZXJJbWFnZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICAgICBpZighX3RoaXMuaW1hZ2Uud2lkdGggfHwgIV90aGlzLmltYWdlLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlY3QgICAgICAgPSBfdGhpcy5pbWFnZS4kY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgICAgICAgY29udFcgICAgICA9IHJlY3Qud2lkdGgsXG4gICAgICAgICAgICBjb250SCAgICAgID0gcmVjdC5oZWlnaHQsXG4gICAgICAgICAgICBjb250TCAgICAgID0gcmVjdC5sZWZ0LFxuICAgICAgICAgICAgaW1nVyAgICAgICA9IF90aGlzLmltYWdlLndpZHRoLFxuICAgICAgICAgICAgaW1nSCAgICAgICA9IF90aGlzLmltYWdlLmhlaWdodCxcbiAgICAgICAgICAgIHNwZWVkICAgICAgPSBfdGhpcy5vcHRpb25zLnNwZWVkLFxuICAgICAgICAgICAgaXNTY3JvbGwgICA9IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3Njcm9sbCcgfHwgX3RoaXMub3B0aW9ucy50eXBlID09PSAnc2Nyb2xsLW9wYWNpdHknLFxuICAgICAgICAgICAgc2Nyb2xsRGlzdCA9IDAsXG4gICAgICAgICAgICByZXN1bHRXICAgID0gMCxcbiAgICAgICAgICAgIHJlc3VsdEggICAgPSBjb250SCxcbiAgICAgICAgICAgIHJlc3VsdE1MICAgPSAwLFxuICAgICAgICAgICAgcmVzdWx0TVQgICA9IDA7XG5cbiAgICAgICAgLy8gc2Nyb2xsIHBhcmFsbGF4XG4gICAgICAgIGlmKGlzU2Nyb2xsKSB7XG4gICAgICAgICAgICAvLyBzY3JvbGwgZGlzdGFuY2UgYW5kIGhlaWdodCBmb3IgaW1hZ2VcbiAgICAgICAgICAgIGlmIChzcGVlZCA8IDApIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxEaXN0ID0gc3BlZWQgKiBNYXRoLm1heChjb250SCwgd25kSCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcm9sbERpc3QgPSBzcGVlZCAqIChjb250SCArIHduZEgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzaXplIGZvciBzY3JvbGwgcGFyYWxsYXhcbiAgICAgICAgICAgIGlmIChzcGVlZCA+IDEpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRIID0gTWF0aC5hYnMoc2Nyb2xsRGlzdCAtIHduZEgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcGVlZCA8IDApIHtcbiAgICAgICAgICAgICAgICByZXN1bHRIID0gc2Nyb2xsRGlzdCAvIHNwZWVkICsgTWF0aC5hYnMoc2Nyb2xsRGlzdCk7XG4gICAgICAgICAgICB9ICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRIICs9IE1hdGguYWJzKHduZEggLSBjb250SCkgKiAoMSAtIHNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2Nyb2xsRGlzdCAvPSAyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHdpZHRoIHJlbGF0aXZlIHRvIGhlaWdodCBhbmQgaW1hZ2Ugc2l6ZVxuICAgICAgICByZXN1bHRXID0gcmVzdWx0SCAqIGltZ1cgLyBpbWdIO1xuICAgICAgICBpZihyZXN1bHRXIDwgY29udFcpIHtcbiAgICAgICAgICAgIHJlc3VsdFcgPSBjb250VztcbiAgICAgICAgICAgIHJlc3VsdEggPSByZXN1bHRXICogaW1nSCAvIGltZ1c7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjZW50ZXIgcGFyYWxsYXggaW1hZ2VcbiAgICAgICAgaWYoaXNTY3JvbGwpIHtcbiAgICAgICAgICAgIHJlc3VsdE1MID0gY29udEwgKyAoY29udFcgLSByZXN1bHRXKSAvIDI7XG4gICAgICAgICAgICByZXN1bHRNVCA9ICh3bmRIIC0gcmVzdWx0SCkgLyAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0TUwgPSAoY29udFcgLSByZXN1bHRXKSAvIDI7XG4gICAgICAgICAgICByZXN1bHRNVCA9IChjb250SCAtIHJlc3VsdEgpIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpeCBpZiBwYXJhbGxheCBibG9jayBpbiBhYnNvbHV0ZSBwb3NpdGlvblxuICAgICAgICBpZihfdGhpcy5pbWFnZS5wb3NpdGlvbiA9PT0gJ2Fic29sdXRlJykge1xuICAgICAgICAgICAgcmVzdWx0TUwgLT0gY29udEw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9yZSBzY3JvbGwgZGlzdGFuY2VcbiAgICAgICAgX3RoaXMucGFyYWxsYXhTY3JvbGxEaXN0YW5jZSA9IHNjcm9sbERpc3Q7XG5cbiAgICAgICAgLy8gYXBwbHkgcmVzdWx0IHRvIGl0ZW1cbiAgICAgICAgX3RoaXMuY3NzKF90aGlzLmltYWdlLiRpdGVtLCB7XG4gICAgICAgICAgICB3aWR0aDogcmVzdWx0VyArICdweCcsXG4gICAgICAgICAgICBoZWlnaHQ6IHJlc3VsdEggKyAncHgnLFxuICAgICAgICAgICAgbWFyZ2luTGVmdDogcmVzdWx0TUwgKyAncHgnLFxuICAgICAgICAgICAgbWFyZ2luVG9wOiByZXN1bHRNVCArICdweCdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gY2FsbCBvbkNvdmVySW1hZ2UgZXZlbnRcbiAgICAgICAgaWYoX3RoaXMub3B0aW9ucy5vbkNvdmVySW1hZ2UpIHtcbiAgICAgICAgICAgIF90aGlzLm9wdGlvbnMub25Db3ZlckltYWdlLmNhbGwoX3RoaXMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEphcmFsbGF4LnByb3RvdHlwZS5pc1Zpc2libGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzRWxlbWVudEluVmlld3BvcnQgfHwgZmFsc2U7XG4gICAgfTtcblxuICAgIEphcmFsbGF4LnByb3RvdHlwZS5vblNjcm9sbCA9IGZ1bmN0aW9uIChmb3JjZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmKCFfdGhpcy5pbWFnZS53aWR0aCB8fCAhX3RoaXMuaW1hZ2UuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVjdCAgID0gX3RoaXMuJGl0ZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICAgICAgICBjb250VCAgPSByZWN0LnRvcCxcbiAgICAgICAgICAgIGNvbnRIICA9IHJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgc3R5bGVzID0ge1xuICAgICAgICAgICAgICAgIHZpc2liaWxpdHkgICAgICAgICA6ICd2aXNpYmxlJyxcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb24gOiAnNTAlIDUwJSdcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gY2hlY2sgaWYgaW4gdmlld3BvcnRcbiAgICAgICAgdmFyIHZpZXdwb3J0UmVjdCA9IHJlY3Q7XG4gICAgICAgIGlmKF90aGlzLm9wdGlvbnMuZWxlbWVudEluVmlld3BvcnQpIHtcbiAgICAgICAgICAgIHZpZXdwb3J0UmVjdCA9IF90aGlzLm9wdGlvbnMuZWxlbWVudEluVmlld3BvcnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuaXNFbGVtZW50SW5WaWV3cG9ydCA9XG4gICAgICAgICAgICB2aWV3cG9ydFJlY3QuYm90dG9tID49IDAgJiZcbiAgICAgICAgICAgIHZpZXdwb3J0UmVjdC5yaWdodCA+PSAwICYmXG4gICAgICAgICAgICB2aWV3cG9ydFJlY3QudG9wIDw9IHduZEggJiZcbiAgICAgICAgICAgIHZpZXdwb3J0UmVjdC5sZWZ0IDw9IHduZFc7XG5cbiAgICAgICAgLy8gc3RvcCBjYWxjdWxhdGlvbnMgaWYgaXRlbSBpcyBub3QgaW4gdmlld3BvcnRcbiAgICAgICAgaWYgKGZvcmNlID8gZmFsc2UgOiAhX3RoaXMuaXNFbGVtZW50SW5WaWV3cG9ydCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIHBhcmFsbGF4IGhlbHBpbmcgdmFyaWFibGVzXG4gICAgICAgIHZhciBiZWZvcmVUb3AgPSBNYXRoLm1heCgwLCBjb250VCksXG4gICAgICAgICAgICBiZWZvcmVUb3BFbmQgPSBNYXRoLm1heCgwLCBjb250SCArIGNvbnRUKSxcbiAgICAgICAgICAgIGFmdGVyVG9wID0gTWF0aC5tYXgoMCwgLWNvbnRUKSxcbiAgICAgICAgICAgIGJlZm9yZUJvdHRvbSA9IE1hdGgubWF4KDAsIGNvbnRUICsgY29udEggLSB3bmRIKSxcbiAgICAgICAgICAgIGJlZm9yZUJvdHRvbUVuZCA9IE1hdGgubWF4KDAsIGNvbnRIIC0gKGNvbnRUICsgY29udEggLSB3bmRIKSksXG4gICAgICAgICAgICBhZnRlckJvdHRvbSA9IE1hdGgubWF4KDAsIC1jb250VCArIHduZEggLSBjb250SCksXG4gICAgICAgICAgICBmcm9tVmlld3BvcnRDZW50ZXIgPSAxIC0gMiAqICh3bmRIIC0gY29udFQpIC8gKHduZEggKyBjb250SCk7XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIG9uIGhvdyBwZXJjZW50IG9mIHNlY3Rpb24gaXMgdmlzaWJsZVxuICAgICAgICB2YXIgdmlzaWJsZVBlcmNlbnQgPSAxO1xuICAgICAgICBpZihjb250SCA8IHduZEgpIHtcbiAgICAgICAgICAgIHZpc2libGVQZXJjZW50ID0gMSAtIChhZnRlclRvcCB8fCBiZWZvcmVCb3R0b20pIC8gY29udEg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZihiZWZvcmVUb3BFbmQgPD0gd25kSCkge1xuICAgICAgICAgICAgICAgIHZpc2libGVQZXJjZW50ID0gYmVmb3JlVG9wRW5kIC8gd25kSDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmVmb3JlQm90dG9tRW5kIDw9IHduZEgpIHtcbiAgICAgICAgICAgICAgICB2aXNpYmxlUGVyY2VudCA9IGJlZm9yZUJvdHRvbUVuZCAvIHduZEg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvcGFjaXR5XG4gICAgICAgIGlmKF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ29wYWNpdHknIHx8IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3NjYWxlLW9wYWNpdHknIHx8IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3Njcm9sbC1vcGFjaXR5Jykge1xuICAgICAgICAgICAgc3R5bGVzLnRyYW5zZm9ybSA9ICcnOyAvLyBlbXB0eSB0byBhZGQgdHJhbnNsYXRlWigwKSB3aGVyZSBpdCBpcyBwb3NzaWJsZVxuICAgICAgICAgICAgc3R5bGVzLm9wYWNpdHkgPSB2aXNpYmxlUGVyY2VudDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNjYWxlXG4gICAgICAgIGlmKF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3NjYWxlJyB8fCBfdGhpcy5vcHRpb25zLnR5cGUgPT09ICdzY2FsZS1vcGFjaXR5Jykge1xuICAgICAgICAgICAgdmFyIHNjYWxlID0gMTtcbiAgICAgICAgICAgIGlmKF90aGlzLm9wdGlvbnMuc3BlZWQgPCAwKSB7XG4gICAgICAgICAgICAgICAgc2NhbGUgLT0gX3RoaXMub3B0aW9ucy5zcGVlZCAqIHZpc2libGVQZXJjZW50O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY2FsZSArPSBfdGhpcy5vcHRpb25zLnNwZWVkICogKDEgLSB2aXNpYmxlUGVyY2VudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdHlsZXMudHJhbnNmb3JtID0gJ3NjYWxlKCcgKyBzY2FsZSArICcpJztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNjcm9sbFxuICAgICAgICBpZihfdGhpcy5vcHRpb25zLnR5cGUgPT09ICdzY3JvbGwnIHx8IF90aGlzLm9wdGlvbnMudHlwZSA9PT0gJ3Njcm9sbC1vcGFjaXR5Jykge1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uWSA9IF90aGlzLnBhcmFsbGF4U2Nyb2xsRGlzdGFuY2UgKiBmcm9tVmlld3BvcnRDZW50ZXI7XG5cbiAgICAgICAgICAgIC8vIGZpeCBpZiBwYXJhbGxheCBibG9jayBpbiBhYnNvbHV0ZSBwb3NpdGlvblxuICAgICAgICAgICAgaWYoX3RoaXMuaW1hZ2UucG9zaXRpb24gPT09ICdhYnNvbHV0ZScpIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvblkgLT0gY29udFQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0eWxlcy50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWSgnICsgcG9zaXRpb25ZICsgJ3B4KSc7XG4gICAgICAgIH1cblxuICAgICAgICBfdGhpcy5jc3MoX3RoaXMuaW1hZ2UuJGl0ZW0sIHN0eWxlcyk7XG5cbiAgICAgICAgLy8gY2FsbCBvblNjcm9sbCBldmVudFxuICAgICAgICBpZihfdGhpcy5vcHRpb25zLm9uU2Nyb2xsKSB7XG4gICAgICAgICAgICBfdGhpcy5vcHRpb25zLm9uU2Nyb2xsLmNhbGwoX3RoaXMsIHtcbiAgICAgICAgICAgICAgICBzZWN0aW9uOiByZWN0LFxuXG4gICAgICAgICAgICAgICAgYmVmb3JlVG9wOiBiZWZvcmVUb3AsXG4gICAgICAgICAgICAgICAgYmVmb3JlVG9wRW5kOiBiZWZvcmVUb3BFbmQsXG4gICAgICAgICAgICAgICAgYWZ0ZXJUb3A6IGFmdGVyVG9wLFxuICAgICAgICAgICAgICAgIGJlZm9yZUJvdHRvbTogYmVmb3JlQm90dG9tLFxuICAgICAgICAgICAgICAgIGJlZm9yZUJvdHRvbUVuZDogYmVmb3JlQm90dG9tRW5kLFxuICAgICAgICAgICAgICAgIGFmdGVyQm90dG9tOiBhZnRlckJvdHRvbSxcblxuICAgICAgICAgICAgICAgIHZpc2libGVQZXJjZW50OiB2aXNpYmxlUGVyY2VudCxcbiAgICAgICAgICAgICAgICBmcm9tVmlld3BvcnRDZW50ZXI6IGZyb21WaWV3cG9ydENlbnRlclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvLyBpbml0IGV2ZW50c1xuICAgIGZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXIgKGVsLCBldmVudE5hbWUsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGVsLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGZ1bmN0aW9uICgpe1xuICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbChlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSAoZSkge1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKGUudHlwZSAhPT0gJ3Njcm9sbCcpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVXbmRWYXJzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IodmFyIGsgPSAwLCBsZW4gPSBqYXJhbGxheExpc3QubGVuZ3RoOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICAgICAgICAvLyBjb3ZlciBpbWFnZSBhbmQgY2xpcCBuZWVkZWQgb25seSB3aGVuIHBhcmFsbGF4IGNvbnRhaW5lciB3YXMgY2hhbmdlZFxuICAgICAgICAgICAgICAgIGlmKGUudHlwZSAhPT0gJ3Njcm9sbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgamFyYWxsYXhMaXN0W2tdLmNvdmVySW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgamFyYWxsYXhMaXN0W2tdLmNsaXBDb250YWluZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgamFyYWxsYXhMaXN0W2tdLm9uU2Nyb2xsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBhZGRFdmVudExpc3RlbmVyKHdpbmRvdywgJ3Njcm9sbCcsIHVwZGF0ZSk7XG4gICAgYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdyZXNpemUnLCB1cGRhdGUpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnb3JpZW50YXRpb25jaGFuZ2UnLCB1cGRhdGUpO1xuICAgIGFkZEV2ZW50TGlzdGVuZXIod2luZG93LCAnbG9hZCcsIHVwZGF0ZSk7XG5cblxuICAgIC8vIGdsb2JhbCBkZWZpbml0aW9uXG4gICAgdmFyIHBsdWdpbiA9IGZ1bmN0aW9uIChpdGVtcykge1xuICAgICAgICAvLyBjaGVjayBmb3IgZG9tIGVsZW1lbnRcbiAgICAgICAgLy8gdGhhbmtzOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM4NDI4Ni9qYXZhc2NyaXB0LWlzZG9tLWhvdy1kby15b3UtY2hlY2staWYtYS1qYXZhc2NyaXB0LW9iamVjdC1pcy1hLWRvbS1vYmplY3RcbiAgICAgICAgaWYodHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gaXRlbXMgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCA6IGl0ZW1zICYmIHR5cGVvZiBpdGVtcyA9PT0gXCJvYmplY3RcIiAmJiBpdGVtcyAhPT0gbnVsbCAmJiBpdGVtcy5ub2RlVHlwZSA9PT0gMSAmJiB0eXBlb2YgaXRlbXMubm9kZU5hbWU9PT1cInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpdGVtcyA9IFtpdGVtc107XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgICAgICAgbGVuID0gaXRlbXMubGVuZ3RoLFxuICAgICAgICAgICAgayA9IDAsXG4gICAgICAgICAgICByZXQ7XG5cbiAgICAgICAgZm9yIChrOyBrIDwgbGVuOyBrKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG9wdGlvbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYoIWl0ZW1zW2tdLmphcmFsbGF4KSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1zW2tdLmphcmFsbGF4ID0gbmV3IEphcmFsbGF4KGl0ZW1zW2tdLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmKGl0ZW1zW2tdLmphcmFsbGF4KSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gaXRlbXNba10uamFyYWxsYXhbb3B0aW9uc10uYXBwbHkoaXRlbXNba10uamFyYWxsYXgsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtcztcbiAgICB9O1xuICAgIHBsdWdpbi5jb25zdHJ1Y3RvciA9IEphcmFsbGF4O1xuXG4gICAgLy8gbm8gY29uZmxpY3RcbiAgICB2YXIgb2xkUGx1Z2luID0gd2luZG93LmphcmFsbGF4O1xuICAgIHdpbmRvdy5qYXJhbGxheCA9IHBsdWdpbjtcbiAgICB3aW5kb3cuamFyYWxsYXgubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LmphcmFsbGF4ID0gb2xkUGx1Z2luO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLy8galF1ZXJ5IHN1cHBvcnRcbiAgICBpZih0eXBlb2YgalF1ZXJ5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgalF1ZXJ5UGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMgfHwgW107XG4gICAgICAgICAgICBBcnJheS5wcm90b3R5cGUudW5zaGlmdC5jYWxsKGFyZ3MsIHRoaXMpO1xuICAgICAgICAgICAgdmFyIHJlcyA9IHBsdWdpbi5hcHBseSh3aW5kb3csIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXMgIT09ICdvYmplY3QnID8gcmVzIDogdGhpcztcbiAgICAgICAgfTtcbiAgICAgICAgalF1ZXJ5UGx1Z2luLmNvbnN0cnVjdG9yID0gSmFyYWxsYXg7XG5cbiAgICAgICAgLy8gbm8gY29uZmxpY3RcbiAgICAgICAgdmFyIG9sZEpxUGx1Z2luID0galF1ZXJ5LmZuLmphcmFsbGF4O1xuICAgICAgICBqUXVlcnkuZm4uamFyYWxsYXggPSBqUXVlcnlQbHVnaW47XG4gICAgICAgIGpRdWVyeS5mbi5qYXJhbGxheC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgalF1ZXJ5LmZuLmphcmFsbGF4ID0gb2xkSnFQbHVnaW47XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBkYXRhLWphcmFsbGF4IGluaXRpYWxpemF0aW9uXG4gICAgYWRkRXZlbnRMaXN0ZW5lcih3aW5kb3csICdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBwbHVnaW4oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtamFyYWxsYXhdLCBbZGF0YS1qYXJhbGxheC12aWRlb10nKSk7XG4gICAgfSk7XG59KHdpbmRvdykpOyJdLCJmaWxlIjoiamFyYWxsYXguanMifQ==
