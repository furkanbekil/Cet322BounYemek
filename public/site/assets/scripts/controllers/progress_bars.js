/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Progress Bar
 ***********************************************/
(function ($) {

    var $el = $('.sp-progress-bar'),
        delay = 0;

    $el.each(function() {
        var $this = $(this),
            $pv = $this.find('.progress-value'),
            $pb = $this.find('.progress-bar');

        $pv.html('0%');
        $pb.css('width', 0);
    });

    $el.one('appear', function () {
        var $this = $(this),
            $pv = $this.find('.progress-value'),
            $pb = $this.find('.progress-bar');

        setTimeout(function () {
            $pb.animate({
                width: $this.data('value')
            }, {
                duration: 2500,
                easing  : 'easeInOutQuint',
                step    : function (now, fx) {
                    $pv.html(now.toFixed(0) + fx.unit);
                }
            });
        }, delay);
        delay += 300;
    });

    setInterval(function () { delay = 0; }, 1000);

    $(window).one('pzt.preloader_done', function () {
        $el.appear({force_process: true});
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwcm9ncmVzc19iYXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogIEF1dGhvcjogTmF6YXJraW4gUm9tYW4sIEVnb3IgRGFua292XG4gKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICBQdXp6bGVUaGVtZXNcbiAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogUHJvZ3Jlc3MgQmFyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciAkZWwgPSAkKCcuc3AtcHJvZ3Jlc3MtYmFyJyksXG4gICAgICAgIGRlbGF5ID0gMDtcblxuICAgICRlbC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgJHB2ID0gJHRoaXMuZmluZCgnLnByb2dyZXNzLXZhbHVlJyksXG4gICAgICAgICAgICAkcGIgPSAkdGhpcy5maW5kKCcucHJvZ3Jlc3MtYmFyJyk7XG5cbiAgICAgICAgJHB2Lmh0bWwoJzAlJyk7XG4gICAgICAgICRwYi5jc3MoJ3dpZHRoJywgMCk7XG4gICAgfSk7XG5cbiAgICAkZWwub25lKCdhcHBlYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICAkcHYgPSAkdGhpcy5maW5kKCcucHJvZ3Jlc3MtdmFsdWUnKSxcbiAgICAgICAgICAgICRwYiA9ICR0aGlzLmZpbmQoJy5wcm9ncmVzcy1iYXInKTtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRwYi5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB3aWR0aDogJHRoaXMuZGF0YSgndmFsdWUnKVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyNTAwLFxuICAgICAgICAgICAgICAgIGVhc2luZyAgOiAnZWFzZUluT3V0UXVpbnQnLFxuICAgICAgICAgICAgICAgIHN0ZXAgICAgOiBmdW5jdGlvbiAobm93LCBmeCkge1xuICAgICAgICAgICAgICAgICAgICAkcHYuaHRtbChub3cudG9GaXhlZCgwKSArIGZ4LnVuaXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIGRlbGF5ICs9IDMwMDtcbiAgICB9KTtcblxuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHsgZGVsYXkgPSAwOyB9LCAxMDAwKTtcblxuICAgICQod2luZG93KS5vbmUoJ3B6dC5wcmVsb2FkZXJfZG9uZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGVsLmFwcGVhcih7Zm9yY2VfcHJvY2VzczogdHJ1ZX0pO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyJdLCJmaWxlIjoicHJvZ3Jlc3NfYmFycy5qcyJ9
