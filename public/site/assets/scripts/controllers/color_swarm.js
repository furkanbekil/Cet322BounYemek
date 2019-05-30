/*! ===================================
 *  Author: Roman Nazarkin, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */


/***********************************************
 * ColorSwarm module API
 ***********************************************/
(function ($) {
    'use strict';

    $.fn.PZT_ColorSwarm = function () {
        var canvas = $(this)[0];
        var ctx;
        var numCircles = 100;

        var resize = window.resize = function () {
            canvas.height = $(canvas).parent().outerHeight();
            canvas.width = window.innerWidth;
        };

        $(function () {
            ctx = canvas.getContext('2d');
            resize();

            var circles = [],
                colors = randomColor({luminosity: 'light', count: numCircles});

            for (var i = 0; i < numCircles; i++) {
                var x = Math.random() * canvas.width;
                var y = Math.random() * canvas.height;
                var c = new Circle(x, y, colors[i]);
                c.draw();
                circles.push(c);
            }

            var requestAnimFrame = function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (a) {
                        window.setTimeout(a, 1E3 / 60);
                    };
            }();

            var loop = function () {
                requestAnimFrame(loop);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < circles.length; i++) {
                    circles[i].frame();
                }
            };

            loop();
        });

        var Circle = function (x, y, c) {
            this.pos = [x, y];
            this.r = (1.5 * Math.random()) + 1;
            this.c = c;
            this.v = [
                (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.3
            ];
        };

        Circle.prototype.getBound = function (i) {
            return i ? canvas.height : canvas.width;
        };

        var i;
        Circle.prototype.frame = function () {
            for (i = 0; i < 2; i++) {
                if (this.pos[i] > this.getBound(i) - 10) {
                    this.v[i] *= -1;
                }
                else if (this.pos[i] < 10) {
                    this.v[i] *= -1;
                }
                this.pos[i] += this.v[i] * 10;
            }

            this.draw();
        };

        Circle.prototype.draw = function () {
            ctx.fillStyle = this.c;
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], this.r, 0, 2 * Math.PI, false);
            ctx.fill();
        };
    };
})(jQuery);


/***********************************************
 * Equip module
 ***********************************************/
(function ($) {
    'use strict';

    $('.sp-color-swarm').each(function () {
        var $canvas = $('<canvas class="sp-color-swarm-svg" />');
        $(this).prepend($canvas);
        $canvas.PZT_ColorSwarm();
    });
})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb2xvcl9zd2FybS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IFJvbWFuIE5hemFya2luLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIENvbG9yU3dhcm0gbW9kdWxlIEFQSVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgJC5mbi5QWlRfQ29sb3JTd2FybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhbnZhcyA9ICQodGhpcylbMF07XG4gICAgICAgIHZhciBjdHg7XG4gICAgICAgIHZhciBudW1DaXJjbGVzID0gMTAwO1xuXG4gICAgICAgIHZhciByZXNpemUgPSB3aW5kb3cucmVzaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9ICQoY2FudmFzKS5wYXJlbnQoKS5vdXRlckhlaWdodCgpO1xuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgJChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIHJlc2l6ZSgpO1xuXG4gICAgICAgICAgICB2YXIgY2lyY2xlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGNvbG9ycyA9IHJhbmRvbUNvbG9yKHtsdW1pbm9zaXR5OiAnbGlnaHQnLCBjb3VudDogbnVtQ2lyY2xlc30pO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bUNpcmNsZXM7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gTWF0aC5yYW5kb20oKSAqIGNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IE1hdGgucmFuZG9tKCkgKiBjYW52YXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIHZhciBjID0gbmV3IENpcmNsZSh4LCB5LCBjb2xvcnNbaV0pO1xuICAgICAgICAgICAgICAgIGMuZHJhdygpO1xuICAgICAgICAgICAgICAgIGNpcmNsZXMucHVzaChjKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHJlcXVlc3RBbmltRnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoYSwgMUUzIC8gNjApO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSgpO1xuXG4gICAgICAgICAgICB2YXIgbG9vcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0QW5pbUZyYW1lKGxvb3ApO1xuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNpcmNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlc1tpXS5mcmFtZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxvb3AoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIENpcmNsZSA9IGZ1bmN0aW9uICh4LCB5LCBjKSB7XG4gICAgICAgICAgICB0aGlzLnBvcyA9IFt4LCB5XTtcbiAgICAgICAgICAgIHRoaXMuciA9ICgxLjUgKiBNYXRoLnJhbmRvbSgpKSArIDE7XG4gICAgICAgICAgICB0aGlzLmMgPSBjO1xuICAgICAgICAgICAgdGhpcy52ID0gW1xuICAgICAgICAgICAgICAgIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDAuMyxcbiAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAtIDAuNSkgKiAwLjNcbiAgICAgICAgICAgIF07XG4gICAgICAgIH07XG5cbiAgICAgICAgQ2lyY2xlLnByb3RvdHlwZS5nZXRCb3VuZCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICByZXR1cm4gaSA/IGNhbnZhcy5oZWlnaHQgOiBjYW52YXMud2lkdGg7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGk7XG4gICAgICAgIENpcmNsZS5wcm90b3R5cGUuZnJhbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucG9zW2ldID4gdGhpcy5nZXRCb3VuZChpKSAtIDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudltpXSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5wb3NbaV0gPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZbaV0gKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucG9zW2ldICs9IHRoaXMudltpXSAqIDEwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmRyYXcoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBDaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4LmFyYyh0aGlzLnBvc1swXSwgdGhpcy5wb3NbMV0sIHRoaXMuciwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIH07XG4gICAgfTtcbn0pKGpRdWVyeSk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBFcXVpcCBtb2R1bGVcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbihmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgICQoJy5zcC1jb2xvci1zd2FybScpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJGNhbnZhcyA9ICQoJzxjYW52YXMgY2xhc3M9XCJzcC1jb2xvci1zd2FybS1zdmdcIiAvPicpO1xuICAgICAgICAkKHRoaXMpLnByZXBlbmQoJGNhbnZhcyk7XG4gICAgICAgICRjYW52YXMuUFpUX0NvbG9yU3dhcm0oKTtcbiAgICB9KTtcbn0pKGpRdWVyeSk7Il0sImZpbGUiOiJjb2xvcl9zd2FybS5qcyJ9
