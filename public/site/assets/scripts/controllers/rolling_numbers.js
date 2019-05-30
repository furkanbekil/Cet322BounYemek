/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

(function ($) {
    var $elems = $('.sp-animate-numbers h2');

    // set roller numbers first
    $elems.each(function (i) {
        $(this).attr('data-slno', i);
        $(this).addClass('roller-title-number-' + i);
    });

    // run when appear
    $elems.one('appear', function () {
        numberRoller($(this).attr('data-slno'));
    });

    $(window).one('pzt.preloader_done', function() {
        $elems.appear({force_process: true});
    });

    function numberRoller(slno) {
        var min = $('.roller-title-number-' + slno).attr('data-min');
        var max = $('.roller-title-number-' + slno).attr('data-max');
        var timediff = $('.roller-title-number-' + slno).attr('data-delay');
        var increment = $('.roller-title-number-' + slno).attr('data-increment');
        var numdiff = max - min;
        var timeout = (timediff * 1000) / numdiff;
        numberRoll(slno, min, max, increment, timeout);
    }

    function numberRoll(slno, min, max, increment, timeout) {//alert(slno+"="+min+"="+max+"="+increment+"="+timeout);
        if (min <= max) {
            $('.roller-title-number-' + slno).html(min);
            min = parseInt(min, 10) + parseInt(increment, 10);
            setTimeout(function () {
                numberRoll(parseInt(slno, 10), parseInt(min, 10), parseInt(max, 10), parseInt(increment, 10), parseInt(timeout, 10))
            }, timeout);
        } else {
            $('.roller-title-number-' + slno).html(max);
        }
    }

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyb2xsaW5nX251bWJlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBOYXphcmtpbiBSb21hbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uICgkKSB7XG4gICAgdmFyICRlbGVtcyA9ICQoJy5zcC1hbmltYXRlLW51bWJlcnMgaDInKTtcblxuICAgIC8vIHNldCByb2xsZXIgbnVtYmVycyBmaXJzdFxuICAgICRlbGVtcy5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICQodGhpcykuYXR0cignZGF0YS1zbG5vJywgaSk7XG4gICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ3JvbGxlci10aXRsZS1udW1iZXItJyArIGkpO1xuICAgIH0pO1xuXG4gICAgLy8gcnVuIHdoZW4gYXBwZWFyXG4gICAgJGVsZW1zLm9uZSgnYXBwZWFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBudW1iZXJSb2xsZXIoJCh0aGlzKS5hdHRyKCdkYXRhLXNsbm8nKSk7XG4gICAgfSk7XG5cbiAgICAkKHdpbmRvdykub25lKCdwenQucHJlbG9hZGVyX2RvbmUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJGVsZW1zLmFwcGVhcih7Zm9yY2VfcHJvY2VzczogdHJ1ZX0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gbnVtYmVyUm9sbGVyKHNsbm8pIHtcbiAgICAgICAgdmFyIG1pbiA9ICQoJy5yb2xsZXItdGl0bGUtbnVtYmVyLScgKyBzbG5vKS5hdHRyKCdkYXRhLW1pbicpO1xuICAgICAgICB2YXIgbWF4ID0gJCgnLnJvbGxlci10aXRsZS1udW1iZXItJyArIHNsbm8pLmF0dHIoJ2RhdGEtbWF4Jyk7XG4gICAgICAgIHZhciB0aW1lZGlmZiA9ICQoJy5yb2xsZXItdGl0bGUtbnVtYmVyLScgKyBzbG5vKS5hdHRyKCdkYXRhLWRlbGF5Jyk7XG4gICAgICAgIHZhciBpbmNyZW1lbnQgPSAkKCcucm9sbGVyLXRpdGxlLW51bWJlci0nICsgc2xubykuYXR0cignZGF0YS1pbmNyZW1lbnQnKTtcbiAgICAgICAgdmFyIG51bWRpZmYgPSBtYXggLSBtaW47XG4gICAgICAgIHZhciB0aW1lb3V0ID0gKHRpbWVkaWZmICogMTAwMCkgLyBudW1kaWZmO1xuICAgICAgICBudW1iZXJSb2xsKHNsbm8sIG1pbiwgbWF4LCBpbmNyZW1lbnQsIHRpbWVvdXQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG51bWJlclJvbGwoc2xubywgbWluLCBtYXgsIGluY3JlbWVudCwgdGltZW91dCkgey8vYWxlcnQoc2xubytcIj1cIittaW4rXCI9XCIrbWF4K1wiPVwiK2luY3JlbWVudCtcIj1cIit0aW1lb3V0KTtcbiAgICAgICAgaWYgKG1pbiA8PSBtYXgpIHtcbiAgICAgICAgICAgICQoJy5yb2xsZXItdGl0bGUtbnVtYmVyLScgKyBzbG5vKS5odG1sKG1pbik7XG4gICAgICAgICAgICBtaW4gPSBwYXJzZUludChtaW4sIDEwKSArIHBhcnNlSW50KGluY3JlbWVudCwgMTApO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyUm9sbChwYXJzZUludChzbG5vLCAxMCksIHBhcnNlSW50KG1pbiwgMTApLCBwYXJzZUludChtYXgsIDEwKSwgcGFyc2VJbnQoaW5jcmVtZW50LCAxMCksIHBhcnNlSW50KHRpbWVvdXQsIDEwKSlcbiAgICAgICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLnJvbGxlci10aXRsZS1udW1iZXItJyArIHNsbm8pLmh0bWwobWF4KTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoalF1ZXJ5KTsiXSwiZmlsZSI6InJvbGxpbmdfbnVtYmVycy5qcyJ9
