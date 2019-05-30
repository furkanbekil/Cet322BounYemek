/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Preloader
 ***********************************************/
(function ($) {
    var $window = $(window);

    $window.on('load', function () {
        $window.trigger('pzt.preloader_done');
        setTimeout(function () {
            $('body').addClass('sp-page-loaded');
            $('#sp-preloader').fadeOut('slow');
        }, 250);
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwcmVsb2FkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBOYXphcmtpbiBSb21hbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBQcmVsb2FkZXJcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuICAgIHZhciAkd2luZG93ID0gJCh3aW5kb3cpO1xuXG4gICAgJHdpbmRvdy5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHdpbmRvdy50cmlnZ2VyKCdwenQucHJlbG9hZGVyX2RvbmUnKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ3NwLXBhZ2UtbG9hZGVkJyk7XG4gICAgICAgICAgICAkKCcjc3AtcHJlbG9hZGVyJykuZmFkZU91dCgnc2xvdycpO1xuICAgICAgICB9LCAyNTApO1xuICAgIH0pO1xufSkoalF1ZXJ5KTsiXSwiZmlsZSI6InByZWxvYWRlci5qcyJ9
