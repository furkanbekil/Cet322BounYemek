/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Mailchimp subscription ajax form
 ***********************************************/
(function($) {

    $.ajaxChimp.translations.soprano = {
        'submit': 'Loading, please wait...',
        0: 'We have sent you a confirmation email. Please check your inbox.',
        1: 'The field is empty. Please enter your email.',
        2: 'An email address must contain a single "@" character.',
        3: 'This email seems to be invalid. Please enter a correct one.',
        4: 'This email seems to be invalid. Please enter a correct one.',
        5: 'This email address looks fake or invalid. Please enter a real email address.'
    };

    $('.sp-subscribe-form').each(function () {
        var $form = $(this).closest('form');

        $form.on('submit', function () {
            $form.addClass('mc-loading');
        });

        $form.ajaxChimp({
            language: 'soprano',
            label   : $form.find('> .form-output'),
            callback: function (resp) {
                $form.removeClass('mc-loading');
                $form.toggleClass('mc-valid', (resp.result === 'success'));
                $form.toggleClass('mc-invalid', (resp.result === 'error'));

                if (resp.result === 'success') {
                    $form.find('input[type="email"]').val('');
                }

                setTimeout(function () {
                    $form.removeClass('mc-valid mc-invalid');
                    $form.find('input[type="email"]').focus();
                }, 4500);
            }
        });
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWlsY2hpbXBfc3Vic2NyaWJlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogIEF1dGhvcjogTmF6YXJraW4gUm9tYW4sIEVnb3IgRGFua292XG4gKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICBQdXp6bGVUaGVtZXNcbiAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWFpbGNoaW1wIHN1YnNjcmlwdGlvbiBhamF4IGZvcm1cbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAkLmFqYXhDaGltcC50cmFuc2xhdGlvbnMuc29wcmFubyA9IHtcbiAgICAgICAgJ3N1Ym1pdCc6ICdMb2FkaW5nLCBwbGVhc2Ugd2FpdC4uLicsXG4gICAgICAgIDA6ICdXZSBoYXZlIHNlbnQgeW91IGEgY29uZmlybWF0aW9uIGVtYWlsLiBQbGVhc2UgY2hlY2sgeW91ciBpbmJveC4nLFxuICAgICAgICAxOiAnVGhlIGZpZWxkIGlzIGVtcHR5LiBQbGVhc2UgZW50ZXIgeW91ciBlbWFpbC4nLFxuICAgICAgICAyOiAnQW4gZW1haWwgYWRkcmVzcyBtdXN0IGNvbnRhaW4gYSBzaW5nbGUgXCJAXCIgY2hhcmFjdGVyLicsXG4gICAgICAgIDM6ICdUaGlzIGVtYWlsIHNlZW1zIHRvIGJlIGludmFsaWQuIFBsZWFzZSBlbnRlciBhIGNvcnJlY3Qgb25lLicsXG4gICAgICAgIDQ6ICdUaGlzIGVtYWlsIHNlZW1zIHRvIGJlIGludmFsaWQuIFBsZWFzZSBlbnRlciBhIGNvcnJlY3Qgb25lLicsXG4gICAgICAgIDU6ICdUaGlzIGVtYWlsIGFkZHJlc3MgbG9va3MgZmFrZSBvciBpbnZhbGlkLiBQbGVhc2UgZW50ZXIgYSByZWFsIGVtYWlsIGFkZHJlc3MuJ1xuICAgIH07XG5cbiAgICAkKCcuc3Atc3Vic2NyaWJlLWZvcm0nKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKS5jbG9zZXN0KCdmb3JtJyk7XG5cbiAgICAgICAgJGZvcm0ub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRmb3JtLmFkZENsYXNzKCdtYy1sb2FkaW5nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRmb3JtLmFqYXhDaGltcCh7XG4gICAgICAgICAgICBsYW5ndWFnZTogJ3NvcHJhbm8nLFxuICAgICAgICAgICAgbGFiZWwgICA6ICRmb3JtLmZpbmQoJz4gLmZvcm0tb3V0cHV0JyksXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgICAgICAkZm9ybS5yZW1vdmVDbGFzcygnbWMtbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICRmb3JtLnRvZ2dsZUNsYXNzKCdtYy12YWxpZCcsIChyZXNwLnJlc3VsdCA9PT0gJ3N1Y2Nlc3MnKSk7XG4gICAgICAgICAgICAgICAgJGZvcm0udG9nZ2xlQ2xhc3MoJ21jLWludmFsaWQnLCAocmVzcC5yZXN1bHQgPT09ICdlcnJvcicpKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZXNwLnJlc3VsdCA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJlbWFpbFwiXScpLnZhbCgnJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLnJlbW92ZUNsYXNzKCdtYy12YWxpZCBtYy1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgICRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJlbWFpbFwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfSwgNDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyJdLCJmaWxlIjoibWFpbGNoaW1wX3N1YnNjcmliZS5qcyJ9
