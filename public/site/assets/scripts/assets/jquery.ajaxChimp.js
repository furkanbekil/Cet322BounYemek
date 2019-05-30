/*!
 Mailchimp Ajax Submit
 jQuery Plugin
 Author: Siddharth Doshi

 Use:
 ===
 $('#form_id').ajaxchimp(options);

 - Form should have one <input> element with attribute 'type=email'
 - Form should have one label element with attribute 'for=email_input_id' (used to display error/success message)
 - All options are optional.

 Options:
 =======
 options = {
 language: 'en',
 callback: callbackFunction,
 url: 'http://blahblah.us1.list-manage.com/subscribe/post?u=5afsdhfuhdsiufdba6f8802&id=4djhfdsh99f'
 }

 Notes:
 =====
 To get the mailchimp JSONP url (undocumented), change 'post?' to 'post-json?' and add '&c=?' to the end.
 For e.g. 'http://blahblah.us1.list-manage.com/subscribe/post-json?u=5afsdhfuhdsiufdba6f8802&id=4djhfdsh99f&c=?',
 */

(function ($) {
    'use strict';

    $.ajaxChimp = {
        responses: {
            0: 'We have sent you a confirmation email',
            1: 'Please enter a value',
            2: 'An email address must contain a single @',
            3: 'The domain portion of the email address is invalid',
            4: 'The username portion of the email address is invalid',
            5: 'This email address looks fake or invalid. Please enter a real email address',
            6: 'is already subscribed to list'
        },
        translations: {
            'en': null
        },
        init: function (selector, options) {
            $(selector).ajaxChimp(options);
        }
    };

    $.fn.ajaxChimp = function (options) {
        $(this).each(function(i, elem) {
            var form = $(elem);
            var email = form.find('input[type=email]');

            var label;
            if (options.label) {
                label = options.label;
            } else {
                label = form.find('label[for=' + email.attr('id') + ']');
            }

            var settings = $.extend({
                'url': form.attr('action'),
                'language': 'en'
            }, options);

            var url = settings.url.replace('/post?', '/post-json?').concat('&c=?');

            form.attr('novalidate', 'true');
            email.attr('name', 'EMAIL');

            form.submit(function () {
                var msg;
                function successCallback(resp) {
                    if (resp.result === 'success') {
                        msg = 'We have sent you a confirmation email';
                        label.removeClass('error').addClass('valid');
                        email.removeClass('error').addClass('valid');
                    } else {
                        email.removeClass('valid').addClass('error');
                        label.removeClass('valid').addClass('error');
                        var index = -1;
                        try {
                            var parts = resp.msg.split(' - ', 2);
                            if (parts[1] === undefined) {
                                msg = resp.msg;
                            } else {
                                var i = parseInt(parts[0], 10);
                                if (i.toString() === parts[0]) {
                                    index = parts[0];
                                    msg = parts[1];
                                } else {
                                    index = -1;
                                    msg = resp.msg;
                                }
                            }
                        }
                        catch (e) {
                            index = -1;
                            msg = resp.msg;
                        }
                    }


                    // Translate and display message
                    var length = 0, msgnr;

                    if(Object.keys){
                        length = Object.keys($.ajaxChimp.responses).length
                    }
                    else {
                        for (var key in $.ajaxChimp.responses){
                            if ($.ajaxChimp.responses.hasOwnProperty(key)) {
                                length++;
                            }
                        }
                    }

                    while(length--) {
                        if (msg.indexOf($.ajaxChimp.responses[length])!==-1) {
                            msgnr = length;
                        }
                    }

                    if (
                        settings.language !== 'en' && msgnr > -1 && $.ajaxChimp.translations && $.ajaxChimp.translations[settings.language] && $.ajaxChimp.translations[settings.language][msgnr]
                    ) {
                        msg = $.ajaxChimp.translations[settings.language][msgnr];
                    }
                    label.html(msg);

                    label.show(2000);
                    if (settings.callback) {
                        settings.callback(resp);
                    }
                }

                var data = {};
                var dataArray = form.serializeArray();
                $.each(dataArray, function (index, item) {
                    data[item.name] = item.value;
                });

                $.ajax({
                    url: url,
                    data: data,
                    success: successCallback,
                    dataType: 'jsonp',
                    error: function (resp, text) {
                        window.console.log('mailchimp ajax submit error: ' + text);
                    }
                });

                // Translate and display submit message
                var submitMsg = 'Submitting...';
                if(
                    settings.language !== 'en' && $.ajaxChimp.translations && $.ajaxChimp.translations[settings.language] && $.ajaxChimp.translations[settings.language].submit
                ) {
                    submitMsg = $.ajaxChimp.translations[settings.language].submit;
                }
                label.html(submitMsg).show(2000);

                return false;
            });
        });
        return this;
    };
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuYWpheENoaW1wLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuIE1haWxjaGltcCBBamF4IFN1Ym1pdFxuIGpRdWVyeSBQbHVnaW5cbiBBdXRob3I6IFNpZGRoYXJ0aCBEb3NoaVxuXG4gVXNlOlxuID09PVxuICQoJyNmb3JtX2lkJykuYWpheGNoaW1wKG9wdGlvbnMpO1xuXG4gLSBGb3JtIHNob3VsZCBoYXZlIG9uZSA8aW5wdXQ+IGVsZW1lbnQgd2l0aCBhdHRyaWJ1dGUgJ3R5cGU9ZW1haWwnXG4gLSBGb3JtIHNob3VsZCBoYXZlIG9uZSBsYWJlbCBlbGVtZW50IHdpdGggYXR0cmlidXRlICdmb3I9ZW1haWxfaW5wdXRfaWQnICh1c2VkIHRvIGRpc3BsYXkgZXJyb3Ivc3VjY2VzcyBtZXNzYWdlKVxuIC0gQWxsIG9wdGlvbnMgYXJlIG9wdGlvbmFsLlxuXG4gT3B0aW9uczpcbiA9PT09PT09XG4gb3B0aW9ucyA9IHtcbiBsYW5ndWFnZTogJ2VuJyxcbiBjYWxsYmFjazogY2FsbGJhY2tGdW5jdGlvbixcbiB1cmw6ICdodHRwOi8vYmxhaGJsYWgudXMxLmxpc3QtbWFuYWdlLmNvbS9zdWJzY3JpYmUvcG9zdD91PTVhZnNkaGZ1aGRzaXVmZGJhNmY4ODAyJmlkPTRkamhmZHNoOTlmJ1xuIH1cblxuIE5vdGVzOlxuID09PT09XG4gVG8gZ2V0IHRoZSBtYWlsY2hpbXAgSlNPTlAgdXJsICh1bmRvY3VtZW50ZWQpLCBjaGFuZ2UgJ3Bvc3Q/JyB0byAncG9zdC1qc29uPycgYW5kIGFkZCAnJmM9PycgdG8gdGhlIGVuZC5cbiBGb3IgZS5nLiAnaHR0cDovL2JsYWhibGFoLnVzMS5saXN0LW1hbmFnZS5jb20vc3Vic2NyaWJlL3Bvc3QtanNvbj91PTVhZnNkaGZ1aGRzaXVmZGJhNmY4ODAyJmlkPTRkamhmZHNoOTlmJmM9PycsXG4gKi9cblxuKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgJC5hamF4Q2hpbXAgPSB7XG4gICAgICAgIHJlc3BvbnNlczoge1xuICAgICAgICAgICAgMDogJ1dlIGhhdmUgc2VudCB5b3UgYSBjb25maXJtYXRpb24gZW1haWwnLFxuICAgICAgICAgICAgMTogJ1BsZWFzZSBlbnRlciBhIHZhbHVlJyxcbiAgICAgICAgICAgIDI6ICdBbiBlbWFpbCBhZGRyZXNzIG11c3QgY29udGFpbiBhIHNpbmdsZSBAJyxcbiAgICAgICAgICAgIDM6ICdUaGUgZG9tYWluIHBvcnRpb24gb2YgdGhlIGVtYWlsIGFkZHJlc3MgaXMgaW52YWxpZCcsXG4gICAgICAgICAgICA0OiAnVGhlIHVzZXJuYW1lIHBvcnRpb24gb2YgdGhlIGVtYWlsIGFkZHJlc3MgaXMgaW52YWxpZCcsXG4gICAgICAgICAgICA1OiAnVGhpcyBlbWFpbCBhZGRyZXNzIGxvb2tzIGZha2Ugb3IgaW52YWxpZC4gUGxlYXNlIGVudGVyIGEgcmVhbCBlbWFpbCBhZGRyZXNzJyxcbiAgICAgICAgICAgIDY6ICdpcyBhbHJlYWR5IHN1YnNjcmliZWQgdG8gbGlzdCdcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNsYXRpb25zOiB7XG4gICAgICAgICAgICAnZW4nOiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChzZWxlY3Rvciwgb3B0aW9ucykge1xuICAgICAgICAgICAgJChzZWxlY3RvcikuYWpheENoaW1wKG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgICQuZm4uYWpheENoaW1wID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKGksIGVsZW0pIHtcbiAgICAgICAgICAgIHZhciBmb3JtID0gJChlbGVtKTtcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IGZvcm0uZmluZCgnaW5wdXRbdHlwZT1lbWFpbF0nKTtcblxuICAgICAgICAgICAgdmFyIGxhYmVsO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMubGFiZWwpIHtcbiAgICAgICAgICAgICAgICBsYWJlbCA9IG9wdGlvbnMubGFiZWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhYmVsID0gZm9ybS5maW5kKCdsYWJlbFtmb3I9JyArIGVtYWlsLmF0dHIoJ2lkJykgKyAnXScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICAgJ3VybCc6IGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgJ2xhbmd1YWdlJzogJ2VuJ1xuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHZhciB1cmwgPSBzZXR0aW5ncy51cmwucmVwbGFjZSgnL3Bvc3Q/JywgJy9wb3N0LWpzb24/JykuY29uY2F0KCcmYz0/Jyk7XG5cbiAgICAgICAgICAgIGZvcm0uYXR0cignbm92YWxpZGF0ZScsICd0cnVlJyk7XG4gICAgICAgICAgICBlbWFpbC5hdHRyKCduYW1lJywgJ0VNQUlMJyk7XG5cbiAgICAgICAgICAgIGZvcm0uc3VibWl0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbXNnO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3NDYWxsYmFjayhyZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwLnJlc3VsdCA9PT0gJ3N1Y2Nlc3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtc2cgPSAnV2UgaGF2ZSBzZW50IHlvdSBhIGNvbmZpcm1hdGlvbiBlbWFpbCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5yZW1vdmVDbGFzcygnZXJyb3InKS5hZGRDbGFzcygndmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsLnJlbW92ZUNsYXNzKCdlcnJvcicpLmFkZENsYXNzKCd2YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWwucmVtb3ZlQ2xhc3MoJ3ZhbGlkJykuYWRkQ2xhc3MoJ2Vycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbC5yZW1vdmVDbGFzcygndmFsaWQnKS5hZGRDbGFzcygnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGFydHMgPSByZXNwLm1zZy5zcGxpdCgnIC0gJywgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnRzWzFdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gcmVzcC5tc2c7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBwYXJzZUludChwYXJ0c1swXSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaS50b1N0cmluZygpID09PSBwYXJ0c1swXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSBwYXJ0c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IHBhcnRzWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IHJlc3AubXNnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZyA9IHJlc3AubXNnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgICAgICAvLyBUcmFuc2xhdGUgYW5kIGRpc3BsYXkgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gMCwgbXNnbnI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYoT2JqZWN0LmtleXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gT2JqZWN0LmtleXMoJC5hamF4Q2hpbXAucmVzcG9uc2VzKS5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiAkLmFqYXhDaGltcC5yZXNwb25zZXMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkLmFqYXhDaGltcC5yZXNwb25zZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB3aGlsZShsZW5ndGgtLSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1zZy5pbmRleE9mKCQuYWpheENoaW1wLnJlc3BvbnNlc1tsZW5ndGhdKSE9PS0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNnbnIgPSBsZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5sYW5ndWFnZSAhPT0gJ2VuJyAmJiBtc2duciA+IC0xICYmICQuYWpheENoaW1wLnRyYW5zbGF0aW9ucyAmJiAkLmFqYXhDaGltcC50cmFuc2xhdGlvbnNbc2V0dGluZ3MubGFuZ3VhZ2VdICYmICQuYWpheENoaW1wLnRyYW5zbGF0aW9uc1tzZXR0aW5ncy5sYW5ndWFnZV1bbXNnbnJdXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbXNnID0gJC5hamF4Q2hpbXAudHJhbnNsYXRpb25zW3NldHRpbmdzLmxhbmd1YWdlXVttc2ducl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWwuaHRtbChtc2cpO1xuXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsLnNob3coMjAwMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3MuY2FsbGJhY2socmVzcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBkYXRhQXJyYXkgPSBmb3JtLnNlcmlhbGl6ZUFycmF5KCk7XG4gICAgICAgICAgICAgICAgJC5lYWNoKGRhdGFBcnJheSwgZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaXRlbS5uYW1lXSA9IGl0ZW0udmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzczogc3VjY2Vzc0NhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXNwLCB0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY29uc29sZS5sb2coJ21haWxjaGltcCBhamF4IHN1Ym1pdCBlcnJvcjogJyArIHRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBUcmFuc2xhdGUgYW5kIGRpc3BsYXkgc3VibWl0IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICB2YXIgc3VibWl0TXNnID0gJ1N1Ym1pdHRpbmcuLi4nO1xuICAgICAgICAgICAgICAgIGlmKFxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5ncy5sYW5ndWFnZSAhPT0gJ2VuJyAmJiAkLmFqYXhDaGltcC50cmFuc2xhdGlvbnMgJiYgJC5hamF4Q2hpbXAudHJhbnNsYXRpb25zW3NldHRpbmdzLmxhbmd1YWdlXSAmJiAkLmFqYXhDaGltcC50cmFuc2xhdGlvbnNbc2V0dGluZ3MubGFuZ3VhZ2VdLnN1Ym1pdFxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBzdWJtaXRNc2cgPSAkLmFqYXhDaGltcC50cmFuc2xhdGlvbnNbc2V0dGluZ3MubGFuZ3VhZ2VdLnN1Ym1pdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGFiZWwuaHRtbChzdWJtaXRNc2cpLnNob3coMjAwMCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG59KShqUXVlcnkpOyJdLCJmaWxlIjoianF1ZXJ5LmFqYXhDaGltcC5qcyJ9
