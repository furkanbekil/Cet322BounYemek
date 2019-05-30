/*! ===================================
 *  Author: Nazarkin Roman, Egor Dankov
 *  -----------------------------------
 *  PuzzleThemes
 *  =================================== */

'use strict';

/***********************************************
 * Google maps integration
 ***********************************************/
(function ($) {

    // select map placements
    var $mapPlaces = $('.sp-map-place');

    // map colour theme
    var gmapStyle = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#dddddd"},{"lightness":17}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"dddddd"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"off"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#555555"},{"lightness":20}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#aaaaaa"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#f4f4f4"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#f4f4f4"},{"lightness":17},{"weight":1.2}]}];

    // default rewritable map options
    var mapDefaultOptions = {
        zoom                 : 16,
        center               : {lat: 40.731607, lng:-73.997038},
        disableDefaultUI     : false,
        scrollwheel          : false,
        draggable            : true,
        styles               : gmapStyle,
        mapTypeControl       : false,
        navigationControl    : false,
        mapTypeId            : 'roadmap'
    };

    // init maps
    $mapPlaces.each(function() {
        var $map = $(this);
        var mapObj = new google.maps.Map($map.get(0), mapDefaultOptions);
        $map.data('gmap-object', mapObj);
    });

    // equip geocoder
    $mapPlaces.filter('[data-address]').each(function() {
        var $map = $(this),
            mapObj = $map.data('gmap-object'),
            geocoder = new google.maps.Geocoder();

        if (!mapObj || !geocoder) {
            return;
        }

        geocoder.geocode({'address': $map.data('address')}, function (results, status) {
            if (status !== google.maps.GeocoderStatus.OK) {
                console.error('Google Maps are unable to find location: ' + $map.data('address'), status, results);
                return;
            }

            var result = results[0];
            mapObj.setCenter(result.geometry.location);

            var infowindow = new google.maps.InfoWindow({
                content: '<b>' +result.formatted_address + '</b>',
                size   : new google.maps.Size(150, 50)
            });

            var marker = new google.maps.Marker({
                position: result.geometry.location,
                map     : mapObj,
                icon    : 'assets/images/map-pin.png',
                title   : $map.data('address')
            });

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(mapObj, marker);
            });
        });
    });

})(jQuery);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnb29nbGVfbWFwcy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqICBBdXRob3I6IE5hemFya2luIFJvbWFuLCBFZ29yIERhbmtvdlxuICogIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgUHV6emxlVGhlbWVzXG4gKiAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIEdvb2dsZSBtYXBzIGludGVncmF0aW9uXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4oZnVuY3Rpb24gKCQpIHtcblxuICAgIC8vIHNlbGVjdCBtYXAgcGxhY2VtZW50c1xuICAgIHZhciAkbWFwUGxhY2VzID0gJCgnLnNwLW1hcC1wbGFjZScpO1xuXG4gICAgLy8gbWFwIGNvbG91ciB0aGVtZVxuICAgIHZhciBnbWFwU3R5bGUgPSBbe1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNkZGRkZGRcIn0se1wibGlnaHRuZXNzXCI6MTd9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZjJmMmYyXCJ9LHtcImxpZ2h0bmVzc1wiOjIwfV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmZmZmZmZcIn0se1wibGlnaHRuZXNzXCI6Mjl9LHtcIndlaWdodFwiOjAuMn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5hcnRlcmlhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE4fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmxvY2FsXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmZmZmZmZcIn0se1wibGlnaHRuZXNzXCI6MTZ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZjVmNWY1XCJ9LHtcImxpZ2h0bmVzc1wiOjIxfV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2kucGFya1wiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCJkZGRkZGRcIn0se1wibGlnaHRuZXNzXCI6MjF9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn0se1wiY29sb3JcIjpcIiNmZmZmZmZcIn0se1wibGlnaHRuZXNzXCI6MTZ9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOjM2fSx7XCJjb2xvclwiOlwiIzU1NTU1NVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLmljb25cIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInRyYW5zaXRcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2FhYWFhYVwifSx7XCJsaWdodG5lc3NcIjoxOX1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZjRmNGY0XCJ9LHtcImxpZ2h0bmVzc1wiOjIwfV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y0ZjRmNFwifSx7XCJsaWdodG5lc3NcIjoxN30se1wid2VpZ2h0XCI6MS4yfV19XTtcblxuICAgIC8vIGRlZmF1bHQgcmV3cml0YWJsZSBtYXAgb3B0aW9uc1xuICAgIHZhciBtYXBEZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgICAgem9vbSAgICAgICAgICAgICAgICAgOiAxNixcbiAgICAgICAgY2VudGVyICAgICAgICAgICAgICAgOiB7bGF0OiA0MC43MzE2MDcsIGxuZzotNzMuOTk3MDM4fSxcbiAgICAgICAgZGlzYWJsZURlZmF1bHRVSSAgICAgOiBmYWxzZSxcbiAgICAgICAgc2Nyb2xsd2hlZWwgICAgICAgICAgOiBmYWxzZSxcbiAgICAgICAgZHJhZ2dhYmxlICAgICAgICAgICAgOiB0cnVlLFxuICAgICAgICBzdHlsZXMgICAgICAgICAgICAgICA6IGdtYXBTdHlsZSxcbiAgICAgICAgbWFwVHlwZUNvbnRyb2wgICAgICAgOiBmYWxzZSxcbiAgICAgICAgbmF2aWdhdGlvbkNvbnRyb2wgICAgOiBmYWxzZSxcbiAgICAgICAgbWFwVHlwZUlkICAgICAgICAgICAgOiAncm9hZG1hcCdcbiAgICB9O1xuXG4gICAgLy8gaW5pdCBtYXBzXG4gICAgJG1hcFBsYWNlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJG1hcCA9ICQodGhpcyk7XG4gICAgICAgIHZhciBtYXBPYmogPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKCRtYXAuZ2V0KDApLCBtYXBEZWZhdWx0T3B0aW9ucyk7XG4gICAgICAgICRtYXAuZGF0YSgnZ21hcC1vYmplY3QnLCBtYXBPYmopO1xuICAgIH0pO1xuXG4gICAgLy8gZXF1aXAgZ2VvY29kZXJcbiAgICAkbWFwUGxhY2VzLmZpbHRlcignW2RhdGEtYWRkcmVzc10nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJG1hcCA9ICQodGhpcyksXG4gICAgICAgICAgICBtYXBPYmogPSAkbWFwLmRhdGEoJ2dtYXAtb2JqZWN0JyksXG4gICAgICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgICAgIGlmICghbWFwT2JqIHx8ICFnZW9jb2Rlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7J2FkZHJlc3MnOiAkbWFwLmRhdGEoJ2FkZHJlc3MnKX0sIGZ1bmN0aW9uIChyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgIT09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignR29vZ2xlIE1hcHMgYXJlIHVuYWJsZSB0byBmaW5kIGxvY2F0aW9uOiAnICsgJG1hcC5kYXRhKCdhZGRyZXNzJyksIHN0YXR1cywgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcmVzdWx0c1swXTtcbiAgICAgICAgICAgIG1hcE9iai5zZXRDZW50ZXIocmVzdWx0Lmdlb21ldHJ5LmxvY2F0aW9uKTtcblxuICAgICAgICAgICAgdmFyIGluZm93aW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7XG4gICAgICAgICAgICAgICAgY29udGVudDogJzxiPicgK3Jlc3VsdC5mb3JtYXR0ZWRfYWRkcmVzcyArICc8L2I+JyxcbiAgICAgICAgICAgICAgICBzaXplICAgOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSgxNTAsIDUwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogcmVzdWx0Lmdlb21ldHJ5LmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgIG1hcCAgICAgOiBtYXBPYmosXG4gICAgICAgICAgICAgICAgaWNvbiAgICA6ICdhc3NldHMvaW1hZ2VzL21hcC1waW4ucG5nJyxcbiAgICAgICAgICAgICAgICB0aXRsZSAgIDogJG1hcC5kYXRhKCdhZGRyZXNzJylcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpbmZvd2luZG93Lm9wZW4obWFwT2JqLCBtYXJrZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KShqUXVlcnkpOyJdLCJmaWxlIjoiZ29vZ2xlX21hcHMuanMifQ==
