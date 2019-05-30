/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.6
 */
(function($) {
    var selectors = [];

    var check_binded = false;
    var check_lock = false;
    var defaults = {
        interval: 250,
        force_process: false
    };
    var $window = $(window);

    var $prior_appeared = [];

    function appeared(selector) {
        return $(selector).filter(function() {
            return $(this).is(':appeared');
        });
    }

    function process() {
        check_lock = false;
        for (var index = 0, selectorsLength = selectors.length; index < selectorsLength; index++) {
            var $appeared = appeared(selectors[index]);

            $appeared.trigger('appear', [$appeared]);

            if ($prior_appeared[index]) {
                var $disappeared = $prior_appeared[index].not($appeared);
                $disappeared.trigger('disappear', [$disappeared]);
            }
            $prior_appeared[index] = $appeared;
        }
    }

    function add_selector(selector) {
        selectors.push(selector);
        $prior_appeared.push();
    }

    // "appeared" custom filter
    $.expr[':'].appeared = function(element) {
        var $element = $(element);
        if (!$element.is(':visible')) {
            return false;
        }

        var window_left = $window.scrollLeft();
        var window_top = $window.scrollTop();
        var offset = $element.offset();
        var left = offset.left;
        var top = offset.top;

        if (top + $element.height() >= window_top &&
            top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
            left + $element.width() >= window_left &&
            left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
            return true;
        } else {
            return false;
        }
    };

    $.fn.extend({
        // watching for element's appearance in browser viewport
        appear: function(options) {
            var opts = $.extend({}, defaults, options || {});
            var selector = this.selector || this;
            if (!check_binded) {
                var on_check = function() {
                    if (check_lock) {
                        return;
                    }
                    check_lock = true;

                    setTimeout(process, opts.interval);
                };

                $(window).scroll(on_check).resize(on_check);
                check_binded = true;
            }

            if (opts.force_process) {
                setTimeout(process, opts.interval);
            }
            add_selector(selector);
            return $(selector);
        }
    });

    $.extend({
        // force elements's appearance check
        force_appear: function() {
            if (check_binded) {
                process();
                return true;
            }
            return false;
        }
    });
})(function() {
    if (typeof module !== 'undefined') {
        // Node
        return require('jquery');
    } else {
        return jQuery;
    }
}());
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuYXBwZWFyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBqUXVlcnkgYXBwZWFyIHBsdWdpblxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBBbmRyZXkgU2lkb3JvdlxuICogbGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2UuXG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL21vcnIvanF1ZXJ5LmFwcGVhci9cbiAqXG4gKiBWZXJzaW9uOiAwLjMuNlxuICovXG4oZnVuY3Rpb24oJCkge1xuICAgIHZhciBzZWxlY3RvcnMgPSBbXTtcblxuICAgIHZhciBjaGVja19iaW5kZWQgPSBmYWxzZTtcbiAgICB2YXIgY2hlY2tfbG9jayA9IGZhbHNlO1xuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgICAgaW50ZXJ2YWw6IDI1MCxcbiAgICAgICAgZm9yY2VfcHJvY2VzczogZmFsc2VcbiAgICB9O1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICAgdmFyICRwcmlvcl9hcHBlYXJlZCA9IFtdO1xuXG4gICAgZnVuY3Rpb24gYXBwZWFyZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuICQoc2VsZWN0b3IpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLmlzKCc6YXBwZWFyZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2VzcygpIHtcbiAgICAgICAgY2hlY2tfbG9jayA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDAsIHNlbGVjdG9yc0xlbmd0aCA9IHNlbGVjdG9ycy5sZW5ndGg7IGluZGV4IDwgc2VsZWN0b3JzTGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICB2YXIgJGFwcGVhcmVkID0gYXBwZWFyZWQoc2VsZWN0b3JzW2luZGV4XSk7XG5cbiAgICAgICAgICAgICRhcHBlYXJlZC50cmlnZ2VyKCdhcHBlYXInLCBbJGFwcGVhcmVkXSk7XG5cbiAgICAgICAgICAgIGlmICgkcHJpb3JfYXBwZWFyZWRbaW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgdmFyICRkaXNhcHBlYXJlZCA9ICRwcmlvcl9hcHBlYXJlZFtpbmRleF0ubm90KCRhcHBlYXJlZCk7XG4gICAgICAgICAgICAgICAgJGRpc2FwcGVhcmVkLnRyaWdnZXIoJ2Rpc2FwcGVhcicsIFskZGlzYXBwZWFyZWRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRwcmlvcl9hcHBlYXJlZFtpbmRleF0gPSAkYXBwZWFyZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRfc2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3IpO1xuICAgICAgICAkcHJpb3JfYXBwZWFyZWQucHVzaCgpO1xuICAgIH1cblxuICAgIC8vIFwiYXBwZWFyZWRcIiBjdXN0b20gZmlsdGVyXG4gICAgJC5leHByWyc6J10uYXBwZWFyZWQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzp2aXNpYmxlJykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3aW5kb3dfbGVmdCA9ICR3aW5kb3cuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB2YXIgd2luZG93X3RvcCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCk7XG4gICAgICAgIHZhciBvZmZzZXQgPSAkZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgdmFyIGxlZnQgPSBvZmZzZXQubGVmdDtcbiAgICAgICAgdmFyIHRvcCA9IG9mZnNldC50b3A7XG5cbiAgICAgICAgaWYgKHRvcCArICRlbGVtZW50LmhlaWdodCgpID49IHdpbmRvd190b3AgJiZcbiAgICAgICAgICAgIHRvcCAtICgkZWxlbWVudC5kYXRhKCdhcHBlYXItdG9wLW9mZnNldCcpIHx8IDApIDw9IHdpbmRvd190b3AgKyAkd2luZG93LmhlaWdodCgpICYmXG4gICAgICAgICAgICBsZWZ0ICsgJGVsZW1lbnQud2lkdGgoKSA+PSB3aW5kb3dfbGVmdCAmJlxuICAgICAgICAgICAgbGVmdCAtICgkZWxlbWVudC5kYXRhKCdhcHBlYXItbGVmdC1vZmZzZXQnKSB8fCAwKSA8PSB3aW5kb3dfbGVmdCArICR3aW5kb3cud2lkdGgoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJC5mbi5leHRlbmQoe1xuICAgICAgICAvLyB3YXRjaGluZyBmb3IgZWxlbWVudCdzIGFwcGVhcmFuY2UgaW4gYnJvd3NlciB2aWV3cG9ydFxuICAgICAgICBhcHBlYXI6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBvcHRzID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zIHx8IHt9KTtcbiAgICAgICAgICAgIHZhciBzZWxlY3RvciA9IHRoaXMuc2VsZWN0b3IgfHwgdGhpcztcbiAgICAgICAgICAgIGlmICghY2hlY2tfYmluZGVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9uX2NoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGVja19sb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2hlY2tfbG9jayA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChwcm9jZXNzLCBvcHRzLmludGVydmFsKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJCh3aW5kb3cpLnNjcm9sbChvbl9jaGVjaykucmVzaXplKG9uX2NoZWNrKTtcbiAgICAgICAgICAgICAgICBjaGVja19iaW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0cy5mb3JjZV9wcm9jZXNzKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChwcm9jZXNzLCBvcHRzLmludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZF9zZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgICAgICByZXR1cm4gJChzZWxlY3Rvcik7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICQuZXh0ZW5kKHtcbiAgICAgICAgLy8gZm9yY2UgZWxlbWVudHMncyBhcHBlYXJhbmNlIGNoZWNrXG4gICAgICAgIGZvcmNlX2FwcGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tfYmluZGVkKSB7XG4gICAgICAgICAgICAgICAgcHJvY2VzcygpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG59KShmdW5jdGlvbigpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gTm9kZVxuICAgICAgICByZXR1cm4gcmVxdWlyZSgnanF1ZXJ5Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGpRdWVyeTtcbiAgICB9XG59KCkpOyJdLCJmaWxlIjoianF1ZXJ5LmFwcGVhci5qcyJ9
