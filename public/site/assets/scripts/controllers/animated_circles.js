/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Animated Circles
 ***********************************************/
(function ($) {

    var el = $('.sp-circle'),
        delay = 0,
        options = {
            value     : 0,
            size      : 125,
            thickness : 2,
            fill      : {color: "#111"},
            emptyFill : "#ddd",
            startAngle: 300,
            animation : {duration: 2500, easing: 'easeInOutQuint'}
        };

    el.one('appear', function () {
        var $el = $(this);
        setTimeout(function () {
            $el.circleProgress('value', $el.data('value'));
        }, delay);
        delay += 150;
    });

    el.circleProgress(options).on('circle-animation-progress', function (event, progress, stepValue) {
        $(this).find('span').text((stepValue * 100).toFixed(1));
    });

    setInterval(function () { delay = 0; }, 1000);

    $(window).one('pzt.preloader_done', function() {
        el.appear({force_process: true});
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhbmltYXRlZF9jaXJjbGVzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogIEF1dGhvcjogTmF6YXJraW4gUm9tYW4sIEVnb3IgRGFua292XG4gKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICBQdXp6bGVUaGVtZXNcbiAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQW5pbWF0ZWQgQ2lyY2xlc1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgZWwgPSAkKCcuc3AtY2lyY2xlJyksXG4gICAgICAgIGRlbGF5ID0gMCxcbiAgICAgICAgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIHZhbHVlICAgICA6IDAsXG4gICAgICAgICAgICBzaXplICAgICAgOiAxMjUsXG4gICAgICAgICAgICB0aGlja25lc3MgOiAyLFxuICAgICAgICAgICAgZmlsbCAgICAgIDoge2NvbG9yOiBcIiMxMTFcIn0sXG4gICAgICAgICAgICBlbXB0eUZpbGwgOiBcIiNkZGRcIixcbiAgICAgICAgICAgIHN0YXJ0QW5nbGU6IDMwMCxcbiAgICAgICAgICAgIGFuaW1hdGlvbiA6IHtkdXJhdGlvbjogMjUwMCwgZWFzaW5nOiAnZWFzZUluT3V0UXVpbnQnfVxuICAgICAgICB9O1xuXG4gICAgZWwub25lKCdhcHBlYXInLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRlbC5jaXJjbGVQcm9ncmVzcygndmFsdWUnLCAkZWwuZGF0YSgndmFsdWUnKSk7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgZGVsYXkgKz0gMTUwO1xuICAgIH0pO1xuXG4gICAgZWwuY2lyY2xlUHJvZ3Jlc3Mob3B0aW9ucykub24oJ2NpcmNsZS1hbmltYXRpb24tcHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZXZlbnQsIHByb2dyZXNzLCBzdGVwVmFsdWUpIHtcbiAgICAgICAgJCh0aGlzKS5maW5kKCdzcGFuJykudGV4dCgoc3RlcFZhbHVlICogMTAwKS50b0ZpeGVkKDEpKTtcbiAgICB9KTtcblxuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHsgZGVsYXkgPSAwOyB9LCAxMDAwKTtcblxuICAgICQod2luZG93KS5vbmUoJ3B6dC5wcmVsb2FkZXJfZG9uZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBlbC5hcHBlYXIoe2ZvcmNlX3Byb2Nlc3M6IHRydWV9KTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiXSwiZmlsZSI6ImFuaW1hdGVkX2NpcmNsZXMuanMifQ==
