(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.retinajs = factory());
}(this, (function () { 'use strict';

    var hasWindow = typeof window !== 'undefined';
    var environment = Math.round(hasWindow ? window.devicePixelRatio || 1 : 1);
    var srcReplace = /(\.[A-z]{3,4}\/?(\?.*)?)$/;
    var inlineReplace = /url\(('|")?([^)'"]+)('|")?\)/i;
    var selector = '[data-rjs]';
    var processedAttr = 'data-rjs-processed';
    function arrayify(object) {
        return Array.prototype.slice.call(object);
    }
    function chooseCap(cap) {
        var numericCap = parseInt(cap, 10);
        if (environment < numericCap) {
            return environment;
        } else {
            return numericCap;
        }
    }
    function forceOriginalDimensions(image) {
        if (!image.hasAttribute('data-no-resize')) {
            if (image.offsetWidth === 0 && image.offsetHeight === 0) {
                image.setAttribute('width', image.naturalWidth);
                image.setAttribute('height', image.naturalHeight);
            } else {
                image.setAttribute('width', image.offsetWidth);
                image.setAttribute('height', image.offsetHeight);
            }
        }
        return image;
    }
    function setSourceIfAvailable(image, retinaURL) {
        var imgType = image.nodeName.toLowerCase();
        var testImage = document.createElement('img');
        testImage.addEventListener('load', function () {
            if (imgType === 'img') {
                forceOriginalDimensions(image).setAttribute('src', retinaURL);
            } else {
                image.style.backgroundImage = 'url(' + retinaURL + ')';
            }
        });
        testImage.setAttribute('src', retinaURL);
        image.setAttribute(processedAttr, true);
    }
    function dynamicSwapImage(image, src) {
        var rjs = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
        var cap = chooseCap(rjs);
        if (src && cap > 1) {
            var newSrc = src.replace(srcReplace, '@' + cap + 'x$1');
            setSourceIfAvailable(image, newSrc);
        }
    }
    function manualSwapImage(image, src, hdsrc) {
        if (environment > 1) {
            setSourceIfAvailable(image, hdsrc);
        }
    }
    function getImages(images) {
        if (!images) {
            return typeof document !== 'undefined' ? arrayify(document.querySelectorAll(selector)) : [];
        } else {
            return typeof images.forEach === 'function' ? images : arrayify(images);
        }
    }
    function cleanBgImg(img) {
        return img.style.backgroundImage.replace(inlineReplace, '$2');
    }
    function retina(images) {
        getImages(images).forEach(function (img) {
            if (!img.getAttribute(processedAttr)) {
                var isImg = img.nodeName.toLowerCase() === 'img';
                var src = isImg ? img.getAttribute('src') : cleanBgImg(img);
                var rjs = img.getAttribute('data-rjs');
                var rjsIsNumber = !isNaN(parseInt(rjs, 10));
                if (rjs === null) {
                    return;
                }
                if (rjsIsNumber) {
                    dynamicSwapImage(img, src, rjs);
                } else {
                    manualSwapImage(img, src, rjs);
                }
            }
        });
    }
    if (hasWindow) {
        window.addEventListener('load', function () {
            retina();
        });
        window.retinajs = retina;
    }

    return retina;

})));
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXRpbmEuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gICAgICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gICAgICAgICAgICAoZ2xvYmFsLnJldGluYWpzID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGhhc1dpbmRvdyA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuICAgIHZhciBlbnZpcm9ubWVudCA9IE1hdGgucm91bmQoaGFzV2luZG93ID8gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSA6IDEpO1xuICAgIHZhciBzcmNSZXBsYWNlID0gLyhcXC5bQS16XXszLDR9XFwvPyhcXD8uKik/KSQvO1xuICAgIHZhciBpbmxpbmVSZXBsYWNlID0gL3VybFxcKCgnfFwiKT8oW14pJ1wiXSspKCd8XCIpP1xcKS9pO1xuICAgIHZhciBzZWxlY3RvciA9ICdbZGF0YS1yanNdJztcbiAgICB2YXIgcHJvY2Vzc2VkQXR0ciA9ICdkYXRhLXJqcy1wcm9jZXNzZWQnO1xuICAgIGZ1bmN0aW9uIGFycmF5aWZ5KG9iamVjdCkge1xuICAgICAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqZWN0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hvb3NlQ2FwKGNhcCkge1xuICAgICAgICB2YXIgbnVtZXJpY0NhcCA9IHBhcnNlSW50KGNhcCwgMTApO1xuICAgICAgICBpZiAoZW52aXJvbm1lbnQgPCBudW1lcmljQ2FwKSB7XG4gICAgICAgICAgICByZXR1cm4gZW52aXJvbm1lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbnVtZXJpY0NhcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBmb3JjZU9yaWdpbmFsRGltZW5zaW9ucyhpbWFnZSkge1xuICAgICAgICBpZiAoIWltYWdlLmhhc0F0dHJpYnV0ZSgnZGF0YS1uby1yZXNpemUnKSkge1xuICAgICAgICAgICAgaWYgKGltYWdlLm9mZnNldFdpZHRoID09PSAwICYmIGltYWdlLm9mZnNldEhlaWdodCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBpbWFnZS5uYXR1cmFsV2lkdGgpO1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgaW1hZ2UubmF0dXJhbEhlaWdodCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGltYWdlLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBpbWFnZS5vZmZzZXRXaWR0aCk7XG4gICAgICAgICAgICAgICAgaW1hZ2Uuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBpbWFnZS5vZmZzZXRIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbWFnZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2V0U291cmNlSWZBdmFpbGFibGUoaW1hZ2UsIHJldGluYVVSTCkge1xuICAgICAgICB2YXIgaW1nVHlwZSA9IGltYWdlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciB0ZXN0SW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICAgICAgdGVzdEltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoaW1nVHlwZSA9PT0gJ2ltZycpIHtcbiAgICAgICAgICAgICAgICBmb3JjZU9yaWdpbmFsRGltZW5zaW9ucyhpbWFnZSkuc2V0QXR0cmlidXRlKCdzcmMnLCByZXRpbmFVUkwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbWFnZS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSAndXJsKCcgKyByZXRpbmFVUkwgKyAnKSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0ZXN0SW1hZ2Uuc2V0QXR0cmlidXRlKCdzcmMnLCByZXRpbmFVUkwpO1xuICAgICAgICBpbWFnZS5zZXRBdHRyaWJ1dGUocHJvY2Vzc2VkQXR0ciwgdHJ1ZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGR5bmFtaWNTd2FwSW1hZ2UoaW1hZ2UsIHNyYykge1xuICAgICAgICB2YXIgcmpzID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiAxO1xuICAgICAgICB2YXIgY2FwID0gY2hvb3NlQ2FwKHJqcyk7XG4gICAgICAgIGlmIChzcmMgJiYgY2FwID4gMSkge1xuICAgICAgICAgICAgdmFyIG5ld1NyYyA9IHNyYy5yZXBsYWNlKHNyY1JlcGxhY2UsICdAJyArIGNhcCArICd4JDEnKTtcbiAgICAgICAgICAgIHNldFNvdXJjZUlmQXZhaWxhYmxlKGltYWdlLCBuZXdTcmMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1hbnVhbFN3YXBJbWFnZShpbWFnZSwgc3JjLCBoZHNyYykge1xuICAgICAgICBpZiAoZW52aXJvbm1lbnQgPiAxKSB7XG4gICAgICAgICAgICBzZXRTb3VyY2VJZkF2YWlsYWJsZShpbWFnZSwgaGRzcmMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdldEltYWdlcyhpbWFnZXMpIHtcbiAgICAgICAgaWYgKCFpbWFnZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gYXJyYXlpZnkoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpIDogW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIGltYWdlcy5mb3JFYWNoID09PSAnZnVuY3Rpb24nID8gaW1hZ2VzIDogYXJyYXlpZnkoaW1hZ2VzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBjbGVhbkJnSW1nKGltZykge1xuICAgICAgICByZXR1cm4gaW1nLnN0eWxlLmJhY2tncm91bmRJbWFnZS5yZXBsYWNlKGlubGluZVJlcGxhY2UsICckMicpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXRpbmEoaW1hZ2VzKSB7XG4gICAgICAgIGdldEltYWdlcyhpbWFnZXMpLmZvckVhY2goZnVuY3Rpb24gKGltZykge1xuICAgICAgICAgICAgaWYgKCFpbWcuZ2V0QXR0cmlidXRlKHByb2Nlc3NlZEF0dHIpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzSW1nID0gaW1nLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbWcnO1xuICAgICAgICAgICAgICAgIHZhciBzcmMgPSBpc0ltZyA/IGltZy5nZXRBdHRyaWJ1dGUoJ3NyYycpIDogY2xlYW5CZ0ltZyhpbWcpO1xuICAgICAgICAgICAgICAgIHZhciByanMgPSBpbWcuZ2V0QXR0cmlidXRlKCdkYXRhLXJqcycpO1xuICAgICAgICAgICAgICAgIHZhciByanNJc051bWJlciA9ICFpc05hTihwYXJzZUludChyanMsIDEwKSk7XG4gICAgICAgICAgICAgICAgaWYgKHJqcyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChyanNJc051bWJlcikge1xuICAgICAgICAgICAgICAgICAgICBkeW5hbWljU3dhcEltYWdlKGltZywgc3JjLCByanMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1hbnVhbFN3YXBJbWFnZShpbWcsIHNyYywgcmpzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaGFzV2luZG93KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0aW5hKCk7XG4gICAgICAgIH0pO1xuICAgICAgICB3aW5kb3cucmV0aW5hanMgPSByZXRpbmE7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldGluYTtcblxufSkpKTsiXSwiZmlsZSI6InJldGluYS5qcyJ9
