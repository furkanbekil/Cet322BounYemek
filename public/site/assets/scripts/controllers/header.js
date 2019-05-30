/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */


/***********************************************
 * Proper animation delays for mobile menu
 ***********************************************/
(function($) {
    'use strict';

    var $html = $('html'),
        $burger_menu = $('#sp-mobile-nav-container'),
        $burger_trigger = $('#sp-mobile-nav-trigger'),
        animDelay = Modernizr.prefixed('animationDelay');

    $burger_menu.find('.nav_menu > li').each(function() {
        var $this = $(this);
        $this[0].style[animDelay] = 300 + ($this.index() * 150) + 'ms';
    });

    // submenu open trigger
    $burger_menu.find('.menu-item-has-children > a').on('click', function (e) {
        var $this = $(this),
            $current_menu_item = $(this).parent();

        $burger_menu.find('.menu-item-has-children').each(function () {
            if (!$.contains(this, $current_menu_item.get(0))) {
                $(this).find('> a').removeClass('sub-active').next('ul').slideUp(250);
            }
        });

        if ($this.next('ul').is(':visible') === false) {
            $this.addClass('sub-active').next('ul').slideDown(250);
        }

        e.preventDefault();
    });

    // toggle state of the burger menu
    var burger_menu_open = false;
    $burger_trigger.on('click', function (e) {
        e.preventDefault();

        burger_menu_open = !burger_menu_open;
        $html.toggleClass('sp-active-burger-menu', burger_menu_open);

        var header_height = $('#sp-header').outerHeight();
        $burger_menu.css('border-top-width', header_height);

        $burger_menu.find('.sub-active').each(function () {
            $(this).removeClass('sub-active').next('ul').hide();
        });
    });

    // close fullscreen menu on menu item click
    $burger_menu.find('.nav_menu a').on('click', function () {
        if ($(this).parent().hasClass('menu-item-has-children') === false) {
            burger_menu_open && $burger_trigger.trigger('click');
        }
    });

    // fix scrolling issues on mobile when menu is open
    $(document).on('touchmove', function (e) {
        if (burger_menu_open && !$(e.target).closest($burger_menu).length) {
            e.preventDefault();
        }
    });

})(jQuery);


/***********************************************
 * Desktop menu
 ***********************************************/
(function($) {
    'use strict';

    var $win = $(window),
        $header = $('#sp-header');

    // dropdown autoposition
    $win.on('docready load resize', $.debounce(250, function () {
        $header.find('.sub-menu').each(function () {
            var $this = $(this);
            if ($this.offset().left + $this.outerWidth() >= ($win.outerWidth() - 25)) {
                $this.addClass('invert-attach-point');
            }
        });
    }));

    // sticky menu (150 is a scroll offset in pixels)
    PZTJS.scrollRAF(function () {
        if (window.pageYOffset > 150 && !$header.hasClass('header-stuck')) {
            $header.addClass('header-stuck');
        }

        if (window.pageYOffset <= 150 && $header.hasClass('header-stuck')) {
            $header.removeClass('header-stuck');
        }
    });

    // disable jumps for empty-anchor links
    $header.find('.nav_menu a[href="#"]').on('click', function (e) {
        e.preventDefault();
    });

})(jQuery);


/***********************************************
 * Fullscreen search
 ***********************************************/
(function($) {
    'use strict';

    var $toggle = $('#sp-header').find('.sp-search-icon'),
        $searchContainer = $('#sp-search-block-container');

    // focus input when container is visible
    $searchContainer.find('> .search-block-inner').on(PZTJS.transitionEnd, function() {
        $(this).is(':visible') && $(this).find('.search-input').focus();
    });

    // close on click
    $searchContainer.find('.close-search').on('click', function(event) {
        event.preventDefault();
        $searchContainer.removeClass('open');
    });

    // close on esc keyup
    $(document).keyup(function(e) {
        (e.keyCode === 27) && $searchContainer.removeClass('open');
    });

    // open trigger
    $toggle.on('click', function(event) {
        event.preventDefault();
        $searchContainer.addClass('open');
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJoZWFkZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBSb21hbiBOYXphcmtpbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBQcm9wZXIgYW5pbWF0aW9uIGRlbGF5cyBmb3IgbW9iaWxlIG1lbnVcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyICRodG1sID0gJCgnaHRtbCcpLFxuICAgICAgICAkYnVyZ2VyX21lbnUgPSAkKCcjc3AtbW9iaWxlLW5hdi1jb250YWluZXInKSxcbiAgICAgICAgJGJ1cmdlcl90cmlnZ2VyID0gJCgnI3NwLW1vYmlsZS1uYXYtdHJpZ2dlcicpLFxuICAgICAgICBhbmltRGVsYXkgPSBNb2Rlcm5penIucHJlZml4ZWQoJ2FuaW1hdGlvbkRlbGF5Jyk7XG5cbiAgICAkYnVyZ2VyX21lbnUuZmluZCgnLm5hdl9tZW51ID4gbGknKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAkdGhpc1swXS5zdHlsZVthbmltRGVsYXldID0gMzAwICsgKCR0aGlzLmluZGV4KCkgKiAxNTApICsgJ21zJztcbiAgICB9KTtcblxuICAgIC8vIHN1Ym1lbnUgb3BlbiB0cmlnZ2VyXG4gICAgJGJ1cmdlcl9tZW51LmZpbmQoJy5tZW51LWl0ZW0taGFzLWNoaWxkcmVuID4gYScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICAkY3VycmVudF9tZW51X2l0ZW0gPSAkKHRoaXMpLnBhcmVudCgpO1xuXG4gICAgICAgICRidXJnZXJfbWVudS5maW5kKCcubWVudS1pdGVtLWhhcy1jaGlsZHJlbicpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCEkLmNvbnRhaW5zKHRoaXMsICRjdXJyZW50X21lbnVfaXRlbS5nZXQoMCkpKSB7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5maW5kKCc+IGEnKS5yZW1vdmVDbGFzcygnc3ViLWFjdGl2ZScpLm5leHQoJ3VsJykuc2xpZGVVcCgyNTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoJHRoaXMubmV4dCgndWwnKS5pcygnOnZpc2libGUnKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdzdWItYWN0aXZlJykubmV4dCgndWwnKS5zbGlkZURvd24oMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8vIHRvZ2dsZSBzdGF0ZSBvZiB0aGUgYnVyZ2VyIG1lbnVcbiAgICB2YXIgYnVyZ2VyX21lbnVfb3BlbiA9IGZhbHNlO1xuICAgICRidXJnZXJfdHJpZ2dlci5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgYnVyZ2VyX21lbnVfb3BlbiA9ICFidXJnZXJfbWVudV9vcGVuO1xuICAgICAgICAkaHRtbC50b2dnbGVDbGFzcygnc3AtYWN0aXZlLWJ1cmdlci1tZW51JywgYnVyZ2VyX21lbnVfb3Blbik7XG5cbiAgICAgICAgdmFyIGhlYWRlcl9oZWlnaHQgPSAkKCcjc3AtaGVhZGVyJykub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgJGJ1cmdlcl9tZW51LmNzcygnYm9yZGVyLXRvcC13aWR0aCcsIGhlYWRlcl9oZWlnaHQpO1xuXG4gICAgICAgICRidXJnZXJfbWVudS5maW5kKCcuc3ViLWFjdGl2ZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnc3ViLWFjdGl2ZScpLm5leHQoJ3VsJykuaGlkZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIGNsb3NlIGZ1bGxzY3JlZW4gbWVudSBvbiBtZW51IGl0ZW0gY2xpY2tcbiAgICAkYnVyZ2VyX21lbnUuZmluZCgnLm5hdl9tZW51IGEnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkKHRoaXMpLnBhcmVudCgpLmhhc0NsYXNzKCdtZW51LWl0ZW0taGFzLWNoaWxkcmVuJykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBidXJnZXJfbWVudV9vcGVuICYmICRidXJnZXJfdHJpZ2dlci50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBmaXggc2Nyb2xsaW5nIGlzc3VlcyBvbiBtb2JpbGUgd2hlbiBtZW51IGlzIG9wZW5cbiAgICAkKGRvY3VtZW50KS5vbigndG91Y2htb3ZlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGJ1cmdlcl9tZW51X29wZW4gJiYgISQoZS50YXJnZXQpLmNsb3Nlc3QoJGJ1cmdlcl9tZW51KS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KShqUXVlcnkpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogRGVza3RvcCBtZW51XG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24oJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciAkd2luID0gJCh3aW5kb3cpLFxuICAgICAgICAkaGVhZGVyID0gJCgnI3NwLWhlYWRlcicpO1xuXG4gICAgLy8gZHJvcGRvd24gYXV0b3Bvc2l0aW9uXG4gICAgJHdpbi5vbignZG9jcmVhZHkgbG9hZCByZXNpemUnLCAkLmRlYm91bmNlKDI1MCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAkaGVhZGVyLmZpbmQoJy5zdWItbWVudScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICAgIGlmICgkdGhpcy5vZmZzZXQoKS5sZWZ0ICsgJHRoaXMub3V0ZXJXaWR0aCgpID49ICgkd2luLm91dGVyV2lkdGgoKSAtIDI1KSkge1xuICAgICAgICAgICAgICAgICR0aGlzLmFkZENsYXNzKCdpbnZlcnQtYXR0YWNoLXBvaW50Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pKTtcblxuICAgIC8vIHN0aWNreSBtZW51ICgxNTAgaXMgYSBzY3JvbGwgb2Zmc2V0IGluIHBpeGVscylcbiAgICBQWlRKUy5zY3JvbGxSQUYoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAod2luZG93LnBhZ2VZT2Zmc2V0ID4gMTUwICYmICEkaGVhZGVyLmhhc0NsYXNzKCdoZWFkZXItc3R1Y2snKSkge1xuICAgICAgICAgICAgJGhlYWRlci5hZGRDbGFzcygnaGVhZGVyLXN0dWNrJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93LnBhZ2VZT2Zmc2V0IDw9IDE1MCAmJiAkaGVhZGVyLmhhc0NsYXNzKCdoZWFkZXItc3R1Y2snKSkge1xuICAgICAgICAgICAgJGhlYWRlci5yZW1vdmVDbGFzcygnaGVhZGVyLXN0dWNrJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGRpc2FibGUganVtcHMgZm9yIGVtcHR5LWFuY2hvciBsaW5rc1xuICAgICRoZWFkZXIuZmluZCgnLm5hdl9tZW51IGFbaHJlZj1cIiNcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBGdWxsc2NyZWVuIHNlYXJjaFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgJHRvZ2dsZSA9ICQoJyNzcC1oZWFkZXInKS5maW5kKCcuc3Atc2VhcmNoLWljb24nKSxcbiAgICAgICAgJHNlYXJjaENvbnRhaW5lciA9ICQoJyNzcC1zZWFyY2gtYmxvY2stY29udGFpbmVyJyk7XG5cbiAgICAvLyBmb2N1cyBpbnB1dCB3aGVuIGNvbnRhaW5lciBpcyB2aXNpYmxlXG4gICAgJHNlYXJjaENvbnRhaW5lci5maW5kKCc+IC5zZWFyY2gtYmxvY2staW5uZXInKS5vbihQWlRKUy50cmFuc2l0aW9uRW5kLCBmdW5jdGlvbigpIHtcbiAgICAgICAgJCh0aGlzKS5pcygnOnZpc2libGUnKSAmJiAkKHRoaXMpLmZpbmQoJy5zZWFyY2gtaW5wdXQnKS5mb2N1cygpO1xuICAgIH0pO1xuXG4gICAgLy8gY2xvc2Ugb24gY2xpY2tcbiAgICAkc2VhcmNoQ29udGFpbmVyLmZpbmQoJy5jbG9zZS1zZWFyY2gnKS5vbignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkc2VhcmNoQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbiAgICAvLyBjbG9zZSBvbiBlc2Mga2V5dXBcbiAgICAkKGRvY3VtZW50KS5rZXl1cChmdW5jdGlvbihlKSB7XG4gICAgICAgIChlLmtleUNvZGUgPT09IDI3KSAmJiAkc2VhcmNoQ29udGFpbmVyLnJlbW92ZUNsYXNzKCdvcGVuJyk7XG4gICAgfSk7XG5cbiAgICAvLyBvcGVuIHRyaWdnZXJcbiAgICAkdG9nZ2xlLm9uKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRzZWFyY2hDb250YWluZXIuYWRkQ2xhc3MoJ29wZW4nKTtcbiAgICB9KTtcblxufSkoalF1ZXJ5KTsiXSwiZmlsZSI6ImhlYWRlci5qcyJ9
