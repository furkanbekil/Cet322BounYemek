/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */


/***********************************************
 * WOW.js appearance animation engine
 ***********************************************/
(function ($) {
    'use strict';

    var animationDuration = Modernizr.prefixed('animationDuration');

    // quit from function on mobile devices
    // ======================================
    if (PZTJS.isMobile()) {
        $('.wow.sequenced').removeClass('wow sequenced');
        $('.wow').removeClass('wow');
        return;
    }


    // sequenced animations
    // ======================================
    var seqElements = $('.wow.sequenced').each(function() {
        var $this = $(this),
            classname = $this.attr('class'),
            animDuration = $this.data('wow-duration') || '1s',
            childrenSelector = $this.data('wow-children'),
            fxname = /fx-([a-zA-Z]+)/g.exec(classname);

        // remove classnames
        $this.removeClass('wow sequenced fx-' + fxname[1]);

        // select children elements
        var $children = $this.find('> *');
        if (!childrenSelector) {
            if ($this.hasClass('wpb_column')) { // || $this.hasClass('wpb_row')
                $children = $this.find('.wpb_wrapper > *');
            }
        } else {
            $children = $this.find(childrenSelector);
        }

        // hide all non-animated children
        $children.css('visibility', 'hidden');

        // set proper animation speed
        for (var i = 0; i < $children.length; i++) {
            $children.get(i).style[animationDuration] = animDuration;
        }

        // bind animation end event
        $children.one(PZTJS.animationEnd, function() {
            $(this).removeClass('animated ' + fxname[1]);
        });

        // save data for further execution
        $this.data({
            wow_children: $children,
            wow_fx      : fxname[1]
        });
    });

    // start animations when element appears in viewport
    seqElements.one('appear', function () {
        var $this = $(this), rowStart = null;

        // get fx name
        var fxname = $this.data('wow_fx'),
            $children = $this.data('wow_children'),
            el_index = 0, row_id = 0;

        // run animation sequence
        $children.each(function () {
            var $el = $(this), currTopPosition = $el.position().top;

            // check for a new row
            if (currTopPosition !== rowStart) {
                el_index = 0;
                rowStart = currTopPosition;
                row_id++;
            }

            // run animation after some delay
            setTimeout(function() {
                $el.addClass('animated ' + fxname);
                $el.css('visibility', 'visible');
            }, (el_index * 300) + (row_id * 150));

            el_index++;
        });
    });


    // regular wow engine
    // ======================================
    var regWOW = new WOW({
        boxClass       : 'wow',      // animated element css class (default is wow)
        animateClass   : 'animated', // animation css class (default is animated)
        offset         : 0,          // distance to the element when triggering the animation (default is 0)
        mobile         : false,      // trigger animations on mobile devices (default is true)
        live           : true,       // act on asynchronously loaded content (default is true)
        scrollContainer: null,       // optional scroll container selector, otherwise use window
        callback       : function (box) {
            // the callback is fired every time an animation is started
            // the argument that is passed in is the DOM node being animated
        }
    });


    // run both engines once preloading done
    // ======================================
    $(window).one('pzt.preloader_done', function() {
        seqElements.selector = false;
        seqElements.appear({force_process: true});

        regWOW.init();
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ3b3cuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiAgQXV0aG9yOiBSb21hbiBOYXphcmtpbiwgRWdvciBEYW5rb3ZcbiAqICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogIFB1enpsZVRoZW1lc1xuICogID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBXT1cuanMgYXBwZWFyYW5jZSBhbmltYXRpb24gZW5naW5lXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgYW5pbWF0aW9uRHVyYXRpb24gPSBNb2Rlcm5penIucHJlZml4ZWQoJ2FuaW1hdGlvbkR1cmF0aW9uJyk7XG5cbiAgICAvLyBxdWl0IGZyb20gZnVuY3Rpb24gb24gbW9iaWxlIGRldmljZXNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIGlmIChQWlRKUy5pc01vYmlsZSgpKSB7XG4gICAgICAgICQoJy53b3cuc2VxdWVuY2VkJykucmVtb3ZlQ2xhc3MoJ3dvdyBzZXF1ZW5jZWQnKTtcbiAgICAgICAgJCgnLndvdycpLnJlbW92ZUNsYXNzKCd3b3cnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuXG4gICAgLy8gc2VxdWVuY2VkIGFuaW1hdGlvbnNcbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIHZhciBzZXFFbGVtZW50cyA9ICQoJy53b3cuc2VxdWVuY2VkJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGNsYXNzbmFtZSA9ICR0aGlzLmF0dHIoJ2NsYXNzJyksXG4gICAgICAgICAgICBhbmltRHVyYXRpb24gPSAkdGhpcy5kYXRhKCd3b3ctZHVyYXRpb24nKSB8fCAnMXMnLFxuICAgICAgICAgICAgY2hpbGRyZW5TZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3dvdy1jaGlsZHJlbicpLFxuICAgICAgICAgICAgZnhuYW1lID0gL2Z4LShbYS16QS1aXSspL2cuZXhlYyhjbGFzc25hbWUpO1xuXG4gICAgICAgIC8vIHJlbW92ZSBjbGFzc25hbWVzXG4gICAgICAgICR0aGlzLnJlbW92ZUNsYXNzKCd3b3cgc2VxdWVuY2VkIGZ4LScgKyBmeG5hbWVbMV0pO1xuXG4gICAgICAgIC8vIHNlbGVjdCBjaGlsZHJlbiBlbGVtZW50c1xuICAgICAgICB2YXIgJGNoaWxkcmVuID0gJHRoaXMuZmluZCgnPiAqJyk7XG4gICAgICAgIGlmICghY2hpbGRyZW5TZWxlY3Rvcikge1xuICAgICAgICAgICAgaWYgKCR0aGlzLmhhc0NsYXNzKCd3cGJfY29sdW1uJykpIHsgLy8gfHwgJHRoaXMuaGFzQ2xhc3MoJ3dwYl9yb3cnKVxuICAgICAgICAgICAgICAgICRjaGlsZHJlbiA9ICR0aGlzLmZpbmQoJy53cGJfd3JhcHBlciA+IConKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRjaGlsZHJlbiA9ICR0aGlzLmZpbmQoY2hpbGRyZW5TZWxlY3Rvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBoaWRlIGFsbCBub24tYW5pbWF0ZWQgY2hpbGRyZW5cbiAgICAgICAgJGNoaWxkcmVuLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKTtcblxuICAgICAgICAvLyBzZXQgcHJvcGVyIGFuaW1hdGlvbiBzcGVlZFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgJGNoaWxkcmVuLmdldChpKS5zdHlsZVthbmltYXRpb25EdXJhdGlvbl0gPSBhbmltRHVyYXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBiaW5kIGFuaW1hdGlvbiBlbmQgZXZlbnRcbiAgICAgICAgJGNoaWxkcmVuLm9uZShQWlRKUy5hbmltYXRpb25FbmQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCh0aGlzKS5yZW1vdmVDbGFzcygnYW5pbWF0ZWQgJyArIGZ4bmFtZVsxXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHNhdmUgZGF0YSBmb3IgZnVydGhlciBleGVjdXRpb25cbiAgICAgICAgJHRoaXMuZGF0YSh7XG4gICAgICAgICAgICB3b3dfY2hpbGRyZW46ICRjaGlsZHJlbixcbiAgICAgICAgICAgIHdvd19meCAgICAgIDogZnhuYW1lWzFdXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gc3RhcnQgYW5pbWF0aW9ucyB3aGVuIGVsZW1lbnQgYXBwZWFycyBpbiB2aWV3cG9ydFxuICAgIHNlcUVsZW1lbnRzLm9uZSgnYXBwZWFyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLCByb3dTdGFydCA9IG51bGw7XG5cbiAgICAgICAgLy8gZ2V0IGZ4IG5hbWVcbiAgICAgICAgdmFyIGZ4bmFtZSA9ICR0aGlzLmRhdGEoJ3dvd19meCcpLFxuICAgICAgICAgICAgJGNoaWxkcmVuID0gJHRoaXMuZGF0YSgnd293X2NoaWxkcmVuJyksXG4gICAgICAgICAgICBlbF9pbmRleCA9IDAsIHJvd19pZCA9IDA7XG5cbiAgICAgICAgLy8gcnVuIGFuaW1hdGlvbiBzZXF1ZW5jZVxuICAgICAgICAkY2hpbGRyZW4uZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSwgY3VyclRvcFBvc2l0aW9uID0gJGVsLnBvc2l0aW9uKCkudG9wO1xuXG4gICAgICAgICAgICAvLyBjaGVjayBmb3IgYSBuZXcgcm93XG4gICAgICAgICAgICBpZiAoY3VyclRvcFBvc2l0aW9uICE9PSByb3dTdGFydCkge1xuICAgICAgICAgICAgICAgIGVsX2luZGV4ID0gMDtcbiAgICAgICAgICAgICAgICByb3dTdGFydCA9IGN1cnJUb3BQb3NpdGlvbjtcbiAgICAgICAgICAgICAgICByb3dfaWQrKztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gcnVuIGFuaW1hdGlvbiBhZnRlciBzb21lIGRlbGF5XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRlbC5hZGRDbGFzcygnYW5pbWF0ZWQgJyArIGZ4bmFtZSk7XG4gICAgICAgICAgICAgICAgJGVsLmNzcygndmlzaWJpbGl0eScsICd2aXNpYmxlJyk7XG4gICAgICAgICAgICB9LCAoZWxfaW5kZXggKiAzMDApICsgKHJvd19pZCAqIDE1MCkpO1xuXG4gICAgICAgICAgICBlbF9pbmRleCsrO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgLy8gcmVndWxhciB3b3cgZW5naW5lXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICB2YXIgcmVnV09XID0gbmV3IFdPVyh7XG4gICAgICAgIGJveENsYXNzICAgICAgIDogJ3dvdycsICAgICAgLy8gYW5pbWF0ZWQgZWxlbWVudCBjc3MgY2xhc3MgKGRlZmF1bHQgaXMgd293KVxuICAgICAgICBhbmltYXRlQ2xhc3MgICA6ICdhbmltYXRlZCcsIC8vIGFuaW1hdGlvbiBjc3MgY2xhc3MgKGRlZmF1bHQgaXMgYW5pbWF0ZWQpXG4gICAgICAgIG9mZnNldCAgICAgICAgIDogMCwgICAgICAgICAgLy8gZGlzdGFuY2UgdG8gdGhlIGVsZW1lbnQgd2hlbiB0cmlnZ2VyaW5nIHRoZSBhbmltYXRpb24gKGRlZmF1bHQgaXMgMClcbiAgICAgICAgbW9iaWxlICAgICAgICAgOiBmYWxzZSwgICAgICAvLyB0cmlnZ2VyIGFuaW1hdGlvbnMgb24gbW9iaWxlIGRldmljZXMgKGRlZmF1bHQgaXMgdHJ1ZSlcbiAgICAgICAgbGl2ZSAgICAgICAgICAgOiB0cnVlLCAgICAgICAvLyBhY3Qgb24gYXN5bmNocm9ub3VzbHkgbG9hZGVkIGNvbnRlbnQgKGRlZmF1bHQgaXMgdHJ1ZSlcbiAgICAgICAgc2Nyb2xsQ29udGFpbmVyOiBudWxsLCAgICAgICAvLyBvcHRpb25hbCBzY3JvbGwgY29udGFpbmVyIHNlbGVjdG9yLCBvdGhlcndpc2UgdXNlIHdpbmRvd1xuICAgICAgICBjYWxsYmFjayAgICAgICA6IGZ1bmN0aW9uIChib3gpIHtcbiAgICAgICAgICAgIC8vIHRoZSBjYWxsYmFjayBpcyBmaXJlZCBldmVyeSB0aW1lIGFuIGFuaW1hdGlvbiBpcyBzdGFydGVkXG4gICAgICAgICAgICAvLyB0aGUgYXJndW1lbnQgdGhhdCBpcyBwYXNzZWQgaW4gaXMgdGhlIERPTSBub2RlIGJlaW5nIGFuaW1hdGVkXG4gICAgICAgIH1cbiAgICB9KTtcblxuXG4gICAgLy8gcnVuIGJvdGggZW5naW5lcyBvbmNlIHByZWxvYWRpbmcgZG9uZVxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgJCh3aW5kb3cpLm9uZSgncHp0LnByZWxvYWRlcl9kb25lJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNlcUVsZW1lbnRzLnNlbGVjdG9yID0gZmFsc2U7XG4gICAgICAgIHNlcUVsZW1lbnRzLmFwcGVhcih7Zm9yY2VfcHJvY2VzczogdHJ1ZX0pO1xuXG4gICAgICAgIHJlZ1dPVy5pbml0KCk7XG4gICAgfSk7XG5cbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJ3b3cuanMifQ==
