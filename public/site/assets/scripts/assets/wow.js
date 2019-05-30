(function() {
    var MutationObserver, Util, WeakMap, getComputedStyle, getComputedStyleRX,
        __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    Util = (function() {
        function Util() {}

        Util.prototype.extend = function(custom, defaults) {
            var key, value;
            for (key in defaults) {
                value = defaults[key];
                if (custom[key] == null) {
                    custom[key] = value;
                }
            }
            return custom;
        };

        Util.prototype.isMobile = function(agent) {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(agent);
        };

        Util.prototype.addEvent = function(elem, event, fn) {
            if (elem.addEventListener != null) {
                return elem.addEventListener(event, fn, false);
            } else if (elem.attachEvent != null) {
                return elem.attachEvent("on" + event, fn);
            } else {
                return elem[event] = fn;
            }
        };

        Util.prototype.removeEvent = function(elem, event, fn) {
            if (elem.removeEventListener != null) {
                return elem.removeEventListener(event, fn, false);
            } else if (elem.detachEvent != null) {
                return elem.detachEvent("on" + event, fn);
            } else {
                return delete elem[event];
            }
        };

        Util.prototype.innerHeight = function() {
            if ('innerHeight' in window) {
                return window.innerHeight;
            } else {
                return document.documentElement.clientHeight;
            }
        };

        return Util;

    })();

    WeakMap = this.WeakMap || this.MozWeakMap || (WeakMap = (function() {
            function WeakMap() {
                this.keys = [];
                this.values = [];
            }

            WeakMap.prototype.get = function(key) {
                var i, item, _i, _len, _ref;
                _ref = this.keys;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    item = _ref[i];
                    if (item === key) {
                        return this.values[i];
                    }
                }
            };

            WeakMap.prototype.set = function(key, value) {
                var i, item, _i, _len, _ref;
                _ref = this.keys;
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    item = _ref[i];
                    if (item === key) {
                        this.values[i] = value;
                        return;
                    }
                }
                this.keys.push(key);
                return this.values.push(value);
            };

            return WeakMap;

        })());

    MutationObserver = this.MutationObserver || this.WebkitMutationObserver || this.MozMutationObserver || (MutationObserver = (function() {
            function MutationObserver() {
                if (typeof console !== "undefined" && console !== null) {
                    console.warn('MutationObserver is not supported by your browser.');
                }
                if (typeof console !== "undefined" && console !== null) {
                    console.warn('WOW.js cannot detect dom mutations, please call .sync() after loading new content.');
                }
            }

            MutationObserver.notSupported = true;

            MutationObserver.prototype.observe = function() {};

            return MutationObserver;

        })());

    getComputedStyle = this.getComputedStyle || function(el, pseudo) {
            this.getPropertyValue = function(prop) {
                var _ref;
                if (prop === 'float') {
                    prop = 'styleFloat';
                }
                if (getComputedStyleRX.test(prop)) {
                    prop.replace(getComputedStyleRX, function(_, _char) {
                        return _char.toUpperCase();
                    });
                }
                return ((_ref = el.currentStyle) != null ? _ref[prop] : void 0) || null;
            };
            return this;
        };

    getComputedStyleRX = /(\-([a-z]){1})/g;

    this.WOW = (function() {
        WOW.prototype.defaults = {
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: true,
            live: true,
            callback: null
        };

        function WOW(options) {
            if (options == null) {
                options = {};
            }
            this.scrollCallback = __bind(this.scrollCallback, this);
            this.scrollHandler = __bind(this.scrollHandler, this);
            this.start = __bind(this.start, this);
            this.scrolled = true;
            this.config = this.util().extend(options, this.defaults);
            this.animationNameCache = new WeakMap();
        }

        WOW.prototype.init = function() {
            var _ref;
            this.element = window.document.documentElement;
            if ((_ref = document.readyState) === "interactive" || _ref === "complete") {
                this.start();
            } else {
                this.util().addEvent(document, 'DOMContentLoaded', this.start);
            }
            return this.finished = [];
        };

        WOW.prototype.start = function() {
            var box, _i, _len, _ref;
            this.stopped = false;
            this.boxes = (function() {
                var _i, _len, _ref, _results;
                _ref = this.element.querySelectorAll("." + this.config.boxClass);
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    box = _ref[_i];
                    _results.push(box);
                }
                return _results;
            }).call(this);
            this.all = (function() {
                var _i, _len, _ref, _results;
                _ref = this.boxes;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    box = _ref[_i];
                    _results.push(box);
                }
                return _results;
            }).call(this);
            if (this.boxes.length) {
                if (this.disabled()) {
                    this.resetStyle();
                } else {
                    _ref = this.boxes;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        box = _ref[_i];
                        this.applyStyle(box, true);
                    }
                }
            }
            if (!this.disabled()) {
                this.util().addEvent(window, 'scroll', this.scrollHandler);
                this.util().addEvent(window, 'resize', this.scrollHandler);
                this.interval = setInterval(this.scrollCallback, 50);
            }
            if (this.config.live) {
                return new MutationObserver((function(_this) {
                    return function(records) {
                        var node, record, _j, _len1, _results;
                        _results = [];
                        for (_j = 0, _len1 = records.length; _j < _len1; _j++) {
                            record = records[_j];
                            _results.push((function() {
                                var _k, _len2, _ref1, _results1;
                                _ref1 = record.addedNodes || [];
                                _results1 = [];
                                for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                                    node = _ref1[_k];
                                    _results1.push(this.doSync(node));
                                }
                                return _results1;
                            }).call(_this));
                        }
                        return _results;
                    };
                })(this)).observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        };

        WOW.prototype.stop = function() {
            this.stopped = true;
            this.util().removeEvent(window, 'scroll', this.scrollHandler);
            this.util().removeEvent(window, 'resize', this.scrollHandler);
            if (this.interval != null) {
                return clearInterval(this.interval);
            }
        };

        WOW.prototype.sync = function(element) {
            if (MutationObserver.notSupported) {
                return this.doSync(this.element);
            }
        };

        WOW.prototype.doSync = function(element) {
            var box, _i, _len, _ref, _results;
            if (element == null) {
                element = this.element;
            }
            if (element.nodeType !== 1) {
                return;
            }
            element = element.parentNode || element;
            _ref = element.querySelectorAll("." + this.config.boxClass);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                box = _ref[_i];
                if (__indexOf.call(this.all, box) < 0) {
                    this.boxes.push(box);
                    this.all.push(box);
                    if (this.stopped || this.disabled()) {
                        this.resetStyle();
                    } else {
                        this.applyStyle(box, true);
                    }
                    _results.push(this.scrolled = true);
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };

        WOW.prototype.show = function(box) {
            this.applyStyle(box);
            box.className = "" + box.className + " " + this.config.animateClass;
            if (this.config.callback != null) {
                return this.config.callback(box);
            }
        };

        WOW.prototype.applyStyle = function(box, hidden) {
            var delay, duration, iteration;
            duration = box.getAttribute('data-wow-duration');
            delay = box.getAttribute('data-wow-delay');
            iteration = box.getAttribute('data-wow-iteration');
            return this.animate((function(_this) {
                return function() {
                    return _this.customStyle(box, hidden, duration, delay, iteration);
                };
            })(this));
        };

        WOW.prototype.animate = (function() {
            if ('requestAnimationFrame' in window) {
                return function(callback) {
                    return window.requestAnimationFrame(callback);
                };
            } else {
                return function(callback) {
                    return callback();
                };
            }
        })();

        WOW.prototype.resetStyle = function() {
            var box, _i, _len, _ref, _results;
            _ref = this.boxes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                box = _ref[_i];
                _results.push(box.style.visibility = 'visible');
            }
            return _results;
        };

        WOW.prototype.customStyle = function(box, hidden, duration, delay, iteration) {
            if (hidden) {
                this.cacheAnimationName(box);
            }
            box.style.visibility = hidden ? 'hidden' : 'visible';
            if (duration) {
                this.vendorSet(box.style, {
                    animationDuration: duration
                });
            }
            if (delay) {
                this.vendorSet(box.style, {
                    animationDelay: delay
                });
            }
            if (iteration) {
                this.vendorSet(box.style, {
                    animationIterationCount: iteration
                });
            }
            this.vendorSet(box.style, {
                animationName: hidden ? 'none' : this.cachedAnimationName(box)
            });
            return box;
        };

        WOW.prototype.vendors = ["moz", "webkit"];

        WOW.prototype.vendorSet = function(elem, properties) {
            var name, value, vendor, _results;
            _results = [];
            for (name in properties) {
                value = properties[name];
                elem["" + name] = value;
                _results.push((function() {
                    var _i, _len, _ref, _results1;
                    _ref = this.vendors;
                    _results1 = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        vendor = _ref[_i];
                        _results1.push(elem["" + vendor + (name.charAt(0).toUpperCase()) + (name.substr(1))] = value);
                    }
                    return _results1;
                }).call(this));
            }
            return _results;
        };

        WOW.prototype.vendorCSS = function(elem, property) {
            var result, style, vendor, _i, _len, _ref;
            style = getComputedStyle(elem);
            result = style.getPropertyCSSValue(property);
            _ref = this.vendors;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                vendor = _ref[_i];
                result = result || style.getPropertyCSSValue("-" + vendor + "-" + property);
            }
            return result;
        };

        WOW.prototype.animationName = function(box) {
            var animationName;
            try {
                animationName = this.vendorCSS(box, 'animation-name').cssText;
            } catch (_error) {
                animationName = getComputedStyle(box).getPropertyValue('animation-name');
            }
            if (animationName === 'none') {
                return '';
            } else {
                return animationName;
            }
        };

        WOW.prototype.cacheAnimationName = function(box) {
            return this.animationNameCache.set(box, this.animationName(box));
        };

        WOW.prototype.cachedAnimationName = function(box) {
            return this.animationNameCache.get(box);
        };

        WOW.prototype.scrollHandler = function() {
            return this.scrolled = true;
        };

        WOW.prototype.scrollCallback = function() {
            var box;
            if (this.scrolled) {
                this.scrolled = false;
                this.boxes = (function() {
                    var _i, _len, _ref, _results;
                    _ref = this.boxes;
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        box = _ref[_i];
                        if (!(box)) {
                            continue;
                        }
                        if (this.isVisible(box)) {
                            this.show(box);
                            continue;
                        }
                        _results.push(box);
                    }
                    return _results;
                }).call(this);
                if (!(this.boxes.length || this.config.live)) {
                    return this.stop();
                }
            }
        };

        WOW.prototype.offsetTop = function(element) {
            var top;
            while (element.offsetTop === void 0) {
                element = element.parentNode;
            }
            top = element.offsetTop;
            while (element = element.offsetParent) {
                top += element.offsetTop;
            }
            return top;
        };

        WOW.prototype.isVisible = function(box) {
            var bottom, offset, top, viewBottom, viewTop;
            offset = box.getAttribute('data-wow-offset') || this.config.offset;
            viewTop = window.pageYOffset;
            viewBottom = viewTop + Math.min(this.element.clientHeight, this.util().innerHeight()) - offset;
            top = this.offsetTop(box);
            bottom = top + box.clientHeight;
            return top <= viewBottom && bottom >= viewTop;
        };

        WOW.prototype.util = function() {
            return this._util != null ? this._util : this._util = new Util();
        };

        WOW.prototype.disabled = function() {
            return !this.config.mobile && this.util().isMobile(navigator.userAgent);
        };

        return WOW;

    })();

}).call(this);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ3b3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuICAgIHZhciBNdXRhdGlvbk9ic2VydmVyLCBVdGlsLCBXZWFrTWFwLCBnZXRDb21wdXRlZFN0eWxlLCBnZXRDb21wdXRlZFN0eWxlUlgsXG4gICAgICAgIF9fYmluZCA9IGZ1bmN0aW9uKGZuLCBtZSl7IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gZm4uYXBwbHkobWUsIGFyZ3VtZW50cyk7IH07IH0sXG4gICAgICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gICAgVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgZnVuY3Rpb24gVXRpbCgpIHt9XG5cbiAgICAgICAgVXRpbC5wcm90b3R5cGUuZXh0ZW5kID0gZnVuY3Rpb24oY3VzdG9tLCBkZWZhdWx0cykge1xuICAgICAgICAgICAgdmFyIGtleSwgdmFsdWU7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBkZWZhdWx0cykge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gZGVmYXVsdHNba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoY3VzdG9tW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21ba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdXN0b207XG4gICAgICAgIH07XG5cbiAgICAgICAgVXRpbC5wcm90b3R5cGUuaXNNb2JpbGUgPSBmdW5jdGlvbihhZ2VudCkge1xuICAgICAgICAgICAgcmV0dXJuIC9BbmRyb2lkfHdlYk9TfGlQaG9uZXxpUGFkfGlQb2R8QmxhY2tCZXJyeXxJRU1vYmlsZXxPcGVyYSBNaW5pL2kudGVzdChhZ2VudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgVXRpbC5wcm90b3R5cGUuYWRkRXZlbnQgPSBmdW5jdGlvbihlbGVtLCBldmVudCwgZm4pIHtcbiAgICAgICAgICAgIGlmIChlbGVtLmFkZEV2ZW50TGlzdGVuZXIgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZuLCBmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW0uYXR0YWNoRXZlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtLmF0dGFjaEV2ZW50KFwib25cIiArIGV2ZW50LCBmbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtW2V2ZW50XSA9IGZuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFV0aWwucHJvdG90eXBlLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24oZWxlbSwgZXZlbnQsIGZuKSB7XG4gICAgICAgICAgICBpZiAoZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBmbiwgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbGVtLmRldGFjaEV2ZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5kZXRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgZm4pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVsZXRlIGVsZW1bZXZlbnRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFV0aWwucHJvdG90eXBlLmlubmVySGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoJ2lubmVySGVpZ2h0JyBpbiB3aW5kb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gVXRpbDtcblxuICAgIH0pKCk7XG5cbiAgICBXZWFrTWFwID0gdGhpcy5XZWFrTWFwIHx8IHRoaXMuTW96V2Vha01hcCB8fCAoV2Vha01hcCA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIFdlYWtNYXAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgV2Vha01hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIGksIGl0ZW0sIF9pLCBfbGVuLCBfcmVmO1xuICAgICAgICAgICAgICAgIF9yZWYgPSB0aGlzLmtleXM7XG4gICAgICAgICAgICAgICAgZm9yIChpID0gX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9IF9yZWZbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtID09PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIFdlYWtNYXAucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSwgaXRlbSwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICAgICAgICAgICAgX3JlZiA9IHRoaXMua2V5cztcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBpID0gKytfaSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtID0gX3JlZltpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0gPT09IGtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiBXZWFrTWFwO1xuXG4gICAgICAgIH0pKCkpO1xuXG4gICAgTXV0YXRpb25PYnNlcnZlciA9IHRoaXMuTXV0YXRpb25PYnNlcnZlciB8fCB0aGlzLldlYmtpdE11dGF0aW9uT2JzZXJ2ZXIgfHwgdGhpcy5Nb3pNdXRhdGlvbk9ic2VydmVyIHx8IChNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29uc29sZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ011dGF0aW9uT2JzZXJ2ZXIgaXMgbm90IHN1cHBvcnRlZCBieSB5b3VyIGJyb3dzZXIuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjb25zb2xlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignV09XLmpzIGNhbm5vdCBkZXRlY3QgZG9tIG11dGF0aW9ucywgcGxlYXNlIGNhbGwgLnN5bmMoKSBhZnRlciBsb2FkaW5nIG5ldyBjb250ZW50LicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTXV0YXRpb25PYnNlcnZlci5ub3RTdXBwb3J0ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBNdXRhdGlvbk9ic2VydmVyLnByb3RvdHlwZS5vYnNlcnZlID0gZnVuY3Rpb24oKSB7fTtcblxuICAgICAgICAgICAgcmV0dXJuIE11dGF0aW9uT2JzZXJ2ZXI7XG5cbiAgICAgICAgfSkoKSk7XG5cbiAgICBnZXRDb21wdXRlZFN0eWxlID0gdGhpcy5nZXRDb21wdXRlZFN0eWxlIHx8IGZ1bmN0aW9uKGVsLCBwc2V1ZG8pIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UHJvcGVydHlWYWx1ZSA9IGZ1bmN0aW9uKHByb3ApIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2Zsb2F0Jykge1xuICAgICAgICAgICAgICAgICAgICBwcm9wID0gJ3N0eWxlRmxvYXQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZ2V0Q29tcHV0ZWRTdHlsZVJYLnRlc3QocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcC5yZXBsYWNlKGdldENvbXB1dGVkU3R5bGVSWCwgZnVuY3Rpb24oXywgX2NoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY2hhci50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICgoX3JlZiA9IGVsLmN1cnJlbnRTdHlsZSkgIT0gbnVsbCA/IF9yZWZbcHJvcF0gOiB2b2lkIDApIHx8IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICBnZXRDb21wdXRlZFN0eWxlUlggPSAvKFxcLShbYS16XSl7MX0pL2c7XG5cbiAgICB0aGlzLldPVyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgV09XLnByb3RvdHlwZS5kZWZhdWx0cyA9IHtcbiAgICAgICAgICAgIGJveENsYXNzOiAnd293JyxcbiAgICAgICAgICAgIGFuaW1hdGVDbGFzczogJ2FuaW1hdGVkJyxcbiAgICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICAgIG1vYmlsZTogdHJ1ZSxcbiAgICAgICAgICAgIGxpdmU6IHRydWUsXG4gICAgICAgICAgICBjYWxsYmFjazogbnVsbFxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIFdPVyhvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zY3JvbGxDYWxsYmFjayA9IF9fYmluZCh0aGlzLnNjcm9sbENhbGxiYWNrLCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9IF9fYmluZCh0aGlzLnNjcm9sbEhhbmRsZXIsIHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5zdGFydCA9IF9fYmluZCh0aGlzLnN0YXJ0LCB0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLnV0aWwoKS5leHRlbmQob3B0aW9ucywgdGhpcy5kZWZhdWx0cyk7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbk5hbWVDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBXT1cucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gd2luZG93LmRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgICAgIGlmICgoX3JlZiA9IGRvY3VtZW50LnJlYWR5U3RhdGUpID09PSBcImludGVyYWN0aXZlXCIgfHwgX3JlZiA9PT0gXCJjb21wbGV0ZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudChkb2N1bWVudCwgJ0RPTUNvbnRlbnRMb2FkZWQnLCB0aGlzLnN0YXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmlzaGVkID0gW107XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGJveCwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYm94ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgICAgICAgICAgICBfcmVmID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIgKyB0aGlzLmNvbmZpZy5ib3hDbGFzcyk7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYm94ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goYm94KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYWxsID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgICAgX3JlZiA9IHRoaXMuYm94ZXM7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYm94ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goYm94KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmJveGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3JlZiA9IHRoaXMuYm94ZXM7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gX3JlZi5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm94ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U3R5bGUoYm94LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51dGlsKCkuYWRkRXZlbnQod2luZG93LCAnc2Nyb2xsJywgdGhpcy5zY3JvbGxIYW5kbGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnV0aWwoKS5hZGRFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLnNjcm9sbEhhbmRsZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCh0aGlzLnNjcm9sbENhbGxiYWNrLCA1MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcubGl2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTXV0YXRpb25PYnNlcnZlcigoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlLCByZWNvcmQsIF9qLCBfbGVuMSwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gcmVjb3Jkcy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWNvcmQgPSByZWNvcmRzW19qXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9rLCBfbGVuMiwgX3JlZjEsIF9yZXN1bHRzMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3JlZjEgPSByZWNvcmQuYWRkZWROb2RlcyB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3Jlc3VsdHMxID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoX2sgPSAwLCBfbGVuMiA9IF9yZWYxLmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZSA9IF9yZWYxW19rXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzMS5wdXNoKHRoaXMuZG9TeW5jKG5vZGUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHMxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhbGwoX3RoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSh0aGlzKSkub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMudXRpbCgpLnJlbW92ZUV2ZW50KHdpbmRvdywgJ3Njcm9sbCcsIHRoaXMuc2Nyb2xsSGFuZGxlcik7XG4gICAgICAgICAgICB0aGlzLnV0aWwoKS5yZW1vdmVFdmVudCh3aW5kb3csICdyZXNpemUnLCB0aGlzLnNjcm9sbEhhbmRsZXIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuaW50ZXJ2YWwgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUuc3luYyA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChNdXRhdGlvbk9ic2VydmVyLm5vdFN1cHBvcnRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRvU3luYyh0aGlzLmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUuZG9TeW5jID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIGJveCwgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZWxlbWVudC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudE5vZGUgfHwgZWxlbWVudDtcbiAgICAgICAgICAgIF9yZWYgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuXCIgKyB0aGlzLmNvbmZpZy5ib3hDbGFzcyk7XG4gICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgYm94ID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgaWYgKF9faW5kZXhPZi5jYWxsKHRoaXMuYWxsLCBib3gpIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJveGVzLnB1c2goYm94KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGwucHVzaChib3gpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkIHx8IHRoaXMuZGlzYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFN0eWxlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5U3R5bGUoYm94LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHRoaXMuc2Nyb2xsZWQgPSB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9O1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uKGJveCkge1xuICAgICAgICAgICAgdGhpcy5hcHBseVN0eWxlKGJveCk7XG4gICAgICAgICAgICBib3guY2xhc3NOYW1lID0gXCJcIiArIGJveC5jbGFzc05hbWUgKyBcIiBcIiArIHRoaXMuY29uZmlnLmFuaW1hdGVDbGFzcztcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5jYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmNhbGxiYWNrKGJveCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5hcHBseVN0eWxlID0gZnVuY3Rpb24oYm94LCBoaWRkZW4pIHtcbiAgICAgICAgICAgIHZhciBkZWxheSwgZHVyYXRpb24sIGl0ZXJhdGlvbjtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gYm94LmdldEF0dHJpYnV0ZSgnZGF0YS13b3ctZHVyYXRpb24nKTtcbiAgICAgICAgICAgIGRlbGF5ID0gYm94LmdldEF0dHJpYnV0ZSgnZGF0YS13b3ctZGVsYXknKTtcbiAgICAgICAgICAgIGl0ZXJhdGlvbiA9IGJveC5nZXRBdHRyaWJ1dGUoJ2RhdGEtd293LWl0ZXJhdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYW5pbWF0ZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpcy5jdXN0b21TdHlsZShib3gsIGhpZGRlbiwgZHVyYXRpb24sIGRlbGF5LCBpdGVyYXRpb24pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5hbmltYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIGluIHdpbmRvdykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5yZXNldFN0eWxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYm94LCBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICBfcmVmID0gdGhpcy5ib3hlcztcbiAgICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICBib3ggPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGJveC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfTtcblxuICAgICAgICBXT1cucHJvdG90eXBlLmN1c3RvbVN0eWxlID0gZnVuY3Rpb24oYm94LCBoaWRkZW4sIGR1cmF0aW9uLCBkZWxheSwgaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICBpZiAoaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZUFuaW1hdGlvbk5hbWUoYm94KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJveC5zdHlsZS52aXNpYmlsaXR5ID0gaGlkZGVuID8gJ2hpZGRlbicgOiAndmlzaWJsZSc7XG4gICAgICAgICAgICBpZiAoZHVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlbmRvclNldChib3guc3R5bGUsIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRHVyYXRpb246IGR1cmF0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGVsYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlbmRvclNldChib3guc3R5bGUsIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRGVsYXk6IGRlbGF5XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXRlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52ZW5kb3JTZXQoYm94LnN0eWxlLCB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50OiBpdGVyYXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmVuZG9yU2V0KGJveC5zdHlsZSwge1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbk5hbWU6IGhpZGRlbiA/ICdub25lJyA6IHRoaXMuY2FjaGVkQW5pbWF0aW9uTmFtZShib3gpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBib3g7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS52ZW5kb3JzID0gW1wibW96XCIsIFwid2Via2l0XCJdO1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUudmVuZG9yU2V0ID0gZnVuY3Rpb24oZWxlbSwgcHJvcGVydGllcykge1xuICAgICAgICAgICAgdmFyIG5hbWUsIHZhbHVlLCB2ZW5kb3IsIF9yZXN1bHRzO1xuICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAobmFtZSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSBwcm9wZXJ0aWVzW25hbWVdO1xuICAgICAgICAgICAgICAgIGVsZW1bXCJcIiArIG5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCgoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHMxO1xuICAgICAgICAgICAgICAgICAgICBfcmVmID0gdGhpcy52ZW5kb3JzO1xuICAgICAgICAgICAgICAgICAgICBfcmVzdWx0czEgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZW5kb3IgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzMS5wdXNoKGVsZW1bXCJcIiArIHZlbmRvciArIChuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpKSArIChuYW1lLnN1YnN0cigxKSldID0gdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0czE7XG4gICAgICAgICAgICAgICAgfSkuY2FsbCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS52ZW5kb3JDU1MgPSBmdW5jdGlvbihlbGVtLCBwcm9wZXJ0eSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCwgc3R5bGUsIHZlbmRvciwgX2ksIF9sZW4sIF9yZWY7XG4gICAgICAgICAgICBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbSk7XG4gICAgICAgICAgICByZXN1bHQgPSBzdHlsZS5nZXRQcm9wZXJ0eUNTU1ZhbHVlKHByb3BlcnR5KTtcbiAgICAgICAgICAgIF9yZWYgPSB0aGlzLnZlbmRvcnM7XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2ZW5kb3IgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgfHwgc3R5bGUuZ2V0UHJvcGVydHlDU1NWYWx1ZShcIi1cIiArIHZlbmRvciArIFwiLVwiICsgcHJvcGVydHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcblxuICAgICAgICBXT1cucHJvdG90eXBlLmFuaW1hdGlvbk5hbWUgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25OYW1lO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25OYW1lID0gdGhpcy52ZW5kb3JDU1MoYm94LCAnYW5pbWF0aW9uLW5hbWUnKS5jc3NUZXh0O1xuICAgICAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uTmFtZSA9IGdldENvbXB1dGVkU3R5bGUoYm94KS5nZXRQcm9wZXJ0eVZhbHVlKCdhbmltYXRpb24tbmFtZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFuaW1hdGlvbk5hbWUgPT09ICdub25lJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuaW1hdGlvbk5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5jYWNoZUFuaW1hdGlvbk5hbWUgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFuaW1hdGlvbk5hbWVDYWNoZS5zZXQoYm94LCB0aGlzLmFuaW1hdGlvbk5hbWUoYm94KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5jYWNoZWRBbmltYXRpb25OYW1lID0gZnVuY3Rpb24oYm94KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hbmltYXRpb25OYW1lQ2FjaGUuZ2V0KGJveCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5zY3JvbGxIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zY3JvbGxlZCA9IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5zY3JvbGxDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGJveDtcbiAgICAgICAgICAgIGlmICh0aGlzLnNjcm9sbGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuYm94ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHM7XG4gICAgICAgICAgICAgICAgICAgIF9yZWYgPSB0aGlzLmJveGVzO1xuICAgICAgICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoYm94KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNWaXNpYmxlKGJveCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3coYm94KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goYm94KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgICAgICAgfSkuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgICAgICBpZiAoISh0aGlzLmJveGVzLmxlbmd0aCB8fCB0aGlzLmNvbmZpZy5saXZlKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFdPVy5wcm90b3R5cGUub2Zmc2V0VG9wID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHRvcDtcbiAgICAgICAgICAgIHdoaWxlIChlbGVtZW50Lm9mZnNldFRvcCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRvcCA9IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnQgPSBlbGVtZW50Lm9mZnNldFBhcmVudCkge1xuICAgICAgICAgICAgICAgIHRvcCArPSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0b3A7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5pc1Zpc2libGUgPSBmdW5jdGlvbihib3gpIHtcbiAgICAgICAgICAgIHZhciBib3R0b20sIG9mZnNldCwgdG9wLCB2aWV3Qm90dG9tLCB2aWV3VG9wO1xuICAgICAgICAgICAgb2Zmc2V0ID0gYm94LmdldEF0dHJpYnV0ZSgnZGF0YS13b3ctb2Zmc2V0JykgfHwgdGhpcy5jb25maWcub2Zmc2V0O1xuICAgICAgICAgICAgdmlld1RvcCA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgICAgICAgICAgIHZpZXdCb3R0b20gPSB2aWV3VG9wICsgTWF0aC5taW4odGhpcy5lbGVtZW50LmNsaWVudEhlaWdodCwgdGhpcy51dGlsKCkuaW5uZXJIZWlnaHQoKSkgLSBvZmZzZXQ7XG4gICAgICAgICAgICB0b3AgPSB0aGlzLm9mZnNldFRvcChib3gpO1xuICAgICAgICAgICAgYm90dG9tID0gdG9wICsgYm94LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiB0b3AgPD0gdmlld0JvdHRvbSAmJiBib3R0b20gPj0gdmlld1RvcDtcbiAgICAgICAgfTtcblxuICAgICAgICBXT1cucHJvdG90eXBlLnV0aWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl91dGlsICE9IG51bGwgPyB0aGlzLl91dGlsIDogdGhpcy5fdXRpbCA9IG5ldyBVdGlsKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgV09XLnByb3RvdHlwZS5kaXNhYmxlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0aGlzLmNvbmZpZy5tb2JpbGUgJiYgdGhpcy51dGlsKCkuaXNNb2JpbGUobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIFdPVztcblxuICAgIH0pKCk7XG5cbn0pLmNhbGwodGhpcyk7XG4iXSwiZmlsZSI6Indvdy5qcyJ9
