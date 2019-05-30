/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * FAQ card toggles
 ***********************************************/
(function ($) {

    $('.sp-faq-list .sp-faq-card').find('> .card-header').on('click', function() {
        var $card = $(this).closest('.sp-faq-card'),
            $list = $card.closest('.sp-faq-list');

        $list.find('.sp-faq-card').each(function () {
            if($(this).is($card)) { return; }
            $(this).find('> .card-contents').collapse('hide');
            $(this).removeClass('card-open');
        });

        $card.find('> .card-contents').collapse('show');
        $card.addClass('card-open');
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmYXEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBOYXphcmtpbiBSb21hbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBGQVEgY2FyZCB0b2dnbGVzXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAgICQoJy5zcC1mYXEtbGlzdCAuc3AtZmFxLWNhcmQnKS5maW5kKCc+IC5jYXJkLWhlYWRlcicpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGNhcmQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zcC1mYXEtY2FyZCcpLFxuICAgICAgICAgICAgJGxpc3QgPSAkY2FyZC5jbG9zZXN0KCcuc3AtZmFxLWxpc3QnKTtcblxuICAgICAgICAkbGlzdC5maW5kKCcuc3AtZmFxLWNhcmQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKCQodGhpcykuaXMoJGNhcmQpKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgJCh0aGlzKS5maW5kKCc+IC5jYXJkLWNvbnRlbnRzJykuY29sbGFwc2UoJ2hpZGUnKTtcbiAgICAgICAgICAgICQodGhpcykucmVtb3ZlQ2xhc3MoJ2NhcmQtb3BlbicpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkY2FyZC5maW5kKCc+IC5jYXJkLWNvbnRlbnRzJykuY29sbGFwc2UoJ3Nob3cnKTtcbiAgICAgICAgJGNhcmQuYWRkQ2xhc3MoJ2NhcmQtb3BlbicpO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyJdLCJmaWxlIjoiZmFxLmpzIn0=
