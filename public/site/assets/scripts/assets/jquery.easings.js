/*
 * $ Easing v1.3 - http://gsgd.co.uk/sandbox/$/easing/
 *
 * Uses the built in easing capabilities added In $ 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - $ Easing
 *
 * Open source under the BSD License.
 *
 * Copyright В© 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function($, undefined) {
    // t: current time, b: begInnIng value, c: change In value, d: duration
    $.easing['jswing'] = $.easing['swing'];

    $.extend(
        $.easing,
        {
            def: 'easeOutQuad',
            swing: function (x, t, b, c, d) {
                //alert($.easing.default);
                return $.easing[$.easing.def](x, t, b, c, d);
            },
            easeInQuad: function (x, t, b, c, d) {
                return c*(t/=d)*t + b;
            },
            easeOutQuad: function (x, t, b, c, d) {
                return -c *(t/=d)*(t-2) + b;
            },
            easeInOutQuad: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t + b;
                return -c/2 * ((--t)*(t-2) - 1) + b;
            },
            easeInCubic: function (x, t, b, c, d) {
                return c*(t/=d)*t*t + b;
            },
            easeOutCubic: function (x, t, b, c, d) {
                return c*((t=t/d-1)*t*t + 1) + b;
            },
            easeInOutCubic: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t + b;
                return c/2*((t-=2)*t*t + 2) + b;
            },
            easeInQuart: function (x, t, b, c, d) {
                return c*(t/=d)*t*t*t + b;
            },
            easeOutQuart: function (x, t, b, c, d) {
                return -c * ((t=t/d-1)*t*t*t - 1) + b;
            },
            easeInOutQuart: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
                return -c/2 * ((t-=2)*t*t*t - 2) + b;
            },
            easeInQuint: function (x, t, b, c, d) {
                return c*(t/=d)*t*t*t*t + b;
            },
            easeOutQuint: function (x, t, b, c, d) {
                return c*((t=t/d-1)*t*t*t*t + 1) + b;
            },
            easeInOutQuint: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
                return c/2*((t-=2)*t*t*t*t + 2) + b;
            },
            easeInSine: function (x, t, b, c, d) {
                return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
            },
            easeOutSine: function (x, t, b, c, d) {
                return c * Math.sin(t/d * (Math.PI/2)) + b;
            },
            easeInOutSine: function (x, t, b, c, d) {
                return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
            },
            easeInExpo: function (x, t, b, c, d) {
                return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
            },
            easeOutExpo: function (x, t, b, c, d) {
                return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
            },
            easeInOutExpo: function (x, t, b, c, d) {
                if (t==0) return b;
                if (t==d) return b+c;
                if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
                return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeInCirc: function (x, t, b, c, d) {
                return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
            },
            easeOutCirc: function (x, t, b, c, d) {
                return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
            },
            easeInOutCirc: function (x, t, b, c, d) {
                if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
                return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
            },
            easeInElastic: function (x, t, b, c, d) {
                var s=1.70158;var p=0;var a=c;
                if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                if (a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            },
            easeOutElastic: function (x, t, b, c, d) {
                var s=1.70158;var p=0;var a=c;
                if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
                if (a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
            },
            easeInOutElastic: function (x, t, b, c, d) {
                var s=1.70158;var p=0;var a=c;
                if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
                if (a < Math.abs(c)) { a=c; var s=p/4; }
                else var s = p/(2*Math.PI) * Math.asin (c/a);
                if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
                return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
            },
            easeInBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c*(t/=d)*t*((s+1)*t - s) + b;
            },
            easeOutBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
            },
            easeInOutBack: function (x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
                return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
            },
            easeInBounce: function (x, t, b, c, d) {
                return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
            },
            easeOutBounce: function (x, t, b, c, d) {
                if ((t/=d) < (1/2.75)) {
                    return c*(7.5625*t*t) + b;
                } else if (t < (2/2.75)) {
                    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
                } else if (t < (2.5/2.75)) {
                    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
                } else {
                    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
                }
            },
            easeInOutBounce: function (x, t, b, c, d) {
                if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
                return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
            }
        }
    );
})(jQuery);

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright В© 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuZWFzaW5ncy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogJCBFYXNpbmcgdjEuMyAtIGh0dHA6Ly9nc2dkLmNvLnVrL3NhbmRib3gvJC9lYXNpbmcvXG4gKlxuICogVXNlcyB0aGUgYnVpbHQgaW4gZWFzaW5nIGNhcGFiaWxpdGllcyBhZGRlZCBJbiAkIDEuMVxuICogdG8gb2ZmZXIgbXVsdGlwbGUgZWFzaW5nIG9wdGlvbnNcbiAqXG4gKiBURVJNUyBPRiBVU0UgLSAkIEVhc2luZ1xuICpcbiAqIE9wZW4gc291cmNlIHVuZGVyIHRoZSBCU0QgTGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQg0JLCqSAyMDA4IEdlb3JnZSBNY0dpbmxleSBTbWl0aFxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbiBhbmQgdXNlIGluIHNvdXJjZSBhbmQgYmluYXJ5IGZvcm1zLCB3aXRoIG9yIHdpdGhvdXQgbW9kaWZpY2F0aW9uLFxuICogYXJlIHBlcm1pdHRlZCBwcm92aWRlZCB0aGF0IHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICpcbiAqIFJlZGlzdHJpYnV0aW9ucyBvZiBzb3VyY2UgY29kZSBtdXN0IHJldGFpbiB0aGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSwgdGhpcyBsaXN0IG9mXG4gKiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nIGRpc2NsYWltZXIuXG4gKiBSZWRpc3RyaWJ1dGlvbnMgaW4gYmluYXJ5IGZvcm0gbXVzdCByZXByb2R1Y2UgdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdFxuICogb2YgY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHNcbiAqIHByb3ZpZGVkIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqXG4gKiBOZWl0aGVyIHRoZSBuYW1lIG9mIHRoZSBhdXRob3Igbm9yIHRoZSBuYW1lcyBvZiBjb250cmlidXRvcnMgbWF5IGJlIHVzZWQgdG8gZW5kb3JzZVxuICogb3IgcHJvbW90ZSBwcm9kdWN0cyBkZXJpdmVkIGZyb20gdGhpcyBzb2Z0d2FyZSB3aXRob3V0IHNwZWNpZmljIHByaW9yIHdyaXR0ZW4gcGVybWlzc2lvbi5cbiAqXG4gKiBUSElTIFNPRlRXQVJFIElTIFBST1ZJREVEIEJZIFRIRSBDT1BZUklHSFQgSE9MREVSUyBBTkQgQ09OVFJJQlVUT1JTIFwiQVMgSVNcIiBBTkQgQU5ZXG4gKiBFWFBSRVNTIE9SIElNUExJRUQgV0FSUkFOVElFUywgSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSBBTkQgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogIENPUFlSSUdIVCBPV05FUiBPUiBDT05UUklCVVRPUlMgQkUgTElBQkxFIEZPUiBBTlkgRElSRUNULCBJTkRJUkVDVCwgSU5DSURFTlRBTCwgU1BFQ0lBTCxcbiAqICBFWEVNUExBUlksIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyAoSU5DTFVESU5HLCBCVVQgTk9UIExJTUlURUQgVE8sIFBST0NVUkVNRU5UIE9GIFNVQlNUSVRVVEVcbiAqICBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsIERBVEEsIE9SIFBST0ZJVFM7IE9SIEJVU0lORVNTIElOVEVSUlVQVElPTikgSE9XRVZFUiBDQVVTRURcbiAqIEFORCBPTiBBTlkgVEhFT1JZIE9GIExJQUJJTElUWSwgV0hFVEhFUiBJTiBDT05UUkFDVCwgU1RSSUNUIExJQUJJTElUWSwgT1IgVE9SVCAoSU5DTFVESU5HXG4gKiAgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRSBPRiBUSElTIFNPRlRXQVJFLCBFVkVOIElGIEFEVklTRURcbiAqIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqXG4gKi9cblxuKGZ1bmN0aW9uKCQsIHVuZGVmaW5lZCkge1xuICAgIC8vIHQ6IGN1cnJlbnQgdGltZSwgYjogYmVnSW5uSW5nIHZhbHVlLCBjOiBjaGFuZ2UgSW4gdmFsdWUsIGQ6IGR1cmF0aW9uXG4gICAgJC5lYXNpbmdbJ2pzd2luZyddID0gJC5lYXNpbmdbJ3N3aW5nJ107XG5cbiAgICAkLmV4dGVuZChcbiAgICAgICAgJC5lYXNpbmcsXG4gICAgICAgIHtcbiAgICAgICAgICAgIGRlZjogJ2Vhc2VPdXRRdWFkJyxcbiAgICAgICAgICAgIHN3aW5nOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIC8vYWxlcnQoJC5lYXNpbmcuZGVmYXVsdCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQuZWFzaW5nWyQuZWFzaW5nLmRlZl0oeCwgdCwgYiwgYywgZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyoodC89ZCkqdCArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC1jICoodC89ZCkqKHQtMikgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQgKyBiO1xuICAgICAgICAgICAgICAgIHJldHVybiAtYy8yICogKCgtLXQpKih0LTIpIC0gMSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjKih0Lz1kKSp0KnQgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyooKHQ9dC9kLTEpKnQqdCArIDEpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKnQqdCp0ICsgYjtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy8yKigodC09MikqdCp0ICsgMikgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjKih0Lz1kKSp0KnQqdCArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZU91dFF1YXJ0OiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtYyAqICgodD10L2QtMSkqdCp0KnQgLSAxKSArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCp0ICsgYjtcbiAgICAgICAgICAgICAgICByZXR1cm4gLWMvMiAqICgodC09MikqdCp0KnQgLSAyKSArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMqKHQvPWQpKnQqdCp0KnQgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyooKHQ9dC9kLTEpKnQqdCp0KnQgKyAxKSArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0Lz1kLzIpIDwgMSkgcmV0dXJuIGMvMip0KnQqdCp0KnQgKyBiO1xuICAgICAgICAgICAgICAgIHJldHVybiBjLzIqKCh0LT0yKSp0KnQqdCp0ICsgMikgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJblNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC1jICogTWF0aC5jb3ModC9kICogKE1hdGguUEkvMikpICsgYyArIGI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZU91dFNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMgKiBNYXRoLnNpbih0L2QgKiAoTWF0aC5QSS8yKSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbk91dFNpbmU6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIC1jLzIgKiAoTWF0aC5jb3MoTWF0aC5QSSp0L2QpIC0gMSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbkV4cG86IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0PT0wKSA/IGIgOiBjICogTWF0aC5wb3coMiwgMTAgKiAodC9kIC0gMSkpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlT3V0RXhwbzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHQ9PWQpID8gYitjIDogYyAqICgtTWF0aC5wb3coMiwgLTEwICogdC9kKSArIDEpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlSW5PdXRFeHBvOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIGlmICh0PT0wKSByZXR1cm4gYjtcbiAgICAgICAgICAgICAgICBpZiAodD09ZCkgcmV0dXJuIGIrYztcbiAgICAgICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKSArIGI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMvMiAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlSW5DaXJjOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAtYyAqIChNYXRoLnNxcnQoMSAtICh0Lz1kKSp0KSAtIDEpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlT3V0Q2lyYzogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyAqIE1hdGguc3FydCgxIC0gKHQ9dC9kLTEpKnQpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlSW5PdXRDaXJjOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIGlmICgodC89ZC8yKSA8IDEpIHJldHVybiAtYy8yICogKE1hdGguc3FydCgxIC0gdCp0KSAtIDEpICsgYjtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy8yICogKE1hdGguc3FydCgxIC0gKHQtPTIpKnQpICsgMSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbkVsYXN0aWM6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHM9MS43MDE1ODt2YXIgcD0wO3ZhciBhPWM7XG4gICAgICAgICAgICAgICAgaWYgKHQ9PTApIHJldHVybiBiOyAgaWYgKCh0Lz1kKT09MSkgcmV0dXJuIGIrYzsgIGlmICghcCkgcD1kKi4zO1xuICAgICAgICAgICAgICAgIGlmIChhIDwgTWF0aC5hYnMoYykpIHsgYT1jOyB2YXIgcz1wLzQ7IH1cbiAgICAgICAgICAgICAgICBlbHNlIHZhciBzID0gcC8oMipNYXRoLlBJKSAqIE1hdGguYXNpbiAoYy9hKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gLShhKk1hdGgucG93KDIsMTAqKHQtPTEpKSAqIE1hdGguc2luKCAodCpkLXMpKigyKk1hdGguUEkpL3AgKSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VPdXRFbGFzdGljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHZhciBzPTEuNzAxNTg7dmFyIHA9MDt2YXIgYT1jO1xuICAgICAgICAgICAgICAgIGlmICh0PT0wKSByZXR1cm4gYjsgIGlmICgodC89ZCk9PTEpIHJldHVybiBiK2M7ICBpZiAoIXApIHA9ZCouMztcbiAgICAgICAgICAgICAgICBpZiAoYSA8IE1hdGguYWJzKGMpKSB7IGE9YzsgdmFyIHM9cC80OyB9XG4gICAgICAgICAgICAgICAgZWxzZSB2YXIgcyA9IHAvKDIqTWF0aC5QSSkgKiBNYXRoLmFzaW4gKGMvYSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEqTWF0aC5wb3coMiwtMTAqdCkgKiBNYXRoLnNpbiggKHQqZC1zKSooMipNYXRoLlBJKS9wICkgKyBjICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlSW5PdXRFbGFzdGljOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIHZhciBzPTEuNzAxNTg7dmFyIHA9MDt2YXIgYT1jO1xuICAgICAgICAgICAgICAgIGlmICh0PT0wKSByZXR1cm4gYjsgIGlmICgodC89ZC8yKT09MikgcmV0dXJuIGIrYzsgIGlmICghcCkgcD1kKiguMyoxLjUpO1xuICAgICAgICAgICAgICAgIGlmIChhIDwgTWF0aC5hYnMoYykpIHsgYT1jOyB2YXIgcz1wLzQ7IH1cbiAgICAgICAgICAgICAgICBlbHNlIHZhciBzID0gcC8oMipNYXRoLlBJKSAqIE1hdGguYXNpbiAoYy9hKTtcbiAgICAgICAgICAgICAgICBpZiAodCA8IDEpIHJldHVybiAtLjUqKGEqTWF0aC5wb3coMiwxMCoodC09MSkpICogTWF0aC5zaW4oICh0KmQtcykqKDIqTWF0aC5QSSkvcCApKSArIGI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEqTWF0aC5wb3coMiwtMTAqKHQtPTEpKSAqIE1hdGguc2luKCAodCpkLXMpKigyKk1hdGguUEkpL3AgKSouNSArIGMgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbkJhY2s6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkLCBzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMgPT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyoodC89ZCkqdCooKHMrMSkqdCAtIHMpICsgYjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlYXNlT3V0QmFjazogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQsIHMpIHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PSB1bmRlZmluZWQpIHMgPSAxLjcwMTU4O1xuICAgICAgICAgICAgICAgIHJldHVybiBjKigodD10L2QtMSkqdCooKHMrMSkqdCArIHMpICsgMSkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbk91dEJhY2s6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkLCBzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHMgPT0gdW5kZWZpbmVkKSBzID0gMS43MDE1ODtcbiAgICAgICAgICAgICAgICBpZiAoKHQvPWQvMikgPCAxKSByZXR1cm4gYy8yKih0KnQqKCgocyo9KDEuNTI1KSkrMSkqdCAtIHMpKSArIGI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMvMiooKHQtPTIpKnQqKCgocyo9KDEuNTI1KSkrMSkqdCArIHMpICsgMikgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VJbkJvdW5jZTogZnVuY3Rpb24gKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYyAtICQuZWFzaW5nLmVhc2VPdXRCb3VuY2UgKHgsIGQtdCwgMCwgYywgZCkgKyBiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh4LCB0LCBiLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCh0Lz1kKSA8ICgxLzIuNzUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjKig3LjU2MjUqdCp0KSArIGI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0IDwgKDIvMi43NSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDEuNS8yLjc1KSkqdCArIC43NSkgKyBiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodCA8ICgyLjUvMi43NSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMqKDcuNTYyNSoodC09KDIuMjUvMi43NSkpKnQgKyAuOTM3NSkgKyBiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjKig3LjU2MjUqKHQtPSgyLjYyNS8yLjc1KSkqdCArIC45ODQzNzUpICsgYjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZWFzZUluT3V0Qm91bmNlOiBmdW5jdGlvbiAoeCwgdCwgYiwgYywgZCkge1xuICAgICAgICAgICAgICAgIGlmICh0IDwgZC8yKSByZXR1cm4gJC5lYXNpbmcuZWFzZUluQm91bmNlICh4LCB0KjIsIDAsIGMsIGQpICogLjUgKyBiO1xuICAgICAgICAgICAgICAgIHJldHVybiAkLmVhc2luZy5lYXNlT3V0Qm91bmNlICh4LCB0KjItZCwgMCwgYywgZCkgKiAuNSArIGMqLjUgKyBiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcbn0pKGpRdWVyeSk7XG5cbi8qXG4gKlxuICogVEVSTVMgT0YgVVNFIC0gRUFTSU5HIEVRVUFUSU9OU1xuICpcbiAqIE9wZW4gc291cmNlIHVuZGVyIHRoZSBCU0QgTGljZW5zZS5cbiAqXG4gKiBDb3B5cmlnaHQg0JLCqSAyMDAxIFJvYmVydCBQZW5uZXJcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0IG1vZGlmaWNhdGlvbixcbiAqIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAqXG4gKiBSZWRpc3RyaWJ1dGlvbnMgb2Ygc291cmNlIGNvZGUgbXVzdCByZXRhaW4gdGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZlxuICogY29uZGl0aW9ucyBhbmQgdGhlIGZvbGxvd2luZyBkaXNjbGFpbWVyLlxuICogUmVkaXN0cmlidXRpb25zIGluIGJpbmFyeSBmb3JtIG11c3QgcmVwcm9kdWNlIHRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlLCB0aGlzIGxpc3RcbiAqIG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lciBpbiB0aGUgZG9jdW1lbnRhdGlvbiBhbmQvb3Igb3RoZXIgbWF0ZXJpYWxzXG4gKiBwcm92aWRlZCB3aXRoIHRoZSBkaXN0cmlidXRpb24uXG4gKlxuICogTmVpdGhlciB0aGUgbmFtZSBvZiB0aGUgYXV0aG9yIG5vciB0aGUgbmFtZXMgb2YgY29udHJpYnV0b3JzIG1heSBiZSB1c2VkIHRvIGVuZG9yc2VcbiAqIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZCBmcm9tIHRoaXMgc29mdHdhcmUgd2l0aG91dCBzcGVjaWZpYyBwcmlvciB3cml0dGVuIHBlcm1pc3Npb24uXG4gKlxuICogVEhJUyBTT0ZUV0FSRSBJUyBQUk9WSURFRCBCWSBUSEUgQ09QWVJJR0hUIEhPTERFUlMgQU5EIENPTlRSSUJVVE9SUyBcIkFTIElTXCIgQU5EIEFOWVxuICogRVhQUkVTUyBPUiBJTVBMSUVEIFdBUlJBTlRJRVMsIElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBUSEUgSU1QTElFRCBXQVJSQU5USUVTIE9GXG4gKiBNRVJDSEFOVEFCSUxJVFkgQU5EIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFSRSBESVNDTEFJTUVELiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqICBDT1BZUklHSFQgT1dORVIgT1IgQ09OVFJJQlVUT1JTIEJFIExJQUJMRSBGT1IgQU5ZIERJUkVDVCwgSU5ESVJFQ1QsIElOQ0lERU5UQUwsIFNQRUNJQUwsXG4gKiAgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVCBMSU1JVEVEIFRPLCBQUk9DVVJFTUVOVCBPRiBTVUJTVElUVVRFXG4gKiAgR09PRFMgT1IgU0VSVklDRVM7IExPU1MgT0YgVVNFLCBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEXG4gKiBBTkQgT04gQU5ZIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlQgKElOQ0xVRElOR1xuICogIE5FR0xJR0VOQ0UgT1IgT1RIRVJXSVNFKSBBUklTSU5HIElOIEFOWSBXQVkgT1VUIE9GIFRIRSBVU0UgT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEXG4gKiBPRiBUSEUgUE9TU0lCSUxJVFkgT0YgU1VDSCBEQU1BR0UuXG4gKlxuICovIl0sImZpbGUiOiJqcXVlcnkuZWFzaW5ncy5qcyJ9
