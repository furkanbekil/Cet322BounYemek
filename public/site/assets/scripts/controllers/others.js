/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Make clicks on mobile devices smoother
 ***********************************************/
jQuery(document).ready(function () {
    if(typeof FastClick === 'function') {
        FastClick.attach(document.body);
    }
});


/***********************************************
 * Disable hover effects when page is scrolled
 ***********************************************/
(function () {
    var body = document.body,
        timer;

    window.addEventListener('scroll', function () {
        clearTimeout(timer);
        if (!body.classList.contains('disable-hover')) {
            body.classList.add('disable-hover')
        }

        timer = setTimeout(function () {
            body.classList.remove('disable-hover')
        }, 100);
    }, false);
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJvdGhlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBOYXphcmtpbiBSb21hbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNYWtlIGNsaWNrcyBvbiBtb2JpbGUgZGV2aWNlcyBzbW9vdGhlclxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xualF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgaWYodHlwZW9mIEZhc3RDbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBGYXN0Q2xpY2suYXR0YWNoKGRvY3VtZW50LmJvZHkpO1xuICAgIH1cbn0pO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogRGlzYWJsZSBob3ZlciBlZmZlY3RzIHdoZW4gcGFnZSBpcyBzY3JvbGxlZFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICAgIHRpbWVyO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgICAgaWYgKCFib2R5LmNsYXNzTGlzdC5jb250YWlucygnZGlzYWJsZS1ob3ZlcicpKSB7XG4gICAgICAgICAgICBib2R5LmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGUtaG92ZXInKVxuICAgICAgICB9XG5cbiAgICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnZGlzYWJsZS1ob3ZlcicpXG4gICAgICAgIH0sIDEwMCk7XG4gICAgfSwgZmFsc2UpO1xufSkoKTsiXSwiZmlsZSI6Im90aGVycy5qcyJ9
