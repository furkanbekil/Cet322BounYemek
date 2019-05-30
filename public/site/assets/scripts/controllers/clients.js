/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Masonry Clients Layout
 ***********************************************/
(function ($) {
    var $grid = $('.sp-clients-grid'); // locate what we want to sort

    // don't run this function if this page does not contain required element
    if ($grid.length <= 0) {
        return;
    }

    // instantiate the plugin
    $grid.pzt_shuffle({
        itemSelector: '[class*="col-"]',
        gutterWidth : 0,
        speed       : 600, // transition/animation speed (milliseconds).
        easing      : 'ease'
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjbGllbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogIEF1dGhvcjogTmF6YXJraW4gUm9tYW4sIEVnb3IgRGFua292XG4gKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICBQdXp6bGVUaGVtZXNcbiAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWFzb25yeSBDbGllbnRzIExheW91dFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgkKSB7XG4gICAgdmFyICRncmlkID0gJCgnLnNwLWNsaWVudHMtZ3JpZCcpOyAvLyBsb2NhdGUgd2hhdCB3ZSB3YW50IHRvIHNvcnRcblxuICAgIC8vIGRvbid0IHJ1biB0aGlzIGZ1bmN0aW9uIGlmIHRoaXMgcGFnZSBkb2VzIG5vdCBjb250YWluIHJlcXVpcmVkIGVsZW1lbnRcbiAgICBpZiAoJGdyaWQubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGluc3RhbnRpYXRlIHRoZSBwbHVnaW5cbiAgICAkZ3JpZC5wenRfc2h1ZmZsZSh7XG4gICAgICAgIGl0ZW1TZWxlY3RvcjogJ1tjbGFzcyo9XCJjb2wtXCJdJyxcbiAgICAgICAgZ3V0dGVyV2lkdGggOiAwLFxuICAgICAgICBzcGVlZCAgICAgICA6IDYwMCwgLy8gdHJhbnNpdGlvbi9hbmltYXRpb24gc3BlZWQgKG1pbGxpc2Vjb25kcykuXG4gICAgICAgIGVhc2luZyAgICAgIDogJ2Vhc2UnXG4gICAgfSk7XG59KShqUXVlcnkpOyJdLCJmaWxlIjoiY2xpZW50cy5qcyJ9
