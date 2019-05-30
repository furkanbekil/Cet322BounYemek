/*! Swipebox v1.4.4 | Constantin Saguin csag.co | MIT License | github.com/brutaldesign/swipebox */

( function ( window, document, $, undefined ) {

	$.swipebox = function( elem, options ) {

		// Default options
		var ui,
			defaults = {
				useCSS : true,
				useSVG : true,
				initialIndexOnArray : 0,
				removeBarsOnMobile : true,
				hideCloseButtonOnMobile : false,
				hideBarsDelay : 3000,
				videoMaxWidth : 1140,
				vimeoColor : 'cccccc',
				beforeOpen: null,
				afterOpen: null,
				afterClose: null,
				afterMedia: null,
				nextSlide: null,
				prevSlide: null,
				loopAtEnd: false,
				autoplayVideos: false,
				queryStringData: {},
				toggleClassOnLoad: ''
			},

			plugin = this,
			elements = [], // slides array [ { href:'...', title:'...' }, ...],
			$elem,
			selector = elem.selector,
			isMobile = navigator.userAgent.match( /(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i ),
			isTouch = isMobile !== null || document.createTouch !== undefined || ( 'ontouchstart' in window ) || ( 'onmsgesturechange' in window ) || navigator.msMaxTouchPoints,
			supportSVG = !! document.createElementNS && !! document.createElementNS( 'http://www.w3.org/2000/svg', 'svg').createSVGRect,
			winWidth = window.innerWidth ? window.innerWidth : $( window ).width(),
			winHeight = window.innerHeight ? window.innerHeight : $( window ).height(),
			currentX = 0,
			/* jshint multistr: true */
			html = '<div id="swipebox-overlay">\
					<div id="swipebox-container">\
						<div id="swipebox-slider"></div>\
						<div id="swipebox-top-bar">\
							<div id="swipebox-title"></div>\
						</div>\
						<div id="swipebox-bottom-bar">\
							<div id="swipebox-arrows">\
								<a id="swipebox-prev"></a>\
								<a id="swipebox-next"></a>\
							</div>\
						</div>\
						<a id="swipebox-close"></a>\
					</div>\
			</div>';

		plugin.settings = {};

		$.swipebox.close = function () {
			ui.closeSlide();
		};

		$.swipebox.extend = function () {
			return ui;
		};

		plugin.init = function() {

			plugin.settings = $.extend( {}, defaults, options );

			if ( $.isArray( elem ) ) {

				elements = elem;
				ui.target = $( window );
				ui.init( plugin.settings.initialIndexOnArray );

			} else {

				$( document ).on( 'click', selector, function( event ) {

					// console.log( isTouch );

					if ( event.target.parentNode.className === 'slide current' ) {

						return false;
					}

					if ( ! $.isArray( elem ) ) {
						ui.destroy();
						$elem = $( selector );
						ui.actions();
					}

					elements = [];
					var index, relType, relVal;

					// Allow for HTML5 compliant attribute before legacy use of rel
					if ( ! relVal ) {
						relType = 'data-rel';
						relVal = $( this ).attr( relType );
					}

					if ( ! relVal ) {
						relType = 'rel';
						relVal = $( this ).attr( relType );
					}

					if ( relVal && relVal !== '' && relVal !== 'nofollow' ) {
						$elem = $( selector ).filter( '[' + relType + '="' + relVal + '"]' );
					} else {
						$elem = $( selector );
					}

					$elem.each( function() {

						var title = null,
							href = null;

						if ( $( this ).attr( 'title' ) ) {
							title = $( this ).attr( 'title' );
						}


						if ( $( this ).attr( 'href' ) ) {
							href = $( this ).attr( 'href' );
						}

						elements.push( {
							href: href,
							title: title
						} );
					} );

					index = $elem.index( $( this ) );
					event.preventDefault();
					event.stopPropagation();
					ui.target = $( event.target );
					ui.init( index );
				} );
			}
		};

		ui = {

			/**
			 * Initiate Swipebox
			 */
			init : function( index ) {
				if ( plugin.settings.beforeOpen ) {
					plugin.settings.beforeOpen();
				}
				this.target.trigger( 'swipebox-start' );
				$.swipebox.isOpen = true;
				this.build();
				this.openSlide( index );
				this.openMedia( index );
				this.preloadMedia( index+1 );
				this.preloadMedia( index-1 );
				if ( plugin.settings.afterOpen ) {
					plugin.settings.afterOpen(index);
				}
			},

			/**
			 * Built HTML containers and fire main functions
			 */
			build : function () {
				var $this = this, bg;

				$( 'body' ).append( html );

				if ( supportSVG && plugin.settings.useSVG === true ) {
					bg = $( '#swipebox-close' ).css( 'background-image' );
					bg = bg.replace( 'png', 'svg' );
					$( '#swipebox-prev, #swipebox-next, #swipebox-close' ).css( {
						'background-image' : bg
					} );
				}

				if ( isMobile && plugin.settings.removeBarsOnMobile ) {
					$( '#swipebox-bottom-bar, #swipebox-top-bar' ).remove();
				}

				$.each( elements,  function() {
					$( '#swipebox-slider' ).append( '<div class="slide"></div>' );
				} );

				$this.setDim();
				$this.actions();

				if ( isTouch ) {
					$this.gesture();
				}

				// Devices can have both touch and keyboard input so always allow key events
				$this.keyboard();

				$this.animBars();
				$this.resize();

			},

			/**
			 * Set dimensions depending on windows width and height
			 */
			setDim : function () {

				var width, height, sliderCss = {};

				// Reset dimensions on mobile orientation change
				if ( 'onorientationchange' in window ) {

					window.addEventListener( 'orientationchange', function() {
						if ( window.orientation === 0 ) {
							width = winWidth;
							height = winHeight;
						} else if ( window.orientation === 90 || window.orientation === -90 ) {
							width = winHeight;
							height = winWidth;
						}
					}, false );


				} else {

					width = window.innerWidth ? window.innerWidth : $( window ).width();
					height = window.innerHeight ? window.innerHeight : $( window ).height();
				}

				sliderCss = {
					width : width,
					height : height
				};

				$( '#swipebox-overlay' ).css( sliderCss );

			},

			/**
			 * Reset dimensions on window resize envent
			 */
			resize : function () {
				var $this = this;

				$( window ).resize( function() {
					$this.setDim();
				} ).resize();
			},

			/**
			 * Check if device supports CSS transitions
			 */
			supportTransition : function () {

				var prefixes = 'transition WebkitTransition MozTransition OTransition msTransition KhtmlTransition'.split( ' ' ),
					i;

				for ( i = 0; i < prefixes.length; i++ ) {
					if ( document.createElement( 'div' ).style[ prefixes[i] ] !== undefined ) {
						return prefixes[i];
					}
				}
				return false;
			},

			/**
			 * Check if CSS transitions are allowed (options + devicesupport)
			 */
			doCssTrans : function () {
				if ( plugin.settings.useCSS && this.supportTransition() ) {
					return true;
				}
			},

			/**
			 * Touch navigation
			 */
			gesture : function () {

				var $this = this,
					index,
					hDistance,
					vDistance,
					hDistanceLast,
					vDistanceLast,
					hDistancePercent,
					vSwipe = false,
					hSwipe = false,
					hSwipMinDistance = 10,
					vSwipMinDistance = 50,
					startCoords = {},
					endCoords = {},
					bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' ),
					slider = $( '#swipebox-slider' );

				bars.addClass( 'visible-bars' );
				$this.setTimeout();

				$( 'body' ).bind( 'touchstart', function( event ) {

					$( this ).addClass( 'touching' );
					index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
					endCoords = event.originalEvent.targetTouches[0];
					startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
					startCoords.pageY = event.originalEvent.targetTouches[0].pageY;

					$( '#swipebox-slider' ).css( {
						'-webkit-transform' : 'translate3d(' + currentX +'%, 0, 0)',
						'transform' : 'translate3d(' + currentX + '%, 0, 0)'
					} );

					$( '.touching' ).bind( 'touchmove',function( event ) {
						event.preventDefault();
						event.stopPropagation();
						endCoords = event.originalEvent.targetTouches[0];

						if ( ! hSwipe ) {
							vDistanceLast = vDistance;
							vDistance = endCoords.pageY - startCoords.pageY;
							if ( Math.abs( vDistance ) >= vSwipMinDistance || vSwipe ) {
								var opacity = 0.75 - Math.abs(vDistance) / slider.height();

								slider.css( { 'top': vDistance + 'px' } );
								slider.css( { 'opacity': opacity } );

								vSwipe = true;
							}
						}

						hDistanceLast = hDistance;
						hDistance = endCoords.pageX - startCoords.pageX;
						hDistancePercent = hDistance * 100 / winWidth;

						if ( ! hSwipe && ! vSwipe && Math.abs( hDistance ) >= hSwipMinDistance ) {
							$( '#swipebox-slider' ).css( {
								'-webkit-transition' : '',
								'transition' : ''
							} );
							hSwipe = true;
						}

						if ( hSwipe ) {

							// swipe left
							if ( 0 < hDistance ) {

								// first slide
								if ( 0 === index ) {
									// console.log( 'first' );
									$( '#swipebox-overlay' ).addClass( 'leftSpringTouch' );
								} else {
									// Follow gesture
									$( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
									$( '#swipebox-slider' ).css( {
										'-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
									} );
								}

							// swipe rught
							} else if ( 0 > hDistance ) {

								// last Slide
								if ( elements.length === index +1 ) {
									// console.log( 'last' );
									$( '#swipebox-overlay' ).addClass( 'rightSpringTouch' );
								} else {
									$( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
									$( '#swipebox-slider' ).css( {
										'-webkit-transform' : 'translate3d(' + ( currentX + hDistancePercent ) +'%, 0, 0)',
										'transform' : 'translate3d(' + ( currentX + hDistancePercent ) + '%, 0, 0)'
									} );
								}

							}
						}
					} );

					return false;

				} ).bind( 'touchend',function( event ) {
					event.preventDefault();
					event.stopPropagation();

					$( '#swipebox-slider' ).css( {
						'-webkit-transition' : '-webkit-transform 0.4s ease',
						'transition' : 'transform 0.4s ease'
					} );

					vDistance = endCoords.pageY - startCoords.pageY;
					hDistance = endCoords.pageX - startCoords.pageX;
					hDistancePercent = hDistance*100/winWidth;

					// Swipe to bottom to close
					if ( vSwipe ) {
						vSwipe = false;
						if ( Math.abs( vDistance ) >= 2 * vSwipMinDistance && Math.abs( vDistance ) > Math.abs( vDistanceLast ) ) {
							var vOffset = vDistance > 0 ? slider.height() : - slider.height();
							slider.animate( { top: vOffset + 'px', 'opacity': 0 },
								300,
								function () {
									$this.closeSlide();
								} );
						} else {
							slider.animate( { top: 0, 'opacity': 1 }, 300 );
						}

					} else if ( hSwipe ) {

						hSwipe = false;

						// swipeLeft
						if( hDistance >= hSwipMinDistance && hDistance >= hDistanceLast) {

							$this.getPrev();

						// swipeRight
						} else if ( hDistance <= -hSwipMinDistance && hDistance <= hDistanceLast) {

							$this.getNext();
						}

					} else { // Top and bottom bars have been removed on touchable devices
						// tap
						if ( ! bars.hasClass( 'visible-bars' ) ) {
							$this.showBars();
							$this.setTimeout();
						} else {
							$this.clearTimeout();
							$this.hideBars();
						}
					}

					$( '#swipebox-slider' ).css( {
						'-webkit-transform' : 'translate3d(' + currentX + '%, 0, 0)',
						'transform' : 'translate3d(' + currentX + '%, 0, 0)'
					} );

					$( '#swipebox-overlay' ).removeClass( 'leftSpringTouch' ).removeClass( 'rightSpringTouch' );
					$( '.touching' ).off( 'touchmove' ).removeClass( 'touching' );

				} );
			},

			/**
			 * Set timer to hide the action bars
			 */
			setTimeout: function () {
				if ( plugin.settings.hideBarsDelay > 0 ) {
					var $this = this;
					$this.clearTimeout();
					$this.timeout = window.setTimeout( function() {
							$this.hideBars();
						},

						plugin.settings.hideBarsDelay
					);
				}
			},

			/**
			 * Clear timer
			 */
			clearTimeout: function () {
				window.clearTimeout( this.timeout );
				this.timeout = null;
			},

			/**
			 * Show navigation and title bars
			 */
			showBars : function () {
				var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );
				if ( this.doCssTrans() ) {
					bars.addClass( 'visible-bars' );
				} else {
					$( '#swipebox-top-bar' ).animate( { top : 0 }, 500 );
					$( '#swipebox-bottom-bar' ).animate( { bottom : 0 }, 500 );
					setTimeout( function() {
						bars.addClass( 'visible-bars' );
					}, 1000 );
				}
			},

			/**
			 * Hide navigation and title bars
			 */
			hideBars : function () {
				var bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );
				if ( this.doCssTrans() ) {
					bars.removeClass( 'visible-bars' );
				} else {
					$( '#swipebox-top-bar' ).animate( { top : '-50px' }, 500 );
					$( '#swipebox-bottom-bar' ).animate( { bottom : '-50px' }, 500 );
					setTimeout( function() {
						bars.removeClass( 'visible-bars' );
					}, 1000 );
				}
			},

			/**
			 * Animate navigation and top bars
			 */
			animBars : function () {
				var $this = this,
					bars = $( '#swipebox-top-bar, #swipebox-bottom-bar' );

				bars.addClass( 'visible-bars' );
				$this.setTimeout();

				$( '#swipebox-slider' ).click( function() {
					if ( ! bars.hasClass( 'visible-bars' ) ) {
						$this.showBars();
						$this.setTimeout();
					}
				} );

				$( '#swipebox-bottom-bar' ).hover( function() {
					$this.showBars();
					bars.addClass( 'visible-bars' );
					$this.clearTimeout();

				}, function() {
					if ( plugin.settings.hideBarsDelay > 0 ) {
						bars.removeClass( 'visible-bars' );
						$this.setTimeout();
					}

				} );
			},

			/**
			 * Keyboard navigation
			 */
			keyboard : function () {
				var $this = this;
				$( window ).bind( 'keyup', function( event ) {
					event.preventDefault();
					event.stopPropagation();

					if ( event.keyCode === 37 ) {

						$this.getPrev();

					} else if ( event.keyCode === 39 ) {

						$this.getNext();

					} else if ( event.keyCode === 27 ) {

						$this.closeSlide();
					}
				} );
			},

			/**
			 * Navigation events : go to next slide, go to prevous slide and close
			 */
			actions : function () {
				var $this = this,
					action = 'touchend click'; // Just detect for both event types to allow for multi-input

				if ( elements.length < 2 ) {

					$( '#swipebox-bottom-bar' ).hide();

					if ( undefined === elements[ 1 ] ) {
						$( '#swipebox-top-bar' ).hide();
					}

				} else {
					$( '#swipebox-prev' ).bind( action, function( event ) {
						event.preventDefault();
						event.stopPropagation();
						$this.getPrev();
						$this.setTimeout();
					} );

					$( '#swipebox-next' ).bind( action, function( event ) {
						event.preventDefault();
						event.stopPropagation();
						$this.getNext();
						$this.setTimeout();
					} );
				}

				$( '#swipebox-close' ).bind( action, function() {
					$this.closeSlide();
				} );
			},

			/**
			 * Set current slide
			 */
			setSlide : function ( index, isFirst ) {

				isFirst = isFirst || false;

				var slider = $( '#swipebox-slider' );

				currentX = -index*100;

				if ( this.doCssTrans() ) {
					slider.css( {
						'-webkit-transform' : 'translate3d(' + (-index*100)+'%, 0, 0)',
						'transform' : 'translate3d(' + (-index*100)+'%, 0, 0)'
					} );
				} else {
					slider.animate( { left : ( -index*100 )+'%' } );
				}

				$( '#swipebox-slider .slide' ).removeClass( 'current' );
				$( '#swipebox-slider .slide' ).eq( index ).addClass( 'current' );
				this.setTitle( index );

				if ( isFirst ) {
					slider.fadeIn();
				}

				$( '#swipebox-prev, #swipebox-next' ).removeClass( 'disabled' );

				if ( index === 0 ) {
					$( '#swipebox-prev' ).addClass( 'disabled' );
				} else if ( index === elements.length - 1 && plugin.settings.loopAtEnd !== true ) {
					$( '#swipebox-next' ).addClass( 'disabled' );
				}
			},

			/**
			 * Open slide
			 */
			openSlide : function ( index ) {
				$( 'html' ).addClass( 'swipebox-html' );
				if ( isTouch ) {
					$( 'html' ).addClass( 'swipebox-touch' );

					if ( plugin.settings.hideCloseButtonOnMobile ) {
						$( 'html' ).addClass( 'swipebox-no-close-button' );
					}
				} else {
					$( 'html' ).addClass( 'swipebox-no-touch' );
				}
				$( window ).trigger( 'resize' ); // fix scroll bar visibility on desktop
				this.setSlide( index, true );
			},

			/**
			 * Set a time out if the media is a video
			 */
			preloadMedia : function ( index ) {
				var $this = this,
					src = null;

				if ( elements[ index ] !== undefined ) {
					src = elements[ index ].href;
				}

				if ( ! $this.isVideo( src ) ) {
					setTimeout( function() {
						$this.openMedia( index );
					}, 1000);
				} else {
					$this.openMedia( index );
				}
			},

			/**
			 * Open
			 */
			openMedia : function ( index ) {
				var $this = this,
					src,
					slide;

				if ( elements[ index ] !== undefined ) {
					src = elements[ index ].href;
				}

				if ( index < 0 || index >= elements.length ) {
					return false;
				}

				slide = $( '#swipebox-slider .slide' ).eq( index );

				if ( ! $this.isVideo( src ) ) {
					slide.addClass( 'slide-loading' );
					$this.loadMedia( src, function() {
						slide.removeClass( 'slide-loading' );
						slide.html( this );

						if ( plugin.settings.afterMedia ) {
							plugin.settings.afterMedia( index );
						}
					} );
				} else {
					slide.html( $this.getVideo( src ) );

					if ( plugin.settings.afterMedia ) {
						plugin.settings.afterMedia( index );
					}
				}

			},

			/**
			 * Set link title attribute as caption
			 */
			setTitle : function ( index ) {
				var title = null;

				$( '#swipebox-title' ).empty();

				if ( elements[ index ] !== undefined ) {
					title = elements[ index ].title;
				}

				if ( title ) {
					$( '#swipebox-top-bar' ).show();
					$( '#swipebox-title' ).append( title );
				} else {
					$( '#swipebox-top-bar' ).hide();
				}
			},

			/**
			 * Check if the URL is a video
			 */
			isVideo : function ( src ) {

				if ( src ) {
					if ( src.match( /(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) || src.match( /vimeo\.com\/([0-9]*)/ ) || src.match( /youtu\.be\/([a-zA-Z0-9\-_]+)/ ) ) {
						return true;
					}

					if ( src.toLowerCase().indexOf( 'swipeboxvideo=1' ) >= 0 ) {

						return true;
					}
				}

			},

			/**
			 * Parse URI querystring and:
			 * - overrides value provided via dictionary
			 * - rebuild it again returning a string
			 */
			parseUri : function (uri, customData) {
				var a = document.createElement('a'),
					qs = {};

				// Decode the URI
				a.href = decodeURIComponent( uri );

				// QueryString to Object
				if ( a.search ) {
					qs = JSON.parse( '{"' + a.search.toLowerCase().replace('?','').replace(/&/g,'","').replace(/=/g,'":"') + '"}' );
				}
				
				// Extend with custom data
				if ( $.isPlainObject( customData ) ) {
					qs = $.extend( qs, customData, plugin.settings.queryStringData ); // The dev has always the final word
				}

				// Return querystring as a string
				return $
					.map( qs, function (val, key) {
						if ( val && val > '' ) {
							return encodeURIComponent( key ) + '=' + encodeURIComponent( val );
						}
					})
					.join('&');
			},

			/**
			 * Get video iframe code from URL
			 */
			getVideo : function( url ) {
				var iframe = '',
					youtubeUrl = url.match( /((?:www\.)?youtube\.com|(?:www\.)?youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/ ),
					youtubeShortUrl = url.match(/(?:www\.)?youtu\.be\/([a-zA-Z0-9\-_]+)/),
					vimeoUrl = url.match( /(?:www\.)?vimeo\.com\/([0-9]*)/ ),
					qs = '';
				if ( youtubeUrl || youtubeShortUrl) {
					if ( youtubeShortUrl ) {
						youtubeUrl = youtubeShortUrl;
					}
					qs = ui.parseUri( url, {
						'autoplay' : ( plugin.settings.autoplayVideos ? '1' : '0' ),
						'v' : ''
					});
					iframe = '<iframe width="560" height="315" src="//' + youtubeUrl[1] + '/embed/' + youtubeUrl[2] + '?' + qs + '" frameborder="0" allowfullscreen></iframe>';

				} else if ( vimeoUrl ) {
					qs = ui.parseUri( url, {
						'autoplay' : ( plugin.settings.autoplayVideos ? '1' : '0' ),
						'byline' : '0',
						'portrait' : '0',
						'color': plugin.settings.vimeoColor
					});
					iframe = '<iframe width="560" height="315"  src="//player.vimeo.com/video/' + vimeoUrl[1] + '?' + qs + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';

				} else {
					iframe = '<iframe width="560" height="315" src="' + url + '" frameborder="0" allowfullscreen></iframe>';
				}

				return '<div class="swipebox-video-container" style="max-width:' + plugin.settings.videoMaxWidth + 'px"><div class="swipebox-video">' + iframe + '</div></div>';
			},

			/**
			 * Load image
			 */
			loadMedia : function ( src, callback ) {
                // Inline content
                if ( src.trim().indexOf('#') === 0 ) {
                    callback.call(
                    	$('<div>', {
                    		'class' : 'swipebox-inline-container'
                    	})
                    	.append(
                    		$(src)
	                    	.clone()
	                    	.toggleClass( plugin.settings.toggleClassOnLoad )
	                    )
                    );
                }
                // Everything else
                else {
    				if ( ! this.isVideo( src ) ) {
    					var img = $( '<img>' ).on( 'load', function() {
    						callback.call( img );
    					} );

    					img.attr( 'src', src );
    				}
                }
			},

			/**
			 * Get next slide
			 */
			getNext : function () {
				var $this = this,
					src,
					index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) );
				if ( index + 1 < elements.length ) {

					src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src' );
					$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
					index++;
					$this.setSlide( index );
					$this.preloadMedia( index+1 );
					if ( plugin.settings.nextSlide ) {
						plugin.settings.nextSlide(index);
					}
				} else {

					if ( plugin.settings.loopAtEnd === true ) {
						src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src' );
						$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
						index = 0;
						$this.preloadMedia( index );
						$this.setSlide( index );
						$this.preloadMedia( index + 1 );
						if ( plugin.settings.nextSlide ) {
							plugin.settings.nextSlide(index);
						}
					} else {
						$( '#swipebox-overlay' ).addClass( 'rightSpring' );
						setTimeout( function() {
							$( '#swipebox-overlay' ).removeClass( 'rightSpring' );
						}, 500 );
					}
				}
			},

			/**
			 * Get previous slide
			 */
			getPrev : function () {
				var index = $( '#swipebox-slider .slide' ).index( $( '#swipebox-slider .slide.current' ) ),
					src;
				if ( index > 0 ) {
					src = $( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe').attr( 'src' );
					$( '#swipebox-slider .slide' ).eq( index ).contents().find( 'iframe' ).attr( 'src', src );
					index--;
					this.setSlide( index );
					this.preloadMedia( index-1 );
					if ( plugin.settings.prevSlide ) {
						plugin.settings.prevSlide(index);
					}
				} else {
					$( '#swipebox-overlay' ).addClass( 'leftSpring' );
					setTimeout( function() {
						$( '#swipebox-overlay' ).removeClass( 'leftSpring' );
					}, 500 );
				}
			},
			/* jshint unused:false */
			nextSlide : function ( index ) {
				// Callback for next slide
			},

			prevSlide : function ( index ) {
				// Callback for prev slide
			},

			/**
			 * Close
			 */
			closeSlide : function () {
				$( 'html' ).removeClass( 'swipebox-html' );
				$( 'html' ).removeClass( 'swipebox-touch' );
				$( window ).trigger( 'resize' );
				this.destroy();
			},

			/**
			 * Destroy the whole thing
			 */
			destroy : function () {
				$( window ).unbind( 'keyup' );
				$( 'body' ).unbind( 'touchstart' );
				$( 'body' ).unbind( 'touchmove' );
				$( 'body' ).unbind( 'touchend' );
				$( '#swipebox-slider' ).unbind();
				$( '#swipebox-overlay' ).remove();

				if ( ! $.isArray( elem ) ) {
					elem.removeData( '_swipebox' );
				}

				if ( this.target ) {
					this.target.trigger( 'swipebox-destroy' );
				}

				$.swipebox.isOpen = false;

				if ( plugin.settings.afterClose ) {
					plugin.settings.afterClose();
				}
			}
		};

		plugin.init();
	};

	$.fn.swipebox = function( options ) {

		if ( ! $.data( this, '_swipebox' ) ) {
			var swipebox = new $.swipebox( this, options );
			this.data( '_swipebox', swipebox );
		}
		return this.data( '_swipebox' );

	};

}( window, document, jQuery ) );

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkuc3dpcGVib3guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohIFN3aXBlYm94IHYxLjQuNCB8IENvbnN0YW50aW4gU2FndWluIGNzYWcuY28gfCBNSVQgTGljZW5zZSB8IGdpdGh1Yi5jb20vYnJ1dGFsZGVzaWduL3N3aXBlYm94ICovXG5cbiggZnVuY3Rpb24gKCB3aW5kb3csIGRvY3VtZW50LCAkLCB1bmRlZmluZWQgKSB7XG5cblx0JC5zd2lwZWJveCA9IGZ1bmN0aW9uKCBlbGVtLCBvcHRpb25zICkge1xuXG5cdFx0Ly8gRGVmYXVsdCBvcHRpb25zXG5cdFx0dmFyIHVpLFxuXHRcdFx0ZGVmYXVsdHMgPSB7XG5cdFx0XHRcdHVzZUNTUyA6IHRydWUsXG5cdFx0XHRcdHVzZVNWRyA6IHRydWUsXG5cdFx0XHRcdGluaXRpYWxJbmRleE9uQXJyYXkgOiAwLFxuXHRcdFx0XHRyZW1vdmVCYXJzT25Nb2JpbGUgOiB0cnVlLFxuXHRcdFx0XHRoaWRlQ2xvc2VCdXR0b25Pbk1vYmlsZSA6IGZhbHNlLFxuXHRcdFx0XHRoaWRlQmFyc0RlbGF5IDogMzAwMCxcblx0XHRcdFx0dmlkZW9NYXhXaWR0aCA6IDExNDAsXG5cdFx0XHRcdHZpbWVvQ29sb3IgOiAnY2NjY2NjJyxcblx0XHRcdFx0YmVmb3JlT3BlbjogbnVsbCxcblx0XHRcdFx0YWZ0ZXJPcGVuOiBudWxsLFxuXHRcdFx0XHRhZnRlckNsb3NlOiBudWxsLFxuXHRcdFx0XHRhZnRlck1lZGlhOiBudWxsLFxuXHRcdFx0XHRuZXh0U2xpZGU6IG51bGwsXG5cdFx0XHRcdHByZXZTbGlkZTogbnVsbCxcblx0XHRcdFx0bG9vcEF0RW5kOiBmYWxzZSxcblx0XHRcdFx0YXV0b3BsYXlWaWRlb3M6IGZhbHNlLFxuXHRcdFx0XHRxdWVyeVN0cmluZ0RhdGE6IHt9LFxuXHRcdFx0XHR0b2dnbGVDbGFzc09uTG9hZDogJydcblx0XHRcdH0sXG5cblx0XHRcdHBsdWdpbiA9IHRoaXMsXG5cdFx0XHRlbGVtZW50cyA9IFtdLCAvLyBzbGlkZXMgYXJyYXkgWyB7IGhyZWY6Jy4uLicsIHRpdGxlOicuLi4nIH0sIC4uLl0sXG5cdFx0XHQkZWxlbSxcblx0XHRcdHNlbGVjdG9yID0gZWxlbS5zZWxlY3Rvcixcblx0XHRcdGlzTW9iaWxlID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCggLyhpUGFkKXwoaVBob25lKXwoaVBvZCl8KEFuZHJvaWQpfChQbGF5Qm9vayl8KEJCMTApfChCbGFja0JlcnJ5KXwoT3BlcmEgTWluaSl8KElFTW9iaWxlKXwod2ViT1MpfChNZWVHbykvaSApLFxuXHRcdFx0aXNUb3VjaCA9IGlzTW9iaWxlICE9PSBudWxsIHx8IGRvY3VtZW50LmNyZWF0ZVRvdWNoICE9PSB1bmRlZmluZWQgfHwgKCAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgKSB8fCAoICdvbm1zZ2VzdHVyZWNoYW5nZScgaW4gd2luZG93ICkgfHwgbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMsXG5cdFx0XHRzdXBwb3J0U1ZHID0gISEgZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TICYmICEhIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgJ3N2ZycpLmNyZWF0ZVNWR1JlY3QsXG5cdFx0XHR3aW5XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoID8gd2luZG93LmlubmVyV2lkdGggOiAkKCB3aW5kb3cgKS53aWR0aCgpLFxuXHRcdFx0d2luSGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0ID8gd2luZG93LmlubmVySGVpZ2h0IDogJCggd2luZG93ICkuaGVpZ2h0KCksXG5cdFx0XHRjdXJyZW50WCA9IDAsXG5cdFx0XHQvKiBqc2hpbnQgbXVsdGlzdHI6IHRydWUgKi9cblx0XHRcdGh0bWwgPSAnPGRpdiBpZD1cInN3aXBlYm94LW92ZXJsYXlcIj5cXFxuXHRcdFx0XHRcdDxkaXYgaWQ9XCJzd2lwZWJveC1jb250YWluZXJcIj5cXFxuXHRcdFx0XHRcdFx0PGRpdiBpZD1cInN3aXBlYm94LXNsaWRlclwiPjwvZGl2PlxcXG5cdFx0XHRcdFx0XHQ8ZGl2IGlkPVwic3dpcGVib3gtdG9wLWJhclwiPlxcXG5cdFx0XHRcdFx0XHRcdDxkaXYgaWQ9XCJzd2lwZWJveC10aXRsZVwiPjwvZGl2PlxcXG5cdFx0XHRcdFx0XHQ8L2Rpdj5cXFxuXHRcdFx0XHRcdFx0PGRpdiBpZD1cInN3aXBlYm94LWJvdHRvbS1iYXJcIj5cXFxuXHRcdFx0XHRcdFx0XHQ8ZGl2IGlkPVwic3dpcGVib3gtYXJyb3dzXCI+XFxcblx0XHRcdFx0XHRcdFx0XHQ8YSBpZD1cInN3aXBlYm94LXByZXZcIj48L2E+XFxcblx0XHRcdFx0XHRcdFx0XHQ8YSBpZD1cInN3aXBlYm94LW5leHRcIj48L2E+XFxcblx0XHRcdFx0XHRcdFx0PC9kaXY+XFxcblx0XHRcdFx0XHRcdDwvZGl2PlxcXG5cdFx0XHRcdFx0XHQ8YSBpZD1cInN3aXBlYm94LWNsb3NlXCI+PC9hPlxcXG5cdFx0XHRcdFx0PC9kaXY+XFxcblx0XHRcdDwvZGl2Pic7XG5cblx0XHRwbHVnaW4uc2V0dGluZ3MgPSB7fTtcblxuXHRcdCQuc3dpcGVib3guY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR1aS5jbG9zZVNsaWRlKCk7XG5cdFx0fTtcblxuXHRcdCQuc3dpcGVib3guZXh0ZW5kID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHVpO1xuXHRcdH07XG5cblx0XHRwbHVnaW4uaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRwbHVnaW4uc2V0dGluZ3MgPSAkLmV4dGVuZCgge30sIGRlZmF1bHRzLCBvcHRpb25zICk7XG5cblx0XHRcdGlmICggJC5pc0FycmF5KCBlbGVtICkgKSB7XG5cblx0XHRcdFx0ZWxlbWVudHMgPSBlbGVtO1xuXHRcdFx0XHR1aS50YXJnZXQgPSAkKCB3aW5kb3cgKTtcblx0XHRcdFx0dWkuaW5pdCggcGx1Z2luLnNldHRpbmdzLmluaXRpYWxJbmRleE9uQXJyYXkgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQkKCBkb2N1bWVudCApLm9uKCAnY2xpY2snLCBzZWxlY3RvciwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coIGlzVG91Y2ggKTtcblxuXHRcdFx0XHRcdGlmICggZXZlbnQudGFyZ2V0LnBhcmVudE5vZGUuY2xhc3NOYW1lID09PSAnc2xpZGUgY3VycmVudCcgKSB7XG5cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoICEgJC5pc0FycmF5KCBlbGVtICkgKSB7XG5cdFx0XHRcdFx0XHR1aS5kZXN0cm95KCk7XG5cdFx0XHRcdFx0XHQkZWxlbSA9ICQoIHNlbGVjdG9yICk7XG5cdFx0XHRcdFx0XHR1aS5hY3Rpb25zKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZWxlbWVudHMgPSBbXTtcblx0XHRcdFx0XHR2YXIgaW5kZXgsIHJlbFR5cGUsIHJlbFZhbDtcblxuXHRcdFx0XHRcdC8vIEFsbG93IGZvciBIVE1MNSBjb21wbGlhbnQgYXR0cmlidXRlIGJlZm9yZSBsZWdhY3kgdXNlIG9mIHJlbFxuXHRcdFx0XHRcdGlmICggISByZWxWYWwgKSB7XG5cdFx0XHRcdFx0XHRyZWxUeXBlID0gJ2RhdGEtcmVsJztcblx0XHRcdFx0XHRcdHJlbFZhbCA9ICQoIHRoaXMgKS5hdHRyKCByZWxUeXBlICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCAhIHJlbFZhbCApIHtcblx0XHRcdFx0XHRcdHJlbFR5cGUgPSAncmVsJztcblx0XHRcdFx0XHRcdHJlbFZhbCA9ICQoIHRoaXMgKS5hdHRyKCByZWxUeXBlICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCByZWxWYWwgJiYgcmVsVmFsICE9PSAnJyAmJiByZWxWYWwgIT09ICdub2ZvbGxvdycgKSB7XG5cdFx0XHRcdFx0XHQkZWxlbSA9ICQoIHNlbGVjdG9yICkuZmlsdGVyKCAnWycgKyByZWxUeXBlICsgJz1cIicgKyByZWxWYWwgKyAnXCJdJyApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQkZWxlbSA9ICQoIHNlbGVjdG9yICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0JGVsZW0uZWFjaCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHRcdHZhciB0aXRsZSA9IG51bGwsXG5cdFx0XHRcdFx0XHRcdGhyZWYgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHRpZiAoICQoIHRoaXMgKS5hdHRyKCAndGl0bGUnICkgKSB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlID0gJCggdGhpcyApLmF0dHIoICd0aXRsZScgKTtcblx0XHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0XHRpZiAoICQoIHRoaXMgKS5hdHRyKCAnaHJlZicgKSApIHtcblx0XHRcdFx0XHRcdFx0aHJlZiA9ICQoIHRoaXMgKS5hdHRyKCAnaHJlZicgKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZWxlbWVudHMucHVzaCgge1xuXHRcdFx0XHRcdFx0XHRocmVmOiBocmVmLFxuXHRcdFx0XHRcdFx0XHR0aXRsZTogdGl0bGVcblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRpbmRleCA9ICRlbGVtLmluZGV4KCAkKCB0aGlzICkgKTtcblx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdHVpLnRhcmdldCA9ICQoIGV2ZW50LnRhcmdldCApO1xuXHRcdFx0XHRcdHVpLmluaXQoIGluZGV4ICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dWkgPSB7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSW5pdGlhdGUgU3dpcGVib3hcblx0XHRcdCAqL1xuXHRcdFx0aW5pdCA6IGZ1bmN0aW9uKCBpbmRleCApIHtcblx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MuYmVmb3JlT3BlbiApIHtcblx0XHRcdFx0XHRwbHVnaW4uc2V0dGluZ3MuYmVmb3JlT3BlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudGFyZ2V0LnRyaWdnZXIoICdzd2lwZWJveC1zdGFydCcgKTtcblx0XHRcdFx0JC5zd2lwZWJveC5pc09wZW4gPSB0cnVlO1xuXHRcdFx0XHR0aGlzLmJ1aWxkKCk7XG5cdFx0XHRcdHRoaXMub3BlblNsaWRlKCBpbmRleCApO1xuXHRcdFx0XHR0aGlzLm9wZW5NZWRpYSggaW5kZXggKTtcblx0XHRcdFx0dGhpcy5wcmVsb2FkTWVkaWEoIGluZGV4KzEgKTtcblx0XHRcdFx0dGhpcy5wcmVsb2FkTWVkaWEoIGluZGV4LTEgKTtcblx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MuYWZ0ZXJPcGVuICkge1xuXHRcdFx0XHRcdHBsdWdpbi5zZXR0aW5ncy5hZnRlck9wZW4oaW5kZXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEJ1aWx0IEhUTUwgY29udGFpbmVycyBhbmQgZmlyZSBtYWluIGZ1bmN0aW9uc1xuXHRcdFx0ICovXG5cdFx0XHRidWlsZCA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyICR0aGlzID0gdGhpcywgYmc7XG5cblx0XHRcdFx0JCggJ2JvZHknICkuYXBwZW5kKCBodG1sICk7XG5cblx0XHRcdFx0aWYgKCBzdXBwb3J0U1ZHICYmIHBsdWdpbi5zZXR0aW5ncy51c2VTVkcgPT09IHRydWUgKSB7XG5cdFx0XHRcdFx0YmcgPSAkKCAnI3N3aXBlYm94LWNsb3NlJyApLmNzcyggJ2JhY2tncm91bmQtaW1hZ2UnICk7XG5cdFx0XHRcdFx0YmcgPSBiZy5yZXBsYWNlKCAncG5nJywgJ3N2ZycgKTtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LXByZXYsICNzd2lwZWJveC1uZXh0LCAjc3dpcGVib3gtY2xvc2UnICkuY3NzKCB7XG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZScgOiBiZ1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggaXNNb2JpbGUgJiYgcGx1Z2luLnNldHRpbmdzLnJlbW92ZUJhcnNPbk1vYmlsZSApIHtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LWJvdHRvbS1iYXIsICNzd2lwZWJveC10b3AtYmFyJyApLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0JC5lYWNoKCBlbGVtZW50cywgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyJyApLmFwcGVuZCggJzxkaXYgY2xhc3M9XCJzbGlkZVwiPjwvZGl2PicgKTtcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdCR0aGlzLnNldERpbSgpO1xuXHRcdFx0XHQkdGhpcy5hY3Rpb25zKCk7XG5cblx0XHRcdFx0aWYgKCBpc1RvdWNoICkge1xuXHRcdFx0XHRcdCR0aGlzLmdlc3R1cmUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIERldmljZXMgY2FuIGhhdmUgYm90aCB0b3VjaCBhbmQga2V5Ym9hcmQgaW5wdXQgc28gYWx3YXlzIGFsbG93IGtleSBldmVudHNcblx0XHRcdFx0JHRoaXMua2V5Ym9hcmQoKTtcblxuXHRcdFx0XHQkdGhpcy5hbmltQmFycygpO1xuXHRcdFx0XHQkdGhpcy5yZXNpemUoKTtcblxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZXQgZGltZW5zaW9ucyBkZXBlbmRpbmcgb24gd2luZG93cyB3aWR0aCBhbmQgaGVpZ2h0XG5cdFx0XHQgKi9cblx0XHRcdHNldERpbSA6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0XHR2YXIgd2lkdGgsIGhlaWdodCwgc2xpZGVyQ3NzID0ge307XG5cblx0XHRcdFx0Ly8gUmVzZXQgZGltZW5zaW9ucyBvbiBtb2JpbGUgb3JpZW50YXRpb24gY2hhbmdlXG5cdFx0XHRcdGlmICggJ29ub3JpZW50YXRpb25jaGFuZ2UnIGluIHdpbmRvdyApIHtcblxuXHRcdFx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICggd2luZG93Lm9yaWVudGF0aW9uID09PSAwICkge1xuXHRcdFx0XHRcdFx0XHR3aWR0aCA9IHdpbldpZHRoO1xuXHRcdFx0XHRcdFx0XHRoZWlnaHQgPSB3aW5IZWlnaHQ7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCB3aW5kb3cub3JpZW50YXRpb24gPT09IDkwIHx8IHdpbmRvdy5vcmllbnRhdGlvbiA9PT0gLTkwICkge1xuXHRcdFx0XHRcdFx0XHR3aWR0aCA9IHdpbkhlaWdodDtcblx0XHRcdFx0XHRcdFx0aGVpZ2h0ID0gd2luV2lkdGg7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSwgZmFsc2UgKTtcblxuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHR3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoID8gd2luZG93LmlubmVyV2lkdGggOiAkKCB3aW5kb3cgKS53aWR0aCgpO1xuXHRcdFx0XHRcdGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCA/IHdpbmRvdy5pbm5lckhlaWdodCA6ICQoIHdpbmRvdyApLmhlaWdodCgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2xpZGVyQ3NzID0ge1xuXHRcdFx0XHRcdHdpZHRoIDogd2lkdGgsXG5cdFx0XHRcdFx0aGVpZ2h0IDogaGVpZ2h0XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLmNzcyggc2xpZGVyQ3NzICk7XG5cblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzZXQgZGltZW5zaW9ucyBvbiB3aW5kb3cgcmVzaXplIGVudmVudFxuXHRcdFx0ICovXG5cdFx0XHRyZXNpemUgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXM7XG5cblx0XHRcdFx0JCggd2luZG93ICkucmVzaXplKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkdGhpcy5zZXREaW0oKTtcblx0XHRcdFx0fSApLnJlc2l6ZSgpO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBkZXZpY2Ugc3VwcG9ydHMgQ1NTIHRyYW5zaXRpb25zXG5cdFx0XHQgKi9cblx0XHRcdHN1cHBvcnRUcmFuc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdHZhciBwcmVmaXhlcyA9ICd0cmFuc2l0aW9uIFdlYmtpdFRyYW5zaXRpb24gTW96VHJhbnNpdGlvbiBPVHJhbnNpdGlvbiBtc1RyYW5zaXRpb24gS2h0bWxUcmFuc2l0aW9uJy5zcGxpdCggJyAnICksXG5cdFx0XHRcdFx0aTtcblxuXHRcdFx0XHRmb3IgKCBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrICkge1xuXHRcdFx0XHRcdGlmICggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKS5zdHlsZVsgcHJlZml4ZXNbaV0gXSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHByZWZpeGVzW2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIENoZWNrIGlmIENTUyB0cmFuc2l0aW9ucyBhcmUgYWxsb3dlZCAob3B0aW9ucyArIGRldmljZXN1cHBvcnQpXG5cdFx0XHQgKi9cblx0XHRcdGRvQ3NzVHJhbnMgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLnVzZUNTUyAmJiB0aGlzLnN1cHBvcnRUcmFuc2l0aW9uKCkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG91Y2ggbmF2aWdhdGlvblxuXHRcdFx0ICovXG5cdFx0XHRnZXN0dXJlIDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXMsXG5cdFx0XHRcdFx0aW5kZXgsXG5cdFx0XHRcdFx0aERpc3RhbmNlLFxuXHRcdFx0XHRcdHZEaXN0YW5jZSxcblx0XHRcdFx0XHRoRGlzdGFuY2VMYXN0LFxuXHRcdFx0XHRcdHZEaXN0YW5jZUxhc3QsXG5cdFx0XHRcdFx0aERpc3RhbmNlUGVyY2VudCxcblx0XHRcdFx0XHR2U3dpcGUgPSBmYWxzZSxcblx0XHRcdFx0XHRoU3dpcGUgPSBmYWxzZSxcblx0XHRcdFx0XHRoU3dpcE1pbkRpc3RhbmNlID0gMTAsXG5cdFx0XHRcdFx0dlN3aXBNaW5EaXN0YW5jZSA9IDUwLFxuXHRcdFx0XHRcdHN0YXJ0Q29vcmRzID0ge30sXG5cdFx0XHRcdFx0ZW5kQ29vcmRzID0ge30sXG5cdFx0XHRcdFx0YmFycyA9ICQoICcjc3dpcGVib3gtdG9wLWJhciwgI3N3aXBlYm94LWJvdHRvbS1iYXInICksXG5cdFx0XHRcdFx0c2xpZGVyID0gJCggJyNzd2lwZWJveC1zbGlkZXInICk7XG5cblx0XHRcdFx0YmFycy5hZGRDbGFzcyggJ3Zpc2libGUtYmFycycgKTtcblx0XHRcdFx0JHRoaXMuc2V0VGltZW91dCgpO1xuXG5cdFx0XHRcdCQoICdib2R5JyApLmJpbmQoICd0b3VjaHN0YXJ0JywgZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdFx0JCggdGhpcyApLmFkZENsYXNzKCAndG91Y2hpbmcnICk7XG5cdFx0XHRcdFx0aW5kZXggPSAkKCAnI3N3aXBlYm94LXNsaWRlciAuc2xpZGUnICkuaW5kZXgoICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZS5jdXJyZW50JyApICk7XG5cdFx0XHRcdFx0ZW5kQ29vcmRzID0gZXZlbnQub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdO1xuXHRcdFx0XHRcdHN0YXJ0Q29vcmRzLnBhZ2VYID0gZXZlbnQub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VYO1xuXHRcdFx0XHRcdHN0YXJ0Q29vcmRzLnBhZ2VZID0gZXZlbnQub3JpZ2luYWxFdmVudC50YXJnZXRUb3VjaGVzWzBdLnBhZ2VZO1xuXG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC1zbGlkZXInICkuY3NzKCB7XG5cdFx0XHRcdFx0XHQnLXdlYmtpdC10cmFuc2Zvcm0nIDogJ3RyYW5zbGF0ZTNkKCcgKyBjdXJyZW50WCArJyUsIDAsIDApJyxcblx0XHRcdFx0XHRcdCd0cmFuc2Zvcm0nIDogJ3RyYW5zbGF0ZTNkKCcgKyBjdXJyZW50WCArICclLCAwLCAwKSdcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHQkKCAnLnRvdWNoaW5nJyApLmJpbmQoICd0b3VjaG1vdmUnLGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0XHRcdGVuZENvb3JkcyA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIGhTd2lwZSApIHtcblx0XHRcdFx0XHRcdFx0dkRpc3RhbmNlTGFzdCA9IHZEaXN0YW5jZTtcblx0XHRcdFx0XHRcdFx0dkRpc3RhbmNlID0gZW5kQ29vcmRzLnBhZ2VZIC0gc3RhcnRDb29yZHMucGFnZVk7XG5cdFx0XHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHZEaXN0YW5jZSApID49IHZTd2lwTWluRGlzdGFuY2UgfHwgdlN3aXBlICkge1xuXHRcdFx0XHRcdFx0XHRcdHZhciBvcGFjaXR5ID0gMC43NSAtIE1hdGguYWJzKHZEaXN0YW5jZSkgLyBzbGlkZXIuaGVpZ2h0KCk7XG5cblx0XHRcdFx0XHRcdFx0XHRzbGlkZXIuY3NzKCB7ICd0b3AnOiB2RGlzdGFuY2UgKyAncHgnIH0gKTtcblx0XHRcdFx0XHRcdFx0XHRzbGlkZXIuY3NzKCB7ICdvcGFjaXR5Jzogb3BhY2l0eSB9ICk7XG5cblx0XHRcdFx0XHRcdFx0XHR2U3dpcGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGhEaXN0YW5jZUxhc3QgPSBoRGlzdGFuY2U7XG5cdFx0XHRcdFx0XHRoRGlzdGFuY2UgPSBlbmRDb29yZHMucGFnZVggLSBzdGFydENvb3Jkcy5wYWdlWDtcblx0XHRcdFx0XHRcdGhEaXN0YW5jZVBlcmNlbnQgPSBoRGlzdGFuY2UgKiAxMDAgLyB3aW5XaWR0aDtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIGhTd2lwZSAmJiAhIHZTd2lwZSAmJiBNYXRoLmFicyggaERpc3RhbmNlICkgPj0gaFN3aXBNaW5EaXN0YW5jZSApIHtcblx0XHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1zbGlkZXInICkuY3NzKCB7XG5cdFx0XHRcdFx0XHRcdFx0Jy13ZWJraXQtdHJhbnNpdGlvbicgOiAnJyxcblx0XHRcdFx0XHRcdFx0XHQndHJhbnNpdGlvbicgOiAnJ1xuXHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRcdGhTd2lwZSA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggaFN3aXBlICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIHN3aXBlIGxlZnRcblx0XHRcdFx0XHRcdFx0aWYgKCAwIDwgaERpc3RhbmNlICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gZmlyc3Qgc2xpZGVcblx0XHRcdFx0XHRcdFx0XHRpZiAoIDAgPT09IGluZGV4ICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coICdmaXJzdCcgKTtcblx0XHRcdFx0XHRcdFx0XHRcdCQoICcjc3dpcGVib3gtb3ZlcmxheScgKS5hZGRDbGFzcyggJ2xlZnRTcHJpbmdUb3VjaCcgKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gRm9sbG93IGdlc3R1cmVcblx0XHRcdFx0XHRcdFx0XHRcdCQoICcjc3dpcGVib3gtb3ZlcmxheScgKS5yZW1vdmVDbGFzcyggJ2xlZnRTcHJpbmdUb3VjaCcgKS5yZW1vdmVDbGFzcyggJ3JpZ2h0U3ByaW5nVG91Y2gnICk7XG5cdFx0XHRcdFx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LXNsaWRlcicgKS5jc3MoIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Jy13ZWJraXQtdHJhbnNmb3JtJyA6ICd0cmFuc2xhdGUzZCgnICsgKCBjdXJyZW50WCArIGhEaXN0YW5jZVBlcmNlbnQgKSArJyUsIDAsIDApJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0J3RyYW5zZm9ybScgOiAndHJhbnNsYXRlM2QoJyArICggY3VycmVudFggKyBoRGlzdGFuY2VQZXJjZW50ICkgKyAnJSwgMCwgMCknXG5cdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vIHN3aXBlIHJ1Z2h0XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIDAgPiBoRGlzdGFuY2UgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBsYXN0IFNsaWRlXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCBlbGVtZW50cy5sZW5ndGggPT09IGluZGV4ICsxICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coICdsYXN0JyApO1xuXHRcdFx0XHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLmFkZENsYXNzKCAncmlnaHRTcHJpbmdUb3VjaCcgKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnbGVmdFNwcmluZ1RvdWNoJyApLnJlbW92ZUNsYXNzKCAncmlnaHRTcHJpbmdUb3VjaCcgKTtcblx0XHRcdFx0XHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyJyApLmNzcygge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQnLXdlYmtpdC10cmFuc2Zvcm0nIDogJ3RyYW5zbGF0ZTNkKCcgKyAoIGN1cnJlbnRYICsgaERpc3RhbmNlUGVyY2VudCApICsnJSwgMCwgMCknLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQndHJhbnNmb3JtJyA6ICd0cmFuc2xhdGUzZCgnICsgKCBjdXJyZW50WCArIGhEaXN0YW5jZVBlcmNlbnQgKSArICclLCAwLCAwKSdcblx0XHRcdFx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdFx0XHR9ICkuYmluZCggJ3RvdWNoZW5kJyxmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyJyApLmNzcygge1xuXHRcdFx0XHRcdFx0Jy13ZWJraXQtdHJhbnNpdGlvbicgOiAnLXdlYmtpdC10cmFuc2Zvcm0gMC40cyBlYXNlJyxcblx0XHRcdFx0XHRcdCd0cmFuc2l0aW9uJyA6ICd0cmFuc2Zvcm0gMC40cyBlYXNlJ1xuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdHZEaXN0YW5jZSA9IGVuZENvb3Jkcy5wYWdlWSAtIHN0YXJ0Q29vcmRzLnBhZ2VZO1xuXHRcdFx0XHRcdGhEaXN0YW5jZSA9IGVuZENvb3Jkcy5wYWdlWCAtIHN0YXJ0Q29vcmRzLnBhZ2VYO1xuXHRcdFx0XHRcdGhEaXN0YW5jZVBlcmNlbnQgPSBoRGlzdGFuY2UqMTAwL3dpbldpZHRoO1xuXG5cdFx0XHRcdFx0Ly8gU3dpcGUgdG8gYm90dG9tIHRvIGNsb3NlXG5cdFx0XHRcdFx0aWYgKCB2U3dpcGUgKSB7XG5cdFx0XHRcdFx0XHR2U3dpcGUgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHZEaXN0YW5jZSApID49IDIgKiB2U3dpcE1pbkRpc3RhbmNlICYmIE1hdGguYWJzKCB2RGlzdGFuY2UgKSA+IE1hdGguYWJzKCB2RGlzdGFuY2VMYXN0ICkgKSB7XG5cdFx0XHRcdFx0XHRcdHZhciB2T2Zmc2V0ID0gdkRpc3RhbmNlID4gMCA/IHNsaWRlci5oZWlnaHQoKSA6IC0gc2xpZGVyLmhlaWdodCgpO1xuXHRcdFx0XHRcdFx0XHRzbGlkZXIuYW5pbWF0ZSggeyB0b3A6IHZPZmZzZXQgKyAncHgnLCAnb3BhY2l0eSc6IDAgfSxcblx0XHRcdFx0XHRcdFx0XHQzMDAsXG5cdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0JHRoaXMuY2xvc2VTbGlkZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHNsaWRlci5hbmltYXRlKCB7IHRvcDogMCwgJ29wYWNpdHknOiAxIH0sIDMwMCApO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fSBlbHNlIGlmICggaFN3aXBlICkge1xuXG5cdFx0XHRcdFx0XHRoU3dpcGUgPSBmYWxzZTtcblxuXHRcdFx0XHRcdFx0Ly8gc3dpcGVMZWZ0XG5cdFx0XHRcdFx0XHRpZiggaERpc3RhbmNlID49IGhTd2lwTWluRGlzdGFuY2UgJiYgaERpc3RhbmNlID49IGhEaXN0YW5jZUxhc3QpIHtcblxuXHRcdFx0XHRcdFx0XHQkdGhpcy5nZXRQcmV2KCk7XG5cblx0XHRcdFx0XHRcdC8vIHN3aXBlUmlnaHRcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoIGhEaXN0YW5jZSA8PSAtaFN3aXBNaW5EaXN0YW5jZSAmJiBoRGlzdGFuY2UgPD0gaERpc3RhbmNlTGFzdCkge1xuXG5cdFx0XHRcdFx0XHRcdCR0aGlzLmdldE5leHQoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdH0gZWxzZSB7IC8vIFRvcCBhbmQgYm90dG9tIGJhcnMgaGF2ZSBiZWVuIHJlbW92ZWQgb24gdG91Y2hhYmxlIGRldmljZXNcblx0XHRcdFx0XHRcdC8vIHRhcFxuXHRcdFx0XHRcdFx0aWYgKCAhIGJhcnMuaGFzQ2xhc3MoICd2aXNpYmxlLWJhcnMnICkgKSB7XG5cdFx0XHRcdFx0XHRcdCR0aGlzLnNob3dCYXJzKCk7XG5cdFx0XHRcdFx0XHRcdCR0aGlzLnNldFRpbWVvdXQoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdCR0aGlzLmNsZWFyVGltZW91dCgpO1xuXHRcdFx0XHRcdFx0XHQkdGhpcy5oaWRlQmFycygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyJyApLmNzcygge1xuXHRcdFx0XHRcdFx0Jy13ZWJraXQtdHJhbnNmb3JtJyA6ICd0cmFuc2xhdGUzZCgnICsgY3VycmVudFggKyAnJSwgMCwgMCknLFxuXHRcdFx0XHRcdFx0J3RyYW5zZm9ybScgOiAndHJhbnNsYXRlM2QoJyArIGN1cnJlbnRYICsgJyUsIDAsIDApJ1xuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtb3ZlcmxheScgKS5yZW1vdmVDbGFzcyggJ2xlZnRTcHJpbmdUb3VjaCcgKS5yZW1vdmVDbGFzcyggJ3JpZ2h0U3ByaW5nVG91Y2gnICk7XG5cdFx0XHRcdFx0JCggJy50b3VjaGluZycgKS5vZmYoICd0b3VjaG1vdmUnICkucmVtb3ZlQ2xhc3MoICd0b3VjaGluZycgKTtcblxuXHRcdFx0XHR9ICk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCB0aW1lciB0byBoaWRlIHRoZSBhY3Rpb24gYmFyc1xuXHRcdFx0ICovXG5cdFx0XHRzZXRUaW1lb3V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLmhpZGVCYXJzRGVsYXkgPiAwICkge1xuXHRcdFx0XHRcdHZhciAkdGhpcyA9IHRoaXM7XG5cdFx0XHRcdFx0JHRoaXMuY2xlYXJUaW1lb3V0KCk7XG5cdFx0XHRcdFx0JHRoaXMudGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0JHRoaXMuaGlkZUJhcnMoKTtcblx0XHRcdFx0XHRcdH0sXG5cblx0XHRcdFx0XHRcdHBsdWdpbi5zZXR0aW5ncy5oaWRlQmFyc0RlbGF5XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbGVhciB0aW1lclxuXHRcdFx0ICovXG5cdFx0XHRjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0d2luZG93LmNsZWFyVGltZW91dCggdGhpcy50aW1lb3V0ICk7XG5cdFx0XHRcdHRoaXMudGltZW91dCA9IG51bGw7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNob3cgbmF2aWdhdGlvbiBhbmQgdGl0bGUgYmFyc1xuXHRcdFx0ICovXG5cdFx0XHRzaG93QmFycyA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIGJhcnMgPSAkKCAnI3N3aXBlYm94LXRvcC1iYXIsICNzd2lwZWJveC1ib3R0b20tYmFyJyApO1xuXHRcdFx0XHRpZiAoIHRoaXMuZG9Dc3NUcmFucygpICkge1xuXHRcdFx0XHRcdGJhcnMuYWRkQ2xhc3MoICd2aXNpYmxlLWJhcnMnICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC10b3AtYmFyJyApLmFuaW1hdGUoIHsgdG9wIDogMCB9LCA1MDAgKTtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LWJvdHRvbS1iYXInICkuYW5pbWF0ZSggeyBib3R0b20gOiAwIH0sIDUwMCApO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0YmFycy5hZGRDbGFzcyggJ3Zpc2libGUtYmFycycgKTtcblx0XHRcdFx0XHR9LCAxMDAwICk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSGlkZSBuYXZpZ2F0aW9uIGFuZCB0aXRsZSBiYXJzXG5cdFx0XHQgKi9cblx0XHRcdGhpZGVCYXJzIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgYmFycyA9ICQoICcjc3dpcGVib3gtdG9wLWJhciwgI3N3aXBlYm94LWJvdHRvbS1iYXInICk7XG5cdFx0XHRcdGlmICggdGhpcy5kb0Nzc1RyYW5zKCkgKSB7XG5cdFx0XHRcdFx0YmFycy5yZW1vdmVDbGFzcyggJ3Zpc2libGUtYmFycycgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LXRvcC1iYXInICkuYW5pbWF0ZSggeyB0b3AgOiAnLTUwcHgnIH0sIDUwMCApO1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtYm90dG9tLWJhcicgKS5hbmltYXRlKCB7IGJvdHRvbSA6ICctNTBweCcgfSwgNTAwICk7XG5cdFx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRiYXJzLnJlbW92ZUNsYXNzKCAndmlzaWJsZS1iYXJzJyApO1xuXHRcdFx0XHRcdH0sIDEwMDAgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBBbmltYXRlIG5hdmlnYXRpb24gYW5kIHRvcCBiYXJzXG5cdFx0XHQgKi9cblx0XHRcdGFuaW1CYXJzIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSB0aGlzLFxuXHRcdFx0XHRcdGJhcnMgPSAkKCAnI3N3aXBlYm94LXRvcC1iYXIsICNzd2lwZWJveC1ib3R0b20tYmFyJyApO1xuXG5cdFx0XHRcdGJhcnMuYWRkQ2xhc3MoICd2aXNpYmxlLWJhcnMnICk7XG5cdFx0XHRcdCR0aGlzLnNldFRpbWVvdXQoKTtcblxuXHRcdFx0XHQkKCAnI3N3aXBlYm94LXNsaWRlcicgKS5jbGljayggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0aWYgKCAhIGJhcnMuaGFzQ2xhc3MoICd2aXNpYmxlLWJhcnMnICkgKSB7XG5cdFx0XHRcdFx0XHQkdGhpcy5zaG93QmFycygpO1xuXHRcdFx0XHRcdFx0JHRoaXMuc2V0VGltZW91dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdCQoICcjc3dpcGVib3gtYm90dG9tLWJhcicgKS5ob3ZlciggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0JHRoaXMuc2hvd0JhcnMoKTtcblx0XHRcdFx0XHRiYXJzLmFkZENsYXNzKCAndmlzaWJsZS1iYXJzJyApO1xuXHRcdFx0XHRcdCR0aGlzLmNsZWFyVGltZW91dCgpO1xuXG5cdFx0XHRcdH0sIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLmhpZGVCYXJzRGVsYXkgPiAwICkge1xuXHRcdFx0XHRcdFx0YmFycy5yZW1vdmVDbGFzcyggJ3Zpc2libGUtYmFycycgKTtcblx0XHRcdFx0XHRcdCR0aGlzLnNldFRpbWVvdXQoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBLZXlib2FyZCBuYXZpZ2F0aW9uXG5cdFx0XHQgKi9cblx0XHRcdGtleWJvYXJkIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSB0aGlzO1xuXHRcdFx0XHQkKCB3aW5kb3cgKS5iaW5kKCAna2V5dXAnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdFx0XHRcdGlmICggZXZlbnQua2V5Q29kZSA9PT0gMzcgKSB7XG5cblx0XHRcdFx0XHRcdCR0aGlzLmdldFByZXYoKTtcblxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIGV2ZW50LmtleUNvZGUgPT09IDM5ICkge1xuXG5cdFx0XHRcdFx0XHQkdGhpcy5nZXROZXh0KCk7XG5cblx0XHRcdFx0XHR9IGVsc2UgaWYgKCBldmVudC5rZXlDb2RlID09PSAyNyApIHtcblxuXHRcdFx0XHRcdFx0JHRoaXMuY2xvc2VTbGlkZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSApO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBOYXZpZ2F0aW9uIGV2ZW50cyA6IGdvIHRvIG5leHQgc2xpZGUsIGdvIHRvIHByZXZvdXMgc2xpZGUgYW5kIGNsb3NlXG5cdFx0XHQgKi9cblx0XHRcdGFjdGlvbnMgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXMsXG5cdFx0XHRcdFx0YWN0aW9uID0gJ3RvdWNoZW5kIGNsaWNrJzsgLy8gSnVzdCBkZXRlY3QgZm9yIGJvdGggZXZlbnQgdHlwZXMgdG8gYWxsb3cgZm9yIG11bHRpLWlucHV0XG5cblx0XHRcdFx0aWYgKCBlbGVtZW50cy5sZW5ndGggPCAyICkge1xuXG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC1ib3R0b20tYmFyJyApLmhpZGUoKTtcblxuXHRcdFx0XHRcdGlmICggdW5kZWZpbmVkID09PSBlbGVtZW50c1sgMSBdICkge1xuXHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC10b3AtYmFyJyApLmhpZGUoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LXByZXYnICkuYmluZCggYWN0aW9uLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdFx0XHQkdGhpcy5nZXRQcmV2KCk7XG5cdFx0XHRcdFx0XHQkdGhpcy5zZXRUaW1lb3V0KCk7XG5cdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC1uZXh0JyApLmJpbmQoIGFjdGlvbiwgZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRcdFx0JHRoaXMuZ2V0TmV4dCgpO1xuXHRcdFx0XHRcdFx0JHRoaXMuc2V0VGltZW91dCgpO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoICcjc3dpcGVib3gtY2xvc2UnICkuYmluZCggYWN0aW9uLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHQkdGhpcy5jbG9zZVNsaWRlKCk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IGN1cnJlbnQgc2xpZGVcblx0XHRcdCAqL1xuXHRcdFx0c2V0U2xpZGUgOiBmdW5jdGlvbiAoIGluZGV4LCBpc0ZpcnN0ICkge1xuXG5cdFx0XHRcdGlzRmlyc3QgPSBpc0ZpcnN0IHx8IGZhbHNlO1xuXG5cdFx0XHRcdHZhciBzbGlkZXIgPSAkKCAnI3N3aXBlYm94LXNsaWRlcicgKTtcblxuXHRcdFx0XHRjdXJyZW50WCA9IC1pbmRleCoxMDA7XG5cblx0XHRcdFx0aWYgKCB0aGlzLmRvQ3NzVHJhbnMoKSApIHtcblx0XHRcdFx0XHRzbGlkZXIuY3NzKCB7XG5cdFx0XHRcdFx0XHQnLXdlYmtpdC10cmFuc2Zvcm0nIDogJ3RyYW5zbGF0ZTNkKCcgKyAoLWluZGV4KjEwMCkrJyUsIDAsIDApJyxcblx0XHRcdFx0XHRcdCd0cmFuc2Zvcm0nIDogJ3RyYW5zbGF0ZTNkKCcgKyAoLWluZGV4KjEwMCkrJyUsIDAsIDApJ1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzbGlkZXIuYW5pbWF0ZSggeyBsZWZ0IDogKCAtaW5kZXgqMTAwICkrJyUnIH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5yZW1vdmVDbGFzcyggJ2N1cnJlbnQnICk7XG5cdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5hZGRDbGFzcyggJ2N1cnJlbnQnICk7XG5cdFx0XHRcdHRoaXMuc2V0VGl0bGUoIGluZGV4ICk7XG5cblx0XHRcdFx0aWYgKCBpc0ZpcnN0ICkge1xuXHRcdFx0XHRcdHNsaWRlci5mYWRlSW4oKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQoICcjc3dpcGVib3gtcHJldiwgI3N3aXBlYm94LW5leHQnICkucmVtb3ZlQ2xhc3MoICdkaXNhYmxlZCcgKTtcblxuXHRcdFx0XHRpZiAoIGluZGV4ID09PSAwICkge1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtcHJldicgKS5hZGRDbGFzcyggJ2Rpc2FibGVkJyApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBpbmRleCA9PT0gZWxlbWVudHMubGVuZ3RoIC0gMSAmJiBwbHVnaW4uc2V0dGluZ3MubG9vcEF0RW5kICE9PSB0cnVlICkge1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtbmV4dCcgKS5hZGRDbGFzcyggJ2Rpc2FibGVkJyApO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gc2xpZGVcblx0XHRcdCAqL1xuXHRcdFx0b3BlblNsaWRlIDogZnVuY3Rpb24gKCBpbmRleCApIHtcblx0XHRcdFx0JCggJ2h0bWwnICkuYWRkQ2xhc3MoICdzd2lwZWJveC1odG1sJyApO1xuXHRcdFx0XHRpZiAoIGlzVG91Y2ggKSB7XG5cdFx0XHRcdFx0JCggJ2h0bWwnICkuYWRkQ2xhc3MoICdzd2lwZWJveC10b3VjaCcgKTtcblxuXHRcdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLmhpZGVDbG9zZUJ1dHRvbk9uTW9iaWxlICkge1xuXHRcdFx0XHRcdFx0JCggJ2h0bWwnICkuYWRkQ2xhc3MoICdzd2lwZWJveC1uby1jbG9zZS1idXR0b24nICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCQoICdodG1sJyApLmFkZENsYXNzKCAnc3dpcGVib3gtbm8tdG91Y2gnICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JCggd2luZG93ICkudHJpZ2dlciggJ3Jlc2l6ZScgKTsgLy8gZml4IHNjcm9sbCBiYXIgdmlzaWJpbGl0eSBvbiBkZXNrdG9wXG5cdFx0XHRcdHRoaXMuc2V0U2xpZGUoIGluZGV4LCB0cnVlICk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCBhIHRpbWUgb3V0IGlmIHRoZSBtZWRpYSBpcyBhIHZpZGVvXG5cdFx0XHQgKi9cblx0XHRcdHByZWxvYWRNZWRpYSA6IGZ1bmN0aW9uICggaW5kZXggKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXMsXG5cdFx0XHRcdFx0c3JjID0gbnVsbDtcblxuXHRcdFx0XHRpZiAoIGVsZW1lbnRzWyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0c3JjID0gZWxlbWVudHNbIGluZGV4IF0uaHJlZjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggISAkdGhpcy5pc1ZpZGVvKCBzcmMgKSApIHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdCR0aGlzLm9wZW5NZWRpYSggaW5kZXggKTtcblx0XHRcdFx0XHR9LCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkdGhpcy5vcGVuTWVkaWEoIGluZGV4ICk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlblxuXHRcdFx0ICovXG5cdFx0XHRvcGVuTWVkaWEgOiBmdW5jdGlvbiAoIGluZGV4ICkge1xuXHRcdFx0XHR2YXIgJHRoaXMgPSB0aGlzLFxuXHRcdFx0XHRcdHNyYyxcblx0XHRcdFx0XHRzbGlkZTtcblxuXHRcdFx0XHRpZiAoIGVsZW1lbnRzWyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdFx0c3JjID0gZWxlbWVudHNbIGluZGV4IF0uaHJlZjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICggaW5kZXggPCAwIHx8IGluZGV4ID49IGVsZW1lbnRzLmxlbmd0aCApIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzbGlkZSA9ICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKTtcblxuXHRcdFx0XHRpZiAoICEgJHRoaXMuaXNWaWRlbyggc3JjICkgKSB7XG5cdFx0XHRcdFx0c2xpZGUuYWRkQ2xhc3MoICdzbGlkZS1sb2FkaW5nJyApO1xuXHRcdFx0XHRcdCR0aGlzLmxvYWRNZWRpYSggc3JjLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHNsaWRlLnJlbW92ZUNsYXNzKCAnc2xpZGUtbG9hZGluZycgKTtcblx0XHRcdFx0XHRcdHNsaWRlLmh0bWwoIHRoaXMgKTtcblxuXHRcdFx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MuYWZ0ZXJNZWRpYSApIHtcblx0XHRcdFx0XHRcdFx0cGx1Z2luLnNldHRpbmdzLmFmdGVyTWVkaWEoIGluZGV4ICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNsaWRlLmh0bWwoICR0aGlzLmdldFZpZGVvKCBzcmMgKSApO1xuXG5cdFx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MuYWZ0ZXJNZWRpYSApIHtcblx0XHRcdFx0XHRcdHBsdWdpbi5zZXR0aW5ncy5hZnRlck1lZGlhKCBpbmRleCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFNldCBsaW5rIHRpdGxlIGF0dHJpYnV0ZSBhcyBjYXB0aW9uXG5cdFx0XHQgKi9cblx0XHRcdHNldFRpdGxlIDogZnVuY3Rpb24gKCBpbmRleCApIHtcblx0XHRcdFx0dmFyIHRpdGxlID0gbnVsbDtcblxuXHRcdFx0XHQkKCAnI3N3aXBlYm94LXRpdGxlJyApLmVtcHR5KCk7XG5cblx0XHRcdFx0aWYgKCBlbGVtZW50c1sgaW5kZXggXSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHRcdHRpdGxlID0gZWxlbWVudHNbIGluZGV4IF0udGl0bGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIHRpdGxlICkge1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtdG9wLWJhcicgKS5zaG93KCk7XG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC10aXRsZScgKS5hcHBlbmQoIHRpdGxlICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JCggJyNzd2lwZWJveC10b3AtYmFyJyApLmhpZGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiB0aGUgVVJMIGlzIGEgdmlkZW9cblx0XHRcdCAqL1xuXHRcdFx0aXNWaWRlbyA6IGZ1bmN0aW9uICggc3JjICkge1xuXG5cdFx0XHRcdGlmICggc3JjICkge1xuXHRcdFx0XHRcdGlmICggc3JjLm1hdGNoKCAvKHlvdXR1YmVcXC5jb218eW91dHViZS1ub2Nvb2tpZVxcLmNvbSlcXC93YXRjaFxcP3Y9KFthLXpBLVowLTlcXC1fXSspLykgfHwgc3JjLm1hdGNoKCAvdmltZW9cXC5jb21cXC8oWzAtOV0qKS8gKSB8fCBzcmMubWF0Y2goIC95b3V0dVxcLmJlXFwvKFthLXpBLVowLTlcXC1fXSspLyApICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCBzcmMudG9Mb3dlckNhc2UoKS5pbmRleE9mKCAnc3dpcGVib3h2aWRlbz0xJyApID49IDAgKSB7XG5cblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFBhcnNlIFVSSSBxdWVyeXN0cmluZyBhbmQ6XG5cdFx0XHQgKiAtIG92ZXJyaWRlcyB2YWx1ZSBwcm92aWRlZCB2aWEgZGljdGlvbmFyeVxuXHRcdFx0ICogLSByZWJ1aWxkIGl0IGFnYWluIHJldHVybmluZyBhIHN0cmluZ1xuXHRcdFx0ICovXG5cdFx0XHRwYXJzZVVyaSA6IGZ1bmN0aW9uICh1cmksIGN1c3RvbURhdGEpIHtcblx0XHRcdFx0dmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyksXG5cdFx0XHRcdFx0cXMgPSB7fTtcblxuXHRcdFx0XHQvLyBEZWNvZGUgdGhlIFVSSVxuXHRcdFx0XHRhLmhyZWYgPSBkZWNvZGVVUklDb21wb25lbnQoIHVyaSApO1xuXG5cdFx0XHRcdC8vIFF1ZXJ5U3RyaW5nIHRvIE9iamVjdFxuXHRcdFx0XHRpZiAoIGEuc2VhcmNoICkge1xuXHRcdFx0XHRcdHFzID0gSlNPTi5wYXJzZSggJ3tcIicgKyBhLnNlYXJjaC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoJz8nLCcnKS5yZXBsYWNlKC8mL2csJ1wiLFwiJykucmVwbGFjZSgvPS9nLCdcIjpcIicpICsgJ1wifScgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gRXh0ZW5kIHdpdGggY3VzdG9tIGRhdGFcblx0XHRcdFx0aWYgKCAkLmlzUGxhaW5PYmplY3QoIGN1c3RvbURhdGEgKSApIHtcblx0XHRcdFx0XHRxcyA9ICQuZXh0ZW5kKCBxcywgY3VzdG9tRGF0YSwgcGx1Z2luLnNldHRpbmdzLnF1ZXJ5U3RyaW5nRGF0YSApOyAvLyBUaGUgZGV2IGhhcyBhbHdheXMgdGhlIGZpbmFsIHdvcmRcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFJldHVybiBxdWVyeXN0cmluZyBhcyBhIHN0cmluZ1xuXHRcdFx0XHRyZXR1cm4gJFxuXHRcdFx0XHRcdC5tYXAoIHFzLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtcblx0XHRcdFx0XHRcdGlmICggdmFsICYmIHZhbCA+ICcnICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KCBrZXkgKSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudCggdmFsICk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbignJicpO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBHZXQgdmlkZW8gaWZyYW1lIGNvZGUgZnJvbSBVUkxcblx0XHRcdCAqL1xuXHRcdFx0Z2V0VmlkZW8gOiBmdW5jdGlvbiggdXJsICkge1xuXHRcdFx0XHR2YXIgaWZyYW1lID0gJycsXG5cdFx0XHRcdFx0eW91dHViZVVybCA9IHVybC5tYXRjaCggLygoPzp3d3dcXC4pP3lvdXR1YmVcXC5jb218KD86d3d3XFwuKT95b3V0dWJlLW5vY29va2llXFwuY29tKVxcL3dhdGNoXFw/dj0oW2EtekEtWjAtOVxcLV9dKykvICksXG5cdFx0XHRcdFx0eW91dHViZVNob3J0VXJsID0gdXJsLm1hdGNoKC8oPzp3d3dcXC4pP3lvdXR1XFwuYmVcXC8oW2EtekEtWjAtOVxcLV9dKykvKSxcblx0XHRcdFx0XHR2aW1lb1VybCA9IHVybC5tYXRjaCggLyg/Ond3d1xcLik/dmltZW9cXC5jb21cXC8oWzAtOV0qKS8gKSxcblx0XHRcdFx0XHRxcyA9ICcnO1xuXHRcdFx0XHRpZiAoIHlvdXR1YmVVcmwgfHwgeW91dHViZVNob3J0VXJsKSB7XG5cdFx0XHRcdFx0aWYgKCB5b3V0dWJlU2hvcnRVcmwgKSB7XG5cdFx0XHRcdFx0XHR5b3V0dWJlVXJsID0geW91dHViZVNob3J0VXJsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRxcyA9IHVpLnBhcnNlVXJpKCB1cmwsIHtcblx0XHRcdFx0XHRcdCdhdXRvcGxheScgOiAoIHBsdWdpbi5zZXR0aW5ncy5hdXRvcGxheVZpZGVvcyA/ICcxJyA6ICcwJyApLFxuXHRcdFx0XHRcdFx0J3YnIDogJydcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZnJhbWUgPSAnPGlmcmFtZSB3aWR0aD1cIjU2MFwiIGhlaWdodD1cIjMxNVwiIHNyYz1cIi8vJyArIHlvdXR1YmVVcmxbMV0gKyAnL2VtYmVkLycgKyB5b3V0dWJlVXJsWzJdICsgJz8nICsgcXMgKyAnXCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggdmltZW9VcmwgKSB7XG5cdFx0XHRcdFx0cXMgPSB1aS5wYXJzZVVyaSggdXJsLCB7XG5cdFx0XHRcdFx0XHQnYXV0b3BsYXknIDogKCBwbHVnaW4uc2V0dGluZ3MuYXV0b3BsYXlWaWRlb3MgPyAnMScgOiAnMCcgKSxcblx0XHRcdFx0XHRcdCdieWxpbmUnIDogJzAnLFxuXHRcdFx0XHRcdFx0J3BvcnRyYWl0JyA6ICcwJyxcblx0XHRcdFx0XHRcdCdjb2xvcic6IHBsdWdpbi5zZXR0aW5ncy52aW1lb0NvbG9yXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWZyYW1lID0gJzxpZnJhbWUgd2lkdGg9XCI1NjBcIiBoZWlnaHQ9XCIzMTVcIiAgc3JjPVwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycgKyB2aW1lb1VybFsxXSArICc/JyArIHFzICsgJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdEFsbG93RnVsbFNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dGdWxsU2NyZWVuPjwvaWZyYW1lPic7XG5cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZnJhbWUgPSAnPGlmcmFtZSB3aWR0aD1cIjU2MFwiIGhlaWdodD1cIjMxNVwiIHNyYz1cIicgKyB1cmwgKyAnXCIgZnJhbWVib3JkZXI9XCIwXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gJzxkaXYgY2xhc3M9XCJzd2lwZWJveC12aWRlby1jb250YWluZXJcIiBzdHlsZT1cIm1heC13aWR0aDonICsgcGx1Z2luLnNldHRpbmdzLnZpZGVvTWF4V2lkdGggKyAncHhcIj48ZGl2IGNsYXNzPVwic3dpcGVib3gtdmlkZW9cIj4nICsgaWZyYW1lICsgJzwvZGl2PjwvZGl2Pic7XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIExvYWQgaW1hZ2Vcblx0XHRcdCAqL1xuXHRcdFx0bG9hZE1lZGlhIDogZnVuY3Rpb24gKCBzcmMsIGNhbGxiYWNrICkge1xuICAgICAgICAgICAgICAgIC8vIElubGluZSBjb250ZW50XG4gICAgICAgICAgICAgICAgaWYgKCBzcmMudHJpbSgpLmluZGV4T2YoJyMnKSA9PT0gMCApIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChcbiAgICAgICAgICAgICAgICAgICAgXHQkKCc8ZGl2PicsIHtcbiAgICAgICAgICAgICAgICAgICAgXHRcdCdjbGFzcycgOiAnc3dpcGVib3gtaW5saW5lLWNvbnRhaW5lcidcbiAgICAgICAgICAgICAgICAgICAgXHR9KVxuICAgICAgICAgICAgICAgICAgICBcdC5hcHBlbmQoXG4gICAgICAgICAgICAgICAgICAgIFx0XHQkKHNyYylcblx0ICAgICAgICAgICAgICAgICAgICBcdC5jbG9uZSgpXG5cdCAgICAgICAgICAgICAgICAgICAgXHQudG9nZ2xlQ2xhc3MoIHBsdWdpbi5zZXR0aW5ncy50b2dnbGVDbGFzc09uTG9hZCApXG5cdCAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBFdmVyeXRoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICBcdFx0XHRcdGlmICggISB0aGlzLmlzVmlkZW8oIHNyYyApICkge1xuICAgIFx0XHRcdFx0XHR2YXIgaW1nID0gJCggJzxpbWc+JyApLm9uKCAnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgIFx0XHRcdFx0XHRcdGNhbGxiYWNrLmNhbGwoIGltZyApO1xuICAgIFx0XHRcdFx0XHR9ICk7XG5cbiAgICBcdFx0XHRcdFx0aW1nLmF0dHIoICdzcmMnLCBzcmMgKTtcbiAgICBcdFx0XHRcdH1cbiAgICAgICAgICAgICAgICB9XG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdldCBuZXh0IHNsaWRlXG5cdFx0XHQgKi9cblx0XHRcdGdldE5leHQgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciAkdGhpcyA9IHRoaXMsXG5cdFx0XHRcdFx0c3JjLFxuXHRcdFx0XHRcdGluZGV4ID0gJCggJyNzd2lwZWJveC1zbGlkZXIgLnNsaWRlJyApLmluZGV4KCAkKCAnI3N3aXBlYm94LXNsaWRlciAuc2xpZGUuY3VycmVudCcgKSApO1xuXHRcdFx0XHRpZiAoIGluZGV4ICsgMSA8IGVsZW1lbnRzLmxlbmd0aCApIHtcblxuXHRcdFx0XHRcdHNyYyA9ICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5jb250ZW50cygpLmZpbmQoICdpZnJhbWUnICkuYXR0ciggJ3NyYycgKTtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LXNsaWRlciAuc2xpZGUnICkuZXEoIGluZGV4ICkuY29udGVudHMoKS5maW5kKCAnaWZyYW1lJyApLmF0dHIoICdzcmMnLCBzcmMgKTtcblx0XHRcdFx0XHRpbmRleCsrO1xuXHRcdFx0XHRcdCR0aGlzLnNldFNsaWRlKCBpbmRleCApO1xuXHRcdFx0XHRcdCR0aGlzLnByZWxvYWRNZWRpYSggaW5kZXgrMSApO1xuXHRcdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLm5leHRTbGlkZSApIHtcblx0XHRcdFx0XHRcdHBsdWdpbi5zZXR0aW5ncy5uZXh0U2xpZGUoaW5kZXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLmxvb3BBdEVuZCA9PT0gdHJ1ZSApIHtcblx0XHRcdFx0XHRcdHNyYyA9ICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5jb250ZW50cygpLmZpbmQoICdpZnJhbWUnICkuYXR0ciggJ3NyYycgKTtcblx0XHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5jb250ZW50cygpLmZpbmQoICdpZnJhbWUnICkuYXR0ciggJ3NyYycsIHNyYyApO1xuXHRcdFx0XHRcdFx0aW5kZXggPSAwO1xuXHRcdFx0XHRcdFx0JHRoaXMucHJlbG9hZE1lZGlhKCBpbmRleCApO1xuXHRcdFx0XHRcdFx0JHRoaXMuc2V0U2xpZGUoIGluZGV4ICk7XG5cdFx0XHRcdFx0XHQkdGhpcy5wcmVsb2FkTWVkaWEoIGluZGV4ICsgMSApO1xuXHRcdFx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MubmV4dFNsaWRlICkge1xuXHRcdFx0XHRcdFx0XHRwbHVnaW4uc2V0dGluZ3MubmV4dFNsaWRlKGluZGV4KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLmFkZENsYXNzKCAncmlnaHRTcHJpbmcnICk7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAncmlnaHRTcHJpbmcnICk7XG5cdFx0XHRcdFx0XHR9LCA1MDAgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2V0IHByZXZpb3VzIHNsaWRlXG5cdFx0XHQgKi9cblx0XHRcdGdldFByZXYgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBpbmRleCA9ICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5pbmRleCggJCggJyNzd2lwZWJveC1zbGlkZXIgLnNsaWRlLmN1cnJlbnQnICkgKSxcblx0XHRcdFx0XHRzcmM7XG5cdFx0XHRcdGlmICggaW5kZXggPiAwICkge1xuXHRcdFx0XHRcdHNyYyA9ICQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5jb250ZW50cygpLmZpbmQoICdpZnJhbWUnKS5hdHRyKCAnc3JjJyApO1xuXHRcdFx0XHRcdCQoICcjc3dpcGVib3gtc2xpZGVyIC5zbGlkZScgKS5lcSggaW5kZXggKS5jb250ZW50cygpLmZpbmQoICdpZnJhbWUnICkuYXR0ciggJ3NyYycsIHNyYyApO1xuXHRcdFx0XHRcdGluZGV4LS07XG5cdFx0XHRcdFx0dGhpcy5zZXRTbGlkZSggaW5kZXggKTtcblx0XHRcdFx0XHR0aGlzLnByZWxvYWRNZWRpYSggaW5kZXgtMSApO1xuXHRcdFx0XHRcdGlmICggcGx1Z2luLnNldHRpbmdzLnByZXZTbGlkZSApIHtcblx0XHRcdFx0XHRcdHBsdWdpbi5zZXR0aW5ncy5wcmV2U2xpZGUoaW5kZXgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkKCAnI3N3aXBlYm94LW92ZXJsYXknICkuYWRkQ2xhc3MoICdsZWZ0U3ByaW5nJyApO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0JCggJyNzd2lwZWJveC1vdmVybGF5JyApLnJlbW92ZUNsYXNzKCAnbGVmdFNwcmluZycgKTtcblx0XHRcdFx0XHR9LCA1MDAgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdC8qIGpzaGludCB1bnVzZWQ6ZmFsc2UgKi9cblx0XHRcdG5leHRTbGlkZSA6IGZ1bmN0aW9uICggaW5kZXggKSB7XG5cdFx0XHRcdC8vIENhbGxiYWNrIGZvciBuZXh0IHNsaWRlXG5cdFx0XHR9LFxuXG5cdFx0XHRwcmV2U2xpZGUgOiBmdW5jdGlvbiAoIGluZGV4ICkge1xuXHRcdFx0XHQvLyBDYWxsYmFjayBmb3IgcHJldiBzbGlkZVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZVxuXHRcdFx0ICovXG5cdFx0XHRjbG9zZVNsaWRlIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKCAnaHRtbCcgKS5yZW1vdmVDbGFzcyggJ3N3aXBlYm94LWh0bWwnICk7XG5cdFx0XHRcdCQoICdodG1sJyApLnJlbW92ZUNsYXNzKCAnc3dpcGVib3gtdG91Y2gnICk7XG5cdFx0XHRcdCQoIHdpbmRvdyApLnRyaWdnZXIoICdyZXNpemUnICk7XG5cdFx0XHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZXN0cm95IHRoZSB3aG9sZSB0aGluZ1xuXHRcdFx0ICovXG5cdFx0XHRkZXN0cm95IDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQkKCB3aW5kb3cgKS51bmJpbmQoICdrZXl1cCcgKTtcblx0XHRcdFx0JCggJ2JvZHknICkudW5iaW5kKCAndG91Y2hzdGFydCcgKTtcblx0XHRcdFx0JCggJ2JvZHknICkudW5iaW5kKCAndG91Y2htb3ZlJyApO1xuXHRcdFx0XHQkKCAnYm9keScgKS51bmJpbmQoICd0b3VjaGVuZCcgKTtcblx0XHRcdFx0JCggJyNzd2lwZWJveC1zbGlkZXInICkudW5iaW5kKCk7XG5cdFx0XHRcdCQoICcjc3dpcGVib3gtb3ZlcmxheScgKS5yZW1vdmUoKTtcblxuXHRcdFx0XHRpZiAoICEgJC5pc0FycmF5KCBlbGVtICkgKSB7XG5cdFx0XHRcdFx0ZWxlbS5yZW1vdmVEYXRhKCAnX3N3aXBlYm94JyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCB0aGlzLnRhcmdldCApIHtcblx0XHRcdFx0XHR0aGlzLnRhcmdldC50cmlnZ2VyKCAnc3dpcGVib3gtZGVzdHJveScgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdCQuc3dpcGVib3guaXNPcGVuID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCBwbHVnaW4uc2V0dGluZ3MuYWZ0ZXJDbG9zZSApIHtcblx0XHRcdFx0XHRwbHVnaW4uc2V0dGluZ3MuYWZ0ZXJDbG9zZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHBsdWdpbi5pbml0KCk7XG5cdH07XG5cblx0JC5mbi5zd2lwZWJveCA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG5cdFx0aWYgKCAhICQuZGF0YSggdGhpcywgJ19zd2lwZWJveCcgKSApIHtcblx0XHRcdHZhciBzd2lwZWJveCA9IG5ldyAkLnN3aXBlYm94KCB0aGlzLCBvcHRpb25zICk7XG5cdFx0XHR0aGlzLmRhdGEoICdfc3dpcGVib3gnLCBzd2lwZWJveCApO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5kYXRhKCAnX3N3aXBlYm94JyApO1xuXG5cdH07XG5cbn0oIHdpbmRvdywgZG9jdW1lbnQsIGpRdWVyeSApICk7XG4iXSwiZmlsZSI6ImpxdWVyeS5zd2lwZWJveC5qcyJ9
