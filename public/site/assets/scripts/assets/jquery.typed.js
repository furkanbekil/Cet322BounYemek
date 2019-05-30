// The MIT License (MIT)

// Typed.js | Copyright (c) 2014 Matt Boldt | www.mattboldt.com

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




! function($) {

    "use strict";

    var Typed = function(el, options) {

        // chosen element to manipulate text
        this.el = $(el);

        // options
        this.options = $.extend({}, $.fn.typed.defaults, options);

        // attribute to type into
        this.isInput = this.el.is('input');
        this.attr = this.options.attr;

        // show cursor
        this.showCursor = this.isInput ? false : this.options.showCursor;

        // text content of element
        this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text()

        // html or plain text
        this.contentType = this.options.contentType;

        // typing speed
        this.typeSpeed = this.options.typeSpeed;

        // add a delay before typing starts
        this.startDelay = this.options.startDelay;

        // backspacing speed
        this.backSpeed = this.options.backSpeed;

        // amount of time to wait before backspacing
        this.backDelay = this.options.backDelay;

        // div containing strings
        this.stringsElement = this.options.stringsElement;

        // input strings of text
        this.strings = this.options.strings;

        // character number position of current string
        this.strPos = 0;

        // current array position
        this.arrayPos = 0;

        // number to stop backspacing on.
        // default 0, can change depending on how many chars
        // you want to remove at the time
        this.stopNum = 0;

        // Looping logic
        this.loop = this.options.loop;
        this.loopCount = this.options.loopCount;
        this.curLoop = 0;

        // for stopping
        this.stop = false;

        // custom cursor
        this.cursorChar = this.options.cursorChar;

        // shuffle the strings
        this.shuffle = this.options.shuffle;
        // the order of strings
        this.sequence = [];

        // All systems go!
        this.build();
    };

    Typed.prototype = {

        constructor: Typed

        ,
        init: function() {
            // begin the loop w/ first current string (global self.strings)
            // current string will be passed as an argument each time after this
            var self = this;
            self.timeout = setTimeout(function() {
                for (var i=0;i<self.strings.length;++i) self.sequence[i]=i;

                // shuffle the array if true
                if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                // Start typing
                self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
            }, self.startDelay);
        }

        ,
        build: function() {
            var self = this;
            // Insert cursor
            if (this.showCursor === true) {
                this.cursor = $("<span class=\"typed-cursor\">" + this.cursorChar + "</span>");
                this.el.after(this.cursor);
            }
            if (this.stringsElement) {
                self.strings = [];
                this.stringsElement.hide();
                var strings = this.stringsElement.find('p');
                $.each(strings, function(key, value){
                    self.strings.push($(value).html());
                });
            }
            this.init();
        }

        // pass current string state to each function, types 1 char per call
        ,
        typewrite: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
            var self = this;

            // ------------- optional ------------- //
            // backpaces a certain string faster
            // ------------------------------------ //
            // if (self.arrayPos == 1){
            //  self.backDelay = 50;
            // }
            // else{ self.backDelay = 500; }

            // contain typing function in a timeout humanize'd delay
            self.timeout = setTimeout(function() {
                // check for an escape character before a pause value
                // format: \^\d+ .. eg: ^1000 .. should be able to print the ^ too using ^^
                // single ^ are removed from string
                var charPause = 0;
                var substr = curString.substr(curStrPos);
                if (substr.charAt(0) === '^') {
                    var skip = 1; // skip atleast 1
                    if (/^\^\d+/.test(substr)) {
                        substr = /\d+/.exec(substr)[0];
                        skip += substr.length;
                        charPause = parseInt(substr);
                    }

                    // strip out the escape character and pause value so they're not printed
                    curString = curString.substring(0, curStrPos) + curString.substring(curStrPos + skip);
                }

                if (self.contentType === 'html') {
                    // skip over html tags while typing
                    var curChar = curString.substr(curStrPos).charAt(0)
                    if (curChar === '<' || curChar === '&') {
                        var tag = '';
                        var endTag = '';
                        if (curChar === '<') {
                            endTag = '>'
                        } else {
                            endTag = ';'
                        }
                        while (curString.substr(curStrPos).charAt(0) !== endTag) {
                            tag += curString.substr(curStrPos).charAt(0);
                            curStrPos++;
                        }
                        curStrPos++;
                        tag += endTag;
                    }
                }

                // timeout for any pause after a character
                self.timeout = setTimeout(function() {
                    if (curStrPos === curString.length) {
                        // fires callback function
                        self.options.onStringTyped(self.arrayPos);

                        // is this the final string
                        if (self.arrayPos === self.strings.length - 1) {
                            // animation that occurs on the last typed string
                            self.options.callback();

                            self.curLoop++;

                            // quit if we wont loop back
                            if (self.loop === false || self.curLoop === self.loopCount)
                                return;
                        }

                        self.timeout = setTimeout(function() {
                            self.backspace(curString, curStrPos);
                        }, self.backDelay);
                    } else {

                        /* call before functions if applicable */
                        if (curStrPos === 0)
                            self.options.preStringTyped(self.arrayPos);

                        // start typing each new char into existing string
                        // curString: arg, self.el.html: original text inside element
                        var nextString = curString.substr(0, curStrPos + 1);
                        if (self.attr) {
                            self.el.attr(self.attr, nextString);
                        } else {
                            if (self.isInput) {
                                self.el.val(nextString);
                            } else if (self.contentType === 'html') {
                                self.el.html(nextString);
                            } else {
                                self.el.text(nextString);
                            }
                        }

                        // add characters one by one
                        curStrPos++;
                        // loop the function
                        self.typewrite(curString, curStrPos);
                    }
                    // end of character pause
                }, charPause);

                // humanized value for typing
            }, humanize);

        }

        ,
        backspace: function(curString, curStrPos) {
            // exit when stopped
            if (this.stop === true) {
                return;
            }

            // varying values for setTimeout during typing
            // can't be global since number changes each time loop is executed
            var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
            var self = this;

            self.timeout = setTimeout(function() {

                // ----- this part is optional ----- //
                // check string array position
                // on the first string, only delete one word
                // the stopNum actually represents the amount of chars to
                // keep in the current string. In my case it's 14.
                // if (self.arrayPos == 1){
                //  self.stopNum = 14;
                // }
                //every other time, delete the whole typed string
                // else{
                //  self.stopNum = 0;
                // }

                if (self.contentType === 'html') {
                    // skip over html tags while backspacing
                    if (curString.substr(curStrPos).charAt(0) === '>') {
                        var tag = '';
                        while (curString.substr(curStrPos).charAt(0) !== '<') {
                            tag -= curString.substr(curStrPos).charAt(0);
                            curStrPos--;
                        }
                        curStrPos--;
                        tag += '<';
                    }
                }

                // ----- continue important stuff ----- //
                // replace text with base text + typed characters
                var nextString = curString.substr(0, curStrPos);
                if (self.attr) {
                    self.el.attr(self.attr, nextString);
                } else {
                    if (self.isInput) {
                        self.el.val(nextString);
                    } else if (self.contentType === 'html') {
                        self.el.html(nextString);
                    } else {
                        self.el.text(nextString);
                    }
                }

                // if the number (id of character in current string) is
                // less than the stop number, keep going
                if (curStrPos > self.stopNum) {
                    // subtract characters one by one
                    curStrPos--;
                    // loop the function
                    self.backspace(curString, curStrPos);
                }
                // if the stop number has been reached, increase
                // array position to next string
                else if (curStrPos <= self.stopNum) {
                    self.arrayPos++;

                    if (self.arrayPos === self.strings.length) {
                        self.arrayPos = 0;

                        // Shuffle sequence again
                        if(self.shuffle) self.sequence = self.shuffleArray(self.sequence);

                        self.init();
                    } else
                        self.typewrite(self.strings[self.sequence[self.arrayPos]], curStrPos);
                }

                // humanized value for typing
            }, humanize);

        }
        /**
         * Shuffles the numbers in the given array.
         * @param {Array} array
         * @returns {Array}
         */
        ,shuffleArray: function(array) {
            var tmp, current, top = array.length;
            if(top) while(--top) {
                current = Math.floor(Math.random() * (top + 1));
                tmp = array[current];
                array[current] = array[top];
                array[top] = tmp;
            }
            return array;
        }

        // Start & Stop currently not working

        // , stop: function() {
        //     var self = this;

        //     self.stop = true;
        //     clearInterval(self.timeout);
        // }

        // , start: function() {
        //     var self = this;
        //     if(self.stop === false)
        //        return;

        //     this.stop = false;
        //     this.init();
        // }

        // Reset and rebuild the element
        ,
        reset: function() {
            var self = this;
            clearInterval(self.timeout);
            var id = this.el.attr('id');
            this.el.after('<span id="' + id + '"/>')
            this.el.remove();
            if (typeof this.cursor !== 'undefined') {
                this.cursor.remove();
            }
            // Send the callback
            self.options.resetCallback();
        }

    };

    $.fn.typed = function(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('typed'),
                options = typeof option == 'object' && option;
            if (!data) $this.data('typed', (data = new Typed(this, options)));
            if (typeof option == 'string') data[option]();
        });
    };

    $.fn.typed.defaults = {
        strings: ["These are the default values...", "You know what you should do?", "Use your own!", "Have a great day!"],
        stringsElement: null,
        // typing speed
        typeSpeed: 0,
        // time before typing starts
        startDelay: 0,
        // backspacing speed
        backSpeed: 0,
        // shuffle the strings
        shuffle: false,
        // time before backspacing
        backDelay: 500,
        // loop
        loop: false,
        // false = infinite
        loopCount: false,
        // show cursor
        showCursor: true,
        // character for cursor
        cursorChar: "|",
        // attribute to type (null == text)
        attr: null,
        // either html or text
        contentType: 'html',
        // call when done callback function
        callback: function() {},
        // starting callback function before each string
        preStringTyped: function() {},
        //callback for every typed string
        onStringTyped: function() {},
        // callback for reset
        resetCallback: function() {}
    };


}(window.jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkudHlwZWQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIE1JVCBMaWNlbnNlIChNSVQpXG5cbi8vIFR5cGVkLmpzIHwgQ29weXJpZ2h0IChjKSAyMDE0IE1hdHQgQm9sZHQgfCB3d3cubWF0dGJvbGR0LmNvbVxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cblxuXG5cbiEgZnVuY3Rpb24oJCkge1xuXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgVHlwZWQgPSBmdW5jdGlvbihlbCwgb3B0aW9ucykge1xuXG4gICAgICAgIC8vIGNob3NlbiBlbGVtZW50IHRvIG1hbmlwdWxhdGUgdGV4dFxuICAgICAgICB0aGlzLmVsID0gJChlbCk7XG5cbiAgICAgICAgLy8gb3B0aW9uc1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgJC5mbi50eXBlZC5kZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gYXR0cmlidXRlIHRvIHR5cGUgaW50b1xuICAgICAgICB0aGlzLmlzSW5wdXQgPSB0aGlzLmVsLmlzKCdpbnB1dCcpO1xuICAgICAgICB0aGlzLmF0dHIgPSB0aGlzLm9wdGlvbnMuYXR0cjtcblxuICAgICAgICAvLyBzaG93IGN1cnNvclxuICAgICAgICB0aGlzLnNob3dDdXJzb3IgPSB0aGlzLmlzSW5wdXQgPyBmYWxzZSA6IHRoaXMub3B0aW9ucy5zaG93Q3Vyc29yO1xuXG4gICAgICAgIC8vIHRleHQgY29udGVudCBvZiBlbGVtZW50XG4gICAgICAgIHRoaXMuZWxDb250ZW50ID0gdGhpcy5hdHRyID8gdGhpcy5lbC5hdHRyKHRoaXMuYXR0cikgOiB0aGlzLmVsLnRleHQoKVxuXG4gICAgICAgIC8vIGh0bWwgb3IgcGxhaW4gdGV4dFxuICAgICAgICB0aGlzLmNvbnRlbnRUeXBlID0gdGhpcy5vcHRpb25zLmNvbnRlbnRUeXBlO1xuXG4gICAgICAgIC8vIHR5cGluZyBzcGVlZFxuICAgICAgICB0aGlzLnR5cGVTcGVlZCA9IHRoaXMub3B0aW9ucy50eXBlU3BlZWQ7XG5cbiAgICAgICAgLy8gYWRkIGEgZGVsYXkgYmVmb3JlIHR5cGluZyBzdGFydHNcbiAgICAgICAgdGhpcy5zdGFydERlbGF5ID0gdGhpcy5vcHRpb25zLnN0YXJ0RGVsYXk7XG5cbiAgICAgICAgLy8gYmFja3NwYWNpbmcgc3BlZWRcbiAgICAgICAgdGhpcy5iYWNrU3BlZWQgPSB0aGlzLm9wdGlvbnMuYmFja1NwZWVkO1xuXG4gICAgICAgIC8vIGFtb3VudCBvZiB0aW1lIHRvIHdhaXQgYmVmb3JlIGJhY2tzcGFjaW5nXG4gICAgICAgIHRoaXMuYmFja0RlbGF5ID0gdGhpcy5vcHRpb25zLmJhY2tEZWxheTtcblxuICAgICAgICAvLyBkaXYgY29udGFpbmluZyBzdHJpbmdzXG4gICAgICAgIHRoaXMuc3RyaW5nc0VsZW1lbnQgPSB0aGlzLm9wdGlvbnMuc3RyaW5nc0VsZW1lbnQ7XG5cbiAgICAgICAgLy8gaW5wdXQgc3RyaW5ncyBvZiB0ZXh0XG4gICAgICAgIHRoaXMuc3RyaW5ncyA9IHRoaXMub3B0aW9ucy5zdHJpbmdzO1xuXG4gICAgICAgIC8vIGNoYXJhY3RlciBudW1iZXIgcG9zaXRpb24gb2YgY3VycmVudCBzdHJpbmdcbiAgICAgICAgdGhpcy5zdHJQb3MgPSAwO1xuXG4gICAgICAgIC8vIGN1cnJlbnQgYXJyYXkgcG9zaXRpb25cbiAgICAgICAgdGhpcy5hcnJheVBvcyA9IDA7XG5cbiAgICAgICAgLy8gbnVtYmVyIHRvIHN0b3AgYmFja3NwYWNpbmcgb24uXG4gICAgICAgIC8vIGRlZmF1bHQgMCwgY2FuIGNoYW5nZSBkZXBlbmRpbmcgb24gaG93IG1hbnkgY2hhcnNcbiAgICAgICAgLy8geW91IHdhbnQgdG8gcmVtb3ZlIGF0IHRoZSB0aW1lXG4gICAgICAgIHRoaXMuc3RvcE51bSA9IDA7XG5cbiAgICAgICAgLy8gTG9vcGluZyBsb2dpY1xuICAgICAgICB0aGlzLmxvb3AgPSB0aGlzLm9wdGlvbnMubG9vcDtcbiAgICAgICAgdGhpcy5sb29wQ291bnQgPSB0aGlzLm9wdGlvbnMubG9vcENvdW50O1xuICAgICAgICB0aGlzLmN1ckxvb3AgPSAwO1xuXG4gICAgICAgIC8vIGZvciBzdG9wcGluZ1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcblxuICAgICAgICAvLyBjdXN0b20gY3Vyc29yXG4gICAgICAgIHRoaXMuY3Vyc29yQ2hhciA9IHRoaXMub3B0aW9ucy5jdXJzb3JDaGFyO1xuXG4gICAgICAgIC8vIHNodWZmbGUgdGhlIHN0cmluZ3NcbiAgICAgICAgdGhpcy5zaHVmZmxlID0gdGhpcy5vcHRpb25zLnNodWZmbGU7XG4gICAgICAgIC8vIHRoZSBvcmRlciBvZiBzdHJpbmdzXG4gICAgICAgIHRoaXMuc2VxdWVuY2UgPSBbXTtcblxuICAgICAgICAvLyBBbGwgc3lzdGVtcyBnbyFcbiAgICAgICAgdGhpcy5idWlsZCgpO1xuICAgIH07XG5cbiAgICBUeXBlZC5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgY29uc3RydWN0b3I6IFR5cGVkXG5cbiAgICAgICAgLFxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGJlZ2luIHRoZSBsb29wIHcvIGZpcnN0IGN1cnJlbnQgc3RyaW5nIChnbG9iYWwgc2VsZi5zdHJpbmdzKVxuICAgICAgICAgICAgLy8gY3VycmVudCBzdHJpbmcgd2lsbCBiZSBwYXNzZWQgYXMgYW4gYXJndW1lbnQgZWFjaCB0aW1lIGFmdGVyIHRoaXNcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaT0wO2k8c2VsZi5zdHJpbmdzLmxlbmd0aDsrK2kpIHNlbGYuc2VxdWVuY2VbaV09aTtcblxuICAgICAgICAgICAgICAgIC8vIHNodWZmbGUgdGhlIGFycmF5IGlmIHRydWVcbiAgICAgICAgICAgICAgICBpZihzZWxmLnNodWZmbGUpIHNlbGYuc2VxdWVuY2UgPSBzZWxmLnNodWZmbGVBcnJheShzZWxmLnNlcXVlbmNlKTtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHR5cGluZ1xuICAgICAgICAgICAgICAgIHNlbGYudHlwZXdyaXRlKHNlbGYuc3RyaW5nc1tzZWxmLnNlcXVlbmNlW3NlbGYuYXJyYXlQb3NdXSwgc2VsZi5zdHJQb3MpO1xuICAgICAgICAgICAgfSwgc2VsZi5zdGFydERlbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgICxcbiAgICAgICAgYnVpbGQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgLy8gSW5zZXJ0IGN1cnNvclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0N1cnNvciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yID0gJChcIjxzcGFuIGNsYXNzPVxcXCJ0eXBlZC1jdXJzb3JcXFwiPlwiICsgdGhpcy5jdXJzb3JDaGFyICsgXCI8L3NwYW4+XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWwuYWZ0ZXIodGhpcy5jdXJzb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuc3RyaW5nc0VsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnN0cmluZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0cmluZ3NFbGVtZW50LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RyaW5ncyA9IHRoaXMuc3RyaW5nc0VsZW1lbnQuZmluZCgncCcpO1xuICAgICAgICAgICAgICAgICQuZWFjaChzdHJpbmdzLCBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zdHJpbmdzLnB1c2goJCh2YWx1ZSkuaHRtbCgpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFzcyBjdXJyZW50IHN0cmluZyBzdGF0ZSB0byBlYWNoIGZ1bmN0aW9uLCB0eXBlcyAxIGNoYXIgcGVyIGNhbGxcbiAgICAgICAgLFxuICAgICAgICB0eXBld3JpdGU6IGZ1bmN0aW9uKGN1clN0cmluZywgY3VyU3RyUG9zKSB7XG4gICAgICAgICAgICAvLyBleGl0IHdoZW4gc3RvcHBlZFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdmFyeWluZyB2YWx1ZXMgZm9yIHNldFRpbWVvdXQgZHVyaW5nIHR5cGluZ1xuICAgICAgICAgICAgLy8gY2FuJ3QgYmUgZ2xvYmFsIHNpbmNlIG51bWJlciBjaGFuZ2VzIGVhY2ggdGltZSBsb29wIGlzIGV4ZWN1dGVkXG4gICAgICAgICAgICB2YXIgaHVtYW5pemUgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoMTAwIC0gMzApKSArIHRoaXMudHlwZVNwZWVkO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tIG9wdGlvbmFsIC0tLS0tLS0tLS0tLS0gLy9cbiAgICAgICAgICAgIC8vIGJhY2twYWNlcyBhIGNlcnRhaW4gc3RyaW5nIGZhc3RlclxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gICAgICAgICAgICAvLyBpZiAoc2VsZi5hcnJheVBvcyA9PSAxKXtcbiAgICAgICAgICAgIC8vICBzZWxmLmJhY2tEZWxheSA9IDUwO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gZWxzZXsgc2VsZi5iYWNrRGVsYXkgPSA1MDA7IH1cblxuICAgICAgICAgICAgLy8gY29udGFpbiB0eXBpbmcgZnVuY3Rpb24gaW4gYSB0aW1lb3V0IGh1bWFuaXplJ2QgZGVsYXlcbiAgICAgICAgICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIGFuIGVzY2FwZSBjaGFyYWN0ZXIgYmVmb3JlIGEgcGF1c2UgdmFsdWVcbiAgICAgICAgICAgICAgICAvLyBmb3JtYXQ6IFxcXlxcZCsgLi4gZWc6IF4xMDAwIC4uIHNob3VsZCBiZSBhYmxlIHRvIHByaW50IHRoZSBeIHRvbyB1c2luZyBeXlxuICAgICAgICAgICAgICAgIC8vIHNpbmdsZSBeIGFyZSByZW1vdmVkIGZyb20gc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFyIGNoYXJQYXVzZSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHN1YnN0ciA9IGN1clN0cmluZy5zdWJzdHIoY3VyU3RyUG9zKTtcbiAgICAgICAgICAgICAgICBpZiAoc3Vic3RyLmNoYXJBdCgwKSA9PT0gJ14nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBza2lwID0gMTsgLy8gc2tpcCBhdGxlYXN0IDFcbiAgICAgICAgICAgICAgICAgICAgaWYgKC9eXFxeXFxkKy8udGVzdChzdWJzdHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJzdHIgPSAvXFxkKy8uZXhlYyhzdWJzdHIpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2tpcCArPSBzdWJzdHIubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhclBhdXNlID0gcGFyc2VJbnQoc3Vic3RyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIHN0cmlwIG91dCB0aGUgZXNjYXBlIGNoYXJhY3RlciBhbmQgcGF1c2UgdmFsdWUgc28gdGhleSdyZSBub3QgcHJpbnRlZFxuICAgICAgICAgICAgICAgICAgICBjdXJTdHJpbmcgPSBjdXJTdHJpbmcuc3Vic3RyaW5nKDAsIGN1clN0clBvcykgKyBjdXJTdHJpbmcuc3Vic3RyaW5nKGN1clN0clBvcyArIHNraXApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmNvbnRlbnRUeXBlID09PSAnaHRtbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc2tpcCBvdmVyIGh0bWwgdGFncyB3aGlsZSB0eXBpbmdcbiAgICAgICAgICAgICAgICAgICAgdmFyIGN1ckNoYXIgPSBjdXJTdHJpbmcuc3Vic3RyKGN1clN0clBvcykuY2hhckF0KDApXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJDaGFyID09PSAnPCcgfHwgY3VyQ2hhciA9PT0gJyYnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFnID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kVGFnID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyQ2hhciA9PT0gJzwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kVGFnID0gJz4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZFRhZyA9ICc7J1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1clN0cmluZy5zdWJzdHIoY3VyU3RyUG9zKS5jaGFyQXQoMCkgIT09IGVuZFRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZyArPSBjdXJTdHJpbmcuc3Vic3RyKGN1clN0clBvcykuY2hhckF0KDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clN0clBvcysrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyU3RyUG9zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWcgKz0gZW5kVGFnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdGltZW91dCBmb3IgYW55IHBhdXNlIGFmdGVyIGEgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clN0clBvcyA9PT0gY3VyU3RyaW5nLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyZXMgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub3B0aW9ucy5vblN0cmluZ1R5cGVkKHNlbGYuYXJyYXlQb3MpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpcyB0aGlzIHRoZSBmaW5hbCBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmFycmF5UG9zID09PSBzZWxmLnN0cmluZ3MubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuaW1hdGlvbiB0aGF0IG9jY3VycyBvbiB0aGUgbGFzdCB0eXBlZCBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9wdGlvbnMuY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY3VyTG9vcCsrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gcXVpdCBpZiB3ZSB3b250IGxvb3AgYmFja1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmxvb3AgPT09IGZhbHNlIHx8IHNlbGYuY3VyTG9vcCA9PT0gc2VsZi5sb29wQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmJhY2tzcGFjZShjdXJTdHJpbmcsIGN1clN0clBvcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzZWxmLmJhY2tEZWxheSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGNhbGwgYmVmb3JlIGZ1bmN0aW9ucyBpZiBhcHBsaWNhYmxlICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyU3RyUG9zID09PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub3B0aW9ucy5wcmVTdHJpbmdUeXBlZChzZWxmLmFycmF5UG9zKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc3RhcnQgdHlwaW5nIGVhY2ggbmV3IGNoYXIgaW50byBleGlzdGluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGN1clN0cmluZzogYXJnLCBzZWxmLmVsLmh0bWw6IG9yaWdpbmFsIHRleHQgaW5zaWRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXh0U3RyaW5nID0gY3VyU3RyaW5nLnN1YnN0cigwLCBjdXJTdHJQb3MgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVsLmF0dHIoc2VsZi5hdHRyLCBuZXh0U3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuaXNJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVsLnZhbChuZXh0U3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuY29udGVudFR5cGUgPT09ICdodG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVsLmh0bWwobmV4dFN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbC50ZXh0KG5leHRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGNoYXJhY3RlcnMgb25lIGJ5IG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyU3RyUG9zKys7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb29wIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi50eXBld3JpdGUoY3VyU3RyaW5nLCBjdXJTdHJQb3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGVuZCBvZiBjaGFyYWN0ZXIgcGF1c2VcbiAgICAgICAgICAgICAgICB9LCBjaGFyUGF1c2UpO1xuXG4gICAgICAgICAgICAgICAgLy8gaHVtYW5pemVkIHZhbHVlIGZvciB0eXBpbmdcbiAgICAgICAgICAgIH0sIGh1bWFuaXplKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgLFxuICAgICAgICBiYWNrc3BhY2U6IGZ1bmN0aW9uKGN1clN0cmluZywgY3VyU3RyUG9zKSB7XG4gICAgICAgICAgICAvLyBleGl0IHdoZW4gc3RvcHBlZFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdmFyeWluZyB2YWx1ZXMgZm9yIHNldFRpbWVvdXQgZHVyaW5nIHR5cGluZ1xuICAgICAgICAgICAgLy8gY2FuJ3QgYmUgZ2xvYmFsIHNpbmNlIG51bWJlciBjaGFuZ2VzIGVhY2ggdGltZSBsb29wIGlzIGV4ZWN1dGVkXG4gICAgICAgICAgICB2YXIgaHVtYW5pemUgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAoMTAwIC0gMzApKSArIHRoaXMuYmFja1NwZWVkO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgLy8gLS0tLS0gdGhpcyBwYXJ0IGlzIG9wdGlvbmFsIC0tLS0tIC8vXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgc3RyaW5nIGFycmF5IHBvc2l0aW9uXG4gICAgICAgICAgICAgICAgLy8gb24gdGhlIGZpcnN0IHN0cmluZywgb25seSBkZWxldGUgb25lIHdvcmRcbiAgICAgICAgICAgICAgICAvLyB0aGUgc3RvcE51bSBhY3R1YWxseSByZXByZXNlbnRzIHRoZSBhbW91bnQgb2YgY2hhcnMgdG9cbiAgICAgICAgICAgICAgICAvLyBrZWVwIGluIHRoZSBjdXJyZW50IHN0cmluZy4gSW4gbXkgY2FzZSBpdCdzIDE0LlxuICAgICAgICAgICAgICAgIC8vIGlmIChzZWxmLmFycmF5UG9zID09IDEpe1xuICAgICAgICAgICAgICAgIC8vICBzZWxmLnN0b3BOdW0gPSAxNDtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgLy9ldmVyeSBvdGhlciB0aW1lLCBkZWxldGUgdGhlIHdob2xlIHR5cGVkIHN0cmluZ1xuICAgICAgICAgICAgICAgIC8vIGVsc2V7XG4gICAgICAgICAgICAgICAgLy8gIHNlbGYuc3RvcE51bSA9IDA7XG4gICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuY29udGVudFR5cGUgPT09ICdodG1sJykge1xuICAgICAgICAgICAgICAgICAgICAvLyBza2lwIG92ZXIgaHRtbCB0YWdzIHdoaWxlIGJhY2tzcGFjaW5nXG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJTdHJpbmcuc3Vic3RyKGN1clN0clBvcykuY2hhckF0KDApID09PSAnPicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0YWcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJTdHJpbmcuc3Vic3RyKGN1clN0clBvcykuY2hhckF0KDApICE9PSAnPCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWcgLT0gY3VyU3RyaW5nLnN1YnN0cihjdXJTdHJQb3MpLmNoYXJBdCgwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJTdHJQb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGN1clN0clBvcy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnICs9ICc8JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIC0tLS0tIGNvbnRpbnVlIGltcG9ydGFudCBzdHVmZiAtLS0tLSAvL1xuICAgICAgICAgICAgICAgIC8vIHJlcGxhY2UgdGV4dCB3aXRoIGJhc2UgdGV4dCArIHR5cGVkIGNoYXJhY3RlcnNcbiAgICAgICAgICAgICAgICB2YXIgbmV4dFN0cmluZyA9IGN1clN0cmluZy5zdWJzdHIoMCwgY3VyU3RyUG9zKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5hdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZWwuYXR0cihzZWxmLmF0dHIsIG5leHRTdHJpbmcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmlzSW5wdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZWwudmFsKG5leHRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuY29udGVudFR5cGUgPT09ICdodG1sJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbC5odG1sKG5leHRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5lbC50ZXh0KG5leHRTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIG51bWJlciAoaWQgb2YgY2hhcmFjdGVyIGluIGN1cnJlbnQgc3RyaW5nKSBpc1xuICAgICAgICAgICAgICAgIC8vIGxlc3MgdGhhbiB0aGUgc3RvcCBudW1iZXIsIGtlZXAgZ29pbmdcbiAgICAgICAgICAgICAgICBpZiAoY3VyU3RyUG9zID4gc2VsZi5zdG9wTnVtKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHN1YnRyYWN0IGNoYXJhY3RlcnMgb25lIGJ5IG9uZVxuICAgICAgICAgICAgICAgICAgICBjdXJTdHJQb3MtLTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbG9vcCB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5iYWNrc3BhY2UoY3VyU3RyaW5nLCBjdXJTdHJQb3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgc3RvcCBudW1iZXIgaGFzIGJlZW4gcmVhY2hlZCwgaW5jcmVhc2VcbiAgICAgICAgICAgICAgICAvLyBhcnJheSBwb3NpdGlvbiB0byBuZXh0IHN0cmluZ1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1clN0clBvcyA8PSBzZWxmLnN0b3BOdW0pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5hcnJheVBvcysrO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmFycmF5UG9zID09PSBzZWxmLnN0cmluZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFycmF5UG9zID0gMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2h1ZmZsZSBzZXF1ZW5jZSBhZ2FpblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoc2VsZi5zaHVmZmxlKSBzZWxmLnNlcXVlbmNlID0gc2VsZi5zaHVmZmxlQXJyYXkoc2VsZi5zZXF1ZW5jZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdCgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYudHlwZXdyaXRlKHNlbGYuc3RyaW5nc1tzZWxmLnNlcXVlbmNlW3NlbGYuYXJyYXlQb3NdXSwgY3VyU3RyUG9zKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBodW1hbml6ZWQgdmFsdWUgZm9yIHR5cGluZ1xuICAgICAgICAgICAgfSwgaHVtYW5pemUpO1xuXG4gICAgICAgIH1cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNodWZmbGVzIHRoZSBudW1iZXJzIGluIHRoZSBnaXZlbiBhcnJheS5cbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXlcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgLHNodWZmbGVBcnJheTogZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgICAgICAgIHZhciB0bXAsIGN1cnJlbnQsIHRvcCA9IGFycmF5Lmxlbmd0aDtcbiAgICAgICAgICAgIGlmKHRvcCkgd2hpbGUoLS10b3ApIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHRvcCArIDEpKTtcbiAgICAgICAgICAgICAgICB0bXAgPSBhcnJheVtjdXJyZW50XTtcbiAgICAgICAgICAgICAgICBhcnJheVtjdXJyZW50XSA9IGFycmF5W3RvcF07XG4gICAgICAgICAgICAgICAgYXJyYXlbdG9wXSA9IHRtcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0ICYgU3RvcCBjdXJyZW50bHkgbm90IHdvcmtpbmdcblxuICAgICAgICAvLyAsIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIC8vICAgICBzZWxmLnN0b3AgPSB0cnVlO1xuICAgICAgICAvLyAgICAgY2xlYXJJbnRlcnZhbChzZWxmLnRpbWVvdXQpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gLCBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vICAgICBpZihzZWxmLnN0b3AgPT09IGZhbHNlKVxuICAgICAgICAvLyAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIC8vICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICAgICAgLy8gICAgIHRoaXMuaW5pdCgpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gUmVzZXQgYW5kIHJlYnVpbGQgdGhlIGVsZW1lbnRcbiAgICAgICAgLFxuICAgICAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHNlbGYudGltZW91dCk7XG4gICAgICAgICAgICB2YXIgaWQgPSB0aGlzLmVsLmF0dHIoJ2lkJyk7XG4gICAgICAgICAgICB0aGlzLmVsLmFmdGVyKCc8c3BhbiBpZD1cIicgKyBpZCArICdcIi8+JylcbiAgICAgICAgICAgIHRoaXMuZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY3Vyc29yICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gU2VuZCB0aGUgY2FsbGJhY2tcbiAgICAgICAgICAgIHNlbGYub3B0aW9ucy5yZXNldENhbGxiYWNrKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAkLmZuLnR5cGVkID0gZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSAkdGhpcy5kYXRhKCd0eXBlZCcpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvbjtcbiAgICAgICAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgndHlwZWQnLCAoZGF0YSA9IG5ldyBUeXBlZCh0aGlzLCBvcHRpb25zKSkpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJC5mbi50eXBlZC5kZWZhdWx0cyA9IHtcbiAgICAgICAgc3RyaW5nczogW1wiVGhlc2UgYXJlIHRoZSBkZWZhdWx0IHZhbHVlcy4uLlwiLCBcIllvdSBrbm93IHdoYXQgeW91IHNob3VsZCBkbz9cIiwgXCJVc2UgeW91ciBvd24hXCIsIFwiSGF2ZSBhIGdyZWF0IGRheSFcIl0sXG4gICAgICAgIHN0cmluZ3NFbGVtZW50OiBudWxsLFxuICAgICAgICAvLyB0eXBpbmcgc3BlZWRcbiAgICAgICAgdHlwZVNwZWVkOiAwLFxuICAgICAgICAvLyB0aW1lIGJlZm9yZSB0eXBpbmcgc3RhcnRzXG4gICAgICAgIHN0YXJ0RGVsYXk6IDAsXG4gICAgICAgIC8vIGJhY2tzcGFjaW5nIHNwZWVkXG4gICAgICAgIGJhY2tTcGVlZDogMCxcbiAgICAgICAgLy8gc2h1ZmZsZSB0aGUgc3RyaW5nc1xuICAgICAgICBzaHVmZmxlOiBmYWxzZSxcbiAgICAgICAgLy8gdGltZSBiZWZvcmUgYmFja3NwYWNpbmdcbiAgICAgICAgYmFja0RlbGF5OiA1MDAsXG4gICAgICAgIC8vIGxvb3BcbiAgICAgICAgbG9vcDogZmFsc2UsXG4gICAgICAgIC8vIGZhbHNlID0gaW5maW5pdGVcbiAgICAgICAgbG9vcENvdW50OiBmYWxzZSxcbiAgICAgICAgLy8gc2hvdyBjdXJzb3JcbiAgICAgICAgc2hvd0N1cnNvcjogdHJ1ZSxcbiAgICAgICAgLy8gY2hhcmFjdGVyIGZvciBjdXJzb3JcbiAgICAgICAgY3Vyc29yQ2hhcjogXCJ8XCIsXG4gICAgICAgIC8vIGF0dHJpYnV0ZSB0byB0eXBlIChudWxsID09IHRleHQpXG4gICAgICAgIGF0dHI6IG51bGwsXG4gICAgICAgIC8vIGVpdGhlciBodG1sIG9yIHRleHRcbiAgICAgICAgY29udGVudFR5cGU6ICdodG1sJyxcbiAgICAgICAgLy8gY2FsbCB3aGVuIGRvbmUgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIC8vIHN0YXJ0aW5nIGNhbGxiYWNrIGZ1bmN0aW9uIGJlZm9yZSBlYWNoIHN0cmluZ1xuICAgICAgICBwcmVTdHJpbmdUeXBlZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgLy9jYWxsYmFjayBmb3IgZXZlcnkgdHlwZWQgc3RyaW5nXG4gICAgICAgIG9uU3RyaW5nVHlwZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIC8vIGNhbGxiYWNrIGZvciByZXNldFxuICAgICAgICByZXNldENhbGxiYWNrOiBmdW5jdGlvbigpIHt9XG4gICAgfTtcblxuXG59KHdpbmRvdy5qUXVlcnkpOyJdLCJmaWxlIjoianF1ZXJ5LnR5cGVkLmpzIn0=
