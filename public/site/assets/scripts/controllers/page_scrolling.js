/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Scroll to anchor
 ***********************************************/
(function($) {

    // Select all links with hashes
    $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function(event) {
            // On-page links
            if (
                location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
                &&
                location.hostname == this.hostname
            ) {
                // Figure out element to scroll to
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                // Does a scroll target exist?
                if (target.length) {
                    // Only prevent default if animation is actually gonna happen
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: target.offset().top - 55
                    }, 1500, 'easeInOutExpo', function() {
                        // Callback after animation
                        // Must change focus!
                        var $target = $(target);
                        $target.focus();
                        if ($target.is(":focus")) { // Checking if the target was focused
                            return false;
                        } else {
                            $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
                            $target.focus(); // Set focus again
                        }
                    });
                }
            }
        });

})(jQuery);


/***********************************************
 * Scroll to Top button
 ***********************************************/
(function($) {

    var offset = 500,
        $back_to_top = $('.sp-scroll-top');

    PZTJS.scrollRAF(function() {
        if (window.pageYOffset > offset) {
            $back_to_top.addClass('scroll-top-visible');
        } else {
            $back_to_top.removeClass('scroll-top-visible');
        }
    });

    $back_to_top.on('mouseover mouseout', function() {
        $(this).find('.anno-text').stop().animate({
            width: 'toggle',
            padding: 'toggle'
            // display: 'inline'
        });
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYWdlX3Njcm9sbGluZy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IE5hemFya2luIFJvbWFuLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFNjcm9sbCB0byBhbmNob3JcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAvLyBTZWxlY3QgYWxsIGxpbmtzIHdpdGggaGFzaGVzXG4gICAgJCgnYVtocmVmKj1cIiNcIl0nKVxuICAgICAgICAvLyBSZW1vdmUgbGlua3MgdGhhdCBkb24ndCBhY3R1YWxseSBsaW5rIHRvIGFueXRoaW5nXG4gICAgICAgIC5ub3QoJ1tocmVmPVwiI1wiXScpXG4gICAgICAgIC5ub3QoJ1tocmVmPVwiIzBcIl0nKVxuICAgICAgICAuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIE9uLXBhZ2UgbGlua3NcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5wYXRobmFtZS5yZXBsYWNlKC9eXFwvLywgJycpID09IHRoaXMucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sICcnKVxuICAgICAgICAgICAgICAgICYmXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaG9zdG5hbWUgPT0gdGhpcy5ob3N0bmFtZVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gRmlndXJlIG91dCBlbGVtZW50IHRvIHNjcm9sbCB0b1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKHRoaXMuaGFzaCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0Lmxlbmd0aCA/IHRhcmdldCA6ICQoJ1tuYW1lPScgKyB0aGlzLmhhc2guc2xpY2UoMSkgKyAnXScpO1xuICAgICAgICAgICAgICAgIC8vIERvZXMgYSBzY3JvbGwgdGFyZ2V0IGV4aXN0P1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE9ubHkgcHJldmVudCBkZWZhdWx0IGlmIGFuaW1hdGlvbiBpcyBhY3R1YWxseSBnb25uYSBoYXBwZW5cbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wIC0gNTVcbiAgICAgICAgICAgICAgICAgICAgfSwgMTUwMCwgJ2Vhc2VJbk91dEV4cG8nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENhbGxiYWNrIGFmdGVyIGFuaW1hdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTXVzdCBjaGFuZ2UgZm9jdXMhXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0LmlzKFwiOmZvY3VzXCIpKSB7IC8vIENoZWNraW5nIGlmIHRoZSB0YXJnZXQgd2FzIGZvY3VzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQuYXR0cigndGFiaW5kZXgnLCctMScpOyAvLyBBZGRpbmcgdGFiaW5kZXggZm9yIGVsZW1lbnRzIG5vdCBmb2N1c2FibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LmZvY3VzKCk7IC8vIFNldCBmb2N1cyBhZ2FpblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG59KShqUXVlcnkpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogU2Nyb2xsIHRvIFRvcCBidXR0b25cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICB2YXIgb2Zmc2V0ID0gNTAwLFxuICAgICAgICAkYmFja190b190b3AgPSAkKCcuc3Atc2Nyb2xsLXRvcCcpO1xuXG4gICAgUFpUSlMuc2Nyb2xsUkFGKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAod2luZG93LnBhZ2VZT2Zmc2V0ID4gb2Zmc2V0KSB7XG4gICAgICAgICAgICAkYmFja190b190b3AuYWRkQ2xhc3MoJ3Njcm9sbC10b3AtdmlzaWJsZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGJhY2tfdG9fdG9wLnJlbW92ZUNsYXNzKCdzY3JvbGwtdG9wLXZpc2libGUnKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJGJhY2tfdG9fdG9wLm9uKCdtb3VzZW92ZXIgbW91c2VvdXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCcuYW5uby10ZXh0Jykuc3RvcCgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgd2lkdGg6ICd0b2dnbGUnLFxuICAgICAgICAgICAgcGFkZGluZzogJ3RvZ2dsZSdcbiAgICAgICAgICAgIC8vIGRpc3BsYXk6ICdpbmxpbmUnXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyJdLCJmaWxlIjoicGFnZV9zY3JvbGxpbmcuanMifQ==
