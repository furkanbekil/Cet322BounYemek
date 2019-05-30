/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */


/***********************************************
 * Integration with text rotator jQuery plugin
 ***********************************************/
(function ($) {
    'use strict';

    $('.sp-text-rotate').each(function () {
        var $this = $(this);

        $this.textrotator({
            animation: $this.data('animation'),
            speed    : $this.data('speed'),
            separator: '|'
        });
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0ZXh0cm90YXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IFJvbWFuIE5hemFya2luLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEludGVncmF0aW9uIHdpdGggdGV4dCByb3RhdG9yIGpRdWVyeSBwbHVnaW5cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgICQoJy5zcC10ZXh0LXJvdGF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgICR0aGlzLnRleHRyb3RhdG9yKHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogJHRoaXMuZGF0YSgnYW5pbWF0aW9uJyksXG4gICAgICAgICAgICBzcGVlZCAgICA6ICR0aGlzLmRhdGEoJ3NwZWVkJyksXG4gICAgICAgICAgICBzZXBhcmF0b3I6ICd8J1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJ0ZXh0cm90YXRvci5qcyJ9
