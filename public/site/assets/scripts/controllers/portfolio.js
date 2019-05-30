/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Portfolio shuffle
 ***********************************************/
(function ($) {
    // locate what we want to sort
    var $blocks = $('.sp-portfolio-block');

    // don't run this function if this page does not contain required element
    if ($blocks.length <= 0) {
        return;
    }

    // init shuffle and filters
    $blocks.each(function () {
        var $this = $(this),
            $grid = $this.find('.sp-portfolio-items'),
            $filterBtns = $this.find('.sp-portfolio-sorting a[data-group]');

        // instantiate the plugin
        $grid.pzt_shuffle({
            itemSelector: '[class*="col-"]',
            gutterWidth : 0,
            speed       : 600, // transition/animation speed (milliseconds).
            easing      : 'ease'
        });

        // init filters
        $filterBtns.on('click', function (e) {
            var $this = $(this);

            // hide current label, show current label in title
            $this.parent().siblings().removeClass('active');
            $this.parent().addClass('active');

            // filter elements
            $grid.shuffle('shuffle', $this.data('group'));

            e.preventDefault();
        });
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb3J0Zm9saW8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBOYXphcmtpbiBSb21hbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBQb3J0Zm9saW8gc2h1ZmZsZVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgkKSB7XG4gICAgLy8gbG9jYXRlIHdoYXQgd2Ugd2FudCB0byBzb3J0XG4gICAgdmFyICRibG9ja3MgPSAkKCcuc3AtcG9ydGZvbGlvLWJsb2NrJyk7XG5cbiAgICAvLyBkb24ndCBydW4gdGhpcyBmdW5jdGlvbiBpZiB0aGlzIHBhZ2UgZG9lcyBub3QgY29udGFpbiByZXF1aXJlZCBlbGVtZW50XG4gICAgaWYgKCRibG9ja3MubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGluaXQgc2h1ZmZsZSBhbmQgZmlsdGVyc1xuICAgICRibG9ja3MuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICAkZ3JpZCA9ICR0aGlzLmZpbmQoJy5zcC1wb3J0Zm9saW8taXRlbXMnKSxcbiAgICAgICAgICAgICRmaWx0ZXJCdG5zID0gJHRoaXMuZmluZCgnLnNwLXBvcnRmb2xpby1zb3J0aW5nIGFbZGF0YS1ncm91cF0nKTtcblxuICAgICAgICAvLyBpbnN0YW50aWF0ZSB0aGUgcGx1Z2luXG4gICAgICAgICRncmlkLnB6dF9zaHVmZmxlKHtcbiAgICAgICAgICAgIGl0ZW1TZWxlY3RvcjogJ1tjbGFzcyo9XCJjb2wtXCJdJyxcbiAgICAgICAgICAgIGd1dHRlcldpZHRoIDogMCxcbiAgICAgICAgICAgIHNwZWVkICAgICAgIDogNjAwLCAvLyB0cmFuc2l0aW9uL2FuaW1hdGlvbiBzcGVlZCAobWlsbGlzZWNvbmRzKS5cbiAgICAgICAgICAgIGVhc2luZyAgICAgIDogJ2Vhc2UnXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGluaXQgZmlsdGVyc1xuICAgICAgICAkZmlsdGVyQnRucy5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcblxuICAgICAgICAgICAgLy8gaGlkZSBjdXJyZW50IGxhYmVsLCBzaG93IGN1cnJlbnQgbGFiZWwgaW4gdGl0bGVcbiAgICAgICAgICAgICR0aGlzLnBhcmVudCgpLnNpYmxpbmdzKCkucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgJHRoaXMucGFyZW50KCkuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgICAgICAvLyBmaWx0ZXIgZWxlbWVudHNcbiAgICAgICAgICAgICRncmlkLnNodWZmbGUoJ3NodWZmbGUnLCAkdGhpcy5kYXRhKCdncm91cCcpKTtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJwb3J0Zm9saW8uanMifQ==
