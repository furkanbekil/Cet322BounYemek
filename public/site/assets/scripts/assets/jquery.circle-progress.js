/**
 * jquery-circle-progress - jQuery Plugin to draw animated circular progress bars:
 * {@link http://kottenator.github.io/jquery-circle-progress/}
 *
 * @author Rostyslav Bryzgunov <kottenator@gmail.com>
 * @version 1.2.2
 * @licence MIT
 * @preserve
 */
// UMD factory - https://github.com/umdjs/umd/blob/d31bb6ee7098715e019f52bdfe27b3e4bfd2b97e/templates/jqueryPlugin.js
// Uses AMD, CommonJS or browser globals to create a jQuery plugin.
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD - register as an anonymous module
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        var $ = require('jquery');
        factory($);
        module.exports = $;
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function($) {
    /**
     * Inner implementation of the circle progress bar.
     * The class is not exposed _yet_ but you can create an instance through jQuery method call.
     *
     * @param {object} config - You can customize any class member (property or method).
     * @class
     * @alias CircleProgress
     */
    function CircleProgress(config) {
        this.init(config);
    }

    CircleProgress.prototype = {
        //--------------------------------------- public options ---------------------------------------
        /**
         * This is the only required option. It should be from `0.0` to `1.0`.
         * @type {number}
         * @default 0.0
         */
        value: 0.0,

        /**
         * Size of the canvas in pixels.
         * It's a square so we need only one dimension.
         * @type {number}
         * @default 100.0
         */
        size: 100.0,

        /**
         * Initial angle for `0.0` value in radians.
         * @type {number}
         * @default -Math.PI
         */
        startAngle: -Math.PI,

        /**
         * Width of the arc in pixels.
         * If it's `'auto'` - the value is calculated as `[this.size]{@link CircleProgress#size} / 14`.
         * @type {number|string}
         * @default 'auto'
         */
        thickness: 'auto',

        /**
         * Fill of the arc. You may set it to:
         *
         *   - solid color:
         *     - `'#3aeabb'`
         *     - `{ color: '#3aeabb' }`
         *     - `{ color: 'rgba(255, 255, 255, .3)' }`
         *   - linear gradient _(left to right)_:
         *     - `{ gradient: ['#3aeabb', '#fdd250'], gradientAngle: Math.PI / 4 }`
         *     - `{ gradient: ['red', 'green', 'blue'], gradientDirection: [x0, y0, x1, y1] }`
         *     - `{ gradient: [["red", .2], ["green", .3], ["blue", .8]] }`
         *   - image:
         *     - `{ image: 'http://i.imgur.com/pT0i89v.png' }`
         *     - `{ image: imageObject }`
         *     - `{ color: 'lime', image: 'http://i.imgur.com/pT0i89v.png' }` -
         *       color displayed until the image is loaded
         *
         * @default {gradient: ['#3aeabb', '#fdd250']}
         */
        fill: {
            gradient: ['#3aeabb', '#fdd250']
        },

        /**
         * Color of the "empty" arc. Only a color fill supported by now.
         * @type {string}
         * @default 'rgba(0, 0, 0, .1)'
         */
        emptyFill: 'rgba(0, 0, 0, .1)',

        /**
         * jQuery Animation config.
         * You can pass `false` to disable the animation.
         * @see http://api.jquery.com/animate/
         * @type {object|boolean}
         * @default {duration: 1200, easing: 'circleProgressEasing'}
         */
        animation: {
            duration: 1200,
            easing: 'circleProgressEasing'
        },

        /**
         * Default animation starts at `0.0` and ends at specified `value`. Let's call this _direct animation_.
         * If you want to make _reversed animation_ - set `animationStartValue: 1.0`.
         * Also you may specify any other value from `0.0` to `1.0`.
         * @type {number}
         * @default 0.0
         */
        animationStartValue: 0.0,

        /**
         * Reverse animation and arc draw.
         * By default, the arc is filled from `0.0` to `value`, _clockwise_.
         * With `reverse: true` the arc is filled from `1.0` to `value`, _counter-clockwise_.
         * @type {boolean}
         * @default false
         */
        reverse: false,

        /**
         * Arc line cap: `'butt'`, `'round'` or `'square'` -
         * [read more]{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.lineCap}.
         * @type {string}
         * @default 'butt'
         */
        lineCap: 'butt',

        /**
         * Canvas insertion mode: append or prepend it into the parent element?
         * @type {string}
         * @default 'prepend'
         */
        insertMode: 'prepend',

        //------------------------------ protected properties and methods ------------------------------
        /**
         * Link to {@link CircleProgress} constructor.
         * @protected
         */
        constructor: CircleProgress,

        /**
         * Container element. Should be passed into constructor config.
         * @protected
         * @type {jQuery}
         */
        el: null,

        /**
         * Canvas element. Automatically generated and prepended to [this.el]{@link CircleProgress#el}.
         * @protected
         * @type {HTMLCanvasElement}
         */
        canvas: null,

        /**
         * 2D-context of [this.canvas]{@link CircleProgress#canvas}.
         * @protected
         * @type {CanvasRenderingContext2D}
         */
        ctx: null,

        /**
         * Radius of the outer circle. Automatically calculated as `[this.size]{@link CircleProgress#size} / 2`.
         * @protected
         * @type {number}
         */
        radius: 0.0,

        /**
         * Fill of the main arc. Automatically calculated, depending on [this.fill]{@link CircleProgress#fill} option.
         * @protected
         * @type {string|CanvasGradient|CanvasPattern}
         */
        arcFill: null,

        /**
         * Last rendered frame value.
         * @protected
         * @type {number}
         */
        lastFrameValue: 0.0,

        /**
         * Init/re-init the widget.
         *
         * Throws a jQuery event:
         *
         * - `circle-inited(jqEvent)`
         *
         * @param {object} config - You can customize any class member (property or method).
         */
        init: function(config) {
            $.extend(this, config);
            this.radius = this.size / 2;
            this.initWidget();
            this.initFill();
            this.draw();
            this.el.trigger('circle-inited');
        },

        /**
         * Initialize `<canvas>`.
         * @protected
         */
        initWidget: function() {
            if (!this.canvas)
                this.canvas = $('<canvas>')[this.insertMode == 'prepend' ? 'prependTo' : 'appendTo'](this.el)[0];

            var canvas = this.canvas;
            canvas.width = this.size;
            canvas.height = this.size;
            this.ctx = canvas.getContext('2d');

            if (window.devicePixelRatio > 1) {
                var scaleBy = window.devicePixelRatio;
                canvas.style.width = canvas.style.height = this.size + 'px';
                canvas.width = canvas.height = this.size * scaleBy;
                this.ctx.scale(scaleBy, scaleBy);
            }
        },

        /**
         * This method sets [this.arcFill]{@link CircleProgress#arcFill}.
         * It could do this async (on image load).
         * @protected
         */
        initFill: function() {
            var self = this,
                fill = this.fill,
                ctx = this.ctx,
                size = this.size;

            if (!fill)
                throw Error("The fill is not specified!");

            if (typeof fill == 'string')
                fill = {color: fill};

            if (fill.color)
                this.arcFill = fill.color;

            if (fill.gradient) {
                var gr = fill.gradient;

                if (gr.length == 1) {
                    this.arcFill = gr[0];
                } else if (gr.length > 1) {
                    var ga = fill.gradientAngle || 0, // gradient direction angle; 0 by default
                        gd = fill.gradientDirection || [
                                size / 2 * (1 - Math.cos(ga)), // x0
                                size / 2 * (1 + Math.sin(ga)), // y0
                                size / 2 * (1 + Math.cos(ga)), // x1
                                size / 2 * (1 - Math.sin(ga))  // y1
                            ];

                    var lg = ctx.createLinearGradient.apply(ctx, gd);

                    for (var i = 0; i < gr.length; i++) {
                        var color = gr[i],
                            pos = i / (gr.length - 1);

                        if ($.isArray(color)) {
                            pos = color[1];
                            color = color[0];
                        }

                        lg.addColorStop(pos, color);
                    }

                    this.arcFill = lg;
                }
            }

            if (fill.image) {
                var img;

                if (fill.image instanceof Image) {
                    img = fill.image;
                } else {
                    img = new Image();
                    img.src = fill.image;
                }

                if (img.complete)
                    setImageFill();
                else
                    img.onload = setImageFill;
            }

            function setImageFill() {
                var bg = $('<canvas>')[0];
                bg.width = self.size;
                bg.height = self.size;
                bg.getContext('2d').drawImage(img, 0, 0, size, size);
                self.arcFill = self.ctx.createPattern(bg, 'no-repeat');
                self.drawFrame(self.lastFrameValue);
            }
        },

        /**
         * Draw the circle.
         * @protected
         */
        draw: function() {
            if (this.animation)
                this.drawAnimated(this.value);
            else
                this.drawFrame(this.value);
        },

        /**
         * Draw a single animation frame.
         * @protected
         * @param {number} v - Frame value.
         */
        drawFrame: function(v) {
            this.lastFrameValue = v;
            this.ctx.clearRect(0, 0, this.size, this.size);
            this.drawEmptyArc(v);
            this.drawArc(v);
        },

        /**
         * Draw the arc (part of the circle).
         * @protected
         * @param {number} v - Frame value.
         */
        drawArc: function(v) {
            if (v === 0)
                return;

            var ctx = this.ctx,
                r = this.radius,
                t = this.getThickness(),
                a = this.startAngle;

            ctx.save();
            ctx.beginPath();

            if (!this.reverse) {
                ctx.arc(r, r, r - t / 2, a, a + Math.PI * 2 * v);
            } else {
                ctx.arc(r, r, r - t / 2, a - Math.PI * 2 * v, a);
            }

            ctx.lineWidth = t;
            ctx.lineCap = this.lineCap;
            ctx.strokeStyle = this.arcFill;
            ctx.stroke();
            ctx.restore();
        },

        /**
         * Draw the _empty (background)_ arc (part of the circle).
         * @protected
         * @param {number} v - Frame value.
         */
        drawEmptyArc: function(v) {
            var ctx = this.ctx,
                r = this.radius,
                t = this.getThickness(),
                a = this.startAngle;

            if (v < 1) {
                ctx.save();
                ctx.beginPath();

                if (v <= 0) {
                    ctx.arc(r, r, r - t / 2, 0, Math.PI * 2);
                } else {
                    if (!this.reverse) {
                        ctx.arc(r, r, r - t / 2, a + Math.PI * 2 * v, a);
                    } else {
                        ctx.arc(r, r, r - t / 2, a, a - Math.PI * 2 * v);
                    }
                }

                ctx.lineWidth = t;
                ctx.strokeStyle = this.emptyFill;
                ctx.stroke();
                ctx.restore();
            }
        },

        /**
         * Animate the progress bar.
         *
         * Throws 3 jQuery events:
         *
         * - `circle-animation-start(jqEvent)`
         * - `circle-animation-progress(jqEvent, animationProgress, stepValue)` - multiple event
         *   animationProgress: from `0.0` to `1.0`; stepValue: from `0.0` to `value`
         * - `circle-animation-end(jqEvent)`
         *
         * @protected
         * @param {number} v - Final value.
         */
        drawAnimated: function(v) {
            var self = this,
                el = this.el,
                canvas = $(this.canvas);

            // stop previous animation before new "start" event is triggered
            canvas.stop(true, false);
            el.trigger('circle-animation-start');

            canvas
                .css({animationProgress: 0})
                .animate({animationProgress: 1}, $.extend({}, this.animation, {
                    step: function(animationProgress) {
                        var stepValue = self.animationStartValue * (1 - animationProgress) + v * animationProgress;
                        self.drawFrame(stepValue);
                        el.trigger('circle-animation-progress', [animationProgress, stepValue]);
                    }
                }))
                .promise()
                .always(function() {
                    // trigger on both successful & failure animation end
                    el.trigger('circle-animation-end');
                });
        },

        /**
         * Get the circle thickness.
         * @see CircleProgress#thickness
         * @protected
         * @returns {number}
         */
        getThickness: function() {
            return $.isNumeric(this.thickness) ? this.thickness : this.size / 14;
        },

        /**
         * Get current value.
         * @protected
         * @return {number}
         */
        getValue: function() {
            return this.value;
        },

        /**
         * Set current value (with smooth animation transition).
         * @protected
         * @param {number} newValue
         */
        setValue: function(newValue) {
            if (this.animation)
                this.animationStartValue = this.lastFrameValue;
            this.value = newValue;
            this.draw();
        }
    };

    //----------------------------------- Initiating jQuery plugin -----------------------------------
    $.circleProgress = {
        // Default options (you may override them)
        defaults: CircleProgress.prototype
    };

    // ease-in-out-cubic
    $.easing.circleProgressEasing = function(x) {
        if (x < 0.5) {
            x = 2 * x;
            return 0.5 * x * x * x;
        } else {
            x = 2 - 2 * x;
            return 1 - 0.5 * x * x * x;
        }
    };

    /**
     * Creates an instance of {@link CircleProgress}.
     * Produces [init event]{@link CircleProgress#init} and [animation events]{@link CircleProgress#drawAnimated}.
     *
     * @param {object} [configOrCommand] - Config object or command name.
     *
     * Config example (you can specify any {@link CircleProgress} property):
     *
     * ```js
     * { value: 0.75, size: 50, animation: false }
     * ```
     *
     * Commands:
     *
     * ```js
     * el.circleProgress('widget'); // get the <canvas>
     * el.circleProgress('value'); // get the value
     * el.circleProgress('value', newValue); // update the value
     * el.circleProgress('redraw'); // redraw the circle
     * el.circleProgress(); // the same as 'redraw'
     * ```
     *
     * @param {string} [commandArgument] - Some commands (like `'value'`) may require an argument.
     * @see CircleProgress
     * @alias "$(...).circleProgress"
     */
    $.fn.circleProgress = function(configOrCommand, commandArgument) {
        var dataName = 'circle-progress',
            firstInstance = this.data(dataName);

        if (configOrCommand == 'widget') {
            if (!firstInstance)
                throw Error('Calling "widget" method on not initialized instance is forbidden');
            return firstInstance.canvas;
        }

        if (configOrCommand == 'value') {
            if (!firstInstance)
                throw Error('Calling "value" method on not initialized instance is forbidden');
            if (typeof commandArgument == 'undefined') {
                return firstInstance.getValue();
            } else {
                var newValue = arguments[1];
                return this.each(function() {
                    $(this).data(dataName).setValue(newValue);
                });
            }
        }

        return this.each(function() {
            var el = $(this),
                instance = el.data(dataName),
                config = $.isPlainObject(configOrCommand) ? configOrCommand : {};

            if (instance) {
                instance.init(config);
            } else {
                var initialConfig = $.extend({}, el.data());
                if (typeof initialConfig.fill == 'string')
                    initialConfig.fill = JSON.parse(initialConfig.fill);
                if (typeof initialConfig.animation == 'string')
                    initialConfig.animation = JSON.parse(initialConfig.animation);
                config = $.extend(initialConfig, config);
                config.el = el;
                instance = new CircleProgress(config);
                el.data(dataName, instance);
            }
        });
    };
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuY2lyY2xlLXByb2dyZXNzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICoganF1ZXJ5LWNpcmNsZS1wcm9ncmVzcyAtIGpRdWVyeSBQbHVnaW4gdG8gZHJhdyBhbmltYXRlZCBjaXJjdWxhciBwcm9ncmVzcyBiYXJzOlxuICoge0BsaW5rIGh0dHA6Ly9rb3R0ZW5hdG9yLmdpdGh1Yi5pby9qcXVlcnktY2lyY2xlLXByb2dyZXNzL31cbiAqXG4gKiBAYXV0aG9yIFJvc3R5c2xhdiBCcnl6Z3Vub3YgPGtvdHRlbmF0b3JAZ21haWwuY29tPlxuICogQHZlcnNpb24gMS4yLjJcbiAqIEBsaWNlbmNlIE1JVFxuICogQHByZXNlcnZlXG4gKi9cbi8vIFVNRCBmYWN0b3J5IC0gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL2QzMWJiNmVlNzA5ODcxNWUwMTlmNTJiZGZlMjdiM2U0YmZkMmI5N2UvdGVtcGxhdGVzL2pxdWVyeVBsdWdpbi5qc1xuLy8gVXNlcyBBTUQsIENvbW1vbkpTIG9yIGJyb3dzZXIgZ2xvYmFscyB0byBjcmVhdGUgYSBqUXVlcnkgcGx1Z2luLlxuKGZ1bmN0aW9uKGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRCAtIHJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGVcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgLy8gTm9kZS9Db21tb25KU1xuICAgICAgICB2YXIgJCA9IHJlcXVpcmUoJ2pxdWVyeScpO1xuICAgICAgICBmYWN0b3J5KCQpO1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9ICQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgLyoqXG4gICAgICogSW5uZXIgaW1wbGVtZW50YXRpb24gb2YgdGhlIGNpcmNsZSBwcm9ncmVzcyBiYXIuXG4gICAgICogVGhlIGNsYXNzIGlzIG5vdCBleHBvc2VkIF95ZXRfIGJ1dCB5b3UgY2FuIGNyZWF0ZSBhbiBpbnN0YW5jZSB0aHJvdWdoIGpRdWVyeSBtZXRob2QgY2FsbC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSBZb3UgY2FuIGN1c3RvbWl6ZSBhbnkgY2xhc3MgbWVtYmVyIChwcm9wZXJ0eSBvciBtZXRob2QpLlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBhbGlhcyBDaXJjbGVQcm9ncmVzc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIENpcmNsZVByb2dyZXNzKGNvbmZpZykge1xuICAgICAgICB0aGlzLmluaXQoY29uZmlnKTtcbiAgICB9XG5cbiAgICBDaXJjbGVQcm9ncmVzcy5wcm90b3R5cGUgPSB7XG4gICAgICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHB1YmxpYyBvcHRpb25zIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvKipcbiAgICAgICAgICogVGhpcyBpcyB0aGUgb25seSByZXF1aXJlZCBvcHRpb24uIEl0IHNob3VsZCBiZSBmcm9tIGAwLjBgIHRvIGAxLjBgLlxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAgICAgKiBAZGVmYXVsdCAwLjBcbiAgICAgICAgICovXG4gICAgICAgIHZhbHVlOiAwLjAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNpemUgb2YgdGhlIGNhbnZhcyBpbiBwaXhlbHMuXG4gICAgICAgICAqIEl0J3MgYSBzcXVhcmUgc28gd2UgbmVlZCBvbmx5IG9uZSBkaW1lbnNpb24uXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDEwMC4wXG4gICAgICAgICAqL1xuICAgICAgICBzaXplOiAxMDAuMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbCBhbmdsZSBmb3IgYDAuMGAgdmFsdWUgaW4gcmFkaWFucy5cbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQGRlZmF1bHQgLU1hdGguUElcbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0QW5nbGU6IC1NYXRoLlBJLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBXaWR0aCBvZiB0aGUgYXJjIGluIHBpeGVscy5cbiAgICAgICAgICogSWYgaXQncyBgJ2F1dG8nYCAtIHRoZSB2YWx1ZSBpcyBjYWxjdWxhdGVkIGFzIGBbdGhpcy5zaXplXXtAbGluayBDaXJjbGVQcm9ncmVzcyNzaXplfSAvIDE0YC5cbiAgICAgICAgICogQHR5cGUge251bWJlcnxzdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdhdXRvJ1xuICAgICAgICAgKi9cbiAgICAgICAgdGhpY2tuZXNzOiAnYXV0bycsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEZpbGwgb2YgdGhlIGFyYy4gWW91IG1heSBzZXQgaXQgdG86XG4gICAgICAgICAqXG4gICAgICAgICAqICAgLSBzb2xpZCBjb2xvcjpcbiAgICAgICAgICogICAgIC0gYCcjM2FlYWJiJ2BcbiAgICAgICAgICogICAgIC0gYHsgY29sb3I6ICcjM2FlYWJiJyB9YFxuICAgICAgICAgKiAgICAgLSBgeyBjb2xvcjogJ3JnYmEoMjU1LCAyNTUsIDI1NSwgLjMpJyB9YFxuICAgICAgICAgKiAgIC0gbGluZWFyIGdyYWRpZW50IF8obGVmdCB0byByaWdodClfOlxuICAgICAgICAgKiAgICAgLSBgeyBncmFkaWVudDogWycjM2FlYWJiJywgJyNmZGQyNTAnXSwgZ3JhZGllbnRBbmdsZTogTWF0aC5QSSAvIDQgfWBcbiAgICAgICAgICogICAgIC0gYHsgZ3JhZGllbnQ6IFsncmVkJywgJ2dyZWVuJywgJ2JsdWUnXSwgZ3JhZGllbnREaXJlY3Rpb246IFt4MCwgeTAsIHgxLCB5MV0gfWBcbiAgICAgICAgICogICAgIC0gYHsgZ3JhZGllbnQ6IFtbXCJyZWRcIiwgLjJdLCBbXCJncmVlblwiLCAuM10sIFtcImJsdWVcIiwgLjhdXSB9YFxuICAgICAgICAgKiAgIC0gaW1hZ2U6XG4gICAgICAgICAqICAgICAtIGB7IGltYWdlOiAnaHR0cDovL2kuaW1ndXIuY29tL3BUMGk4OXYucG5nJyB9YFxuICAgICAgICAgKiAgICAgLSBgeyBpbWFnZTogaW1hZ2VPYmplY3QgfWBcbiAgICAgICAgICogICAgIC0gYHsgY29sb3I6ICdsaW1lJywgaW1hZ2U6ICdodHRwOi8vaS5pbWd1ci5jb20vcFQwaTg5di5wbmcnIH1gIC1cbiAgICAgICAgICogICAgICAgY29sb3IgZGlzcGxheWVkIHVudGlsIHRoZSBpbWFnZSBpcyBsb2FkZWRcbiAgICAgICAgICpcbiAgICAgICAgICogQGRlZmF1bHQge2dyYWRpZW50OiBbJyMzYWVhYmInLCAnI2ZkZDI1MCddfVxuICAgICAgICAgKi9cbiAgICAgICAgZmlsbDoge1xuICAgICAgICAgICAgZ3JhZGllbnQ6IFsnIzNhZWFiYicsICcjZmRkMjUwJ11cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ29sb3Igb2YgdGhlIFwiZW1wdHlcIiBhcmMuIE9ubHkgYSBjb2xvciBmaWxsIHN1cHBvcnRlZCBieSBub3cuXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdyZ2JhKDAsIDAsIDAsIC4xKSdcbiAgICAgICAgICovXG4gICAgICAgIGVtcHR5RmlsbDogJ3JnYmEoMCwgMCwgMCwgLjEpJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogalF1ZXJ5IEFuaW1hdGlvbiBjb25maWcuXG4gICAgICAgICAqIFlvdSBjYW4gcGFzcyBgZmFsc2VgIHRvIGRpc2FibGUgdGhlIGFuaW1hdGlvbi5cbiAgICAgICAgICogQHNlZSBodHRwOi8vYXBpLmpxdWVyeS5jb20vYW5pbWF0ZS9cbiAgICAgICAgICogQHR5cGUge29iamVjdHxib29sZWFufVxuICAgICAgICAgKiBAZGVmYXVsdCB7ZHVyYXRpb246IDEyMDAsIGVhc2luZzogJ2NpcmNsZVByb2dyZXNzRWFzaW5nJ31cbiAgICAgICAgICovXG4gICAgICAgIGFuaW1hdGlvbjoge1xuICAgICAgICAgICAgZHVyYXRpb246IDEyMDAsXG4gICAgICAgICAgICBlYXNpbmc6ICdjaXJjbGVQcm9ncmVzc0Vhc2luZydcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCBhbmltYXRpb24gc3RhcnRzIGF0IGAwLjBgIGFuZCBlbmRzIGF0IHNwZWNpZmllZCBgdmFsdWVgLiBMZXQncyBjYWxsIHRoaXMgX2RpcmVjdCBhbmltYXRpb25fLlxuICAgICAgICAgKiBJZiB5b3Ugd2FudCB0byBtYWtlIF9yZXZlcnNlZCBhbmltYXRpb25fIC0gc2V0IGBhbmltYXRpb25TdGFydFZhbHVlOiAxLjBgLlxuICAgICAgICAgKiBBbHNvIHlvdSBtYXkgc3BlY2lmeSBhbnkgb3RoZXIgdmFsdWUgZnJvbSBgMC4wYCB0byBgMS4wYC5cbiAgICAgICAgICogQHR5cGUge251bWJlcn1cbiAgICAgICAgICogQGRlZmF1bHQgMC4wXG4gICAgICAgICAqL1xuICAgICAgICBhbmltYXRpb25TdGFydFZhbHVlOiAwLjAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJldmVyc2UgYW5pbWF0aW9uIGFuZCBhcmMgZHJhdy5cbiAgICAgICAgICogQnkgZGVmYXVsdCwgdGhlIGFyYyBpcyBmaWxsZWQgZnJvbSBgMC4wYCB0byBgdmFsdWVgLCBfY2xvY2t3aXNlXy5cbiAgICAgICAgICogV2l0aCBgcmV2ZXJzZTogdHJ1ZWAgdGhlIGFyYyBpcyBmaWxsZWQgZnJvbSBgMS4wYCB0byBgdmFsdWVgLCBfY291bnRlci1jbG9ja3dpc2VfLlxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICogQGRlZmF1bHQgZmFsc2VcbiAgICAgICAgICovXG4gICAgICAgIHJldmVyc2U6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmMgbGluZSBjYXA6IGAnYnV0dCdgLCBgJ3JvdW5kJ2Agb3IgYCdzcXVhcmUnYCAtXG4gICAgICAgICAqIFtyZWFkIG1vcmVde0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQubGluZUNhcH0uXG4gICAgICAgICAqIEB0eXBlIHtzdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdidXR0J1xuICAgICAgICAgKi9cbiAgICAgICAgbGluZUNhcDogJ2J1dHQnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYW52YXMgaW5zZXJ0aW9uIG1vZGU6IGFwcGVuZCBvciBwcmVwZW5kIGl0IGludG8gdGhlIHBhcmVudCBlbGVtZW50P1xuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAncHJlcGVuZCdcbiAgICAgICAgICovXG4gICAgICAgIGluc2VydE1vZGU6ICdwcmVwZW5kJyxcblxuICAgICAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90ZWN0ZWQgcHJvcGVydGllcyBhbmQgbWV0aG9kcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIExpbmsgdG8ge0BsaW5rIENpcmNsZVByb2dyZXNzfSBjb25zdHJ1Y3Rvci5cbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3RydWN0b3I6IENpcmNsZVByb2dyZXNzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb250YWluZXIgZWxlbWVudC4gU2hvdWxkIGJlIHBhc3NlZCBpbnRvIGNvbnN0cnVjdG9yIGNvbmZpZy5cbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAdHlwZSB7alF1ZXJ5fVxuICAgICAgICAgKi9cbiAgICAgICAgZWw6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIENhbnZhcyBlbGVtZW50LiBBdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBhbmQgcHJlcGVuZGVkIHRvIFt0aGlzLmVsXXtAbGluayBDaXJjbGVQcm9ncmVzcyNlbH0uXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHR5cGUge0hUTUxDYW52YXNFbGVtZW50fVxuICAgICAgICAgKi9cbiAgICAgICAgY2FudmFzOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiAyRC1jb250ZXh0IG9mIFt0aGlzLmNhbnZhc117QGxpbmsgQ2lyY2xlUHJvZ3Jlc3MjY2FudmFzfS5cbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAdHlwZSB7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJEfVxuICAgICAgICAgKi9cbiAgICAgICAgY3R4OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSYWRpdXMgb2YgdGhlIG91dGVyIGNpcmNsZS4gQXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGFzIGBbdGhpcy5zaXplXXtAbGluayBDaXJjbGVQcm9ncmVzcyNzaXplfSAvIDJgLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICByYWRpdXM6IDAuMCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlsbCBvZiB0aGUgbWFpbiBhcmMuIEF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCwgZGVwZW5kaW5nIG9uIFt0aGlzLmZpbGxde0BsaW5rIENpcmNsZVByb2dyZXNzI2ZpbGx9IG9wdGlvbi5cbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKiBAdHlwZSB7c3RyaW5nfENhbnZhc0dyYWRpZW50fENhbnZhc1BhdHRlcm59XG4gICAgICAgICAqL1xuICAgICAgICBhcmNGaWxsOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMYXN0IHJlbmRlcmVkIGZyYW1lIHZhbHVlLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqL1xuICAgICAgICBsYXN0RnJhbWVWYWx1ZTogMC4wLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJbml0L3JlLWluaXQgdGhlIHdpZGdldC5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhyb3dzIGEgalF1ZXJ5IGV2ZW50OlxuICAgICAgICAgKlxuICAgICAgICAgKiAtIGBjaXJjbGUtaW5pdGVkKGpxRXZlbnQpYFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gWW91IGNhbiBjdXN0b21pemUgYW55IGNsYXNzIG1lbWJlciAocHJvcGVydHkgb3IgbWV0aG9kKS5cbiAgICAgICAgICovXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgICAgICAgICAgJC5leHRlbmQodGhpcywgY29uZmlnKTtcbiAgICAgICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy5zaXplIC8gMjtcbiAgICAgICAgICAgIHRoaXMuaW5pdFdpZGdldCgpO1xuICAgICAgICAgICAgdGhpcy5pbml0RmlsbCgpO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgICAgICB0aGlzLmVsLnRyaWdnZXIoJ2NpcmNsZS1pbml0ZWQnKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogSW5pdGlhbGl6ZSBgPGNhbnZhcz5gLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqL1xuICAgICAgICBpbml0V2lkZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW52YXMpXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMgPSAkKCc8Y2FudmFzPicpW3RoaXMuaW5zZXJ0TW9kZSA9PSAncHJlcGVuZCcgPyAncHJlcGVuZFRvJyA6ICdhcHBlbmRUbyddKHRoaXMuZWwpWzBdO1xuXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gdGhpcy5jYW52YXM7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB0aGlzLnNpemU7XG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5zaXplO1xuICAgICAgICAgICAgdGhpcy5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgaWYgKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID4gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzY2FsZUJ5ID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gY2FudmFzLnN0eWxlLmhlaWdodCA9IHRoaXMuc2l6ZSArICdweCc7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzLmhlaWdodCA9IHRoaXMuc2l6ZSAqIHNjYWxlQnk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdHguc2NhbGUoc2NhbGVCeSwgc2NhbGVCeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoaXMgbWV0aG9kIHNldHMgW3RoaXMuYXJjRmlsbF17QGxpbmsgQ2lyY2xlUHJvZ3Jlc3MjYXJjRmlsbH0uXG4gICAgICAgICAqIEl0IGNvdWxkIGRvIHRoaXMgYXN5bmMgKG9uIGltYWdlIGxvYWQpLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqL1xuICAgICAgICBpbml0RmlsbDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZmlsbCA9IHRoaXMuZmlsbCxcbiAgICAgICAgICAgICAgICBjdHggPSB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICBzaXplID0gdGhpcy5zaXplO1xuXG4gICAgICAgICAgICBpZiAoIWZpbGwpXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJUaGUgZmlsbCBpcyBub3Qgc3BlY2lmaWVkIVwiKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWxsID09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIGZpbGwgPSB7Y29sb3I6IGZpbGx9O1xuXG4gICAgICAgICAgICBpZiAoZmlsbC5jb2xvcilcbiAgICAgICAgICAgICAgICB0aGlzLmFyY0ZpbGwgPSBmaWxsLmNvbG9yO1xuXG4gICAgICAgICAgICBpZiAoZmlsbC5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBnciA9IGZpbGwuZ3JhZGllbnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoZ3IubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcmNGaWxsID0gZ3JbMF07XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnci5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnYSA9IGZpbGwuZ3JhZGllbnRBbmdsZSB8fCAwLCAvLyBncmFkaWVudCBkaXJlY3Rpb24gYW5nbGU7IDAgYnkgZGVmYXVsdFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2QgPSBmaWxsLmdyYWRpZW50RGlyZWN0aW9uIHx8IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSAvIDIgKiAoMSAtIE1hdGguY29zKGdhKSksIC8vIHgwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemUgLyAyICogKDEgKyBNYXRoLnNpbihnYSkpLCAvLyB5MFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplIC8gMiAqICgxICsgTWF0aC5jb3MoZ2EpKSwgLy8geDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZSAvIDIgKiAoMSAtIE1hdGguc2luKGdhKSkgIC8vIHkxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgbGcgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQuYXBwbHkoY3R4LCBnZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gZ3JbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zID0gaSAvIChnci5sZW5ndGggLSAxKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCQuaXNBcnJheShjb2xvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3MgPSBjb2xvclsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9IGNvbG9yWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBsZy5hZGRDb2xvclN0b3AocG9zLCBjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFyY0ZpbGwgPSBsZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmaWxsLmltYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltZztcblxuICAgICAgICAgICAgICAgIGlmIChmaWxsLmltYWdlIGluc3RhbmNlb2YgSW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW1nID0gZmlsbC5pbWFnZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgaW1nLnNyYyA9IGZpbGwuaW1hZ2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGltZy5jb21wbGV0ZSlcbiAgICAgICAgICAgICAgICAgICAgc2V0SW1hZ2VGaWxsKCk7XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gc2V0SW1hZ2VGaWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzZXRJbWFnZUZpbGwoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJnID0gJCgnPGNhbnZhcz4nKVswXTtcbiAgICAgICAgICAgICAgICBiZy53aWR0aCA9IHNlbGYuc2l6ZTtcbiAgICAgICAgICAgICAgICBiZy5oZWlnaHQgPSBzZWxmLnNpemU7XG4gICAgICAgICAgICAgICAgYmcuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UoaW1nLCAwLCAwLCBzaXplLCBzaXplKTtcbiAgICAgICAgICAgICAgICBzZWxmLmFyY0ZpbGwgPSBzZWxmLmN0eC5jcmVhdGVQYXR0ZXJuKGJnLCAnbm8tcmVwZWF0Jyk7XG4gICAgICAgICAgICAgICAgc2VsZi5kcmF3RnJhbWUoc2VsZi5sYXN0RnJhbWVWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERyYXcgdGhlIGNpcmNsZS5cbiAgICAgICAgICogQHByb3RlY3RlZFxuICAgICAgICAgKi9cbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb24pXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3QW5pbWF0ZWQodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUodGhpcy52YWx1ZSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERyYXcgYSBzaW5nbGUgYW5pbWF0aW9uIGZyYW1lLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gRnJhbWUgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBkcmF3RnJhbWU6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdEZyYW1lVmFsdWUgPSB2O1xuICAgICAgICAgICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuc2l6ZSwgdGhpcy5zaXplKTtcbiAgICAgICAgICAgIHRoaXMuZHJhd0VtcHR5QXJjKHYpO1xuICAgICAgICAgICAgdGhpcy5kcmF3QXJjKHYpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEcmF3IHRoZSBhcmMgKHBhcnQgb2YgdGhlIGNpcmNsZSkuXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHYgLSBGcmFtZSB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGRyYXdBcmM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIGlmICh2ID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIGN0eCA9IHRoaXMuY3R4LFxuICAgICAgICAgICAgICAgIHIgPSB0aGlzLnJhZGl1cyxcbiAgICAgICAgICAgICAgICB0ID0gdGhpcy5nZXRUaGlja25lc3MoKSxcbiAgICAgICAgICAgICAgICBhID0gdGhpcy5zdGFydEFuZ2xlO1xuXG4gICAgICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMucmV2ZXJzZSkge1xuICAgICAgICAgICAgICAgIGN0eC5hcmMociwgciwgciAtIHQgLyAyLCBhLCBhICsgTWF0aC5QSSAqIDIgKiB2KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LmFyYyhyLCByLCByIC0gdCAvIDIsIGEgLSBNYXRoLlBJICogMiAqIHYsIGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdHgubGluZVdpZHRoID0gdDtcbiAgICAgICAgICAgIGN0eC5saW5lQ2FwID0gdGhpcy5saW5lQ2FwO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5hcmNGaWxsO1xuICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRHJhdyB0aGUgX2VtcHR5IChiYWNrZ3JvdW5kKV8gYXJjIChwYXJ0IG9mIHRoZSBjaXJjbGUpLlxuICAgICAgICAgKiBAcHJvdGVjdGVkXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2IC0gRnJhbWUgdmFsdWUuXG4gICAgICAgICAqL1xuICAgICAgICBkcmF3RW1wdHlBcmM6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgIHZhciBjdHggPSB0aGlzLmN0eCxcbiAgICAgICAgICAgICAgICByID0gdGhpcy5yYWRpdXMsXG4gICAgICAgICAgICAgICAgdCA9IHRoaXMuZ2V0VGhpY2tuZXNzKCksXG4gICAgICAgICAgICAgICAgYSA9IHRoaXMuc3RhcnRBbmdsZTtcblxuICAgICAgICAgICAgaWYgKHYgPCAxKSB7XG4gICAgICAgICAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAodiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5hcmMociwgciwgciAtIHQgLyAyLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLnJldmVyc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hcmMociwgciwgciAtIHQgLyAyLCBhICsgTWF0aC5QSSAqIDIgKiB2LCBhKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5hcmMociwgciwgciAtIHQgLyAyLCBhLCBhIC0gTWF0aC5QSSAqIDIgKiB2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSB0O1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMuZW1wdHlGaWxsO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBbmltYXRlIHRoZSBwcm9ncmVzcyBiYXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRocm93cyAzIGpRdWVyeSBldmVudHM6XG4gICAgICAgICAqXG4gICAgICAgICAqIC0gYGNpcmNsZS1hbmltYXRpb24tc3RhcnQoanFFdmVudClgXG4gICAgICAgICAqIC0gYGNpcmNsZS1hbmltYXRpb24tcHJvZ3Jlc3MoanFFdmVudCwgYW5pbWF0aW9uUHJvZ3Jlc3MsIHN0ZXBWYWx1ZSlgIC0gbXVsdGlwbGUgZXZlbnRcbiAgICAgICAgICogICBhbmltYXRpb25Qcm9ncmVzczogZnJvbSBgMC4wYCB0byBgMS4wYDsgc3RlcFZhbHVlOiBmcm9tIGAwLjBgIHRvIGB2YWx1ZWBcbiAgICAgICAgICogLSBgY2lyY2xlLWFuaW1hdGlvbi1lbmQoanFFdmVudClgXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHYgLSBGaW5hbCB2YWx1ZS5cbiAgICAgICAgICovXG4gICAgICAgIGRyYXdBbmltYXRlZDogZnVuY3Rpb24odikge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGVsID0gdGhpcy5lbCxcbiAgICAgICAgICAgICAgICBjYW52YXMgPSAkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICAgICAgLy8gc3RvcCBwcmV2aW91cyBhbmltYXRpb24gYmVmb3JlIG5ldyBcInN0YXJ0XCIgZXZlbnQgaXMgdHJpZ2dlcmVkXG4gICAgICAgICAgICBjYW52YXMuc3RvcCh0cnVlLCBmYWxzZSk7XG4gICAgICAgICAgICBlbC50cmlnZ2VyKCdjaXJjbGUtYW5pbWF0aW9uLXN0YXJ0Jyk7XG5cbiAgICAgICAgICAgIGNhbnZhc1xuICAgICAgICAgICAgICAgIC5jc3Moe2FuaW1hdGlvblByb2dyZXNzOiAwfSlcbiAgICAgICAgICAgICAgICAuYW5pbWF0ZSh7YW5pbWF0aW9uUHJvZ3Jlc3M6IDF9LCAkLmV4dGVuZCh7fSwgdGhpcy5hbmltYXRpb24sIHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcDogZnVuY3Rpb24oYW5pbWF0aW9uUHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwVmFsdWUgPSBzZWxmLmFuaW1hdGlvblN0YXJ0VmFsdWUgKiAoMSAtIGFuaW1hdGlvblByb2dyZXNzKSArIHYgKiBhbmltYXRpb25Qcm9ncmVzcztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZHJhd0ZyYW1lKHN0ZXBWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC50cmlnZ2VyKCdjaXJjbGUtYW5pbWF0aW9uLXByb2dyZXNzJywgW2FuaW1hdGlvblByb2dyZXNzLCBzdGVwVmFsdWVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pKVxuICAgICAgICAgICAgICAgIC5wcm9taXNlKClcbiAgICAgICAgICAgICAgICAuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIG9uIGJvdGggc3VjY2Vzc2Z1bCAmIGZhaWx1cmUgYW5pbWF0aW9uIGVuZFxuICAgICAgICAgICAgICAgICAgICBlbC50cmlnZ2VyKCdjaXJjbGUtYW5pbWF0aW9uLWVuZCcpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBHZXQgdGhlIGNpcmNsZSB0aGlja25lc3MuXG4gICAgICAgICAqIEBzZWUgQ2lyY2xlUHJvZ3Jlc3MjdGhpY2tuZXNzXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIGdldFRoaWNrbmVzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5pc051bWVyaWModGhpcy50aGlja25lc3MpID8gdGhpcy50aGlja25lc3MgOiB0aGlzLnNpemUgLyAxNDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogR2V0IGN1cnJlbnQgdmFsdWUuXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNldCBjdXJyZW50IHZhbHVlICh3aXRoIHNtb290aCBhbmltYXRpb24gdHJhbnNpdGlvbikuXG4gICAgICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgICAgICogQHBhcmFtIHtudW1iZXJ9IG5ld1ZhbHVlXG4gICAgICAgICAqL1xuICAgICAgICBzZXRWYWx1ZTogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbilcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvblN0YXJ0VmFsdWUgPSB0aGlzLmxhc3RGcmFtZVZhbHVlO1xuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgdGhpcy5kcmF3KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJbml0aWF0aW5nIGpRdWVyeSBwbHVnaW4gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAkLmNpcmNsZVByb2dyZXNzID0ge1xuICAgICAgICAvLyBEZWZhdWx0IG9wdGlvbnMgKHlvdSBtYXkgb3ZlcnJpZGUgdGhlbSlcbiAgICAgICAgZGVmYXVsdHM6IENpcmNsZVByb2dyZXNzLnByb3RvdHlwZVxuICAgIH07XG5cbiAgICAvLyBlYXNlLWluLW91dC1jdWJpY1xuICAgICQuZWFzaW5nLmNpcmNsZVByb2dyZXNzRWFzaW5nID0gZnVuY3Rpb24oeCkge1xuICAgICAgICBpZiAoeCA8IDAuNSkge1xuICAgICAgICAgICAgeCA9IDIgKiB4O1xuICAgICAgICAgICAgcmV0dXJuIDAuNSAqIHggKiB4ICogeDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHggPSAyIC0gMiAqIHg7XG4gICAgICAgICAgICByZXR1cm4gMSAtIDAuNSAqIHggKiB4ICogeDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGluc3RhbmNlIG9mIHtAbGluayBDaXJjbGVQcm9ncmVzc30uXG4gICAgICogUHJvZHVjZXMgW2luaXQgZXZlbnRde0BsaW5rIENpcmNsZVByb2dyZXNzI2luaXR9IGFuZCBbYW5pbWF0aW9uIGV2ZW50c117QGxpbmsgQ2lyY2xlUHJvZ3Jlc3MjZHJhd0FuaW1hdGVkfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbY29uZmlnT3JDb21tYW5kXSAtIENvbmZpZyBvYmplY3Qgb3IgY29tbWFuZCBuYW1lLlxuICAgICAqXG4gICAgICogQ29uZmlnIGV4YW1wbGUgKHlvdSBjYW4gc3BlY2lmeSBhbnkge0BsaW5rIENpcmNsZVByb2dyZXNzfSBwcm9wZXJ0eSk6XG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIHsgdmFsdWU6IDAuNzUsIHNpemU6IDUwLCBhbmltYXRpb246IGZhbHNlIH1cbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIENvbW1hbmRzOlxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBlbC5jaXJjbGVQcm9ncmVzcygnd2lkZ2V0Jyk7IC8vIGdldCB0aGUgPGNhbnZhcz5cbiAgICAgKiBlbC5jaXJjbGVQcm9ncmVzcygndmFsdWUnKTsgLy8gZ2V0IHRoZSB2YWx1ZVxuICAgICAqIGVsLmNpcmNsZVByb2dyZXNzKCd2YWx1ZScsIG5ld1ZhbHVlKTsgLy8gdXBkYXRlIHRoZSB2YWx1ZVxuICAgICAqIGVsLmNpcmNsZVByb2dyZXNzKCdyZWRyYXcnKTsgLy8gcmVkcmF3IHRoZSBjaXJjbGVcbiAgICAgKiBlbC5jaXJjbGVQcm9ncmVzcygpOyAvLyB0aGUgc2FtZSBhcyAncmVkcmF3J1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtjb21tYW5kQXJndW1lbnRdIC0gU29tZSBjb21tYW5kcyAobGlrZSBgJ3ZhbHVlJ2ApIG1heSByZXF1aXJlIGFuIGFyZ3VtZW50LlxuICAgICAqIEBzZWUgQ2lyY2xlUHJvZ3Jlc3NcbiAgICAgKiBAYWxpYXMgXCIkKC4uLikuY2lyY2xlUHJvZ3Jlc3NcIlxuICAgICAqL1xuICAgICQuZm4uY2lyY2xlUHJvZ3Jlc3MgPSBmdW5jdGlvbihjb25maWdPckNvbW1hbmQsIGNvbW1hbmRBcmd1bWVudCkge1xuICAgICAgICB2YXIgZGF0YU5hbWUgPSAnY2lyY2xlLXByb2dyZXNzJyxcbiAgICAgICAgICAgIGZpcnN0SW5zdGFuY2UgPSB0aGlzLmRhdGEoZGF0YU5hbWUpO1xuXG4gICAgICAgIGlmIChjb25maWdPckNvbW1hbmQgPT0gJ3dpZGdldCcpIHtcbiAgICAgICAgICAgIGlmICghZmlyc3RJbnN0YW5jZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignQ2FsbGluZyBcIndpZGdldFwiIG1ldGhvZCBvbiBub3QgaW5pdGlhbGl6ZWQgaW5zdGFuY2UgaXMgZm9yYmlkZGVuJyk7XG4gICAgICAgICAgICByZXR1cm4gZmlyc3RJbnN0YW5jZS5jYW52YXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29uZmlnT3JDb21tYW5kID09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgIGlmICghZmlyc3RJbnN0YW5jZSlcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcignQ2FsbGluZyBcInZhbHVlXCIgbWV0aG9kIG9uIG5vdCBpbml0aWFsaXplZCBpbnN0YW5jZSBpcyBmb3JiaWRkZW4nKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29tbWFuZEFyZ3VtZW50ID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpcnN0SW5zdGFuY2UuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuZGF0YShkYXRhTmFtZSkuc2V0VmFsdWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBlbC5kYXRhKGRhdGFOYW1lKSxcbiAgICAgICAgICAgICAgICBjb25maWcgPSAkLmlzUGxhaW5PYmplY3QoY29uZmlnT3JDb21tYW5kKSA/IGNvbmZpZ09yQ29tbWFuZCA6IHt9O1xuXG4gICAgICAgICAgICBpZiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5pbml0KGNvbmZpZyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBpbml0aWFsQ29uZmlnID0gJC5leHRlbmQoe30sIGVsLmRhdGEoKSk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpbml0aWFsQ29uZmlnLmZpbGwgPT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxDb25maWcuZmlsbCA9IEpTT04ucGFyc2UoaW5pdGlhbENvbmZpZy5maWxsKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGluaXRpYWxDb25maWcuYW5pbWF0aW9uID09ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsQ29uZmlnLmFuaW1hdGlvbiA9IEpTT04ucGFyc2UoaW5pdGlhbENvbmZpZy5hbmltYXRpb24pO1xuICAgICAgICAgICAgICAgIGNvbmZpZyA9ICQuZXh0ZW5kKGluaXRpYWxDb25maWcsIGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgY29uZmlnLmVsID0gZWw7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBuZXcgQ2lyY2xlUHJvZ3Jlc3MoY29uZmlnKTtcbiAgICAgICAgICAgICAgICBlbC5kYXRhKGRhdGFOYW1lLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KTtcbiJdLCJmaWxlIjoianF1ZXJ5LmNpcmNsZS1wcm9ncmVzcy5qcyJ9
