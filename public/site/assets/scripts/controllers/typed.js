/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Typed.js integration
 ***********************************************/
jQuery(window).one('pzt.preloader_done', function () {
    var $ = jQuery;

    // process each typed-enabled element
    $('[data-typed-str]').each(function () {
        var $this = $(this),
            texts = $this.attr('data-typed-str').split('|');

        $this.html('').append('<span class="typed-container"></span>');
        $this.find('> .typed-container').typed({
            strings   : texts,
            typeSpeed : 65,
            loop      : ($this.attr('data-typed-repeat') === 'yes'),
            backDelay : 1500,
            showCursor: ($this.attr('data-typed-cursor') === 'yes')
        });
    });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0eXBlZC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IE5hemFya2luIFJvbWFuLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIFR5cGVkLmpzIGludGVncmF0aW9uXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5qUXVlcnkod2luZG93KS5vbmUoJ3B6dC5wcmVsb2FkZXJfZG9uZScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgJCA9IGpRdWVyeTtcblxuICAgIC8vIHByb2Nlc3MgZWFjaCB0eXBlZC1lbmFibGVkIGVsZW1lbnRcbiAgICAkKCdbZGF0YS10eXBlZC1zdHJdJykuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICB0ZXh0cyA9ICR0aGlzLmF0dHIoJ2RhdGEtdHlwZWQtc3RyJykuc3BsaXQoJ3wnKTtcblxuICAgICAgICAkdGhpcy5odG1sKCcnKS5hcHBlbmQoJzxzcGFuIGNsYXNzPVwidHlwZWQtY29udGFpbmVyXCI+PC9zcGFuPicpO1xuICAgICAgICAkdGhpcy5maW5kKCc+IC50eXBlZC1jb250YWluZXInKS50eXBlZCh7XG4gICAgICAgICAgICBzdHJpbmdzICAgOiB0ZXh0cyxcbiAgICAgICAgICAgIHR5cGVTcGVlZCA6IDY1LFxuICAgICAgICAgICAgbG9vcCAgICAgIDogKCR0aGlzLmF0dHIoJ2RhdGEtdHlwZWQtcmVwZWF0JykgPT09ICd5ZXMnKSxcbiAgICAgICAgICAgIGJhY2tEZWxheSA6IDE1MDAsXG4gICAgICAgICAgICBzaG93Q3Vyc29yOiAoJHRoaXMuYXR0cignZGF0YS10eXBlZC1jdXJzb3InKSA9PT0gJ3llcycpXG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7Il0sImZpbGUiOiJ0eXBlZC5qcyJ9
