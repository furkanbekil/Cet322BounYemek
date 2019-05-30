/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Clients Slider
 ***********************************************/
(function ($) {

    $('.sp-slick-clients').slick({
        dots          : false,
        infinite      : true,
        adaptiveHeight: true,
        speed         : 750,
        slidesToShow  : 5,
        autoplay      : true,
        arrows        : false,
        responsive    : [{
            breakpoint: 992,
            settings  : {
                slidesToShow: 3
            }
        }, {
            breakpoint: 768,
            settings  : {
                slidesToShow: 2
            }
        }, {
            breakpoint: 480,
            settings  : {
                slidesToShow: 1
            }
        }]
    });

})(jQuery);



(function ($) {

    $('.sp-slick-demo').slick({
        dots          : false,
        infinite      : true,
        adaptiveHeight: true,
        speed         : 750,
        slidesToShow  : 3,
        autoplay      : true,
        arrows        : false,
        responsive    : [{
            breakpoint: 992,
            settings  : {
                slidesToShow: 3
            }
        }, {
            breakpoint: 768,
            settings  : {
                slidesToShow: 2
            }
        }, {
            breakpoint: 480,
            settings  : {
                slidesToShow: 1
            }
        }]
    });

})(jQuery);


/***********************************************
 * Testimonials Slider
 ***********************************************/
(function ($) {

    $('.sp-slick-testimonials').slick({
        dots          : true,
        infinite      : true,
        speed         : 750,
        slidesToShow  : 1,
        adaptiveHeight: true,
        autoplay      : true,
        arrows        : false,
        autoplaySpeed : 6500
    });

})(jQuery);


/***********************************************
 * "iMac" slider
 ***********************************************/
(function($) {

    $('.sp-slick-imac').slick({
        dots          : true,
        infinite      : true,
        speed         : 450,
        slidesToShow  : 1,
        adaptiveHeight: true,
        autoplay      : true,
        arrows        : false,
        fade          : true,
        easing        : 'linear'
    });

})(jQuery);


/***********************************************
 * Single Post Gallery
 ***********************************************/
(function ($) {

    $('.sp-slick-post-gallery').slick({
        dots          : false,
        infinite      : true,
        speed         : 750,
        slidesToShow  : 1,
        adaptiveHeight: true,
        autoplay      : true,
        autoplaySpeed : 5000,
        nextArrow     : '<div class="slick-next circle"><i class="icon-angle-right"></i></div>',
        prevArrow     : '<div class="slick-prev circle"><i class="icon-angle-left"></i></div>',
    });

})(jQuery);


/***************************************************
 * Add slick-animated class when transition is over
 ***************************************************/
(function ($) {

    var $sliders = $('.slick-initialized');

    $sliders.on('initialAnimate reInit afterChange', function (e, slick, currentSlide) {
        currentSlide = currentSlide || 0;
        slick = slick || $(this).slick('getSlick');

        $(slick.$slides).removeClass('slick-animated');
        $(slick.$slides[currentSlide]).addClass('slick-animated');
    });

    $sliders.trigger('initialAnimate');

})(jQuery);


/***************************************************
 * Stop sliders that is not currently in viewport
 ***************************************************/
(function ($) {

    var $sliders = $('.slick-initialized');

    PZTJS.scrollRAF($.throttle(250, function () {
        $sliders.each(function () {
            var $this = $(this),
                $slick = $this.slick('getSlick');

            // stop slider
            if (!PZTJS.isElementInViewport(this) && !$slick.paused) {
                $this.slick('pause');
            }

            // unpause slider
            if (PZTJS.isElementInViewport(this) && $slick.paused) {
                $this.slick('play');
            }
        });
    }));

})(jQuery);


/***************************************************
 * Integrate WOW.js with slick
 ***************************************************/
(function($) {

    $('.slick-initialized').on('beforeChange', function(e, slick, currentSlide, nextSlide) {
        $(slick.$slides[nextSlide]).find('.wow, .re-animate').each(function () {
            var el = $(this),
                newone = el.clone(true);

            el.before(newone);
            el.remove();
        });
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzbGlkZXJzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogIEF1dGhvcjogTmF6YXJraW4gUm9tYW4sIEVnb3IgRGFua292XG4gKiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICBQdXp6bGVUaGVtZXNcbiAqICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQ2xpZW50cyBTbGlkZXJcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgJCgnLnNwLXNsaWNrLWNsaWVudHMnKS5zbGljayh7XG4gICAgICAgIGRvdHMgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgaW5maW5pdGUgICAgICA6IHRydWUsXG4gICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxuICAgICAgICBzcGVlZCAgICAgICAgIDogNzUwLFxuICAgICAgICBzbGlkZXNUb1Nob3cgIDogNSxcbiAgICAgICAgYXV0b3BsYXkgICAgICA6IHRydWUsXG4gICAgICAgIGFycm93cyAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgcmVzcG9uc2l2ZSAgICA6IFt7XG4gICAgICAgICAgICBicmVha3BvaW50OiA5OTIsXG4gICAgICAgICAgICBzZXR0aW5ncyAgOiB7XG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAzXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDc2OCxcbiAgICAgICAgICAgIHNldHRpbmdzICA6IHtcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJlYWtwb2ludDogNDgwLFxuICAgICAgICAgICAgc2V0dGluZ3MgIDoge1xuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMVxuICAgICAgICAgICAgfVxuICAgICAgICB9XVxuICAgIH0pO1xuXG59KShqUXVlcnkpO1xuXG5cblxuKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAkKCcuc3Atc2xpY2stZGVtbycpLnNsaWNrKHtcbiAgICAgICAgZG90cyAgICAgICAgICA6IGZhbHNlLFxuICAgICAgICBpbmZpbml0ZSAgICAgIDogdHJ1ZSxcbiAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IHRydWUsXG4gICAgICAgIHNwZWVkICAgICAgICAgOiA3NTAsXG4gICAgICAgIHNsaWRlc1RvU2hvdyAgOiAzLFxuICAgICAgICBhdXRvcGxheSAgICAgIDogdHJ1ZSxcbiAgICAgICAgYXJyb3dzICAgICAgICA6IGZhbHNlLFxuICAgICAgICByZXNwb25zaXZlICAgIDogW3tcbiAgICAgICAgICAgIGJyZWFrcG9pbnQ6IDk5MixcbiAgICAgICAgICAgIHNldHRpbmdzICA6IHtcbiAgICAgICAgICAgICAgICBzbGlkZXNUb1Nob3c6IDNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgICAgYnJlYWtwb2ludDogNzY4LFxuICAgICAgICAgICAgc2V0dGluZ3MgIDoge1xuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2hvdzogMlxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBicmVha3BvaW50OiA0ODAsXG4gICAgICAgICAgICBzZXR0aW5ncyAgOiB7XG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxXG4gICAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBUZXN0aW1vbmlhbHMgU2xpZGVyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAgICQoJy5zcC1zbGljay10ZXN0aW1vbmlhbHMnKS5zbGljayh7XG4gICAgICAgIGRvdHMgICAgICAgICAgOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZSAgICAgIDogdHJ1ZSxcbiAgICAgICAgc3BlZWQgICAgICAgICA6IDc1MCxcbiAgICAgICAgc2xpZGVzVG9TaG93ICA6IDEsXG4gICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxuICAgICAgICBhdXRvcGxheSAgICAgIDogdHJ1ZSxcbiAgICAgICAgYXJyb3dzICAgICAgICA6IGZhbHNlLFxuICAgICAgICBhdXRvcGxheVNwZWVkIDogNjUwMFxuICAgIH0pO1xuXG59KShqUXVlcnkpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogXCJpTWFjXCIgc2xpZGVyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24oJCkge1xuXG4gICAgJCgnLnNwLXNsaWNrLWltYWMnKS5zbGljayh7XG4gICAgICAgIGRvdHMgICAgICAgICAgOiB0cnVlLFxuICAgICAgICBpbmZpbml0ZSAgICAgIDogdHJ1ZSxcbiAgICAgICAgc3BlZWQgICAgICAgICA6IDQ1MCxcbiAgICAgICAgc2xpZGVzVG9TaG93ICA6IDEsXG4gICAgICAgIGFkYXB0aXZlSGVpZ2h0OiB0cnVlLFxuICAgICAgICBhdXRvcGxheSAgICAgIDogdHJ1ZSxcbiAgICAgICAgYXJyb3dzICAgICAgICA6IGZhbHNlLFxuICAgICAgICBmYWRlICAgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgZWFzaW5nICAgICAgICA6ICdsaW5lYXInXG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBTaW5nbGUgUG9zdCBHYWxsZXJ5XG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAgICQoJy5zcC1zbGljay1wb3N0LWdhbGxlcnknKS5zbGljayh7XG4gICAgICAgIGRvdHMgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgaW5maW5pdGUgICAgICA6IHRydWUsXG4gICAgICAgIHNwZWVkICAgICAgICAgOiA3NTAsXG4gICAgICAgIHNsaWRlc1RvU2hvdyAgOiAxLFxuICAgICAgICBhZGFwdGl2ZUhlaWdodDogdHJ1ZSxcbiAgICAgICAgYXV0b3BsYXkgICAgICA6IHRydWUsXG4gICAgICAgIGF1dG9wbGF5U3BlZWQgOiA1MDAwLFxuICAgICAgICBuZXh0QXJyb3cgICAgIDogJzxkaXYgY2xhc3M9XCJzbGljay1uZXh0IGNpcmNsZVwiPjxpIGNsYXNzPVwiaWNvbi1hbmdsZS1yaWdodFwiPjwvaT48L2Rpdj4nLFxuICAgICAgICBwcmV2QXJyb3cgICAgIDogJzxkaXYgY2xhc3M9XCJzbGljay1wcmV2IGNpcmNsZVwiPjxpIGNsYXNzPVwiaWNvbi1hbmdsZS1sZWZ0XCI+PC9pPjwvZGl2PicsXG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogQWRkIHNsaWNrLWFuaW1hdGVkIGNsYXNzIHdoZW4gdHJhbnNpdGlvbiBpcyBvdmVyXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgJHNsaWRlcnMgPSAkKCcuc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgICRzbGlkZXJzLm9uKCdpbml0aWFsQW5pbWF0ZSByZUluaXQgYWZ0ZXJDaGFuZ2UnLCBmdW5jdGlvbiAoZSwgc2xpY2ssIGN1cnJlbnRTbGlkZSkge1xuICAgICAgICBjdXJyZW50U2xpZGUgPSBjdXJyZW50U2xpZGUgfHwgMDtcbiAgICAgICAgc2xpY2sgPSBzbGljayB8fCAkKHRoaXMpLnNsaWNrKCdnZXRTbGljaycpO1xuXG4gICAgICAgICQoc2xpY2suJHNsaWRlcykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFuaW1hdGVkJyk7XG4gICAgICAgICQoc2xpY2suJHNsaWRlc1tjdXJyZW50U2xpZGVdKS5hZGRDbGFzcygnc2xpY2stYW5pbWF0ZWQnKTtcbiAgICB9KTtcblxuICAgICRzbGlkZXJzLnRyaWdnZXIoJ2luaXRpYWxBbmltYXRlJyk7XG5cbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogU3RvcCBzbGlkZXJzIHRoYXQgaXMgbm90IGN1cnJlbnRseSBpbiB2aWV3cG9ydFxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyICRzbGlkZXJzID0gJCgnLnNsaWNrLWluaXRpYWxpemVkJyk7XG5cbiAgICBQWlRKUy5zY3JvbGxSQUYoJC50aHJvdHRsZSgyNTAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNsaWRlcnMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICRzbGljayA9ICR0aGlzLnNsaWNrKCdnZXRTbGljaycpO1xuXG4gICAgICAgICAgICAvLyBzdG9wIHNsaWRlclxuICAgICAgICAgICAgaWYgKCFQWlRKUy5pc0VsZW1lbnRJblZpZXdwb3J0KHRoaXMpICYmICEkc2xpY2sucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuc2xpY2soJ3BhdXNlJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHVucGF1c2Ugc2xpZGVyXG4gICAgICAgICAgICBpZiAoUFpUSlMuaXNFbGVtZW50SW5WaWV3cG9ydCh0aGlzKSAmJiAkc2xpY2sucGF1c2VkKSB7XG4gICAgICAgICAgICAgICAgJHRoaXMuc2xpY2soJ3BsYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSkpO1xuXG59KShqUXVlcnkpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEludGVncmF0ZSBXT1cuanMgd2l0aCBzbGlja1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbigkKSB7XG5cbiAgICAkKCcuc2xpY2staW5pdGlhbGl6ZWQnKS5vbignYmVmb3JlQ2hhbmdlJywgZnVuY3Rpb24oZSwgc2xpY2ssIGN1cnJlbnRTbGlkZSwgbmV4dFNsaWRlKSB7XG4gICAgICAgICQoc2xpY2suJHNsaWRlc1tuZXh0U2xpZGVdKS5maW5kKCcud293LCAucmUtYW5pbWF0ZScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBuZXdvbmUgPSBlbC5jbG9uZSh0cnVlKTtcblxuICAgICAgICAgICAgZWwuYmVmb3JlKG5ld29uZSk7XG4gICAgICAgICAgICBlbC5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJzbGlkZXJzLmpzIn0=
