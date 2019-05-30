/*!
 * Shuffle.js by @Vestride
 * Categorize, sort, and filter a responsive grid of items.
 * Dependencies: jQuery 1.9+, Modernizr 2.6.2+
 * @license MIT license
 * @version 3.1.1
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'modernizr'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'), window.Modernizr);
    } else {
        window.Shuffle = factory(window.jQuery, window.Modernizr);
    }
})(function($, Modernizr, undefined) {

    'use strict';


// Validate Modernizr exists.
// Shuffle requires `csstransitions`, `csstransforms`, `csstransforms3d`,
// and `prefixed` to exist on the Modernizr object.
    if (typeof Modernizr !== 'object') {
        throw new Error('Shuffle.js requires Modernizr.\n' +
            'http://vestride.github.io/Shuffle/#dependencies');
    }


    /**
     * Returns css prefixed properties like `-webkit-transition` or `box-sizing`
     * from `transition` or `boxSizing`, respectively.
     * @param {(string|boolean)} prop Property to be prefixed.
     * @return {string} The prefixed css property.
     */
    function dashify( prop ) {
        if (!prop) {
            return '';
        }

        // Replace upper case with dash-lowercase,
        // then fix ms- prefixes because they're not capitalized.
        return prop.replace(/([A-Z])/g, function( str, m1 ) {
            return '-' + m1.toLowerCase();
        }).replace(/^ms-/,'-ms-');
    }

// Constant, prefixed variables.
    var TRANSITION = Modernizr.prefixed('transition');
    var TRANSITION_DELAY = Modernizr.prefixed('transitionDelay');
    var TRANSITION_DURATION = Modernizr.prefixed('transitionDuration');

// Note(glen): Stock Android 4.1.x browser will fail here because it wrongly
// says it supports non-prefixed transitions.
// https://github.com/Modernizr/Modernizr/issues/897
    var TRANSITIONEND = {
        'WebkitTransition' : 'webkitTransitionEnd',
        'transition' : 'transitionend'
    }[ TRANSITION ];

    var TRANSFORM = Modernizr.prefixed('transform');
    var CSS_TRANSFORM = dashify(TRANSFORM);

// Constants
    var CAN_TRANSITION_TRANSFORMS = Modernizr.csstransforms && Modernizr.csstransitions;
    var HAS_TRANSFORMS_3D = Modernizr.csstransforms3d;
    var HAS_COMPUTED_STYLE = !!window.getComputedStyle;
    var SHUFFLE = 'shuffle';

// Configurable. You can change these constants to fit your application.
// The default scale and concealed scale, however, have to be different values.
    var ALL_ITEMS = 'all';
    var FILTER_ATTRIBUTE_KEY = 'groups';
    var DEFAULT_SCALE = 1;
    var CONCEALED_SCALE = 0.001;

// Underscore's throttle function.
    function throttle(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        options = options || {};
        var later = function() {
            previous = options.leading === false ? 0 : $.now();
            timeout = null;
            result = func.apply(context, args);
            context = args = null;
        };
        return function() {
            var now = $.now();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
                context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    function each(obj, iterator, context) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) {
                return;
            }
        }
    }

    function defer(fn, context, wait) {
        return setTimeout( $.proxy( fn, context ), wait );
    }

    function arrayMax( array ) {
        return Math.max.apply( Math, array );
    }

    function arrayMin( array ) {
        return Math.min.apply( Math, array );
    }


    /**
     * Always returns a numeric value, given a value.
     * @param {*} value Possibly numeric value.
     * @return {number} `value` or zero if `value` isn't numeric.
     * @private
     */
    function getNumber(value) {
        return $.isNumeric(value) ? value : 0;
    }

    var getStyles = window.getComputedStyle || function() {};

    /**
     * Represents a coordinate pair.
     * @param {number} [x=0] X.
     * @param {number} [y=0] Y.
     */
    var Point = function(x, y) {
        this.x = getNumber( x );
        this.y = getNumber( y );
    };


    /**
     * Whether two points are equal.
     * @param {Point} a Point A.
     * @param {Point} b Point B.
     * @return {boolean}
     */
    Point.equals = function(a, b) {
        return a.x === b.x && a.y === b.y;
    };

    var COMPUTED_SIZE_INCLUDES_PADDING = (function() {
        if (!HAS_COMPUTED_STYLE) {
            return false;
        }

        var parent = document.body || document.documentElement;
        var e = document.createElement('div');
        e.style.cssText = 'width:10px;padding:2px;' +
            '-webkit-box-sizing:border-box;box-sizing:border-box;';
        parent.appendChild(e);

        var width = getStyles(e, null).width;
        var ret = width === '10px';

        parent.removeChild(e);

        return ret;
    }());


// Used for unique instance variables
    var id = 0;
    var $window = $( window );


    /**
     * Categorize, sort, and filter a responsive grid of items.
     *
     * @param {Element} element An element which is the parent container for the grid items.
     * @param {Object} [options=Shuffle.options] Options object.
     * @constructor
     */
    var Shuffle = function( element, options ) {
        options = options || {};
        $.extend( this, Shuffle.options, options, Shuffle.settings );

        this.$el = $(element);
        this.element = element;
        this.unique = 'shuffle_' + id++;

        this._fire( Shuffle.EventType.LOADING );
        this._init();

        // Dispatch the done event asynchronously so that people can bind to it after
        // Shuffle has been initialized.
        defer(function() {
            this.initialized = true;
            this._fire( Shuffle.EventType.DONE );
        }, this, 16);
    };


    /**
     * Events the container element emits with the .shuffle namespace.
     * For example, "done.shuffle".
     * @enum {string}
     */
    Shuffle.EventType = {
        LOADING: 'loading',
        DONE: 'done',
        LAYOUT: 'layout',
        REMOVED: 'removed'
    };


    /** @enum {string} */
    Shuffle.ClassName = {
        BASE: SHUFFLE,
        SHUFFLE_ITEM: 'shuffle-item',
        FILTERED: 'filtered',
        CONCEALED: 'concealed'
    };


// Overrideable options
    Shuffle.options = {
        group: ALL_ITEMS, // Initial filter group.
        speed: 250, // Transition/animation speed (milliseconds).
        easing: 'ease-out', // CSS easing function to use.
        itemSelector: '', // e.g. '.picture-item'.
        sizer: null, // Sizer element. Use an element to determine the size of columns and gutters.
        gutterWidth: 0, // A static number or function that tells the plugin how wide the gutters between columns are (in pixels).
        columnWidth: 0, // A static number or function that returns a number which tells the plugin how wide the columns are (in pixels).
        delimeter: null, // If your group is not json, and is comma delimeted, you could set delimeter to ','.
        buffer: 0, // Useful for percentage based heights when they might not always be exactly the same (in pixels).
        columnThreshold: HAS_COMPUTED_STYLE ? 0.01 : 0.1, // Reading the width of elements isn't precise enough and can cause columns to jump between values.
        initialSort: null, // Shuffle can be initialized with a sort object. It is the same object given to the sort method.
        throttle: throttle, // By default, shuffle will throttle resize events. This can be changed or removed.
        throttleTime: 300, // How often shuffle can be called on resize (in milliseconds).
        sequentialFadeDelay: 150, // Delay between each item that fades in when adding items.
        supported: CAN_TRANSITION_TRANSFORMS // Whether to use transforms or absolute positioning.
    };


// Not overrideable
    Shuffle.settings = {
        useSizer: false,
        itemCss : { // default CSS for each item
            position: 'absolute',
            top: 0,
            left: 0,
            visibility: 'visible'
        },
        revealAppendedDelay: 300,
        lastSort: {},
        lastFilter: ALL_ITEMS,
        enabled: true,
        destroyed: false,
        initialized: false,
        _animations: [],
        _transitions: [],
        _isMovementCanceled: false,
        styleQueue: []
    };


// Expose for testing.
    Shuffle.Point = Point;


    /**
     * Static methods.
     */

    /**
     * If the browser has 3d transforms available, build a string with those,
     * otherwise use 2d transforms.
     * @param {Point} point X and Y positions.
     * @param {number} scale Scale amount.
     * @return {string} A normalized string which can be used with the transform style.
     * @private
     */
    Shuffle._getItemTransformString = function(point, scale) {
        if ( HAS_TRANSFORMS_3D ) {
            return 'translate3d(' + point.x + 'px, ' + point.y + 'px, 0) scale3d(' + scale + ', ' + scale + ', 1)';
        } else {
            return 'translate(' + point.x + 'px, ' + point.y + 'px) scale(' + scale + ')';
        }
    };


    /**
     * Retrieve the computed style for an element, parsed as a float.
     * @param {Element} element Element to get style for.
     * @param {string} style Style property.
     * @param {CSSStyleDeclaration} [styles] Optionally include clean styles to
     *     use instead of asking for them again.
     * @return {number} The parsed computed value or zero if that fails because IE
     *     will return 'auto' when the element doesn't have margins instead of
     *     the computed style.
     * @private
     */
    Shuffle._getNumberStyle = function( element, style, styles ) {
        if ( HAS_COMPUTED_STYLE ) {
            styles = styles || getStyles( element, null );
            var value = Shuffle._getFloat( styles[ style ] );

            // Support IE<=11 and W3C spec.
            if ( !COMPUTED_SIZE_INCLUDES_PADDING && style === 'width' ) {
                value += Shuffle._getFloat( styles.paddingLeft ) +
                    Shuffle._getFloat( styles.paddingRight ) +
                    Shuffle._getFloat( styles.borderLeftWidth ) +
                    Shuffle._getFloat( styles.borderRightWidth );
            } else if ( !COMPUTED_SIZE_INCLUDES_PADDING && style === 'height' ) {
                value += Shuffle._getFloat( styles.paddingTop ) +
                    Shuffle._getFloat( styles.paddingBottom ) +
                    Shuffle._getFloat( styles.borderTopWidth ) +
                    Shuffle._getFloat( styles.borderBottomWidth );
            }

            return value;
        } else {
            return Shuffle._getFloat( $( element ).css( style )  );
        }
    };


    /**
     * Parse a string as an float.
     * @param {string} value String float.
     * @return {number} The string as an float or zero.
     * @private
     */
    Shuffle._getFloat = function(value) {
        return getNumber( parseFloat( value ) );
    };


    /**
     * Returns the outer width of an element, optionally including its margins.
     *
     * There are a few different methods for getting the width of an element, none of
     * which work perfectly for all Shuffle's use cases.
     *
     * 1. getBoundingClientRect() `left` and `right` properties.
     *   - Accounts for transform scaled elements, making it useless for Shuffle
     *   elements which have shrunk.
     * 2. The `offsetWidth` property (or jQuery's CSS).
     *   - This value stays the same regardless of the elements transform property,
     *   however, it does not return subpixel values.
     * 3. getComputedStyle()
     *   - This works great Chrome, Firefox, Safari, but IE<=11 does not include
     *   padding and border when box-sizing: border-box is set, requiring a feature
     *   test and extra work to add the padding back for IE and other browsers which
     *   follow the W3C spec here.
     *
     * @param {Element} element The element.
     * @param {boolean} [includeMargins] Whether to include margins. Default is false.
     * @return {number} The width.
     */
    Shuffle._getOuterWidth = function( element, includeMargins ) {
        // Store the styles so that they can be used by others without asking for it again.
        var styles = getStyles( element, null );
        var width = Shuffle._getNumberStyle( element, 'width', styles );

        // Use jQuery here because it uses getComputedStyle internally and is
        // cross-browser. Using the style property of the element will only work
        // if there are inline styles.
        if ( includeMargins ) {
            var marginLeft = Shuffle._getNumberStyle( element, 'marginLeft', styles );
            var marginRight = Shuffle._getNumberStyle( element, 'marginRight', styles );
            width += marginLeft + marginRight;
        }

        return width;
    };


    /**
     * Returns the outer height of an element, optionally including its margins.
     * @param {Element} element The element.
     * @param {boolean} [includeMargins] Whether to include margins. Default is false.
     * @return {number} The height.
     */
    Shuffle._getOuterHeight = function( element, includeMargins ) {
        var styles = getStyles( element, null );
        var height = Shuffle._getNumberStyle( element, 'height', styles );

        if ( includeMargins ) {
            var marginTop = Shuffle._getNumberStyle( element, 'marginTop', styles );
            var marginBottom = Shuffle._getNumberStyle( element, 'marginBottom', styles );
            height += marginTop + marginBottom;
        }

        return height;
    };


    /**
     * Change a property or execute a function which will not have a transition
     * @param {Element} element DOM element that won't be transitioned
     * @param {Function} callback A function which will be called while transition
     *     is set to 0ms.
     * @param {Object} [context] Optional context for the callback function.
     * @private
     */
    Shuffle._skipTransition = function( element, callback, context ) {
        var duration = element.style[ TRANSITION_DURATION ];

        // Set the duration to zero so it happens immediately
        element.style[ TRANSITION_DURATION ] = '0ms'; // ms needed for firefox!

        callback.call( context );

        // Force reflow
        var reflow = element.offsetWidth;
        // Avoid jshint warnings: unused variables and expressions.
        reflow = null;

        // Put the duration back
        element.style[ TRANSITION_DURATION ] = duration;
    };


    /**
     * Instance methods.
     */

    Shuffle.prototype._init = function() {
        this.$items = this._getItems();

        this.sizer = this._getElementOption( this.sizer );

        if ( this.sizer ) {
            this.useSizer = true;
        }

        // Add class and invalidate styles
        this.$el.addClass( Shuffle.ClassName.BASE );

        // Set initial css for each item
        this._initItems();

        // Bind resize events
        // http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
        $window.on('resize.' + SHUFFLE + '.' + this.unique, this._getResizeFunction());

        // Get container css all in one request. Causes reflow
        var containerCSS = this.$el.css(['position', 'overflow']);
        var containerWidth = Shuffle._getOuterWidth( this.element );

        // Add styles to the container if it doesn't have them.
        this._validateStyles( containerCSS );

        // We already got the container's width above, no need to cause another reflow getting it again...
        // Calculate the number of columns there will be
        this._setColumns( containerWidth );

        // Kick off!
        this.shuffle( this.group, this.initialSort );

        // The shuffle items haven't had transitions set on them yet
        // so the user doesn't see the first layout. Set them now that the first layout is done.
        if ( this.supported ) {
            defer(function() {
                this._setTransitions();
                this.element.style[ TRANSITION ] = 'height ' + this.speed + 'ms ' + this.easing;
            }, this);
        }
    };


    /**
     * Returns a throttled and proxied function for the resize handler.
     * @return {Function}
     * @private
     */
    Shuffle.prototype._getResizeFunction = function() {
        var resizeFunction = $.proxy( this._onResize, this );
        return this.throttle ?
            this.throttle( resizeFunction, this.throttleTime ) :
            resizeFunction;
    };


    /**
     * Retrieve an element from an option.
     * @param {string|jQuery|Element} option The option to check.
     * @return {?Element} The plain element or null.
     * @private
     */
    Shuffle.prototype._getElementOption = function( option ) {
        // If column width is a string, treat is as a selector and search for the
        // sizer element within the outermost container
        if ( typeof option === 'string' ) {
            return this.$el.find( option )[0] || null;

            // Check for an element
        } else if ( option && option.nodeType && option.nodeType === 1 ) {
            return option;

            // Check for jQuery object
        } else if ( option && option.jquery ) {
            return option[0];
        }

        return null;
    };


    /**
     * Ensures the shuffle container has the css styles it needs applied to it.
     * @param {Object} styles Key value pairs for position and overflow.
     * @private
     */
    Shuffle.prototype._validateStyles = function(styles) {
        // Position cannot be static.
        if ( styles.position === 'static' ) {
            this.element.style.position = 'relative';
        }

        // Overflow has to be hidden
        if ( styles.overflow !== 'hidden' ) {
            this.element.style.overflow = 'hidden';
        }
    };


    /**
     * Filter the elements by a category.
     * @param {string} [category] Category to filter by. If it's given, the last
     *     category will be used to filter the items.
     * @param {ArrayLike} [$collection] Optionally filter a collection. Defaults to
     *     all the items.
     * @return {jQuery} Filtered items.
     * @private
     */
    Shuffle.prototype._filter = function( category, $collection ) {
        category = category || this.lastFilter;
        $collection = $collection || this.$items;

        var set = this._getFilteredSets( category, $collection );

        // Individually add/remove concealed/filtered classes
        this._toggleFilterClasses( set.filtered, set.concealed );

        // Save the last filter in case elements are appended.
        this.lastFilter = category;

        // This is saved mainly because providing a filter function (like searching)
        // will overwrite the `lastFilter` property every time its called.
        if ( typeof category === 'string' ) {
            this.group = category;
        }

        return set.filtered;
    };


    /**
     * Returns an object containing the filtered and concealed elements.
     * @param {string|Function} category Category or function to filter by.
     * @param {ArrayLike.<Element>} $items A collection of items to filter.
     * @return {!{filtered: jQuery, concealed: jQuery}}
     * @private
     */
    Shuffle.prototype._getFilteredSets = function( category, $items ) {
        var $filtered = $();
        var $concealed = $();

        // category === 'all', add filtered class to everything
        if ( category === ALL_ITEMS ) {
            $filtered = $items;

            // Loop through each item and use provided function to determine
            // whether to hide it or not.
        } else {
            each($items, function( el ) {
                var $item = $(el);
                if ( this._doesPassFilter( category, $item ) ) {
                    $filtered = $filtered.add( $item );
                } else {
                    $concealed = $concealed.add( $item );
                }
            }, this);
        }

        return {
            filtered: $filtered,
            concealed: $concealed
        };
    };


    /**
     * Test an item to see if it passes a category.
     * @param {string|Function} category Category or function to filter by.
     * @param {jQuery} $item A single item, wrapped with jQuery.
     * @return {boolean} Whether it passes the category/filter.
     * @private
     */
    Shuffle.prototype._doesPassFilter = function( category, $item ) {
        if ( $.isFunction( category ) ) {
            return category.call( $item[0], $item, this );

            // Check each element's data-groups attribute against the given category.
        } else {
            var groups = $item.data( FILTER_ATTRIBUTE_KEY );
            var keys = this.delimeter && !$.isArray( groups ) ?
                groups.split( this.delimeter ) :
                groups;
            return $.inArray(category, keys) > -1;
        }
    };


    /**
     * Toggles the filtered and concealed class names.
     * @param {jQuery} $filtered Filtered set.
     * @param {jQuery} $concealed Concealed set.
     * @private
     */
    Shuffle.prototype._toggleFilterClasses = function( $filtered, $concealed ) {
        $filtered
            .removeClass( Shuffle.ClassName.CONCEALED )
            .addClass( Shuffle.ClassName.FILTERED );
        $concealed
            .removeClass( Shuffle.ClassName.FILTERED )
            .addClass( Shuffle.ClassName.CONCEALED );
    };


    /**
     * Set the initial css for each item
     * @param {jQuery} [$items] Optionally specifiy at set to initialize
     */
    Shuffle.prototype._initItems = function( $items ) {
        $items = $items || this.$items;
        $items.addClass([
            Shuffle.ClassName.SHUFFLE_ITEM,
            Shuffle.ClassName.FILTERED
        ].join(' '));
        $items.css( this.itemCss ).data('point', new Point()).data('scale', DEFAULT_SCALE);
    };


    /**
     * Updates the filtered item count.
     * @private
     */
    Shuffle.prototype._updateItemCount = function() {
        this.visibleItems = this._getFilteredItems().length;
    };


    /**
     * Sets css transform transition on a an element.
     * @param {Element} element Element to set transition on.
     * @private
     */
    Shuffle.prototype._setTransition = function( element ) {
        element.style[ TRANSITION ] = CSS_TRANSFORM + ' ' + this.speed + 'ms ' +
            this.easing + ', opacity ' + this.speed + 'ms ' + this.easing;
    };


    /**
     * Sets css transform transition on a group of elements.
     * @param {ArrayLike.<Element>} $items Elements to set transitions on.
     * @private
     */
    Shuffle.prototype._setTransitions = function( $items ) {
        $items = $items || this.$items;
        each($items, function( el ) {
            this._setTransition( el );
        }, this);
    };


    /**
     * Sets a transition delay on a collection of elements, making each delay
     * greater than the last.
     * @param {ArrayLike.<Element>} $collection Array to iterate over.
     */
    Shuffle.prototype._setSequentialDelay = function( $collection ) {
        if ( !this.supported ) {
            return;
        }

        // $collection can be an array of dom elements or jquery object
        each($collection, function( el, i ) {
            // This works because the transition-property: transform, opacity;
            el.style[ TRANSITION_DELAY ] = '0ms,' + ((i + 1) * this.sequentialFadeDelay) + 'ms';
        }, this);
    };


    Shuffle.prototype._getItems = function() {
        return this.$el.children( this.itemSelector );
    };


    Shuffle.prototype._getFilteredItems = function() {
        return this.$items.filter('.' + Shuffle.ClassName.FILTERED);
    };


    Shuffle.prototype._getConcealedItems = function() {
        return this.$items.filter('.' + Shuffle.ClassName.CONCEALED);
    };


    /**
     * Returns the column size, based on column width and sizer options.
     * @param {number} containerWidth Size of the parent container.
     * @param {number} gutterSize Size of the gutters.
     * @return {number}
     * @private
     */
    Shuffle.prototype._getColumnSize = function( containerWidth, gutterSize ) {
        var size;

        // If the columnWidth property is a function, then the grid is fluid
        if ( $.isFunction( this.columnWidth ) ) {
            size = this.columnWidth(containerWidth);

            // columnWidth option isn't a function, are they using a sizing element?
        } else if ( this.useSizer ) {
            size = Shuffle._getOuterWidth(this.sizer);

            // if not, how about the explicitly set option?
        } else if ( this.columnWidth ) {
            size = this.columnWidth;

            // or use the size of the first item
        } else if ( this.$items.length > 0 ) {
            size = Shuffle._getOuterWidth(this.$items[0], true);

            // if there's no items, use size of container
        } else {
            size = containerWidth;
        }

        // Don't let them set a column width of zero.
        if ( size === 0 ) {
            size = containerWidth;
        }

        return size + gutterSize;
    };


    /**
     * Returns the gutter size, based on gutter width and sizer options.
     * @param {number} containerWidth Size of the parent container.
     * @return {number}
     * @private
     */
    Shuffle.prototype._getGutterSize = function( containerWidth ) {
        var size;
        if ( $.isFunction( this.gutterWidth ) ) {
            size = this.gutterWidth(containerWidth);
        } else if ( this.useSizer ) {
            size = Shuffle._getNumberStyle(this.sizer, 'marginLeft');
        } else {
            size = this.gutterWidth;
        }

        return size;
    };


    /**
     * Calculate the number of columns to be used. Gets css if using sizer element.
     * @param {number} [theContainerWidth] Optionally specify a container width if it's already available.
     */
    Shuffle.prototype._setColumns = function( theContainerWidth ) {
        var containerWidth = theContainerWidth || Shuffle._getOuterWidth( this.element );
        var gutter = this._getGutterSize( containerWidth );
        var columnWidth = this._getColumnSize( containerWidth, gutter );
        var calculatedColumns = (containerWidth + gutter) / columnWidth;

        // Widths given from getStyles are not precise enough...
        if ( Math.abs(Math.round(calculatedColumns) - calculatedColumns) < this.columnThreshold ) {
            // e.g. calculatedColumns = 11.998876
            calculatedColumns = Math.round( calculatedColumns );
        }

        this.cols = Math.max( Math.floor(calculatedColumns), 1 );
        this.containerWidth = containerWidth;
        this.colWidth = columnWidth;
    };

    /**
     * Adjust the height of the grid
     */
    Shuffle.prototype._setContainerSize = function() {
        this.$el.css( 'height', this._getContainerSize() );
    };


    /**
     * Based on the column heights, it returns the biggest one.
     * @return {number}
     * @private
     */
    Shuffle.prototype._getContainerSize = function() {
        return arrayMax( this.positions );
    };


    /**
     * Fire events with .shuffle namespace
     */
    Shuffle.prototype._fire = function( name, args ) {
        this.$el.trigger( name + '.' + SHUFFLE, args && args.length ? args : [ this ] );
    };


    /**
     * Zeros out the y columns array, which is used to determine item placement.
     * @private
     */
    Shuffle.prototype._resetCols = function() {
        var i = this.cols;
        this.positions = [];
        while (i--) {
            this.positions.push( 0 );
        }
    };


    /**
     * Loops through each item that should be shown and calculates the x, y position.
     * @param {Array.<Element>} items Array of items that will be shown/layed out in order in their array.
     *     Because jQuery collection are always ordered in DOM order, we can't pass a jq collection.
     * @param {boolean} [isOnlyPosition=false] If true this will position the items with zero opacity.
     */
    Shuffle.prototype._layout = function( items, isOnlyPosition ) {
        each(items, function( item ) {
            this._layoutItem( item, !!isOnlyPosition );
        }, this);

        // `_layout` always happens after `_shrink`, so it's safe to process the style
        // queue here with styles from the shrink method.
        this._processStyleQueue();

        // Adjust the height of the container.
        this._setContainerSize();
    };


    /**
     * Calculates the position of the item and pushes it onto the style queue.
     * @param {Element} item Element which is being positioned.
     * @param {boolean} isOnlyPosition Whether to position the item, but with zero
     *     opacity so that it can fade in later.
     * @private
     */
    Shuffle.prototype._layoutItem = function( item, isOnlyPosition ) {
        var $item = $(item);
        var itemData = $item.data();
        var currPos = itemData.point;
        var currScale = itemData.scale;
        var itemSize = {
            width: Shuffle._getOuterWidth( item, true ),
            height: Shuffle._getOuterHeight( item, true )
        };
        var pos = this._getItemPosition( itemSize );

        // If the item will not change its position, do not add it to the render
        // queue. Transitions don't fire when setting a property to the same value.
        if ( Point.equals(currPos, pos) && currScale === DEFAULT_SCALE ) {
            return;
        }

        // Save data for shrink
        itemData.point = pos;
        itemData.scale = DEFAULT_SCALE;

        this.styleQueue.push({
            $item: $item,
            point: pos,
            scale: DEFAULT_SCALE,
            opacity: isOnlyPosition ? 0 : 1,
            // Set styles immediately if there is no transition speed.
            skipTransition: isOnlyPosition || this.speed === 0,
            callfront: function() {
                if ( !isOnlyPosition ) {
                    $item.css( 'visibility', 'visible' );
                }
            },
            callback: function() {
                if ( isOnlyPosition ) {
                    $item.css( 'visibility', 'hidden' );
                }
            }
        });
    };


    /**
     * Determine the location of the next item, based on its size.
     * @param {{width: number, height: number}} itemSize Object with width and height.
     * @return {Point}
     * @private
     */
    Shuffle.prototype._getItemPosition = function( itemSize ) {
        var columnSpan = this._getColumnSpan( itemSize.width, this.colWidth, this.cols );

        var setY = this._getColumnSet( columnSpan, this.cols );

        // Finds the index of the smallest number in the set.
        var shortColumnIndex = this._getShortColumn( setY, this.buffer );

        // Position the item
        var point = new Point(
            Math.round( this.colWidth * shortColumnIndex ),
            Math.round( setY[shortColumnIndex] ));

        // Update the columns array with the new values for each column.
        // e.g. before the update the columns could be [250, 0, 0, 0] for an item
        // which spans 2 columns. After it would be [250, itemHeight, itemHeight, 0].
        var setHeight = setY[shortColumnIndex] + itemSize.height;
        var setSpan = this.cols + 1 - setY.length;
        for ( var i = 0; i < setSpan; i++ ) {
            this.positions[ shortColumnIndex + i ] = setHeight;
        }

        return point;
    };


    /**
     * Determine the number of columns an items spans.
     * @param {number} itemWidth Width of the item.
     * @param {number} columnWidth Width of the column (includes gutter).
     * @param {number} columns Total number of columns
     * @return {number}
     * @private
     */
    Shuffle.prototype._getColumnSpan = function( itemWidth, columnWidth, columns ) {
        var columnSpan = itemWidth / columnWidth;

        // If the difference between the rounded column span number and the
        // calculated column span number is really small, round the number to
        // make it fit.
        if ( Math.abs(Math.round( columnSpan ) - columnSpan ) < this.columnThreshold ) {
            // e.g. columnSpan = 4.0089945390298745
            columnSpan = Math.round( columnSpan );
        }

        // Ensure the column span is not more than the amount of columns in the whole layout.
        return Math.min( Math.ceil( columnSpan ), columns );
    };


    /**
     * Retrieves the column set to use for placement.
     * @param {number} columnSpan The number of columns this current item spans.
     * @param {number} columns The total columns in the grid.
     * @return {Array.<number>} An array of numbers represeting the column set.
     * @private
     */
    Shuffle.prototype._getColumnSet = function( columnSpan, columns ) {
        // The item spans only one column.
        if ( columnSpan === 1 ) {
            return this.positions;

            // The item spans more than one column, figure out how many different
            // places it could fit horizontally.
            // The group count is the number of places within the positions this block
            // could fit, ignoring the current positions of items.
            // Imagine a 2 column brick as the second item in a 4 column grid with
            // 10px height each. Find the places it would fit:
            // [10, 0, 0, 0]
            //  |   |  |
            //  *   *  *
            //
            // Then take the places which fit and get the bigger of the two:
            // max([10, 0]), max([0, 0]), max([0, 0]) = [10, 0, 0]
            //
            // Next, find the first smallest number (the short column).
            // [10, 0, 0]
            //      |
            //      *
            //
            // And that's where it should be placed!
        } else {
            var groupCount = columns + 1 - columnSpan;
            var groupY = [];

            // For how many possible positions for this item there are.
            for ( var i = 0; i < groupCount; i++ ) {
                // Find the bigger value for each place it could fit.
                groupY[i] = arrayMax( this.positions.slice( i, i + columnSpan ) );
            }

            return groupY;
        }
    };


    /**
     * Find index of short column, the first from the left where this item will go.
     *
     * @param {Array.<number>} positions The array to search for the smallest number.
     * @param {number} buffer Optional buffer which is very useful when the height
     *     is a percentage of the width.
     * @return {number} Index of the short column.
     * @private
     */
    Shuffle.prototype._getShortColumn = function( positions, buffer ) {
        var minPosition = arrayMin( positions );
        for (var i = 0, len = positions.length; i < len; i++) {
            if ( positions[i] >= minPosition - buffer && positions[i] <= minPosition + buffer ) {
                return i;
            }
        }
        return 0;
    };


    /**
     * Hides the elements that don't match our filter.
     * @param {jQuery} $collection jQuery collection to shrink.
     * @private
     */
    Shuffle.prototype._shrink = function( $collection ) {
        var $concealed = $collection || this._getConcealedItems();

        each($concealed, function( item ) {
            var $item = $(item);
            var itemData = $item.data();

            // Continuing would add a transitionend event listener to the element, but
            // that listener would not execute because the transform and opacity would
            // stay the same.
            if ( itemData.scale === CONCEALED_SCALE ) {
                return;
            }

            itemData.scale = CONCEALED_SCALE;

            this.styleQueue.push({
                $item: $item,
                point: itemData.point,
                scale : CONCEALED_SCALE,
                opacity: 0,
                callback: function() {
                    $item.css( 'visibility', 'hidden' );
                }
            });
        }, this);
    };


    /**
     * Resize handler.
     * @private
     */
    Shuffle.prototype._onResize = function() {
        // If shuffle is disabled, destroyed, don't do anything
        if ( !this.enabled || this.destroyed ) {
            return;
        }

        // Will need to check height in the future if it's layed out horizontaly
        var containerWidth = Shuffle._getOuterWidth( this.element );

        // containerWidth hasn't changed, don't do anything
        if ( containerWidth === this.containerWidth ) {
            return;
        }

        this.update();
    };


    /**
     * Returns styles for either jQuery animate or transition.
     * @param {Object} opts Transition options.
     * @return {!Object} Transforms for transitions, left/top for animate.
     * @private
     */
    Shuffle.prototype._getStylesForTransition = function( opts ) {
        var styles = {
            opacity: opts.opacity
        };

        if ( this.supported ) {
            styles[ TRANSFORM ] = Shuffle._getItemTransformString( opts.point, opts.scale );
        } else {
            styles.left = opts.point.x;
            styles.top = opts.point.y;
        }

        return styles;
    };


    /**
     * Transitions an item in the grid
     *
     * @param {Object} opts options.
     * @param {jQuery} opts.$item jQuery object representing the current item.
     * @param {Point} opts.point A point object with the x and y coordinates.
     * @param {number} opts.scale Amount to scale the item.
     * @param {number} opts.opacity Opacity of the item.
     * @param {Function} opts.callback Complete function for the animation.
     * @param {Function} opts.callfront Function to call before transitioning.
     * @private
     */
    Shuffle.prototype._transition = function( opts ) {
        var styles = this._getStylesForTransition( opts );
        this._startItemAnimation( opts.$item, styles, opts.callfront || $.noop, opts.callback || $.noop );
    };


    Shuffle.prototype._startItemAnimation = function( $item, styles, callfront, callback ) {
        var _this = this;
        // Transition end handler removes its listener.
        function handleTransitionEnd( evt ) {
            // Make sure this event handler has not bubbled up from a child.
            if ( evt.target === evt.currentTarget ) {
                $( evt.target ).off( TRANSITIONEND, handleTransitionEnd );
                _this._removeTransitionReference(reference);
                callback();
            }
        }

        var reference = {
            $element: $item,
            handler: handleTransitionEnd
        };

        callfront();

        // Transitions are not set until shuffle has loaded to avoid the initial transition.
        if ( !this.initialized ) {
            $item.css( styles );
            callback();
            return;
        }

        // Use CSS Transforms if we have them
        if ( this.supported ) {
            $item.css( styles );
            $item.on( TRANSITIONEND, handleTransitionEnd );
            this._transitions.push(reference);

            // Use jQuery to animate left/top
        } else {
            // Save the deferred object which jQuery returns.
            var anim = $item.stop( true ).animate( styles, this.speed, 'swing', callback );
            // Push the animation to the list of pending animations.
            this._animations.push( anim.promise() );
        }
    };


    /**
     * Execute the styles gathered in the style queue. This applies styles to elements,
     * triggering transitions.
     * @param {boolean} noLayout Whether to trigger a layout event.
     * @private
     */
    Shuffle.prototype._processStyleQueue = function( noLayout ) {
        if ( this.isTransitioning ) {
            this._cancelMovement();
        }

        var $transitions = $();

        // Iterate over the queue and keep track of ones that use transitions.
        each(this.styleQueue, function( transitionObj ) {
            if ( transitionObj.skipTransition ) {
                this._styleImmediately( transitionObj );
            } else {
                $transitions = $transitions.add( transitionObj.$item );
                this._transition( transitionObj );
            }
        }, this);


        if ( $transitions.length > 0 && this.initialized && this.speed > 0 ) {
            // Set flag that shuffle is currently in motion.
            this.isTransitioning = true;

            if ( this.supported ) {
                this._whenCollectionDone( $transitions, TRANSITIONEND, this._movementFinished );

                // The _transition function appends a promise to the animations array.
                // When they're all complete, do things.
            } else {
                this._whenAnimationsDone( this._movementFinished );
            }

            // A call to layout happened, but none of the newly filtered items will
            // change position. Asynchronously fire the callback here.
        } else if ( !noLayout ) {
            defer( this._layoutEnd, this );
        }

        // Remove everything in the style queue
        this.styleQueue.length = 0;
    };

    Shuffle.prototype._cancelMovement = function() {
        if (this.supported) {
            // Remove the transition end event for each listener.
            each(this._transitions, function( transition ) {
                transition.$element.off( TRANSITIONEND, transition.handler );
            });
        } else {
            // Even when `stop` is called on the jQuery animation, its promise will
            // still be resolved. Since it cannot be determine from within that callback
            // whether the animation was stopped or not, a flag is set here to distinguish
            // between the two states.
            this._isMovementCanceled = true;
            this.$items.stop(true);
            this._isMovementCanceled = false;
        }

        // Reset the array.
        this._transitions.length = 0;

        // Show it's no longer active.
        this.isTransitioning = false;
    };

    Shuffle.prototype._removeTransitionReference = function(ref) {
        var indexInArray = $.inArray(ref, this._transitions);
        if (indexInArray > -1) {
            this._transitions.splice(indexInArray, 1);
        }
    };


    /**
     * Apply styles without a transition.
     * @param {Object} opts Transitions options object.
     * @private
     */
    Shuffle.prototype._styleImmediately = function( opts ) {
        Shuffle._skipTransition(opts.$item[0], function() {
            opts.$item.css( this._getStylesForTransition( opts ) );
        }, this);
    };

    Shuffle.prototype._movementFinished = function() {
        this.isTransitioning = false;
        this._layoutEnd();
    };

    Shuffle.prototype._layoutEnd = function() {
        this._fire( Shuffle.EventType.LAYOUT );
    };

    Shuffle.prototype._addItems = function( $newItems, addToEnd, isSequential ) {
        // Add classes and set initial positions.
        this._initItems( $newItems );

        // Add transition to each item.
        this._setTransitions( $newItems );

        // Update the list of
        this.$items = this._getItems();

        // Shrink all items (without transitions).
        this._shrink( $newItems );
        each(this.styleQueue, function( transitionObj ) {
            transitionObj.skipTransition = true;
        });

        // Apply shrink positions, but do not cause a layout event.
        this._processStyleQueue( true );

        if ( addToEnd ) {
            this._addItemsToEnd( $newItems, isSequential );
        } else {
            this.shuffle( this.lastFilter );
        }
    };


    Shuffle.prototype._addItemsToEnd = function( $newItems, isSequential ) {
        // Get ones that passed the current filter
        var $passed = this._filter( null, $newItems );
        var passed = $passed.get();

        // How many filtered elements?
        this._updateItemCount();

        this._layout( passed, true );

        if ( isSequential && this.supported ) {
            this._setSequentialDelay( passed );
        }

        this._revealAppended( passed );
    };


    /**
     * Triggers appended elements to fade in.
     * @param {ArrayLike.<Element>} $newFilteredItems Collection of elements.
     * @private
     */
    Shuffle.prototype._revealAppended = function( newFilteredItems ) {
        defer(function() {
            each(newFilteredItems, function( el ) {
                var $item = $( el );
                this._transition({
                    $item: $item,
                    opacity: 1,
                    point: $item.data('point'),
                    scale: DEFAULT_SCALE
                });
            }, this);

            this._whenCollectionDone($(newFilteredItems), TRANSITIONEND, function() {
                $(newFilteredItems).css( TRANSITION_DELAY, '0ms' );
                this._movementFinished();
            });
        }, this, this.revealAppendedDelay);
    };


    /**
     * Execute a function when an event has been triggered for every item in a collection.
     * @param {jQuery} $collection Collection of elements.
     * @param {string} eventName Event to listen for.
     * @param {Function} callback Callback to execute when they're done.
     * @private
     */
    Shuffle.prototype._whenCollectionDone = function( $collection, eventName, callback ) {
        var done = 0;
        var items = $collection.length;
        var self = this;

        function handleEventName( evt ) {
            if ( evt.target === evt.currentTarget ) {
                $( evt.target ).off( eventName, handleEventName );
                done++;

                // Execute callback if all items have emitted the correct event.
                if ( done === items ) {
                    self._removeTransitionReference(reference);
                    callback.call( self );
                }
            }
        }

        var reference = {
            $element: $collection,
            handler: handleEventName
        };

        // Bind the event to all items.
        $collection.on( eventName, handleEventName );

        // Keep track of transitionend events so they can be removed.
        this._transitions.push(reference);
    };


    /**
     * Execute a callback after jQuery `animate` for a collection has finished.
     * @param {Function} callback Callback to execute when they're done.
     * @private
     */
    Shuffle.prototype._whenAnimationsDone = function( callback ) {
        $.when.apply( null, this._animations ).always( $.proxy( function() {
            this._animations.length = 0;
            if (!this._isMovementCanceled) {
                callback.call( this );
            }
        }, this ));
    };


    /**
     * Public Methods
     */

    /**
     * The magic. This is what makes the plugin 'shuffle'
     * @param {string|Function} [category] Category to filter by. Can be a function
     * @param {Object} [sortObj] A sort object which can sort the filtered set
     */
    Shuffle.prototype.shuffle = function( category, sortObj ) {
        if ( !this.enabled ) {
            return;
        }

        if ( !category ) {
            category = ALL_ITEMS;
        }

        this._filter( category );

        // How many filtered elements?
        this._updateItemCount();

        // Shrink each concealed item
        this._shrink();

        // Update transforms on .filtered elements so they will animate to their new positions
        this.sort( sortObj );
    };


    /**
     * Gets the .filtered elements, sorts them, and passes them to layout.
     * @param {Object} opts the options object for the sorted plugin
     */
    Shuffle.prototype.sort = function( opts ) {
        if ( this.enabled ) {
            this._resetCols();

            var sortOptions = opts || this.lastSort;
            var items = this._getFilteredItems().sorted( sortOptions );

            this._layout( items );

            this.lastSort = sortOptions;
        }
    };


    /**
     * Reposition everything.
     * @param {boolean} isOnlyLayout If true, column and gutter widths won't be
     *     recalculated.
     */
    Shuffle.prototype.update = function( isOnlyLayout ) {
        if ( this.enabled ) {

            if ( !isOnlyLayout ) {
                // Get updated colCount
                this._setColumns();
            }

            // Layout items
            this.sort();
        }
    };


    /**
     * Use this instead of `update()` if you don't need the columns and gutters updated
     * Maybe an image inside `shuffle` loaded (and now has a height), which means calculations
     * could be off.
     */
    Shuffle.prototype.layout = function() {
        this.update( true );
    };


    /**
     * New items have been appended to shuffle. Fade them in sequentially
     * @param {jQuery} $newItems jQuery collection of new items
     * @param {boolean} [addToEnd=false] If true, new items will be added to the end / bottom
     *     of the items. If not true, items will be mixed in with the current sort order.
     * @param {boolean} [isSequential=true] If false, new items won't sequentially fade in
     */
    Shuffle.prototype.appended = function( $newItems, addToEnd, isSequential ) {
        this._addItems( $newItems, addToEnd === true, isSequential !== false );
    };


    /**
     * Disables shuffle from updating dimensions and layout on resize
     */
    Shuffle.prototype.disable = function() {
        this.enabled = false;
    };


    /**
     * Enables shuffle again
     * @param {boolean} [isUpdateLayout=true] if undefined, shuffle will update columns and gutters
     */
    Shuffle.prototype.enable = function( isUpdateLayout ) {
        this.enabled = true;
        if ( isUpdateLayout !== false ) {
            this.update();
        }
    };


    /**
     * Remove 1 or more shuffle items
     * @param {jQuery} $collection A jQuery object containing one or more element in shuffle
     * @return {Shuffle} The shuffle object
     */
    Shuffle.prototype.remove = function( $collection ) {

        // If this isn't a jquery object, exit
        if ( !$collection.length || !$collection.jquery ) {
            return;
        }

        function handleRemoved() {
            // Remove the collection in the callback
            $collection.remove();

            // Update things now that elements have been removed.
            this.$items = this._getItems();
            this._updateItemCount();

            this._fire( Shuffle.EventType.REMOVED, [ $collection, this ] );

            // Let it get garbage collected
            $collection = null;
        }

        // Hide collection first.
        this._toggleFilterClasses( $(), $collection );
        this._shrink( $collection );

        this.sort();

        this.$el.one( Shuffle.EventType.LAYOUT + '.' + SHUFFLE, $.proxy( handleRemoved, this ) );
    };


    /**
     * Destroys shuffle, removes events, styles, and classes
     */
    Shuffle.prototype.destroy = function() {
        // If there is more than one shuffle instance on the page,
        // removing the resize handler from the window would remove them
        // all. This is why a unique value is needed.
        $window.off('.' + this.unique);

        // Reset container styles
        this.$el
            .removeClass( SHUFFLE )
            .removeAttr('style')
            .removeData( SHUFFLE );

        // Reset individual item styles
        this.$items
            .removeAttr('style')
            .removeData('point')
            .removeData('scale')
            .removeClass([
                Shuffle.ClassName.CONCEALED,
                Shuffle.ClassName.FILTERED,
                Shuffle.ClassName.SHUFFLE_ITEM
            ].join(' '));

        // Null DOM references
        this.$items = null;
        this.$el = null;
        this.sizer = null;
        this.element = null;
        this._transitions = null;

        // Set a flag so if a debounced resize has been triggered,
        // it can first check if it is actually destroyed and not doing anything
        this.destroyed = true;
    };


// Plugin definition
    $.fn.shuffle = function( opts ) {
        var args = Array.prototype.slice.call( arguments, 1 );
        return this.each(function() {
            var $this = $( this );
            var shuffle = $this.data( SHUFFLE );

            // If we don't have a stored shuffle, make a new one and save it
            if ( !shuffle ) {
                shuffle = new Shuffle( this, opts );
                $this.data( SHUFFLE, shuffle );
            } else if ( typeof opts === 'string' && shuffle[ opts ] ) {
                shuffle[ opts ].apply( shuffle, args );
            }
        });
    };


// http://stackoverflow.com/a/962890/373422
    function randomize( array ) {
        var tmp, current;
        var top = array.length;

        if ( !top ) {
            return array;
        }

        while ( --top ) {
            current = Math.floor( Math.random() * (top + 1) );
            tmp = array[ current ];
            array[ current ] = array[ top ];
            array[ top ] = tmp;
        }

        return array;
    }


// You can return `undefined` from the `by` function to revert to DOM order
// This plugin does NOT return a jQuery object. It returns a plain array because
// jQuery sorts everything in DOM order.
    $.fn.sorted = function(options) {
        var opts = $.extend({}, $.fn.sorted.defaults, options);
        var arr = this.get();
        var revert = false;

        if ( !arr.length ) {
            return [];
        }

        if ( opts.randomize ) {
            return randomize( arr );
        }

        // Sort the elements by the opts.by function.
        // If we don't have opts.by, default to DOM order
        if ( $.isFunction( opts.by ) ) {
            arr.sort(function(a, b) {

                // Exit early if we already know we want to revert
                if ( revert ) {
                    return 0;
                }

                var valA = opts.by($(a));
                var valB = opts.by($(b));

                // If both values are undefined, use the DOM order
                if ( valA === undefined && valB === undefined ) {
                    revert = true;
                    return 0;
                }

                if ( valA < valB || valA === 'sortFirst' || valB === 'sortLast' ) {
                    return -1;
                }

                if ( valA > valB || valA === 'sortLast' || valB === 'sortFirst' ) {
                    return 1;
                }

                return 0;
            });
        }

        // Revert to the original array if necessary
        if ( revert ) {
            return this.get();
        }

        if ( opts.reverse ) {
            arr.reverse();
        }

        return arr;
    };


    $.fn.sorted.defaults = {
        reverse: false, // Use array.reverse() to reverse the results
        by: null, // Sorting function
        randomize: false // If true, this will skip the sorting and return a randomized order in the array
    };

    return Shuffle;

});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzaHVmZmxlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogU2h1ZmZsZS5qcyBieSBAVmVzdHJpZGVcbiAqIENhdGVnb3JpemUsIHNvcnQsIGFuZCBmaWx0ZXIgYSByZXNwb25zaXZlIGdyaWQgb2YgaXRlbXMuXG4gKiBEZXBlbmRlbmNpZXM6IGpRdWVyeSAxLjkrLCBNb2Rlcm5penIgMi42LjIrXG4gKiBAbGljZW5zZSBNSVQgbGljZW5zZVxuICogQHZlcnNpb24gMy4xLjFcbiAqL1xuKGZ1bmN0aW9uIChmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWydqcXVlcnknLCAnbW9kZXJuaXpyJ10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSwgd2luZG93Lk1vZGVybml6cik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93LlNodWZmbGUgPSBmYWN0b3J5KHdpbmRvdy5qUXVlcnksIHdpbmRvdy5Nb2Rlcm5penIpO1xuICAgIH1cbn0pKGZ1bmN0aW9uKCQsIE1vZGVybml6ciwgdW5kZWZpbmVkKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cblxuLy8gVmFsaWRhdGUgTW9kZXJuaXpyIGV4aXN0cy5cbi8vIFNodWZmbGUgcmVxdWlyZXMgYGNzc3RyYW5zaXRpb25zYCwgYGNzc3RyYW5zZm9ybXNgLCBgY3NzdHJhbnNmb3JtczNkYCxcbi8vIGFuZCBgcHJlZml4ZWRgIHRvIGV4aXN0IG9uIHRoZSBNb2Rlcm5penIgb2JqZWN0LlxuICAgIGlmICh0eXBlb2YgTW9kZXJuaXpyICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NodWZmbGUuanMgcmVxdWlyZXMgTW9kZXJuaXpyLlxcbicgK1xuICAgICAgICAgICAgJ2h0dHA6Ly92ZXN0cmlkZS5naXRodWIuaW8vU2h1ZmZsZS8jZGVwZW5kZW5jaWVzJyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGNzcyBwcmVmaXhlZCBwcm9wZXJ0aWVzIGxpa2UgYC13ZWJraXQtdHJhbnNpdGlvbmAgb3IgYGJveC1zaXppbmdgXG4gICAgICogZnJvbSBgdHJhbnNpdGlvbmAgb3IgYGJveFNpemluZ2AsIHJlc3BlY3RpdmVseS5cbiAgICAgKiBAcGFyYW0geyhzdHJpbmd8Ym9vbGVhbil9IHByb3AgUHJvcGVydHkgdG8gYmUgcHJlZml4ZWQuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgcHJlZml4ZWQgY3NzIHByb3BlcnR5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGRhc2hpZnkoIHByb3AgKSB7XG4gICAgICAgIGlmICghcHJvcCkge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVwbGFjZSB1cHBlciBjYXNlIHdpdGggZGFzaC1sb3dlcmNhc2UsXG4gICAgICAgIC8vIHRoZW4gZml4IG1zLSBwcmVmaXhlcyBiZWNhdXNlIHRoZXkncmUgbm90IGNhcGl0YWxpemVkLlxuICAgICAgICByZXR1cm4gcHJvcC5yZXBsYWNlKC8oW0EtWl0pL2csIGZ1bmN0aW9uKCBzdHIsIG0xICkge1xuICAgICAgICAgICAgcmV0dXJuICctJyArIG0xLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0pLnJlcGxhY2UoL15tcy0vLCctbXMtJyk7XG4gICAgfVxuXG4vLyBDb25zdGFudCwgcHJlZml4ZWQgdmFyaWFibGVzLlxuICAgIHZhciBUUkFOU0lUSU9OID0gTW9kZXJuaXpyLnByZWZpeGVkKCd0cmFuc2l0aW9uJyk7XG4gICAgdmFyIFRSQU5TSVRJT05fREVMQVkgPSBNb2Rlcm5penIucHJlZml4ZWQoJ3RyYW5zaXRpb25EZWxheScpO1xuICAgIHZhciBUUkFOU0lUSU9OX0RVUkFUSU9OID0gTW9kZXJuaXpyLnByZWZpeGVkKCd0cmFuc2l0aW9uRHVyYXRpb24nKTtcblxuLy8gTm90ZShnbGVuKTogU3RvY2sgQW5kcm9pZCA0LjEueCBicm93c2VyIHdpbGwgZmFpbCBoZXJlIGJlY2F1c2UgaXQgd3JvbmdseVxuLy8gc2F5cyBpdCBzdXBwb3J0cyBub24tcHJlZml4ZWQgdHJhbnNpdGlvbnMuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvODk3XG4gICAgdmFyIFRSQU5TSVRJT05FTkQgPSB7XG4gICAgICAgICdXZWJraXRUcmFuc2l0aW9uJyA6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgJ3RyYW5zaXRpb24nIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgfVsgVFJBTlNJVElPTiBdO1xuXG4gICAgdmFyIFRSQU5TRk9STSA9IE1vZGVybml6ci5wcmVmaXhlZCgndHJhbnNmb3JtJyk7XG4gICAgdmFyIENTU19UUkFOU0ZPUk0gPSBkYXNoaWZ5KFRSQU5TRk9STSk7XG5cbi8vIENvbnN0YW50c1xuICAgIHZhciBDQU5fVFJBTlNJVElPTl9UUkFOU0ZPUk1TID0gTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMgJiYgTW9kZXJuaXpyLmNzc3RyYW5zaXRpb25zO1xuICAgIHZhciBIQVNfVFJBTlNGT1JNU18zRCA9IE1vZGVybml6ci5jc3N0cmFuc2Zvcm1zM2Q7XG4gICAgdmFyIEhBU19DT01QVVRFRF9TVFlMRSA9ICEhd2luZG93LmdldENvbXB1dGVkU3R5bGU7XG4gICAgdmFyIFNIVUZGTEUgPSAnc2h1ZmZsZSc7XG5cbi8vIENvbmZpZ3VyYWJsZS4gWW91IGNhbiBjaGFuZ2UgdGhlc2UgY29uc3RhbnRzIHRvIGZpdCB5b3VyIGFwcGxpY2F0aW9uLlxuLy8gVGhlIGRlZmF1bHQgc2NhbGUgYW5kIGNvbmNlYWxlZCBzY2FsZSwgaG93ZXZlciwgaGF2ZSB0byBiZSBkaWZmZXJlbnQgdmFsdWVzLlxuICAgIHZhciBBTExfSVRFTVMgPSAnYWxsJztcbiAgICB2YXIgRklMVEVSX0FUVFJJQlVURV9LRVkgPSAnZ3JvdXBzJztcbiAgICB2YXIgREVGQVVMVF9TQ0FMRSA9IDE7XG4gICAgdmFyIENPTkNFQUxFRF9TQ0FMRSA9IDAuMDAxO1xuXG4vLyBVbmRlcnNjb3JlJ3MgdGhyb3R0bGUgZnVuY3Rpb24uXG4gICAgZnVuY3Rpb24gdGhyb3R0bGUoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgICAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgICAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiAkLm5vdygpO1xuICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgbm93ID0gJC5ub3coKTtcbiAgICAgICAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IHt9KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVmZXIoZm4sIGNvbnRleHQsIHdhaXQpIHtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoICQucHJveHkoIGZuLCBjb250ZXh0ICksIHdhaXQgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheU1heCggYXJyYXkgKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseSggTWF0aCwgYXJyYXkgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheU1pbiggYXJyYXkgKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbi5hcHBseSggTWF0aCwgYXJyYXkgKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEFsd2F5cyByZXR1cm5zIGEgbnVtZXJpYyB2YWx1ZSwgZ2l2ZW4gYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFBvc3NpYmx5IG51bWVyaWMgdmFsdWUuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBgdmFsdWVgIG9yIHplcm8gaWYgYHZhbHVlYCBpc24ndCBudW1lcmljLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0TnVtYmVyKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiAkLmlzTnVtZXJpYyh2YWx1ZSkgPyB2YWx1ZSA6IDA7XG4gICAgfVxuXG4gICAgdmFyIGdldFN0eWxlcyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlIHx8IGZ1bmN0aW9uKCkge307XG5cbiAgICAvKipcbiAgICAgKiBSZXByZXNlbnRzIGEgY29vcmRpbmF0ZSBwYWlyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeD0wXSBYLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbeT0wXSBZLlxuICAgICAqL1xuICAgIHZhciBQb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgdGhpcy54ID0gZ2V0TnVtYmVyKCB4ICk7XG4gICAgICAgIHRoaXMueSA9IGdldE51bWJlciggeSApO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgdHdvIHBvaW50cyBhcmUgZXF1YWwuXG4gICAgICogQHBhcmFtIHtQb2ludH0gYSBQb2ludCBBLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IGIgUG9pbnQgQi5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIFBvaW50LmVxdWFscyA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEueCA9PT0gYi54ICYmIGEueSA9PT0gYi55O1xuICAgIH07XG5cbiAgICB2YXIgQ09NUFVURURfU0laRV9JTkNMVURFU19QQURESU5HID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIUhBU19DT01QVVRFRF9TVFlMRSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHBhcmVudCA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICB2YXIgZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MTBweDtwYWRkaW5nOjJweDsnICtcbiAgICAgICAgICAgICctd2Via2l0LWJveC1zaXppbmc6Ym9yZGVyLWJveDtib3gtc2l6aW5nOmJvcmRlci1ib3g7JztcbiAgICAgICAgcGFyZW50LmFwcGVuZENoaWxkKGUpO1xuXG4gICAgICAgIHZhciB3aWR0aCA9IGdldFN0eWxlcyhlLCBudWxsKS53aWR0aDtcbiAgICAgICAgdmFyIHJldCA9IHdpZHRoID09PSAnMTBweCc7XG5cbiAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGUpO1xuXG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfSgpKTtcblxuXG4vLyBVc2VkIGZvciB1bmlxdWUgaW5zdGFuY2UgdmFyaWFibGVzXG4gICAgdmFyIGlkID0gMDtcbiAgICB2YXIgJHdpbmRvdyA9ICQoIHdpbmRvdyApO1xuXG5cbiAgICAvKipcbiAgICAgKiBDYXRlZ29yaXplLCBzb3J0LCBhbmQgZmlsdGVyIGEgcmVzcG9uc2l2ZSBncmlkIG9mIGl0ZW1zLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IEFuIGVsZW1lbnQgd2hpY2ggaXMgdGhlIHBhcmVudCBjb250YWluZXIgZm9yIHRoZSBncmlkIGl0ZW1zLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz1TaHVmZmxlLm9wdGlvbnNdIE9wdGlvbnMgb2JqZWN0LlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIHZhciBTaHVmZmxlID0gZnVuY3Rpb24oIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAkLmV4dGVuZCggdGhpcywgU2h1ZmZsZS5vcHRpb25zLCBvcHRpb25zLCBTaHVmZmxlLnNldHRpbmdzICk7XG5cbiAgICAgICAgdGhpcy4kZWwgPSAkKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnVuaXF1ZSA9ICdzaHVmZmxlXycgKyBpZCsrO1xuXG4gICAgICAgIHRoaXMuX2ZpcmUoIFNodWZmbGUuRXZlbnRUeXBlLkxPQURJTkcgKTtcbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIC8vIERpc3BhdGNoIHRoZSBkb25lIGV2ZW50IGFzeW5jaHJvbm91c2x5IHNvIHRoYXQgcGVvcGxlIGNhbiBiaW5kIHRvIGl0IGFmdGVyXG4gICAgICAgIC8vIFNodWZmbGUgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXG4gICAgICAgIGRlZmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9maXJlKCBTaHVmZmxlLkV2ZW50VHlwZS5ET05FICk7XG4gICAgICAgIH0sIHRoaXMsIDE2KTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBFdmVudHMgdGhlIGNvbnRhaW5lciBlbGVtZW50IGVtaXRzIHdpdGggdGhlIC5zaHVmZmxlIG5hbWVzcGFjZS5cbiAgICAgKiBGb3IgZXhhbXBsZSwgXCJkb25lLnNodWZmbGVcIi5cbiAgICAgKiBAZW51bSB7c3RyaW5nfVxuICAgICAqL1xuICAgIFNodWZmbGUuRXZlbnRUeXBlID0ge1xuICAgICAgICBMT0FESU5HOiAnbG9hZGluZycsXG4gICAgICAgIERPTkU6ICdkb25lJyxcbiAgICAgICAgTEFZT1VUOiAnbGF5b3V0JyxcbiAgICAgICAgUkVNT1ZFRDogJ3JlbW92ZWQnXG4gICAgfTtcblxuXG4gICAgLyoqIEBlbnVtIHtzdHJpbmd9ICovXG4gICAgU2h1ZmZsZS5DbGFzc05hbWUgPSB7XG4gICAgICAgIEJBU0U6IFNIVUZGTEUsXG4gICAgICAgIFNIVUZGTEVfSVRFTTogJ3NodWZmbGUtaXRlbScsXG4gICAgICAgIEZJTFRFUkVEOiAnZmlsdGVyZWQnLFxuICAgICAgICBDT05DRUFMRUQ6ICdjb25jZWFsZWQnXG4gICAgfTtcblxuXG4vLyBPdmVycmlkZWFibGUgb3B0aW9uc1xuICAgIFNodWZmbGUub3B0aW9ucyA9IHtcbiAgICAgICAgZ3JvdXA6IEFMTF9JVEVNUywgLy8gSW5pdGlhbCBmaWx0ZXIgZ3JvdXAuXG4gICAgICAgIHNwZWVkOiAyNTAsIC8vIFRyYW5zaXRpb24vYW5pbWF0aW9uIHNwZWVkIChtaWxsaXNlY29uZHMpLlxuICAgICAgICBlYXNpbmc6ICdlYXNlLW91dCcsIC8vIENTUyBlYXNpbmcgZnVuY3Rpb24gdG8gdXNlLlxuICAgICAgICBpdGVtU2VsZWN0b3I6ICcnLCAvLyBlLmcuICcucGljdHVyZS1pdGVtJy5cbiAgICAgICAgc2l6ZXI6IG51bGwsIC8vIFNpemVyIGVsZW1lbnQuIFVzZSBhbiBlbGVtZW50IHRvIGRldGVybWluZSB0aGUgc2l6ZSBvZiBjb2x1bW5zIGFuZCBndXR0ZXJzLlxuICAgICAgICBndXR0ZXJXaWR0aDogMCwgLy8gQSBzdGF0aWMgbnVtYmVyIG9yIGZ1bmN0aW9uIHRoYXQgdGVsbHMgdGhlIHBsdWdpbiBob3cgd2lkZSB0aGUgZ3V0dGVycyBiZXR3ZWVuIGNvbHVtbnMgYXJlIChpbiBwaXhlbHMpLlxuICAgICAgICBjb2x1bW5XaWR0aDogMCwgLy8gQSBzdGF0aWMgbnVtYmVyIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIG51bWJlciB3aGljaCB0ZWxscyB0aGUgcGx1Z2luIGhvdyB3aWRlIHRoZSBjb2x1bW5zIGFyZSAoaW4gcGl4ZWxzKS5cbiAgICAgICAgZGVsaW1ldGVyOiBudWxsLCAvLyBJZiB5b3VyIGdyb3VwIGlzIG5vdCBqc29uLCBhbmQgaXMgY29tbWEgZGVsaW1ldGVkLCB5b3UgY291bGQgc2V0IGRlbGltZXRlciB0byAnLCcuXG4gICAgICAgIGJ1ZmZlcjogMCwgLy8gVXNlZnVsIGZvciBwZXJjZW50YWdlIGJhc2VkIGhlaWdodHMgd2hlbiB0aGV5IG1pZ2h0IG5vdCBhbHdheXMgYmUgZXhhY3RseSB0aGUgc2FtZSAoaW4gcGl4ZWxzKS5cbiAgICAgICAgY29sdW1uVGhyZXNob2xkOiBIQVNfQ09NUFVURURfU1RZTEUgPyAwLjAxIDogMC4xLCAvLyBSZWFkaW5nIHRoZSB3aWR0aCBvZiBlbGVtZW50cyBpc24ndCBwcmVjaXNlIGVub3VnaCBhbmQgY2FuIGNhdXNlIGNvbHVtbnMgdG8ganVtcCBiZXR3ZWVuIHZhbHVlcy5cbiAgICAgICAgaW5pdGlhbFNvcnQ6IG51bGwsIC8vIFNodWZmbGUgY2FuIGJlIGluaXRpYWxpemVkIHdpdGggYSBzb3J0IG9iamVjdC4gSXQgaXMgdGhlIHNhbWUgb2JqZWN0IGdpdmVuIHRvIHRoZSBzb3J0IG1ldGhvZC5cbiAgICAgICAgdGhyb3R0bGU6IHRocm90dGxlLCAvLyBCeSBkZWZhdWx0LCBzaHVmZmxlIHdpbGwgdGhyb3R0bGUgcmVzaXplIGV2ZW50cy4gVGhpcyBjYW4gYmUgY2hhbmdlZCBvciByZW1vdmVkLlxuICAgICAgICB0aHJvdHRsZVRpbWU6IDMwMCwgLy8gSG93IG9mdGVuIHNodWZmbGUgY2FuIGJlIGNhbGxlZCBvbiByZXNpemUgKGluIG1pbGxpc2Vjb25kcykuXG4gICAgICAgIHNlcXVlbnRpYWxGYWRlRGVsYXk6IDE1MCwgLy8gRGVsYXkgYmV0d2VlbiBlYWNoIGl0ZW0gdGhhdCBmYWRlcyBpbiB3aGVuIGFkZGluZyBpdGVtcy5cbiAgICAgICAgc3VwcG9ydGVkOiBDQU5fVFJBTlNJVElPTl9UUkFOU0ZPUk1TIC8vIFdoZXRoZXIgdG8gdXNlIHRyYW5zZm9ybXMgb3IgYWJzb2x1dGUgcG9zaXRpb25pbmcuXG4gICAgfTtcblxuXG4vLyBOb3Qgb3ZlcnJpZGVhYmxlXG4gICAgU2h1ZmZsZS5zZXR0aW5ncyA9IHtcbiAgICAgICAgdXNlU2l6ZXI6IGZhbHNlLFxuICAgICAgICBpdGVtQ3NzIDogeyAvLyBkZWZhdWx0IENTUyBmb3IgZWFjaCBpdGVtXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICB2aXNpYmlsaXR5OiAndmlzaWJsZSdcbiAgICAgICAgfSxcbiAgICAgICAgcmV2ZWFsQXBwZW5kZWREZWxheTogMzAwLFxuICAgICAgICBsYXN0U29ydDoge30sXG4gICAgICAgIGxhc3RGaWx0ZXI6IEFMTF9JVEVNUyxcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgZGVzdHJveWVkOiBmYWxzZSxcbiAgICAgICAgaW5pdGlhbGl6ZWQ6IGZhbHNlLFxuICAgICAgICBfYW5pbWF0aW9uczogW10sXG4gICAgICAgIF90cmFuc2l0aW9uczogW10sXG4gICAgICAgIF9pc01vdmVtZW50Q2FuY2VsZWQ6IGZhbHNlLFxuICAgICAgICBzdHlsZVF1ZXVlOiBbXVxuICAgIH07XG5cblxuLy8gRXhwb3NlIGZvciB0ZXN0aW5nLlxuICAgIFNodWZmbGUuUG9pbnQgPSBQb2ludDtcblxuXG4gICAgLyoqXG4gICAgICogU3RhdGljIG1ldGhvZHMuXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgYnJvd3NlciBoYXMgM2QgdHJhbnNmb3JtcyBhdmFpbGFibGUsIGJ1aWxkIGEgc3RyaW5nIHdpdGggdGhvc2UsXG4gICAgICogb3RoZXJ3aXNlIHVzZSAyZCB0cmFuc2Zvcm1zLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IHBvaW50IFggYW5kIFkgcG9zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSBTY2FsZSBhbW91bnQuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBBIG5vcm1hbGl6ZWQgc3RyaW5nIHdoaWNoIGNhbiBiZSB1c2VkIHdpdGggdGhlIHRyYW5zZm9ybSBzdHlsZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUuX2dldEl0ZW1UcmFuc2Zvcm1TdHJpbmcgPSBmdW5jdGlvbihwb2ludCwgc2NhbGUpIHtcbiAgICAgICAgaWYgKCBIQVNfVFJBTlNGT1JNU18zRCApIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlM2QoJyArIHBvaW50LnggKyAncHgsICcgKyBwb2ludC55ICsgJ3B4LCAwKSBzY2FsZTNkKCcgKyBzY2FsZSArICcsICcgKyBzY2FsZSArICcsIDEpJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBwb2ludC54ICsgJ3B4LCAnICsgcG9pbnQueSArICdweCkgc2NhbGUoJyArIHNjYWxlICsgJyknO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGNvbXB1dGVkIHN0eWxlIGZvciBhbiBlbGVtZW50LCBwYXJzZWQgYXMgYSBmbG9hdC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgRWxlbWVudCB0byBnZXQgc3R5bGUgZm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHlsZSBTdHlsZSBwcm9wZXJ0eS5cbiAgICAgKiBAcGFyYW0ge0NTU1N0eWxlRGVjbGFyYXRpb259IFtzdHlsZXNdIE9wdGlvbmFsbHkgaW5jbHVkZSBjbGVhbiBzdHlsZXMgdG9cbiAgICAgKiAgICAgdXNlIGluc3RlYWQgb2YgYXNraW5nIGZvciB0aGVtIGFnYWluLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIHBhcnNlZCBjb21wdXRlZCB2YWx1ZSBvciB6ZXJvIGlmIHRoYXQgZmFpbHMgYmVjYXVzZSBJRVxuICAgICAqICAgICB3aWxsIHJldHVybiAnYXV0bycgd2hlbiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgbWFyZ2lucyBpbnN0ZWFkIG9mXG4gICAgICogICAgIHRoZSBjb21wdXRlZCBzdHlsZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUuX2dldE51bWJlclN0eWxlID0gZnVuY3Rpb24oIGVsZW1lbnQsIHN0eWxlLCBzdHlsZXMgKSB7XG4gICAgICAgIGlmICggSEFTX0NPTVBVVEVEX1NUWUxFICkge1xuICAgICAgICAgICAgc3R5bGVzID0gc3R5bGVzIHx8IGdldFN0eWxlcyggZWxlbWVudCwgbnVsbCApO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gU2h1ZmZsZS5fZ2V0RmxvYXQoIHN0eWxlc1sgc3R5bGUgXSApO1xuXG4gICAgICAgICAgICAvLyBTdXBwb3J0IElFPD0xMSBhbmQgVzNDIHNwZWMuXG4gICAgICAgICAgICBpZiAoICFDT01QVVRFRF9TSVpFX0lOQ0xVREVTX1BBRERJTkcgJiYgc3R5bGUgPT09ICd3aWR0aCcgKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgKz0gU2h1ZmZsZS5fZ2V0RmxvYXQoIHN0eWxlcy5wYWRkaW5nTGVmdCApICtcbiAgICAgICAgICAgICAgICAgICAgU2h1ZmZsZS5fZ2V0RmxvYXQoIHN0eWxlcy5wYWRkaW5nUmlnaHQgKSArXG4gICAgICAgICAgICAgICAgICAgIFNodWZmbGUuX2dldEZsb2F0KCBzdHlsZXMuYm9yZGVyTGVmdFdpZHRoICkgK1xuICAgICAgICAgICAgICAgICAgICBTaHVmZmxlLl9nZXRGbG9hdCggc3R5bGVzLmJvcmRlclJpZ2h0V2lkdGggKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoICFDT01QVVRFRF9TSVpFX0lOQ0xVREVTX1BBRERJTkcgJiYgc3R5bGUgPT09ICdoZWlnaHQnICkge1xuICAgICAgICAgICAgICAgIHZhbHVlICs9IFNodWZmbGUuX2dldEZsb2F0KCBzdHlsZXMucGFkZGluZ1RvcCApICtcbiAgICAgICAgICAgICAgICAgICAgU2h1ZmZsZS5fZ2V0RmxvYXQoIHN0eWxlcy5wYWRkaW5nQm90dG9tICkgK1xuICAgICAgICAgICAgICAgICAgICBTaHVmZmxlLl9nZXRGbG9hdCggc3R5bGVzLmJvcmRlclRvcFdpZHRoICkgK1xuICAgICAgICAgICAgICAgICAgICBTaHVmZmxlLl9nZXRGbG9hdCggc3R5bGVzLmJvcmRlckJvdHRvbVdpZHRoICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBTaHVmZmxlLl9nZXRGbG9hdCggJCggZWxlbWVudCApLmNzcyggc3R5bGUgKSAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFBhcnNlIGEgc3RyaW5nIGFzIGFuIGZsb2F0LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBTdHJpbmcgZmxvYXQuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgc3RyaW5nIGFzIGFuIGZsb2F0IG9yIHplcm8uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLl9nZXRGbG9hdCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBnZXROdW1iZXIoIHBhcnNlRmxvYXQoIHZhbHVlICkgKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBvdXRlciB3aWR0aCBvZiBhbiBlbGVtZW50LCBvcHRpb25hbGx5IGluY2x1ZGluZyBpdHMgbWFyZ2lucy5cbiAgICAgKlxuICAgICAqIFRoZXJlIGFyZSBhIGZldyBkaWZmZXJlbnQgbWV0aG9kcyBmb3IgZ2V0dGluZyB0aGUgd2lkdGggb2YgYW4gZWxlbWVudCwgbm9uZSBvZlxuICAgICAqIHdoaWNoIHdvcmsgcGVyZmVjdGx5IGZvciBhbGwgU2h1ZmZsZSdzIHVzZSBjYXNlcy5cbiAgICAgKlxuICAgICAqIDEuIGdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIGBsZWZ0YCBhbmQgYHJpZ2h0YCBwcm9wZXJ0aWVzLlxuICAgICAqICAgLSBBY2NvdW50cyBmb3IgdHJhbnNmb3JtIHNjYWxlZCBlbGVtZW50cywgbWFraW5nIGl0IHVzZWxlc3MgZm9yIFNodWZmbGVcbiAgICAgKiAgIGVsZW1lbnRzIHdoaWNoIGhhdmUgc2hydW5rLlxuICAgICAqIDIuIFRoZSBgb2Zmc2V0V2lkdGhgIHByb3BlcnR5IChvciBqUXVlcnkncyBDU1MpLlxuICAgICAqICAgLSBUaGlzIHZhbHVlIHN0YXlzIHRoZSBzYW1lIHJlZ2FyZGxlc3Mgb2YgdGhlIGVsZW1lbnRzIHRyYW5zZm9ybSBwcm9wZXJ0eSxcbiAgICAgKiAgIGhvd2V2ZXIsIGl0IGRvZXMgbm90IHJldHVybiBzdWJwaXhlbCB2YWx1ZXMuXG4gICAgICogMy4gZ2V0Q29tcHV0ZWRTdHlsZSgpXG4gICAgICogICAtIFRoaXMgd29ya3MgZ3JlYXQgQ2hyb21lLCBGaXJlZm94LCBTYWZhcmksIGJ1dCBJRTw9MTEgZG9lcyBub3QgaW5jbHVkZVxuICAgICAqICAgcGFkZGluZyBhbmQgYm9yZGVyIHdoZW4gYm94LXNpemluZzogYm9yZGVyLWJveCBpcyBzZXQsIHJlcXVpcmluZyBhIGZlYXR1cmVcbiAgICAgKiAgIHRlc3QgYW5kIGV4dHJhIHdvcmsgdG8gYWRkIHRoZSBwYWRkaW5nIGJhY2sgZm9yIElFIGFuZCBvdGhlciBicm93c2VycyB3aGljaFxuICAgICAqICAgZm9sbG93IHRoZSBXM0Mgc3BlYyBoZXJlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luY2x1ZGVNYXJnaW5zXSBXaGV0aGVyIHRvIGluY2x1ZGUgbWFyZ2lucy4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSB3aWR0aC5cbiAgICAgKi9cbiAgICBTaHVmZmxlLl9nZXRPdXRlcldpZHRoID0gZnVuY3Rpb24oIGVsZW1lbnQsIGluY2x1ZGVNYXJnaW5zICkge1xuICAgICAgICAvLyBTdG9yZSB0aGUgc3R5bGVzIHNvIHRoYXQgdGhleSBjYW4gYmUgdXNlZCBieSBvdGhlcnMgd2l0aG91dCBhc2tpbmcgZm9yIGl0IGFnYWluLlxuICAgICAgICB2YXIgc3R5bGVzID0gZ2V0U3R5bGVzKCBlbGVtZW50LCBudWxsICk7XG4gICAgICAgIHZhciB3aWR0aCA9IFNodWZmbGUuX2dldE51bWJlclN0eWxlKCBlbGVtZW50LCAnd2lkdGgnLCBzdHlsZXMgKTtcblxuICAgICAgICAvLyBVc2UgalF1ZXJ5IGhlcmUgYmVjYXVzZSBpdCB1c2VzIGdldENvbXB1dGVkU3R5bGUgaW50ZXJuYWxseSBhbmQgaXNcbiAgICAgICAgLy8gY3Jvc3MtYnJvd3Nlci4gVXNpbmcgdGhlIHN0eWxlIHByb3BlcnR5IG9mIHRoZSBlbGVtZW50IHdpbGwgb25seSB3b3JrXG4gICAgICAgIC8vIGlmIHRoZXJlIGFyZSBpbmxpbmUgc3R5bGVzLlxuICAgICAgICBpZiAoIGluY2x1ZGVNYXJnaW5zICkge1xuICAgICAgICAgICAgdmFyIG1hcmdpbkxlZnQgPSBTaHVmZmxlLl9nZXROdW1iZXJTdHlsZSggZWxlbWVudCwgJ21hcmdpbkxlZnQnLCBzdHlsZXMgKTtcbiAgICAgICAgICAgIHZhciBtYXJnaW5SaWdodCA9IFNodWZmbGUuX2dldE51bWJlclN0eWxlKCBlbGVtZW50LCAnbWFyZ2luUmlnaHQnLCBzdHlsZXMgKTtcbiAgICAgICAgICAgIHdpZHRoICs9IG1hcmdpbkxlZnQgKyBtYXJnaW5SaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aWR0aDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBvdXRlciBoZWlnaHQgb2YgYW4gZWxlbWVudCwgb3B0aW9uYWxseSBpbmNsdWRpbmcgaXRzIG1hcmdpbnMuXG4gICAgICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luY2x1ZGVNYXJnaW5zXSBXaGV0aGVyIHRvIGluY2x1ZGUgbWFyZ2lucy4gRGVmYXVsdCBpcyBmYWxzZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IFRoZSBoZWlnaHQuXG4gICAgICovXG4gICAgU2h1ZmZsZS5fZ2V0T3V0ZXJIZWlnaHQgPSBmdW5jdGlvbiggZWxlbWVudCwgaW5jbHVkZU1hcmdpbnMgKSB7XG4gICAgICAgIHZhciBzdHlsZXMgPSBnZXRTdHlsZXMoIGVsZW1lbnQsIG51bGwgKTtcbiAgICAgICAgdmFyIGhlaWdodCA9IFNodWZmbGUuX2dldE51bWJlclN0eWxlKCBlbGVtZW50LCAnaGVpZ2h0Jywgc3R5bGVzICk7XG5cbiAgICAgICAgaWYgKCBpbmNsdWRlTWFyZ2lucyApIHtcbiAgICAgICAgICAgIHZhciBtYXJnaW5Ub3AgPSBTaHVmZmxlLl9nZXROdW1iZXJTdHlsZSggZWxlbWVudCwgJ21hcmdpblRvcCcsIHN0eWxlcyApO1xuICAgICAgICAgICAgdmFyIG1hcmdpbkJvdHRvbSA9IFNodWZmbGUuX2dldE51bWJlclN0eWxlKCBlbGVtZW50LCAnbWFyZ2luQm90dG9tJywgc3R5bGVzICk7XG4gICAgICAgICAgICBoZWlnaHQgKz0gbWFyZ2luVG9wICsgbWFyZ2luQm90dG9tO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGhlaWdodDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBDaGFuZ2UgYSBwcm9wZXJ0eSBvciBleGVjdXRlIGEgZnVuY3Rpb24gd2hpY2ggd2lsbCBub3QgaGF2ZSBhIHRyYW5zaXRpb25cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgRE9NIGVsZW1lbnQgdGhhdCB3b24ndCBiZSB0cmFuc2l0aW9uZWRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdoaWxlIHRyYW5zaXRpb25cbiAgICAgKiAgICAgaXMgc2V0IHRvIDBtcy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdIE9wdGlvbmFsIGNvbnRleHQgZm9yIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUuX3NraXBUcmFuc2l0aW9uID0gZnVuY3Rpb24oIGVsZW1lbnQsIGNhbGxiYWNrLCBjb250ZXh0ICkge1xuICAgICAgICB2YXIgZHVyYXRpb24gPSBlbGVtZW50LnN0eWxlWyBUUkFOU0lUSU9OX0RVUkFUSU9OIF07XG5cbiAgICAgICAgLy8gU2V0IHRoZSBkdXJhdGlvbiB0byB6ZXJvIHNvIGl0IGhhcHBlbnMgaW1tZWRpYXRlbHlcbiAgICAgICAgZWxlbWVudC5zdHlsZVsgVFJBTlNJVElPTl9EVVJBVElPTiBdID0gJzBtcyc7IC8vIG1zIG5lZWRlZCBmb3IgZmlyZWZveCFcblxuICAgICAgICBjYWxsYmFjay5jYWxsKCBjb250ZXh0ICk7XG5cbiAgICAgICAgLy8gRm9yY2UgcmVmbG93XG4gICAgICAgIHZhciByZWZsb3cgPSBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAvLyBBdm9pZCBqc2hpbnQgd2FybmluZ3M6IHVudXNlZCB2YXJpYWJsZXMgYW5kIGV4cHJlc3Npb25zLlxuICAgICAgICByZWZsb3cgPSBudWxsO1xuXG4gICAgICAgIC8vIFB1dCB0aGUgZHVyYXRpb24gYmFja1xuICAgICAgICBlbGVtZW50LnN0eWxlWyBUUkFOU0lUSU9OX0RVUkFUSU9OIF0gPSBkdXJhdGlvbjtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBJbnN0YW5jZSBtZXRob2RzLlxuICAgICAqL1xuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kaXRlbXMgPSB0aGlzLl9nZXRJdGVtcygpO1xuXG4gICAgICAgIHRoaXMuc2l6ZXIgPSB0aGlzLl9nZXRFbGVtZW50T3B0aW9uKCB0aGlzLnNpemVyICk7XG5cbiAgICAgICAgaWYgKCB0aGlzLnNpemVyICkge1xuICAgICAgICAgICAgdGhpcy51c2VTaXplciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgY2xhc3MgYW5kIGludmFsaWRhdGUgc3R5bGVzXG4gICAgICAgIHRoaXMuJGVsLmFkZENsYXNzKCBTaHVmZmxlLkNsYXNzTmFtZS5CQVNFICk7XG5cbiAgICAgICAgLy8gU2V0IGluaXRpYWwgY3NzIGZvciBlYWNoIGl0ZW1cbiAgICAgICAgdGhpcy5faW5pdEl0ZW1zKCk7XG5cbiAgICAgICAgLy8gQmluZCByZXNpemUgZXZlbnRzXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg1Mjc1MS93aW5kb3ctcmVzaXplLWV2ZW50LWZpcmluZy1pbi1pbnRlcm5ldC1leHBsb3JlclxuICAgICAgICAkd2luZG93Lm9uKCdyZXNpemUuJyArIFNIVUZGTEUgKyAnLicgKyB0aGlzLnVuaXF1ZSwgdGhpcy5fZ2V0UmVzaXplRnVuY3Rpb24oKSk7XG5cbiAgICAgICAgLy8gR2V0IGNvbnRhaW5lciBjc3MgYWxsIGluIG9uZSByZXF1ZXN0LiBDYXVzZXMgcmVmbG93XG4gICAgICAgIHZhciBjb250YWluZXJDU1MgPSB0aGlzLiRlbC5jc3MoWydwb3NpdGlvbicsICdvdmVyZmxvdyddKTtcbiAgICAgICAgdmFyIGNvbnRhaW5lcldpZHRoID0gU2h1ZmZsZS5fZ2V0T3V0ZXJXaWR0aCggdGhpcy5lbGVtZW50ICk7XG5cbiAgICAgICAgLy8gQWRkIHN0eWxlcyB0byB0aGUgY29udGFpbmVyIGlmIGl0IGRvZXNuJ3QgaGF2ZSB0aGVtLlxuICAgICAgICB0aGlzLl92YWxpZGF0ZVN0eWxlcyggY29udGFpbmVyQ1NTICk7XG5cbiAgICAgICAgLy8gV2UgYWxyZWFkeSBnb3QgdGhlIGNvbnRhaW5lcidzIHdpZHRoIGFib3ZlLCBubyBuZWVkIHRvIGNhdXNlIGFub3RoZXIgcmVmbG93IGdldHRpbmcgaXQgYWdhaW4uLi5cbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgY29sdW1ucyB0aGVyZSB3aWxsIGJlXG4gICAgICAgIHRoaXMuX3NldENvbHVtbnMoIGNvbnRhaW5lcldpZHRoICk7XG5cbiAgICAgICAgLy8gS2ljayBvZmYhXG4gICAgICAgIHRoaXMuc2h1ZmZsZSggdGhpcy5ncm91cCwgdGhpcy5pbml0aWFsU29ydCApO1xuXG4gICAgICAgIC8vIFRoZSBzaHVmZmxlIGl0ZW1zIGhhdmVuJ3QgaGFkIHRyYW5zaXRpb25zIHNldCBvbiB0aGVtIHlldFxuICAgICAgICAvLyBzbyB0aGUgdXNlciBkb2Vzbid0IHNlZSB0aGUgZmlyc3QgbGF5b3V0LiBTZXQgdGhlbSBub3cgdGhhdCB0aGUgZmlyc3QgbGF5b3V0IGlzIGRvbmUuXG4gICAgICAgIGlmICggdGhpcy5zdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgICBkZWZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRUcmFuc2l0aW9ucygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZVsgVFJBTlNJVElPTiBdID0gJ2hlaWdodCAnICsgdGhpcy5zcGVlZCArICdtcyAnICsgdGhpcy5lYXNpbmc7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB0aHJvdHRsZWQgYW5kIHByb3hpZWQgZnVuY3Rpb24gZm9yIHRoZSByZXNpemUgaGFuZGxlci5cbiAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9nZXRSZXNpemVGdW5jdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzaXplRnVuY3Rpb24gPSAkLnByb3h5KCB0aGlzLl9vblJlc2l6ZSwgdGhpcyApO1xuICAgICAgICByZXR1cm4gdGhpcy50aHJvdHRsZSA/XG4gICAgICAgICAgICB0aGlzLnRocm90dGxlKCByZXNpemVGdW5jdGlvbiwgdGhpcy50aHJvdHRsZVRpbWUgKSA6XG4gICAgICAgICAgICByZXNpemVGdW5jdGlvbjtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhbiBlbGVtZW50IGZyb20gYW4gb3B0aW9uLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfGpRdWVyeXxFbGVtZW50fSBvcHRpb24gVGhlIG9wdGlvbiB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJuIHs/RWxlbWVudH0gVGhlIHBsYWluIGVsZW1lbnQgb3IgbnVsbC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9nZXRFbGVtZW50T3B0aW9uID0gZnVuY3Rpb24oIG9wdGlvbiApIHtcbiAgICAgICAgLy8gSWYgY29sdW1uIHdpZHRoIGlzIGEgc3RyaW5nLCB0cmVhdCBpcyBhcyBhIHNlbGVjdG9yIGFuZCBzZWFyY2ggZm9yIHRoZVxuICAgICAgICAvLyBzaXplciBlbGVtZW50IHdpdGhpbiB0aGUgb3V0ZXJtb3N0IGNvbnRhaW5lclxuICAgICAgICBpZiAoIHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLmZpbmQoIG9wdGlvbiApWzBdIHx8IG51bGw7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGZvciBhbiBlbGVtZW50XG4gICAgICAgIH0gZWxzZSBpZiAoIG9wdGlvbiAmJiBvcHRpb24ubm9kZVR5cGUgJiYgb3B0aW9uLm5vZGVUeXBlID09PSAxICkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbjtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgZm9yIGpRdWVyeSBvYmplY3RcbiAgICAgICAgfSBlbHNlIGlmICggb3B0aW9uICYmIG9wdGlvbi5qcXVlcnkgKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uWzBdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRW5zdXJlcyB0aGUgc2h1ZmZsZSBjb250YWluZXIgaGFzIHRoZSBjc3Mgc3R5bGVzIGl0IG5lZWRzIGFwcGxpZWQgdG8gaXQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0eWxlcyBLZXkgdmFsdWUgcGFpcnMgZm9yIHBvc2l0aW9uIGFuZCBvdmVyZmxvdy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl92YWxpZGF0ZVN0eWxlcyA9IGZ1bmN0aW9uKHN0eWxlcykge1xuICAgICAgICAvLyBQb3NpdGlvbiBjYW5ub3QgYmUgc3RhdGljLlxuICAgICAgICBpZiAoIHN0eWxlcy5wb3NpdGlvbiA9PT0gJ3N0YXRpYycgKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT3ZlcmZsb3cgaGFzIHRvIGJlIGhpZGRlblxuICAgICAgICBpZiAoIHN0eWxlcy5vdmVyZmxvdyAhPT0gJ2hpZGRlbicgKSB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEZpbHRlciB0aGUgZWxlbWVudHMgYnkgYSBjYXRlZ29yeS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gW2NhdGVnb3J5XSBDYXRlZ29yeSB0byBmaWx0ZXIgYnkuIElmIGl0J3MgZ2l2ZW4sIHRoZSBsYXN0XG4gICAgICogICAgIGNhdGVnb3J5IHdpbGwgYmUgdXNlZCB0byBmaWx0ZXIgdGhlIGl0ZW1zLlxuICAgICAqIEBwYXJhbSB7QXJyYXlMaWtlfSBbJGNvbGxlY3Rpb25dIE9wdGlvbmFsbHkgZmlsdGVyIGEgY29sbGVjdGlvbi4gRGVmYXVsdHMgdG9cbiAgICAgKiAgICAgYWxsIHRoZSBpdGVtcy5cbiAgICAgKiBAcmV0dXJuIHtqUXVlcnl9IEZpbHRlcmVkIGl0ZW1zLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2ZpbHRlciA9IGZ1bmN0aW9uKCBjYXRlZ29yeSwgJGNvbGxlY3Rpb24gKSB7XG4gICAgICAgIGNhdGVnb3J5ID0gY2F0ZWdvcnkgfHwgdGhpcy5sYXN0RmlsdGVyO1xuICAgICAgICAkY29sbGVjdGlvbiA9ICRjb2xsZWN0aW9uIHx8IHRoaXMuJGl0ZW1zO1xuXG4gICAgICAgIHZhciBzZXQgPSB0aGlzLl9nZXRGaWx0ZXJlZFNldHMoIGNhdGVnb3J5LCAkY29sbGVjdGlvbiApO1xuXG4gICAgICAgIC8vIEluZGl2aWR1YWxseSBhZGQvcmVtb3ZlIGNvbmNlYWxlZC9maWx0ZXJlZCBjbGFzc2VzXG4gICAgICAgIHRoaXMuX3RvZ2dsZUZpbHRlckNsYXNzZXMoIHNldC5maWx0ZXJlZCwgc2V0LmNvbmNlYWxlZCApO1xuXG4gICAgICAgIC8vIFNhdmUgdGhlIGxhc3QgZmlsdGVyIGluIGNhc2UgZWxlbWVudHMgYXJlIGFwcGVuZGVkLlxuICAgICAgICB0aGlzLmxhc3RGaWx0ZXIgPSBjYXRlZ29yeTtcblxuICAgICAgICAvLyBUaGlzIGlzIHNhdmVkIG1haW5seSBiZWNhdXNlIHByb3ZpZGluZyBhIGZpbHRlciBmdW5jdGlvbiAobGlrZSBzZWFyY2hpbmcpXG4gICAgICAgIC8vIHdpbGwgb3ZlcndyaXRlIHRoZSBgbGFzdEZpbHRlcmAgcHJvcGVydHkgZXZlcnkgdGltZSBpdHMgY2FsbGVkLlxuICAgICAgICBpZiAoIHR5cGVvZiBjYXRlZ29yeSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VwID0gY2F0ZWdvcnk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2V0LmZpbHRlcmVkO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGZpbHRlcmVkIGFuZCBjb25jZWFsZWQgZWxlbWVudHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IGNhdGVnb3J5IENhdGVnb3J5IG9yIGZ1bmN0aW9uIHRvIGZpbHRlciBieS5cbiAgICAgKiBAcGFyYW0ge0FycmF5TGlrZS48RWxlbWVudD59ICRpdGVtcyBBIGNvbGxlY3Rpb24gb2YgaXRlbXMgdG8gZmlsdGVyLlxuICAgICAqIEByZXR1cm4geyF7ZmlsdGVyZWQ6IGpRdWVyeSwgY29uY2VhbGVkOiBqUXVlcnl9fVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2dldEZpbHRlcmVkU2V0cyA9IGZ1bmN0aW9uKCBjYXRlZ29yeSwgJGl0ZW1zICkge1xuICAgICAgICB2YXIgJGZpbHRlcmVkID0gJCgpO1xuICAgICAgICB2YXIgJGNvbmNlYWxlZCA9ICQoKTtcblxuICAgICAgICAvLyBjYXRlZ29yeSA9PT0gJ2FsbCcsIGFkZCBmaWx0ZXJlZCBjbGFzcyB0byBldmVyeXRoaW5nXG4gICAgICAgIGlmICggY2F0ZWdvcnkgPT09IEFMTF9JVEVNUyApIHtcbiAgICAgICAgICAgICRmaWx0ZXJlZCA9ICRpdGVtcztcblxuICAgICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggaXRlbSBhbmQgdXNlIHByb3ZpZGVkIGZ1bmN0aW9uIHRvIGRldGVybWluZVxuICAgICAgICAgICAgLy8gd2hldGhlciB0byBoaWRlIGl0IG9yIG5vdC5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVhY2goJGl0ZW1zLCBmdW5jdGlvbiggZWwgKSB7XG4gICAgICAgICAgICAgICAgdmFyICRpdGVtID0gJChlbCk7XG4gICAgICAgICAgICAgICAgaWYgKCB0aGlzLl9kb2VzUGFzc0ZpbHRlciggY2F0ZWdvcnksICRpdGVtICkgKSB7XG4gICAgICAgICAgICAgICAgICAgICRmaWx0ZXJlZCA9ICRmaWx0ZXJlZC5hZGQoICRpdGVtICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGNvbmNlYWxlZCA9ICRjb25jZWFsZWQuYWRkKCAkaXRlbSApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbHRlcmVkOiAkZmlsdGVyZWQsXG4gICAgICAgICAgICBjb25jZWFsZWQ6ICRjb25jZWFsZWRcbiAgICAgICAgfTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBUZXN0IGFuIGl0ZW0gdG8gc2VlIGlmIGl0IHBhc3NlcyBhIGNhdGVnb3J5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBjYXRlZ29yeSBDYXRlZ29yeSBvciBmdW5jdGlvbiB0byBmaWx0ZXIgYnkuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRpdGVtIEEgc2luZ2xlIGl0ZW0sIHdyYXBwZWQgd2l0aCBqUXVlcnkuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gV2hldGhlciBpdCBwYXNzZXMgdGhlIGNhdGVnb3J5L2ZpbHRlci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9kb2VzUGFzc0ZpbHRlciA9IGZ1bmN0aW9uKCBjYXRlZ29yeSwgJGl0ZW0gKSB7XG4gICAgICAgIGlmICggJC5pc0Z1bmN0aW9uKCBjYXRlZ29yeSApICkge1xuICAgICAgICAgICAgcmV0dXJuIGNhdGVnb3J5LmNhbGwoICRpdGVtWzBdLCAkaXRlbSwgdGhpcyApO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBlYWNoIGVsZW1lbnQncyBkYXRhLWdyb3VwcyBhdHRyaWJ1dGUgYWdhaW5zdCB0aGUgZ2l2ZW4gY2F0ZWdvcnkuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZ3JvdXBzID0gJGl0ZW0uZGF0YSggRklMVEVSX0FUVFJJQlVURV9LRVkgKTtcbiAgICAgICAgICAgIHZhciBrZXlzID0gdGhpcy5kZWxpbWV0ZXIgJiYgISQuaXNBcnJheSggZ3JvdXBzICkgP1xuICAgICAgICAgICAgICAgIGdyb3Vwcy5zcGxpdCggdGhpcy5kZWxpbWV0ZXIgKSA6XG4gICAgICAgICAgICAgICAgZ3JvdXBzO1xuICAgICAgICAgICAgcmV0dXJuICQuaW5BcnJheShjYXRlZ29yeSwga2V5cykgPiAtMTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFRvZ2dsZXMgdGhlIGZpbHRlcmVkIGFuZCBjb25jZWFsZWQgY2xhc3MgbmFtZXMuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRmaWx0ZXJlZCBGaWx0ZXJlZCBzZXQuXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRjb25jZWFsZWQgQ29uY2VhbGVkIHNldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl90b2dnbGVGaWx0ZXJDbGFzc2VzID0gZnVuY3Rpb24oICRmaWx0ZXJlZCwgJGNvbmNlYWxlZCApIHtcbiAgICAgICAgJGZpbHRlcmVkXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoIFNodWZmbGUuQ2xhc3NOYW1lLkNPTkNFQUxFRCApXG4gICAgICAgICAgICAuYWRkQ2xhc3MoIFNodWZmbGUuQ2xhc3NOYW1lLkZJTFRFUkVEICk7XG4gICAgICAgICRjb25jZWFsZWRcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyggU2h1ZmZsZS5DbGFzc05hbWUuRklMVEVSRUQgKVxuICAgICAgICAgICAgLmFkZENsYXNzKCBTaHVmZmxlLkNsYXNzTmFtZS5DT05DRUFMRUQgKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGluaXRpYWwgY3NzIGZvciBlYWNoIGl0ZW1cbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gWyRpdGVtc10gT3B0aW9uYWxseSBzcGVjaWZpeSBhdCBzZXQgdG8gaW5pdGlhbGl6ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9pbml0SXRlbXMgPSBmdW5jdGlvbiggJGl0ZW1zICkge1xuICAgICAgICAkaXRlbXMgPSAkaXRlbXMgfHwgdGhpcy4kaXRlbXM7XG4gICAgICAgICRpdGVtcy5hZGRDbGFzcyhbXG4gICAgICAgICAgICBTaHVmZmxlLkNsYXNzTmFtZS5TSFVGRkxFX0lURU0sXG4gICAgICAgICAgICBTaHVmZmxlLkNsYXNzTmFtZS5GSUxURVJFRFxuICAgICAgICBdLmpvaW4oJyAnKSk7XG4gICAgICAgICRpdGVtcy5jc3MoIHRoaXMuaXRlbUNzcyApLmRhdGEoJ3BvaW50JywgbmV3IFBvaW50KCkpLmRhdGEoJ3NjYWxlJywgREVGQVVMVF9TQ0FMRSk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogVXBkYXRlcyB0aGUgZmlsdGVyZWQgaXRlbSBjb3VudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl91cGRhdGVJdGVtQ291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy52aXNpYmxlSXRlbXMgPSB0aGlzLl9nZXRGaWx0ZXJlZEl0ZW1zKCkubGVuZ3RoO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFNldHMgY3NzIHRyYW5zZm9ybSB0cmFuc2l0aW9uIG9uIGEgYW4gZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgRWxlbWVudCB0byBzZXQgdHJhbnNpdGlvbiBvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9zZXRUcmFuc2l0aW9uID0gZnVuY3Rpb24oIGVsZW1lbnQgKSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGVbIFRSQU5TSVRJT04gXSA9IENTU19UUkFOU0ZPUk0gKyAnICcgKyB0aGlzLnNwZWVkICsgJ21zICcgK1xuICAgICAgICAgICAgdGhpcy5lYXNpbmcgKyAnLCBvcGFjaXR5ICcgKyB0aGlzLnNwZWVkICsgJ21zICcgKyB0aGlzLmVhc2luZztcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGNzcyB0cmFuc2Zvcm0gdHJhbnNpdGlvbiBvbiBhIGdyb3VwIG9mIGVsZW1lbnRzLlxuICAgICAqIEBwYXJhbSB7QXJyYXlMaWtlLjxFbGVtZW50Pn0gJGl0ZW1zIEVsZW1lbnRzIHRvIHNldCB0cmFuc2l0aW9ucyBvbi5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9zZXRUcmFuc2l0aW9ucyA9IGZ1bmN0aW9uKCAkaXRlbXMgKSB7XG4gICAgICAgICRpdGVtcyA9ICRpdGVtcyB8fCB0aGlzLiRpdGVtcztcbiAgICAgICAgZWFjaCgkaXRlbXMsIGZ1bmN0aW9uKCBlbCApIHtcbiAgICAgICAgICAgIHRoaXMuX3NldFRyYW5zaXRpb24oIGVsICk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSB0cmFuc2l0aW9uIGRlbGF5IG9uIGEgY29sbGVjdGlvbiBvZiBlbGVtZW50cywgbWFraW5nIGVhY2ggZGVsYXlcbiAgICAgKiBncmVhdGVyIHRoYW4gdGhlIGxhc3QuXG4gICAgICogQHBhcmFtIHtBcnJheUxpa2UuPEVsZW1lbnQ+fSAkY29sbGVjdGlvbiBBcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3NldFNlcXVlbnRpYWxEZWxheSA9IGZ1bmN0aW9uKCAkY29sbGVjdGlvbiApIHtcbiAgICAgICAgaWYgKCAhdGhpcy5zdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyAkY29sbGVjdGlvbiBjYW4gYmUgYW4gYXJyYXkgb2YgZG9tIGVsZW1lbnRzIG9yIGpxdWVyeSBvYmplY3RcbiAgICAgICAgZWFjaCgkY29sbGVjdGlvbiwgZnVuY3Rpb24oIGVsLCBpICkge1xuICAgICAgICAgICAgLy8gVGhpcyB3b3JrcyBiZWNhdXNlIHRoZSB0cmFuc2l0aW9uLXByb3BlcnR5OiB0cmFuc2Zvcm0sIG9wYWNpdHk7XG4gICAgICAgICAgICBlbC5zdHlsZVsgVFJBTlNJVElPTl9ERUxBWSBdID0gJzBtcywnICsgKChpICsgMSkgKiB0aGlzLnNlcXVlbnRpYWxGYWRlRGVsYXkpICsgJ21zJztcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfTtcblxuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2dldEl0ZW1zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRlbC5jaGlsZHJlbiggdGhpcy5pdGVtU2VsZWN0b3IgKTtcbiAgICB9O1xuXG5cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0RmlsdGVyZWRJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kaXRlbXMuZmlsdGVyKCcuJyArIFNodWZmbGUuQ2xhc3NOYW1lLkZJTFRFUkVEKTtcbiAgICB9O1xuXG5cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0Q29uY2VhbGVkSXRlbXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGl0ZW1zLmZpbHRlcignLicgKyBTaHVmZmxlLkNsYXNzTmFtZS5DT05DRUFMRUQpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGNvbHVtbiBzaXplLCBiYXNlZCBvbiBjb2x1bW4gd2lkdGggYW5kIHNpemVyIG9wdGlvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbnRhaW5lcldpZHRoIFNpemUgb2YgdGhlIHBhcmVudCBjb250YWluZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGd1dHRlclNpemUgU2l6ZSBvZiB0aGUgZ3V0dGVycy5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0Q29sdW1uU2l6ZSA9IGZ1bmN0aW9uKCBjb250YWluZXJXaWR0aCwgZ3V0dGVyU2l6ZSApIHtcbiAgICAgICAgdmFyIHNpemU7XG5cbiAgICAgICAgLy8gSWYgdGhlIGNvbHVtbldpZHRoIHByb3BlcnR5IGlzIGEgZnVuY3Rpb24sIHRoZW4gdGhlIGdyaWQgaXMgZmx1aWRcbiAgICAgICAgaWYgKCAkLmlzRnVuY3Rpb24oIHRoaXMuY29sdW1uV2lkdGggKSApIHtcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLmNvbHVtbldpZHRoKGNvbnRhaW5lcldpZHRoKTtcblxuICAgICAgICAgICAgLy8gY29sdW1uV2lkdGggb3B0aW9uIGlzbid0IGEgZnVuY3Rpb24sIGFyZSB0aGV5IHVzaW5nIGEgc2l6aW5nIGVsZW1lbnQ/XG4gICAgICAgIH0gZWxzZSBpZiAoIHRoaXMudXNlU2l6ZXIgKSB7XG4gICAgICAgICAgICBzaXplID0gU2h1ZmZsZS5fZ2V0T3V0ZXJXaWR0aCh0aGlzLnNpemVyKTtcblxuICAgICAgICAgICAgLy8gaWYgbm90LCBob3cgYWJvdXQgdGhlIGV4cGxpY2l0bHkgc2V0IG9wdGlvbj9cbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy5jb2x1bW5XaWR0aCApIHtcbiAgICAgICAgICAgIHNpemUgPSB0aGlzLmNvbHVtbldpZHRoO1xuXG4gICAgICAgICAgICAvLyBvciB1c2UgdGhlIHNpemUgb2YgdGhlIGZpcnN0IGl0ZW1cbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy4kaXRlbXMubGVuZ3RoID4gMCApIHtcbiAgICAgICAgICAgIHNpemUgPSBTaHVmZmxlLl9nZXRPdXRlcldpZHRoKHRoaXMuJGl0ZW1zWzBdLCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlcmUncyBubyBpdGVtcywgdXNlIHNpemUgb2YgY29udGFpbmVyXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaXplID0gY29udGFpbmVyV2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEb24ndCBsZXQgdGhlbSBzZXQgYSBjb2x1bW4gd2lkdGggb2YgemVyby5cbiAgICAgICAgaWYgKCBzaXplID09PSAwICkge1xuICAgICAgICAgICAgc2l6ZSA9IGNvbnRhaW5lcldpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNpemUgKyBndXR0ZXJTaXplO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGd1dHRlciBzaXplLCBiYXNlZCBvbiBndXR0ZXIgd2lkdGggYW5kIHNpemVyIG9wdGlvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbnRhaW5lcldpZHRoIFNpemUgb2YgdGhlIHBhcmVudCBjb250YWluZXIuXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2dldEd1dHRlclNpemUgPSBmdW5jdGlvbiggY29udGFpbmVyV2lkdGggKSB7XG4gICAgICAgIHZhciBzaXplO1xuICAgICAgICBpZiAoICQuaXNGdW5jdGlvbiggdGhpcy5ndXR0ZXJXaWR0aCApICkge1xuICAgICAgICAgICAgc2l6ZSA9IHRoaXMuZ3V0dGVyV2lkdGgoY29udGFpbmVyV2lkdGgpO1xuICAgICAgICB9IGVsc2UgaWYgKCB0aGlzLnVzZVNpemVyICkge1xuICAgICAgICAgICAgc2l6ZSA9IFNodWZmbGUuX2dldE51bWJlclN0eWxlKHRoaXMuc2l6ZXIsICdtYXJnaW5MZWZ0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaXplID0gdGhpcy5ndXR0ZXJXaWR0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzaXplO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZSB0aGUgbnVtYmVyIG9mIGNvbHVtbnMgdG8gYmUgdXNlZC4gR2V0cyBjc3MgaWYgdXNpbmcgc2l6ZXIgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RoZUNvbnRhaW5lcldpZHRoXSBPcHRpb25hbGx5IHNwZWNpZnkgYSBjb250YWluZXIgd2lkdGggaWYgaXQncyBhbHJlYWR5IGF2YWlsYWJsZS5cbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fc2V0Q29sdW1ucyA9IGZ1bmN0aW9uKCB0aGVDb250YWluZXJXaWR0aCApIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lcldpZHRoID0gdGhlQ29udGFpbmVyV2lkdGggfHwgU2h1ZmZsZS5fZ2V0T3V0ZXJXaWR0aCggdGhpcy5lbGVtZW50ICk7XG4gICAgICAgIHZhciBndXR0ZXIgPSB0aGlzLl9nZXRHdXR0ZXJTaXplKCBjb250YWluZXJXaWR0aCApO1xuICAgICAgICB2YXIgY29sdW1uV2lkdGggPSB0aGlzLl9nZXRDb2x1bW5TaXplKCBjb250YWluZXJXaWR0aCwgZ3V0dGVyICk7XG4gICAgICAgIHZhciBjYWxjdWxhdGVkQ29sdW1ucyA9IChjb250YWluZXJXaWR0aCArIGd1dHRlcikgLyBjb2x1bW5XaWR0aDtcblxuICAgICAgICAvLyBXaWR0aHMgZ2l2ZW4gZnJvbSBnZXRTdHlsZXMgYXJlIG5vdCBwcmVjaXNlIGVub3VnaC4uLlxuICAgICAgICBpZiAoIE1hdGguYWJzKE1hdGgucm91bmQoY2FsY3VsYXRlZENvbHVtbnMpIC0gY2FsY3VsYXRlZENvbHVtbnMpIDwgdGhpcy5jb2x1bW5UaHJlc2hvbGQgKSB7XG4gICAgICAgICAgICAvLyBlLmcuIGNhbGN1bGF0ZWRDb2x1bW5zID0gMTEuOTk4ODc2XG4gICAgICAgICAgICBjYWxjdWxhdGVkQ29sdW1ucyA9IE1hdGgucm91bmQoIGNhbGN1bGF0ZWRDb2x1bW5zICk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbHMgPSBNYXRoLm1heCggTWF0aC5mbG9vcihjYWxjdWxhdGVkQ29sdW1ucyksIDEgKTtcbiAgICAgICAgdGhpcy5jb250YWluZXJXaWR0aCA9IGNvbnRhaW5lcldpZHRoO1xuICAgICAgICB0aGlzLmNvbFdpZHRoID0gY29sdW1uV2lkdGg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkanVzdCB0aGUgaGVpZ2h0IG9mIHRoZSBncmlkXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3NldENvbnRhaW5lclNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy4kZWwuY3NzKCAnaGVpZ2h0JywgdGhpcy5fZ2V0Q29udGFpbmVyU2l6ZSgpICk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQmFzZWQgb24gdGhlIGNvbHVtbiBoZWlnaHRzLCBpdCByZXR1cm5zIHRoZSBiaWdnZXN0IG9uZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0Q29udGFpbmVyU2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gYXJyYXlNYXgoIHRoaXMucG9zaXRpb25zICk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRmlyZSBldmVudHMgd2l0aCAuc2h1ZmZsZSBuYW1lc3BhY2VcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZmlyZSA9IGZ1bmN0aW9uKCBuYW1lLCBhcmdzICkge1xuICAgICAgICB0aGlzLiRlbC50cmlnZ2VyKCBuYW1lICsgJy4nICsgU0hVRkZMRSwgYXJncyAmJiBhcmdzLmxlbmd0aCA/IGFyZ3MgOiBbIHRoaXMgXSApO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFplcm9zIG91dCB0aGUgeSBjb2x1bW5zIGFycmF5LCB3aGljaCBpcyB1c2VkIHRvIGRldGVybWluZSBpdGVtIHBsYWNlbWVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9yZXNldENvbHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLmNvbHM7XG4gICAgICAgIHRoaXMucG9zaXRpb25zID0gW107XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb25zLnB1c2goIDAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIExvb3BzIHRocm91Z2ggZWFjaCBpdGVtIHRoYXQgc2hvdWxkIGJlIHNob3duIGFuZCBjYWxjdWxhdGVzIHRoZSB4LCB5IHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7QXJyYXkuPEVsZW1lbnQ+fSBpdGVtcyBBcnJheSBvZiBpdGVtcyB0aGF0IHdpbGwgYmUgc2hvd24vbGF5ZWQgb3V0IGluIG9yZGVyIGluIHRoZWlyIGFycmF5LlxuICAgICAqICAgICBCZWNhdXNlIGpRdWVyeSBjb2xsZWN0aW9uIGFyZSBhbHdheXMgb3JkZXJlZCBpbiBET00gb3JkZXIsIHdlIGNhbid0IHBhc3MgYSBqcSBjb2xsZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzT25seVBvc2l0aW9uPWZhbHNlXSBJZiB0cnVlIHRoaXMgd2lsbCBwb3NpdGlvbiB0aGUgaXRlbXMgd2l0aCB6ZXJvIG9wYWNpdHkuXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2xheW91dCA9IGZ1bmN0aW9uKCBpdGVtcywgaXNPbmx5UG9zaXRpb24gKSB7XG4gICAgICAgIGVhY2goaXRlbXMsIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgICAgICAgICAgdGhpcy5fbGF5b3V0SXRlbSggaXRlbSwgISFpc09ubHlQb3NpdGlvbiApO1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAvLyBgX2xheW91dGAgYWx3YXlzIGhhcHBlbnMgYWZ0ZXIgYF9zaHJpbmtgLCBzbyBpdCdzIHNhZmUgdG8gcHJvY2VzcyB0aGUgc3R5bGVcbiAgICAgICAgLy8gcXVldWUgaGVyZSB3aXRoIHN0eWxlcyBmcm9tIHRoZSBzaHJpbmsgbWV0aG9kLlxuICAgICAgICB0aGlzLl9wcm9jZXNzU3R5bGVRdWV1ZSgpO1xuXG4gICAgICAgIC8vIEFkanVzdCB0aGUgaGVpZ2h0IG9mIHRoZSBjb250YWluZXIuXG4gICAgICAgIHRoaXMuX3NldENvbnRhaW5lclNpemUoKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBwb3NpdGlvbiBvZiB0aGUgaXRlbSBhbmQgcHVzaGVzIGl0IG9udG8gdGhlIHN0eWxlIHF1ZXVlLlxuICAgICAqIEBwYXJhbSB7RWxlbWVudH0gaXRlbSBFbGVtZW50IHdoaWNoIGlzIGJlaW5nIHBvc2l0aW9uZWQuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBpc09ubHlQb3NpdGlvbiBXaGV0aGVyIHRvIHBvc2l0aW9uIHRoZSBpdGVtLCBidXQgd2l0aCB6ZXJvXG4gICAgICogICAgIG9wYWNpdHkgc28gdGhhdCBpdCBjYW4gZmFkZSBpbiBsYXRlci5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9sYXlvdXRJdGVtID0gZnVuY3Rpb24oIGl0ZW0sIGlzT25seVBvc2l0aW9uICkge1xuICAgICAgICB2YXIgJGl0ZW0gPSAkKGl0ZW0pO1xuICAgICAgICB2YXIgaXRlbURhdGEgPSAkaXRlbS5kYXRhKCk7XG4gICAgICAgIHZhciBjdXJyUG9zID0gaXRlbURhdGEucG9pbnQ7XG4gICAgICAgIHZhciBjdXJyU2NhbGUgPSBpdGVtRGF0YS5zY2FsZTtcbiAgICAgICAgdmFyIGl0ZW1TaXplID0ge1xuICAgICAgICAgICAgd2lkdGg6IFNodWZmbGUuX2dldE91dGVyV2lkdGgoIGl0ZW0sIHRydWUgKSxcbiAgICAgICAgICAgIGhlaWdodDogU2h1ZmZsZS5fZ2V0T3V0ZXJIZWlnaHQoIGl0ZW0sIHRydWUgKVxuICAgICAgICB9O1xuICAgICAgICB2YXIgcG9zID0gdGhpcy5fZ2V0SXRlbVBvc2l0aW9uKCBpdGVtU2l6ZSApO1xuXG4gICAgICAgIC8vIElmIHRoZSBpdGVtIHdpbGwgbm90IGNoYW5nZSBpdHMgcG9zaXRpb24sIGRvIG5vdCBhZGQgaXQgdG8gdGhlIHJlbmRlclxuICAgICAgICAvLyBxdWV1ZS4gVHJhbnNpdGlvbnMgZG9uJ3QgZmlyZSB3aGVuIHNldHRpbmcgYSBwcm9wZXJ0eSB0byB0aGUgc2FtZSB2YWx1ZS5cbiAgICAgICAgaWYgKCBQb2ludC5lcXVhbHMoY3VyclBvcywgcG9zKSAmJiBjdXJyU2NhbGUgPT09IERFRkFVTFRfU0NBTEUgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTYXZlIGRhdGEgZm9yIHNocmlua1xuICAgICAgICBpdGVtRGF0YS5wb2ludCA9IHBvcztcbiAgICAgICAgaXRlbURhdGEuc2NhbGUgPSBERUZBVUxUX1NDQUxFO1xuXG4gICAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgICRpdGVtOiAkaXRlbSxcbiAgICAgICAgICAgIHBvaW50OiBwb3MsXG4gICAgICAgICAgICBzY2FsZTogREVGQVVMVF9TQ0FMRSxcbiAgICAgICAgICAgIG9wYWNpdHk6IGlzT25seVBvc2l0aW9uID8gMCA6IDEsXG4gICAgICAgICAgICAvLyBTZXQgc3R5bGVzIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGlzIG5vIHRyYW5zaXRpb24gc3BlZWQuXG4gICAgICAgICAgICBza2lwVHJhbnNpdGlvbjogaXNPbmx5UG9zaXRpb24gfHwgdGhpcy5zcGVlZCA9PT0gMCxcbiAgICAgICAgICAgIGNhbGxmcm9udDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKCAhaXNPbmx5UG9zaXRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmNzcyggJ3Zpc2liaWxpdHknLCAndmlzaWJsZScgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICggaXNPbmx5UG9zaXRpb24gKSB7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmNzcyggJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lIHRoZSBsb2NhdGlvbiBvZiB0aGUgbmV4dCBpdGVtLCBiYXNlZCBvbiBpdHMgc2l6ZS5cbiAgICAgKiBAcGFyYW0ge3t3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcn19IGl0ZW1TaXplIE9iamVjdCB3aXRoIHdpZHRoIGFuZCBoZWlnaHQuXG4gICAgICogQHJldHVybiB7UG9pbnR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0SXRlbVBvc2l0aW9uID0gZnVuY3Rpb24oIGl0ZW1TaXplICkge1xuICAgICAgICB2YXIgY29sdW1uU3BhbiA9IHRoaXMuX2dldENvbHVtblNwYW4oIGl0ZW1TaXplLndpZHRoLCB0aGlzLmNvbFdpZHRoLCB0aGlzLmNvbHMgKTtcblxuICAgICAgICB2YXIgc2V0WSA9IHRoaXMuX2dldENvbHVtblNldCggY29sdW1uU3BhbiwgdGhpcy5jb2xzICk7XG5cbiAgICAgICAgLy8gRmluZHMgdGhlIGluZGV4IG9mIHRoZSBzbWFsbGVzdCBudW1iZXIgaW4gdGhlIHNldC5cbiAgICAgICAgdmFyIHNob3J0Q29sdW1uSW5kZXggPSB0aGlzLl9nZXRTaG9ydENvbHVtbiggc2V0WSwgdGhpcy5idWZmZXIgKTtcblxuICAgICAgICAvLyBQb3NpdGlvbiB0aGUgaXRlbVxuICAgICAgICB2YXIgcG9pbnQgPSBuZXcgUG9pbnQoXG4gICAgICAgICAgICBNYXRoLnJvdW5kKCB0aGlzLmNvbFdpZHRoICogc2hvcnRDb2x1bW5JbmRleCApLFxuICAgICAgICAgICAgTWF0aC5yb3VuZCggc2V0WVtzaG9ydENvbHVtbkluZGV4XSApKTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIGNvbHVtbnMgYXJyYXkgd2l0aCB0aGUgbmV3IHZhbHVlcyBmb3IgZWFjaCBjb2x1bW4uXG4gICAgICAgIC8vIGUuZy4gYmVmb3JlIHRoZSB1cGRhdGUgdGhlIGNvbHVtbnMgY291bGQgYmUgWzI1MCwgMCwgMCwgMF0gZm9yIGFuIGl0ZW1cbiAgICAgICAgLy8gd2hpY2ggc3BhbnMgMiBjb2x1bW5zLiBBZnRlciBpdCB3b3VsZCBiZSBbMjUwLCBpdGVtSGVpZ2h0LCBpdGVtSGVpZ2h0LCAwXS5cbiAgICAgICAgdmFyIHNldEhlaWdodCA9IHNldFlbc2hvcnRDb2x1bW5JbmRleF0gKyBpdGVtU2l6ZS5oZWlnaHQ7XG4gICAgICAgIHZhciBzZXRTcGFuID0gdGhpcy5jb2xzICsgMSAtIHNldFkubGVuZ3RoO1xuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzZXRTcGFuOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLnBvc2l0aW9uc1sgc2hvcnRDb2x1bW5JbmRleCArIGkgXSA9IHNldEhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmUgdGhlIG51bWJlciBvZiBjb2x1bW5zIGFuIGl0ZW1zIHNwYW5zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpdGVtV2lkdGggV2lkdGggb2YgdGhlIGl0ZW0uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbldpZHRoIFdpZHRoIG9mIHRoZSBjb2x1bW4gKGluY2x1ZGVzIGd1dHRlcikuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbHVtbnMgVG90YWwgbnVtYmVyIG9mIGNvbHVtbnNcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fZ2V0Q29sdW1uU3BhbiA9IGZ1bmN0aW9uKCBpdGVtV2lkdGgsIGNvbHVtbldpZHRoLCBjb2x1bW5zICkge1xuICAgICAgICB2YXIgY29sdW1uU3BhbiA9IGl0ZW1XaWR0aCAvIGNvbHVtbldpZHRoO1xuXG4gICAgICAgIC8vIElmIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHJvdW5kZWQgY29sdW1uIHNwYW4gbnVtYmVyIGFuZCB0aGVcbiAgICAgICAgLy8gY2FsY3VsYXRlZCBjb2x1bW4gc3BhbiBudW1iZXIgaXMgcmVhbGx5IHNtYWxsLCByb3VuZCB0aGUgbnVtYmVyIHRvXG4gICAgICAgIC8vIG1ha2UgaXQgZml0LlxuICAgICAgICBpZiAoIE1hdGguYWJzKE1hdGgucm91bmQoIGNvbHVtblNwYW4gKSAtIGNvbHVtblNwYW4gKSA8IHRoaXMuY29sdW1uVGhyZXNob2xkICkge1xuICAgICAgICAgICAgLy8gZS5nLiBjb2x1bW5TcGFuID0gNC4wMDg5OTQ1MzkwMjk4NzQ1XG4gICAgICAgICAgICBjb2x1bW5TcGFuID0gTWF0aC5yb3VuZCggY29sdW1uU3BhbiApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW5zdXJlIHRoZSBjb2x1bW4gc3BhbiBpcyBub3QgbW9yZSB0aGFuIHRoZSBhbW91bnQgb2YgY29sdW1ucyBpbiB0aGUgd2hvbGUgbGF5b3V0LlxuICAgICAgICByZXR1cm4gTWF0aC5taW4oIE1hdGguY2VpbCggY29sdW1uU3BhbiApLCBjb2x1bW5zICk7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSBjb2x1bW4gc2V0IHRvIHVzZSBmb3IgcGxhY2VtZW50LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb2x1bW5TcGFuIFRoZSBudW1iZXIgb2YgY29sdW1ucyB0aGlzIGN1cnJlbnQgaXRlbSBzcGFucy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY29sdW1ucyBUaGUgdG90YWwgY29sdW1ucyBpbiB0aGUgZ3JpZC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheS48bnVtYmVyPn0gQW4gYXJyYXkgb2YgbnVtYmVycyByZXByZXNldGluZyB0aGUgY29sdW1uIHNldC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9nZXRDb2x1bW5TZXQgPSBmdW5jdGlvbiggY29sdW1uU3BhbiwgY29sdW1ucyApIHtcbiAgICAgICAgLy8gVGhlIGl0ZW0gc3BhbnMgb25seSBvbmUgY29sdW1uLlxuICAgICAgICBpZiAoIGNvbHVtblNwYW4gPT09IDEgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbnM7XG5cbiAgICAgICAgICAgIC8vIFRoZSBpdGVtIHNwYW5zIG1vcmUgdGhhbiBvbmUgY29sdW1uLCBmaWd1cmUgb3V0IGhvdyBtYW55IGRpZmZlcmVudFxuICAgICAgICAgICAgLy8gcGxhY2VzIGl0IGNvdWxkIGZpdCBob3Jpem9udGFsbHkuXG4gICAgICAgICAgICAvLyBUaGUgZ3JvdXAgY291bnQgaXMgdGhlIG51bWJlciBvZiBwbGFjZXMgd2l0aGluIHRoZSBwb3NpdGlvbnMgdGhpcyBibG9ja1xuICAgICAgICAgICAgLy8gY291bGQgZml0LCBpZ25vcmluZyB0aGUgY3VycmVudCBwb3NpdGlvbnMgb2YgaXRlbXMuXG4gICAgICAgICAgICAvLyBJbWFnaW5lIGEgMiBjb2x1bW4gYnJpY2sgYXMgdGhlIHNlY29uZCBpdGVtIGluIGEgNCBjb2x1bW4gZ3JpZCB3aXRoXG4gICAgICAgICAgICAvLyAxMHB4IGhlaWdodCBlYWNoLiBGaW5kIHRoZSBwbGFjZXMgaXQgd291bGQgZml0OlxuICAgICAgICAgICAgLy8gWzEwLCAwLCAwLCAwXVxuICAgICAgICAgICAgLy8gIHwgICB8ICB8XG4gICAgICAgICAgICAvLyAgKiAgICogICpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBUaGVuIHRha2UgdGhlIHBsYWNlcyB3aGljaCBmaXQgYW5kIGdldCB0aGUgYmlnZ2VyIG9mIHRoZSB0d286XG4gICAgICAgICAgICAvLyBtYXgoWzEwLCAwXSksIG1heChbMCwgMF0pLCBtYXgoWzAsIDBdKSA9IFsxMCwgMCwgMF1cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBOZXh0LCBmaW5kIHRoZSBmaXJzdCBzbWFsbGVzdCBudW1iZXIgKHRoZSBzaG9ydCBjb2x1bW4pLlxuICAgICAgICAgICAgLy8gWzEwLCAwLCAwXVxuICAgICAgICAgICAgLy8gICAgICB8XG4gICAgICAgICAgICAvLyAgICAgICpcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBBbmQgdGhhdCdzIHdoZXJlIGl0IHNob3VsZCBiZSBwbGFjZWQhXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZ3JvdXBDb3VudCA9IGNvbHVtbnMgKyAxIC0gY29sdW1uU3BhbjtcbiAgICAgICAgICAgIHZhciBncm91cFkgPSBbXTtcblxuICAgICAgICAgICAgLy8gRm9yIGhvdyBtYW55IHBvc3NpYmxlIHBvc2l0aW9ucyBmb3IgdGhpcyBpdGVtIHRoZXJlIGFyZS5cbiAgICAgICAgICAgIGZvciAoIHZhciBpID0gMDsgaSA8IGdyb3VwQ291bnQ7IGkrKyApIHtcbiAgICAgICAgICAgICAgICAvLyBGaW5kIHRoZSBiaWdnZXIgdmFsdWUgZm9yIGVhY2ggcGxhY2UgaXQgY291bGQgZml0LlxuICAgICAgICAgICAgICAgIGdyb3VwWVtpXSA9IGFycmF5TWF4KCB0aGlzLnBvc2l0aW9ucy5zbGljZSggaSwgaSArIGNvbHVtblNwYW4gKSApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZ3JvdXBZO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRmluZCBpbmRleCBvZiBzaG9ydCBjb2x1bW4sIHRoZSBmaXJzdCBmcm9tIHRoZSBsZWZ0IHdoZXJlIHRoaXMgaXRlbSB3aWxsIGdvLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtBcnJheS48bnVtYmVyPn0gcG9zaXRpb25zIFRoZSBhcnJheSB0byBzZWFyY2ggZm9yIHRoZSBzbWFsbGVzdCBudW1iZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJ1ZmZlciBPcHRpb25hbCBidWZmZXIgd2hpY2ggaXMgdmVyeSB1c2VmdWwgd2hlbiB0aGUgaGVpZ2h0XG4gICAgICogICAgIGlzIGEgcGVyY2VudGFnZSBvZiB0aGUgd2lkdGguXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBJbmRleCBvZiB0aGUgc2hvcnQgY29sdW1uLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2dldFNob3J0Q29sdW1uID0gZnVuY3Rpb24oIHBvc2l0aW9ucywgYnVmZmVyICkge1xuICAgICAgICB2YXIgbWluUG9zaXRpb24gPSBhcnJheU1pbiggcG9zaXRpb25zICk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwb3NpdGlvbnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGlmICggcG9zaXRpb25zW2ldID49IG1pblBvc2l0aW9uIC0gYnVmZmVyICYmIHBvc2l0aW9uc1tpXSA8PSBtaW5Qb3NpdGlvbiArIGJ1ZmZlciApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBIaWRlcyB0aGUgZWxlbWVudHMgdGhhdCBkb24ndCBtYXRjaCBvdXIgZmlsdGVyLlxuICAgICAqIEBwYXJhbSB7alF1ZXJ5fSAkY29sbGVjdGlvbiBqUXVlcnkgY29sbGVjdGlvbiB0byBzaHJpbmsuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fc2hyaW5rID0gZnVuY3Rpb24oICRjb2xsZWN0aW9uICkge1xuICAgICAgICB2YXIgJGNvbmNlYWxlZCA9ICRjb2xsZWN0aW9uIHx8IHRoaXMuX2dldENvbmNlYWxlZEl0ZW1zKCk7XG5cbiAgICAgICAgZWFjaCgkY29uY2VhbGVkLCBmdW5jdGlvbiggaXRlbSApIHtcbiAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoaXRlbSk7XG4gICAgICAgICAgICB2YXIgaXRlbURhdGEgPSAkaXRlbS5kYXRhKCk7XG5cbiAgICAgICAgICAgIC8vIENvbnRpbnVpbmcgd291bGQgYWRkIGEgdHJhbnNpdGlvbmVuZCBldmVudCBsaXN0ZW5lciB0byB0aGUgZWxlbWVudCwgYnV0XG4gICAgICAgICAgICAvLyB0aGF0IGxpc3RlbmVyIHdvdWxkIG5vdCBleGVjdXRlIGJlY2F1c2UgdGhlIHRyYW5zZm9ybSBhbmQgb3BhY2l0eSB3b3VsZFxuICAgICAgICAgICAgLy8gc3RheSB0aGUgc2FtZS5cbiAgICAgICAgICAgIGlmICggaXRlbURhdGEuc2NhbGUgPT09IENPTkNFQUxFRF9TQ0FMRSApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGl0ZW1EYXRhLnNjYWxlID0gQ09OQ0VBTEVEX1NDQUxFO1xuXG4gICAgICAgICAgICB0aGlzLnN0eWxlUXVldWUucHVzaCh7XG4gICAgICAgICAgICAgICAgJGl0ZW06ICRpdGVtLFxuICAgICAgICAgICAgICAgIHBvaW50OiBpdGVtRGF0YS5wb2ludCxcbiAgICAgICAgICAgICAgICBzY2FsZSA6IENPTkNFQUxFRF9TQ0FMRSxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJGl0ZW0uY3NzKCAndmlzaWJpbGl0eScsICdoaWRkZW4nICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJlc2l6ZSBoYW5kbGVyLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIHNodWZmbGUgaXMgZGlzYWJsZWQsIGRlc3Ryb3llZCwgZG9uJ3QgZG8gYW55dGhpbmdcbiAgICAgICAgaWYgKCAhdGhpcy5lbmFibGVkIHx8IHRoaXMuZGVzdHJveWVkICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2lsbCBuZWVkIHRvIGNoZWNrIGhlaWdodCBpbiB0aGUgZnV0dXJlIGlmIGl0J3MgbGF5ZWQgb3V0IGhvcml6b250YWx5XG4gICAgICAgIHZhciBjb250YWluZXJXaWR0aCA9IFNodWZmbGUuX2dldE91dGVyV2lkdGgoIHRoaXMuZWxlbWVudCApO1xuXG4gICAgICAgIC8vIGNvbnRhaW5lcldpZHRoIGhhc24ndCBjaGFuZ2VkLCBkb24ndCBkbyBhbnl0aGluZ1xuICAgICAgICBpZiAoIGNvbnRhaW5lcldpZHRoID09PSB0aGlzLmNvbnRhaW5lcldpZHRoICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHN0eWxlcyBmb3IgZWl0aGVyIGpRdWVyeSBhbmltYXRlIG9yIHRyYW5zaXRpb24uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMgVHJhbnNpdGlvbiBvcHRpb25zLlxuICAgICAqIEByZXR1cm4geyFPYmplY3R9IFRyYW5zZm9ybXMgZm9yIHRyYW5zaXRpb25zLCBsZWZ0L3RvcCBmb3IgYW5pbWF0ZS5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9nZXRTdHlsZXNGb3JUcmFuc2l0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gICAgICAgIHZhciBzdHlsZXMgPSB7XG4gICAgICAgICAgICBvcGFjaXR5OiBvcHRzLm9wYWNpdHlcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIHRoaXMuc3VwcG9ydGVkICkge1xuICAgICAgICAgICAgc3R5bGVzWyBUUkFOU0ZPUk0gXSA9IFNodWZmbGUuX2dldEl0ZW1UcmFuc2Zvcm1TdHJpbmcoIG9wdHMucG9pbnQsIG9wdHMuc2NhbGUgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlcy5sZWZ0ID0gb3B0cy5wb2ludC54O1xuICAgICAgICAgICAgc3R5bGVzLnRvcCA9IG9wdHMucG9pbnQueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdHlsZXM7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogVHJhbnNpdGlvbnMgYW4gaXRlbSBpbiB0aGUgZ3JpZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdHMgb3B0aW9ucy5cbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gb3B0cy4kaXRlbSBqUXVlcnkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBpdGVtLlxuICAgICAqIEBwYXJhbSB7UG9pbnR9IG9wdHMucG9pbnQgQSBwb2ludCBvYmplY3Qgd2l0aCB0aGUgeCBhbmQgeSBjb29yZGluYXRlcy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5zY2FsZSBBbW91bnQgdG8gc2NhbGUgdGhlIGl0ZW0uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMub3BhY2l0eSBPcGFjaXR5IG9mIHRoZSBpdGVtLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdHMuY2FsbGJhY2sgQ29tcGxldGUgZnVuY3Rpb24gZm9yIHRoZSBhbmltYXRpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0cy5jYWxsZnJvbnQgRnVuY3Rpb24gdG8gY2FsbCBiZWZvcmUgdHJhbnNpdGlvbmluZy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl90cmFuc2l0aW9uID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gICAgICAgIHZhciBzdHlsZXMgPSB0aGlzLl9nZXRTdHlsZXNGb3JUcmFuc2l0aW9uKCBvcHRzICk7XG4gICAgICAgIHRoaXMuX3N0YXJ0SXRlbUFuaW1hdGlvbiggb3B0cy4kaXRlbSwgc3R5bGVzLCBvcHRzLmNhbGxmcm9udCB8fCAkLm5vb3AsIG9wdHMuY2FsbGJhY2sgfHwgJC5ub29wICk7XG4gICAgfTtcblxuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3N0YXJ0SXRlbUFuaW1hdGlvbiA9IGZ1bmN0aW9uKCAkaXRlbSwgc3R5bGVzLCBjYWxsZnJvbnQsIGNhbGxiYWNrICkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyBUcmFuc2l0aW9uIGVuZCBoYW5kbGVyIHJlbW92ZXMgaXRzIGxpc3RlbmVyLlxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVUcmFuc2l0aW9uRW5kKCBldnQgKSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhpcyBldmVudCBoYW5kbGVyIGhhcyBub3QgYnViYmxlZCB1cCBmcm9tIGEgY2hpbGQuXG4gICAgICAgICAgICBpZiAoIGV2dC50YXJnZXQgPT09IGV2dC5jdXJyZW50VGFyZ2V0ICkge1xuICAgICAgICAgICAgICAgICQoIGV2dC50YXJnZXQgKS5vZmYoIFRSQU5TSVRJT05FTkQsIGhhbmRsZVRyYW5zaXRpb25FbmQgKTtcbiAgICAgICAgICAgICAgICBfdGhpcy5fcmVtb3ZlVHJhbnNpdGlvblJlZmVyZW5jZShyZWZlcmVuY2UpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVmZXJlbmNlID0ge1xuICAgICAgICAgICAgJGVsZW1lbnQ6ICRpdGVtLFxuICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlVHJhbnNpdGlvbkVuZFxuICAgICAgICB9O1xuXG4gICAgICAgIGNhbGxmcm9udCgpO1xuXG4gICAgICAgIC8vIFRyYW5zaXRpb25zIGFyZSBub3Qgc2V0IHVudGlsIHNodWZmbGUgaGFzIGxvYWRlZCB0byBhdm9pZCB0aGUgaW5pdGlhbCB0cmFuc2l0aW9uLlxuICAgICAgICBpZiAoICF0aGlzLmluaXRpYWxpemVkICkge1xuICAgICAgICAgICAgJGl0ZW0uY3NzKCBzdHlsZXMgKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2UgQ1NTIFRyYW5zZm9ybXMgaWYgd2UgaGF2ZSB0aGVtXG4gICAgICAgIGlmICggdGhpcy5zdXBwb3J0ZWQgKSB7XG4gICAgICAgICAgICAkaXRlbS5jc3MoIHN0eWxlcyApO1xuICAgICAgICAgICAgJGl0ZW0ub24oIFRSQU5TSVRJT05FTkQsIGhhbmRsZVRyYW5zaXRpb25FbmQgKTtcbiAgICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25zLnB1c2gocmVmZXJlbmNlKTtcblxuICAgICAgICAgICAgLy8gVXNlIGpRdWVyeSB0byBhbmltYXRlIGxlZnQvdG9wXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTYXZlIHRoZSBkZWZlcnJlZCBvYmplY3Qgd2hpY2ggalF1ZXJ5IHJldHVybnMuXG4gICAgICAgICAgICB2YXIgYW5pbSA9ICRpdGVtLnN0b3AoIHRydWUgKS5hbmltYXRlKCBzdHlsZXMsIHRoaXMuc3BlZWQsICdzd2luZycsIGNhbGxiYWNrICk7XG4gICAgICAgICAgICAvLyBQdXNoIHRoZSBhbmltYXRpb24gdG8gdGhlIGxpc3Qgb2YgcGVuZGluZyBhbmltYXRpb25zLlxuICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9ucy5wdXNoKCBhbmltLnByb21pc2UoKSApO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSB0aGUgc3R5bGVzIGdhdGhlcmVkIGluIHRoZSBzdHlsZSBxdWV1ZS4gVGhpcyBhcHBsaWVzIHN0eWxlcyB0byBlbGVtZW50cyxcbiAgICAgKiB0cmlnZ2VyaW5nIHRyYW5zaXRpb25zLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gbm9MYXlvdXQgV2hldGhlciB0byB0cmlnZ2VyIGEgbGF5b3V0IGV2ZW50LlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3Byb2Nlc3NTdHlsZVF1ZXVlID0gZnVuY3Rpb24oIG5vTGF5b3V0ICkge1xuICAgICAgICBpZiAoIHRoaXMuaXNUcmFuc2l0aW9uaW5nICkge1xuICAgICAgICAgICAgdGhpcy5fY2FuY2VsTW92ZW1lbnQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciAkdHJhbnNpdGlvbnMgPSAkKCk7XG5cbiAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBxdWV1ZSBhbmQga2VlcCB0cmFjayBvZiBvbmVzIHRoYXQgdXNlIHRyYW5zaXRpb25zLlxuICAgICAgICBlYWNoKHRoaXMuc3R5bGVRdWV1ZSwgZnVuY3Rpb24oIHRyYW5zaXRpb25PYmogKSB7XG4gICAgICAgICAgICBpZiAoIHRyYW5zaXRpb25PYmouc2tpcFRyYW5zaXRpb24gKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3R5bGVJbW1lZGlhdGVseSggdHJhbnNpdGlvbk9iaiApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkdHJhbnNpdGlvbnMgPSAkdHJhbnNpdGlvbnMuYWRkKCB0cmFuc2l0aW9uT2JqLiRpdGVtICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbiggdHJhbnNpdGlvbk9iaiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzKTtcblxuXG4gICAgICAgIGlmICggJHRyYW5zaXRpb25zLmxlbmd0aCA+IDAgJiYgdGhpcy5pbml0aWFsaXplZCAmJiB0aGlzLnNwZWVkID4gMCApIHtcbiAgICAgICAgICAgIC8vIFNldCBmbGFnIHRoYXQgc2h1ZmZsZSBpcyBjdXJyZW50bHkgaW4gbW90aW9uLlxuICAgICAgICAgICAgdGhpcy5pc1RyYW5zaXRpb25pbmcgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAoIHRoaXMuc3VwcG9ydGVkICkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3doZW5Db2xsZWN0aW9uRG9uZSggJHRyYW5zaXRpb25zLCBUUkFOU0lUSU9ORU5ELCB0aGlzLl9tb3ZlbWVudEZpbmlzaGVkICk7XG5cbiAgICAgICAgICAgICAgICAvLyBUaGUgX3RyYW5zaXRpb24gZnVuY3Rpb24gYXBwZW5kcyBhIHByb21pc2UgdG8gdGhlIGFuaW1hdGlvbnMgYXJyYXkuXG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGV5J3JlIGFsbCBjb21wbGV0ZSwgZG8gdGhpbmdzLlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl93aGVuQW5pbWF0aW9uc0RvbmUoIHRoaXMuX21vdmVtZW50RmluaXNoZWQgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQSBjYWxsIHRvIGxheW91dCBoYXBwZW5lZCwgYnV0IG5vbmUgb2YgdGhlIG5ld2x5IGZpbHRlcmVkIGl0ZW1zIHdpbGxcbiAgICAgICAgICAgIC8vIGNoYW5nZSBwb3NpdGlvbi4gQXN5bmNocm9ub3VzbHkgZmlyZSB0aGUgY2FsbGJhY2sgaGVyZS5cbiAgICAgICAgfSBlbHNlIGlmICggIW5vTGF5b3V0ICkge1xuICAgICAgICAgICAgZGVmZXIoIHRoaXMuX2xheW91dEVuZCwgdGhpcyApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIGV2ZXJ5dGhpbmcgaW4gdGhlIHN0eWxlIHF1ZXVlXG4gICAgICAgIHRoaXMuc3R5bGVRdWV1ZS5sZW5ndGggPSAwO1xuICAgIH07XG5cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fY2FuY2VsTW92ZW1lbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHRyYW5zaXRpb24gZW5kIGV2ZW50IGZvciBlYWNoIGxpc3RlbmVyLlxuICAgICAgICAgICAgZWFjaCh0aGlzLl90cmFuc2l0aW9ucywgZnVuY3Rpb24oIHRyYW5zaXRpb24gKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbi4kZWxlbWVudC5vZmYoIFRSQU5TSVRJT05FTkQsIHRyYW5zaXRpb24uaGFuZGxlciApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBFdmVuIHdoZW4gYHN0b3BgIGlzIGNhbGxlZCBvbiB0aGUgalF1ZXJ5IGFuaW1hdGlvbiwgaXRzIHByb21pc2Ugd2lsbFxuICAgICAgICAgICAgLy8gc3RpbGwgYmUgcmVzb2x2ZWQuIFNpbmNlIGl0IGNhbm5vdCBiZSBkZXRlcm1pbmUgZnJvbSB3aXRoaW4gdGhhdCBjYWxsYmFja1xuICAgICAgICAgICAgLy8gd2hldGhlciB0aGUgYW5pbWF0aW9uIHdhcyBzdG9wcGVkIG9yIG5vdCwgYSBmbGFnIGlzIHNldCBoZXJlIHRvIGRpc3Rpbmd1aXNoXG4gICAgICAgICAgICAvLyBiZXR3ZWVuIHRoZSB0d28gc3RhdGVzLlxuICAgICAgICAgICAgdGhpcy5faXNNb3ZlbWVudENhbmNlbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuJGl0ZW1zLnN0b3AodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLl9pc01vdmVtZW50Q2FuY2VsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc2V0IHRoZSBhcnJheS5cbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvbnMubGVuZ3RoID0gMDtcblxuICAgICAgICAvLyBTaG93IGl0J3Mgbm8gbG9uZ2VyIGFjdGl2ZS5cbiAgICAgICAgdGhpcy5pc1RyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3JlbW92ZVRyYW5zaXRpb25SZWZlcmVuY2UgPSBmdW5jdGlvbihyZWYpIHtcbiAgICAgICAgdmFyIGluZGV4SW5BcnJheSA9ICQuaW5BcnJheShyZWYsIHRoaXMuX3RyYW5zaXRpb25zKTtcbiAgICAgICAgaWYgKGluZGV4SW5BcnJheSA+IC0xKSB7XG4gICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9ucy5zcGxpY2UoaW5kZXhJbkFycmF5LCAxKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEFwcGx5IHN0eWxlcyB3aXRob3V0IGEgdHJhbnNpdGlvbi5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyBUcmFuc2l0aW9ucyBvcHRpb25zIG9iamVjdC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9zdHlsZUltbWVkaWF0ZWx5ID0gZnVuY3Rpb24oIG9wdHMgKSB7XG4gICAgICAgIFNodWZmbGUuX3NraXBUcmFuc2l0aW9uKG9wdHMuJGl0ZW1bMF0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgb3B0cy4kaXRlbS5jc3MoIHRoaXMuX2dldFN0eWxlc0ZvclRyYW5zaXRpb24oIG9wdHMgKSApO1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9O1xuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX21vdmVtZW50RmluaXNoZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc1RyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbGF5b3V0RW5kKCk7XG4gICAgfTtcblxuICAgIFNodWZmbGUucHJvdG90eXBlLl9sYXlvdXRFbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fZmlyZSggU2h1ZmZsZS5FdmVudFR5cGUuTEFZT1VUICk7XG4gICAgfTtcblxuICAgIFNodWZmbGUucHJvdG90eXBlLl9hZGRJdGVtcyA9IGZ1bmN0aW9uKCAkbmV3SXRlbXMsIGFkZFRvRW5kLCBpc1NlcXVlbnRpYWwgKSB7XG4gICAgICAgIC8vIEFkZCBjbGFzc2VzIGFuZCBzZXQgaW5pdGlhbCBwb3NpdGlvbnMuXG4gICAgICAgIHRoaXMuX2luaXRJdGVtcyggJG5ld0l0ZW1zICk7XG5cbiAgICAgICAgLy8gQWRkIHRyYW5zaXRpb24gdG8gZWFjaCBpdGVtLlxuICAgICAgICB0aGlzLl9zZXRUcmFuc2l0aW9ucyggJG5ld0l0ZW1zICk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBsaXN0IG9mXG4gICAgICAgIHRoaXMuJGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXMoKTtcblxuICAgICAgICAvLyBTaHJpbmsgYWxsIGl0ZW1zICh3aXRob3V0IHRyYW5zaXRpb25zKS5cbiAgICAgICAgdGhpcy5fc2hyaW5rKCAkbmV3SXRlbXMgKTtcbiAgICAgICAgZWFjaCh0aGlzLnN0eWxlUXVldWUsIGZ1bmN0aW9uKCB0cmFuc2l0aW9uT2JqICkge1xuICAgICAgICAgICAgdHJhbnNpdGlvbk9iai5za2lwVHJhbnNpdGlvbiA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFwcGx5IHNocmluayBwb3NpdGlvbnMsIGJ1dCBkbyBub3QgY2F1c2UgYSBsYXlvdXQgZXZlbnQuXG4gICAgICAgIHRoaXMuX3Byb2Nlc3NTdHlsZVF1ZXVlKCB0cnVlICk7XG5cbiAgICAgICAgaWYgKCBhZGRUb0VuZCApIHtcbiAgICAgICAgICAgIHRoaXMuX2FkZEl0ZW1zVG9FbmQoICRuZXdJdGVtcywgaXNTZXF1ZW50aWFsICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNodWZmbGUoIHRoaXMubGFzdEZpbHRlciApO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX2FkZEl0ZW1zVG9FbmQgPSBmdW5jdGlvbiggJG5ld0l0ZW1zLCBpc1NlcXVlbnRpYWwgKSB7XG4gICAgICAgIC8vIEdldCBvbmVzIHRoYXQgcGFzc2VkIHRoZSBjdXJyZW50IGZpbHRlclxuICAgICAgICB2YXIgJHBhc3NlZCA9IHRoaXMuX2ZpbHRlciggbnVsbCwgJG5ld0l0ZW1zICk7XG4gICAgICAgIHZhciBwYXNzZWQgPSAkcGFzc2VkLmdldCgpO1xuXG4gICAgICAgIC8vIEhvdyBtYW55IGZpbHRlcmVkIGVsZW1lbnRzP1xuICAgICAgICB0aGlzLl91cGRhdGVJdGVtQ291bnQoKTtcblxuICAgICAgICB0aGlzLl9sYXlvdXQoIHBhc3NlZCwgdHJ1ZSApO1xuXG4gICAgICAgIGlmICggaXNTZXF1ZW50aWFsICYmIHRoaXMuc3VwcG9ydGVkICkge1xuICAgICAgICAgICAgdGhpcy5fc2V0U2VxdWVudGlhbERlbGF5KCBwYXNzZWQgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3JldmVhbEFwcGVuZGVkKCBwYXNzZWQgKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBUcmlnZ2VycyBhcHBlbmRlZCBlbGVtZW50cyB0byBmYWRlIGluLlxuICAgICAqIEBwYXJhbSB7QXJyYXlMaWtlLjxFbGVtZW50Pn0gJG5ld0ZpbHRlcmVkSXRlbXMgQ29sbGVjdGlvbiBvZiBlbGVtZW50cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLl9yZXZlYWxBcHBlbmRlZCA9IGZ1bmN0aW9uKCBuZXdGaWx0ZXJlZEl0ZW1zICkge1xuICAgICAgICBkZWZlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGVhY2gobmV3RmlsdGVyZWRJdGVtcywgZnVuY3Rpb24oIGVsICkge1xuICAgICAgICAgICAgICAgIHZhciAkaXRlbSA9ICQoIGVsICk7XG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtOiAkaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnQ6ICRpdGVtLmRhdGEoJ3BvaW50JyksXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBERUZBVUxUX1NDQUxFXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5fd2hlbkNvbGxlY3Rpb25Eb25lKCQobmV3RmlsdGVyZWRJdGVtcyksIFRSQU5TSVRJT05FTkQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICQobmV3RmlsdGVyZWRJdGVtcykuY3NzKCBUUkFOU0lUSU9OX0RFTEFZLCAnMG1zJyApO1xuICAgICAgICAgICAgICAgIHRoaXMuX21vdmVtZW50RmluaXNoZWQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCB0aGlzLCB0aGlzLnJldmVhbEFwcGVuZGVkRGVsYXkpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEV4ZWN1dGUgYSBmdW5jdGlvbiB3aGVuIGFuIGV2ZW50IGhhcyBiZWVuIHRyaWdnZXJlZCBmb3IgZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRjb2xsZWN0aW9uIENvbGxlY3Rpb24gb2YgZWxlbWVudHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50TmFtZSBFdmVudCB0byBsaXN0ZW4gZm9yLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIHRvIGV4ZWN1dGUgd2hlbiB0aGV5J3JlIGRvbmUuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5fd2hlbkNvbGxlY3Rpb25Eb25lID0gZnVuY3Rpb24oICRjb2xsZWN0aW9uLCBldmVudE5hbWUsIGNhbGxiYWNrICkge1xuICAgICAgICB2YXIgZG9uZSA9IDA7XG4gICAgICAgIHZhciBpdGVtcyA9ICRjb2xsZWN0aW9uLmxlbmd0aDtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUV2ZW50TmFtZSggZXZ0ICkge1xuICAgICAgICAgICAgaWYgKCBldnQudGFyZ2V0ID09PSBldnQuY3VycmVudFRhcmdldCApIHtcbiAgICAgICAgICAgICAgICAkKCBldnQudGFyZ2V0ICkub2ZmKCBldmVudE5hbWUsIGhhbmRsZUV2ZW50TmFtZSApO1xuICAgICAgICAgICAgICAgIGRvbmUrKztcblxuICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgY2FsbGJhY2sgaWYgYWxsIGl0ZW1zIGhhdmUgZW1pdHRlZCB0aGUgY29ycmVjdCBldmVudC5cbiAgICAgICAgICAgICAgICBpZiAoIGRvbmUgPT09IGl0ZW1zICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9yZW1vdmVUcmFuc2l0aW9uUmVmZXJlbmNlKHJlZmVyZW5jZSk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoIHNlbGYgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVmZXJlbmNlID0ge1xuICAgICAgICAgICAgJGVsZW1lbnQ6ICRjb2xsZWN0aW9uLFxuICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlRXZlbnROYW1lXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQmluZCB0aGUgZXZlbnQgdG8gYWxsIGl0ZW1zLlxuICAgICAgICAkY29sbGVjdGlvbi5vbiggZXZlbnROYW1lLCBoYW5kbGVFdmVudE5hbWUgKTtcblxuICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRyYW5zaXRpb25lbmQgZXZlbnRzIHNvIHRoZXkgY2FuIGJlIHJlbW92ZWQuXG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25zLnB1c2gocmVmZXJlbmNlKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIGEgY2FsbGJhY2sgYWZ0ZXIgalF1ZXJ5IGBhbmltYXRlYCBmb3IgYSBjb2xsZWN0aW9uIGhhcyBmaW5pc2hlZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayB0byBleGVjdXRlIHdoZW4gdGhleSdyZSBkb25lLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuX3doZW5BbmltYXRpb25zRG9uZSA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgICAgICAgJC53aGVuLmFwcGx5KCBudWxsLCB0aGlzLl9hbmltYXRpb25zICkuYWx3YXlzKCAkLnByb3h5KCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbnMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNNb3ZlbWVudENhbmNlbGVkKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbCggdGhpcyApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0aGlzICkpO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFB1YmxpYyBNZXRob2RzXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFnaWMuIFRoaXMgaXMgd2hhdCBtYWtlcyB0aGUgcGx1Z2luICdzaHVmZmxlJ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSBbY2F0ZWdvcnldIENhdGVnb3J5IHRvIGZpbHRlciBieS4gQ2FuIGJlIGEgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW3NvcnRPYmpdIEEgc29ydCBvYmplY3Qgd2hpY2ggY2FuIHNvcnQgdGhlIGZpbHRlcmVkIHNldFxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLnNodWZmbGUgPSBmdW5jdGlvbiggY2F0ZWdvcnksIHNvcnRPYmogKSB7XG4gICAgICAgIGlmICggIXRoaXMuZW5hYmxlZCApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggIWNhdGVnb3J5ICkge1xuICAgICAgICAgICAgY2F0ZWdvcnkgPSBBTExfSVRFTVM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9maWx0ZXIoIGNhdGVnb3J5ICk7XG5cbiAgICAgICAgLy8gSG93IG1hbnkgZmlsdGVyZWQgZWxlbWVudHM/XG4gICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1Db3VudCgpO1xuXG4gICAgICAgIC8vIFNocmluayBlYWNoIGNvbmNlYWxlZCBpdGVtXG4gICAgICAgIHRoaXMuX3NocmluaygpO1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0cmFuc2Zvcm1zIG9uIC5maWx0ZXJlZCBlbGVtZW50cyBzbyB0aGV5IHdpbGwgYW5pbWF0ZSB0byB0aGVpciBuZXcgcG9zaXRpb25zXG4gICAgICAgIHRoaXMuc29ydCggc29ydE9iaiApO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIC5maWx0ZXJlZCBlbGVtZW50cywgc29ydHMgdGhlbSwgYW5kIHBhc3NlcyB0aGVtIHRvIGxheW91dC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0cyB0aGUgb3B0aW9ucyBvYmplY3QgZm9yIHRoZSBzb3J0ZWQgcGx1Z2luXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uKCBvcHRzICkge1xuICAgICAgICBpZiAoIHRoaXMuZW5hYmxlZCApIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0Q29scygpO1xuXG4gICAgICAgICAgICB2YXIgc29ydE9wdGlvbnMgPSBvcHRzIHx8IHRoaXMubGFzdFNvcnQ7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSB0aGlzLl9nZXRGaWx0ZXJlZEl0ZW1zKCkuc29ydGVkKCBzb3J0T3B0aW9ucyApO1xuXG4gICAgICAgICAgICB0aGlzLl9sYXlvdXQoIGl0ZW1zICk7XG5cbiAgICAgICAgICAgIHRoaXMubGFzdFNvcnQgPSBzb3J0T3B0aW9ucztcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIFJlcG9zaXRpb24gZXZlcnl0aGluZy5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzT25seUxheW91dCBJZiB0cnVlLCBjb2x1bW4gYW5kIGd1dHRlciB3aWR0aHMgd29uJ3QgYmVcbiAgICAgKiAgICAgcmVjYWxjdWxhdGVkLlxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCBpc09ubHlMYXlvdXQgKSB7XG4gICAgICAgIGlmICggdGhpcy5lbmFibGVkICkge1xuXG4gICAgICAgICAgICBpZiAoICFpc09ubHlMYXlvdXQgKSB7XG4gICAgICAgICAgICAgICAgLy8gR2V0IHVwZGF0ZWQgY29sQ291bnRcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRDb2x1bW5zKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIExheW91dCBpdGVtc1xuICAgICAgICAgICAgdGhpcy5zb3J0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGB1cGRhdGUoKWAgaWYgeW91IGRvbid0IG5lZWQgdGhlIGNvbHVtbnMgYW5kIGd1dHRlcnMgdXBkYXRlZFxuICAgICAqIE1heWJlIGFuIGltYWdlIGluc2lkZSBgc2h1ZmZsZWAgbG9hZGVkIChhbmQgbm93IGhhcyBhIGhlaWdodCksIHdoaWNoIG1lYW5zIGNhbGN1bGF0aW9uc1xuICAgICAqIGNvdWxkIGJlIG9mZi5cbiAgICAgKi9cbiAgICBTaHVmZmxlLnByb3RvdHlwZS5sYXlvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBOZXcgaXRlbXMgaGF2ZSBiZWVuIGFwcGVuZGVkIHRvIHNodWZmbGUuIEZhZGUgdGhlbSBpbiBzZXF1ZW50aWFsbHlcbiAgICAgKiBAcGFyYW0ge2pRdWVyeX0gJG5ld0l0ZW1zIGpRdWVyeSBjb2xsZWN0aW9uIG9mIG5ldyBpdGVtc1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2FkZFRvRW5kPWZhbHNlXSBJZiB0cnVlLCBuZXcgaXRlbXMgd2lsbCBiZSBhZGRlZCB0byB0aGUgZW5kIC8gYm90dG9tXG4gICAgICogICAgIG9mIHRoZSBpdGVtcy4gSWYgbm90IHRydWUsIGl0ZW1zIHdpbGwgYmUgbWl4ZWQgaW4gd2l0aCB0aGUgY3VycmVudCBzb3J0IG9yZGVyLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzU2VxdWVudGlhbD10cnVlXSBJZiBmYWxzZSwgbmV3IGl0ZW1zIHdvbid0IHNlcXVlbnRpYWxseSBmYWRlIGluXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuYXBwZW5kZWQgPSBmdW5jdGlvbiggJG5ld0l0ZW1zLCBhZGRUb0VuZCwgaXNTZXF1ZW50aWFsICkge1xuICAgICAgICB0aGlzLl9hZGRJdGVtcyggJG5ld0l0ZW1zLCBhZGRUb0VuZCA9PT0gdHJ1ZSwgaXNTZXF1ZW50aWFsICE9PSBmYWxzZSApO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIERpc2FibGVzIHNodWZmbGUgZnJvbSB1cGRhdGluZyBkaW1lbnNpb25zIGFuZCBsYXlvdXQgb24gcmVzaXplXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBFbmFibGVzIHNodWZmbGUgYWdhaW5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc1VwZGF0ZUxheW91dD10cnVlXSBpZiB1bmRlZmluZWQsIHNodWZmbGUgd2lsbCB1cGRhdGUgY29sdW1ucyBhbmQgZ3V0dGVyc1xuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uKCBpc1VwZGF0ZUxheW91dCApIHtcbiAgICAgICAgdGhpcy5lbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKCBpc1VwZGF0ZUxheW91dCAhPT0gZmFsc2UgKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIDEgb3IgbW9yZSBzaHVmZmxlIGl0ZW1zXG4gICAgICogQHBhcmFtIHtqUXVlcnl9ICRjb2xsZWN0aW9uIEEgalF1ZXJ5IG9iamVjdCBjb250YWluaW5nIG9uZSBvciBtb3JlIGVsZW1lbnQgaW4gc2h1ZmZsZVxuICAgICAqIEByZXR1cm4ge1NodWZmbGV9IFRoZSBzaHVmZmxlIG9iamVjdFxuICAgICAqL1xuICAgIFNodWZmbGUucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCAkY29sbGVjdGlvbiApIHtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzbid0IGEganF1ZXJ5IG9iamVjdCwgZXhpdFxuICAgICAgICBpZiAoICEkY29sbGVjdGlvbi5sZW5ndGggfHwgISRjb2xsZWN0aW9uLmpxdWVyeSApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlbW92ZWQoKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGNvbGxlY3Rpb24gaW4gdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICAkY29sbGVjdGlvbi5yZW1vdmUoKTtcblxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoaW5ncyBub3cgdGhhdCBlbGVtZW50cyBoYXZlIGJlZW4gcmVtb3ZlZC5cbiAgICAgICAgICAgIHRoaXMuJGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXMoKTtcbiAgICAgICAgICAgIHRoaXMuX3VwZGF0ZUl0ZW1Db3VudCgpO1xuXG4gICAgICAgICAgICB0aGlzLl9maXJlKCBTaHVmZmxlLkV2ZW50VHlwZS5SRU1PVkVELCBbICRjb2xsZWN0aW9uLCB0aGlzIF0gKTtcblxuICAgICAgICAgICAgLy8gTGV0IGl0IGdldCBnYXJiYWdlIGNvbGxlY3RlZFxuICAgICAgICAgICAgJGNvbGxlY3Rpb24gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGlkZSBjb2xsZWN0aW9uIGZpcnN0LlxuICAgICAgICB0aGlzLl90b2dnbGVGaWx0ZXJDbGFzc2VzKCAkKCksICRjb2xsZWN0aW9uICk7XG4gICAgICAgIHRoaXMuX3NocmluayggJGNvbGxlY3Rpb24gKTtcblxuICAgICAgICB0aGlzLnNvcnQoKTtcblxuICAgICAgICB0aGlzLiRlbC5vbmUoIFNodWZmbGUuRXZlbnRUeXBlLkxBWU9VVCArICcuJyArIFNIVUZGTEUsICQucHJveHkoIGhhbmRsZVJlbW92ZWQsIHRoaXMgKSApO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3lzIHNodWZmbGUsIHJlbW92ZXMgZXZlbnRzLCBzdHlsZXMsIGFuZCBjbGFzc2VzXG4gICAgICovXG4gICAgU2h1ZmZsZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHNodWZmbGUgaW5zdGFuY2Ugb24gdGhlIHBhZ2UsXG4gICAgICAgIC8vIHJlbW92aW5nIHRoZSByZXNpemUgaGFuZGxlciBmcm9tIHRoZSB3aW5kb3cgd291bGQgcmVtb3ZlIHRoZW1cbiAgICAgICAgLy8gYWxsLiBUaGlzIGlzIHdoeSBhIHVuaXF1ZSB2YWx1ZSBpcyBuZWVkZWQuXG4gICAgICAgICR3aW5kb3cub2ZmKCcuJyArIHRoaXMudW5pcXVlKTtcblxuICAgICAgICAvLyBSZXNldCBjb250YWluZXIgc3R5bGVzXG4gICAgICAgIHRoaXMuJGVsXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MoIFNIVUZGTEUgKVxuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ3N0eWxlJylcbiAgICAgICAgICAgIC5yZW1vdmVEYXRhKCBTSFVGRkxFICk7XG5cbiAgICAgICAgLy8gUmVzZXQgaW5kaXZpZHVhbCBpdGVtIHN0eWxlc1xuICAgICAgICB0aGlzLiRpdGVtc1xuICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ3N0eWxlJylcbiAgICAgICAgICAgIC5yZW1vdmVEYXRhKCdwb2ludCcpXG4gICAgICAgICAgICAucmVtb3ZlRGF0YSgnc2NhbGUnKVxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKFtcbiAgICAgICAgICAgICAgICBTaHVmZmxlLkNsYXNzTmFtZS5DT05DRUFMRUQsXG4gICAgICAgICAgICAgICAgU2h1ZmZsZS5DbGFzc05hbWUuRklMVEVSRUQsXG4gICAgICAgICAgICAgICAgU2h1ZmZsZS5DbGFzc05hbWUuU0hVRkZMRV9JVEVNXG4gICAgICAgICAgICBdLmpvaW4oJyAnKSk7XG5cbiAgICAgICAgLy8gTnVsbCBET00gcmVmZXJlbmNlc1xuICAgICAgICB0aGlzLiRpdGVtcyA9IG51bGw7XG4gICAgICAgIHRoaXMuJGVsID0gbnVsbDtcbiAgICAgICAgdGhpcy5zaXplciA9IG51bGw7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb25zID0gbnVsbDtcblxuICAgICAgICAvLyBTZXQgYSBmbGFnIHNvIGlmIGEgZGVib3VuY2VkIHJlc2l6ZSBoYXMgYmVlbiB0cmlnZ2VyZWQsXG4gICAgICAgIC8vIGl0IGNhbiBmaXJzdCBjaGVjayBpZiBpdCBpcyBhY3R1YWxseSBkZXN0cm95ZWQgYW5kIG5vdCBkb2luZyBhbnl0aGluZ1xuICAgICAgICB0aGlzLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfTtcblxuXG4vLyBQbHVnaW4gZGVmaW5pdGlvblxuICAgICQuZm4uc2h1ZmZsZSA9IGZ1bmN0aW9uKCBvcHRzICkge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoIHRoaXMgKTtcbiAgICAgICAgICAgIHZhciBzaHVmZmxlID0gJHRoaXMuZGF0YSggU0hVRkZMRSApO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgc3RvcmVkIHNodWZmbGUsIG1ha2UgYSBuZXcgb25lIGFuZCBzYXZlIGl0XG4gICAgICAgICAgICBpZiAoICFzaHVmZmxlICkge1xuICAgICAgICAgICAgICAgIHNodWZmbGUgPSBuZXcgU2h1ZmZsZSggdGhpcywgb3B0cyApO1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoIFNIVUZGTEUsIHNodWZmbGUgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJyAmJiBzaHVmZmxlWyBvcHRzIF0gKSB7XG4gICAgICAgICAgICAgICAgc2h1ZmZsZVsgb3B0cyBdLmFwcGx5KCBzaHVmZmxlLCBhcmdzICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvOTYyODkwLzM3MzQyMlxuICAgIGZ1bmN0aW9uIHJhbmRvbWl6ZSggYXJyYXkgKSB7XG4gICAgICAgIHZhciB0bXAsIGN1cnJlbnQ7XG4gICAgICAgIHZhciB0b3AgPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKCAhdG9wICkge1xuICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKCAtLXRvcCApIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBNYXRoLmZsb29yKCBNYXRoLnJhbmRvbSgpICogKHRvcCArIDEpICk7XG4gICAgICAgICAgICB0bXAgPSBhcnJheVsgY3VycmVudCBdO1xuICAgICAgICAgICAgYXJyYXlbIGN1cnJlbnQgXSA9IGFycmF5WyB0b3AgXTtcbiAgICAgICAgICAgIGFycmF5WyB0b3AgXSA9IHRtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9XG5cblxuLy8gWW91IGNhbiByZXR1cm4gYHVuZGVmaW5lZGAgZnJvbSB0aGUgYGJ5YCBmdW5jdGlvbiB0byByZXZlcnQgdG8gRE9NIG9yZGVyXG4vLyBUaGlzIHBsdWdpbiBkb2VzIE5PVCByZXR1cm4gYSBqUXVlcnkgb2JqZWN0LiBJdCByZXR1cm5zIGEgcGxhaW4gYXJyYXkgYmVjYXVzZVxuLy8galF1ZXJ5IHNvcnRzIGV2ZXJ5dGhpbmcgaW4gRE9NIG9yZGVyLlxuICAgICQuZm4uc29ydGVkID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0cyA9ICQuZXh0ZW5kKHt9LCAkLmZuLnNvcnRlZC5kZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHZhciBhcnIgPSB0aGlzLmdldCgpO1xuICAgICAgICB2YXIgcmV2ZXJ0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCAhYXJyLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICggb3B0cy5yYW5kb21pemUgKSB7XG4gICAgICAgICAgICByZXR1cm4gcmFuZG9taXplKCBhcnIgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNvcnQgdGhlIGVsZW1lbnRzIGJ5IHRoZSBvcHRzLmJ5IGZ1bmN0aW9uLlxuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIG9wdHMuYnksIGRlZmF1bHQgdG8gRE9NIG9yZGVyXG4gICAgICAgIGlmICggJC5pc0Z1bmN0aW9uKCBvcHRzLmJ5ICkgKSB7XG4gICAgICAgICAgICBhcnIuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBFeGl0IGVhcmx5IGlmIHdlIGFscmVhZHkga25vdyB3ZSB3YW50IHRvIHJldmVydFxuICAgICAgICAgICAgICAgIGlmICggcmV2ZXJ0ICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgdmFsQSA9IG9wdHMuYnkoJChhKSk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbEIgPSBvcHRzLmJ5KCQoYikpO1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgYm90aCB2YWx1ZXMgYXJlIHVuZGVmaW5lZCwgdXNlIHRoZSBET00gb3JkZXJcbiAgICAgICAgICAgICAgICBpZiAoIHZhbEEgPT09IHVuZGVmaW5lZCAmJiB2YWxCID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldmVydCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggdmFsQSA8IHZhbEIgfHwgdmFsQSA9PT0gJ3NvcnRGaXJzdCcgfHwgdmFsQiA9PT0gJ3NvcnRMYXN0JyApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICggdmFsQSA+IHZhbEIgfHwgdmFsQSA9PT0gJ3NvcnRMYXN0JyB8fCB2YWxCID09PSAnc29ydEZpcnN0JyApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldmVydCB0byB0aGUgb3JpZ2luYWwgYXJyYXkgaWYgbmVjZXNzYXJ5XG4gICAgICAgIGlmICggcmV2ZXJ0ICkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIG9wdHMucmV2ZXJzZSApIHtcbiAgICAgICAgICAgIGFyci5yZXZlcnNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH07XG5cblxuICAgICQuZm4uc29ydGVkLmRlZmF1bHRzID0ge1xuICAgICAgICByZXZlcnNlOiBmYWxzZSwgLy8gVXNlIGFycmF5LnJldmVyc2UoKSB0byByZXZlcnNlIHRoZSByZXN1bHRzXG4gICAgICAgIGJ5OiBudWxsLCAvLyBTb3J0aW5nIGZ1bmN0aW9uXG4gICAgICAgIHJhbmRvbWl6ZTogZmFsc2UgLy8gSWYgdHJ1ZSwgdGhpcyB3aWxsIHNraXAgdGhlIHNvcnRpbmcgYW5kIHJldHVybiBhIHJhbmRvbWl6ZWQgb3JkZXIgaW4gdGhlIGFycmF5XG4gICAgfTtcblxuICAgIHJldHVybiBTaHVmZmxlO1xuXG59KTtcbiJdLCJmaWxlIjoic2h1ZmZsZS5qcyJ9
