/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */


/***********************************************
 * Intro init
 ***********************************************/
(function ($) {
    'use strict';

    var $intro = $('.sp-intro'),
        $win = $(window);

    var initImage = function ($intro) {
        if (!$intro.attr('data-background')) { return; }
        $intro.find('> .intro-bg').length || $intro.append('<div class="intro-bg"/>');
        $intro.find('> .intro-bg').css('background-image', 'url(' + $intro.attr('data-background') + ')');
    };

    var initCarousel = function ($intro) {
        $intro.addClass('slick-dots-inside');

        $intro.on('init reInit', function () {
            $(this).find('.swipebox-video').swipebox();
        });

        var slickDefaultOptions = {
            slide        : '.slider-item',
            speed        : 1000,
            dots         : true,
            fade         : true,
            autoplay     : true,
            infinite     : true,
            autoplaySpeed: 7500
        };

        $intro.slick($.extend(slickDefaultOptions, $intro.data('slick')));
    };

    var initVideo = function($intro) {
        var $video = $intro.find('> .video-container'),
            $placeholder = $video.find('> .video-placeholder'),
            $controls = $video.find('> .video-controls');

        $video.on('YTPPlay YTPPause', function(e) {
            if(e.type === 'YTPPlay') { $controls.find('.sp-video-play > i').removeClass('icon-ion-ios-play'); }
            if(e.type === 'YTPPause') { $controls.find('.sp-video-play > i').addClass('icon-ion-ios-play'); }
        });

        $video.on('YTPMuted YTPUnmuted', function(e) {
            if(e.type === 'YTPMuted') { $controls.find('.sp-video-volume > i').removeClass('icon-ion-android-volume-up'); }
            if(e.type === 'YTPUnmuted') { $controls.find('.sp-video-volume > i').addClass('icon-ion-android-volume-up'); }
        });

        $video.YTPlayer({
            videoURL    : $video.data('url'),
            showControls: false,
            containment : 'self',
            loop        : true,
            autoPlay    : true,
            vol         : 25,
            mute        : true,
            showYTLogo  : false,
            startAt     : $video.data('start') || 0,
            stopAt      : $video.data('stop') || 0,
            onReady     : function () {
                $placeholder.fadeOut('fast');
                $controls.fadeIn('fast');
            }
        });

        $controls.find('.sp-video-play').on('click', function (e) {
            e.preventDefault();
            $video.YTPTogglePlay();
        });

        $controls.find('.sp-video-volume').on('click', function (e) {
            e.preventDefault();
            $video.YTPToggleVolume();
        });
    };

    // init all intros on the page
    $intro.each(function () {
        var $this = $(this);
        if ($this.hasClass('sp-intro-carousel')) { initCarousel($this); }
        if ($this.hasClass('sp-intro-video')) { initVideo($this); }
        if ($this.hasClass('sp-intro-image')) { initImage($this); }
    });

    // add scroll effect
    ($win.width() > 680) && PZTJS.scrollRAF(function () {
        $intro.each(function () {
            var $currIntro = $(this),
                introHeight = $currIntro.height(),
                pageYOffset = Math.max(window.pageYOffset, 0);

            if (window.pageYOffset > introHeight) {
                return;
            }

            var translateY = Math.floor(pageYOffset * 0.3) + 'px';
            $currIntro[0].style[Modernizr.prefixed('transform')] = 'translate3d(0, ' + translateY + ', 0)';
            $currIntro.css('opacity', (1 - pageYOffset / introHeight));
        });
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbnRyby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IFJvbWFuIE5hemFya2luLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEludHJvIGluaXRcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciAkaW50cm8gPSAkKCcuc3AtaW50cm8nKSxcbiAgICAgICAgJHdpbiA9ICQod2luZG93KTtcblxuICAgIHZhciBpbml0SW1hZ2UgPSBmdW5jdGlvbiAoJGludHJvKSB7XG4gICAgICAgIGlmICghJGludHJvLmF0dHIoJ2RhdGEtYmFja2dyb3VuZCcpKSB7IHJldHVybjsgfVxuICAgICAgICAkaW50cm8uZmluZCgnPiAuaW50cm8tYmcnKS5sZW5ndGggfHwgJGludHJvLmFwcGVuZCgnPGRpdiBjbGFzcz1cImludHJvLWJnXCIvPicpO1xuICAgICAgICAkaW50cm8uZmluZCgnPiAuaW50cm8tYmcnKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnLCAndXJsKCcgKyAkaW50cm8uYXR0cignZGF0YS1iYWNrZ3JvdW5kJykgKyAnKScpO1xuICAgIH07XG5cbiAgICB2YXIgaW5pdENhcm91c2VsID0gZnVuY3Rpb24gKCRpbnRybykge1xuICAgICAgICAkaW50cm8uYWRkQ2xhc3MoJ3NsaWNrLWRvdHMtaW5zaWRlJyk7XG5cbiAgICAgICAgJGludHJvLm9uKCdpbml0IHJlSW5pdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICQodGhpcykuZmluZCgnLnN3aXBlYm94LXZpZGVvJykuc3dpcGVib3goKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHNsaWNrRGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBzbGlkZSAgICAgICAgOiAnLnNsaWRlci1pdGVtJyxcbiAgICAgICAgICAgIHNwZWVkICAgICAgICA6IDEwMDAsXG4gICAgICAgICAgICBkb3RzICAgICAgICAgOiB0cnVlLFxuICAgICAgICAgICAgZmFkZSAgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9wbGF5ICAgICA6IHRydWUsXG4gICAgICAgICAgICBpbmZpbml0ZSAgICAgOiB0cnVlLFxuICAgICAgICAgICAgYXV0b3BsYXlTcGVlZDogNzUwMFxuICAgICAgICB9O1xuXG4gICAgICAgICRpbnRyby5zbGljaygkLmV4dGVuZChzbGlja0RlZmF1bHRPcHRpb25zLCAkaW50cm8uZGF0YSgnc2xpY2snKSkpO1xuICAgIH07XG5cbiAgICB2YXIgaW5pdFZpZGVvID0gZnVuY3Rpb24oJGludHJvKSB7XG4gICAgICAgIHZhciAkdmlkZW8gPSAkaW50cm8uZmluZCgnPiAudmlkZW8tY29udGFpbmVyJyksXG4gICAgICAgICAgICAkcGxhY2Vob2xkZXIgPSAkdmlkZW8uZmluZCgnPiAudmlkZW8tcGxhY2Vob2xkZXInKSxcbiAgICAgICAgICAgICRjb250cm9scyA9ICR2aWRlby5maW5kKCc+IC52aWRlby1jb250cm9scycpO1xuXG4gICAgICAgICR2aWRlby5vbignWVRQUGxheSBZVFBQYXVzZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmKGUudHlwZSA9PT0gJ1lUUFBsYXknKSB7ICRjb250cm9scy5maW5kKCcuc3AtdmlkZW8tcGxheSA+IGknKS5yZW1vdmVDbGFzcygnaWNvbi1pb24taW9zLXBsYXknKTsgfVxuICAgICAgICAgICAgaWYoZS50eXBlID09PSAnWVRQUGF1c2UnKSB7ICRjb250cm9scy5maW5kKCcuc3AtdmlkZW8tcGxheSA+IGknKS5hZGRDbGFzcygnaWNvbi1pb24taW9zLXBsYXknKTsgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkdmlkZW8ub24oJ1lUUE11dGVkIFlUUFVubXV0ZWQnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZihlLnR5cGUgPT09ICdZVFBNdXRlZCcpIHsgJGNvbnRyb2xzLmZpbmQoJy5zcC12aWRlby12b2x1bWUgPiBpJykucmVtb3ZlQ2xhc3MoJ2ljb24taW9uLWFuZHJvaWQtdm9sdW1lLXVwJyk7IH1cbiAgICAgICAgICAgIGlmKGUudHlwZSA9PT0gJ1lUUFVubXV0ZWQnKSB7ICRjb250cm9scy5maW5kKCcuc3AtdmlkZW8tdm9sdW1lID4gaScpLmFkZENsYXNzKCdpY29uLWlvbi1hbmRyb2lkLXZvbHVtZS11cCcpOyB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICR2aWRlby5ZVFBsYXllcih7XG4gICAgICAgICAgICB2aWRlb1VSTCAgICA6ICR2aWRlby5kYXRhKCd1cmwnKSxcbiAgICAgICAgICAgIHNob3dDb250cm9sczogZmFsc2UsXG4gICAgICAgICAgICBjb250YWlubWVudCA6ICdzZWxmJyxcbiAgICAgICAgICAgIGxvb3AgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9QbGF5ICAgIDogdHJ1ZSxcbiAgICAgICAgICAgIHZvbCAgICAgICAgIDogMjUsXG4gICAgICAgICAgICBtdXRlICAgICAgICA6IHRydWUsXG4gICAgICAgICAgICBzaG93WVRMb2dvICA6IGZhbHNlLFxuICAgICAgICAgICAgc3RhcnRBdCAgICAgOiAkdmlkZW8uZGF0YSgnc3RhcnQnKSB8fCAwLFxuICAgICAgICAgICAgc3RvcEF0ICAgICAgOiAkdmlkZW8uZGF0YSgnc3RvcCcpIHx8IDAsXG4gICAgICAgICAgICBvblJlYWR5ICAgICA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkcGxhY2Vob2xkZXIuZmFkZU91dCgnZmFzdCcpO1xuICAgICAgICAgICAgICAgICRjb250cm9scy5mYWRlSW4oJ2Zhc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGNvbnRyb2xzLmZpbmQoJy5zcC12aWRlby1wbGF5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICR2aWRlby5ZVFBUb2dnbGVQbGF5KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRjb250cm9scy5maW5kKCcuc3AtdmlkZW8tdm9sdW1lJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICR2aWRlby5ZVFBUb2dnbGVWb2x1bWUoKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIGluaXQgYWxsIGludHJvcyBvbiB0aGUgcGFnZVxuICAgICRpbnRyby5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzcC1pbnRyby1jYXJvdXNlbCcpKSB7IGluaXRDYXJvdXNlbCgkdGhpcyk7IH1cbiAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzcC1pbnRyby12aWRlbycpKSB7IGluaXRWaWRlbygkdGhpcyk7IH1cbiAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCdzcC1pbnRyby1pbWFnZScpKSB7IGluaXRJbWFnZSgkdGhpcyk7IH1cbiAgICB9KTtcblxuICAgIC8vIGFkZCBzY3JvbGwgZWZmZWN0XG4gICAgKCR3aW4ud2lkdGgoKSA+IDY4MCkgJiYgUFpUSlMuc2Nyb2xsUkFGKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGludHJvLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRjdXJySW50cm8gPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGludHJvSGVpZ2h0ID0gJGN1cnJJbnRyby5oZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBwYWdlWU9mZnNldCA9IE1hdGgubWF4KHdpbmRvdy5wYWdlWU9mZnNldCwgMCk7XG5cbiAgICAgICAgICAgIGlmICh3aW5kb3cucGFnZVlPZmZzZXQgPiBpbnRyb0hlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZVkgPSBNYXRoLmZsb29yKHBhZ2VZT2Zmc2V0ICogMC4zKSArICdweCc7XG4gICAgICAgICAgICAkY3VyckludHJvWzBdLnN0eWxlW01vZGVybml6ci5wcmVmaXhlZCgndHJhbnNmb3JtJyldID0gJ3RyYW5zbGF0ZTNkKDAsICcgKyB0cmFuc2xhdGVZICsgJywgMCknO1xuICAgICAgICAgICAgJGN1cnJJbnRyby5jc3MoJ29wYWNpdHknLCAoMSAtIHBhZ2VZT2Zmc2V0IC8gaW50cm9IZWlnaHQpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJpbnRyby5qcyJ9
