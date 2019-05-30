/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

/***********************************************
 * Footer scrolling animation
 ***********************************************/
(function($) {
    'use strict';

    var $window = $(window),
        $footer = $('#sp-footer'),
        $sizing_helper = $('#sp-footer-sizing-helper');

    if (!$footer.hasClass('sp-footer-fixed')) {
        return;
    }

    // footer sizing helper height calculation
    var last_footer_height = -1;
    setInterval(function () {
        if (last_footer_height === $footer.outerHeight()) {
            return;
        }

        last_footer_height = $footer.outerHeight();
        $sizing_helper.css('height', $footer.outerHeight());

        if ($footer.outerHeight() >= ($window.outerHeight() / 1.5)) {
            $footer.css('position', 'static');
            $footer.find('> div').css('opacity', 1);
            $sizing_helper.hide();
        } else {
            $footer.css('position', 'fixed');
            $sizing_helper.show();
        }
    }, 750);

    // scrolling animation
    PZTJS.scrollRAF(function () {
        var helper_offset = $sizing_helper.offset().top,
            wScrollBottom = $window.scrollTop() + $window.outerHeight();

        if (wScrollBottom <= helper_offset || $footer.css('position') === 'static') {
            return;
        }

        $footer.find('> div').css('opacity', (wScrollBottom - helper_offset) / $footer.outerHeight());
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmb290ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBSb21hbiBOYXphcmtpbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogRm9vdGVyIHNjcm9sbGluZyBhbmltYXRpb25cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyksXG4gICAgICAgICRmb290ZXIgPSAkKCcjc3AtZm9vdGVyJyksXG4gICAgICAgICRzaXppbmdfaGVscGVyID0gJCgnI3NwLWZvb3Rlci1zaXppbmctaGVscGVyJyk7XG5cbiAgICBpZiAoISRmb290ZXIuaGFzQ2xhc3MoJ3NwLWZvb3Rlci1maXhlZCcpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmb290ZXIgc2l6aW5nIGhlbHBlciBoZWlnaHQgY2FsY3VsYXRpb25cbiAgICB2YXIgbGFzdF9mb290ZXJfaGVpZ2h0ID0gLTE7XG4gICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAobGFzdF9mb290ZXJfaGVpZ2h0ID09PSAkZm9vdGVyLm91dGVySGVpZ2h0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RfZm9vdGVyX2hlaWdodCA9ICRmb290ZXIub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgJHNpemluZ19oZWxwZXIuY3NzKCdoZWlnaHQnLCAkZm9vdGVyLm91dGVySGVpZ2h0KCkpO1xuXG4gICAgICAgIGlmICgkZm9vdGVyLm91dGVySGVpZ2h0KCkgPj0gKCR3aW5kb3cub3V0ZXJIZWlnaHQoKSAvIDEuNSkpIHtcbiAgICAgICAgICAgICRmb290ZXIuY3NzKCdwb3NpdGlvbicsICdzdGF0aWMnKTtcbiAgICAgICAgICAgICRmb290ZXIuZmluZCgnPiBkaXYnKS5jc3MoJ29wYWNpdHknLCAxKTtcbiAgICAgICAgICAgICRzaXppbmdfaGVscGVyLmhpZGUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRmb290ZXIuY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgICAgICAgICAgJHNpemluZ19oZWxwZXIuc2hvdygpO1xuICAgICAgICB9XG4gICAgfSwgNzUwKTtcblxuICAgIC8vIHNjcm9sbGluZyBhbmltYXRpb25cbiAgICBQWlRKUy5zY3JvbGxSQUYoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGVscGVyX29mZnNldCA9ICRzaXppbmdfaGVscGVyLm9mZnNldCgpLnRvcCxcbiAgICAgICAgICAgIHdTY3JvbGxCb3R0b20gPSAkd2luZG93LnNjcm9sbFRvcCgpICsgJHdpbmRvdy5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgIGlmICh3U2Nyb2xsQm90dG9tIDw9IGhlbHBlcl9vZmZzZXQgfHwgJGZvb3Rlci5jc3MoJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkZm9vdGVyLmZpbmQoJz4gZGl2JykuY3NzKCdvcGFjaXR5JywgKHdTY3JvbGxCb3R0b20gLSBoZWxwZXJfb2Zmc2V0KSAvICRmb290ZXIub3V0ZXJIZWlnaHQoKSk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJmb290ZXIuanMifQ==
