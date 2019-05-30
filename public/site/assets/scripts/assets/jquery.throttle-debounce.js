/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
//
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
//
// About: Release History
//
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
//
// Topic: Note for non-jQuery users
//
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
//
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
    '$:nomunge'; // Used by YUI compressor.

    // Since jQuery really isn't required for this plugin, use `jQuery` as the
    // namespace only if it already exists, otherwise use the `Cowboy` namespace,
    // creating it if necessary.
    var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),

        // Internal method reference.
        jq_throttle;

    // Method: jQuery.throttle
    //
    // Throttle execution of a function. Especially useful for rate limiting
    // execution of handlers on events like resize and scroll. If you want to
    // rate-limit execution of a function to a single time, see the
    // <jQuery.debounce> method.
    //
    // In this visualization, | is a throttled-function call and X is the actual
    // callback execution:
    //
    // > Throttled with `no_trailing` specified as false or unspecified:
    // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
    // > X    X    X    X    X    X        X    X    X    X    X    X
    // >
    // > Throttled with `no_trailing` specified as true:
    // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
    // > X    X    X    X    X             X    X    X    X    X
    //
    // Usage:
    //
    // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
    // >
    // > jQuery('selector').bind( 'someevent', throttled );
    // > jQuery('selector').unbind( 'someevent', throttled );
    //
    // This also works in jQuery 1.4+:
    //
    // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
    // > jQuery('selector').unbind( 'someevent', callback );
    //
    // Arguments:
    //
    //  delay - (Number) A zero-or-greater delay in milliseconds. For event
    //    callbacks, values around 100 or 250 (or even higher) are most useful.
    //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
    //    true, callback will only execute every `delay` milliseconds while the
    //    throttled-function is being called. If no_trailing is false or
    //    unspecified, callback will be executed one final time after the last
    //    throttled-function call. (After the throttled-function has not been
    //    called for `delay` milliseconds, the internal counter is reset)
    //  callback - (Function) A function to be executed after delay milliseconds.
    //    The `this` context and all arguments are passed through, as-is, to
    //    `callback` when the throttled-function is executed.
    //
    // Returns:
    //
    //  (Function) A new, throttled, function.

    $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
        // After wrapper has stopped being called, this timeout ensures that
        // `callback` is executed at the proper times in `throttle` and `end`
        // debounce modes.
        var timeout_id,

            // Keep track of the last time `callback` was executed.
            last_exec = 0;

        // `no_trailing` defaults to falsy.
        if ( typeof no_trailing !== 'boolean' ) {
            debounce_mode = callback;
            callback = no_trailing;
            no_trailing = undefined;
        }

        // The `wrapper` function encapsulates all of the throttling / debouncing
        // functionality and when executed will limit the rate at which `callback`
        // is executed.
        function wrapper() {
            var that = this,
                elapsed = +new Date() - last_exec,
                args = arguments;

            // Execute `callback` and update the `last_exec` timestamp.
            function exec() {
                last_exec = +new Date();
                callback.apply( that, args );
            };

            // If `debounce_mode` is true (at_begin) this is used to clear the flag
            // to allow future `callback` executions.
            function clear() {
                timeout_id = undefined;
            };

            if ( debounce_mode && !timeout_id ) {
                // Since `wrapper` is being called for the first time and
                // `debounce_mode` is true (at_begin), execute `callback`.
                exec();
            }

            // Clear any existing timeout.
            timeout_id && clearTimeout( timeout_id );

            if ( debounce_mode === undefined && elapsed > delay ) {
                // In throttle mode, if `delay` time has been exceeded, execute
                // `callback`.
                exec();

            } else if ( no_trailing !== true ) {
                // In trailing throttle mode, since `delay` time has not been
                // exceeded, schedule `callback` to execute `delay` ms after most
                // recent execution.
                //
                // If `debounce_mode` is true (at_begin), schedule `clear` to execute
                // after `delay` ms.
                //
                // If `debounce_mode` is false (at end), schedule `callback` to
                // execute after `delay` ms.
                timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
            }
        };

        // Set the guid of `wrapper` function to the same of original callback, so
        // it can be removed in jQuery 1.4+ .unbind or .die by using the original
        // callback as a reference.
        if ( $.guid ) {
            wrapper.guid = callback.guid = callback.guid || $.guid++;
        }

        // Return the wrapper function.
        return wrapper;
    };

    // Method: jQuery.debounce
    //
    // Debounce execution of a function. Debouncing, unlike throttling,
    // guarantees that a function is only executed a single time, either at the
    // very beginning of a series of calls, or at the very end. If you want to
    // simply rate-limit execution of a function, see the <jQuery.throttle>
    // method.
    //
    // In this visualization, | is a debounced-function call and X is the actual
    // callback execution:
    //
    // > Debounced with `at_begin` specified as false or unspecified:
    // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
    // >                          X                                 X
    // >
    // > Debounced with `at_begin` specified as true:
    // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
    // > X                                 X
    //
    // Usage:
    //
    // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
    // >
    // > jQuery('selector').bind( 'someevent', debounced );
    // > jQuery('selector').unbind( 'someevent', debounced );
    //
    // This also works in jQuery 1.4+:
    //
    // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
    // > jQuery('selector').unbind( 'someevent', callback );
    //
    // Arguments:
    //
    //  delay - (Number) A zero-or-greater delay in milliseconds. For event
    //    callbacks, values around 100 or 250 (or even higher) are most useful.
    //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
    //    unspecified, callback will only be executed `delay` milliseconds after
    //    the last debounced-function call. If at_begin is true, callback will be
    //    executed only at the first debounced-function call. (After the
    //    throttled-function has not been called for `delay` milliseconds, the
    //    internal counter is reset)
    //  callback - (Function) A function to be executed after delay milliseconds.
    //    The `this` context and all arguments are passed through, as-is, to
    //    `callback` when the debounced-function is executed.
    //
    // Returns:
    //
    //  (Function) A new, debounced, function.

    $.debounce = function( delay, at_begin, callback ) {
        return callback === undefined
            ? jq_throttle( delay, at_begin, false )
            : jq_throttle( delay, callback, at_begin !== false );
    };

})(this);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkudGhyb3R0bGUtZGVib3VuY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBqUXVlcnkgdGhyb3R0bGUgLyBkZWJvdW5jZSAtIHYxLjEgLSAzLzcvMjAxMFxuICogaHR0cDovL2JlbmFsbWFuLmNvbS9wcm9qZWN0cy9qcXVlcnktdGhyb3R0bGUtZGVib3VuY2UtcGx1Z2luL1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMCBcIkNvd2JveVwiIEJlbiBBbG1hblxuICogRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGFuZCBHUEwgbGljZW5zZXMuXG4gKiBodHRwOi8vYmVuYWxtYW4uY29tL2Fib3V0L2xpY2Vuc2UvXG4gKi9cblxuLy8gU2NyaXB0OiBqUXVlcnkgdGhyb3R0bGUgLyBkZWJvdW5jZTogU29tZXRpbWVzLCBsZXNzIGlzIG1vcmUhXG4vL1xuLy8gKlZlcnNpb246IDEuMSwgTGFzdCB1cGRhdGVkOiAzLzcvMjAxMCpcbi8vXG4vLyBQcm9qZWN0IEhvbWUgLSBodHRwOi8vYmVuYWxtYW4uY29tL3Byb2plY3RzL2pxdWVyeS10aHJvdHRsZS1kZWJvdW5jZS1wbHVnaW4vXG4vLyBHaXRIdWIgICAgICAgLSBodHRwOi8vZ2l0aHViLmNvbS9jb3dib3kvanF1ZXJ5LXRocm90dGxlLWRlYm91bmNlL1xuLy8gU291cmNlICAgICAgIC0gaHR0cDovL2dpdGh1Yi5jb20vY293Ym95L2pxdWVyeS10aHJvdHRsZS1kZWJvdW5jZS9yYXcvbWFzdGVyL2pxdWVyeS5iYS10aHJvdHRsZS1kZWJvdW5jZS5qc1xuLy8gKE1pbmlmaWVkKSAgIC0gaHR0cDovL2dpdGh1Yi5jb20vY293Ym95L2pxdWVyeS10aHJvdHRsZS1kZWJvdW5jZS9yYXcvbWFzdGVyL2pxdWVyeS5iYS10aHJvdHRsZS1kZWJvdW5jZS5taW4uanMgKDAuN2tiKVxuLy9cbi8vIEFib3V0OiBMaWNlbnNlXG4vL1xuLy8gQ29weXJpZ2h0IChjKSAyMDEwIFwiQ293Ym95XCIgQmVuIEFsbWFuLFxuLy8gRHVhbCBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGFuZCBHUEwgbGljZW5zZXMuXG4vLyBodHRwOi8vYmVuYWxtYW4uY29tL2Fib3V0L2xpY2Vuc2UvXG4vL1xuLy8gQWJvdXQ6IEV4YW1wbGVzXG4vL1xuLy8gVGhlc2Ugd29ya2luZyBleGFtcGxlcywgY29tcGxldGUgd2l0aCBmdWxseSBjb21tZW50ZWQgY29kZSwgaWxsdXN0cmF0ZSBhIGZld1xuLy8gd2F5cyBpbiB3aGljaCB0aGlzIHBsdWdpbiBjYW4gYmUgdXNlZC5cbi8vXG4vLyBUaHJvdHRsZSAtIGh0dHA6Ly9iZW5hbG1hbi5jb20vY29kZS9wcm9qZWN0cy9qcXVlcnktdGhyb3R0bGUtZGVib3VuY2UvZXhhbXBsZXMvdGhyb3R0bGUvXG4vLyBEZWJvdW5jZSAtIGh0dHA6Ly9iZW5hbG1hbi5jb20vY29kZS9wcm9qZWN0cy9qcXVlcnktdGhyb3R0bGUtZGVib3VuY2UvZXhhbXBsZXMvZGVib3VuY2UvXG4vL1xuLy8gQWJvdXQ6IFN1cHBvcnQgYW5kIFRlc3Rpbmdcbi8vXG4vLyBJbmZvcm1hdGlvbiBhYm91dCB3aGF0IHZlcnNpb24gb3IgdmVyc2lvbnMgb2YgalF1ZXJ5IHRoaXMgcGx1Z2luIGhhcyBiZWVuXG4vLyB0ZXN0ZWQgd2l0aCwgd2hhdCBicm93c2VycyBpdCBoYXMgYmVlbiB0ZXN0ZWQgaW4sIGFuZCB3aGVyZSB0aGUgdW5pdCB0ZXN0c1xuLy8gcmVzaWRlIChzbyB5b3UgY2FuIHRlc3QgaXQgeW91cnNlbGYpLlxuLy9cbi8vIGpRdWVyeSBWZXJzaW9ucyAtIG5vbmUsIDEuMy4yLCAxLjQuMlxuLy8gQnJvd3NlcnMgVGVzdGVkIC0gSW50ZXJuZXQgRXhwbG9yZXIgNi04LCBGaXJlZm94IDItMy42LCBTYWZhcmkgMy00LCBDaHJvbWUgNC01LCBPcGVyYSA5LjYtMTAuMS5cbi8vIFVuaXQgVGVzdHMgICAgICAtIGh0dHA6Ly9iZW5hbG1hbi5jb20vY29kZS9wcm9qZWN0cy9qcXVlcnktdGhyb3R0bGUtZGVib3VuY2UvdW5pdC9cbi8vXG4vLyBBYm91dDogUmVsZWFzZSBIaXN0b3J5XG4vL1xuLy8gMS4xIC0gKDMvNy8yMDEwKSBGaXhlZCBhIGJ1ZyBpbiA8alF1ZXJ5LnRocm90dGxlPiB3aGVyZSB0cmFpbGluZyBjYWxsYmFja3Ncbi8vICAgICAgIGV4ZWN1dGVkIGxhdGVyIHRoYW4gdGhleSBzaG91bGQuIFJld29ya2VkIGEgZmFpciBhbW91bnQgb2YgaW50ZXJuYWxcbi8vICAgICAgIGxvZ2ljIGFzIHdlbGwuXG4vLyAxLjAgLSAoMy82LzIwMTApIEluaXRpYWwgcmVsZWFzZSBhcyBhIHN0YW5kLWFsb25lIHByb2plY3QuIE1pZ3JhdGVkIG92ZXJcbi8vICAgICAgIGZyb20ganF1ZXJ5LW1pc2MgcmVwbyB2MC40IHRvIGpxdWVyeS10aHJvdHRsZSByZXBvIHYxLjAsIGFkZGVkIHRoZVxuLy8gICAgICAgbm9fdHJhaWxpbmcgdGhyb3R0bGUgcGFyYW1ldGVyIGFuZCBkZWJvdW5jZSBmdW5jdGlvbmFsaXR5LlxuLy9cbi8vIFRvcGljOiBOb3RlIGZvciBub24talF1ZXJ5IHVzZXJzXG4vL1xuLy8galF1ZXJ5IGlzbid0IGFjdHVhbGx5IHJlcXVpcmVkIGZvciB0aGlzIHBsdWdpbiwgYmVjYXVzZSBub3RoaW5nIGludGVybmFsXG4vLyB1c2VzIGFueSBqUXVlcnkgbWV0aG9kcyBvciBwcm9wZXJ0aWVzLiBqUXVlcnkgaXMganVzdCB1c2VkIGFzIGEgbmFtZXNwYWNlXG4vLyB1bmRlciB3aGljaCB0aGVzZSBtZXRob2RzIGNhbiBleGlzdC5cbi8vXG4vLyBTaW5jZSBqUXVlcnkgaXNuJ3QgYWN0dWFsbHkgcmVxdWlyZWQgZm9yIHRoaXMgcGx1Z2luLCBpZiBqUXVlcnkgZG9lc24ndCBleGlzdFxuLy8gd2hlbiB0aGlzIHBsdWdpbiBpcyBsb2FkZWQsIHRoZSBtZXRob2QgZGVzY3JpYmVkIGJlbG93IHdpbGwgYmUgY3JlYXRlZCBpblxuLy8gdGhlIGBDb3dib3lgIG5hbWVzcGFjZS4gVXNhZ2Ugd2lsbCBiZSBleGFjdGx5IHRoZSBzYW1lLCBidXQgaW5zdGVhZCBvZlxuLy8gJC5tZXRob2QoKSBvciBqUXVlcnkubWV0aG9kKCksIHlvdSdsbCBuZWVkIHRvIHVzZSBDb3dib3kubWV0aG9kKCkuXG5cbihmdW5jdGlvbih3aW5kb3csdW5kZWZpbmVkKXtcbiAgICAnJDpub211bmdlJzsgLy8gVXNlZCBieSBZVUkgY29tcHJlc3Nvci5cblxuICAgIC8vIFNpbmNlIGpRdWVyeSByZWFsbHkgaXNuJ3QgcmVxdWlyZWQgZm9yIHRoaXMgcGx1Z2luLCB1c2UgYGpRdWVyeWAgYXMgdGhlXG4gICAgLy8gbmFtZXNwYWNlIG9ubHkgaWYgaXQgYWxyZWFkeSBleGlzdHMsIG90aGVyd2lzZSB1c2UgdGhlIGBDb3dib3lgIG5hbWVzcGFjZSxcbiAgICAvLyBjcmVhdGluZyBpdCBpZiBuZWNlc3NhcnkuXG4gICAgdmFyICQgPSB3aW5kb3cualF1ZXJ5IHx8IHdpbmRvdy5Db3dib3kgfHwgKCB3aW5kb3cuQ293Ym95ID0ge30gKSxcblxuICAgICAgICAvLyBJbnRlcm5hbCBtZXRob2QgcmVmZXJlbmNlLlxuICAgICAgICBqcV90aHJvdHRsZTtcblxuICAgIC8vIE1ldGhvZDogalF1ZXJ5LnRocm90dGxlXG4gICAgLy9cbiAgICAvLyBUaHJvdHRsZSBleGVjdXRpb24gb2YgYSBmdW5jdGlvbi4gRXNwZWNpYWxseSB1c2VmdWwgZm9yIHJhdGUgbGltaXRpbmdcbiAgICAvLyBleGVjdXRpb24gb2YgaGFuZGxlcnMgb24gZXZlbnRzIGxpa2UgcmVzaXplIGFuZCBzY3JvbGwuIElmIHlvdSB3YW50IHRvXG4gICAgLy8gcmF0ZS1saW1pdCBleGVjdXRpb24gb2YgYSBmdW5jdGlvbiB0byBhIHNpbmdsZSB0aW1lLCBzZWUgdGhlXG4gICAgLy8gPGpRdWVyeS5kZWJvdW5jZT4gbWV0aG9kLlxuICAgIC8vXG4gICAgLy8gSW4gdGhpcyB2aXN1YWxpemF0aW9uLCB8IGlzIGEgdGhyb3R0bGVkLWZ1bmN0aW9uIGNhbGwgYW5kIFggaXMgdGhlIGFjdHVhbFxuICAgIC8vIGNhbGxiYWNrIGV4ZWN1dGlvbjpcbiAgICAvL1xuICAgIC8vID4gVGhyb3R0bGVkIHdpdGggYG5vX3RyYWlsaW5nYCBzcGVjaWZpZWQgYXMgZmFsc2Ugb3IgdW5zcGVjaWZpZWQ6XG4gICAgLy8gPiB8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8IChwYXVzZSkgfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fFxuICAgIC8vID4gWCAgICBYICAgIFggICAgWCAgICBYICAgIFggICAgICAgIFggICAgWCAgICBYICAgIFggICAgWCAgICBYXG4gICAgLy8gPlxuICAgIC8vID4gVGhyb3R0bGVkIHdpdGggYG5vX3RyYWlsaW5nYCBzcGVjaWZpZWQgYXMgdHJ1ZTpcbiAgICAvLyA+IHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHwgKHBhdXNlKSB8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8XG4gICAgLy8gPiBYICAgIFggICAgWCAgICBYICAgIFggICAgICAgICAgICAgWCAgICBYICAgIFggICAgWCAgICBYXG4gICAgLy9cbiAgICAvLyBVc2FnZTpcbiAgICAvL1xuICAgIC8vID4gdmFyIHRocm90dGxlZCA9IGpRdWVyeS50aHJvdHRsZSggZGVsYXksIFsgbm9fdHJhaWxpbmcsIF0gY2FsbGJhY2sgKTtcbiAgICAvLyA+XG4gICAgLy8gPiBqUXVlcnkoJ3NlbGVjdG9yJykuYmluZCggJ3NvbWVldmVudCcsIHRocm90dGxlZCApO1xuICAgIC8vID4galF1ZXJ5KCdzZWxlY3RvcicpLnVuYmluZCggJ3NvbWVldmVudCcsIHRocm90dGxlZCApO1xuICAgIC8vXG4gICAgLy8gVGhpcyBhbHNvIHdvcmtzIGluIGpRdWVyeSAxLjQrOlxuICAgIC8vXG4gICAgLy8gPiBqUXVlcnkoJ3NlbGVjdG9yJykuYmluZCggJ3NvbWVldmVudCcsIGpRdWVyeS50aHJvdHRsZSggZGVsYXksIFsgbm9fdHJhaWxpbmcsIF0gY2FsbGJhY2sgKSApO1xuICAgIC8vID4galF1ZXJ5KCdzZWxlY3RvcicpLnVuYmluZCggJ3NvbWVldmVudCcsIGNhbGxiYWNrICk7XG4gICAgLy9cbiAgICAvLyBBcmd1bWVudHM6XG4gICAgLy9cbiAgICAvLyAgZGVsYXkgLSAoTnVtYmVyKSBBIHplcm8tb3ItZ3JlYXRlciBkZWxheSBpbiBtaWxsaXNlY29uZHMuIEZvciBldmVudFxuICAgIC8vICAgIGNhbGxiYWNrcywgdmFsdWVzIGFyb3VuZCAxMDAgb3IgMjUwIChvciBldmVuIGhpZ2hlcikgYXJlIG1vc3QgdXNlZnVsLlxuICAgIC8vICBub190cmFpbGluZyAtIChCb29sZWFuKSBPcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2UuIElmIG5vX3RyYWlsaW5nIGlzXG4gICAgLy8gICAgdHJ1ZSwgY2FsbGJhY2sgd2lsbCBvbmx5IGV4ZWN1dGUgZXZlcnkgYGRlbGF5YCBtaWxsaXNlY29uZHMgd2hpbGUgdGhlXG4gICAgLy8gICAgdGhyb3R0bGVkLWZ1bmN0aW9uIGlzIGJlaW5nIGNhbGxlZC4gSWYgbm9fdHJhaWxpbmcgaXMgZmFsc2Ugb3JcbiAgICAvLyAgICB1bnNwZWNpZmllZCwgY2FsbGJhY2sgd2lsbCBiZSBleGVjdXRlZCBvbmUgZmluYWwgdGltZSBhZnRlciB0aGUgbGFzdFxuICAgIC8vICAgIHRocm90dGxlZC1mdW5jdGlvbiBjYWxsLiAoQWZ0ZXIgdGhlIHRocm90dGxlZC1mdW5jdGlvbiBoYXMgbm90IGJlZW5cbiAgICAvLyAgICBjYWxsZWQgZm9yIGBkZWxheWAgbWlsbGlzZWNvbmRzLCB0aGUgaW50ZXJuYWwgY291bnRlciBpcyByZXNldClcbiAgICAvLyAgY2FsbGJhY2sgLSAoRnVuY3Rpb24pIEEgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgZGVsYXkgbWlsbGlzZWNvbmRzLlxuICAgIC8vICAgIFRoZSBgdGhpc2AgY29udGV4dCBhbmQgYWxsIGFyZ3VtZW50cyBhcmUgcGFzc2VkIHRocm91Z2gsIGFzLWlzLCB0b1xuICAgIC8vICAgIGBjYWxsYmFja2Agd2hlbiB0aGUgdGhyb3R0bGVkLWZ1bmN0aW9uIGlzIGV4ZWN1dGVkLlxuICAgIC8vXG4gICAgLy8gUmV0dXJuczpcbiAgICAvL1xuICAgIC8vICAoRnVuY3Rpb24pIEEgbmV3LCB0aHJvdHRsZWQsIGZ1bmN0aW9uLlxuXG4gICAgJC50aHJvdHRsZSA9IGpxX3Rocm90dGxlID0gZnVuY3Rpb24oIGRlbGF5LCBub190cmFpbGluZywgY2FsbGJhY2ssIGRlYm91bmNlX21vZGUgKSB7XG4gICAgICAgIC8vIEFmdGVyIHdyYXBwZXIgaGFzIHN0b3BwZWQgYmVpbmcgY2FsbGVkLCB0aGlzIHRpbWVvdXQgZW5zdXJlcyB0aGF0XG4gICAgICAgIC8vIGBjYWxsYmFja2AgaXMgZXhlY3V0ZWQgYXQgdGhlIHByb3BlciB0aW1lcyBpbiBgdGhyb3R0bGVgIGFuZCBgZW5kYFxuICAgICAgICAvLyBkZWJvdW5jZSBtb2Rlcy5cbiAgICAgICAgdmFyIHRpbWVvdXRfaWQsXG5cbiAgICAgICAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGxhc3QgdGltZSBgY2FsbGJhY2tgIHdhcyBleGVjdXRlZC5cbiAgICAgICAgICAgIGxhc3RfZXhlYyA9IDA7XG5cbiAgICAgICAgLy8gYG5vX3RyYWlsaW5nYCBkZWZhdWx0cyB0byBmYWxzeS5cbiAgICAgICAgaWYgKCB0eXBlb2Ygbm9fdHJhaWxpbmcgIT09ICdib29sZWFuJyApIHtcbiAgICAgICAgICAgIGRlYm91bmNlX21vZGUgPSBjYWxsYmFjaztcbiAgICAgICAgICAgIGNhbGxiYWNrID0gbm9fdHJhaWxpbmc7XG4gICAgICAgICAgICBub190cmFpbGluZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZSBgd3JhcHBlcmAgZnVuY3Rpb24gZW5jYXBzdWxhdGVzIGFsbCBvZiB0aGUgdGhyb3R0bGluZyAvIGRlYm91bmNpbmdcbiAgICAgICAgLy8gZnVuY3Rpb25hbGl0eSBhbmQgd2hlbiBleGVjdXRlZCB3aWxsIGxpbWl0IHRoZSByYXRlIGF0IHdoaWNoIGBjYWxsYmFja2BcbiAgICAgICAgLy8gaXMgZXhlY3V0ZWQuXG4gICAgICAgIGZ1bmN0aW9uIHdyYXBwZXIoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZWxhcHNlZCA9ICtuZXcgRGF0ZSgpIC0gbGFzdF9leGVjLFxuICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgICAgICAgIC8vIEV4ZWN1dGUgYGNhbGxiYWNrYCBhbmQgdXBkYXRlIHRoZSBgbGFzdF9leGVjYCB0aW1lc3RhbXAuXG4gICAgICAgICAgICBmdW5jdGlvbiBleGVjKCkge1xuICAgICAgICAgICAgICAgIGxhc3RfZXhlYyA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KCB0aGF0LCBhcmdzICk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAvLyBJZiBgZGVib3VuY2VfbW9kZWAgaXMgdHJ1ZSAoYXRfYmVnaW4pIHRoaXMgaXMgdXNlZCB0byBjbGVhciB0aGUgZmxhZ1xuICAgICAgICAgICAgLy8gdG8gYWxsb3cgZnV0dXJlIGBjYWxsYmFja2AgZXhlY3V0aW9ucy5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgICAgIHRpbWVvdXRfaWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAoIGRlYm91bmNlX21vZGUgJiYgIXRpbWVvdXRfaWQgKSB7XG4gICAgICAgICAgICAgICAgLy8gU2luY2UgYHdyYXBwZXJgIGlzIGJlaW5nIGNhbGxlZCBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kXG4gICAgICAgICAgICAgICAgLy8gYGRlYm91bmNlX21vZGVgIGlzIHRydWUgKGF0X2JlZ2luKSwgZXhlY3V0ZSBgY2FsbGJhY2tgLlxuICAgICAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIHRpbWVvdXQuXG4gICAgICAgICAgICB0aW1lb3V0X2lkICYmIGNsZWFyVGltZW91dCggdGltZW91dF9pZCApO1xuXG4gICAgICAgICAgICBpZiAoIGRlYm91bmNlX21vZGUgPT09IHVuZGVmaW5lZCAmJiBlbGFwc2VkID4gZGVsYXkgKSB7XG4gICAgICAgICAgICAgICAgLy8gSW4gdGhyb3R0bGUgbW9kZSwgaWYgYGRlbGF5YCB0aW1lIGhhcyBiZWVuIGV4Y2VlZGVkLCBleGVjdXRlXG4gICAgICAgICAgICAgICAgLy8gYGNhbGxiYWNrYC5cbiAgICAgICAgICAgICAgICBleGVjKCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIG5vX3RyYWlsaW5nICE9PSB0cnVlICkge1xuICAgICAgICAgICAgICAgIC8vIEluIHRyYWlsaW5nIHRocm90dGxlIG1vZGUsIHNpbmNlIGBkZWxheWAgdGltZSBoYXMgbm90IGJlZW5cbiAgICAgICAgICAgICAgICAvLyBleGNlZWRlZCwgc2NoZWR1bGUgYGNhbGxiYWNrYCB0byBleGVjdXRlIGBkZWxheWAgbXMgYWZ0ZXIgbW9zdFxuICAgICAgICAgICAgICAgIC8vIHJlY2VudCBleGVjdXRpb24uXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBJZiBgZGVib3VuY2VfbW9kZWAgaXMgdHJ1ZSAoYXRfYmVnaW4pLCBzY2hlZHVsZSBgY2xlYXJgIHRvIGV4ZWN1dGVcbiAgICAgICAgICAgICAgICAvLyBhZnRlciBgZGVsYXlgIG1zLlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgLy8gSWYgYGRlYm91bmNlX21vZGVgIGlzIGZhbHNlIChhdCBlbmQpLCBzY2hlZHVsZSBgY2FsbGJhY2tgIHRvXG4gICAgICAgICAgICAgICAgLy8gZXhlY3V0ZSBhZnRlciBgZGVsYXlgIG1zLlxuICAgICAgICAgICAgICAgIHRpbWVvdXRfaWQgPSBzZXRUaW1lb3V0KCBkZWJvdW5jZV9tb2RlID8gY2xlYXIgOiBleGVjLCBkZWJvdW5jZV9tb2RlID09PSB1bmRlZmluZWQgPyBkZWxheSAtIGVsYXBzZWQgOiBkZWxheSApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgZ3VpZCBvZiBgd3JhcHBlcmAgZnVuY3Rpb24gdG8gdGhlIHNhbWUgb2Ygb3JpZ2luYWwgY2FsbGJhY2ssIHNvXG4gICAgICAgIC8vIGl0IGNhbiBiZSByZW1vdmVkIGluIGpRdWVyeSAxLjQrIC51bmJpbmQgb3IgLmRpZSBieSB1c2luZyB0aGUgb3JpZ2luYWxcbiAgICAgICAgLy8gY2FsbGJhY2sgYXMgYSByZWZlcmVuY2UuXG4gICAgICAgIGlmICggJC5ndWlkICkge1xuICAgICAgICAgICAgd3JhcHBlci5ndWlkID0gY2FsbGJhY2suZ3VpZCA9IGNhbGxiYWNrLmd1aWQgfHwgJC5ndWlkKys7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gdGhlIHdyYXBwZXIgZnVuY3Rpb24uXG4gICAgICAgIHJldHVybiB3cmFwcGVyO1xuICAgIH07XG5cbiAgICAvLyBNZXRob2Q6IGpRdWVyeS5kZWJvdW5jZVxuICAgIC8vXG4gICAgLy8gRGVib3VuY2UgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24uIERlYm91bmNpbmcsIHVubGlrZSB0aHJvdHRsaW5nLFxuICAgIC8vIGd1YXJhbnRlZXMgdGhhdCBhIGZ1bmN0aW9uIGlzIG9ubHkgZXhlY3V0ZWQgYSBzaW5nbGUgdGltZSwgZWl0aGVyIGF0IHRoZVxuICAgIC8vIHZlcnkgYmVnaW5uaW5nIG9mIGEgc2VyaWVzIG9mIGNhbGxzLCBvciBhdCB0aGUgdmVyeSBlbmQuIElmIHlvdSB3YW50IHRvXG4gICAgLy8gc2ltcGx5IHJhdGUtbGltaXQgZXhlY3V0aW9uIG9mIGEgZnVuY3Rpb24sIHNlZSB0aGUgPGpRdWVyeS50aHJvdHRsZT5cbiAgICAvLyBtZXRob2QuXG4gICAgLy9cbiAgICAvLyBJbiB0aGlzIHZpc3VhbGl6YXRpb24sIHwgaXMgYSBkZWJvdW5jZWQtZnVuY3Rpb24gY2FsbCBhbmQgWCBpcyB0aGUgYWN0dWFsXG4gICAgLy8gY2FsbGJhY2sgZXhlY3V0aW9uOlxuICAgIC8vXG4gICAgLy8gPiBEZWJvdW5jZWQgd2l0aCBgYXRfYmVnaW5gIHNwZWNpZmllZCBhcyBmYWxzZSBvciB1bnNwZWNpZmllZDpcbiAgICAvLyA+IHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHwgKHBhdXNlKSB8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8XG4gICAgLy8gPiAgICAgICAgICAgICAgICAgICAgICAgICAgWCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFhcbiAgICAvLyA+XG4gICAgLy8gPiBEZWJvdW5jZWQgd2l0aCBgYXRfYmVnaW5gIHNwZWNpZmllZCBhcyB0cnVlOlxuICAgIC8vID4gfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fCAocGF1c2UpIHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHxcbiAgICAvLyA+IFggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBYXG4gICAgLy9cbiAgICAvLyBVc2FnZTpcbiAgICAvL1xuICAgIC8vID4gdmFyIGRlYm91bmNlZCA9IGpRdWVyeS5kZWJvdW5jZSggZGVsYXksIFsgYXRfYmVnaW4sIF0gY2FsbGJhY2sgKTtcbiAgICAvLyA+XG4gICAgLy8gPiBqUXVlcnkoJ3NlbGVjdG9yJykuYmluZCggJ3NvbWVldmVudCcsIGRlYm91bmNlZCApO1xuICAgIC8vID4galF1ZXJ5KCdzZWxlY3RvcicpLnVuYmluZCggJ3NvbWVldmVudCcsIGRlYm91bmNlZCApO1xuICAgIC8vXG4gICAgLy8gVGhpcyBhbHNvIHdvcmtzIGluIGpRdWVyeSAxLjQrOlxuICAgIC8vXG4gICAgLy8gPiBqUXVlcnkoJ3NlbGVjdG9yJykuYmluZCggJ3NvbWVldmVudCcsIGpRdWVyeS5kZWJvdW5jZSggZGVsYXksIFsgYXRfYmVnaW4sIF0gY2FsbGJhY2sgKSApO1xuICAgIC8vID4galF1ZXJ5KCdzZWxlY3RvcicpLnVuYmluZCggJ3NvbWVldmVudCcsIGNhbGxiYWNrICk7XG4gICAgLy9cbiAgICAvLyBBcmd1bWVudHM6XG4gICAgLy9cbiAgICAvLyAgZGVsYXkgLSAoTnVtYmVyKSBBIHplcm8tb3ItZ3JlYXRlciBkZWxheSBpbiBtaWxsaXNlY29uZHMuIEZvciBldmVudFxuICAgIC8vICAgIGNhbGxiYWNrcywgdmFsdWVzIGFyb3VuZCAxMDAgb3IgMjUwIChvciBldmVuIGhpZ2hlcikgYXJlIG1vc3QgdXNlZnVsLlxuICAgIC8vICBhdF9iZWdpbiAtIChCb29sZWFuKSBPcHRpb25hbCwgZGVmYXVsdHMgdG8gZmFsc2UuIElmIGF0X2JlZ2luIGlzIGZhbHNlIG9yXG4gICAgLy8gICAgdW5zcGVjaWZpZWQsIGNhbGxiYWNrIHdpbGwgb25seSBiZSBleGVjdXRlZCBgZGVsYXlgIG1pbGxpc2Vjb25kcyBhZnRlclxuICAgIC8vICAgIHRoZSBsYXN0IGRlYm91bmNlZC1mdW5jdGlvbiBjYWxsLiBJZiBhdF9iZWdpbiBpcyB0cnVlLCBjYWxsYmFjayB3aWxsIGJlXG4gICAgLy8gICAgZXhlY3V0ZWQgb25seSBhdCB0aGUgZmlyc3QgZGVib3VuY2VkLWZ1bmN0aW9uIGNhbGwuIChBZnRlciB0aGVcbiAgICAvLyAgICB0aHJvdHRsZWQtZnVuY3Rpb24gaGFzIG5vdCBiZWVuIGNhbGxlZCBmb3IgYGRlbGF5YCBtaWxsaXNlY29uZHMsIHRoZVxuICAgIC8vICAgIGludGVybmFsIGNvdW50ZXIgaXMgcmVzZXQpXG4gICAgLy8gIGNhbGxiYWNrIC0gKEZ1bmN0aW9uKSBBIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGFmdGVyIGRlbGF5IG1pbGxpc2Vjb25kcy5cbiAgICAvLyAgICBUaGUgYHRoaXNgIGNvbnRleHQgYW5kIGFsbCBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aHJvdWdoLCBhcy1pcywgdG9cbiAgICAvLyAgICBgY2FsbGJhY2tgIHdoZW4gdGhlIGRlYm91bmNlZC1mdW5jdGlvbiBpcyBleGVjdXRlZC5cbiAgICAvL1xuICAgIC8vIFJldHVybnM6XG4gICAgLy9cbiAgICAvLyAgKEZ1bmN0aW9uKSBBIG5ldywgZGVib3VuY2VkLCBmdW5jdGlvbi5cblxuICAgICQuZGVib3VuY2UgPSBmdW5jdGlvbiggZGVsYXksIGF0X2JlZ2luLCBjYWxsYmFjayApIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8ganFfdGhyb3R0bGUoIGRlbGF5LCBhdF9iZWdpbiwgZmFsc2UgKVxuICAgICAgICAgICAgOiBqcV90aHJvdHRsZSggZGVsYXksIGNhbGxiYWNrLCBhdF9iZWdpbiAhPT0gZmFsc2UgKTtcbiAgICB9O1xuXG59KSh0aGlzKTsiXSwiZmlsZSI6ImpxdWVyeS50aHJvdHRsZS1kZWJvdW5jZS5qcyJ9
