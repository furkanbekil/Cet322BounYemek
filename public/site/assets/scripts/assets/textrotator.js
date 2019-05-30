/* ===========================================================
 * jquery-simple-text-rotator.js v1
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * A very simple and light weight jQuery plugin that
 * allows you to rotate multiple text without changing
 * the layout
 * https://github.com/peachananr/simple-text-rotator
 *
 * ========================================================== */

!function($){

    var defaults = {
        animation: "dissolve",
        separator: ",",
        speed: 2000
    };

    $.fx.step.textShadowBlur = function(fx) {
        $(fx.elem).prop('textShadowBlur', fx.now).css({textShadow: '0 0 ' + Math.floor(fx.now) + 'px black'});
    };

    $.fn.textrotator = function(options){
        var settings = $.extend({}, defaults, options);

        return this.each(function(){
            var el = $(this);
            var array = [];
            $.each(el.text().split(settings.separator), function(key, value) {
                array.push(value);
            });
            el.text(array[0]);

            // animation option
            var rotate = function() {
                switch (settings.animation) {
                    case 'dissolve':
                        el.animate({
                            textShadowBlur:20,
                            opacity: 0
                        }, 500 , function() {
                            index = $.inArray(el.text(), array);
                            if((index + 1) == array.length) index = -1;
                            el.text(array[index + 1]).animate({
                                textShadowBlur:0,
                                opacity: 1
                            }, 500 );
                        });
                        break;

                    case 'flip':
                        if(el.find(".back").length > 0) {
                            el.html(el.find(".back").html());
                        }

                        var initial = el.text();
                        var index = $.inArray(initial, array);
                        if((index + 1) == array.length) index = -1;

                        el.html("");
                        $("<span class='front'>" + initial + "</span>").appendTo(el);
                        $("<span class='back'>" + array[index + 1] + "</span>").appendTo(el);

                        var mwidth = Math.max(el.find('.back').outerWidth(), el.find('.front').outerWidth());
                        el.find('.back, .front').css('min-width', mwidth);

                        el.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip").show().css({
                            "-webkit-transform": " rotateY(-180deg)",
                            "-moz-transform": " rotateY(-180deg)",
                            "-o-transform": " rotateY(-180deg)",
                            "transform": " rotateY(-180deg)"
                        });

                        break;

                    case 'flipUp':
                        if(el.find(".back").length > 0) {
                            el.html(el.find(".back").html());
                        }

                        var initial = el.text();
                        var index = $.inArray(initial, array);
                        if((index + 1) == array.length) index = -1;

                        el.html("");
                        $("<span class='front'>" + initial + "</span>").appendTo(el);
                        $("<span class='back'>" + array[index + 1] + "</span>").appendTo(el);

                        var mwidth = Math.max(el.find('.back').outerWidth(), el.find('.front').outerWidth());
                        el.find('.back, .front').css('min-width', mwidth);

                        el.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip up").show().css({
                            "-webkit-transform": " rotateX(-180deg)",
                            "-moz-transform": " rotateX(-180deg)",
                            "-o-transform": " rotateX(-180deg)",
                            "transform": " rotateX(-180deg)"
                        });

                        break;

                    case 'flipCube':
                        if(el.find(".back").length > 0) {
                            el.html(el.find(".back").html());
                        }

                        var initial = el.text();
                        var index = $.inArray(initial, array);
                        if((index + 1) == array.length) index = -1;

                        el.html("");
                        $("<span class='front'>" + initial + "</span>").appendTo(el);
                        $("<span class='back'>" + array[index + 1] + "</span>").appendTo(el);

                        var mwidth = Math.max(el.find('.back').outerWidth(), el.find('.front').outerWidth());
                        el.find('.back, .front').css('min-width', mwidth);

                        el.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip cube").show().css({
                            "-webkit-transform": " rotateY(180deg)",
                            "-moz-transform": " rotateY(180deg)",
                            "-o-transform": " rotateY(180deg)",
                            "transform": " rotateY(180deg)"
                        });

                        break;

                    case 'flipCubeUp':
                        if(el.find(".back").length > 0) {
                            el.html(el.find(".back").html());
                        }

                        var initial = el.text();
                        var index = $.inArray(initial, array);
                        if((index + 1) == array.length) index = -1;

                        el.html("");
                        $("<span class='front'>" + initial + "</span>").appendTo(el);
                        $("<span class='back'>" + array[index + 1] + "</span>").appendTo(el);

                        var mwidth = Math.max(el.find('.back').outerWidth(), el.find('.front').outerWidth());
                        el.find('.back, .front').css('min-width', mwidth);

                        el.wrapInner("<span class='rotating' />").find(".rotating").hide().addClass("flip cube up").show().css({
                            "-webkit-transform": " rotateX(180deg)",
                            "-moz-transform": " rotateX(180deg)",
                            "-o-transform": " rotateX(180deg)",
                            "transform": " rotateX(180deg)"
                        });

                        break;

                    case 'spin':
                        if(el.find(".rotating").length > 0) {
                            el.html(el.find(".rotating").html());
                        }
                        index = $.inArray(el.text(), array);
                        if((index + 1) == array.length) index = -1;

                        el.wrapInner("<span class='rotating spin' />").find(".rotating").hide().text(array[index + 1]).show().css({
                            "-webkit-transform": " rotate(0) scale(1)",
                            "-moz-transform": "rotate(0) scale(1)",
                            "-o-transform": "rotate(0) scale(1)",
                            "transform": "rotate(0) scale(1)"
                        });
                        break;

                    case 'fade':
                        el.fadeOut(settings.speed, function() {
                            index = $.inArray(el.text(), array);
                            if((index + 1) == array.length) index = -1;
                            el.text(array[index + 1]).fadeIn(settings.speed);
                        });
                        break;
                }

                // if (el.find('.back, .front').length) {
                //     var mwidth = Math.max(el.find('.back').outerWidth(), el.find('.front').outerWidth());
                //     el.find('.back, .front').css('min-width', mwidth);
                // }
            };
            setInterval(rotate, settings.speed);
        });
    };

}(window.jQuery);


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0ZXh0cm90YXRvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICoganF1ZXJ5LXNpbXBsZS10ZXh0LXJvdGF0b3IuanMgdjFcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMyBQZXRlIFJvandvbmdzdXJpeWEuXG4gKiBodHRwOi8vd3d3LnRoZXBldGVkZXNpZ24uY29tXG4gKlxuICogQSB2ZXJ5IHNpbXBsZSBhbmQgbGlnaHQgd2VpZ2h0IGpRdWVyeSBwbHVnaW4gdGhhdFxuICogYWxsb3dzIHlvdSB0byByb3RhdGUgbXVsdGlwbGUgdGV4dCB3aXRob3V0IGNoYW5naW5nXG4gKiB0aGUgbGF5b3V0XG4gKiBodHRwczovL2dpdGh1Yi5jb20vcGVhY2hhbmFuci9zaW1wbGUtdGV4dC1yb3RhdG9yXG4gKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG4hZnVuY3Rpb24oJCl7XG5cbiAgICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgICAgIGFuaW1hdGlvbjogXCJkaXNzb2x2ZVwiLFxuICAgICAgICBzZXBhcmF0b3I6IFwiLFwiLFxuICAgICAgICBzcGVlZDogMjAwMFxuICAgIH07XG5cbiAgICAkLmZ4LnN0ZXAudGV4dFNoYWRvd0JsdXIgPSBmdW5jdGlvbihmeCkge1xuICAgICAgICAkKGZ4LmVsZW0pLnByb3AoJ3RleHRTaGFkb3dCbHVyJywgZngubm93KS5jc3Moe3RleHRTaGFkb3c6ICcwIDAgJyArIE1hdGguZmxvb3IoZngubm93KSArICdweCBibGFjayd9KTtcbiAgICB9O1xuXG4gICAgJC5mbi50ZXh0cm90YXRvciA9IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSAkLmV4dGVuZCh7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBlbCA9ICQodGhpcyk7XG4gICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgICAgICQuZWFjaChlbC50ZXh0KCkuc3BsaXQoc2V0dGluZ3Muc2VwYXJhdG9yKSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbC50ZXh0KGFycmF5WzBdKTtcblxuICAgICAgICAgICAgLy8gYW5pbWF0aW9uIG9wdGlvblxuICAgICAgICAgICAgdmFyIHJvdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2V0dGluZ3MuYW5pbWF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2Rpc3NvbHZlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRTaGFkb3dCbHVyOjIwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIDUwMCAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gJC5pbkFycmF5KGVsLnRleHQoKSwgYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKChpbmRleCArIDEpID09IGFycmF5Lmxlbmd0aCkgaW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC50ZXh0KGFycmF5W2luZGV4ICsgMV0pLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0U2hhZG93Qmx1cjowLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ZsaXAnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoZWwuZmluZChcIi5iYWNrXCIpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKGVsLmZpbmQoXCIuYmFja1wiKS5odG1sKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5pdGlhbCA9IGVsLnRleHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9ICQuaW5BcnJheShpbml0aWFsLCBhcnJheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigoaW5kZXggKyAxKSA9PSBhcnJheS5sZW5ndGgpIGluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiPHNwYW4gY2xhc3M9J2Zyb250Jz5cIiArIGluaXRpYWwgKyBcIjwvc3Bhbj5cIikuYXBwZW5kVG8oZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxzcGFuIGNsYXNzPSdiYWNrJz5cIiArIGFycmF5W2luZGV4ICsgMV0gKyBcIjwvc3Bhbj5cIikuYXBwZW5kVG8oZWwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbXdpZHRoID0gTWF0aC5tYXgoZWwuZmluZCgnLmJhY2snKS5vdXRlcldpZHRoKCksIGVsLmZpbmQoJy5mcm9udCcpLm91dGVyV2lkdGgoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5maW5kKCcuYmFjaywgLmZyb250JykuY3NzKCdtaW4td2lkdGgnLCBtd2lkdGgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC53cmFwSW5uZXIoXCI8c3BhbiBjbGFzcz0ncm90YXRpbmcnIC8+XCIpLmZpbmQoXCIucm90YXRpbmdcIikuaGlkZSgpLmFkZENsYXNzKFwiZmxpcFwiKS5zaG93KCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtXCI6IFwiIHJvdGF0ZVkoLTE4MGRlZylcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi1tb3otdHJhbnNmb3JtXCI6IFwiIHJvdGF0ZVkoLTE4MGRlZylcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi1vLXRyYW5zZm9ybVwiOiBcIiByb3RhdGVZKC0xODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCIgcm90YXRlWSgtMTgwZGVnKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnZmxpcFVwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmZpbmQoXCIuYmFja1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaHRtbChlbC5maW5kKFwiLmJhY2tcIikuaHRtbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluaXRpYWwgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkLmluQXJyYXkoaW5pdGlhbCwgYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoKGluZGV4ICsgMSkgPT0gYXJyYXkubGVuZ3RoKSBpbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxzcGFuIGNsYXNzPSdmcm9udCc+XCIgKyBpbml0aWFsICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCI8c3BhbiBjbGFzcz0nYmFjayc+XCIgKyBhcnJheVtpbmRleCArIDFdICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG13aWR0aCA9IE1hdGgubWF4KGVsLmZpbmQoJy5iYWNrJykub3V0ZXJXaWR0aCgpLCBlbC5maW5kKCcuZnJvbnQnKS5vdXRlcldpZHRoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuZmluZCgnLmJhY2ssIC5mcm9udCcpLmNzcygnbWluLXdpZHRoJywgbXdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWwud3JhcElubmVyKFwiPHNwYW4gY2xhc3M9J3JvdGF0aW5nJyAvPlwiKS5maW5kKFwiLnJvdGF0aW5nXCIpLmhpZGUoKS5hZGRDbGFzcyhcImZsaXAgdXBcIikuc2hvdygpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zZm9ybVwiOiBcIiByb3RhdGVYKC0xODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItbW96LXRyYW5zZm9ybVwiOiBcIiByb3RhdGVYKC0xODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItby10cmFuc2Zvcm1cIjogXCIgcm90YXRlWCgtMTgwZGVnKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHJhbnNmb3JtXCI6IFwiIHJvdGF0ZVgoLTE4MGRlZylcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ZsaXBDdWJlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmZpbmQoXCIuYmFja1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaHRtbChlbC5maW5kKFwiLmJhY2tcIikuaHRtbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluaXRpYWwgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkLmluQXJyYXkoaW5pdGlhbCwgYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoKGluZGV4ICsgMSkgPT0gYXJyYXkubGVuZ3RoKSBpbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxzcGFuIGNsYXNzPSdmcm9udCc+XCIgKyBpbml0aWFsICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCI8c3BhbiBjbGFzcz0nYmFjayc+XCIgKyBhcnJheVtpbmRleCArIDFdICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG13aWR0aCA9IE1hdGgubWF4KGVsLmZpbmQoJy5iYWNrJykub3V0ZXJXaWR0aCgpLCBlbC5maW5kKCcuZnJvbnQnKS5vdXRlcldpZHRoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuZmluZCgnLmJhY2ssIC5mcm9udCcpLmNzcygnbWluLXdpZHRoJywgbXdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWwud3JhcElubmVyKFwiPHNwYW4gY2xhc3M9J3JvdGF0aW5nJyAvPlwiKS5maW5kKFwiLnJvdGF0aW5nXCIpLmhpZGUoKS5hZGRDbGFzcyhcImZsaXAgY3ViZVwiKS5zaG93KCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtXCI6IFwiIHJvdGF0ZVkoMTgwZGVnKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLW1vei10cmFuc2Zvcm1cIjogXCIgcm90YXRlWSgxODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItby10cmFuc2Zvcm1cIjogXCIgcm90YXRlWSgxODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCIgcm90YXRlWSgxODBkZWcpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdmbGlwQ3ViZVVwJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmZpbmQoXCIuYmFja1wiKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWwuaHRtbChlbC5maW5kKFwiLmJhY2tcIikuaHRtbCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluaXRpYWwgPSBlbC50ZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSAkLmluQXJyYXkoaW5pdGlhbCwgYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYoKGluZGV4ICsgMSkgPT0gYXJyYXkubGVuZ3RoKSBpbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5odG1sKFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIjxzcGFuIGNsYXNzPSdmcm9udCc+XCIgKyBpbml0aWFsICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCI8c3BhbiBjbGFzcz0nYmFjayc+XCIgKyBhcnJheVtpbmRleCArIDFdICsgXCI8L3NwYW4+XCIpLmFwcGVuZFRvKGVsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG13aWR0aCA9IE1hdGgubWF4KGVsLmZpbmQoJy5iYWNrJykub3V0ZXJXaWR0aCgpLCBlbC5maW5kKCcuZnJvbnQnKS5vdXRlcldpZHRoKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuZmluZCgnLmJhY2ssIC5mcm9udCcpLmNzcygnbWluLXdpZHRoJywgbXdpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgZWwud3JhcElubmVyKFwiPHNwYW4gY2xhc3M9J3JvdGF0aW5nJyAvPlwiKS5maW5kKFwiLnJvdGF0aW5nXCIpLmhpZGUoKS5hZGRDbGFzcyhcImZsaXAgY3ViZSB1cFwiKS5zaG93KCkuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtXCI6IFwiIHJvdGF0ZVgoMTgwZGVnKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLW1vei10cmFuc2Zvcm1cIjogXCIgcm90YXRlWCgxODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItby10cmFuc2Zvcm1cIjogXCIgcm90YXRlWCgxODBkZWcpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCIgcm90YXRlWCgxODBkZWcpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzcGluJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGVsLmZpbmQoXCIucm90YXRpbmdcIikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsLmh0bWwoZWwuZmluZChcIi5yb3RhdGluZ1wiKS5odG1sKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPSAkLmluQXJyYXkoZWwudGV4dCgpLCBhcnJheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZigoaW5kZXggKyAxKSA9PSBhcnJheS5sZW5ndGgpIGluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLndyYXBJbm5lcihcIjxzcGFuIGNsYXNzPSdyb3RhdGluZyBzcGluJyAvPlwiKS5maW5kKFwiLnJvdGF0aW5nXCIpLmhpZGUoKS50ZXh0KGFycmF5W2luZGV4ICsgMV0pLnNob3coKS5jc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2Zvcm1cIjogXCIgcm90YXRlKDApIHNjYWxlKDEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItbW96LXRyYW5zZm9ybVwiOiBcInJvdGF0ZSgwKSBzY2FsZSgxKVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLW8tdHJhbnNmb3JtXCI6IFwicm90YXRlKDApIHNjYWxlKDEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCJyb3RhdGUoMCkgc2NhbGUoMSlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICdmYWRlJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmZhZGVPdXQoc2V0dGluZ3Muc3BlZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gJC5pbkFycmF5KGVsLnRleHQoKSwgYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKChpbmRleCArIDEpID09IGFycmF5Lmxlbmd0aCkgaW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbC50ZXh0KGFycmF5W2luZGV4ICsgMV0pLmZhZGVJbihzZXR0aW5ncy5zcGVlZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGlmIChlbC5maW5kKCcuYmFjaywgLmZyb250JykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHZhciBtd2lkdGggPSBNYXRoLm1heChlbC5maW5kKCcuYmFjaycpLm91dGVyV2lkdGgoKSwgZWwuZmluZCgnLmZyb250Jykub3V0ZXJXaWR0aCgpKTtcbiAgICAgICAgICAgICAgICAvLyAgICAgZWwuZmluZCgnLmJhY2ssIC5mcm9udCcpLmNzcygnbWluLXdpZHRoJywgbXdpZHRoKTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2V0SW50ZXJ2YWwocm90YXRlLCBzZXR0aW5ncy5zcGVlZCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0od2luZG93LmpRdWVyeSk7XG5cbiJdLCJmaWxlIjoidGV4dHJvdGF0b3IuanMifQ==
