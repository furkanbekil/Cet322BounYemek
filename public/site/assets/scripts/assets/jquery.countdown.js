/*!
 * The Final Countdown for jQuery v2.2.0 (http://hilios.github.io/jQuery.countdown/)
 * Copyright (c) 2016 Edson Hilios
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else {
        factory(jQuery);
    }
})(function($) {
    "use strict";
    var instances = [], matchers = [], defaultOptions = {
        precision: 100,
        elapse: false,
        defer: false
    };
    matchers.push(/^[0-9]*$/.source);
    matchers.push(/([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    matchers.push(/[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/.source);
    matchers = new RegExp(matchers.join("|"));
    function parseDateString(dateString) {
        if (dateString instanceof Date) {
            return dateString;
        }
        if (String(dateString).match(matchers)) {
            if (String(dateString).match(/^[0-9]*$/)) {
                dateString = Number(dateString);
            }
            if (String(dateString).match(/\-/)) {
                dateString = String(dateString).replace(/\-/g, "/");
            }
            return new Date(dateString);
        } else {
            throw new Error("Couldn't cast `" + dateString + "` to a date object.");
        }
    }
    var DIRECTIVE_KEY_MAP = {
        Y: "years",
        m: "months",
        n: "daysToMonth",
        d: "daysToWeek",
        w: "weeks",
        W: "weeksToMonth",
        H: "hours",
        M: "minutes",
        S: "seconds",
        D: "totalDays",
        I: "totalHours",
        N: "totalMinutes",
        T: "totalSeconds"
    };
    function escapedRegExp(str) {
        var sanitize = str.toString().replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        return new RegExp(sanitize);
    }
    function strftime(offsetObject) {
        return function(format) {
            var directives = format.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);
            if (directives) {
                for (var i = 0, len = directives.length; i < len; ++i) {
                    var directive = directives[i].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/), regexp = escapedRegExp(directive[0]), modifier = directive[1] || "", plural = directive[3] || "", value = null;
                    directive = directive[2];
                    if (DIRECTIVE_KEY_MAP.hasOwnProperty(directive)) {
                        value = DIRECTIVE_KEY_MAP[directive];
                        value = Number(offsetObject[value]);
                    }
                    if (value !== null) {
                        if (modifier === "!") {
                            value = pluralize(plural, value);
                        }
                        if (modifier === "") {
                            if (value < 10) {
                                value = "0" + value.toString();
                            }
                        }
                        format = format.replace(regexp, value.toString());
                    }
                }
            }
            format = format.replace(/%%/, "%");
            return format;
        };
    }
    function pluralize(format, count) {
        var plural = "s", singular = "";
        if (format) {
            format = format.replace(/(:|;|\s)/gi, "").split(/\,/);
            if (format.length === 1) {
                plural = format[0];
            } else {
                singular = format[0];
                plural = format[1];
            }
        }
        if (Math.abs(count) > 1) {
            return plural;
        } else {
            return singular;
        }
    }
    var Countdown = function(el, finalDate, options) {
        this.el = el;
        this.$el = $(el);
        this.interval = null;
        this.offset = {};
        this.options = $.extend({}, defaultOptions);
        this.instanceNumber = instances.length;
        instances.push(this);
        this.$el.data("countdown-instance", this.instanceNumber);
        if (options) {
            if (typeof options === "function") {
                this.$el.on("update.countdown", options);
                this.$el.on("stoped.countdown", options);
                this.$el.on("finish.countdown", options);
            } else {
                this.options = $.extend({}, defaultOptions, options);
            }
        }
        this.setFinalDate(finalDate);
        if (this.options.defer === false) {
            this.start();
        }
    };
    $.extend(Countdown.prototype, {
        start: function() {
            if (this.interval !== null) {
                clearInterval(this.interval);
            }
            var self = this;
            this.update();
            this.interval = setInterval(function() {
                self.update.call(self);
            }, this.options.precision);
        },
        stop: function() {
            clearInterval(this.interval);
            this.interval = null;
            this.dispatchEvent("stoped");
        },
        toggle: function() {
            if (this.interval) {
                this.stop();
            } else {
                this.start();
            }
        },
        pause: function() {
            this.stop();
        },
        resume: function() {
            this.start();
        },
        remove: function() {
            this.stop.call(this);
            instances[this.instanceNumber] = null;
            delete this.$el.data().countdownInstance;
        },
        setFinalDate: function(value) {
            this.finalDate = parseDateString(value);
        },
        update: function() {
            if (this.$el.closest("html").length === 0) {
                this.remove();
                return;
            }
            var hasEventsAttached = $._data(this.el, "events") !== undefined, now = new Date(), newTotalSecsLeft;
            newTotalSecsLeft = this.finalDate.getTime() - now.getTime();
            newTotalSecsLeft = Math.ceil(newTotalSecsLeft / 1e3);
            newTotalSecsLeft = !this.options.elapse && newTotalSecsLeft < 0 ? 0 : Math.abs(newTotalSecsLeft);
            if (this.totalSecsLeft === newTotalSecsLeft || !hasEventsAttached) {
                return;
            } else {
                this.totalSecsLeft = newTotalSecsLeft;
            }
            this.elapsed = now >= this.finalDate;
            this.offset = {
                seconds: this.totalSecsLeft % 60,
                minutes: Math.floor(this.totalSecsLeft / 60) % 60,
                hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24,
                days: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToWeek: Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                daysToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 % 30.4368),
                weeks: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7),
                weeksToMonth: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 7) % 4,
                months: Math.floor(this.totalSecsLeft / 60 / 60 / 24 / 30.4368),
                years: Math.abs(this.finalDate.getFullYear() - now.getFullYear()),
                totalDays: Math.floor(this.totalSecsLeft / 60 / 60 / 24),
                totalHours: Math.floor(this.totalSecsLeft / 60 / 60),
                totalMinutes: Math.floor(this.totalSecsLeft / 60),
                totalSeconds: this.totalSecsLeft
            };
            if (!this.options.elapse && this.totalSecsLeft === 0) {
                this.stop();
                this.dispatchEvent("finish");
            } else {
                this.dispatchEvent("update");
            }
        },
        dispatchEvent: function(eventName) {
            var event = $.Event(eventName + ".countdown");
            event.finalDate = this.finalDate;
            event.elapsed = this.elapsed;
            event.offset = $.extend({}, this.offset);
            event.strftime = strftime(this.offset);
            this.$el.trigger(event);
        }
    });
    $.fn.countdown = function() {
        var argumentsArray = Array.prototype.slice.call(arguments, 0);
        return this.each(function() {
            var instanceNumber = $(this).data("countdown-instance");
            if (instanceNumber !== undefined) {
                var instance = instances[instanceNumber], method = argumentsArray[0];
                if (Countdown.prototype.hasOwnProperty(method)) {
                    instance[method].apply(instance, argumentsArray.slice(1));
                } else if (String(method).match(/^[$A-Z_][0-9A-Z_$]*$/i) === null) {
                    instance.setFinalDate.call(instance, method);
                    instance.start();
                } else {
                    $.error("Method %s does not exist on jQuery.countdown".replace(/\%s/gi, method));
                }
            } else {
                new Countdown(this, argumentsArray[0], argumentsArray[1]);
            }
        });
    };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuY291bnRkb3duLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogVGhlIEZpbmFsIENvdW50ZG93biBmb3IgalF1ZXJ5IHYyLjIuMCAoaHR0cDovL2hpbGlvcy5naXRodWIuaW8valF1ZXJ5LmNvdW50ZG93bi8pXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgRWRzb24gSGlsaW9zXG4gKiBcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHkgb2ZcbiAqIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW5cbiAqIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG9cbiAqIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mXG4gKiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sXG4gKiBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqIFxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICogXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTU1xuICogRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SXG4gKiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVJcbiAqIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOXG4gKiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG4oZnVuY3Rpb24oZmFjdG9yeSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoWyBcImpxdWVyeVwiIF0sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KShmdW5jdGlvbigkKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgdmFyIGluc3RhbmNlcyA9IFtdLCBtYXRjaGVycyA9IFtdLCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgICAgcHJlY2lzaW9uOiAxMDAsXG4gICAgICAgIGVsYXBzZTogZmFsc2UsXG4gICAgICAgIGRlZmVyOiBmYWxzZVxuICAgIH07XG4gICAgbWF0Y2hlcnMucHVzaCgvXlswLTldKiQvLnNvdXJjZSk7XG4gICAgbWF0Y2hlcnMucHVzaCgvKFswLTldezEsMn1cXC8pezJ9WzAtOV17NH0oIFswLTldezEsMn0oOlswLTldezJ9KXsyfSk/Ly5zb3VyY2UpO1xuICAgIG1hdGNoZXJzLnB1c2goL1swLTldezR9KFtcXC9cXC1dWzAtOV17MSwyfSl7Mn0oIFswLTldezEsMn0oOlswLTldezJ9KXsyfSk/Ly5zb3VyY2UpO1xuICAgIG1hdGNoZXJzID0gbmV3IFJlZ0V4cChtYXRjaGVycy5qb2luKFwifFwiKSk7XG4gICAgZnVuY3Rpb24gcGFyc2VEYXRlU3RyaW5nKGRhdGVTdHJpbmcpIHtcbiAgICAgICAgaWYgKGRhdGVTdHJpbmcgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0ZVN0cmluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAoU3RyaW5nKGRhdGVTdHJpbmcpLm1hdGNoKG1hdGNoZXJzKSkge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhkYXRlU3RyaW5nKS5tYXRjaCgvXlswLTldKiQvKSkge1xuICAgICAgICAgICAgICAgIGRhdGVTdHJpbmcgPSBOdW1iZXIoZGF0ZVN0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGRhdGVTdHJpbmcpLm1hdGNoKC9cXC0vKSkge1xuICAgICAgICAgICAgICAgIGRhdGVTdHJpbmcgPSBTdHJpbmcoZGF0ZVN0cmluZykucmVwbGFjZSgvXFwtL2csIFwiL1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShkYXRlU3RyaW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGNhc3QgYFwiICsgZGF0ZVN0cmluZyArIFwiYCB0byBhIGRhdGUgb2JqZWN0LlwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgRElSRUNUSVZFX0tFWV9NQVAgPSB7XG4gICAgICAgIFk6IFwieWVhcnNcIixcbiAgICAgICAgbTogXCJtb250aHNcIixcbiAgICAgICAgbjogXCJkYXlzVG9Nb250aFwiLFxuICAgICAgICBkOiBcImRheXNUb1dlZWtcIixcbiAgICAgICAgdzogXCJ3ZWVrc1wiLFxuICAgICAgICBXOiBcIndlZWtzVG9Nb250aFwiLFxuICAgICAgICBIOiBcImhvdXJzXCIsXG4gICAgICAgIE06IFwibWludXRlc1wiLFxuICAgICAgICBTOiBcInNlY29uZHNcIixcbiAgICAgICAgRDogXCJ0b3RhbERheXNcIixcbiAgICAgICAgSTogXCJ0b3RhbEhvdXJzXCIsXG4gICAgICAgIE46IFwidG90YWxNaW51dGVzXCIsXG4gICAgICAgIFQ6IFwidG90YWxTZWNvbmRzXCJcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGVzY2FwZWRSZWdFeHAoc3RyKSB7XG4gICAgICAgIHZhciBzYW5pdGl6ZSA9IHN0ci50b1N0cmluZygpLnJlcGxhY2UoLyhbLj8qK14kW1xcXVxcXFwoKXt9fC1dKS9nLCBcIlxcXFwkMVwiKTtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdFeHAoc2FuaXRpemUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdHJmdGltZShvZmZzZXRPYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGZvcm1hdCkge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGl2ZXMgPSBmb3JtYXQubWF0Y2goLyUoLXwhKT9bQS1aXXsxfSg6W147XSs7KT8vZ2kpO1xuICAgICAgICAgICAgaWYgKGRpcmVjdGl2ZXMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGlyZWN0aXZlcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGlyZWN0aXZlID0gZGlyZWN0aXZlc1tpXS5tYXRjaCgvJSgtfCEpPyhbYS16QS1aXXsxfSkoOlteO10rOyk/LyksIHJlZ2V4cCA9IGVzY2FwZWRSZWdFeHAoZGlyZWN0aXZlWzBdKSwgbW9kaWZpZXIgPSBkaXJlY3RpdmVbMV0gfHwgXCJcIiwgcGx1cmFsID0gZGlyZWN0aXZlWzNdIHx8IFwiXCIsIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlID0gZGlyZWN0aXZlWzJdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoRElSRUNUSVZFX0tFWV9NQVAuaGFzT3duUHJvcGVydHkoZGlyZWN0aXZlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBESVJFQ1RJVkVfS0VZX01BUFtkaXJlY3RpdmVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBOdW1iZXIob2Zmc2V0T2JqZWN0W3ZhbHVlXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kaWZpZXIgPT09IFwiIVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBwbHVyYWxpemUocGx1cmFsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobW9kaWZpZXIgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUgPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFwiMFwiICsgdmFsdWUudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXQgPSBmb3JtYXQucmVwbGFjZShyZWdleHAsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9ybWF0ID0gZm9ybWF0LnJlcGxhY2UoLyUlLywgXCIlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcGx1cmFsaXplKGZvcm1hdCwgY291bnQpIHtcbiAgICAgICAgdmFyIHBsdXJhbCA9IFwic1wiLCBzaW5ndWxhciA9IFwiXCI7XG4gICAgICAgIGlmIChmb3JtYXQpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IGZvcm1hdC5yZXBsYWNlKC8oOnw7fFxccykvZ2ksIFwiXCIpLnNwbGl0KC9cXCwvKTtcbiAgICAgICAgICAgIGlmIChmb3JtYXQubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgcGx1cmFsID0gZm9ybWF0WzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaW5ndWxhciA9IGZvcm1hdFswXTtcbiAgICAgICAgICAgICAgICBwbHVyYWwgPSBmb3JtYXRbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKE1hdGguYWJzKGNvdW50KSA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBwbHVyYWw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2luZ3VsYXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIENvdW50ZG93biA9IGZ1bmN0aW9uKGVsLCBmaW5hbERhdGUsIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5lbCA9IGVsO1xuICAgICAgICB0aGlzLiRlbCA9ICQoZWwpO1xuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhpcy5vZmZzZXQgPSB7fTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zKTtcbiAgICAgICAgdGhpcy5pbnN0YW5jZU51bWJlciA9IGluc3RhbmNlcy5sZW5ndGg7XG4gICAgICAgIGluc3RhbmNlcy5wdXNoKHRoaXMpO1xuICAgICAgICB0aGlzLiRlbC5kYXRhKFwiY291bnRkb3duLWluc3RhbmNlXCIsIHRoaXMuaW5zdGFuY2VOdW1iZXIpO1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5vbihcInVwZGF0ZS5jb3VudGRvd25cIiwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwub24oXCJzdG9wZWQuY291bnRkb3duXCIsIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLm9uKFwiZmluaXNoLmNvdW50ZG93blwiLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldEZpbmFsRGF0ZShmaW5hbERhdGUpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZmVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAkLmV4dGVuZChDb3VudGRvd24ucHJvdG90eXBlLCB7XG4gICAgICAgIHN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmludGVydmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2VsZi51cGRhdGUuY2FsbChzZWxmKTtcbiAgICAgICAgICAgIH0sIHRoaXMub3B0aW9ucy5wcmVjaXNpb24pO1xuICAgICAgICB9LFxuICAgICAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcInN0b3BlZFwiKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9nZ2xlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgcGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlc3VtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3AuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIGluc3RhbmNlc1t0aGlzLmluc3RhbmNlTnVtYmVyXSA9IG51bGw7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy4kZWwuZGF0YSgpLmNvdW50ZG93bkluc3RhbmNlO1xuICAgICAgICB9LFxuICAgICAgICBzZXRGaW5hbERhdGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmZpbmFsRGF0ZSA9IHBhcnNlRGF0ZVN0cmluZyh2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY2xvc2VzdChcImh0bWxcIikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaGFzRXZlbnRzQXR0YWNoZWQgPSAkLl9kYXRhKHRoaXMuZWwsIFwiZXZlbnRzXCIpICE9PSB1bmRlZmluZWQsIG5vdyA9IG5ldyBEYXRlKCksIG5ld1RvdGFsU2Vjc0xlZnQ7XG4gICAgICAgICAgICBuZXdUb3RhbFNlY3NMZWZ0ID0gdGhpcy5maW5hbERhdGUuZ2V0VGltZSgpIC0gbm93LmdldFRpbWUoKTtcbiAgICAgICAgICAgIG5ld1RvdGFsU2Vjc0xlZnQgPSBNYXRoLmNlaWwobmV3VG90YWxTZWNzTGVmdCAvIDFlMyk7XG4gICAgICAgICAgICBuZXdUb3RhbFNlY3NMZWZ0ID0gIXRoaXMub3B0aW9ucy5lbGFwc2UgJiYgbmV3VG90YWxTZWNzTGVmdCA8IDAgPyAwIDogTWF0aC5hYnMobmV3VG90YWxTZWNzTGVmdCk7XG4gICAgICAgICAgICBpZiAodGhpcy50b3RhbFNlY3NMZWZ0ID09PSBuZXdUb3RhbFNlY3NMZWZ0IHx8ICFoYXNFdmVudHNBdHRhY2hlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbFNlY3NMZWZ0ID0gbmV3VG90YWxTZWNzTGVmdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZWxhcHNlZCA9IG5vdyA+PSB0aGlzLmZpbmFsRGF0ZTtcbiAgICAgICAgICAgIHRoaXMub2Zmc2V0ID0ge1xuICAgICAgICAgICAgICAgIHNlY29uZHM6IHRoaXMudG90YWxTZWNzTGVmdCAlIDYwLFxuICAgICAgICAgICAgICAgIG1pbnV0ZXM6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjApICUgNjAsXG4gICAgICAgICAgICAgICAgaG91cnM6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjAgLyA2MCkgJSAyNCxcbiAgICAgICAgICAgICAgICBkYXlzOiBNYXRoLmZsb29yKHRoaXMudG90YWxTZWNzTGVmdCAvIDYwIC8gNjAgLyAyNCkgJSA3LFxuICAgICAgICAgICAgICAgIGRheXNUb1dlZWs6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjAgLyA2MCAvIDI0KSAlIDcsXG4gICAgICAgICAgICAgICAgZGF5c1RvTW9udGg6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjAgLyA2MCAvIDI0ICUgMzAuNDM2OCksXG4gICAgICAgICAgICAgICAgd2Vla3M6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjAgLyA2MCAvIDI0IC8gNyksXG4gICAgICAgICAgICAgICAgd2Vla3NUb01vbnRoOiBNYXRoLmZsb29yKHRoaXMudG90YWxTZWNzTGVmdCAvIDYwIC8gNjAgLyAyNCAvIDcpICUgNCxcbiAgICAgICAgICAgICAgICBtb250aHM6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjAgLyA2MCAvIDI0IC8gMzAuNDM2OCksXG4gICAgICAgICAgICAgICAgeWVhcnM6IE1hdGguYWJzKHRoaXMuZmluYWxEYXRlLmdldEZ1bGxZZWFyKCkgLSBub3cuZ2V0RnVsbFllYXIoKSksXG4gICAgICAgICAgICAgICAgdG90YWxEYXlzOiBNYXRoLmZsb29yKHRoaXMudG90YWxTZWNzTGVmdCAvIDYwIC8gNjAgLyAyNCksXG4gICAgICAgICAgICAgICAgdG90YWxIb3VyczogTWF0aC5mbG9vcih0aGlzLnRvdGFsU2Vjc0xlZnQgLyA2MCAvIDYwKSxcbiAgICAgICAgICAgICAgICB0b3RhbE1pbnV0ZXM6IE1hdGguZmxvb3IodGhpcy50b3RhbFNlY3NMZWZ0IC8gNjApLFxuICAgICAgICAgICAgICAgIHRvdGFsU2Vjb25kczogdGhpcy50b3RhbFNlY3NMZWZ0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZWxhcHNlICYmIHRoaXMudG90YWxTZWNzTGVmdCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChcImZpbmlzaFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KFwidXBkYXRlXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkaXNwYXRjaEV2ZW50OiBmdW5jdGlvbihldmVudE5hbWUpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9ICQuRXZlbnQoZXZlbnROYW1lICsgXCIuY291bnRkb3duXCIpO1xuICAgICAgICAgICAgZXZlbnQuZmluYWxEYXRlID0gdGhpcy5maW5hbERhdGU7XG4gICAgICAgICAgICBldmVudC5lbGFwc2VkID0gdGhpcy5lbGFwc2VkO1xuICAgICAgICAgICAgZXZlbnQub2Zmc2V0ID0gJC5leHRlbmQoe30sIHRoaXMub2Zmc2V0KTtcbiAgICAgICAgICAgIGV2ZW50LnN0cmZ0aW1lID0gc3RyZnRpbWUodGhpcy5vZmZzZXQpO1xuICAgICAgICAgICAgdGhpcy4kZWwudHJpZ2dlcihldmVudCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAkLmZuLmNvdW50ZG93biA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJndW1lbnRzQXJyYXkgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGluc3RhbmNlTnVtYmVyID0gJCh0aGlzKS5kYXRhKFwiY291bnRkb3duLWluc3RhbmNlXCIpO1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlTnVtYmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBpbnN0YW5jZXNbaW5zdGFuY2VOdW1iZXJdLCBtZXRob2QgPSBhcmd1bWVudHNBcnJheVswXTtcbiAgICAgICAgICAgICAgICBpZiAoQ291bnRkb3duLnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eShtZXRob2QpKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW21ldGhvZF0uYXBwbHkoaW5zdGFuY2UsIGFyZ3VtZW50c0FycmF5LnNsaWNlKDEpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFN0cmluZyhtZXRob2QpLm1hdGNoKC9eWyRBLVpfXVswLTlBLVpfJF0qJC9pKSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZXRGaW5hbERhdGUuY2FsbChpbnN0YW5jZSwgbWV0aG9kKTtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Uuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkLmVycm9yKFwiTWV0aG9kICVzIGRvZXMgbm90IGV4aXN0IG9uIGpRdWVyeS5jb3VudGRvd25cIi5yZXBsYWNlKC9cXCVzL2dpLCBtZXRob2QpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ldyBDb3VudGRvd24odGhpcywgYXJndW1lbnRzQXJyYXlbMF0sIGFyZ3VtZW50c0FycmF5WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0pOyJdLCJmaWxlIjoianF1ZXJ5LmNvdW50ZG93bi5qcyJ9
