/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.YTPlayer.src.js                                                                                                                  _
 _ last modified: 11/05/17 19.54                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2017. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/
var ytp = ytp || {};

function onYouTubeIframeAPIReady() {
	if( ytp.YTAPIReady ) return;
	ytp.YTAPIReady = true;
	jQuery( document ).trigger( "YTAPIReady" );
}

//window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

var getYTPVideoID = function( url ) {
	var videoID, playlistID;
	if( url.indexOf( "youtu.be" ) > 0 ) {
		videoID = url.substr( url.lastIndexOf( "/" ) + 1, url.length );
		playlistID = videoID.indexOf( "?list=" ) > 0 ? videoID.substr( videoID.lastIndexOf( "=" ), videoID.length ) : null;
		videoID = playlistID ? videoID.substr( 0, videoID.lastIndexOf( "?" ) ) : videoID;
	} else if( url.indexOf( "http" ) > -1 ) {
		//videoID = url.match( /([\/&]v\/([^&#]*))|([\\?&]v=([^&#]*))/ )[ 1 ];
		videoID = url.match( /[\\?&]v=([^&#]*)/ )[ 1 ];
		playlistID = url.indexOf( "list=" ) > 0 ? url.match( /[\\?&]list=([^&#]*)/ )[ 1 ] : null;
	} else {
		videoID = url.length > 15 ? null : url;
		playlistID = videoID ? null : url;
	}
	return {
		videoID: videoID,
		playlistID: playlistID
	};
};

( function( jQuery, ytp ) {

	jQuery.mbYTPlayer = {
		name: "jquery.mb.YTPlayer",
		version: "3.0.20",
		build: "6308",
		author: "Matteo Bicocchi (pupunzi)",
		apiKey: "",
		defaults: {
			containment: "body",
			ratio: "auto", // "auto", "16/9", "4/3" or number: 4/3, 16/9
			videoURL: null,
			playlistURL: null,
			startAt: 0,
			stopAt: 0,
			autoPlay: true,
			vol: 50, // 1 to 100
			addRaster: false,
			mask: false,
			opacity: 1,
			quality: "default", //or “small”, “medium”, “large”, “hd720”, “hd1080”, “highres”
			mute: false,
			loop: true,
			fadeOnStartTime: 500, //fade in timing at video start
			showControls: true,
			showAnnotations: false,
			showYTLogo: true,
			stopMovieOnBlur: true,
			realfullscreen: true,
			mobileFallbackImage: null,
			gaTrack: true,
			optimizeDisplay: true,
			remember_last_time: false,
			playOnlyIfVisible: false,
			anchor: "center,center", // top,bottom,left,right combined in pair
			onReady: function( player ) {},
			onError: function( player, err ) {}
		},
		/**
		 *  @fontface icons
		 *  */
		controls: {
			play: "P",
			pause: "p",
			mute: "M",
			unmute: "A",
			onlyYT: "O",
			showSite: "R",
			ytLogo: "Y"
		},
		controlBar: null,
		loading: null,
		locationProtocol: "https:",

		filters: {
			grayscale: {
				value: 0,
				unit: "%"
			},
			hue_rotate: {
				value: 0,
				unit: "deg"
			},
			invert: {
				value: 0,
				unit: "%"
			},
			opacity: {
				value: 0,
				unit: "%"
			},
			saturate: {
				value: 0,
				unit: "%"
			},
			sepia: {
				value: 0,
				unit: "%"
			},
			brightness: {
				value: 0,
				unit: "%"
			},
			contrast: {
				value: 0,
				unit: "%"
			},
			blur: {
				value: 0,
				unit: "px"
			}
		},
		/**
		 *
		 * @param options
		 * @returns [players]
		 */
		buildPlayer: function( options ) {
			return this.each( function() {
				var YTPlayer = this;
				var $YTPlayer = jQuery( YTPlayer );
				YTPlayer.loop = 0;
				YTPlayer.opt = {};
				YTPlayer.state = 0;
				YTPlayer.filters = jQuery.mbYTPlayer.filters;
				YTPlayer.filtersEnabled = true;
				YTPlayer.id = YTPlayer.id || "YTP_" + new Date().getTime();
				$YTPlayer.addClass( "mb_YTPlayer" );

				var property = $YTPlayer.data( "property" ) && typeof $YTPlayer.data( "property" ) == "string" ? eval( '(' + $YTPlayer.data( "property" ) + ')' ) : $YTPlayer.data( "property" );

				if( typeof property != "undefined" && typeof property.vol != "undefined" ) {
					if( property.vol === 0 ) {
						property.vol = 1;
						property.mute = true;
					}
				}

				jQuery.extend( YTPlayer.opt, jQuery.mbYTPlayer.defaults, options, property );

				if( !YTPlayer.hasChanged ) {
					YTPlayer.defaultOpt = {};
					jQuery.extend( YTPlayer.defaultOpt, jQuery.mbYTPlayer.defaults, options );
				}

				if( YTPlayer.opt.loop == "true" )
					YTPlayer.opt.loop = 9999;

				YTPlayer.isRetina = ( window.retina || window.devicePixelRatio > 1 );
				var isIframe = function() {
					var isIfr = false;
					try {
						if( self.location.href != top.location.href ) isIfr = true;
					} catch( e ) {
						isIfr = true;
					}
					return isIfr;
				};

				YTPlayer.canGoFullScreen = !( jQuery.mbBrowser.msie || jQuery.mbBrowser.opera || isIframe() );
				if( !YTPlayer.canGoFullScreen ) YTPlayer.opt.realfullscreen = false;
				if( !$YTPlayer.attr( "id" ) ) $YTPlayer.attr( "id", "ytp_" + new Date().getTime() );
				var playerID = "iframe_" + YTPlayer.id;
				YTPlayer.isAlone = false;
				YTPlayer.hasFocus = true;
				YTPlayer.videoID = this.opt.videoURL ? getYTPVideoID( this.opt.videoURL ).videoID : $YTPlayer.attr( "href" ) ? getYTPVideoID( $YTPlayer.attr( "href" ) ).videoID : false;
				YTPlayer.playlistID = this.opt.videoURL ? getYTPVideoID( this.opt.videoURL ).playlistID : $YTPlayer.attr( "href" ) ? getYTPVideoID( $YTPlayer.attr( "href" ) ).playlistID : false;

				YTPlayer.opt.showAnnotations = YTPlayer.opt.showAnnotations ? '1' : '3';

				var start_from_last = 0;

				if( jQuery.mbCookie.get( "YTPlayer_start_from" + YTPlayer.videoID ) )
					start_from_last = parseFloat( jQuery.mbCookie.get( "YTPlayer_start_from" + YTPlayer.videoID ) );

				if( YTPlayer.opt.remember_last_time && start_from_last ) {
					YTPlayer.start_from_last = start_from_last;
					jQuery.mbCookie.remove( "YTPlayer_start_from" + YTPlayer.videoID );
				}

				if( jQuery.isTablet )
					YTPlayer.opt.autoPlay = false;

				var playerVars = {
					'modestbranding': 1,
					'autoplay': jQuery.isTablet ? 0 : 0,
					'controls': 0,
					'showinfo': 0,
					'rel': 0,
					'enablejsapi': 1,
					'version': 3,
					'playerapiid': playerID,
					'origin': '*',
					'allowfullscreen': true,
					'wmode': 'transparent',
					'iv_load_policy': YTPlayer.opt.showAnnotations,
					'playsinline': 1
				};


				if( document.createElement( 'video' ).canPlayType ) jQuery.extend( playerVars, {
					'html5': 1
				} );
				if( jQuery.mbBrowser.msie && jQuery.mbBrowser.version < 9 ) this.opt.opacity = 1;

				YTPlayer.isSelf = YTPlayer.opt.containment == "self";
				YTPlayer.defaultOpt.containment = YTPlayer.opt.containment = YTPlayer.opt.containment == "self" ? jQuery( this ) : jQuery( YTPlayer.opt.containment );
				YTPlayer.isBackground = YTPlayer.opt.containment.is( "body" );

				if( YTPlayer.isBackground && ytp.backgroundIsInited )
					return;

				var isPlayer = YTPlayer.opt.containment.is( jQuery( this ) );

				YTPlayer.canPlayOnMobile = isPlayer && jQuery( this ).children().length === 0;
				YTPlayer.isPlayer = false;

				/**
				 * Hide the placeholder if it's not the target of the player
				 */
				if( !isPlayer ) {
					$YTPlayer.hide();
				} else {
					YTPlayer.isPlayer = true;
				}

				var overlay = jQuery( "<div/>" ).css( {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%"
				} ).addClass( "YTPOverlay" );

				if( YTPlayer.isPlayer ) {
					overlay.on( "click", function() {
						$YTPlayer.YTPTogglePlay();
					} );
				}

				var wrapper = jQuery( "<div/>" ).addClass( "mbYTP_wrapper" ).attr( "id", "wrapper_" + YTPlayer.id );
				wrapper.css( {
					position: "absolute",
					zIndex: 0,
					minWidth: "100%",
					minHeight: "100%",
					left: 0,
					top: 0,
					overflow: "hidden",
					opacity: 0
				} );

				var playerBox = jQuery( "<div/>" ).attr( "id", playerID ).addClass( "playerBox" );
				playerBox.css( {
					position: "absolute",
					zIndex: 0,
					width: "100%",
					height: "100%",
					top: 0,
					left: 0,
					overflow: "hidden"
				} );

				wrapper.append( playerBox );

				YTPlayer.opt.containment.children().not( "script, style" ).each( function() {
					if( jQuery( this ).css( "position" ) == "static" ) jQuery( this ).css( "position", "relative" );
				} );

				if( YTPlayer.isBackground ) {
					jQuery( "body" ).css( {
						boxSizing: "border-box"
					} );

					wrapper.css( {
						position: "fixed",
						top: 0,
						left: 0,
						zIndex: 0
					} );

					$YTPlayer.hide();

				} else if( YTPlayer.opt.containment.css( "position" ) == "static" )
					YTPlayer.opt.containment.css( {
						position: "relative"
					} );

				YTPlayer.opt.containment.prepend( wrapper );
				YTPlayer.wrapper = wrapper;

				playerBox.css( {
					opacity: 1
				} );

				//if( !jQuery.mbBrowser.mobile ) {
				playerBox.after( overlay );
				YTPlayer.overlay = overlay;
				//	}

				if( jQuery.isTablet )
					jQuery( "body" ).one( "touchstart", function() {
						YTPlayer.player.playVideo();
					} );

				if( !YTPlayer.isBackground ) {
					overlay.on( "mouseenter", function() {
						if( YTPlayer.controlBar && YTPlayer.controlBar.length )
							YTPlayer.controlBar.addClass( "visible" );
					} ).on( "mouseleave", function() {
						if( YTPlayer.controlBar && YTPlayer.controlBar.length )
							YTPlayer.controlBar.removeClass( "visible" );
					} );
				}

				if( !ytp.YTAPIReady ) {
					jQuery( "#YTAPI" ).remove();
					var tag = jQuery( "<script/>" ).attr( {
						"async": "async",
						"src": jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/iframe_api?v=" + jQuery.mbYTPlayer.version,
						"id": "YTAPI"
					} );
					jQuery( "head" ).prepend( tag );
				} else {
					setTimeout( function() {
						jQuery( document ).trigger( "YTAPIReady" );
					}, 100 );
				}

				console.debug( jQuery.mbBrowser.mobile, jQuery.isTablet, YTPlayer.canPlayOnMobile );
				if( jQuery.mbBrowser.mobile && !jQuery.isTablet && !YTPlayer.canPlayOnMobile ) {

					if( YTPlayer.opt.mobileFallbackImage ) {
						wrapper.css( {
							backgroundImage: "url(" + YTPlayer.opt.mobileFallbackImage + ")",
							backgroundPosition: "center center",
							backgroundSize: "cover",
							backgroundRepeat: "no-repeat",
							opacity: 1
						} );
					}

					if( !YTPlayer.isPlayer )
						$YTPlayer.remove();
					jQuery( document ).trigger( "YTPUnavailable" );
					return;
				}

				jQuery( document ).on( "YTAPIReady", function() {
					if( ( YTPlayer.isBackground && ytp.backgroundIsInited ) || YTPlayer.isInit ) return;
					if( YTPlayer.isBackground ) {
						ytp.backgroundIsInited = true;
					}

					YTPlayer.opt.autoPlay = typeof YTPlayer.opt.autoPlay == "undefined" ? ( YTPlayer.isBackground ? true : false ) : YTPlayer.opt.autoPlay;
					YTPlayer.opt.vol = YTPlayer.opt.vol ? YTPlayer.opt.vol : 100;
					jQuery.mbYTPlayer.getDataFromAPI( YTPlayer );
					jQuery( YTPlayer ).on( "YTPChanged", function() {

						if( YTPlayer.isInit )
							return;

						YTPlayer.isInit = true;

						//if is mobile && isPlayer fallback to the default YT player
						if( jQuery.mbBrowser.mobile && YTPlayer.canPlayOnMobile && !jQuery.isTablet ) {
							// Try to adjust the player dimention
							if( YTPlayer.opt.containment.outerWidth() > jQuery( window ).width() ) {
								YTPlayer.opt.containment.css( {
									maxWidth: "100%"
								} );
								var h = YTPlayer.opt.containment.outerWidth() * .563;
								YTPlayer.opt.containment.css( {
									maxHeight: h
								} );
							}
							new YT.Player( playerID, {
								videoId: YTPlayer.videoID.toString(),
								width: '100%',
								height: h,
								playerVars: playerVars,
								events: {
									'onReady': function( event ) {
										YTPlayer.player = event.target;
										playerBox.css( {
											opacity: 1
										} );
										YTPlayer.wrapper.css( {
											opacity: 1
										} );
									}
								}
							} );
							return;
						}

						new YT.Player( playerID, {
							videoId: YTPlayer.videoID.toString(),
							playerVars: playerVars,
							events: {
								'onReady': function( event ) {
									YTPlayer.player = event.target;
									if( YTPlayer.isReady ) return;
									YTPlayer.isReady = YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ? false : true;
									YTPlayer.playerEl = YTPlayer.player.getIframe();

									jQuery( YTPlayer.playerEl ).unselectable();

									$YTPlayer.optimizeDisplay();
									jQuery( window ).off( "resize.YTP_" + YTPlayer.id ).on( "resize.YTP_" + YTPlayer.id, function() {
										$YTPlayer.optimizeDisplay();
									} );

									if( YTPlayer.opt.remember_last_time ) {

										jQuery( window ).on( "unload.YTP_" + YTPlayer.id, function() {
											var current_time = YTPlayer.player.getCurrentTime();

											jQuery.mbCookie.set( "YTPlayer_start_from" + YTPlayer.videoID, current_time, 0 );
										} );

									}

									jQuery.mbYTPlayer.checkForState( YTPlayer );
								},
								/**
								 *
								 * @param event
								 *
								 * -1 (unstarted)
								 * 0 (ended)
								 * 1 (playing)
								 * 2 (paused)
								 * 3 (buffering)
								 * 5 (video cued).
								 *
								 *
								 */
								'onStateChange': function( event ) {
									if( typeof event.target.getPlayerState != "function" ) return;
									var state = event.target.getPlayerState();

									if( YTPlayer.preventTrigger ) {
										YTPlayer.preventTrigger = false;
										return;
									}

									YTPlayer.state = state;

									var eventType;
									switch( state ) {
										case -1: //----------------------------------------------- unstarted
											eventType = "YTPUnstarted";
											break;
										case 0: //------------------------------------------------ ended
											eventType = "YTPRealEnd";
											break;
										case 1: //------------------------------------------------ play
											eventType = "YTPPlay";
											if( YTPlayer.controlBar.length )
												YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.pause );
											if( typeof _gaq != "undefined" && eval( YTPlayer.opt.gaTrack ) ) _gaq.push( [ '_trackEvent', 'YTPlayer', 'Play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() ) ] );
											if( typeof ga != "undefined" && eval( YTPlayer.opt.gaTrack ) ) ga( 'send', 'event', 'YTPlayer', 'play', ( YTPlayer.hasData ? YTPlayer.videoData.title : YTPlayer.videoID.toString() ) );
											break;
										case 2: //------------------------------------------------ pause
											eventType = "YTPPause";
											if( YTPlayer.controlBar.length )
												YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );
											break;
										case 3: //------------------------------------------------ buffer
											YTPlayer.player.setPlaybackQuality( YTPlayer.opt.quality );
											eventType = "YTPBuffering";
											if( YTPlayer.controlBar.length )
												YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );
											break;
										case 5: //------------------------------------------------ cued
											eventType = "YTPCued";
											break;
										default:
											break;
									}

									// Trigger state events
									var YTPEvent = jQuery.Event( eventType );
									YTPEvent.time = YTPlayer.currentTime;
									if( YTPlayer.canTrigger )
										jQuery( YTPlayer ).trigger( YTPEvent );
								},
								/**
								 *
								 * @param e
								 */
								'onPlaybackQualityChange': function( e ) {
									var quality = e.target.getPlaybackQuality();
									var YTPQualityChange = jQuery.Event( "YTPQualityChange" );
									YTPQualityChange.quality = quality;
									jQuery( YTPlayer ).trigger( YTPQualityChange );
								},
								/**
								 *
								 * @param err
								 */
								'onError': function( err ) {

									if( err.data == 150 ) {
										console.log( "Embedding this video is restricted by Youtube." );
										if( YTPlayer.isPlayList )
											jQuery( YTPlayer ).playNext();
									}

									if( err.data == 2 && YTPlayer.isPlayList ) {
										jQuery( YTPlayer ).playNext();
									}

									if( typeof YTPlayer.opt.onError == "function" )
										YTPlayer.opt.onError( $YTPlayer, err );
								}
							}
						} );
					} );
				} );

				$YTPlayer.off( "YTPTime.mask" );

				jQuery.mbYTPlayer.applyMask( YTPlayer );

			} );
		},

		/**
		 * Check if the YTPlayer is on screen
		 */
		isOnScreen: function( YTPlayer ) {

			var playerBox = YTPlayer.wrapper;

			var winTop = $( window ).scrollTop();
			var winBottom = winTop + $( window ).height();
			var elTop = playerBox.offset().top;
			var elBottom = elTop + playerBox.height();
			return( ( elBottom <= winBottom ) && ( elTop >= winTop ) );

		},

		/**
		 *
		 * @param YTPlayer
		 */
		getDataFromAPI: function( YTPlayer ) {
			YTPlayer.videoData = jQuery.mbStorage.get( "YTPlayer_data_" + YTPlayer.videoID );
			jQuery( YTPlayer ).off( "YTPData.YTPlayer" ).on( "YTPData.YTPlayer", function() {
				if( YTPlayer.hasData ) {

					if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
						var bgndURL = YTPlayer.videoData.thumb_max || YTPlayer.videoData.thumb_high || YTPlayer.videoData.thumb_medium;

						YTPlayer.opt.containment.css( {
							background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
							backgroundSize: "cover"
						} );
						YTPlayer.opt.backgroundUrl = bgndURL;
					}
				}
			} );

			if( YTPlayer.videoData ) {

				setTimeout( function() {
					YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
					YTPlayer.dataReceived = true;
					jQuery( YTPlayer ).trigger( "YTPChanged" );
					var YTPData = jQuery.Event( "YTPData" );
					YTPData.prop = {};
					for( var x in YTPlayer.videoData ) YTPData.prop[ x ] = YTPlayer.videoData[ x ];
					jQuery( YTPlayer ).trigger( YTPData );
				}, YTPlayer.opt.fadeOnStartTime );

				YTPlayer.hasData = true;
			} else if( jQuery.mbYTPlayer.apiKey ) {
				// Get video info from API3 (needs api key)
				// snippet,player,contentDetails,statistics,status
				jQuery.getJSON( jQuery.mbYTPlayer.locationProtocol + "//www.googleapis.com/youtube/v3/videos?id=" + YTPlayer.videoID + "&key=" + jQuery.mbYTPlayer.apiKey + "&part=snippet", function( data ) {
					YTPlayer.dataReceived = true;
					jQuery( YTPlayer ).trigger( "YTPChanged" );

					function parseYTPlayer_data( data ) {
						YTPlayer.videoData = {};
						YTPlayer.videoData.id = YTPlayer.videoID;
						YTPlayer.videoData.channelTitle = data.channelTitle;
						YTPlayer.videoData.title = data.title;
						YTPlayer.videoData.description = data.description.length < 400 ? data.description : data.description.substring( 0, 400 ) + " ...";
						YTPlayer.videoData.aspectratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
						YTPlayer.opt.ratio = YTPlayer.videoData.aspectratio;
						YTPlayer.videoData.thumb_max = data.thumbnails.maxres ? data.thumbnails.maxres.url : null;
						YTPlayer.videoData.thumb_high = data.thumbnails.high ? data.thumbnails.high.url : null;
						YTPlayer.videoData.thumb_medium = data.thumbnails.medium ? data.thumbnails.medium.url : null;
						jQuery.mbStorage.set( "YTPlayer_data_" + YTPlayer.videoID, YTPlayer.videoData );
					}

					parseYTPlayer_data( data.items[ 0 ].snippet );
					YTPlayer.hasData = true;
					var YTPData = jQuery.Event( "YTPData" );
					YTPData.prop = {};
					for( var x in YTPlayer.videoData ) YTPData.prop[ x ] = YTPlayer.videoData[ x ];
					jQuery( YTPlayer ).trigger( YTPData );
				} );
			} else {
				setTimeout( function() {
					jQuery( YTPlayer ).trigger( "YTPChanged" );
				}, 50 );
				if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay ) {
					var bgndURL = jQuery.mbYTPlayer.locationProtocol + "//i.ytimg.com/vi/" + YTPlayer.videoID + "/hqdefault.jpg";

					if( bgndURL )
						YTPlayer.opt.containment.css( {
							background: "rgba(0,0,0,0.5) url(" + bgndURL + ") center center",
							backgroundSize: "cover"
						} );
					YTPlayer.opt.backgroundUrl = bgndURL;

				}
				YTPlayer.videoData = null;
				YTPlayer.opt.ratio = YTPlayer.opt.ratio == "auto" ? "16/9" : YTPlayer.opt.ratio;
			}
			if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay && ( !jQuery.mbBrowser.mobile && !jQuery.isTablet ) ) {
				YTPlayer.loading = jQuery( "<div/>" ).addClass( "loading" ).html( "Loading" ).hide();
				jQuery( YTPlayer ).append( YTPlayer.loading );
				YTPlayer.loading.fadeIn();
			}
		},
		/**
		 *
		 */
		removeStoredData: function() {
			jQuery.mbStorage.remove();
		},
		/**
		 *
		 * @returns {*|YTPlayer.videoData}
		 */
		getVideoData: function() {
			var YTPlayer = this.get( 0 );
			return YTPlayer.videoData;
		},
		/**
		 *
		 * @returns {*|YTPlayer.videoID|boolean}
		 */
		getVideoID: function() {
			var YTPlayer = this.get( 0 );
			return YTPlayer.videoID || false;
		},
		/**
		 *
		 * @param quality
		 */
		setVideoQuality: function( quality ) {
			var YTPlayer = this.get( 0 );
			YTPlayer.player.setPlaybackQuality( quality );
		},
		/**
		 *
		 * @param videos
		 * @param shuffle
		 * @param callback
		 * @returns {jQuery.mbYTPlayer}
		 */
		playlist: function( videos, shuffle, callback ) {
			var $YTPlayer = this;
			var YTPlayer = $YTPlayer.get( 0 );
			YTPlayer.isPlayList = true;
			if( shuffle ) videos = jQuery.shuffle( videos );
			if( !YTPlayer.videoID ) {
				YTPlayer.videos = videos;
				YTPlayer.videoCounter = 0;
				YTPlayer.videoLength = videos.length;
				jQuery( YTPlayer ).data( "property", videos[ 0 ] );
				jQuery( YTPlayer ).mb_YTPlayer();
			}
			if( typeof callback == "function" ) jQuery( YTPlayer ).one( "YTPChanged", function() {
				callback( YTPlayer );
			} );
			jQuery( YTPlayer ).on( "YTPEnd", function() {
				jQuery( YTPlayer ).playNext();
			} );
			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		playNext: function() {
			var YTPlayer = this.get( 0 );

			if( YTPlayer.checkForStartAt ) {
				clearInterval( YTPlayer.checkForStartAt );
				clearInterval( YTPlayer.getState );
			}

			YTPlayer.videoCounter++;

			if( YTPlayer.videoCounter >= YTPlayer.videoLength )
				YTPlayer.videoCounter = 0;

			jQuery( YTPlayer ).YTPChangeMovie( YTPlayer.videos[ YTPlayer.videoCounter ] );

			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		playPrev: function() {
			var YTPlayer = this.get( 0 );

			if( YTPlayer.checkForStartAt ) {
				clearInterval( YTPlayer.checkForStartAt );
				clearInterval( YTPlayer.getState );
			}

			YTPlayer.videoCounter--;

			if( YTPlayer.videoCounter < 0 )
				YTPlayer.videoCounter = YTPlayer.videoLength - 1;

			jQuery( YTPlayer ).YTPChangeMovie( YTPlayer.videos[ YTPlayer.videoCounter ] );

			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		playIndex: function( idx ) {
			var YTPlayer = this.get( 0 );

			idx = idx - 1;

			if( YTPlayer.checkForStartAt ) {
				clearInterval( YTPlayer.checkForStartAt );
				clearInterval( YTPlayer.getState );
			}

			YTPlayer.videoCounter = idx;
			if( YTPlayer.videoCounter >= YTPlayer.videoLength - 1 )
				YTPlayer.videoCounter = YTPlayer.videoLength - 1;
			jQuery( YTPlayer ).YTPChangeMovie( YTPlayer.videos[ YTPlayer.videoCounter ] );
			return this;
		},
		/**
		 *
		 * @param opt
		 */
		changeMovie: function( opt ) {

			var $YTPlayer = this;
			var YTPlayer = $YTPlayer.get( 0 );
			YTPlayer.opt.startAt = 0;
			YTPlayer.opt.stopAt = 0;
			YTPlayer.opt.mask = false;
			YTPlayer.opt.mute = true;
			YTPlayer.hasData = false;
			YTPlayer.hasChanged = true;
			YTPlayer.player.loopTime = undefined;

			if( opt )
				jQuery.extend( YTPlayer.opt, opt ); //YTPlayer.defaultOpt,
			YTPlayer.videoID = getYTPVideoID( YTPlayer.opt.videoURL ).videoID;

			if( YTPlayer.opt.loop == "true" )
				YTPlayer.opt.loop = 9999;

			jQuery( YTPlayer.playerEl ).CSSAnimate( {
				opacity: 0
			}, YTPlayer.opt.fadeOnStartTime, function() {

				var YTPChangeMovie = jQuery.Event( "YTPChangeMovie" );
				YTPChangeMovie.time = YTPlayer.currentTime;
				YTPChangeMovie.videoId = YTPlayer.videoID;
				jQuery( YTPlayer ).trigger( YTPChangeMovie );

				jQuery( YTPlayer ).YTPGetPlayer().cueVideoByUrl( encodeURI( jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/v/" + YTPlayer.videoID ), 1, YTPlayer.opt.quality );
				jQuery( YTPlayer ).optimizeDisplay();

				jQuery.mbYTPlayer.checkForState( YTPlayer );
				jQuery.mbYTPlayer.getDataFromAPI( YTPlayer );

			} );

			jQuery.mbYTPlayer.applyMask( YTPlayer );
		},
		/**
		 *
		 * @returns {player}
		 */
		getPlayer: function() {
			return jQuery( this ).get( 0 ).player;
		},

		playerDestroy: function() {
			var YTPlayer = this.get( 0 );
			ytp.YTAPIReady = true;
			ytp.backgroundIsInited = false;
			YTPlayer.isInit = false;
			YTPlayer.videoID = null;
			YTPlayer.isReady = false;
			var playerBox = YTPlayer.wrapper;
			playerBox.remove();
			jQuery( "#controlBar_" + YTPlayer.id ).remove();
			clearInterval( YTPlayer.checkForStartAt );
			clearInterval( YTPlayer.getState );
			return this;
		},

		/**
		 *
		 * @param real
		 * @returns {jQuery.mbYTPlayer}
		 */
		fullscreen: function( real ) {
			var YTPlayer = this.get( 0 );
			if( typeof real == "undefined" ) real = YTPlayer.opt.realfullscreen;
			real = eval( real );
			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var fullScreenBtn = controls.find( ".mb_OnlyYT" );
			var videoWrapper = YTPlayer.isSelf ? YTPlayer.opt.containment : YTPlayer.wrapper;
			//var videoWrapper = YTPlayer.wrapper;
			if( real ) {
				var fullscreenchange = jQuery.mbBrowser.mozilla ? "mozfullscreenchange" : jQuery.mbBrowser.webkit ? "webkitfullscreenchange" : "fullscreenchange";
				jQuery( document ).off( fullscreenchange ).on( fullscreenchange, function() {
					var isFullScreen = RunPrefixMethod( document, "IsFullScreen" ) || RunPrefixMethod( document, "FullScreen" );
					if( !isFullScreen ) {
						YTPlayer.isAlone = false;
						fullScreenBtn.html( jQuery.mbYTPlayer.controls.onlyYT );
						jQuery( YTPlayer ).YTPSetVideoQuality( YTPlayer.opt.quality );
						videoWrapper.removeClass( "YTPFullscreen" );
						videoWrapper.CSSAnimate( {
							opacity: YTPlayer.opt.opacity
						}, YTPlayer.opt.fadeOnStartTime );
						videoWrapper.css( {
							zIndex: 0
						} );
						if( YTPlayer.isBackground ) {
							jQuery( "body" ).after( controls );
						} else {
							YTPlayer.wrapper.before( controls );
						}
						jQuery( window ).resize();
						jQuery( YTPlayer ).trigger( "YTPFullScreenEnd" );
					} else {
						jQuery( YTPlayer ).YTPSetVideoQuality( "default" );
						jQuery( YTPlayer ).trigger( "YTPFullScreenStart" );
					}
				} );
			}
			if( !YTPlayer.isAlone ) {
				function hideMouse() {
					YTPlayer.overlay.css( {
						cursor: "none"
					} );
				}

				jQuery( document ).on( "mousemove.YTPlayer", function( e ) {
					YTPlayer.overlay.css( {
						cursor: "auto"
					} );
					clearTimeout( YTPlayer.hideCursor );
					if( !jQuery( e.target ).parents().is( ".mb_YTPBar" ) ) YTPlayer.hideCursor = setTimeout( hideMouse, 3000 );
				} );
				hideMouse();
				if( real ) {
					videoWrapper.css( {
						opacity: 0
					} );
					videoWrapper.addClass( "YTPFullscreen" );
					launchFullscreen( videoWrapper.get( 0 ) );
					setTimeout( function() {
						videoWrapper.CSSAnimate( {
							opacity: 1
						}, YTPlayer.opt.fadeOnStartTime * 2 );
						YTPlayer.wrapper.append( controls );
						jQuery( YTPlayer ).optimizeDisplay();
						YTPlayer.player.seekTo( YTPlayer.player.getCurrentTime() + .1, true );
					}, YTPlayer.opt.fadeOnStartTime );
				} else videoWrapper.css( {
					zIndex: 10000
				} ).CSSAnimate( {
					opacity: 1
				}, YTPlayer.opt.fadeOnStartTime * 2 );
				fullScreenBtn.html( jQuery.mbYTPlayer.controls.showSite );
				YTPlayer.isAlone = true;
			} else {
				jQuery( document ).off( "mousemove.YTPlayer" );
				clearTimeout( YTPlayer.hideCursor );
				YTPlayer.overlay.css( {
					cursor: "auto"
				} );
				if( real ) {
					cancelFullscreen();
				} else {
					videoWrapper.CSSAnimate( {
						opacity: YTPlayer.opt.opacity
					}, YTPlayer.opt.fadeOnStartTime );
					videoWrapper.css( {
						zIndex: 0
					} );
				}
				fullScreenBtn.html( jQuery.mbYTPlayer.controls.onlyYT );
				YTPlayer.isAlone = false;
			}

			function RunPrefixMethod( obj, method ) {
				var pfx = [ "webkit", "moz", "ms", "o", "" ];
				var p = 0,
					m, t;
				while( p < pfx.length && !obj[ m ] ) {
					m = method;
					if( pfx[ p ] == "" ) {
						m = m.substr( 0, 1 ).toLowerCase() + m.substr( 1 );
					}
					m = pfx[ p ] + m;
					t = typeof obj[ m ];
					if( t != "undefined" ) {
						pfx = [ pfx[ p ] ];
						return( t == "function" ? obj[ m ]() : obj[ m ] );
					}
					p++;
				}
			}

			function launchFullscreen( element ) {
				RunPrefixMethod( element, "RequestFullScreen" );
			}

			function cancelFullscreen() {
				if( RunPrefixMethod( document, "FullScreen" ) || RunPrefixMethod( document, "IsFullScreen" ) ) {
					RunPrefixMethod( document, "CancelFullScreen" );
				}
			}

			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		toggleLoops: function() {
			var YTPlayer = this.get( 0 );
			var data = YTPlayer.opt;
			if( data.loop == 1 ) {
				data.loop = 0;
			} else {
				if( data.startAt ) {
					YTPlayer.player.seekTo( data.startAt );
				} else {
					YTPlayer.player.playVideo();
				}
				data.loop = 1;
			}
			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		play: function() {
			var YTPlayer = this.get( 0 );
			if( !YTPlayer.isReady )
				return this;

			YTPlayer.player.playVideo();
			YTPlayer.wrapper.CSSAnimate( {
				opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
			}, YTPlayer.opt.fadeOnStartTime * 4 );

			jQuery( YTPlayer.playerEl ).CSSAnimate( {
				opacity: 1
			}, YTPlayer.opt.fadeOnStartTime * 2 );

			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var playBtn = controls.find( ".mb_YTPPlaypause" );
			playBtn.html( jQuery.mbYTPlayer.controls.pause );
			YTPlayer.state = 1;
			YTPlayer.orig_background = jQuery( YTPlayer ).css( "background-image" );

			return this;
		},
		/**
		 *
		 * @param callback
		 * @returns {jQuery.mbYTPlayer}
		 */
		togglePlay: function( callback ) {
			var YTPlayer = this.get( 0 );
			if( YTPlayer.state == 1 )
				this.YTPPause();
			else
				this.YTPPlay();

			if( typeof callback == "function" )
				callback( YTPlayer.state );

			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		stop: function() {
			var YTPlayer = this.get( 0 );
			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var playBtn = controls.find( ".mb_YTPPlaypause" );
			playBtn.html( jQuery.mbYTPlayer.controls.play );
			YTPlayer.player.stopVideo();
			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		pause: function() {
			var YTPlayer = this.get( 0 );
			YTPlayer.player.pauseVideo();
			YTPlayer.state = 2;
			return this;
		},
		/**
		 *
		 * @param val
		 * @returns {jQuery.mbYTPlayer}
		 */
		seekTo: function( val ) {
			var YTPlayer = this.get( 0 );
			YTPlayer.player.seekTo( val, true );
			return this;
		},
		/**
		 *
		 * @param val
		 * @returns {jQuery.mbYTPlayer}
		 */
		setVolume: function( val ) {
			var YTPlayer = this.get( 0 );
			if( !val && !YTPlayer.opt.vol && YTPlayer.player.getVolume() == 0 ) jQuery( YTPlayer ).YTPUnmute();
			else if( ( !val && YTPlayer.player.getVolume() > 0 ) || ( val && YTPlayer.opt.vol == val ) ) {
				if( !YTPlayer.isMute ) jQuery( YTPlayer ).YTPMute();
				else jQuery( YTPlayer ).YTPUnmute();
			} else {
				YTPlayer.opt.vol = val;
				YTPlayer.player.setVolume( YTPlayer.opt.vol );
				if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.updateSliderVal( val );
			}
			return this;
		},
		/**
		 *
		 * @returns {boolean}
		 */
		toggleVolume: function() {
			var YTPlayer = this.get( 0 );
			if( !YTPlayer ) return;
			if( YTPlayer.player.isMuted() ) {
				jQuery( YTPlayer ).YTPUnmute();
				return true;
			} else {
				jQuery( YTPlayer ).YTPMute();
				return false;
			}
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		mute: function() {
			var YTPlayer = this.get( 0 );
			if( YTPlayer.isMute ) return;
			YTPlayer.player.mute();
			YTPlayer.isMute = true;
			YTPlayer.player.setVolume( 0 );
			if( YTPlayer.volumeBar && YTPlayer.volumeBar.length && YTPlayer.volumeBar.width() > 10 ) {
				YTPlayer.volumeBar.updateSliderVal( 0 );
			}
			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var muteBtn = controls.find( ".mb_YTPMuteUnmute" );
			muteBtn.html( jQuery.mbYTPlayer.controls.unmute );
			jQuery( YTPlayer ).addClass( "isMuted" );
			if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.addClass( "muted" );
			var YTPEvent = jQuery.Event( "YTPMuted" );
			YTPEvent.time = YTPlayer.currentTime;
			if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
			return this;
		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		unmute: function() {
			var YTPlayer = this.get( 0 );
			if( !YTPlayer.isMute ) return;
			YTPlayer.player.unMute();
			YTPlayer.isMute = false;
			YTPlayer.player.setVolume( YTPlayer.opt.vol );
			if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol > 10 ? YTPlayer.opt.vol : 10 );
			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var muteBtn = controls.find( ".mb_YTPMuteUnmute" );
			muteBtn.html( jQuery.mbYTPlayer.controls.mute );
			jQuery( YTPlayer ).removeClass( "isMuted" );
			if( YTPlayer.volumeBar && YTPlayer.volumeBar.length ) YTPlayer.volumeBar.removeClass( "muted" );
			var YTPEvent = jQuery.Event( "YTPUnmuted" );
			YTPEvent.time = YTPlayer.currentTime;
			if( YTPlayer.canTrigger ) jQuery( YTPlayer ).trigger( YTPEvent );
			return this;
		},
		/**
		 * FILTERS
		 *
		 *
		 * @param filter
		 * @param value
		 * @returns {jQuery.mbYTPlayer}
		 */
		applyFilter: function( filter, value ) {
			return this.each( function() {
				var YTPlayer = this;
				YTPlayer.filters[ filter ].value = value;
				if( YTPlayer.filtersEnabled )
					jQuery( YTPlayer ).YTPEnableFilters();
			} );
		},
		/**
		 *
		 * @param filters
		 * @returns {jQuery.mbYTPlayer}
		 */
		applyFilters: function( filters ) {
			return this.each( function() {
				var YTPlayer = this;
				if( !YTPlayer.isReady ) {
					jQuery( YTPlayer ).on( "YTPReady", function() {
						jQuery( YTPlayer ).YTPApplyFilters( filters );
					} );
					return;
				}

				for( var key in filters )
					jQuery( YTPlayer ).YTPApplyFilter( key, filters[ key ] );

				jQuery( YTPlayer ).trigger( "YTPFiltersApplied" );
			} );
		},
		/**
		 *
		 * @param filter
		 * @param value
		 * @returns {*}
		 */
		toggleFilter: function( filter, value ) {
			return this.each( function() {
				var YTPlayer = this;
				if( !YTPlayer.filters[ filter ].value ) YTPlayer.filters[ filter ].value = value;
				else YTPlayer.filters[ filter ].value = 0;
				if( YTPlayer.filtersEnabled ) jQuery( this ).YTPEnableFilters();
			} );
		},
		/**
		 *
		 * @param callback
		 * @returns {*}
		 */
		toggleFilters: function( callback ) {
			return this.each( function() {
				var YTPlayer = this;
				if( YTPlayer.filtersEnabled ) {
					jQuery( YTPlayer ).trigger( "YTPDisableFilters" );
					jQuery( YTPlayer ).YTPDisableFilters();
				} else {
					jQuery( YTPlayer ).YTPEnableFilters();
					jQuery( YTPlayer ).trigger( "YTPEnableFilters" );
				}
				if( typeof callback == "function" )
					callback( YTPlayer.filtersEnabled );
			} );
		},
		/**
		 *
		 * @returns {*}
		 */
		disableFilters: function() {
			return this.each( function() {
				var YTPlayer = this;
				var iframe = jQuery( YTPlayer.playerEl );
				iframe.css( "-webkit-filter", "" );
				iframe.css( "filter", "" );
				YTPlayer.filtersEnabled = false;
			} );
		},
		/**
		 *
		 * @returns {*}
		 */
		enableFilters: function() {
			return this.each( function() {
				var YTPlayer = this;
				var iframe = jQuery( YTPlayer.playerEl );
				var filterStyle = "";
				for( var key in YTPlayer.filters ) {
					if( YTPlayer.filters[ key ].value )
						filterStyle += key.replace( "_", "-" ) + "(" + YTPlayer.filters[ key ].value + YTPlayer.filters[ key ].unit + ") ";
				}
				iframe.css( "-webkit-filter", filterStyle );
				iframe.css( "filter", filterStyle );
				YTPlayer.filtersEnabled = true;
			} );
		},
		/**
		 *
		 * @param filter
		 * @param callback
		 * @returns {*}
		 */
		removeFilter: function( filter, callback ) {
			return this.each( function() {
				var YTPlayer = this;
				if( typeof filter == "function" ) {
					callback = filter;
					filter = null;
				}
				if( !filter )
					for( var key in YTPlayer.filters ) {
						jQuery( this ).YTPApplyFilter( key, 0 );
						if( typeof callback == "function" ) callback( key );
					} else {
						jQuery( this ).YTPApplyFilter( filter, 0 );
						if( typeof callback == "function" ) callback( filter );
					}
			} );

		},
		/**
		 *
		 * @returns {*}
		 */
		getFilters: function() {
			var YTPlayer = this.get( 0 );
			return YTPlayer.filters;
		},
		/**
		 * MASK
		 *
		 *
		 * @param mask
		 * @returns {jQuery.mbYTPlayer}
		 */
		addMask: function( mask ) {
			var YTPlayer = this.get( 0 );
			var overlay = YTPlayer.overlay;

			if( !mask ) {
				mask = YTPlayer.actualMask;
			}

			var tempImg = jQuery( "<img/>" ).attr( "src", mask ).on( "load", function() {

				overlay.CSSAnimate( {
					opacity: 0
				}, YTPlayer.opt.fadeOnStartTime, function() {

					YTPlayer.hasMask = true;

					tempImg.remove();

					overlay.css( {
						backgroundImage: "url(" + mask + ")",
						backgroundRepeat: "no-repeat",
						backgroundPosition: "center center",
						backgroundSize: "cover"
					} );

					overlay.CSSAnimate( {
						opacity: 1
					}, YTPlayer.opt.fadeOnStartTime );

				} );

			} );

			return this;

		},
		/**
		 *
		 * @returns {jQuery.mbYTPlayer}
		 */
		removeMask: function() {
			var YTPlayer = this.get( 0 );
			var overlay = YTPlayer.overlay;
			overlay.CSSAnimate( {
				opacity: 0
			}, YTPlayer.opt.fadeOnStartTime, function() {

				YTPlayer.hasMask = false;

				overlay.css( {
					backgroundImage: "",
					backgroundRepeat: "",
					backgroundPosition: "",
					backgroundSize: ""
				} );
				overlay.CSSAnimate( {
					opacity: 1
				}, YTPlayer.opt.fadeOnStartTime );

			} );

			return this;

		},
		/**
		 *
		 * @param YTPlayer
		 */
		applyMask: function( YTPlayer ) {
			var $YTPlayer = jQuery( YTPlayer );
			$YTPlayer.off( "YTPTime.mask" );

			if( YTPlayer.opt.mask ) {

				if( typeof YTPlayer.opt.mask == "string" ) {
					$YTPlayer.YTPAddMask( YTPlayer.opt.mask );

					YTPlayer.actualMask = YTPlayer.opt.mask;

				} else if( typeof YTPlayer.opt.mask == "object" ) {

					for( var time in YTPlayer.opt.mask ) {
						if( YTPlayer.opt.mask[ time ] )
							var img = jQuery( "<img/>" ).attr( "src", YTPlayer.opt.mask[ time ] );
					}

					if( YTPlayer.opt.mask[ 0 ] )
						$YTPlayer.YTPAddMask( YTPlayer.opt.mask[ 0 ] );

					$YTPlayer.on( "YTPTime.mask", function( e ) {
						for( var time in YTPlayer.opt.mask ) {
							if( e.time == time )
								if( !YTPlayer.opt.mask[ time ] ) {
									$YTPlayer.YTPRemoveMask();
								} else {

									$YTPlayer.YTPAddMask( YTPlayer.opt.mask[ time ] );
									YTPlayer.actualMask = YTPlayer.opt.mask[ time ];
								}

						}
					} );

				}


			}
		},
		/**
		 *
		 */
		toggleMask: function() {
			var YTPlayer = this.get( 0 );
			var $YTPlayer = $( YTPlayer );
			if( YTPlayer.hasMask )
				$YTPlayer.YTPRemoveMask();
			else
				$YTPlayer.YTPAddMask();

			return this;
		},
		/**
		 *
		 * @returns {{totalTime: number, currentTime: number}}
		 */
		manageProgress: function() {
			var YTPlayer = this.get( 0 );
			var controls = jQuery( "#controlBar_" + YTPlayer.id );
			var progressBar = controls.find( ".mb_YTPProgress" );
			var loadedBar = controls.find( ".mb_YTPLoaded" );
			var timeBar = controls.find( ".mb_YTPseekbar" );
			var totW = progressBar.outerWidth();
			var currentTime = Math.floor( YTPlayer.player.getCurrentTime() );
			var totalTime = Math.floor( YTPlayer.player.getDuration() );
			var timeW = ( currentTime * totW ) / totalTime;
			var startLeft = 0;
			var loadedW = YTPlayer.player.getVideoLoadedFraction() * 100;
			loadedBar.css( {
				left: startLeft,
				width: loadedW + "%"
			} );
			timeBar.css( {
				left: 0,
				width: timeW
			} );
			return {
				totalTime: totalTime,
				currentTime: currentTime
			};
		},
		/**
		 *
		 * @param YTPlayer
		 */
		buildControls: function( YTPlayer ) {
			var data = YTPlayer.opt;
			// @data.printUrl: is deprecated; use data.showYTLogo
			data.showYTLogo = data.showYTLogo || data.printUrl;

			if( jQuery( "#controlBar_" + YTPlayer.id ).length )
				return;
			YTPlayer.controlBar = jQuery( "<span/>" ).attr( "id", "controlBar_" + YTPlayer.id ).addClass( "mb_YTPBar" ).css( {
				whiteSpace: "noWrap",
				position: YTPlayer.isBackground ? "fixed" : "absolute",
				zIndex: YTPlayer.isBackground ? 10000 : 1000
			} ).hide();
			var buttonBar = jQuery( "<div/>" ).addClass( "buttonBar" );
			/* play/pause button*/
			var playpause = jQuery( "<span>" + jQuery.mbYTPlayer.controls.play + "</span>" ).addClass( "mb_YTPPlaypause ytpicon" ).click( function() {
				if( YTPlayer.player.getPlayerState() == 1 ) jQuery( YTPlayer ).YTPPause();
				else jQuery( YTPlayer ).YTPPlay();
			} );
			/* mute/unmute button*/
			var MuteUnmute = jQuery( "<span>" + jQuery.mbYTPlayer.controls.mute + "</span>" ).addClass( "mb_YTPMuteUnmute ytpicon" ).click( function() {
				if( YTPlayer.player.getVolume() == 0 ) {
					jQuery( YTPlayer ).YTPUnmute();
				} else {
					jQuery( YTPlayer ).YTPMute();
				}
			} );
			/* volume bar*/
			var volumeBar = jQuery( "<div/>" ).addClass( "mb_YTPVolumeBar" ).css( {
				display: "inline-block"
			} );
			YTPlayer.volumeBar = volumeBar;
			/* time elapsed */
			var idx = jQuery( "<span/>" ).addClass( "mb_YTPTime" );
			var vURL = data.videoURL ? data.videoURL : "";
			if( vURL.indexOf( "http" ) < 0 ) vURL = jQuery.mbYTPlayer.locationProtocol + "//www.youtube.com/watch?v=" + data.videoURL;
			var movieUrl = jQuery( "<span/>" ).html( jQuery.mbYTPlayer.controls.ytLogo ).addClass( "mb_YTPUrl ytpicon" ).attr( "title", "view on YouTube" ).on( "click", function() {
				window.open( vURL, "viewOnYT" );
			} );
			var onlyVideo = jQuery( "<span/>" ).html( jQuery.mbYTPlayer.controls.onlyYT ).addClass( "mb_OnlyYT ytpicon" ).on( "click", function() {
				jQuery( YTPlayer ).YTPFullscreen( data.realfullscreen );
			} );
			var progressBar = jQuery( "<div/>" ).addClass( "mb_YTPProgress" ).css( "position", "absolute" ).click( function( e ) {
				timeBar.css( {
					width: ( e.clientX - timeBar.offset().left )
				} );
				YTPlayer.timeW = e.clientX - timeBar.offset().left;
				YTPlayer.controlBar.find( ".mb_YTPLoaded" ).css( {
					width: 0
				} );
				var totalTime = Math.floor( YTPlayer.player.getDuration() );
                var goto = ( timeBar.outerWidth() * totalTime ) / progressBar.outerWidth();
                YTPlayer.player.seekTo( parseFloat( goto ), true );
                YTPlayer.controlBar.find( ".mb_YTPLoaded" ).css( {
					width: 0
				} );
			} );
			var loadedBar = jQuery( "<div/>" ).addClass( "mb_YTPLoaded" ).css( "position", "absolute" );
			var timeBar = jQuery( "<div/>" ).addClass( "mb_YTPseekbar" ).css( "position", "absolute" );
			progressBar.append( loadedBar ).append( timeBar );
			buttonBar.append( playpause ).append( MuteUnmute ).append( volumeBar ).append( idx );
			if( data.showYTLogo ) {
				buttonBar.append( movieUrl );
			}
			if( YTPlayer.isBackground || ( eval( YTPlayer.opt.realfullscreen ) && !YTPlayer.isBackground ) ) buttonBar.append( onlyVideo );
			YTPlayer.controlBar.append( buttonBar ).append( progressBar );
			if( !YTPlayer.isBackground ) {
				YTPlayer.controlBar.addClass( "inlinePlayer" );
				YTPlayer.wrapper.before( YTPlayer.controlBar );
			} else {
				jQuery( "body" ).after( YTPlayer.controlBar );
			}
			volumeBar.simpleSlider( {
				initialval: YTPlayer.opt.vol,
				scale: 100,
				orientation: "h",
				callback: function( el ) {
					if( el.value == 0 ) {
						jQuery( YTPlayer ).YTPMute();
					} else {
						jQuery( YTPlayer ).YTPUnmute();
					}
					YTPlayer.player.setVolume( el.value );
					if( !YTPlayer.isMute ) YTPlayer.opt.vol = el.value;
				}
			} );
		},
		/**
		 *
		 * @param YTPlayer
		 */
		checkForState: function( YTPlayer ) {
			var interval = YTPlayer.opt.showControls ? 100 : 400;
			clearInterval( YTPlayer.getState );
			//Checking if player has been removed from scene
			if( !jQuery.contains( document, YTPlayer ) ) {
				jQuery( YTPlayer ).YTPPlayerDestroy();
				clearInterval( YTPlayer.getState );
				clearInterval( YTPlayer.checkForStartAt );
				return;
			}

			jQuery.mbYTPlayer.checkForStart( YTPlayer );

			YTPlayer.getState = setInterval( function() {

				var prog = jQuery( YTPlayer ).YTPManageProgress();
				var $YTPlayer = jQuery( YTPlayer );
				var data = YTPlayer.opt;

				var startAt = YTPlayer.start_from_last ? YTPlayer.start_from_last : YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;

				YTPlayer.start_from_last = null;

				var stopAt = YTPlayer.opt.stopAt > YTPlayer.opt.startAt ? YTPlayer.opt.stopAt : 0;
				stopAt = stopAt < YTPlayer.player.getDuration() ? stopAt : 0;
				if( YTPlayer.currentTime != prog.currentTime ) {

					var YTPEvent = jQuery.Event( "YTPTime" );
					YTPEvent.time = YTPlayer.currentTime;
					jQuery( YTPlayer ).trigger( YTPEvent );

				}
				YTPlayer.currentTime = prog.currentTime;
				YTPlayer.totalTime = YTPlayer.player.getDuration();
				if( YTPlayer.player.getVolume() == 0 ) $YTPlayer.addClass( "isMuted" );
				else $YTPlayer.removeClass( "isMuted" );

				if( YTPlayer.opt.showControls )
					if( prog.totalTime ) {
						YTPlayer.controlBar.find( ".mb_YTPTime" ).html( jQuery.mbYTPlayer.formatTime( prog.currentTime ) + " / " + jQuery.mbYTPlayer.formatTime( prog.totalTime ) );
					} else {
						YTPlayer.controlBar.find( ".mb_YTPTime" ).html( "-- : -- / -- : --" );
					}


				if( eval( YTPlayer.opt.stopMovieOnBlur ) ) {
					if( !document.hasFocus() ) {
						if( YTPlayer.state == 1 ) {
							YTPlayer.hasFocus = false;
							$YTPlayer.YTPPause();
						}
					} else if( document.hasFocus() && !YTPlayer.hasFocus && !( YTPlayer.state == -1 || YTPlayer.state == 0 ) ) {
						YTPlayer.hasFocus = true;
						$YTPlayer.YTPPlay();
					}
				}

				if( YTPlayer.opt.playOnlyIfVisible ) {

					var isOnScreen = jQuery.mbYTPlayer.isOnScreen( YTPlayer );

					if( !isOnScreen && YTPlayer.state == 1 ) {

						YTPlayer.hasFocus = false;
						$YTPlayer.YTPPause();

						console.debug( YTPlayer.id, isOnScreen );
						console.debug( YTPlayer.state );

					} else if( !YTPlayer.hasFocus && !( YTPlayer.state == -1 || YTPlayer.state == 0 ) ) {

						YTPlayer.hasFocus = true;
						$YTPlayer.YTPPlay();

					}
				}


				if( YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() <= 400 && !YTPlayer.isCompact ) {
					YTPlayer.controlBar.addClass( "compact" );
					YTPlayer.isCompact = true;
					if( !YTPlayer.isMute && YTPlayer.volumeBar ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol );
				} else if( YTPlayer.controlBar.length && YTPlayer.controlBar.outerWidth() > 400 && YTPlayer.isCompact ) {
					YTPlayer.controlBar.removeClass( "compact" );
					YTPlayer.isCompact = false;
					if( !YTPlayer.isMute && YTPlayer.volumeBar ) YTPlayer.volumeBar.updateSliderVal( YTPlayer.opt.vol );
				}

				if( YTPlayer.player.getPlayerState() == 1 && ( parseFloat( YTPlayer.player.getDuration() - .5 ) < YTPlayer.player.getCurrentTime() || ( stopAt > 0 && parseFloat( YTPlayer.player.getCurrentTime() ) > stopAt ) ) ) {
					if( YTPlayer.isEnded ) return;
					YTPlayer.isEnded = true;
					setTimeout( function() {
						YTPlayer.isEnded = false;
					}, 1000 );

					if( YTPlayer.isPlayList ) {

						if( !data.loop || ( data.loop > 0 && YTPlayer.player.loopTime === data.loop - 1 ) ) {

							YTPlayer.player.loopTime = undefined;
							clearInterval( YTPlayer.getState );
							var YTPEnd = jQuery.Event( "YTPEnd" );
							YTPEnd.time = YTPlayer.currentTime;
							jQuery( YTPlayer ).trigger( YTPEnd );
							//YTPlayer.state = 0;

							return;
						}

					} else if( !data.loop || ( data.loop > 0 && YTPlayer.player.loopTime === data.loop - 1 ) ) {

						YTPlayer.player.loopTime = undefined;
						YTPlayer.preventTrigger = true;
						YTPlayer.state = 2;
						jQuery( YTPlayer ).YTPPause();

						YTPlayer.wrapper.CSSAnimate( {
							opacity: 0
						}, YTPlayer.opt.fadeOnStartTime, function() {

							if( YTPlayer.controlBar.length )
								YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );

							var YTPEnd = jQuery.Event( "YTPEnd" );
							YTPEnd.time = YTPlayer.currentTime;
							jQuery( YTPlayer ).trigger( YTPEnd );

							YTPlayer.player.seekTo( startAt, true );
							if( !YTPlayer.isBackground ) {
								if( YTPlayer.opt.backgroundUrl && YTPlayer.isPlayer ) {
									YTPlayer.opt.backgroundUrl = YTPlayer.opt.backgroundUrl || YTPlayer.orig_background;
									YTPlayer.opt.containment.css( {
										background: "url(" + YTPlayer.opt.backgroundUrl + ") center center",
										backgroundSize: "cover"
									} );
								}
							} else {
								if( YTPlayer.orig_background )
									jQuery( YTPlayer ).css( "background-image", YTPlayer.orig_background );
							}
						} );

						return;

					}

					YTPlayer.player.loopTime = YTPlayer.player.loopTime ? ++YTPlayer.player.loopTime : 1;
					startAt = startAt || 1;
					YTPlayer.preventTrigger = true;
					YTPlayer.state = 2;
					jQuery( YTPlayer ).YTPPause();
					YTPlayer.player.seekTo( startAt, true );
					$YTPlayer.YTPPlay();


				}
			}, interval );
		},
		/**
		 *
		 * @returns {string} time
		 */
		getTime: function() {
			var YTPlayer = this.get( 0 );
			return jQuery.mbYTPlayer.formatTime( YTPlayer.currentTime );
		},
		/**
		 *
		 * @returns {string} total time
		 */
		getTotalTime: function() {
			var YTPlayer = this.get( 0 );
			return jQuery.mbYTPlayer.formatTime( YTPlayer.totalTime );
		},
		/**
		 *
		 * @param YTPlayer
		 */
		checkForStart: function( YTPlayer ) {

			var $YTPlayer = jQuery( YTPlayer );

			//Checking if player has been removed from scene
			if( !jQuery.contains( document, YTPlayer ) ) {
				jQuery( YTPlayer ).YTPPlayerDestroy();
				return;
			}

			YTPlayer.preventTrigger = true;
			YTPlayer.state = 2;
			jQuery( YTPlayer ).YTPPause();

			jQuery( YTPlayer ).muteYTPVolume();
			jQuery( "#controlBar_" + YTPlayer.id ).remove();

			YTPlayer.controlBar = false;

			if( YTPlayer.opt.showControls )
				jQuery.mbYTPlayer.buildControls( YTPlayer );

			if( YTPlayer.overlay )
				if( YTPlayer.opt.addRaster ) {

					var classN = YTPlayer.opt.addRaster == "dot" ? "raster-dot" : "raster";
					YTPlayer.overlay.addClass( YTPlayer.isRetina ? classN + " retina" : classN );

				} else {

					YTPlayer.overlay.removeClass( function( index, classNames ) {
						// change the list into an array
						var current_classes = classNames.split( " " ),
							// array of classes which are to be removed
							classes_to_remove = [];
						jQuery.each( current_classes, function( index, class_name ) {
							// if the classname begins with bg add it to the classes_to_remove array
							if( /raster.*/.test( class_name ) ) {
								classes_to_remove.push( class_name );
							}
						} );
						classes_to_remove.push( "retina" );
						// turn the array back into a string
						return classes_to_remove.join( " " );
					} );

				}

			var startAt = YTPlayer.start_from_last ? YTPlayer.start_from_last : YTPlayer.opt.startAt ? YTPlayer.opt.startAt : 1;

			YTPlayer.start_from_last = null;

			YTPlayer.player.playVideo();
			YTPlayer.player.seekTo( startAt, true );

			clearInterval( YTPlayer.checkForStartAt );
			YTPlayer.checkForStartAt = setInterval( function() {

				jQuery( YTPlayer ).YTPMute();

				var canPlayVideo = YTPlayer.player.getVideoLoadedFraction() >= startAt / YTPlayer.player.getDuration();

				if( YTPlayer.player.getDuration() > 0 && YTPlayer.player.getCurrentTime() >= startAt && canPlayVideo ) {

					clearInterval( YTPlayer.checkForStartAt );

					if( typeof YTPlayer.opt.onReady == "function" )
						YTPlayer.opt.onReady( YTPlayer );

					YTPlayer.isReady = true;

					var YTPready = jQuery.Event( "YTPReady" );
					YTPready.time = YTPlayer.currentTime;
					jQuery( YTPlayer ).trigger( YTPready );

					YTPlayer.preventTrigger = true;
					YTPlayer.state = 2;
					jQuery( YTPlayer ).YTPPause();

					if( !YTPlayer.opt.mute )
						jQuery( YTPlayer ).YTPUnmute();
					YTPlayer.canTrigger = true;

					if( YTPlayer.opt.autoPlay ) {

						var YTPStart = jQuery.Event( "YTPStart" );
						YTPStart.time = YTPlayer.currentTime;
						jQuery( YTPlayer ).trigger( YTPStart );

						jQuery( YTPlayer.playerEl ).CSSAnimate( {
							opacity: 1
						}, 1000 );

						$YTPlayer.YTPPlay();

						YTPlayer.wrapper.CSSAnimate( {
							opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
						}, YTPlayer.opt.fadeOnStartTime * 2 );

						/* Fix for Safari freeze */

						if( jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.versionCompare( jQuery.mbBrowser.fullVersion, "10.1" ) < 0 ) { //jQuery.mbBrowser.os.minor_version < 11

							YTPlayer.safariPlay = setInterval( function() {
								if( YTPlayer.state != 1 )
									$YTPlayer.YTPPlay();
								else
									clearInterval( YTPlayer.safariPlay );
							}, 10 );
						}
						$YTPlayer.one( "YTPReady", function() {
							$YTPlayer.YTPPlay();
						} );

					} else {

						//$YTPlayer.YTPPause();
						YTPlayer.player.pauseVideo();
						if( !YTPlayer.isPlayer ) {
							jQuery( YTPlayer.playerEl ).CSSAnimate( {
								opacity: 1
							}, YTPlayer.opt.fadeOnStartTime );

							YTPlayer.wrapper.CSSAnimate( {
								opacity: YTPlayer.isAlone ? 1 : YTPlayer.opt.opacity
							}, YTPlayer.opt.fadeOnStartTime );
						}

						if( YTPlayer.controlBar.length )
							YTPlayer.controlBar.find( ".mb_YTPPlaypause" ).html( jQuery.mbYTPlayer.controls.play );
					}

					if( YTPlayer.isPlayer && !YTPlayer.opt.autoPlay && ( YTPlayer.loading && YTPlayer.loading.length ) ) {
						YTPlayer.loading.html( "Ready" );
						setTimeout( function() {
							YTPlayer.loading.fadeOut();
						}, 100 );
					}

					if( YTPlayer.controlBar && YTPlayer.controlBar.length )
						YTPlayer.controlBar.slideDown( 1000 );

				} else if( jQuery.mbBrowser.os.name == "mac" && jQuery.mbBrowser.safari && jQuery.mbBrowser.fullVersion && jQuery.mbBrowser.versionCompare( jQuery.mbBrowser.fullVersion, "10.1" ) < 0 ) { //jQuery.mbBrowser.os.minor_version < 11
					YTPlayer.player.playVideo();
					if( startAt >= 0 )
						YTPlayer.player.seekTo( startAt, true );
				}

			}, 10 );

		},
		/**
		 *
		 * @param anchor
		 */
		setAnchor: function( anchor ) {
			var $YTplayer = this;
			$YTplayer.optimizeDisplay( anchor );
		},
		/**
		 *
		 * @param anchor
		 */
		getAnchor: function() {
			var YTPlayer = this.get( 0 );
			return YTPlayer.opt.anchor;
		},
		/**
		 *
		 * @param s
		 * @returns {string}
		 */
		formatTime: function( s ) {
			var min = Math.floor( s / 60 );
			var sec = Math.floor( s - ( 60 * min ) );
			return( min <= 9 ? "0" + min : min ) + " : " + ( sec <= 9 ? "0" + sec : sec );
		}
	};

	/**
	 *
	 * @param anchor
	 * can be center, top, bottom, right, left; (default is center,center)
	 */
	jQuery.fn.optimizeDisplay = function( anchor ) {
		var YTPlayer = this.get( 0 );
		var playerBox = jQuery( YTPlayer.playerEl );
		var vid = {};

		YTPlayer.opt.anchor = anchor || YTPlayer.opt.anchor;

		YTPlayer.opt.anchor = typeof YTPlayer.opt.anchor != "undefined " ? YTPlayer.opt.anchor : "center,center";
		var YTPAlign = YTPlayer.opt.anchor.split( "," );

		//data.optimizeDisplay = YTPlayer.isPlayer ? false : data.optimizeDisplay;

		if( YTPlayer.opt.optimizeDisplay ) {
			var abundance = YTPlayer.isPlayer ? 0 : 180;
			var win = {};
			var el = YTPlayer.wrapper;

			win.width = el.outerWidth();
			win.height = el.outerHeight() + abundance;

			YTPlayer.opt.ratio = eval( YTPlayer.opt.ratio );

			vid.width = win.width;
			//			vid.height = YTPlayer.opt.ratio == "16/9" ? Math.ceil( vid.width * ( 9 / 16 ) ) : Math.ceil( vid.width * ( 3 / 4 ) );
			vid.height = Math.ceil( vid.width / YTPlayer.opt.ratio );

			vid.marginTop = Math.ceil( -( ( vid.height - win.height ) / 2 ) );
			vid.marginLeft = 0;

			var lowest = vid.height < win.height;

			if( lowest ) {

				vid.height = win.height;
				//				vid.width = YTPlayer.opt.ratio == "16/9" ? Math.floor( vid.height * ( 16 / 9 ) ) : Math.floor( vid.height * ( 4 / 3 ) );
				vid.width = Math.ceil( vid.height * YTPlayer.opt.ratio );

				vid.marginTop = 0;
				vid.marginLeft = Math.ceil( -( ( vid.width - win.width ) / 2 ) );

			}

			for( var a in YTPAlign ) {

				if( YTPAlign.hasOwnProperty( a ) ) {

					var al = YTPAlign[ a ].replace( / /g, "" );

					switch( al ) {

						case "top":
							vid.marginTop = lowest ? -( ( vid.height - win.height ) / 2 ) : 0;
							break;

						case "bottom":
							vid.marginTop = lowest ? 0 : -( vid.height - ( win.height ) );
							break;

						case "left":
							vid.marginLeft = 0;
							break;

						case "right":
							vid.marginLeft = lowest ? -( vid.width - win.width ) : 0;
							break;

						default:
							if( vid.width > win.width )
								vid.marginLeft = -( ( vid.width - win.width ) / 2 );
							break;
					}

				}

			}

		} else {
			vid.width = "100%";
			vid.height = "100%";
			vid.marginTop = 0;
			vid.marginLeft = 0;
		}

		playerBox.css( {
			width: vid.width,
			height: vid.height,
			marginTop: vid.marginTop,
			marginLeft: vid.marginLeft,
			maxWidth: "initial"
		} );

	};
	/**
	 *
	 * @param arr
	 * @returns {Array|string|Blob|*}
	 *
	 */
	jQuery.shuffle = function( arr ) {
		var newArray = arr.slice();
		var len = newArray.length;
		var i = len;
		while( i-- ) {
			var p = parseInt( Math.random() * len );
			var t = newArray[ i ];
			newArray[ i ] = newArray[ p ];
			newArray[ p ] = t;
		}
		return newArray;
	};

	jQuery.fn.unselectable = function() {
		return this.each( function() {
			jQuery( this ).css( {
				"-moz-user-select": "none",
				"-webkit-user-select": "none",
				"user-select": "none"
			} ).attr( "unselectable", "on" );
		} );
	};

	/* Exposed public method */
	jQuery.fn.YTPlayer = jQuery.mbYTPlayer.buildPlayer;
	jQuery.fn.YTPGetPlayer = jQuery.mbYTPlayer.getPlayer;
	jQuery.fn.YTPGetVideoID = jQuery.mbYTPlayer.getVideoID;
	jQuery.fn.YTPChangeMovie = jQuery.mbYTPlayer.changeMovie;
	jQuery.fn.YTPPlayerDestroy = jQuery.mbYTPlayer.playerDestroy;

	jQuery.fn.YTPPlay = jQuery.mbYTPlayer.play;
	jQuery.fn.YTPTogglePlay = jQuery.mbYTPlayer.togglePlay;
	jQuery.fn.YTPStop = jQuery.mbYTPlayer.stop;
	jQuery.fn.YTPPause = jQuery.mbYTPlayer.pause;
	jQuery.fn.YTPSeekTo = jQuery.mbYTPlayer.seekTo;

	jQuery.fn.YTPlaylist = jQuery.mbYTPlayer.playlist;
	jQuery.fn.YTPPlayNext = jQuery.mbYTPlayer.playNext;
	jQuery.fn.YTPPlayPrev = jQuery.mbYTPlayer.playPrev;
	jQuery.fn.YTPPlayIndex = jQuery.mbYTPlayer.playIndex;

	jQuery.fn.YTPMute = jQuery.mbYTPlayer.mute;
	jQuery.fn.YTPUnmute = jQuery.mbYTPlayer.unmute;
	jQuery.fn.YTPToggleVolume = jQuery.mbYTPlayer.toggleVolume;
	jQuery.fn.YTPSetVolume = jQuery.mbYTPlayer.setVolume;

	jQuery.fn.YTPGetVideoData = jQuery.mbYTPlayer.getVideoData;
	jQuery.fn.YTPFullscreen = jQuery.mbYTPlayer.fullscreen;
	jQuery.fn.YTPToggleLoops = jQuery.mbYTPlayer.toggleLoops;
	jQuery.fn.YTPSetVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
	jQuery.fn.YTPManageProgress = jQuery.mbYTPlayer.manageProgress;

	jQuery.fn.YTPApplyFilter = jQuery.mbYTPlayer.applyFilter;
	jQuery.fn.YTPApplyFilters = jQuery.mbYTPlayer.applyFilters;
	jQuery.fn.YTPToggleFilter = jQuery.mbYTPlayer.toggleFilter;
	jQuery.fn.YTPToggleFilters = jQuery.mbYTPlayer.toggleFilters;
	jQuery.fn.YTPRemoveFilter = jQuery.mbYTPlayer.removeFilter;
	jQuery.fn.YTPDisableFilters = jQuery.mbYTPlayer.disableFilters;
	jQuery.fn.YTPEnableFilters = jQuery.mbYTPlayer.enableFilters;
	jQuery.fn.YTPGetFilters = jQuery.mbYTPlayer.getFilters;

	jQuery.fn.YTPGetTime = jQuery.mbYTPlayer.getTime;
	jQuery.fn.YTPGetTotalTime = jQuery.mbYTPlayer.getTotalTime;

	jQuery.fn.YTPAddMask = jQuery.mbYTPlayer.addMask;
	jQuery.fn.YTPRemoveMask = jQuery.mbYTPlayer.removeMask;
	jQuery.fn.YTPToggleMask = jQuery.mbYTPlayer.toggleMask;

	jQuery.fn.YTPSetAnchor = jQuery.mbYTPlayer.setAnchor;
	jQuery.fn.YTPGetAnchor = jQuery.mbYTPlayer.getAnchor;

	/**
	 *
	 * @deprecated
	 * todo: Above methods will be removed with version 3.5.0
	 *
	 **/
	jQuery.fn.mb_YTPlayer = jQuery.mbYTPlayer.buildPlayer;
	jQuery.fn.playNext = jQuery.mbYTPlayer.playNext;
	jQuery.fn.playPrev = jQuery.mbYTPlayer.playPrev;
	jQuery.fn.changeMovie = jQuery.mbYTPlayer.changeMovie;
	jQuery.fn.getVideoID = jQuery.mbYTPlayer.getVideoID;
	jQuery.fn.getPlayer = jQuery.mbYTPlayer.getPlayer;
	jQuery.fn.playerDestroy = jQuery.mbYTPlayer.playerDestroy;
	jQuery.fn.fullscreen = jQuery.mbYTPlayer.fullscreen;
	jQuery.fn.buildYTPControls = jQuery.mbYTPlayer.buildControls;
	jQuery.fn.playYTP = jQuery.mbYTPlayer.play;
	jQuery.fn.toggleLoops = jQuery.mbYTPlayer.toggleLoops;
	jQuery.fn.stopYTP = jQuery.mbYTPlayer.stop;
	jQuery.fn.pauseYTP = jQuery.mbYTPlayer.pause;
	jQuery.fn.seekToYTP = jQuery.mbYTPlayer.seekTo;
	jQuery.fn.muteYTPVolume = jQuery.mbYTPlayer.mute;
	jQuery.fn.unmuteYTPVolume = jQuery.mbYTPlayer.unmute;
	jQuery.fn.setYTPVolume = jQuery.mbYTPlayer.setVolume;
	jQuery.fn.setVideoQuality = jQuery.mbYTPlayer.setVideoQuality;
	jQuery.fn.manageYTPProgress = jQuery.mbYTPlayer.manageProgress;
	jQuery.fn.YTPGetDataFromFeed = jQuery.mbYTPlayer.getVideoData;


} )( jQuery, ytp );

/*
 * ******************************************************************************
 *  jquery.mb.components
 *  file: jquery.mb.CSSAnimate.min.js
 *
 *  Copyright (c) 2001-2014. Matteo Bicocchi (Pupunzi);
 *  Open lab srl, Firenze - Italy
 *  email: matteo@open-lab.com
 *  site: 	http://pupunzi.com
 *  blog:	http://pupunzi.open-lab.com
 * 	http://open-lab.com
 *
 *  Licences: MIT, GPL
 *  http://www.opensource.org/licenses/mit-license.php
 *  http://www.gnu.org/licenses/gpl.html
 *
 *  last modified: 26/03/14 21.40
 *  *****************************************************************************
 */

function uncamel(e){return e.replace(/([A-Z])/g,function(e){return"-"+e.toLowerCase();});}function setUnit(e,t){return"string"!=typeof e||e.match(/^[\-0-9\.]+jQuery/)?""+e+t:e;}function setFilter(e,t,r){var i=uncamel(t),n=jQuery.browser.mozilla?"":jQuery.CSS.sfx;e[n+"filter"]=e[n+"filter"]||"",r=setUnit(r>jQuery.CSS.filters[t].max?jQuery.CSS.filters[t].max:r,jQuery.CSS.filters[t].unit),e[n+"filter"]+=i+"("+r+") ",delete e[t];}jQuery.support.CSStransition=function(){var e=document.body||document.documentElement,t=e.style;return void 0!==t.transition||void 0!==t.WebkitTransition||void 0!==t.MozTransition||void 0!==t.MsTransition||void 0!==t.OTransition;}(),jQuery.CSS={name:"mb.CSSAnimate",author:"Matteo Bicocchi",version:"2.0.0",transitionEnd:"transitionEnd",sfx:"",filters:{blur:{min:0,max:100,unit:"px"},brightness:{min:0,max:400,unit:"%"},contrast:{min:0,max:400,unit:"%"},grayscale:{min:0,max:100,unit:"%"},hueRotate:{min:0,max:360,unit:"deg"},invert:{min:0,max:100,unit:"%"},saturate:{min:0,max:400,unit:"%"},sepia:{min:0,max:100,unit:"%"}},normalizeCss:function(e){var t=jQuery.extend(!0,{},e);jQuery.browser.webkit||jQuery.browser.opera?jQuery.CSS.sfx="-webkit-":jQuery.browser.mozilla?jQuery.CSS.sfx="-moz-":jQuery.browser.msie&&(jQuery.CSS.sfx="-ms-");for(var r in t){"transform"===r&&(t[jQuery.CSS.sfx+"transform"]=t[r],delete t[r]),"transform-origin"===r&&(t[jQuery.CSS.sfx+"transform-origin"]=e[r],delete t[r]),"filter"!==r||jQuery.browser.mozilla||(t[jQuery.CSS.sfx+"filter"]=e[r],delete t[r]),"blur"===r&&setFilter(t,"blur",e[r]),"brightness"===r&&setFilter(t,"brightness",e[r]),"contrast"===r&&setFilter(t,"contrast",e[r]),"grayscale"===r&&setFilter(t,"grayscale",e[r]),"hueRotate"===r&&setFilter(t,"hueRotate",e[r]),"invert"===r&&setFilter(t,"invert",e[r]),"saturate"===r&&setFilter(t,"saturate",e[r]),"sepia"===r&&setFilter(t,"sepia",e[r]);var i="";"x"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" translateX("+setUnit(e[r],"px")+")",delete t[r]),"y"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" translateY("+setUnit(e[r],"px")+")",delete t[r]),"z"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" translateZ("+setUnit(e[r],"px")+")",delete t[r]),"rotate"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" rotate("+setUnit(e[r],"deg")+")",delete t[r]),"rotateX"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" rotateX("+setUnit(e[r],"deg")+")",delete t[r]),"rotateY"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" rotateY("+setUnit(e[r],"deg")+")",delete t[r]),"rotateZ"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" rotateZ("+setUnit(e[r],"deg")+")",delete t[r]),"scale"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" scale("+setUnit(e[r],"")+")",delete t[r]),"scaleX"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" scaleX("+setUnit(e[r],"")+")",delete t[r]),"scaleY"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" scaleY("+setUnit(e[r],"")+")",delete t[r]),"scaleZ"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" scaleZ("+setUnit(e[r],"")+")",delete t[r]),"skew"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" skew("+setUnit(e[r],"deg")+")",delete t[r]),"skewX"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" skewX("+setUnit(e[r],"deg")+")",delete t[r]),"skewY"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" skewY("+setUnit(e[r],"deg")+")",delete t[r]),"perspective"===r&&(i=jQuery.CSS.sfx+"transform",t[i]=t[i]||"",t[i]+=" perspective("+setUnit(e[r],"px")+")",delete t[r]);}return t;},getProp:function(e){var t=[];for(var r in e)t.indexOf(r)<0&&t.push(uncamel(r));return t.join(",");},animate:function(e,t,r,i,n){return this.each(function(){function s(){u.called=!0,u.CSSAIsRunning=!1,a.off(jQuery.CSS.transitionEnd+"."+u.id),clearTimeout(u.timeout),a.css(jQuery.CSS.sfx+"transition",""),"function"==typeof n&&n.apply(u),"function"==typeof u.CSSqueue&&(u.CSSqueue(),u.CSSqueue=null);}var u=this,a=jQuery(this);u.id=u.id||"CSSA_"+(new Date).getTime();var o=o||{type:"noEvent"};if(u.CSSAIsRunning&&u.eventType==o.type&&!jQuery.browser.msie&&jQuery.browser.version<=9)return void(u.CSSqueue=function(){a.CSSAnimate(e,t,r,i,n);});if(u.CSSqueue=null,u.eventType=o.type,0!==a.length&&e){if(e=jQuery.normalizeCss(e),u.CSSAIsRunning=!0,"function"==typeof t&&(n=t,t=jQuery.fx.speeds._default),"function"==typeof r&&(i=r,r=0),"string"==typeof r&&(n=r,r=0),"function"==typeof i&&(n=i,i="cubic-bezier(0.65,0.03,0.36,0.72)"),"string"==typeof t)for(var f in jQuery.fx.speeds){if(t==f){t=jQuery.fx.speeds[f];break;}t=jQuery.fx.speeds._default;}if(t||(t=jQuery.fx.speeds._default),"string"==typeof n&&(i=n,n=null),!jQuery.support.CSStransition){for(var c in e){if("transform"===c&&delete e[c],"filter"===c&&delete e[c],"transform-origin"===c&&delete e[c],"auto"===e[c]&&delete e[c],"x"===c){var S=e[c],l="left";e[l]=S,delete e[c];}if("y"===c){var S=e[c],l="top";e[l]=S,delete e[c];}("-ms-transform"===c||"-ms-filter"===c)&&delete e[c];}return void a.delay(r).animate(e,t,n);}var y={"default":"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};y[i]&&(i=y[i]),a.off(jQuery.CSS.transitionEnd+"."+u.id);var m=jQuery.CSS.getProp(e),d={};jQuery.extend(d,e),d[jQuery.CSS.sfx+"transition-property"]=m,d[jQuery.CSS.sfx+"transition-duration"]=t+"ms",d[jQuery.CSS.sfx+"transition-delay"]=r+"ms",d[jQuery.CSS.sfx+"transition-timing-function"]=i,setTimeout(function(){a.one(jQuery.CSS.transitionEnd+"."+u.id,s),a.css(d);},1),u.timeout=setTimeout(function(){return u.called||!n?(u.called=!1,void(u.CSSAIsRunning=!1)):(a.css(jQuery.CSS.sfx+"transition",""),n.apply(u),u.CSSAIsRunning=!1,void("function"==typeof u.CSSqueue&&(u.CSSqueue(),u.CSSqueue=null)));},t+r+10);}});}},jQuery.fn.CSSAnimate=jQuery.CSS.animate,jQuery.normalizeCss=jQuery.CSS.normalizeCss,jQuery.fn.css3=function(e){return this.each(function(){var t=jQuery(this),r=jQuery.normalizeCss(e);t.css(r);});};
/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.browser.min.js                                                                                                                   _
 _ last modified: 24/05/17 19.56                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2017. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

var nAgt=navigator.userAgent;jQuery.browser=jQuery.browser||{};jQuery.browser.mozilla=!1;jQuery.browser.webkit=!1;jQuery.browser.opera=!1;jQuery.browser.safari=!1;jQuery.browser.chrome=!1;jQuery.browser.androidStock=!1;jQuery.browser.msie=!1;jQuery.browser.edge=!1;jQuery.browser.ua=nAgt;function isTouchSupported(){var a=nAgt.msMaxTouchPoints,e="ontouchstart"in document.createElement("div");return a||e?!0:!1;}
var getOS=function(){var a={version:"Unknown version",name:"Unknown OS"};-1!=navigator.appVersion.indexOf("Win")&&(a.name="Windows");-1!=navigator.appVersion.indexOf("Mac")&&0>navigator.appVersion.indexOf("Mobile")&&(a.name="Mac");-1!=navigator.appVersion.indexOf("Linux")&&(a.name="Linux");/Mac OS X/.test(nAgt)&&!/Mobile/.test(nAgt)&&(a.version=/Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1],a.version=a.version.replace(/_/g,".").substring(0,5));/Windows/.test(nAgt)&&(a.version="Unknown.Unknown");/Windows NT 5.1/.test(nAgt)&&
(a.version="5.1");/Windows NT 6.0/.test(nAgt)&&(a.version="6.0");/Windows NT 6.1/.test(nAgt)&&(a.version="6.1");/Windows NT 6.2/.test(nAgt)&&(a.version="6.2");/Windows NT 10.0/.test(nAgt)&&(a.version="10.0");/Linux/.test(nAgt)&&/Linux/.test(nAgt)&&(a.version="Unknown.Unknown");a.name=a.name.toLowerCase();a.major_version="Unknown";a.minor_version="Unknown";"Unknown.Unknown"!=a.version&&(a.major_version=parseFloat(a.version.split(".")[0]),a.minor_version=parseFloat(a.version.split(".")[1]));return a;};
jQuery.browser.os=getOS();jQuery.browser.hasTouch=isTouchSupported();jQuery.browser.name=navigator.appName;jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion);jQuery.browser.majorVersion=parseInt(navigator.appVersion,10);var nameOffset,verOffset,ix;
if(-1!=(verOffset=nAgt.indexOf("Opera")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+6),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8));else if(-1!=(verOffset=nAgt.indexOf("OPR")))jQuery.browser.opera=!0,jQuery.browser.name="Opera",jQuery.browser.fullVersion=nAgt.substring(verOffset+4);else if(-1!=(verOffset=nAgt.indexOf("MSIE")))jQuery.browser.msie=!0,jQuery.browser.name="Microsoft Internet Explorer",
		jQuery.browser.fullVersion=nAgt.substring(verOffset+5);else if(-1!=nAgt.indexOf("Trident")){jQuery.browser.msie=!0;jQuery.browser.name="Microsoft Internet Explorer";var start=nAgt.indexOf("rv:")+3,end=start+4;jQuery.browser.fullVersion=nAgt.substring(start,end);}else-1!=(verOffset=nAgt.indexOf("Edge"))?(jQuery.browser.edge=!0,jQuery.browser.name="Microsoft Edge",jQuery.browser.fullVersion=nAgt.substring(verOffset+5)):-1!=(verOffset=nAgt.indexOf("Chrome"))?(jQuery.browser.webkit=!0,jQuery.browser.chrome=
		!0,jQuery.browser.name="Chrome",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1<nAgt.indexOf("mozilla/5.0")&&-1<nAgt.indexOf("android ")&&-1<nAgt.indexOf("applewebkit")&&!(-1<nAgt.indexOf("chrome"))?(verOffset=nAgt.indexOf("Chrome"),jQuery.browser.webkit=!0,jQuery.browser.androidStock=!0,jQuery.browser.name="androidStock",jQuery.browser.fullVersion=nAgt.substring(verOffset+7)):-1!=(verOffset=nAgt.indexOf("Safari"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name=
		"Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("AppleWebkit"))?(jQuery.browser.webkit=!0,jQuery.browser.safari=!0,jQuery.browser.name="Safari",jQuery.browser.fullVersion=nAgt.substring(verOffset+7),-1!=(verOffset=nAgt.indexOf("Version"))&&(jQuery.browser.fullVersion=nAgt.substring(verOffset+8))):-1!=(verOffset=nAgt.indexOf("Firefox"))?(jQuery.browser.mozilla=
		!0,jQuery.browser.name="Firefox",jQuery.browser.fullVersion=nAgt.substring(verOffset+8)):(nameOffset=nAgt.lastIndexOf(" ")+1)<(verOffset=nAgt.lastIndexOf("/"))&&(jQuery.browser.name=nAgt.substring(nameOffset,verOffset),jQuery.browser.fullVersion=nAgt.substring(verOffset+1),jQuery.browser.name.toLowerCase()==jQuery.browser.name.toUpperCase()&&(jQuery.browser.name=navigator.appName));
-1!=(ix=jQuery.browser.fullVersion.indexOf(";"))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));-1!=(ix=jQuery.browser.fullVersion.indexOf(" "))&&(jQuery.browser.fullVersion=jQuery.browser.fullVersion.substring(0,ix));jQuery.browser.majorVersion=parseInt(""+jQuery.browser.fullVersion,10);isNaN(jQuery.browser.majorVersion)&&(jQuery.browser.fullVersion=""+parseFloat(navigator.appVersion),jQuery.browser.majorVersion=parseInt(navigator.appVersion,10));
jQuery.browser.version=jQuery.browser.majorVersion;jQuery.browser.android=/Android/i.test(nAgt);jQuery.browser.blackberry=/BlackBerry|BB|PlayBook/i.test(nAgt);jQuery.browser.ios=/iPhone|iPad|iPod|webOS/i.test(nAgt);jQuery.browser.operaMobile=/Opera Mini/i.test(nAgt);jQuery.browser.windowsMobile=/IEMobile|Windows Phone/i.test(nAgt);jQuery.browser.kindle=/Kindle|Silk/i.test(nAgt);
jQuery.browser.mobile=jQuery.browser.android||jQuery.browser.blackberry||jQuery.browser.ios||jQuery.browser.windowsMobile||jQuery.browser.operaMobile||jQuery.browser.kindle;jQuery.isMobile=jQuery.browser.mobile;jQuery.isTablet=jQuery.browser.mobile&&765<jQuery(window).width();jQuery.isAndroidDefault=jQuery.browser.android&&!/chrome/i.test(nAgt);jQuery.mbBrowser=jQuery.browser;
jQuery.browser.versionCompare=function(a,e){if("stringstring"!=typeof a+typeof e)return!1;for(var c=a.split("."),d=e.split("."),b=0,f=Math.max(c.length,d.length);b<f;b++){if(c[b]&&!d[b]&&0<parseInt(c[b])||parseInt(c[b])>parseInt(d[b]))return 1;if(d[b]&&!c[b]&&0<parseInt(d[b])||parseInt(c[b])<parseInt(d[b]))return-1;}return 0;};
/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.simpleSlider.min.js                                                                                                              _
 _ last modified: 09/05/17 19.31                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2017. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

(function(b){b.simpleSlider={defaults:{initialval:0,scale:100,orientation:"h",readonly:!1,callback:!1},events:{start:b.browser.mobile?"touchstart":"mousedown",end:b.browser.mobile?"touchend":"mouseup",move:b.browser.mobile?"touchmove":"mousemove"},init:function(c){return this.each(function(){var a=this,d=b(a);d.addClass("simpleSlider");a.opt={};b.extend(a.opt,b.simpleSlider.defaults,c);b.extend(a.opt,d.data());var e="h"==a.opt.orientation?"horizontal":"vertical",e=b("<div/>").addClass("level").addClass(e);
	d.prepend(e);a.level=e;d.css({cursor:"default"});"auto"==a.opt.scale&&(a.opt.scale=b(a).outerWidth());d.updateSliderVal();a.opt.readonly||(d.on(b.simpleSlider.events.start,function(c){b.browser.mobile&&(c=c.changedTouches[0]);a.canSlide=!0;d.updateSliderVal(c);"h"==a.opt.orientation?d.css({cursor:"col-resize"}):d.css({cursor:"row-resize"});c.preventDefault();c.stopPropagation();}),b(document).on(b.simpleSlider.events.move,function(c){b.browser.mobile&&(c=c.changedTouches[0]);a.canSlide&&(b(document).css({cursor:"default"}),
			d.updateSliderVal(c),c.preventDefault(),c.stopPropagation());}).on(b.simpleSlider.events.end,function(){b(document).css({cursor:"auto"});a.canSlide=!1;d.css({cursor:"auto"});}));});},updateSliderVal:function(c){var a=this.get(0);if(a.opt){a.opt.initialval="number"==typeof a.opt.initialval?a.opt.initialval:a.opt.initialval(a);var d=b(a).outerWidth(),e=b(a).outerHeight();a.x="object"==typeof c?c.clientX+document.body.scrollLeft-this.offset().left:"number"==typeof c?c*d/a.opt.scale:a.opt.initialval*d/a.opt.scale;
	a.y="object"==typeof c?c.clientY+document.body.scrollTop-this.offset().top:"number"==typeof c?(a.opt.scale-a.opt.initialval-c)*e/a.opt.scale:a.opt.initialval*e/a.opt.scale;a.y=this.outerHeight()-a.y;a.scaleX=a.x*a.opt.scale/d;a.scaleY=a.y*a.opt.scale/e;a.outOfRangeX=a.scaleX>a.opt.scale?a.scaleX-a.opt.scale:0>a.scaleX?a.scaleX:0;a.outOfRangeY=a.scaleY>a.opt.scale?a.scaleY-a.opt.scale:0>a.scaleY?a.scaleY:0;a.outOfRange="h"==a.opt.orientation?a.outOfRangeX:a.outOfRangeY;a.value="undefined"!=typeof c?
					"h"==a.opt.orientation?a.x>=this.outerWidth()?a.opt.scale:0>=a.x?0:a.scaleX:a.y>=this.outerHeight()?a.opt.scale:0>=a.y?0:a.scaleY:"h"==a.opt.orientation?a.scaleX:a.scaleY;"h"==a.opt.orientation?a.level.width(Math.floor(100*a.x/d)+"%"):a.level.height(Math.floor(100*a.y/e));"function"==typeof a.opt.callback&&a.opt.callback(a);}}};b.fn.simpleSlider=b.simpleSlider.init;b.fn.updateSliderVal=b.simpleSlider.updateSliderVal;})(jQuery);
/*___________________________________________________________________________________________________________________________________________________
 _ jquery.mb.components                                                                                                                             _
 _                                                                                                                                                  _
 _ file: jquery.mb.storage.min.js                                                                                                                   _
 _ last modified: 24/05/15 16.08                                                                                                                    _
 _                                                                                                                                                  _
 _ Open Lab s.r.l., Florence - Italy                                                                                                                _
 _                                                                                                                                                  _
 _ email: matteo@open-lab.com                                                                                                                       _
 _ site: http://pupunzi.com                                                                                                                         _
 _       http://open-lab.com                                                                                                                        _
 _ blog: http://pupunzi.open-lab.com                                                                                                                _
 _ Q&A:  http://jquery.pupunzi.com                                                                                                                  _
 _                                                                                                                                                  _
 _ Licences: MIT, GPL                                                                                                                               _
 _    http://www.opensource.org/licenses/mit-license.php                                                                                            _
 _    http://www.gnu.org/licenses/gpl.html                                                                                                          _
 _                                                                                                                                                  _
 _ Copyright (c) 2001-2015. Matteo Bicocchi (Pupunzi);                                                                                              _
 ___________________________________________________________________________________________________________________________________________________*/

(function(d){d.mbCookie={set:function(a,c,f,b){"object"==typeof c&&(c=JSON.stringify(c));b=b?"; domain="+b:"";var e=new Date,d="";0<f&&(e.setTime(e.getTime()+864E5*f),d="; expires="+e.toGMTString());document.cookie=a+"="+c+d+"; path=/"+b;},get:function(a){a+="=";for(var c=document.cookie.split(";"),d=0;d<c.length;d++){for(var b=c[d];" "==b.charAt(0);)b=b.substring(1,b.length);if(0==b.indexOf(a))try{return JSON.parse(b.substring(a.length,b.length));}catch(e){return b.substring(a.length,b.length);}}return null;},
	remove:function(a){d.mbCookie.set(a,"",-1);}};d.mbStorage={set:function(a,c){"object"==typeof c&&(c=JSON.stringify(c));localStorage.setItem(a,c);},get:function(a){if(localStorage[a])try{return JSON.parse(localStorage[a]);}catch(c){return localStorage[a];}else return null;},remove:function(a){a?localStorage.removeItem(a):localStorage.clear();}};})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJqcXVlcnkubWIuWVRQbGF5ZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLypfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cbiBfIGpxdWVyeS5tYi5jb21wb25lbnRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gZmlsZToganF1ZXJ5Lm1iLllUUGxheWVyLnNyYy5qcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGxhc3QgbW9kaWZpZWQ6IDExLzA1LzE3IDE5LjU0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gT3BlbiBMYWIgcy5yLmwuLCBGbG9yZW5jZSAtIEl0YWx5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBlbWFpbDogbWF0dGVvQG9wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gc2l0ZTogaHR0cDovL3B1cHVuemkuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgIGh0dHA6Ly9vcGVuLWxhYi5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBibG9nOiBodHRwOi8vcHVwdW56aS5vcGVuLWxhYi5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gUSZBOiAgaHR0cDovL2pxdWVyeS5wdXB1bnppLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBMaWNlbmNlczogTUlULCBHUEwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgIGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9ncGwuaHRtbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gQ29weXJpZ2h0IChjKSAyMDAxLTIwMTcuIE1hdHRlbyBCaWNvY2NoaSAoUHVwdW56aSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18qL1xudmFyIHl0cCA9IHl0cCB8fCB7fTtcblxuZnVuY3Rpb24gb25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkoKSB7XG5cdGlmKCB5dHAuWVRBUElSZWFkeSApIHJldHVybjtcblx0eXRwLllUQVBJUmVhZHkgPSB0cnVlO1xuXHRqUXVlcnkoIGRvY3VtZW50ICkudHJpZ2dlciggXCJZVEFQSVJlYWR5XCIgKTtcbn1cblxuLy93aW5kb3cub25Zb3VUdWJlSWZyYW1lQVBJUmVhZHkgPSBvbllvdVR1YmVJZnJhbWVBUElSZWFkeTtcblxudmFyIGdldFlUUFZpZGVvSUQgPSBmdW5jdGlvbiggdXJsICkge1xuXHR2YXIgdmlkZW9JRCwgcGxheWxpc3RJRDtcblx0aWYoIHVybC5pbmRleE9mKCBcInlvdXR1LmJlXCIgKSA+IDAgKSB7XG5cdFx0dmlkZW9JRCA9IHVybC5zdWJzdHIoIHVybC5sYXN0SW5kZXhPZiggXCIvXCIgKSArIDEsIHVybC5sZW5ndGggKTtcblx0XHRwbGF5bGlzdElEID0gdmlkZW9JRC5pbmRleE9mKCBcIj9saXN0PVwiICkgPiAwID8gdmlkZW9JRC5zdWJzdHIoIHZpZGVvSUQubGFzdEluZGV4T2YoIFwiPVwiICksIHZpZGVvSUQubGVuZ3RoICkgOiBudWxsO1xuXHRcdHZpZGVvSUQgPSBwbGF5bGlzdElEID8gdmlkZW9JRC5zdWJzdHIoIDAsIHZpZGVvSUQubGFzdEluZGV4T2YoIFwiP1wiICkgKSA6IHZpZGVvSUQ7XG5cdH0gZWxzZSBpZiggdXJsLmluZGV4T2YoIFwiaHR0cFwiICkgPiAtMSApIHtcblx0XHQvL3ZpZGVvSUQgPSB1cmwubWF0Y2goIC8oW1xcLyZddlxcLyhbXiYjXSopKXwoW1xcXFw/Jl12PShbXiYjXSopKS8gKVsgMSBdO1xuXHRcdHZpZGVvSUQgPSB1cmwubWF0Y2goIC9bXFxcXD8mXXY9KFteJiNdKikvIClbIDEgXTtcblx0XHRwbGF5bGlzdElEID0gdXJsLmluZGV4T2YoIFwibGlzdD1cIiApID4gMCA/IHVybC5tYXRjaCggL1tcXFxcPyZdbGlzdD0oW14mI10qKS8gKVsgMSBdIDogbnVsbDtcblx0fSBlbHNlIHtcblx0XHR2aWRlb0lEID0gdXJsLmxlbmd0aCA+IDE1ID8gbnVsbCA6IHVybDtcblx0XHRwbGF5bGlzdElEID0gdmlkZW9JRCA/IG51bGwgOiB1cmw7XG5cdH1cblx0cmV0dXJuIHtcblx0XHR2aWRlb0lEOiB2aWRlb0lELFxuXHRcdHBsYXlsaXN0SUQ6IHBsYXlsaXN0SURcblx0fTtcbn07XG5cbiggZnVuY3Rpb24oIGpRdWVyeSwgeXRwICkge1xuXG5cdGpRdWVyeS5tYllUUGxheWVyID0ge1xuXHRcdG5hbWU6IFwianF1ZXJ5Lm1iLllUUGxheWVyXCIsXG5cdFx0dmVyc2lvbjogXCIzLjAuMjBcIixcblx0XHRidWlsZDogXCI2MzA4XCIsXG5cdFx0YXV0aG9yOiBcIk1hdHRlbyBCaWNvY2NoaSAocHVwdW56aSlcIixcblx0XHRhcGlLZXk6IFwiXCIsXG5cdFx0ZGVmYXVsdHM6IHtcblx0XHRcdGNvbnRhaW5tZW50OiBcImJvZHlcIixcblx0XHRcdHJhdGlvOiBcImF1dG9cIiwgLy8gXCJhdXRvXCIsIFwiMTYvOVwiLCBcIjQvM1wiIG9yIG51bWJlcjogNC8zLCAxNi85XG5cdFx0XHR2aWRlb1VSTDogbnVsbCxcblx0XHRcdHBsYXlsaXN0VVJMOiBudWxsLFxuXHRcdFx0c3RhcnRBdDogMCxcblx0XHRcdHN0b3BBdDogMCxcblx0XHRcdGF1dG9QbGF5OiB0cnVlLFxuXHRcdFx0dm9sOiA1MCwgLy8gMSB0byAxMDBcblx0XHRcdGFkZFJhc3RlcjogZmFsc2UsXG5cdFx0XHRtYXNrOiBmYWxzZSxcblx0XHRcdG9wYWNpdHk6IDEsXG5cdFx0XHRxdWFsaXR5OiBcImRlZmF1bHRcIiwgLy9vciDigJxzbWFsbOKAnSwg4oCcbWVkaXVt4oCdLCDigJxsYXJnZeKAnSwg4oCcaGQ3MjDigJ0sIOKAnGhkMTA4MOKAnSwg4oCcaGlnaHJlc+KAnVxuXHRcdFx0bXV0ZTogZmFsc2UsXG5cdFx0XHRsb29wOiB0cnVlLFxuXHRcdFx0ZmFkZU9uU3RhcnRUaW1lOiA1MDAsIC8vZmFkZSBpbiB0aW1pbmcgYXQgdmlkZW8gc3RhcnRcblx0XHRcdHNob3dDb250cm9sczogdHJ1ZSxcblx0XHRcdHNob3dBbm5vdGF0aW9uczogZmFsc2UsXG5cdFx0XHRzaG93WVRMb2dvOiB0cnVlLFxuXHRcdFx0c3RvcE1vdmllT25CbHVyOiB0cnVlLFxuXHRcdFx0cmVhbGZ1bGxzY3JlZW46IHRydWUsXG5cdFx0XHRtb2JpbGVGYWxsYmFja0ltYWdlOiBudWxsLFxuXHRcdFx0Z2FUcmFjazogdHJ1ZSxcblx0XHRcdG9wdGltaXplRGlzcGxheTogdHJ1ZSxcblx0XHRcdHJlbWVtYmVyX2xhc3RfdGltZTogZmFsc2UsXG5cdFx0XHRwbGF5T25seUlmVmlzaWJsZTogZmFsc2UsXG5cdFx0XHRhbmNob3I6IFwiY2VudGVyLGNlbnRlclwiLCAvLyB0b3AsYm90dG9tLGxlZnQscmlnaHQgY29tYmluZWQgaW4gcGFpclxuXHRcdFx0b25SZWFkeTogZnVuY3Rpb24oIHBsYXllciApIHt9LFxuXHRcdFx0b25FcnJvcjogZnVuY3Rpb24oIHBsYXllciwgZXJyICkge31cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqICBAZm9udGZhY2UgaWNvbnNcblx0XHQgKiAgKi9cblx0XHRjb250cm9sczoge1xuXHRcdFx0cGxheTogXCJQXCIsXG5cdFx0XHRwYXVzZTogXCJwXCIsXG5cdFx0XHRtdXRlOiBcIk1cIixcblx0XHRcdHVubXV0ZTogXCJBXCIsXG5cdFx0XHRvbmx5WVQ6IFwiT1wiLFxuXHRcdFx0c2hvd1NpdGU6IFwiUlwiLFxuXHRcdFx0eXRMb2dvOiBcIllcIlxuXHRcdH0sXG5cdFx0Y29udHJvbEJhcjogbnVsbCxcblx0XHRsb2FkaW5nOiBudWxsLFxuXHRcdGxvY2F0aW9uUHJvdG9jb2w6IFwiaHR0cHM6XCIsXG5cblx0XHRmaWx0ZXJzOiB7XG5cdFx0XHRncmF5c2NhbGU6IHtcblx0XHRcdFx0dmFsdWU6IDAsXG5cdFx0XHRcdHVuaXQ6IFwiJVwiXG5cdFx0XHR9LFxuXHRcdFx0aHVlX3JvdGF0ZToge1xuXHRcdFx0XHR2YWx1ZTogMCxcblx0XHRcdFx0dW5pdDogXCJkZWdcIlxuXHRcdFx0fSxcblx0XHRcdGludmVydDoge1xuXHRcdFx0XHR2YWx1ZTogMCxcblx0XHRcdFx0dW5pdDogXCIlXCJcblx0XHRcdH0sXG5cdFx0XHRvcGFjaXR5OiB7XG5cdFx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0XHR1bml0OiBcIiVcIlxuXHRcdFx0fSxcblx0XHRcdHNhdHVyYXRlOiB7XG5cdFx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0XHR1bml0OiBcIiVcIlxuXHRcdFx0fSxcblx0XHRcdHNlcGlhOiB7XG5cdFx0XHRcdHZhbHVlOiAwLFxuXHRcdFx0XHR1bml0OiBcIiVcIlxuXHRcdFx0fSxcblx0XHRcdGJyaWdodG5lc3M6IHtcblx0XHRcdFx0dmFsdWU6IDAsXG5cdFx0XHRcdHVuaXQ6IFwiJVwiXG5cdFx0XHR9LFxuXHRcdFx0Y29udHJhc3Q6IHtcblx0XHRcdFx0dmFsdWU6IDAsXG5cdFx0XHRcdHVuaXQ6IFwiJVwiXG5cdFx0XHR9LFxuXHRcdFx0Ymx1cjoge1xuXHRcdFx0XHR2YWx1ZTogMCxcblx0XHRcdFx0dW5pdDogXCJweFwiXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBvcHRpb25zXG5cdFx0ICogQHJldHVybnMgW3BsYXllcnNdXG5cdFx0ICovXG5cdFx0YnVpbGRQbGF5ZXI6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBZVFBsYXllciA9IHRoaXM7XG5cdFx0XHRcdHZhciAkWVRQbGF5ZXIgPSBqUXVlcnkoIFlUUGxheWVyICk7XG5cdFx0XHRcdFlUUGxheWVyLmxvb3AgPSAwO1xuXHRcdFx0XHRZVFBsYXllci5vcHQgPSB7fTtcblx0XHRcdFx0WVRQbGF5ZXIuc3RhdGUgPSAwO1xuXHRcdFx0XHRZVFBsYXllci5maWx0ZXJzID0galF1ZXJ5Lm1iWVRQbGF5ZXIuZmlsdGVycztcblx0XHRcdFx0WVRQbGF5ZXIuZmlsdGVyc0VuYWJsZWQgPSB0cnVlO1xuXHRcdFx0XHRZVFBsYXllci5pZCA9IFlUUGxheWVyLmlkIHx8IFwiWVRQX1wiICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdFx0XHRcdCRZVFBsYXllci5hZGRDbGFzcyggXCJtYl9ZVFBsYXllclwiICk7XG5cblx0XHRcdFx0dmFyIHByb3BlcnR5ID0gJFlUUGxheWVyLmRhdGEoIFwicHJvcGVydHlcIiApICYmIHR5cGVvZiAkWVRQbGF5ZXIuZGF0YSggXCJwcm9wZXJ0eVwiICkgPT0gXCJzdHJpbmdcIiA/IGV2YWwoICcoJyArICRZVFBsYXllci5kYXRhKCBcInByb3BlcnR5XCIgKSArICcpJyApIDogJFlUUGxheWVyLmRhdGEoIFwicHJvcGVydHlcIiApO1xuXG5cdFx0XHRcdGlmKCB0eXBlb2YgcHJvcGVydHkgIT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgcHJvcGVydHkudm9sICE9IFwidW5kZWZpbmVkXCIgKSB7XG5cdFx0XHRcdFx0aWYoIHByb3BlcnR5LnZvbCA9PT0gMCApIHtcblx0XHRcdFx0XHRcdHByb3BlcnR5LnZvbCA9IDE7XG5cdFx0XHRcdFx0XHRwcm9wZXJ0eS5tdXRlID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRqUXVlcnkuZXh0ZW5kKCBZVFBsYXllci5vcHQsIGpRdWVyeS5tYllUUGxheWVyLmRlZmF1bHRzLCBvcHRpb25zLCBwcm9wZXJ0eSApO1xuXG5cdFx0XHRcdGlmKCAhWVRQbGF5ZXIuaGFzQ2hhbmdlZCApIHtcblx0XHRcdFx0XHRZVFBsYXllci5kZWZhdWx0T3B0ID0ge307XG5cdFx0XHRcdFx0alF1ZXJ5LmV4dGVuZCggWVRQbGF5ZXIuZGVmYXVsdE9wdCwgalF1ZXJ5Lm1iWVRQbGF5ZXIuZGVmYXVsdHMsIG9wdGlvbnMgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCBZVFBsYXllci5vcHQubG9vcCA9PSBcInRydWVcIiApXG5cdFx0XHRcdFx0WVRQbGF5ZXIub3B0Lmxvb3AgPSA5OTk5O1xuXG5cdFx0XHRcdFlUUGxheWVyLmlzUmV0aW5hID0gKCB3aW5kb3cucmV0aW5hIHx8IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID4gMSApO1xuXHRcdFx0XHR2YXIgaXNJZnJhbWUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHR2YXIgaXNJZnIgPSBmYWxzZTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYoIHNlbGYubG9jYXRpb24uaHJlZiAhPSB0b3AubG9jYXRpb24uaHJlZiApIGlzSWZyID0gdHJ1ZTtcblx0XHRcdFx0XHR9IGNhdGNoKCBlICkge1xuXHRcdFx0XHRcdFx0aXNJZnIgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gaXNJZnI7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0WVRQbGF5ZXIuY2FuR29GdWxsU2NyZWVuID0gISggalF1ZXJ5Lm1iQnJvd3Nlci5tc2llIHx8IGpRdWVyeS5tYkJyb3dzZXIub3BlcmEgfHwgaXNJZnJhbWUoKSApO1xuXHRcdFx0XHRpZiggIVlUUGxheWVyLmNhbkdvRnVsbFNjcmVlbiApIFlUUGxheWVyLm9wdC5yZWFsZnVsbHNjcmVlbiA9IGZhbHNlO1xuXHRcdFx0XHRpZiggISRZVFBsYXllci5hdHRyKCBcImlkXCIgKSApICRZVFBsYXllci5hdHRyKCBcImlkXCIsIFwieXRwX1wiICsgbmV3IERhdGUoKS5nZXRUaW1lKCkgKTtcblx0XHRcdFx0dmFyIHBsYXllcklEID0gXCJpZnJhbWVfXCIgKyBZVFBsYXllci5pZDtcblx0XHRcdFx0WVRQbGF5ZXIuaXNBbG9uZSA9IGZhbHNlO1xuXHRcdFx0XHRZVFBsYXllci5oYXNGb2N1cyA9IHRydWU7XG5cdFx0XHRcdFlUUGxheWVyLnZpZGVvSUQgPSB0aGlzLm9wdC52aWRlb1VSTCA/IGdldFlUUFZpZGVvSUQoIHRoaXMub3B0LnZpZGVvVVJMICkudmlkZW9JRCA6ICRZVFBsYXllci5hdHRyKCBcImhyZWZcIiApID8gZ2V0WVRQVmlkZW9JRCggJFlUUGxheWVyLmF0dHIoIFwiaHJlZlwiICkgKS52aWRlb0lEIDogZmFsc2U7XG5cdFx0XHRcdFlUUGxheWVyLnBsYXlsaXN0SUQgPSB0aGlzLm9wdC52aWRlb1VSTCA/IGdldFlUUFZpZGVvSUQoIHRoaXMub3B0LnZpZGVvVVJMICkucGxheWxpc3RJRCA6ICRZVFBsYXllci5hdHRyKCBcImhyZWZcIiApID8gZ2V0WVRQVmlkZW9JRCggJFlUUGxheWVyLmF0dHIoIFwiaHJlZlwiICkgKS5wbGF5bGlzdElEIDogZmFsc2U7XG5cblx0XHRcdFx0WVRQbGF5ZXIub3B0LnNob3dBbm5vdGF0aW9ucyA9IFlUUGxheWVyLm9wdC5zaG93QW5ub3RhdGlvbnMgPyAnMScgOiAnMyc7XG5cblx0XHRcdFx0dmFyIHN0YXJ0X2Zyb21fbGFzdCA9IDA7XG5cblx0XHRcdFx0aWYoIGpRdWVyeS5tYkNvb2tpZS5nZXQoIFwiWVRQbGF5ZXJfc3RhcnRfZnJvbVwiICsgWVRQbGF5ZXIudmlkZW9JRCApIClcblx0XHRcdFx0XHRzdGFydF9mcm9tX2xhc3QgPSBwYXJzZUZsb2F0KCBqUXVlcnkubWJDb29raWUuZ2V0KCBcIllUUGxheWVyX3N0YXJ0X2Zyb21cIiArIFlUUGxheWVyLnZpZGVvSUQgKSApO1xuXG5cdFx0XHRcdGlmKCBZVFBsYXllci5vcHQucmVtZW1iZXJfbGFzdF90aW1lICYmIHN0YXJ0X2Zyb21fbGFzdCApIHtcblx0XHRcdFx0XHRZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgPSBzdGFydF9mcm9tX2xhc3Q7XG5cdFx0XHRcdFx0alF1ZXJ5Lm1iQ29va2llLnJlbW92ZSggXCJZVFBsYXllcl9zdGFydF9mcm9tXCIgKyBZVFBsYXllci52aWRlb0lEICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiggalF1ZXJ5LmlzVGFibGV0IClcblx0XHRcdFx0XHRZVFBsYXllci5vcHQuYXV0b1BsYXkgPSBmYWxzZTtcblxuXHRcdFx0XHR2YXIgcGxheWVyVmFycyA9IHtcblx0XHRcdFx0XHQnbW9kZXN0YnJhbmRpbmcnOiAxLFxuXHRcdFx0XHRcdCdhdXRvcGxheSc6IGpRdWVyeS5pc1RhYmxldCA/IDAgOiAwLFxuXHRcdFx0XHRcdCdjb250cm9scyc6IDAsXG5cdFx0XHRcdFx0J3Nob3dpbmZvJzogMCxcblx0XHRcdFx0XHQncmVsJzogMCxcblx0XHRcdFx0XHQnZW5hYmxlanNhcGknOiAxLFxuXHRcdFx0XHRcdCd2ZXJzaW9uJzogMyxcblx0XHRcdFx0XHQncGxheWVyYXBpaWQnOiBwbGF5ZXJJRCxcblx0XHRcdFx0XHQnb3JpZ2luJzogJyonLFxuXHRcdFx0XHRcdCdhbGxvd2Z1bGxzY3JlZW4nOiB0cnVlLFxuXHRcdFx0XHRcdCd3bW9kZSc6ICd0cmFuc3BhcmVudCcsXG5cdFx0XHRcdFx0J2l2X2xvYWRfcG9saWN5JzogWVRQbGF5ZXIub3B0LnNob3dBbm5vdGF0aW9ucyxcblx0XHRcdFx0XHQncGxheXNpbmxpbmUnOiAxXG5cdFx0XHRcdH07XG5cblxuXHRcdFx0XHRpZiggZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3ZpZGVvJyApLmNhblBsYXlUeXBlICkgalF1ZXJ5LmV4dGVuZCggcGxheWVyVmFycywge1xuXHRcdFx0XHRcdCdodG1sNSc6IDFcblx0XHRcdFx0fSApO1xuXHRcdFx0XHRpZiggalF1ZXJ5Lm1iQnJvd3Nlci5tc2llICYmIGpRdWVyeS5tYkJyb3dzZXIudmVyc2lvbiA8IDkgKSB0aGlzLm9wdC5vcGFjaXR5ID0gMTtcblxuXHRcdFx0XHRZVFBsYXllci5pc1NlbGYgPSBZVFBsYXllci5vcHQuY29udGFpbm1lbnQgPT0gXCJzZWxmXCI7XG5cdFx0XHRcdFlUUGxheWVyLmRlZmF1bHRPcHQuY29udGFpbm1lbnQgPSBZVFBsYXllci5vcHQuY29udGFpbm1lbnQgPSBZVFBsYXllci5vcHQuY29udGFpbm1lbnQgPT0gXCJzZWxmXCIgPyBqUXVlcnkoIHRoaXMgKSA6IGpRdWVyeSggWVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50ICk7XG5cdFx0XHRcdFlUUGxheWVyLmlzQmFja2dyb3VuZCA9IFlUUGxheWVyLm9wdC5jb250YWlubWVudC5pcyggXCJib2R5XCIgKTtcblxuXHRcdFx0XHRpZiggWVRQbGF5ZXIuaXNCYWNrZ3JvdW5kICYmIHl0cC5iYWNrZ3JvdW5kSXNJbml0ZWQgKVxuXHRcdFx0XHRcdHJldHVybjtcblxuXHRcdFx0XHR2YXIgaXNQbGF5ZXIgPSBZVFBsYXllci5vcHQuY29udGFpbm1lbnQuaXMoIGpRdWVyeSggdGhpcyApICk7XG5cblx0XHRcdFx0WVRQbGF5ZXIuY2FuUGxheU9uTW9iaWxlID0gaXNQbGF5ZXIgJiYgalF1ZXJ5KCB0aGlzICkuY2hpbGRyZW4oKS5sZW5ndGggPT09IDA7XG5cdFx0XHRcdFlUUGxheWVyLmlzUGxheWVyID0gZmFsc2U7XG5cblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIEhpZGUgdGhlIHBsYWNlaG9sZGVyIGlmIGl0J3Mgbm90IHRoZSB0YXJnZXQgb2YgdGhlIHBsYXllclxuXHRcdFx0XHQgKi9cblx0XHRcdFx0aWYoICFpc1BsYXllciApIHtcblx0XHRcdFx0XHQkWVRQbGF5ZXIuaGlkZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFlUUGxheWVyLmlzUGxheWVyID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciBvdmVybGF5ID0galF1ZXJ5KCBcIjxkaXYvPlwiICkuY3NzKCB7XG5cdFx0XHRcdFx0cG9zaXRpb246IFwiYWJzb2x1dGVcIixcblx0XHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdFx0bGVmdDogMCxcblx0XHRcdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIlxuXHRcdFx0XHR9ICkuYWRkQ2xhc3MoIFwiWVRQT3ZlcmxheVwiICk7XG5cblx0XHRcdFx0aWYoIFlUUGxheWVyLmlzUGxheWVyICkge1xuXHRcdFx0XHRcdG92ZXJsYXkub24oIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHQkWVRQbGF5ZXIuWVRQVG9nZ2xlUGxheSgpO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciB3cmFwcGVyID0galF1ZXJ5KCBcIjxkaXYvPlwiICkuYWRkQ2xhc3MoIFwibWJZVFBfd3JhcHBlclwiICkuYXR0ciggXCJpZFwiLCBcIndyYXBwZXJfXCIgKyBZVFBsYXllci5pZCApO1xuXHRcdFx0XHR3cmFwcGVyLmNzcygge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdFx0ekluZGV4OiAwLFxuXHRcdFx0XHRcdG1pbldpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0XHRtaW5IZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdFx0dG9wOiAwLFxuXHRcdFx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiLFxuXHRcdFx0XHRcdG9wYWNpdHk6IDBcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdHZhciBwbGF5ZXJCb3ggPSBqUXVlcnkoIFwiPGRpdi8+XCIgKS5hdHRyKCBcImlkXCIsIHBsYXllcklEICkuYWRkQ2xhc3MoIFwicGxheWVyQm94XCIgKTtcblx0XHRcdFx0cGxheWVyQm94LmNzcygge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdFx0ekluZGV4OiAwLFxuXHRcdFx0XHRcdHdpZHRoOiBcIjEwMCVcIixcblx0XHRcdFx0XHRoZWlnaHQ6IFwiMTAwJVwiLFxuXHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRsZWZ0OiAwLFxuXHRcdFx0XHRcdG92ZXJmbG93OiBcImhpZGRlblwiXG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHR3cmFwcGVyLmFwcGVuZCggcGxheWVyQm94ICk7XG5cblx0XHRcdFx0WVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNoaWxkcmVuKCkubm90KCBcInNjcmlwdCwgc3R5bGVcIiApLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmKCBqUXVlcnkoIHRoaXMgKS5jc3MoIFwicG9zaXRpb25cIiApID09IFwic3RhdGljXCIgKSBqUXVlcnkoIHRoaXMgKS5jc3MoIFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiICk7XG5cdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRpZiggWVRQbGF5ZXIuaXNCYWNrZ3JvdW5kICkge1xuXHRcdFx0XHRcdGpRdWVyeSggXCJib2R5XCIgKS5jc3MoIHtcblx0XHRcdFx0XHRcdGJveFNpemluZzogXCJib3JkZXItYm94XCJcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHR3cmFwcGVyLmNzcygge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IFwiZml4ZWRcIixcblx0XHRcdFx0XHRcdHRvcDogMCxcblx0XHRcdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdFx0XHR6SW5kZXg6IDBcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHQkWVRQbGF5ZXIuaGlkZSgpO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiggWVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNzcyggXCJwb3NpdGlvblwiICkgPT0gXCJzdGF0aWNcIiApXG5cdFx0XHRcdFx0WVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNzcygge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IFwicmVsYXRpdmVcIlxuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRZVFBsYXllci5vcHQuY29udGFpbm1lbnQucHJlcGVuZCggd3JhcHBlciApO1xuXHRcdFx0XHRZVFBsYXllci53cmFwcGVyID0gd3JhcHBlcjtcblxuXHRcdFx0XHRwbGF5ZXJCb3guY3NzKCB7XG5cdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0Ly9pZiggIWpRdWVyeS5tYkJyb3dzZXIubW9iaWxlICkge1xuXHRcdFx0XHRwbGF5ZXJCb3guYWZ0ZXIoIG92ZXJsYXkgKTtcblx0XHRcdFx0WVRQbGF5ZXIub3ZlcmxheSA9IG92ZXJsYXk7XG5cdFx0XHRcdC8vXHR9XG5cblx0XHRcdFx0aWYoIGpRdWVyeS5pc1RhYmxldCApXG5cdFx0XHRcdFx0alF1ZXJ5KCBcImJvZHlcIiApLm9uZSggXCJ0b3VjaHN0YXJ0XCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnBsYXlWaWRlbygpO1xuXHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRpZiggIVlUUGxheWVyLmlzQmFja2dyb3VuZCApIHtcblx0XHRcdFx0XHRvdmVybGF5Lm9uKCBcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuY29udHJvbEJhciAmJiBZVFBsYXllci5jb250cm9sQmFyLmxlbmd0aCApXG5cdFx0XHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuYWRkQ2xhc3MoIFwidmlzaWJsZVwiICk7XG5cdFx0XHRcdFx0fSApLm9uKCBcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuY29udHJvbEJhciAmJiBZVFBsYXllci5jb250cm9sQmFyLmxlbmd0aCApXG5cdFx0XHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIucmVtb3ZlQ2xhc3MoIFwidmlzaWJsZVwiICk7XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoICF5dHAuWVRBUElSZWFkeSApIHtcblx0XHRcdFx0XHRqUXVlcnkoIFwiI1lUQVBJXCIgKS5yZW1vdmUoKTtcblx0XHRcdFx0XHR2YXIgdGFnID0galF1ZXJ5KCBcIjxzY3JpcHQvPlwiICkuYXR0cigge1xuXHRcdFx0XHRcdFx0XCJhc3luY1wiOiBcImFzeW5jXCIsXG5cdFx0XHRcdFx0XHRcInNyY1wiOiBqUXVlcnkubWJZVFBsYXllci5sb2NhdGlvblByb3RvY29sICsgXCIvL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpP3Y9XCIgKyBqUXVlcnkubWJZVFBsYXllci52ZXJzaW9uLFxuXHRcdFx0XHRcdFx0XCJpZFwiOiBcIllUQVBJXCJcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0alF1ZXJ5KCBcImhlYWRcIiApLnByZXBlbmQoIHRhZyApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0alF1ZXJ5KCBkb2N1bWVudCApLnRyaWdnZXIoIFwiWVRBUElSZWFkeVwiICk7XG5cdFx0XHRcdFx0fSwgMTAwICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zb2xlLmRlYnVnKCBqUXVlcnkubWJCcm93c2VyLm1vYmlsZSwgalF1ZXJ5LmlzVGFibGV0LCBZVFBsYXllci5jYW5QbGF5T25Nb2JpbGUgKTtcblx0XHRcdFx0aWYoIGpRdWVyeS5tYkJyb3dzZXIubW9iaWxlICYmICFqUXVlcnkuaXNUYWJsZXQgJiYgIVlUUGxheWVyLmNhblBsYXlPbk1vYmlsZSApIHtcblxuXHRcdFx0XHRcdGlmKCBZVFBsYXllci5vcHQubW9iaWxlRmFsbGJhY2tJbWFnZSApIHtcblx0XHRcdFx0XHRcdHdyYXBwZXIuY3NzKCB7XG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmRJbWFnZTogXCJ1cmwoXCIgKyBZVFBsYXllci5vcHQubW9iaWxlRmFsbGJhY2tJbWFnZSArIFwiKVwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kUG9zaXRpb246IFwiY2VudGVyIGNlbnRlclwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kU2l6ZTogXCJjb3ZlclwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kUmVwZWF0OiBcIm5vLXJlcGVhdFwiLFxuXHRcdFx0XHRcdFx0XHRvcGFjaXR5OiAxXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYoICFZVFBsYXllci5pc1BsYXllciApXG5cdFx0XHRcdFx0XHQkWVRQbGF5ZXIucmVtb3ZlKCk7XG5cdFx0XHRcdFx0alF1ZXJ5KCBkb2N1bWVudCApLnRyaWdnZXIoIFwiWVRQVW5hdmFpbGFibGVcIiApO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vbiggXCJZVEFQSVJlYWR5XCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmKCAoIFlUUGxheWVyLmlzQmFja2dyb3VuZCAmJiB5dHAuYmFja2dyb3VuZElzSW5pdGVkICkgfHwgWVRQbGF5ZXIuaXNJbml0ICkgcmV0dXJuO1xuXHRcdFx0XHRcdGlmKCBZVFBsYXllci5pc0JhY2tncm91bmQgKSB7XG5cdFx0XHRcdFx0XHR5dHAuYmFja2dyb3VuZElzSW5pdGVkID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRZVFBsYXllci5vcHQuYXV0b1BsYXkgPSB0eXBlb2YgWVRQbGF5ZXIub3B0LmF1dG9QbGF5ID09IFwidW5kZWZpbmVkXCIgPyAoIFlUUGxheWVyLmlzQmFja2dyb3VuZCA/IHRydWUgOiBmYWxzZSApIDogWVRQbGF5ZXIub3B0LmF1dG9QbGF5O1xuXHRcdFx0XHRcdFlUUGxheWVyLm9wdC52b2wgPSBZVFBsYXllci5vcHQudm9sID8gWVRQbGF5ZXIub3B0LnZvbCA6IDEwMDtcblx0XHRcdFx0XHRqUXVlcnkubWJZVFBsYXllci5nZXREYXRhRnJvbUFQSSggWVRQbGF5ZXIgKTtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkub24oIFwiWVRQQ2hhbmdlZFwiLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLmlzSW5pdCApXG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblxuXHRcdFx0XHRcdFx0WVRQbGF5ZXIuaXNJbml0ID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly9pZiBpcyBtb2JpbGUgJiYgaXNQbGF5ZXIgZmFsbGJhY2sgdG8gdGhlIGRlZmF1bHQgWVQgcGxheWVyXG5cdFx0XHRcdFx0XHRpZiggalF1ZXJ5Lm1iQnJvd3Nlci5tb2JpbGUgJiYgWVRQbGF5ZXIuY2FuUGxheU9uTW9iaWxlICYmICFqUXVlcnkuaXNUYWJsZXQgKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFRyeSB0byBhZGp1c3QgdGhlIHBsYXllciBkaW1lbnRpb25cblx0XHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLm9wdC5jb250YWlubWVudC5vdXRlcldpZHRoKCkgPiBqUXVlcnkoIHdpbmRvdyApLndpZHRoKCkgKSB7XG5cdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNzcygge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWF4V2lkdGg6IFwiMTAwJVwiXG5cdFx0XHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdFx0XHRcdHZhciBoID0gWVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50Lm91dGVyV2lkdGgoKSAqIC41NjM7XG5cdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNzcygge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWF4SGVpZ2h0OiBoXG5cdFx0XHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG5ldyBZVC5QbGF5ZXIoIHBsYXllcklELCB7XG5cdFx0XHRcdFx0XHRcdFx0dmlkZW9JZDogWVRQbGF5ZXIudmlkZW9JRC50b1N0cmluZygpLFxuXHRcdFx0XHRcdFx0XHRcdHdpZHRoOiAnMTAwJScsXG5cdFx0XHRcdFx0XHRcdFx0aGVpZ2h0OiBoLFxuXHRcdFx0XHRcdFx0XHRcdHBsYXllclZhcnM6IHBsYXllclZhcnMsXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnRzOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHQnb25SZWFkeSc6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyID0gZXZlbnQudGFyZ2V0O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwbGF5ZXJCb3guY3NzKCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLndyYXBwZXIuY3NzKCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bmV3IFlULlBsYXllciggcGxheWVySUQsIHtcblx0XHRcdFx0XHRcdFx0dmlkZW9JZDogWVRQbGF5ZXIudmlkZW9JRC50b1N0cmluZygpLFxuXHRcdFx0XHRcdFx0XHRwbGF5ZXJWYXJzOiBwbGF5ZXJWYXJzLFxuXHRcdFx0XHRcdFx0XHRldmVudHM6IHtcblx0XHRcdFx0XHRcdFx0XHQnb25SZWFkeSc6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLnBsYXllciA9IGV2ZW50LnRhcmdldDtcblx0XHRcdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5pc1JlYWR5ICkgcmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIuaXNSZWFkeSA9IFlUUGxheWVyLmlzUGxheWVyICYmICFZVFBsYXllci5vcHQuYXV0b1BsYXkgPyBmYWxzZSA6IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXJFbCA9IFlUUGxheWVyLnBsYXllci5nZXRJZnJhbWUoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApLnVuc2VsZWN0YWJsZSgpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHQkWVRQbGF5ZXIub3B0aW1pemVEaXNwbGF5KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRqUXVlcnkoIHdpbmRvdyApLm9mZiggXCJyZXNpemUuWVRQX1wiICsgWVRQbGF5ZXIuaWQgKS5vbiggXCJyZXNpemUuWVRQX1wiICsgWVRQbGF5ZXIuaWQsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQkWVRQbGF5ZXIub3B0aW1pemVEaXNwbGF5KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5vcHQucmVtZW1iZXJfbGFzdF90aW1lICkge1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggd2luZG93ICkub24oIFwidW5sb2FkLllUUF9cIiArIFlUUGxheWVyLmlkLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgY3VycmVudF90aW1lID0gWVRQbGF5ZXIucGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRqUXVlcnkubWJDb29raWUuc2V0KCBcIllUUGxheWVyX3N0YXJ0X2Zyb21cIiArIFlUUGxheWVyLnZpZGVvSUQsIGN1cnJlbnRfdGltZSwgMCApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0alF1ZXJ5Lm1iWVRQbGF5ZXIuY2hlY2tGb3JTdGF0ZSggWVRQbGF5ZXIgKTtcblx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0XHRcdCAqXG5cdFx0XHRcdFx0XHRcdFx0ICogQHBhcmFtIGV2ZW50XG5cdFx0XHRcdFx0XHRcdFx0ICpcblx0XHRcdFx0XHRcdFx0XHQgKiAtMSAodW5zdGFydGVkKVxuXHRcdFx0XHRcdFx0XHRcdCAqIDAgKGVuZGVkKVxuXHRcdFx0XHRcdFx0XHRcdCAqIDEgKHBsYXlpbmcpXG5cdFx0XHRcdFx0XHRcdFx0ICogMiAocGF1c2VkKVxuXHRcdFx0XHRcdFx0XHRcdCAqIDMgKGJ1ZmZlcmluZylcblx0XHRcdFx0XHRcdFx0XHQgKiA1ICh2aWRlbyBjdWVkKS5cblx0XHRcdFx0XHRcdFx0XHQgKlxuXHRcdFx0XHRcdFx0XHRcdCAqXG5cdFx0XHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRcdFx0J29uU3RhdGVDaGFuZ2UnOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiggdHlwZW9mIGV2ZW50LnRhcmdldC5nZXRQbGF5ZXJTdGF0ZSAhPSBcImZ1bmN0aW9uXCIgKSByZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgc3RhdGUgPSBldmVudC50YXJnZXQuZ2V0UGxheWVyU3RhdGUoKTtcblxuXHRcdFx0XHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLnByZXZlbnRUcmlnZ2VyICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRZVFBsYXllci5wcmV2ZW50VHJpZ2dlciA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLnN0YXRlID0gc3RhdGU7XG5cblx0XHRcdFx0XHRcdFx0XHRcdHZhciBldmVudFR5cGU7XG5cdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2goIHN0YXRlICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIC0xOiAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHVuc3RhcnRlZFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGV2ZW50VHlwZSA9IFwiWVRQVW5zdGFydGVkXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgMDogLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZW5kZWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRldmVudFR5cGUgPSBcIllUUFJlYWxFbmRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAxOiAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwbGF5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZXZlbnRUeXBlID0gXCJZVFBQbGF5XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLmNvbnRyb2xCYXIubGVuZ3RoIClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuZmluZCggXCIubWJfWVRQUGxheXBhdXNlXCIgKS5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy5wYXVzZSApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCB0eXBlb2YgX2dhcSAhPSBcInVuZGVmaW5lZFwiICYmIGV2YWwoIFlUUGxheWVyLm9wdC5nYVRyYWNrICkgKSBfZ2FxLnB1c2goIFsgJ190cmFja0V2ZW50JywgJ1lUUGxheWVyJywgJ1BsYXknLCAoIFlUUGxheWVyLmhhc0RhdGEgPyBZVFBsYXllci52aWRlb0RhdGEudGl0bGUgOiBZVFBsYXllci52aWRlb0lELnRvU3RyaW5nKCkgKSBdICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYoIHR5cGVvZiBnYSAhPSBcInVuZGVmaW5lZFwiICYmIGV2YWwoIFlUUGxheWVyLm9wdC5nYVRyYWNrICkgKSBnYSggJ3NlbmQnLCAnZXZlbnQnLCAnWVRQbGF5ZXInLCAncGxheScsICggWVRQbGF5ZXIuaGFzRGF0YSA/IFlUUGxheWVyLnZpZGVvRGF0YS50aXRsZSA6IFlUUGxheWVyLnZpZGVvSUQudG9TdHJpbmcoKSApICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgMjogLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcGF1c2Vcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRldmVudFR5cGUgPSBcIllUUFBhdXNlXCI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLmNvbnRyb2xCYXIubGVuZ3RoIClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuZmluZCggXCIubWJfWVRQUGxheXBhdXNlXCIgKS5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy5wbGF5ICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgMzogLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYnVmZmVyXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnNldFBsYXliYWNrUXVhbGl0eSggWVRQbGF5ZXIub3B0LnF1YWxpdHkgKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRldmVudFR5cGUgPSBcIllUUEJ1ZmZlcmluZ1wiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5jb250cm9sQmFyLmxlbmd0aCApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRZVFBsYXllci5jb250cm9sQmFyLmZpbmQoIFwiLm1iX1lUUFBsYXlwYXVzZVwiICkuaHRtbCggalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMucGxheSApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlIDU6IC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGN1ZWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRldmVudFR5cGUgPSBcIllUUEN1ZWRcIjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gVHJpZ2dlciBzdGF0ZSBldmVudHNcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBZVFBFdmVudCA9IGpRdWVyeS5FdmVudCggZXZlbnRUeXBlICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRZVFBFdmVudC50aW1lID0gWVRQbGF5ZXIuY3VycmVudFRpbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuY2FuVHJpZ2dlciApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBZVFBFdmVudCApO1xuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHRcdFx0ICpcblx0XHRcdFx0XHRcdFx0XHQgKiBAcGFyYW0gZVxuXHRcdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRcdCdvblBsYXliYWNrUXVhbGl0eUNoYW5nZSc6IGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIHF1YWxpdHkgPSBlLnRhcmdldC5nZXRQbGF5YmFja1F1YWxpdHkoKTtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciBZVFBRdWFsaXR5Q2hhbmdlID0galF1ZXJ5LkV2ZW50KCBcIllUUFF1YWxpdHlDaGFuZ2VcIiApO1xuXHRcdFx0XHRcdFx0XHRcdFx0WVRQUXVhbGl0eUNoYW5nZS5xdWFsaXR5ID0gcXVhbGl0eTtcblx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBZVFBRdWFsaXR5Q2hhbmdlICk7XG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdFx0XHQgKlxuXHRcdFx0XHRcdFx0XHRcdCAqIEBwYXJhbSBlcnJcblx0XHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0XHQnb25FcnJvcic6IGZ1bmN0aW9uKCBlcnIgKSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmKCBlcnIuZGF0YSA9PSAxNTAgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCBcIkVtYmVkZGluZyB0aGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgYnkgWW91dHViZS5cIiApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuaXNQbGF5TGlzdCApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnBsYXlOZXh0KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRcdGlmKCBlcnIuZGF0YSA9PSAyICYmIFlUUGxheWVyLmlzUGxheUxpc3QgKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5wbGF5TmV4dCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiggdHlwZW9mIFlUUGxheWVyLm9wdC5vbkVycm9yID09IFwiZnVuY3Rpb25cIiApXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLm9wdC5vbkVycm9yKCAkWVRQbGF5ZXIsIGVyciApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdCRZVFBsYXllci5vZmYoIFwiWVRQVGltZS5tYXNrXCIgKTtcblxuXHRcdFx0XHRqUXVlcnkubWJZVFBsYXllci5hcHBseU1hc2soIFlUUGxheWVyICk7XG5cblx0XHRcdH0gKTtcblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2sgaWYgdGhlIFlUUGxheWVyIGlzIG9uIHNjcmVlblxuXHRcdCAqL1xuXHRcdGlzT25TY3JlZW46IGZ1bmN0aW9uKCBZVFBsYXllciApIHtcblxuXHRcdFx0dmFyIHBsYXllckJveCA9IFlUUGxheWVyLndyYXBwZXI7XG5cblx0XHRcdHZhciB3aW5Ub3AgPSAkKCB3aW5kb3cgKS5zY3JvbGxUb3AoKTtcblx0XHRcdHZhciB3aW5Cb3R0b20gPSB3aW5Ub3AgKyAkKCB3aW5kb3cgKS5oZWlnaHQoKTtcblx0XHRcdHZhciBlbFRvcCA9IHBsYXllckJveC5vZmZzZXQoKS50b3A7XG5cdFx0XHR2YXIgZWxCb3R0b20gPSBlbFRvcCArIHBsYXllckJveC5oZWlnaHQoKTtcblx0XHRcdHJldHVybiggKCBlbEJvdHRvbSA8PSB3aW5Cb3R0b20gKSAmJiAoIGVsVG9wID49IHdpblRvcCApICk7XG5cblx0XHR9LFxuXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gWVRQbGF5ZXJcblx0XHQgKi9cblx0XHRnZXREYXRhRnJvbUFQSTogZnVuY3Rpb24oIFlUUGxheWVyICkge1xuXHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhID0galF1ZXJ5Lm1iU3RvcmFnZS5nZXQoIFwiWVRQbGF5ZXJfZGF0YV9cIiArIFlUUGxheWVyLnZpZGVvSUQgKTtcblx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5vZmYoIFwiWVRQRGF0YS5ZVFBsYXllclwiICkub24oIFwiWVRQRGF0YS5ZVFBsYXllclwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoIFlUUGxheWVyLmhhc0RhdGEgKSB7XG5cblx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuaXNQbGF5ZXIgJiYgIVlUUGxheWVyLm9wdC5hdXRvUGxheSApIHtcblx0XHRcdFx0XHRcdHZhciBiZ25kVVJMID0gWVRQbGF5ZXIudmlkZW9EYXRhLnRodW1iX21heCB8fCBZVFBsYXllci52aWRlb0RhdGEudGh1bWJfaGlnaCB8fCBZVFBsYXllci52aWRlb0RhdGEudGh1bWJfbWVkaXVtO1xuXG5cdFx0XHRcdFx0XHRZVFBsYXllci5vcHQuY29udGFpbm1lbnQuY3NzKCB7XG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmQ6IFwicmdiYSgwLDAsMCwwLjUpIHVybChcIiArIGJnbmRVUkwgKyBcIikgY2VudGVyIGNlbnRlclwiLFxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kU2l6ZTogXCJjb3ZlclwiXG5cdFx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5vcHQuYmFja2dyb3VuZFVybCA9IGJnbmRVUkw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHRcdGlmKCBZVFBsYXllci52aWRlb0RhdGEgKSB7XG5cblx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0WVRQbGF5ZXIub3B0LnJhdGlvID0gWVRQbGF5ZXIub3B0LnJhdGlvID09IFwiYXV0b1wiID8gXCIxNi85XCIgOiBZVFBsYXllci5vcHQucmF0aW87XG5cdFx0XHRcdFx0WVRQbGF5ZXIuZGF0YVJlY2VpdmVkID0gdHJ1ZTtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkudHJpZ2dlciggXCJZVFBDaGFuZ2VkXCIgKTtcblx0XHRcdFx0XHR2YXIgWVRQRGF0YSA9IGpRdWVyeS5FdmVudCggXCJZVFBEYXRhXCIgKTtcblx0XHRcdFx0XHRZVFBEYXRhLnByb3AgPSB7fTtcblx0XHRcdFx0XHRmb3IoIHZhciB4IGluIFlUUGxheWVyLnZpZGVvRGF0YSApIFlUUERhdGEucHJvcFsgeCBdID0gWVRQbGF5ZXIudmlkZW9EYXRhWyB4IF07XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUERhdGEgKTtcblx0XHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSApO1xuXG5cdFx0XHRcdFlUUGxheWVyLmhhc0RhdGEgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmKCBqUXVlcnkubWJZVFBsYXllci5hcGlLZXkgKSB7XG5cdFx0XHRcdC8vIEdldCB2aWRlbyBpbmZvIGZyb20gQVBJMyAobmVlZHMgYXBpIGtleSlcblx0XHRcdFx0Ly8gc25pcHBldCxwbGF5ZXIsY29udGVudERldGFpbHMsc3RhdGlzdGljcyxzdGF0dXNcblx0XHRcdFx0alF1ZXJ5LmdldEpTT04oIGpRdWVyeS5tYllUUGxheWVyLmxvY2F0aW9uUHJvdG9jb2wgKyBcIi8vd3d3Lmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjMvdmlkZW9zP2lkPVwiICsgWVRQbGF5ZXIudmlkZW9JRCArIFwiJmtleT1cIiArIGpRdWVyeS5tYllUUGxheWVyLmFwaUtleSArIFwiJnBhcnQ9c25pcHBldFwiLCBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcdFx0XHRZVFBsYXllci5kYXRhUmVjZWl2ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBcIllUUENoYW5nZWRcIiApO1xuXG5cdFx0XHRcdFx0ZnVuY3Rpb24gcGFyc2VZVFBsYXllcl9kYXRhKCBkYXRhICkge1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhID0ge307XG5cdFx0XHRcdFx0XHRZVFBsYXllci52aWRlb0RhdGEuaWQgPSBZVFBsYXllci52aWRlb0lEO1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhLmNoYW5uZWxUaXRsZSA9IGRhdGEuY2hhbm5lbFRpdGxlO1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhLnRpdGxlID0gZGF0YS50aXRsZTtcblx0XHRcdFx0XHRcdFlUUGxheWVyLnZpZGVvRGF0YS5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb24ubGVuZ3RoIDwgNDAwID8gZGF0YS5kZXNjcmlwdGlvbiA6IGRhdGEuZGVzY3JpcHRpb24uc3Vic3RyaW5nKCAwLCA0MDAgKSArIFwiIC4uLlwiO1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhLmFzcGVjdHJhdGlvID0gWVRQbGF5ZXIub3B0LnJhdGlvID09IFwiYXV0b1wiID8gXCIxNi85XCIgOiBZVFBsYXllci5vcHQucmF0aW87XG5cdFx0XHRcdFx0XHRZVFBsYXllci5vcHQucmF0aW8gPSBZVFBsYXllci52aWRlb0RhdGEuYXNwZWN0cmF0aW87XG5cdFx0XHRcdFx0XHRZVFBsYXllci52aWRlb0RhdGEudGh1bWJfbWF4ID0gZGF0YS50aHVtYm5haWxzLm1heHJlcyA/IGRhdGEudGh1bWJuYWlscy5tYXhyZXMudXJsIDogbnVsbDtcblx0XHRcdFx0XHRcdFlUUGxheWVyLnZpZGVvRGF0YS50aHVtYl9oaWdoID0gZGF0YS50aHVtYm5haWxzLmhpZ2ggPyBkYXRhLnRodW1ibmFpbHMuaGlnaC51cmwgOiBudWxsO1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIudmlkZW9EYXRhLnRodW1iX21lZGl1bSA9IGRhdGEudGh1bWJuYWlscy5tZWRpdW0gPyBkYXRhLnRodW1ibmFpbHMubWVkaXVtLnVybCA6IG51bGw7XG5cdFx0XHRcdFx0XHRqUXVlcnkubWJTdG9yYWdlLnNldCggXCJZVFBsYXllcl9kYXRhX1wiICsgWVRQbGF5ZXIudmlkZW9JRCwgWVRQbGF5ZXIudmlkZW9EYXRhICk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cGFyc2VZVFBsYXllcl9kYXRhKCBkYXRhLml0ZW1zWyAwIF0uc25pcHBldCApO1xuXHRcdFx0XHRcdFlUUGxheWVyLmhhc0RhdGEgPSB0cnVlO1xuXHRcdFx0XHRcdHZhciBZVFBEYXRhID0galF1ZXJ5LkV2ZW50KCBcIllUUERhdGFcIiApO1xuXHRcdFx0XHRcdFlUUERhdGEucHJvcCA9IHt9O1xuXHRcdFx0XHRcdGZvciggdmFyIHggaW4gWVRQbGF5ZXIudmlkZW9EYXRhICkgWVRQRGF0YS5wcm9wWyB4IF0gPSBZVFBsYXllci52aWRlb0RhdGFbIHggXTtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkudHJpZ2dlciggWVRQRGF0YSApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkudHJpZ2dlciggXCJZVFBDaGFuZ2VkXCIgKTtcblx0XHRcdFx0fSwgNTAgKTtcblx0XHRcdFx0aWYoIFlUUGxheWVyLmlzUGxheWVyICYmICFZVFBsYXllci5vcHQuYXV0b1BsYXkgKSB7XG5cdFx0XHRcdFx0dmFyIGJnbmRVUkwgPSBqUXVlcnkubWJZVFBsYXllci5sb2NhdGlvblByb3RvY29sICsgXCIvL2kueXRpbWcuY29tL3ZpL1wiICsgWVRQbGF5ZXIudmlkZW9JRCArIFwiL2hxZGVmYXVsdC5qcGdcIjtcblxuXHRcdFx0XHRcdGlmKCBiZ25kVVJMIClcblx0XHRcdFx0XHRcdFlUUGxheWVyLm9wdC5jb250YWlubWVudC5jc3MoIHtcblx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZDogXCJyZ2JhKDAsMCwwLDAuNSkgdXJsKFwiICsgYmduZFVSTCArIFwiKSBjZW50ZXIgY2VudGVyXCIsXG5cdFx0XHRcdFx0XHRcdGJhY2tncm91bmRTaXplOiBcImNvdmVyXCJcblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRZVFBsYXllci5vcHQuYmFja2dyb3VuZFVybCA9IGJnbmRVUkw7XG5cblx0XHRcdFx0fVxuXHRcdFx0XHRZVFBsYXllci52aWRlb0RhdGEgPSBudWxsO1xuXHRcdFx0XHRZVFBsYXllci5vcHQucmF0aW8gPSBZVFBsYXllci5vcHQucmF0aW8gPT0gXCJhdXRvXCIgPyBcIjE2LzlcIiA6IFlUUGxheWVyLm9wdC5yYXRpbztcblx0XHRcdH1cblx0XHRcdGlmKCBZVFBsYXllci5pc1BsYXllciAmJiAhWVRQbGF5ZXIub3B0LmF1dG9QbGF5ICYmICggIWpRdWVyeS5tYkJyb3dzZXIubW9iaWxlICYmICFqUXVlcnkuaXNUYWJsZXQgKSApIHtcblx0XHRcdFx0WVRQbGF5ZXIubG9hZGluZyA9IGpRdWVyeSggXCI8ZGl2Lz5cIiApLmFkZENsYXNzKCBcImxvYWRpbmdcIiApLmh0bWwoIFwiTG9hZGluZ1wiICkuaGlkZSgpO1xuXHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuYXBwZW5kKCBZVFBsYXllci5sb2FkaW5nICk7XG5cdFx0XHRcdFlUUGxheWVyLmxvYWRpbmcuZmFkZUluKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqL1xuXHRcdHJlbW92ZVN0b3JlZERhdGE6IGZ1bmN0aW9uKCkge1xuXHRcdFx0alF1ZXJ5Lm1iU3RvcmFnZS5yZW1vdmUoKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgeyp8WVRQbGF5ZXIudmlkZW9EYXRhfVxuXHRcdCAqL1xuXHRcdGdldFZpZGVvRGF0YTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0cmV0dXJuIFlUUGxheWVyLnZpZGVvRGF0YTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgeyp8WVRQbGF5ZXIudmlkZW9JRHxib29sZWFufVxuXHRcdCAqL1xuXHRcdGdldFZpZGVvSUQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdHJldHVybiBZVFBsYXllci52aWRlb0lEIHx8IGZhbHNlO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcXVhbGl0eVxuXHRcdCAqL1xuXHRcdHNldFZpZGVvUXVhbGl0eTogZnVuY3Rpb24oIHF1YWxpdHkgKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0WVRQbGF5ZXIucGxheWVyLnNldFBsYXliYWNrUXVhbGl0eSggcXVhbGl0eSApO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gdmlkZW9zXG5cdFx0ICogQHBhcmFtIHNodWZmbGVcblx0XHQgKiBAcGFyYW0gY2FsbGJhY2tcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0cGxheWxpc3Q6IGZ1bmN0aW9uKCB2aWRlb3MsIHNodWZmbGUsIGNhbGxiYWNrICkge1xuXHRcdFx0dmFyICRZVFBsYXllciA9IHRoaXM7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSAkWVRQbGF5ZXIuZ2V0KCAwICk7XG5cdFx0XHRZVFBsYXllci5pc1BsYXlMaXN0ID0gdHJ1ZTtcblx0XHRcdGlmKCBzaHVmZmxlICkgdmlkZW9zID0galF1ZXJ5LnNodWZmbGUoIHZpZGVvcyApO1xuXHRcdFx0aWYoICFZVFBsYXllci52aWRlb0lEICkge1xuXHRcdFx0XHRZVFBsYXllci52aWRlb3MgPSB2aWRlb3M7XG5cdFx0XHRcdFlUUGxheWVyLnZpZGVvQ291bnRlciA9IDA7XG5cdFx0XHRcdFlUUGxheWVyLnZpZGVvTGVuZ3RoID0gdmlkZW9zLmxlbmd0aDtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLmRhdGEoIFwicHJvcGVydHlcIiwgdmlkZW9zWyAwIF0gKTtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLm1iX1lUUGxheWVyKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiggdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiApIGpRdWVyeSggWVRQbGF5ZXIgKS5vbmUoIFwiWVRQQ2hhbmdlZFwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y2FsbGJhY2soIFlUUGxheWVyICk7XG5cdFx0XHR9ICk7XG5cdFx0XHRqUXVlcnkoIFlUUGxheWVyICkub24oIFwiWVRQRW5kXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkucGxheU5leHQoKTtcblx0XHRcdH0gKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0cGxheU5leHQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblxuXHRcdFx0aWYoIFlUUGxheWVyLmNoZWNrRm9yU3RhcnRBdCApIHtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuY2hlY2tGb3JTdGFydEF0ICk7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmdldFN0YXRlICk7XG5cdFx0XHR9XG5cblx0XHRcdFlUUGxheWVyLnZpZGVvQ291bnRlcisrO1xuXG5cdFx0XHRpZiggWVRQbGF5ZXIudmlkZW9Db3VudGVyID49IFlUUGxheWVyLnZpZGVvTGVuZ3RoIClcblx0XHRcdFx0WVRQbGF5ZXIudmlkZW9Db3VudGVyID0gMDtcblxuXHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUENoYW5nZU1vdmllKCBZVFBsYXllci52aWRlb3NbIFlUUGxheWVyLnZpZGVvQ291bnRlciBdICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0cGxheVByZXY6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblxuXHRcdFx0aWYoIFlUUGxheWVyLmNoZWNrRm9yU3RhcnRBdCApIHtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuY2hlY2tGb3JTdGFydEF0ICk7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmdldFN0YXRlICk7XG5cdFx0XHR9XG5cblx0XHRcdFlUUGxheWVyLnZpZGVvQ291bnRlci0tO1xuXG5cdFx0XHRpZiggWVRQbGF5ZXIudmlkZW9Db3VudGVyIDwgMCApXG5cdFx0XHRcdFlUUGxheWVyLnZpZGVvQ291bnRlciA9IFlUUGxheWVyLnZpZGVvTGVuZ3RoIC0gMTtcblxuXHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUENoYW5nZU1vdmllKCBZVFBsYXllci52aWRlb3NbIFlUUGxheWVyLnZpZGVvQ291bnRlciBdICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0cGxheUluZGV4OiBmdW5jdGlvbiggaWR4ICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblxuXHRcdFx0aWR4ID0gaWR4IC0gMTtcblxuXHRcdFx0aWYoIFlUUGxheWVyLmNoZWNrRm9yU3RhcnRBdCApIHtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuY2hlY2tGb3JTdGFydEF0ICk7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmdldFN0YXRlICk7XG5cdFx0XHR9XG5cblx0XHRcdFlUUGxheWVyLnZpZGVvQ291bnRlciA9IGlkeDtcblx0XHRcdGlmKCBZVFBsYXllci52aWRlb0NvdW50ZXIgPj0gWVRQbGF5ZXIudmlkZW9MZW5ndGggLSAxIClcblx0XHRcdFx0WVRQbGF5ZXIudmlkZW9Db3VudGVyID0gWVRQbGF5ZXIudmlkZW9MZW5ndGggLSAxO1xuXHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUENoYW5nZU1vdmllKCBZVFBsYXllci52aWRlb3NbIFlUUGxheWVyLnZpZGVvQ291bnRlciBdICk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9wdFxuXHRcdCAqL1xuXHRcdGNoYW5nZU1vdmllOiBmdW5jdGlvbiggb3B0ICkge1xuXG5cdFx0XHR2YXIgJFlUUGxheWVyID0gdGhpcztcblx0XHRcdHZhciBZVFBsYXllciA9ICRZVFBsYXllci5nZXQoIDAgKTtcblx0XHRcdFlUUGxheWVyLm9wdC5zdGFydEF0ID0gMDtcblx0XHRcdFlUUGxheWVyLm9wdC5zdG9wQXQgPSAwO1xuXHRcdFx0WVRQbGF5ZXIub3B0Lm1hc2sgPSBmYWxzZTtcblx0XHRcdFlUUGxheWVyLm9wdC5tdXRlID0gdHJ1ZTtcblx0XHRcdFlUUGxheWVyLmhhc0RhdGEgPSBmYWxzZTtcblx0XHRcdFlUUGxheWVyLmhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0WVRQbGF5ZXIucGxheWVyLmxvb3BUaW1lID0gdW5kZWZpbmVkO1xuXG5cdFx0XHRpZiggb3B0IClcblx0XHRcdFx0alF1ZXJ5LmV4dGVuZCggWVRQbGF5ZXIub3B0LCBvcHQgKTsgLy9ZVFBsYXllci5kZWZhdWx0T3B0LFxuXHRcdFx0WVRQbGF5ZXIudmlkZW9JRCA9IGdldFlUUFZpZGVvSUQoIFlUUGxheWVyLm9wdC52aWRlb1VSTCApLnZpZGVvSUQ7XG5cblx0XHRcdGlmKCBZVFBsYXllci5vcHQubG9vcCA9PSBcInRydWVcIiApXG5cdFx0XHRcdFlUUGxheWVyLm9wdC5sb29wID0gOTk5OTtcblxuXHRcdFx0alF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0b3BhY2l0eTogMFxuXHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSwgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIFlUUENoYW5nZU1vdmllID0galF1ZXJ5LkV2ZW50KCBcIllUUENoYW5nZU1vdmllXCIgKTtcblx0XHRcdFx0WVRQQ2hhbmdlTW92aWUudGltZSA9IFlUUGxheWVyLmN1cnJlbnRUaW1lO1xuXHRcdFx0XHRZVFBDaGFuZ2VNb3ZpZS52aWRlb0lkID0gWVRQbGF5ZXIudmlkZW9JRDtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUENoYW5nZU1vdmllICk7XG5cblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUEdldFBsYXllcigpLmN1ZVZpZGVvQnlVcmwoIGVuY29kZVVSSSggalF1ZXJ5Lm1iWVRQbGF5ZXIubG9jYXRpb25Qcm90b2NvbCArIFwiLy93d3cueW91dHViZS5jb20vdi9cIiArIFlUUGxheWVyLnZpZGVvSUQgKSwgMSwgWVRQbGF5ZXIub3B0LnF1YWxpdHkgKTtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLm9wdGltaXplRGlzcGxheSgpO1xuXG5cdFx0XHRcdGpRdWVyeS5tYllUUGxheWVyLmNoZWNrRm9yU3RhdGUoIFlUUGxheWVyICk7XG5cdFx0XHRcdGpRdWVyeS5tYllUUGxheWVyLmdldERhdGFGcm9tQVBJKCBZVFBsYXllciApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHRcdGpRdWVyeS5tYllUUGxheWVyLmFwcGx5TWFzayggWVRQbGF5ZXIgKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3BsYXllcn1cblx0XHQgKi9cblx0XHRnZXRQbGF5ZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGpRdWVyeSggdGhpcyApLmdldCggMCApLnBsYXllcjtcblx0XHR9LFxuXG5cdFx0cGxheWVyRGVzdHJveTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0eXRwLllUQVBJUmVhZHkgPSB0cnVlO1xuXHRcdFx0eXRwLmJhY2tncm91bmRJc0luaXRlZCA9IGZhbHNlO1xuXHRcdFx0WVRQbGF5ZXIuaXNJbml0ID0gZmFsc2U7XG5cdFx0XHRZVFBsYXllci52aWRlb0lEID0gbnVsbDtcblx0XHRcdFlUUGxheWVyLmlzUmVhZHkgPSBmYWxzZTtcblx0XHRcdHZhciBwbGF5ZXJCb3ggPSBZVFBsYXllci53cmFwcGVyO1xuXHRcdFx0cGxheWVyQm94LnJlbW92ZSgpO1xuXHRcdFx0alF1ZXJ5KCBcIiNjb250cm9sQmFyX1wiICsgWVRQbGF5ZXIuaWQgKS5yZW1vdmUoKTtcblx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmNoZWNrRm9yU3RhcnRBdCApO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuZ2V0U3RhdGUgKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZWFsXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdGZ1bGxzY3JlZW46IGZ1bmN0aW9uKCByZWFsICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCB0eXBlb2YgcmVhbCA9PSBcInVuZGVmaW5lZFwiICkgcmVhbCA9IFlUUGxheWVyLm9wdC5yZWFsZnVsbHNjcmVlbjtcblx0XHRcdHJlYWwgPSBldmFsKCByZWFsICk7XG5cdFx0XHR2YXIgY29udHJvbHMgPSBqUXVlcnkoIFwiI2NvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApO1xuXHRcdFx0dmFyIGZ1bGxTY3JlZW5CdG4gPSBjb250cm9scy5maW5kKCBcIi5tYl9Pbmx5WVRcIiApO1xuXHRcdFx0dmFyIHZpZGVvV3JhcHBlciA9IFlUUGxheWVyLmlzU2VsZiA/IFlUUGxheWVyLm9wdC5jb250YWlubWVudCA6IFlUUGxheWVyLndyYXBwZXI7XG5cdFx0XHQvL3ZhciB2aWRlb1dyYXBwZXIgPSBZVFBsYXllci53cmFwcGVyO1xuXHRcdFx0aWYoIHJlYWwgKSB7XG5cdFx0XHRcdHZhciBmdWxsc2NyZWVuY2hhbmdlID0galF1ZXJ5Lm1iQnJvd3Nlci5tb3ppbGxhID8gXCJtb3pmdWxsc2NyZWVuY2hhbmdlXCIgOiBqUXVlcnkubWJCcm93c2VyLndlYmtpdCA/IFwid2Via2l0ZnVsbHNjcmVlbmNoYW5nZVwiIDogXCJmdWxsc2NyZWVuY2hhbmdlXCI7XG5cdFx0XHRcdGpRdWVyeSggZG9jdW1lbnQgKS5vZmYoIGZ1bGxzY3JlZW5jaGFuZ2UgKS5vbiggZnVsbHNjcmVlbmNoYW5nZSwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dmFyIGlzRnVsbFNjcmVlbiA9IFJ1blByZWZpeE1ldGhvZCggZG9jdW1lbnQsIFwiSXNGdWxsU2NyZWVuXCIgKSB8fCBSdW5QcmVmaXhNZXRob2QoIGRvY3VtZW50LCBcIkZ1bGxTY3JlZW5cIiApO1xuXHRcdFx0XHRcdGlmKCAhaXNGdWxsU2NyZWVuICkge1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIuaXNBbG9uZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0ZnVsbFNjcmVlbkJ0bi5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy5vbmx5WVQgKTtcblx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBTZXRWaWRlb1F1YWxpdHkoIFlUUGxheWVyLm9wdC5xdWFsaXR5ICk7XG5cdFx0XHRcdFx0XHR2aWRlb1dyYXBwZXIucmVtb3ZlQ2xhc3MoIFwiWVRQRnVsbHNjcmVlblwiICk7XG5cdFx0XHRcdFx0XHR2aWRlb1dyYXBwZXIuQ1NTQW5pbWF0ZSgge1xuXHRcdFx0XHRcdFx0XHRvcGFjaXR5OiBZVFBsYXllci5vcHQub3BhY2l0eVxuXHRcdFx0XHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSApO1xuXHRcdFx0XHRcdFx0dmlkZW9XcmFwcGVyLmNzcygge1xuXHRcdFx0XHRcdFx0XHR6SW5kZXg6IDBcblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5pc0JhY2tncm91bmQgKSB7XG5cdFx0XHRcdFx0XHRcdGpRdWVyeSggXCJib2R5XCIgKS5hZnRlciggY29udHJvbHMgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFlUUGxheWVyLndyYXBwZXIuYmVmb3JlKCBjb250cm9scyApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0alF1ZXJ5KCB3aW5kb3cgKS5yZXNpemUoKTtcblx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBcIllUUEZ1bGxTY3JlZW5FbmRcIiApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQU2V0VmlkZW9RdWFsaXR5KCBcImRlZmF1bHRcIiApO1xuXHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFwiWVRQRnVsbFNjcmVlblN0YXJ0XCIgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gKTtcblx0XHRcdH1cblx0XHRcdGlmKCAhWVRQbGF5ZXIuaXNBbG9uZSApIHtcblx0XHRcdFx0ZnVuY3Rpb24gaGlkZU1vdXNlKCkge1xuXHRcdFx0XHRcdFlUUGxheWVyLm92ZXJsYXkuY3NzKCB7XG5cdFx0XHRcdFx0XHRjdXJzb3I6IFwibm9uZVwiXG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9uKCBcIm1vdXNlbW92ZS5ZVFBsYXllclwiLCBmdW5jdGlvbiggZSApIHtcblx0XHRcdFx0XHRZVFBsYXllci5vdmVybGF5LmNzcygge1xuXHRcdFx0XHRcdFx0Y3Vyc29yOiBcImF1dG9cIlxuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRjbGVhclRpbWVvdXQoIFlUUGxheWVyLmhpZGVDdXJzb3IgKTtcblx0XHRcdFx0XHRpZiggIWpRdWVyeSggZS50YXJnZXQgKS5wYXJlbnRzKCkuaXMoIFwiLm1iX1lUUEJhclwiICkgKSBZVFBsYXllci5oaWRlQ3Vyc29yID0gc2V0VGltZW91dCggaGlkZU1vdXNlLCAzMDAwICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0aGlkZU1vdXNlKCk7XG5cdFx0XHRcdGlmKCByZWFsICkge1xuXHRcdFx0XHRcdHZpZGVvV3JhcHBlci5jc3MoIHtcblx0XHRcdFx0XHRcdG9wYWNpdHk6IDBcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0dmlkZW9XcmFwcGVyLmFkZENsYXNzKCBcIllUUEZ1bGxzY3JlZW5cIiApO1xuXHRcdFx0XHRcdGxhdW5jaEZ1bGxzY3JlZW4oIHZpZGVvV3JhcHBlci5nZXQoIDAgKSApO1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmlkZW9XcmFwcGVyLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSAqIDIgKTtcblx0XHRcdFx0XHRcdFlUUGxheWVyLndyYXBwZXIuYXBwZW5kKCBjb250cm9scyApO1xuXHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLm9wdGltaXplRGlzcGxheSgpO1xuXHRcdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnNlZWtUbyggWVRQbGF5ZXIucGxheWVyLmdldEN1cnJlbnRUaW1lKCkgKyAuMSwgdHJ1ZSApO1xuXHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUgKTtcblx0XHRcdFx0fSBlbHNlIHZpZGVvV3JhcHBlci5jc3MoIHtcblx0XHRcdFx0XHR6SW5kZXg6IDEwMDAwXG5cdFx0XHRcdH0gKS5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHR9LCBZVFBsYXllci5vcHQuZmFkZU9uU3RhcnRUaW1lICogMiApO1xuXHRcdFx0XHRmdWxsU2NyZWVuQnRuLmh0bWwoIGpRdWVyeS5tYllUUGxheWVyLmNvbnRyb2xzLnNob3dTaXRlICk7XG5cdFx0XHRcdFlUUGxheWVyLmlzQWxvbmUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0alF1ZXJ5KCBkb2N1bWVudCApLm9mZiggXCJtb3VzZW1vdmUuWVRQbGF5ZXJcIiApO1xuXHRcdFx0XHRjbGVhclRpbWVvdXQoIFlUUGxheWVyLmhpZGVDdXJzb3IgKTtcblx0XHRcdFx0WVRQbGF5ZXIub3ZlcmxheS5jc3MoIHtcblx0XHRcdFx0XHRjdXJzb3I6IFwiYXV0b1wiXG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0aWYoIHJlYWwgKSB7XG5cdFx0XHRcdFx0Y2FuY2VsRnVsbHNjcmVlbigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZpZGVvV3JhcHBlci5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0XHRvcGFjaXR5OiBZVFBsYXllci5vcHQub3BhY2l0eVxuXHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUgKTtcblx0XHRcdFx0XHR2aWRlb1dyYXBwZXIuY3NzKCB7XG5cdFx0XHRcdFx0XHR6SW5kZXg6IDBcblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZnVsbFNjcmVlbkJ0bi5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy5vbmx5WVQgKTtcblx0XHRcdFx0WVRQbGF5ZXIuaXNBbG9uZSA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBSdW5QcmVmaXhNZXRob2QoIG9iaiwgbWV0aG9kICkge1xuXHRcdFx0XHR2YXIgcGZ4ID0gWyBcIndlYmtpdFwiLCBcIm1velwiLCBcIm1zXCIsIFwib1wiLCBcIlwiIF07XG5cdFx0XHRcdHZhciBwID0gMCxcblx0XHRcdFx0XHRtLCB0O1xuXHRcdFx0XHR3aGlsZSggcCA8IHBmeC5sZW5ndGggJiYgIW9ialsgbSBdICkge1xuXHRcdFx0XHRcdG0gPSBtZXRob2Q7XG5cdFx0XHRcdFx0aWYoIHBmeFsgcCBdID09IFwiXCIgKSB7XG5cdFx0XHRcdFx0XHRtID0gbS5zdWJzdHIoIDAsIDEgKS50b0xvd2VyQ2FzZSgpICsgbS5zdWJzdHIoIDEgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bSA9IHBmeFsgcCBdICsgbTtcblx0XHRcdFx0XHR0ID0gdHlwZW9mIG9ialsgbSBdO1xuXHRcdFx0XHRcdGlmKCB0ICE9IFwidW5kZWZpbmVkXCIgKSB7XG5cdFx0XHRcdFx0XHRwZnggPSBbIHBmeFsgcCBdIF07XG5cdFx0XHRcdFx0XHRyZXR1cm4oIHQgPT0gXCJmdW5jdGlvblwiID8gb2JqWyBtIF0oKSA6IG9ialsgbSBdICk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHArKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBsYXVuY2hGdWxsc2NyZWVuKCBlbGVtZW50ICkge1xuXHRcdFx0XHRSdW5QcmVmaXhNZXRob2QoIGVsZW1lbnQsIFwiUmVxdWVzdEZ1bGxTY3JlZW5cIiApO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjYW5jZWxGdWxsc2NyZWVuKCkge1xuXHRcdFx0XHRpZiggUnVuUHJlZml4TWV0aG9kKCBkb2N1bWVudCwgXCJGdWxsU2NyZWVuXCIgKSB8fCBSdW5QcmVmaXhNZXRob2QoIGRvY3VtZW50LCBcIklzRnVsbFNjcmVlblwiICkgKSB7XG5cdFx0XHRcdFx0UnVuUHJlZml4TWV0aG9kKCBkb2N1bWVudCwgXCJDYW5jZWxGdWxsU2NyZWVuXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdHRvZ2dsZUxvb3BzOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHR2YXIgZGF0YSA9IFlUUGxheWVyLm9wdDtcblx0XHRcdGlmKCBkYXRhLmxvb3AgPT0gMSApIHtcblx0XHRcdFx0ZGF0YS5sb29wID0gMDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmKCBkYXRhLnN0YXJ0QXQgKSB7XG5cdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnNlZWtUbyggZGF0YS5zdGFydEF0ICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnBsYXlWaWRlbygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRhdGEubG9vcCA9IDE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdHBsYXk6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCAhWVRQbGF5ZXIuaXNSZWFkeSApXG5cdFx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0XHRZVFBsYXllci5wbGF5ZXIucGxheVZpZGVvKCk7XG5cdFx0XHRZVFBsYXllci53cmFwcGVyLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0b3BhY2l0eTogWVRQbGF5ZXIuaXNBbG9uZSA/IDEgOiBZVFBsYXllci5vcHQub3BhY2l0eVxuXHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSAqIDQgKTtcblxuXHRcdFx0alF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSAqIDIgKTtcblxuXHRcdFx0dmFyIGNvbnRyb2xzID0galF1ZXJ5KCBcIiNjb250cm9sQmFyX1wiICsgWVRQbGF5ZXIuaWQgKTtcblx0XHRcdHZhciBwbGF5QnRuID0gY29udHJvbHMuZmluZCggXCIubWJfWVRQUGxheXBhdXNlXCIgKTtcblx0XHRcdHBsYXlCdG4uaHRtbCggalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMucGF1c2UgKTtcblx0XHRcdFlUUGxheWVyLnN0YXRlID0gMTtcblx0XHRcdFlUUGxheWVyLm9yaWdfYmFja2dyb3VuZCA9IGpRdWVyeSggWVRQbGF5ZXIgKS5jc3MoIFwiYmFja2dyb3VuZC1pbWFnZVwiICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gY2FsbGJhY2tcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0dG9nZ2xlUGxheTogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCBZVFBsYXllci5zdGF0ZSA9PSAxIClcblx0XHRcdFx0dGhpcy5ZVFBQYXVzZSgpO1xuXHRcdFx0ZWxzZVxuXHRcdFx0XHR0aGlzLllUUFBsYXkoKTtcblxuXHRcdFx0aWYoIHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIgKVxuXHRcdFx0XHRjYWxsYmFjayggWVRQbGF5ZXIuc3RhdGUgKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtqUXVlcnkubWJZVFBsYXllcn1cblx0XHQgKi9cblx0XHRzdG9wOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHR2YXIgY29udHJvbHMgPSBqUXVlcnkoIFwiI2NvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApO1xuXHRcdFx0dmFyIHBsYXlCdG4gPSBjb250cm9scy5maW5kKCBcIi5tYl9ZVFBQbGF5cGF1c2VcIiApO1xuXHRcdFx0cGxheUJ0bi5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy5wbGF5ICk7XG5cdFx0XHRZVFBsYXllci5wbGF5ZXIuc3RvcFZpZGVvKCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdHBhdXNlOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHRZVFBsYXllci5wbGF5ZXIucGF1c2VWaWRlbygpO1xuXHRcdFx0WVRQbGF5ZXIuc3RhdGUgPSAyO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB2YWxcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0c2Vla1RvOiBmdW5jdGlvbiggdmFsICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdFlUUGxheWVyLnBsYXllci5zZWVrVG8oIHZhbCwgdHJ1ZSApO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB2YWxcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0c2V0Vm9sdW1lOiBmdW5jdGlvbiggdmFsICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCAhdmFsICYmICFZVFBsYXllci5vcHQudm9sICYmIFlUUGxheWVyLnBsYXllci5nZXRWb2x1bWUoKSA9PSAwICkgalF1ZXJ5KCBZVFBsYXllciApLllUUFVubXV0ZSgpO1xuXHRcdFx0ZWxzZSBpZiggKCAhdmFsICYmIFlUUGxheWVyLnBsYXllci5nZXRWb2x1bWUoKSA+IDAgKSB8fCAoIHZhbCAmJiBZVFBsYXllci5vcHQudm9sID09IHZhbCApICkge1xuXHRcdFx0XHRpZiggIVlUUGxheWVyLmlzTXV0ZSApIGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBNdXRlKCk7XG5cdFx0XHRcdGVsc2UgalF1ZXJ5KCBZVFBsYXllciApLllUUFVubXV0ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0WVRQbGF5ZXIub3B0LnZvbCA9IHZhbDtcblx0XHRcdFx0WVRQbGF5ZXIucGxheWVyLnNldFZvbHVtZSggWVRQbGF5ZXIub3B0LnZvbCApO1xuXHRcdFx0XHRpZiggWVRQbGF5ZXIudm9sdW1lQmFyICYmIFlUUGxheWVyLnZvbHVtZUJhci5sZW5ndGggKSBZVFBsYXllci52b2x1bWVCYXIudXBkYXRlU2xpZGVyVmFsKCB2YWwgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0b2dnbGVWb2x1bWU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCAhWVRQbGF5ZXIgKSByZXR1cm47XG5cdFx0XHRpZiggWVRQbGF5ZXIucGxheWVyLmlzTXV0ZWQoKSApIHtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUFVubXV0ZSgpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBNdXRlKCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdG11dGU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdGlmKCBZVFBsYXllci5pc011dGUgKSByZXR1cm47XG5cdFx0XHRZVFBsYXllci5wbGF5ZXIubXV0ZSgpO1xuXHRcdFx0WVRQbGF5ZXIuaXNNdXRlID0gdHJ1ZTtcblx0XHRcdFlUUGxheWVyLnBsYXllci5zZXRWb2x1bWUoIDAgKTtcblx0XHRcdGlmKCBZVFBsYXllci52b2x1bWVCYXIgJiYgWVRQbGF5ZXIudm9sdW1lQmFyLmxlbmd0aCAmJiBZVFBsYXllci52b2x1bWVCYXIud2lkdGgoKSA+IDEwICkge1xuXHRcdFx0XHRZVFBsYXllci52b2x1bWVCYXIudXBkYXRlU2xpZGVyVmFsKCAwICk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgY29udHJvbHMgPSBqUXVlcnkoIFwiI2NvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApO1xuXHRcdFx0dmFyIG11dGVCdG4gPSBjb250cm9scy5maW5kKCBcIi5tYl9ZVFBNdXRlVW5tdXRlXCIgKTtcblx0XHRcdG11dGVCdG4uaHRtbCggalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMudW5tdXRlICk7XG5cdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuYWRkQ2xhc3MoIFwiaXNNdXRlZFwiICk7XG5cdFx0XHRpZiggWVRQbGF5ZXIudm9sdW1lQmFyICYmIFlUUGxheWVyLnZvbHVtZUJhci5sZW5ndGggKSBZVFBsYXllci52b2x1bWVCYXIuYWRkQ2xhc3MoIFwibXV0ZWRcIiApO1xuXHRcdFx0dmFyIFlUUEV2ZW50ID0galF1ZXJ5LkV2ZW50KCBcIllUUE11dGVkXCIgKTtcblx0XHRcdFlUUEV2ZW50LnRpbWUgPSBZVFBsYXllci5jdXJyZW50VGltZTtcblx0XHRcdGlmKCBZVFBsYXllci5jYW5UcmlnZ2VyICkgalF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUEV2ZW50ICk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdHVubXV0ZTogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0aWYoICFZVFBsYXllci5pc011dGUgKSByZXR1cm47XG5cdFx0XHRZVFBsYXllci5wbGF5ZXIudW5NdXRlKCk7XG5cdFx0XHRZVFBsYXllci5pc011dGUgPSBmYWxzZTtcblx0XHRcdFlUUGxheWVyLnBsYXllci5zZXRWb2x1bWUoIFlUUGxheWVyLm9wdC52b2wgKTtcblx0XHRcdGlmKCBZVFBsYXllci52b2x1bWVCYXIgJiYgWVRQbGF5ZXIudm9sdW1lQmFyLmxlbmd0aCApIFlUUGxheWVyLnZvbHVtZUJhci51cGRhdGVTbGlkZXJWYWwoIFlUUGxheWVyLm9wdC52b2wgPiAxMCA/IFlUUGxheWVyLm9wdC52b2wgOiAxMCApO1xuXHRcdFx0dmFyIGNvbnRyb2xzID0galF1ZXJ5KCBcIiNjb250cm9sQmFyX1wiICsgWVRQbGF5ZXIuaWQgKTtcblx0XHRcdHZhciBtdXRlQnRuID0gY29udHJvbHMuZmluZCggXCIubWJfWVRQTXV0ZVVubXV0ZVwiICk7XG5cdFx0XHRtdXRlQnRuLmh0bWwoIGpRdWVyeS5tYllUUGxheWVyLmNvbnRyb2xzLm11dGUgKTtcblx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5yZW1vdmVDbGFzcyggXCJpc011dGVkXCIgKTtcblx0XHRcdGlmKCBZVFBsYXllci52b2x1bWVCYXIgJiYgWVRQbGF5ZXIudm9sdW1lQmFyLmxlbmd0aCApIFlUUGxheWVyLnZvbHVtZUJhci5yZW1vdmVDbGFzcyggXCJtdXRlZFwiICk7XG5cdFx0XHR2YXIgWVRQRXZlbnQgPSBqUXVlcnkuRXZlbnQoIFwiWVRQVW5tdXRlZFwiICk7XG5cdFx0XHRZVFBFdmVudC50aW1lID0gWVRQbGF5ZXIuY3VycmVudFRpbWU7XG5cdFx0XHRpZiggWVRQbGF5ZXIuY2FuVHJpZ2dlciApIGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBZVFBFdmVudCApO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBGSUxURVJTXG5cdFx0ICpcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBmaWx0ZXJcblx0XHQgKiBAcGFyYW0gdmFsdWVcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0YXBwbHlGaWx0ZXI6IGZ1bmN0aW9uKCBmaWx0ZXIsIHZhbHVlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBZVFBsYXllciA9IHRoaXM7XG5cdFx0XHRcdFlUUGxheWVyLmZpbHRlcnNbIGZpbHRlciBdLnZhbHVlID0gdmFsdWU7XG5cdFx0XHRcdGlmKCBZVFBsYXllci5maWx0ZXJzRW5hYmxlZCApXG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUEVuYWJsZUZpbHRlcnMoKTtcblx0XHRcdH0gKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGZpbHRlcnNcblx0XHQgKiBAcmV0dXJucyB7alF1ZXJ5Lm1iWVRQbGF5ZXJ9XG5cdFx0ICovXG5cdFx0YXBwbHlGaWx0ZXJzOiBmdW5jdGlvbiggZmlsdGVycyApIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzO1xuXHRcdFx0XHRpZiggIVlUUGxheWVyLmlzUmVhZHkgKSB7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLm9uKCBcIllUUFJlYWR5XCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUEFwcGx5RmlsdGVycyggZmlsdGVycyApO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IoIHZhciBrZXkgaW4gZmlsdGVycyApXG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUEFwcGx5RmlsdGVyKCBrZXksIGZpbHRlcnNbIGtleSBdICk7XG5cblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFwiWVRQRmlsdGVyc0FwcGxpZWRcIiApO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZmlsdGVyXG5cdFx0ICogQHBhcmFtIHZhbHVlXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0dG9nZ2xlRmlsdGVyOiBmdW5jdGlvbiggZmlsdGVyLCB2YWx1ZSApIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzO1xuXHRcdFx0XHRpZiggIVlUUGxheWVyLmZpbHRlcnNbIGZpbHRlciBdLnZhbHVlICkgWVRQbGF5ZXIuZmlsdGVyc1sgZmlsdGVyIF0udmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0ZWxzZSBZVFBsYXllci5maWx0ZXJzWyBmaWx0ZXIgXS52YWx1ZSA9IDA7XG5cdFx0XHRcdGlmKCBZVFBsYXllci5maWx0ZXJzRW5hYmxlZCApIGpRdWVyeSggdGhpcyApLllUUEVuYWJsZUZpbHRlcnMoKTtcblx0XHRcdH0gKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGNhbGxiYWNrXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0dG9nZ2xlRmlsdGVyczogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBZVFBsYXllciA9IHRoaXM7XG5cdFx0XHRcdGlmKCBZVFBsYXllci5maWx0ZXJzRW5hYmxlZCApIHtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkudHJpZ2dlciggXCJZVFBEaXNhYmxlRmlsdGVyc1wiICk7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUERpc2FibGVGaWx0ZXJzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUEVuYWJsZUZpbHRlcnMoKTtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkudHJpZ2dlciggXCJZVFBFbmFibGVGaWx0ZXJzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiggdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiApXG5cdFx0XHRcdFx0Y2FsbGJhY2soIFlUUGxheWVyLmZpbHRlcnNFbmFibGVkICk7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHsqfVxuXHRcdCAqL1xuXHRcdGRpc2FibGVGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzO1xuXHRcdFx0XHR2YXIgaWZyYW1lID0galF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApO1xuXHRcdFx0XHRpZnJhbWUuY3NzKCBcIi13ZWJraXQtZmlsdGVyXCIsIFwiXCIgKTtcblx0XHRcdFx0aWZyYW1lLmNzcyggXCJmaWx0ZXJcIiwgXCJcIiApO1xuXHRcdFx0XHRZVFBsYXllci5maWx0ZXJzRW5hYmxlZCA9IGZhbHNlO1xuXHRcdFx0fSApO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKi9cblx0XHRlbmFibGVGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzO1xuXHRcdFx0XHR2YXIgaWZyYW1lID0galF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApO1xuXHRcdFx0XHR2YXIgZmlsdGVyU3R5bGUgPSBcIlwiO1xuXHRcdFx0XHRmb3IoIHZhciBrZXkgaW4gWVRQbGF5ZXIuZmlsdGVycyApIHtcblx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuZmlsdGVyc1sga2V5IF0udmFsdWUgKVxuXHRcdFx0XHRcdFx0ZmlsdGVyU3R5bGUgKz0ga2V5LnJlcGxhY2UoIFwiX1wiLCBcIi1cIiApICsgXCIoXCIgKyBZVFBsYXllci5maWx0ZXJzWyBrZXkgXS52YWx1ZSArIFlUUGxheWVyLmZpbHRlcnNbIGtleSBdLnVuaXQgKyBcIikgXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWZyYW1lLmNzcyggXCItd2Via2l0LWZpbHRlclwiLCBmaWx0ZXJTdHlsZSApO1xuXHRcdFx0XHRpZnJhbWUuY3NzKCBcImZpbHRlclwiLCBmaWx0ZXJTdHlsZSApO1xuXHRcdFx0XHRZVFBsYXllci5maWx0ZXJzRW5hYmxlZCA9IHRydWU7XG5cdFx0XHR9ICk7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBmaWx0ZXJcblx0XHQgKiBAcGFyYW0gY2FsbGJhY2tcblx0XHQgKiBAcmV0dXJucyB7Kn1cblx0XHQgKi9cblx0XHRyZW1vdmVGaWx0ZXI6IGZ1bmN0aW9uKCBmaWx0ZXIsIGNhbGxiYWNrICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBZVFBsYXllciA9IHRoaXM7XG5cdFx0XHRcdGlmKCB0eXBlb2YgZmlsdGVyID09IFwiZnVuY3Rpb25cIiApIHtcblx0XHRcdFx0XHRjYWxsYmFjayA9IGZpbHRlcjtcblx0XHRcdFx0XHRmaWx0ZXIgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCAhZmlsdGVyIClcblx0XHRcdFx0XHRmb3IoIHZhciBrZXkgaW4gWVRQbGF5ZXIuZmlsdGVycyApIHtcblx0XHRcdFx0XHRcdGpRdWVyeSggdGhpcyApLllUUEFwcGx5RmlsdGVyKCBrZXksIDAgKTtcblx0XHRcdFx0XHRcdGlmKCB0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiICkgY2FsbGJhY2soIGtleSApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkoIHRoaXMgKS5ZVFBBcHBseUZpbHRlciggZmlsdGVyLCAwICk7XG5cdFx0XHRcdFx0XHRpZiggdHlwZW9mIGNhbGxiYWNrID09IFwiZnVuY3Rpb25cIiApIGNhbGxiYWNrKCBmaWx0ZXIgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0Z2V0RmlsdGVyczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0cmV0dXJuIFlUUGxheWVyLmZpbHRlcnM7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBNQVNLXG5cdFx0ICpcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBtYXNrXG5cdFx0ICogQHJldHVybnMge2pRdWVyeS5tYllUUGxheWVyfVxuXHRcdCAqL1xuXHRcdGFkZE1hc2s6IGZ1bmN0aW9uKCBtYXNrICkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdHZhciBvdmVybGF5ID0gWVRQbGF5ZXIub3ZlcmxheTtcblxuXHRcdFx0aWYoICFtYXNrICkge1xuXHRcdFx0XHRtYXNrID0gWVRQbGF5ZXIuYWN0dWFsTWFzaztcblx0XHRcdH1cblxuXHRcdFx0dmFyIHRlbXBJbWcgPSBqUXVlcnkoIFwiPGltZy8+XCIgKS5hdHRyKCBcInNyY1wiLCBtYXNrICkub24oIFwibG9hZFwiLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRvdmVybGF5LkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0XHRvcGFjaXR5OiAwXG5cdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0WVRQbGF5ZXIuaGFzTWFzayA9IHRydWU7XG5cblx0XHRcdFx0XHR0ZW1wSW1nLnJlbW92ZSgpO1xuXG5cdFx0XHRcdFx0b3ZlcmxheS5jc3MoIHtcblx0XHRcdFx0XHRcdGJhY2tncm91bmRJbWFnZTogXCJ1cmwoXCIgKyBtYXNrICsgXCIpXCIsXG5cdFx0XHRcdFx0XHRiYWNrZ3JvdW5kUmVwZWF0OiBcIm5vLXJlcGVhdFwiLFxuXHRcdFx0XHRcdFx0YmFja2dyb3VuZFBvc2l0aW9uOiBcImNlbnRlciBjZW50ZXJcIixcblx0XHRcdFx0XHRcdGJhY2tncm91bmRTaXplOiBcImNvdmVyXCJcblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRvdmVybGF5LkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0XHRcdG9wYWNpdHk6IDFcblx0XHRcdFx0XHR9LCBZVFBsYXllci5vcHQuZmFkZU9uU3RhcnRUaW1lICk7XG5cblx0XHRcdFx0fSApO1xuXG5cdFx0XHR9ICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtqUXVlcnkubWJZVFBsYXllcn1cblx0XHQgKi9cblx0XHRyZW1vdmVNYXNrOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHR2YXIgb3ZlcmxheSA9IFlUUGxheWVyLm92ZXJsYXk7XG5cdFx0XHRvdmVybGF5LkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0b3BhY2l0eTogMFxuXHRcdFx0fSwgWVRQbGF5ZXIub3B0LmZhZGVPblN0YXJ0VGltZSwgZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0WVRQbGF5ZXIuaGFzTWFzayA9IGZhbHNlO1xuXG5cdFx0XHRcdG92ZXJsYXkuY3NzKCB7XG5cdFx0XHRcdFx0YmFja2dyb3VuZEltYWdlOiBcIlwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRSZXBlYXQ6IFwiXCIsXG5cdFx0XHRcdFx0YmFja2dyb3VuZFBvc2l0aW9uOiBcIlwiLFxuXHRcdFx0XHRcdGJhY2tncm91bmRTaXplOiBcIlwiXG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0b3ZlcmxheS5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0b3BhY2l0eTogMVxuXHRcdFx0XHR9LCBZVFBsYXllci5vcHQuZmFkZU9uU3RhcnRUaW1lICk7XG5cblx0XHRcdH0gKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIFlUUGxheWVyXG5cdFx0ICovXG5cdFx0YXBwbHlNYXNrOiBmdW5jdGlvbiggWVRQbGF5ZXIgKSB7XG5cdFx0XHR2YXIgJFlUUGxheWVyID0galF1ZXJ5KCBZVFBsYXllciApO1xuXHRcdFx0JFlUUGxheWVyLm9mZiggXCJZVFBUaW1lLm1hc2tcIiApO1xuXG5cdFx0XHRpZiggWVRQbGF5ZXIub3B0Lm1hc2sgKSB7XG5cblx0XHRcdFx0aWYoIHR5cGVvZiBZVFBsYXllci5vcHQubWFzayA9PSBcInN0cmluZ1wiICkge1xuXHRcdFx0XHRcdCRZVFBsYXllci5ZVFBBZGRNYXNrKCBZVFBsYXllci5vcHQubWFzayApO1xuXG5cdFx0XHRcdFx0WVRQbGF5ZXIuYWN0dWFsTWFzayA9IFlUUGxheWVyLm9wdC5tYXNrO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiggdHlwZW9mIFlUUGxheWVyLm9wdC5tYXNrID09IFwib2JqZWN0XCIgKSB7XG5cblx0XHRcdFx0XHRmb3IoIHZhciB0aW1lIGluIFlUUGxheWVyLm9wdC5tYXNrICkge1xuXHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLm9wdC5tYXNrWyB0aW1lIF0gKVxuXHRcdFx0XHRcdFx0XHR2YXIgaW1nID0galF1ZXJ5KCBcIjxpbWcvPlwiICkuYXR0ciggXCJzcmNcIiwgWVRQbGF5ZXIub3B0Lm1hc2tbIHRpbWUgXSApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKCBZVFBsYXllci5vcHQubWFza1sgMCBdIClcblx0XHRcdFx0XHRcdCRZVFBsYXllci5ZVFBBZGRNYXNrKCBZVFBsYXllci5vcHQubWFza1sgMCBdICk7XG5cblx0XHRcdFx0XHQkWVRQbGF5ZXIub24oIFwiWVRQVGltZS5tYXNrXCIsIGZ1bmN0aW9uKCBlICkge1xuXHRcdFx0XHRcdFx0Zm9yKCB2YXIgdGltZSBpbiBZVFBsYXllci5vcHQubWFzayApIHtcblx0XHRcdFx0XHRcdFx0aWYoIGUudGltZSA9PSB0aW1lIClcblx0XHRcdFx0XHRcdFx0XHRpZiggIVlUUGxheWVyLm9wdC5tYXNrWyB0aW1lIF0gKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQkWVRQbGF5ZXIuWVRQUmVtb3ZlTWFzaygpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdFx0XHRcdCRZVFBsYXllci5ZVFBBZGRNYXNrKCBZVFBsYXllci5vcHQubWFza1sgdGltZSBdICk7XG5cdFx0XHRcdFx0XHRcdFx0XHRZVFBsYXllci5hY3R1YWxNYXNrID0gWVRQbGF5ZXIub3B0Lm1hc2tbIHRpbWUgXTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0fVxuXG5cblx0XHRcdH1cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICovXG5cdFx0dG9nZ2xlTWFzazogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0dmFyICRZVFBsYXllciA9ICQoIFlUUGxheWVyICk7XG5cdFx0XHRpZiggWVRQbGF5ZXIuaGFzTWFzayApXG5cdFx0XHRcdCRZVFBsYXllci5ZVFBSZW1vdmVNYXNrKCk7XG5cdFx0XHRlbHNlXG5cdFx0XHRcdCRZVFBsYXllci5ZVFBBZGRNYXNrKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7e3RvdGFsVGltZTogbnVtYmVyLCBjdXJyZW50VGltZTogbnVtYmVyfX1cblx0XHQgKi9cblx0XHRtYW5hZ2VQcm9ncmVzczogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdFx0dmFyIGNvbnRyb2xzID0galF1ZXJ5KCBcIiNjb250cm9sQmFyX1wiICsgWVRQbGF5ZXIuaWQgKTtcblx0XHRcdHZhciBwcm9ncmVzc0JhciA9IGNvbnRyb2xzLmZpbmQoIFwiLm1iX1lUUFByb2dyZXNzXCIgKTtcblx0XHRcdHZhciBsb2FkZWRCYXIgPSBjb250cm9scy5maW5kKCBcIi5tYl9ZVFBMb2FkZWRcIiApO1xuXHRcdFx0dmFyIHRpbWVCYXIgPSBjb250cm9scy5maW5kKCBcIi5tYl9ZVFBzZWVrYmFyXCIgKTtcblx0XHRcdHZhciB0b3RXID0gcHJvZ3Jlc3NCYXIub3V0ZXJXaWR0aCgpO1xuXHRcdFx0dmFyIGN1cnJlbnRUaW1lID0gTWF0aC5mbG9vciggWVRQbGF5ZXIucGxheWVyLmdldEN1cnJlbnRUaW1lKCkgKTtcblx0XHRcdHZhciB0b3RhbFRpbWUgPSBNYXRoLmZsb29yKCBZVFBsYXllci5wbGF5ZXIuZ2V0RHVyYXRpb24oKSApO1xuXHRcdFx0dmFyIHRpbWVXID0gKCBjdXJyZW50VGltZSAqIHRvdFcgKSAvIHRvdGFsVGltZTtcblx0XHRcdHZhciBzdGFydExlZnQgPSAwO1xuXHRcdFx0dmFyIGxvYWRlZFcgPSBZVFBsYXllci5wbGF5ZXIuZ2V0VmlkZW9Mb2FkZWRGcmFjdGlvbigpICogMTAwO1xuXHRcdFx0bG9hZGVkQmFyLmNzcygge1xuXHRcdFx0XHRsZWZ0OiBzdGFydExlZnQsXG5cdFx0XHRcdHdpZHRoOiBsb2FkZWRXICsgXCIlXCJcblx0XHRcdH0gKTtcblx0XHRcdHRpbWVCYXIuY3NzKCB7XG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdHdpZHRoOiB0aW1lV1xuXHRcdFx0fSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dG90YWxUaW1lOiB0b3RhbFRpbWUsXG5cdFx0XHRcdGN1cnJlbnRUaW1lOiBjdXJyZW50VGltZVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIFlUUGxheWVyXG5cdFx0ICovXG5cdFx0YnVpbGRDb250cm9sczogZnVuY3Rpb24oIFlUUGxheWVyICkge1xuXHRcdFx0dmFyIGRhdGEgPSBZVFBsYXllci5vcHQ7XG5cdFx0XHQvLyBAZGF0YS5wcmludFVybDogaXMgZGVwcmVjYXRlZDsgdXNlIGRhdGEuc2hvd1lUTG9nb1xuXHRcdFx0ZGF0YS5zaG93WVRMb2dvID0gZGF0YS5zaG93WVRMb2dvIHx8IGRhdGEucHJpbnRVcmw7XG5cblx0XHRcdGlmKCBqUXVlcnkoIFwiI2NvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApLmxlbmd0aCApXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIgPSBqUXVlcnkoIFwiPHNwYW4vPlwiICkuYXR0ciggXCJpZFwiLCBcImNvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApLmFkZENsYXNzKCBcIm1iX1lUUEJhclwiICkuY3NzKCB7XG5cdFx0XHRcdHdoaXRlU3BhY2U6IFwibm9XcmFwXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiBZVFBsYXllci5pc0JhY2tncm91bmQgPyBcImZpeGVkXCIgOiBcImFic29sdXRlXCIsXG5cdFx0XHRcdHpJbmRleDogWVRQbGF5ZXIuaXNCYWNrZ3JvdW5kID8gMTAwMDAgOiAxMDAwXG5cdFx0XHR9ICkuaGlkZSgpO1xuXHRcdFx0dmFyIGJ1dHRvbkJhciA9IGpRdWVyeSggXCI8ZGl2Lz5cIiApLmFkZENsYXNzKCBcImJ1dHRvbkJhclwiICk7XG5cdFx0XHQvKiBwbGF5L3BhdXNlIGJ1dHRvbiovXG5cdFx0XHR2YXIgcGxheXBhdXNlID0galF1ZXJ5KCBcIjxzcGFuPlwiICsgalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMucGxheSArIFwiPC9zcGFuPlwiICkuYWRkQ2xhc3MoIFwibWJfWVRQUGxheXBhdXNlIHl0cGljb25cIiApLmNsaWNrKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYoIFlUUGxheWVyLnBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09IDEgKSBqUXVlcnkoIFlUUGxheWVyICkuWVRQUGF1c2UoKTtcblx0XHRcdFx0ZWxzZSBqUXVlcnkoIFlUUGxheWVyICkuWVRQUGxheSgpO1xuXHRcdFx0fSApO1xuXHRcdFx0LyogbXV0ZS91bm11dGUgYnV0dG9uKi9cblx0XHRcdHZhciBNdXRlVW5tdXRlID0galF1ZXJ5KCBcIjxzcGFuPlwiICsgalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMubXV0ZSArIFwiPC9zcGFuPlwiICkuYWRkQ2xhc3MoIFwibWJfWVRQTXV0ZVVubXV0ZSB5dHBpY29uXCIgKS5jbGljayggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmKCBZVFBsYXllci5wbGF5ZXIuZ2V0Vm9sdW1lKCkgPT0gMCApIHtcblx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQVW5tdXRlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUE11dGUoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdFx0Lyogdm9sdW1lIGJhciovXG5cdFx0XHR2YXIgdm9sdW1lQmFyID0galF1ZXJ5KCBcIjxkaXYvPlwiICkuYWRkQ2xhc3MoIFwibWJfWVRQVm9sdW1lQmFyXCIgKS5jc3MoIHtcblx0XHRcdFx0ZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIlxuXHRcdFx0fSApO1xuXHRcdFx0WVRQbGF5ZXIudm9sdW1lQmFyID0gdm9sdW1lQmFyO1xuXHRcdFx0LyogdGltZSBlbGFwc2VkICovXG5cdFx0XHR2YXIgaWR4ID0galF1ZXJ5KCBcIjxzcGFuLz5cIiApLmFkZENsYXNzKCBcIm1iX1lUUFRpbWVcIiApO1xuXHRcdFx0dmFyIHZVUkwgPSBkYXRhLnZpZGVvVVJMID8gZGF0YS52aWRlb1VSTCA6IFwiXCI7XG5cdFx0XHRpZiggdlVSTC5pbmRleE9mKCBcImh0dHBcIiApIDwgMCApIHZVUkwgPSBqUXVlcnkubWJZVFBsYXllci5sb2NhdGlvblByb3RvY29sICsgXCIvL3d3dy55b3V0dWJlLmNvbS93YXRjaD92PVwiICsgZGF0YS52aWRlb1VSTDtcblx0XHRcdHZhciBtb3ZpZVVybCA9IGpRdWVyeSggXCI8c3Bhbi8+XCIgKS5odG1sKCBqUXVlcnkubWJZVFBsYXllci5jb250cm9scy55dExvZ28gKS5hZGRDbGFzcyggXCJtYl9ZVFBVcmwgeXRwaWNvblwiICkuYXR0ciggXCJ0aXRsZVwiLCBcInZpZXcgb24gWW91VHViZVwiICkub24oIFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHdpbmRvdy5vcGVuKCB2VVJMLCBcInZpZXdPbllUXCIgKTtcblx0XHRcdH0gKTtcblx0XHRcdHZhciBvbmx5VmlkZW8gPSBqUXVlcnkoIFwiPHNwYW4vPlwiICkuaHRtbCggalF1ZXJ5Lm1iWVRQbGF5ZXIuY29udHJvbHMub25seVlUICkuYWRkQ2xhc3MoIFwibWJfT25seVlUIHl0cGljb25cIiApLm9uKCBcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQRnVsbHNjcmVlbiggZGF0YS5yZWFsZnVsbHNjcmVlbiApO1xuXHRcdFx0fSApO1xuXHRcdFx0dmFyIHByb2dyZXNzQmFyID0galF1ZXJ5KCBcIjxkaXYvPlwiICkuYWRkQ2xhc3MoIFwibWJfWVRQUHJvZ3Jlc3NcIiApLmNzcyggXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIgKS5jbGljayggZnVuY3Rpb24oIGUgKSB7XG5cdFx0XHRcdHRpbWVCYXIuY3NzKCB7XG5cdFx0XHRcdFx0d2lkdGg6ICggZS5jbGllbnRYIC0gdGltZUJhci5vZmZzZXQoKS5sZWZ0IClcblx0XHRcdFx0fSApO1xuXHRcdFx0XHRZVFBsYXllci50aW1lVyA9IGUuY2xpZW50WCAtIHRpbWVCYXIub2Zmc2V0KCkubGVmdDtcblx0XHRcdFx0WVRQbGF5ZXIuY29udHJvbEJhci5maW5kKCBcIi5tYl9ZVFBMb2FkZWRcIiApLmNzcygge1xuXHRcdFx0XHRcdHdpZHRoOiAwXG5cdFx0XHRcdH0gKTtcblx0XHRcdFx0dmFyIHRvdGFsVGltZSA9IE1hdGguZmxvb3IoIFlUUGxheWVyLnBsYXllci5nZXREdXJhdGlvbigpICk7XG4gICAgICAgICAgICAgICAgdmFyIGdvdG8gPSAoIHRpbWVCYXIub3V0ZXJXaWR0aCgpICogdG90YWxUaW1lICkgLyBwcm9ncmVzc0Jhci5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICAgICAgWVRQbGF5ZXIucGxheWVyLnNlZWtUbyggcGFyc2VGbG9hdCggZ290byApLCB0cnVlICk7XG4gICAgICAgICAgICAgICAgWVRQbGF5ZXIuY29udHJvbEJhci5maW5kKCBcIi5tYl9ZVFBMb2FkZWRcIiApLmNzcygge1xuXHRcdFx0XHRcdHdpZHRoOiAwXG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gKTtcblx0XHRcdHZhciBsb2FkZWRCYXIgPSBqUXVlcnkoIFwiPGRpdi8+XCIgKS5hZGRDbGFzcyggXCJtYl9ZVFBMb2FkZWRcIiApLmNzcyggXCJwb3NpdGlvblwiLCBcImFic29sdXRlXCIgKTtcblx0XHRcdHZhciB0aW1lQmFyID0galF1ZXJ5KCBcIjxkaXYvPlwiICkuYWRkQ2xhc3MoIFwibWJfWVRQc2Vla2JhclwiICkuY3NzKCBcInBvc2l0aW9uXCIsIFwiYWJzb2x1dGVcIiApO1xuXHRcdFx0cHJvZ3Jlc3NCYXIuYXBwZW5kKCBsb2FkZWRCYXIgKS5hcHBlbmQoIHRpbWVCYXIgKTtcblx0XHRcdGJ1dHRvbkJhci5hcHBlbmQoIHBsYXlwYXVzZSApLmFwcGVuZCggTXV0ZVVubXV0ZSApLmFwcGVuZCggdm9sdW1lQmFyICkuYXBwZW5kKCBpZHggKTtcblx0XHRcdGlmKCBkYXRhLnNob3dZVExvZ28gKSB7XG5cdFx0XHRcdGJ1dHRvbkJhci5hcHBlbmQoIG1vdmllVXJsICk7XG5cdFx0XHR9XG5cdFx0XHRpZiggWVRQbGF5ZXIuaXNCYWNrZ3JvdW5kIHx8ICggZXZhbCggWVRQbGF5ZXIub3B0LnJlYWxmdWxsc2NyZWVuICkgJiYgIVlUUGxheWVyLmlzQmFja2dyb3VuZCApICkgYnV0dG9uQmFyLmFwcGVuZCggb25seVZpZGVvICk7XG5cdFx0XHRZVFBsYXllci5jb250cm9sQmFyLmFwcGVuZCggYnV0dG9uQmFyICkuYXBwZW5kKCBwcm9ncmVzc0JhciApO1xuXHRcdFx0aWYoICFZVFBsYXllci5pc0JhY2tncm91bmQgKSB7XG5cdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuYWRkQ2xhc3MoIFwiaW5saW5lUGxheWVyXCIgKTtcblx0XHRcdFx0WVRQbGF5ZXIud3JhcHBlci5iZWZvcmUoIFlUUGxheWVyLmNvbnRyb2xCYXIgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGpRdWVyeSggXCJib2R5XCIgKS5hZnRlciggWVRQbGF5ZXIuY29udHJvbEJhciApO1xuXHRcdFx0fVxuXHRcdFx0dm9sdW1lQmFyLnNpbXBsZVNsaWRlcigge1xuXHRcdFx0XHRpbml0aWFsdmFsOiBZVFBsYXllci5vcHQudm9sLFxuXHRcdFx0XHRzY2FsZTogMTAwLFxuXHRcdFx0XHRvcmllbnRhdGlvbjogXCJoXCIsXG5cdFx0XHRcdGNhbGxiYWNrOiBmdW5jdGlvbiggZWwgKSB7XG5cdFx0XHRcdFx0aWYoIGVsLnZhbHVlID09IDAgKSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQTXV0ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQVW5tdXRlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFlUUGxheWVyLnBsYXllci5zZXRWb2x1bWUoIGVsLnZhbHVlICk7XG5cdFx0XHRcdFx0aWYoICFZVFBsYXllci5pc011dGUgKSBZVFBsYXllci5vcHQudm9sID0gZWwudmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIFlUUGxheWVyXG5cdFx0ICovXG5cdFx0Y2hlY2tGb3JTdGF0ZTogZnVuY3Rpb24oIFlUUGxheWVyICkge1xuXHRcdFx0dmFyIGludGVydmFsID0gWVRQbGF5ZXIub3B0LnNob3dDb250cm9scyA/IDEwMCA6IDQwMDtcblx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmdldFN0YXRlICk7XG5cdFx0XHQvL0NoZWNraW5nIGlmIHBsYXllciBoYXMgYmVlbiByZW1vdmVkIGZyb20gc2NlbmVcblx0XHRcdGlmKCAhalF1ZXJ5LmNvbnRhaW5zKCBkb2N1bWVudCwgWVRQbGF5ZXIgKSApIHtcblx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUFBsYXllckRlc3Ryb3koKTtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuZ2V0U3RhdGUgKTtcblx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuY2hlY2tGb3JTdGFydEF0ICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0alF1ZXJ5Lm1iWVRQbGF5ZXIuY2hlY2tGb3JTdGFydCggWVRQbGF5ZXIgKTtcblxuXHRcdFx0WVRQbGF5ZXIuZ2V0U3RhdGUgPSBzZXRJbnRlcnZhbCggZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0dmFyIHByb2cgPSBqUXVlcnkoIFlUUGxheWVyICkuWVRQTWFuYWdlUHJvZ3Jlc3MoKTtcblx0XHRcdFx0dmFyICRZVFBsYXllciA9IGpRdWVyeSggWVRQbGF5ZXIgKTtcblx0XHRcdFx0dmFyIGRhdGEgPSBZVFBsYXllci5vcHQ7XG5cblx0XHRcdFx0dmFyIHN0YXJ0QXQgPSBZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgPyBZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgOiBZVFBsYXllci5vcHQuc3RhcnRBdCA/IFlUUGxheWVyLm9wdC5zdGFydEF0IDogMTtcblxuXHRcdFx0XHRZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgPSBudWxsO1xuXG5cdFx0XHRcdHZhciBzdG9wQXQgPSBZVFBsYXllci5vcHQuc3RvcEF0ID4gWVRQbGF5ZXIub3B0LnN0YXJ0QXQgPyBZVFBsYXllci5vcHQuc3RvcEF0IDogMDtcblx0XHRcdFx0c3RvcEF0ID0gc3RvcEF0IDwgWVRQbGF5ZXIucGxheWVyLmdldER1cmF0aW9uKCkgPyBzdG9wQXQgOiAwO1xuXHRcdFx0XHRpZiggWVRQbGF5ZXIuY3VycmVudFRpbWUgIT0gcHJvZy5jdXJyZW50VGltZSApIHtcblxuXHRcdFx0XHRcdHZhciBZVFBFdmVudCA9IGpRdWVyeS5FdmVudCggXCJZVFBUaW1lXCIgKTtcblx0XHRcdFx0XHRZVFBFdmVudC50aW1lID0gWVRQbGF5ZXIuY3VycmVudFRpbWU7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUEV2ZW50ICk7XG5cblx0XHRcdFx0fVxuXHRcdFx0XHRZVFBsYXllci5jdXJyZW50VGltZSA9IHByb2cuY3VycmVudFRpbWU7XG5cdFx0XHRcdFlUUGxheWVyLnRvdGFsVGltZSA9IFlUUGxheWVyLnBsYXllci5nZXREdXJhdGlvbigpO1xuXHRcdFx0XHRpZiggWVRQbGF5ZXIucGxheWVyLmdldFZvbHVtZSgpID09IDAgKSAkWVRQbGF5ZXIuYWRkQ2xhc3MoIFwiaXNNdXRlZFwiICk7XG5cdFx0XHRcdGVsc2UgJFlUUGxheWVyLnJlbW92ZUNsYXNzKCBcImlzTXV0ZWRcIiApO1xuXG5cdFx0XHRcdGlmKCBZVFBsYXllci5vcHQuc2hvd0NvbnRyb2xzIClcblx0XHRcdFx0XHRpZiggcHJvZy50b3RhbFRpbWUgKSB7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5jb250cm9sQmFyLmZpbmQoIFwiLm1iX1lUUFRpbWVcIiApLmh0bWwoIGpRdWVyeS5tYllUUGxheWVyLmZvcm1hdFRpbWUoIHByb2cuY3VycmVudFRpbWUgKSArIFwiIC8gXCIgKyBqUXVlcnkubWJZVFBsYXllci5mb3JtYXRUaW1lKCBwcm9nLnRvdGFsVGltZSApICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuZmluZCggXCIubWJfWVRQVGltZVwiICkuaHRtbCggXCItLSA6IC0tIC8gLS0gOiAtLVwiICk7XG5cdFx0XHRcdFx0fVxuXG5cblx0XHRcdFx0aWYoIGV2YWwoIFlUUGxheWVyLm9wdC5zdG9wTW92aWVPbkJsdXIgKSApIHtcblx0XHRcdFx0XHRpZiggIWRvY3VtZW50Lmhhc0ZvY3VzKCkgKSB7XG5cdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuc3RhdGUgPT0gMSApIHtcblx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIuaGFzRm9jdXMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0JFlUUGxheWVyLllUUFBhdXNlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmKCBkb2N1bWVudC5oYXNGb2N1cygpICYmICFZVFBsYXllci5oYXNGb2N1cyAmJiAhKCBZVFBsYXllci5zdGF0ZSA9PSAtMSB8fCBZVFBsYXllci5zdGF0ZSA9PSAwICkgKSB7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5oYXNGb2N1cyA9IHRydWU7XG5cdFx0XHRcdFx0XHQkWVRQbGF5ZXIuWVRQUGxheSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKCBZVFBsYXllci5vcHQucGxheU9ubHlJZlZpc2libGUgKSB7XG5cblx0XHRcdFx0XHR2YXIgaXNPblNjcmVlbiA9IGpRdWVyeS5tYllUUGxheWVyLmlzT25TY3JlZW4oIFlUUGxheWVyICk7XG5cblx0XHRcdFx0XHRpZiggIWlzT25TY3JlZW4gJiYgWVRQbGF5ZXIuc3RhdGUgPT0gMSApIHtcblxuXHRcdFx0XHRcdFx0WVRQbGF5ZXIuaGFzRm9jdXMgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRZVFBsYXllci5ZVFBQYXVzZSgpO1xuXG5cdFx0XHRcdFx0XHRjb25zb2xlLmRlYnVnKCBZVFBsYXllci5pZCwgaXNPblNjcmVlbiApO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5kZWJ1ZyggWVRQbGF5ZXIuc3RhdGUgKTtcblxuXHRcdFx0XHRcdH0gZWxzZSBpZiggIVlUUGxheWVyLmhhc0ZvY3VzICYmICEoIFlUUGxheWVyLnN0YXRlID09IC0xIHx8IFlUUGxheWVyLnN0YXRlID09IDAgKSApIHtcblxuXHRcdFx0XHRcdFx0WVRQbGF5ZXIuaGFzRm9jdXMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0JFlUUGxheWVyLllUUFBsYXkoKTtcblxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0aWYoIFlUUGxheWVyLmNvbnRyb2xCYXIubGVuZ3RoICYmIFlUUGxheWVyLmNvbnRyb2xCYXIub3V0ZXJXaWR0aCgpIDw9IDQwMCAmJiAhWVRQbGF5ZXIuaXNDb21wYWN0ICkge1xuXHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIuYWRkQ2xhc3MoIFwiY29tcGFjdFwiICk7XG5cdFx0XHRcdFx0WVRQbGF5ZXIuaXNDb21wYWN0ID0gdHJ1ZTtcblx0XHRcdFx0XHRpZiggIVlUUGxheWVyLmlzTXV0ZSAmJiBZVFBsYXllci52b2x1bWVCYXIgKSBZVFBsYXllci52b2x1bWVCYXIudXBkYXRlU2xpZGVyVmFsKCBZVFBsYXllci5vcHQudm9sICk7XG5cdFx0XHRcdH0gZWxzZSBpZiggWVRQbGF5ZXIuY29udHJvbEJhci5sZW5ndGggJiYgWVRQbGF5ZXIuY29udHJvbEJhci5vdXRlcldpZHRoKCkgPiA0MDAgJiYgWVRQbGF5ZXIuaXNDb21wYWN0ICkge1xuXHRcdFx0XHRcdFlUUGxheWVyLmNvbnRyb2xCYXIucmVtb3ZlQ2xhc3MoIFwiY29tcGFjdFwiICk7XG5cdFx0XHRcdFx0WVRQbGF5ZXIuaXNDb21wYWN0ID0gZmFsc2U7XG5cdFx0XHRcdFx0aWYoICFZVFBsYXllci5pc011dGUgJiYgWVRQbGF5ZXIudm9sdW1lQmFyICkgWVRQbGF5ZXIudm9sdW1lQmFyLnVwZGF0ZVNsaWRlclZhbCggWVRQbGF5ZXIub3B0LnZvbCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoIFlUUGxheWVyLnBsYXllci5nZXRQbGF5ZXJTdGF0ZSgpID09IDEgJiYgKCBwYXJzZUZsb2F0KCBZVFBsYXllci5wbGF5ZXIuZ2V0RHVyYXRpb24oKSAtIC41ICkgPCBZVFBsYXllci5wbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSB8fCAoIHN0b3BBdCA+IDAgJiYgcGFyc2VGbG9hdCggWVRQbGF5ZXIucGxheWVyLmdldEN1cnJlbnRUaW1lKCkgKSA+IHN0b3BBdCApICkgKSB7XG5cdFx0XHRcdFx0aWYoIFlUUGxheWVyLmlzRW5kZWQgKSByZXR1cm47XG5cdFx0XHRcdFx0WVRQbGF5ZXIuaXNFbmRlZCA9IHRydWU7XG5cdFx0XHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5pc0VuZGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0fSwgMTAwMCApO1xuXG5cdFx0XHRcdFx0aWYoIFlUUGxheWVyLmlzUGxheUxpc3QgKSB7XG5cblx0XHRcdFx0XHRcdGlmKCAhZGF0YS5sb29wIHx8ICggZGF0YS5sb29wID4gMCAmJiBZVFBsYXllci5wbGF5ZXIubG9vcFRpbWUgPT09IGRhdGEubG9vcCAtIDEgKSApIHtcblxuXHRcdFx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXIubG9vcFRpbWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwoIFlUUGxheWVyLmdldFN0YXRlICk7XG5cdFx0XHRcdFx0XHRcdHZhciBZVFBFbmQgPSBqUXVlcnkuRXZlbnQoIFwiWVRQRW5kXCIgKTtcblx0XHRcdFx0XHRcdFx0WVRQRW5kLnRpbWUgPSBZVFBsYXllci5jdXJyZW50VGltZTtcblx0XHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUEVuZCApO1xuXHRcdFx0XHRcdFx0XHQvL1lUUGxheWVyLnN0YXRlID0gMDtcblxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9IGVsc2UgaWYoICFkYXRhLmxvb3AgfHwgKCBkYXRhLmxvb3AgPiAwICYmIFlUUGxheWVyLnBsYXllci5sb29wVGltZSA9PT0gZGF0YS5sb29wIC0gMSApICkge1xuXG5cdFx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXIubG9vcFRpbWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5wcmV2ZW50VHJpZ2dlciA9IHRydWU7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5zdGF0ZSA9IDI7XG5cdFx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQUGF1c2UoKTtcblxuXHRcdFx0XHRcdFx0WVRQbGF5ZXIud3JhcHBlci5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0XHRcdG9wYWNpdHk6IDBcblx0XHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUsIGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5jb250cm9sQmFyLmxlbmd0aCApXG5cdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIuY29udHJvbEJhci5maW5kKCBcIi5tYl9ZVFBQbGF5cGF1c2VcIiApLmh0bWwoIGpRdWVyeS5tYllUUGxheWVyLmNvbnRyb2xzLnBsYXkgKTtcblxuXHRcdFx0XHRcdFx0XHR2YXIgWVRQRW5kID0galF1ZXJ5LkV2ZW50KCBcIllUUEVuZFwiICk7XG5cdFx0XHRcdFx0XHRcdFlUUEVuZC50aW1lID0gWVRQbGF5ZXIuY3VycmVudFRpbWU7XG5cdFx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS50cmlnZ2VyKCBZVFBFbmQgKTtcblxuXHRcdFx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXIuc2Vla1RvKCBzdGFydEF0LCB0cnVlICk7XG5cdFx0XHRcdFx0XHRcdGlmKCAhWVRQbGF5ZXIuaXNCYWNrZ3JvdW5kICkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5vcHQuYmFja2dyb3VuZFVybCAmJiBZVFBsYXllci5pc1BsYXllciApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFlUUGxheWVyLm9wdC5iYWNrZ3JvdW5kVXJsID0gWVRQbGF5ZXIub3B0LmJhY2tncm91bmRVcmwgfHwgWVRQbGF5ZXIub3JpZ19iYWNrZ3JvdW5kO1xuXHRcdFx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIub3B0LmNvbnRhaW5tZW50LmNzcygge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kOiBcInVybChcIiArIFlUUGxheWVyLm9wdC5iYWNrZ3JvdW5kVXJsICsgXCIpIGNlbnRlciBjZW50ZXJcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0YmFja2dyb3VuZFNpemU6IFwiY292ZXJcIlxuXHRcdFx0XHRcdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRpZiggWVRQbGF5ZXIub3JpZ19iYWNrZ3JvdW5kIClcblx0XHRcdFx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5jc3MoIFwiYmFja2dyb3VuZC1pbWFnZVwiLCBZVFBsYXllci5vcmlnX2JhY2tncm91bmQgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXIubG9vcFRpbWUgPSBZVFBsYXllci5wbGF5ZXIubG9vcFRpbWUgPyArK1lUUGxheWVyLnBsYXllci5sb29wVGltZSA6IDE7XG5cdFx0XHRcdFx0c3RhcnRBdCA9IHN0YXJ0QXQgfHwgMTtcblx0XHRcdFx0XHRZVFBsYXllci5wcmV2ZW50VHJpZ2dlciA9IHRydWU7XG5cdFx0XHRcdFx0WVRQbGF5ZXIuc3RhdGUgPSAyO1xuXHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBQYXVzZSgpO1xuXHRcdFx0XHRcdFlUUGxheWVyLnBsYXllci5zZWVrVG8oIHN0YXJ0QXQsIHRydWUgKTtcblx0XHRcdFx0XHQkWVRQbGF5ZXIuWVRQUGxheSgpO1xuXG5cblx0XHRcdFx0fVxuXHRcdFx0fSwgaW50ZXJ2YWwgKTtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gdGltZVxuXHRcdCAqL1xuXHRcdGdldFRpbWU6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIFlUUGxheWVyID0gdGhpcy5nZXQoIDAgKTtcblx0XHRcdHJldHVybiBqUXVlcnkubWJZVFBsYXllci5mb3JtYXRUaW1lKCBZVFBsYXllci5jdXJyZW50VGltZSApO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSB0b3RhbCB0aW1lXG5cdFx0ICovXG5cdFx0Z2V0VG90YWxUaW1lOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHRyZXR1cm4galF1ZXJ5Lm1iWVRQbGF5ZXIuZm9ybWF0VGltZSggWVRQbGF5ZXIudG90YWxUaW1lICk7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBZVFBsYXllclxuXHRcdCAqL1xuXHRcdGNoZWNrRm9yU3RhcnQ6IGZ1bmN0aW9uKCBZVFBsYXllciApIHtcblxuXHRcdFx0dmFyICRZVFBsYXllciA9IGpRdWVyeSggWVRQbGF5ZXIgKTtcblxuXHRcdFx0Ly9DaGVja2luZyBpZiBwbGF5ZXIgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHNjZW5lXG5cdFx0XHRpZiggIWpRdWVyeS5jb250YWlucyggZG9jdW1lbnQsIFlUUGxheWVyICkgKSB7XG5cdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBQbGF5ZXJEZXN0cm95KCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0WVRQbGF5ZXIucHJldmVudFRyaWdnZXIgPSB0cnVlO1xuXHRcdFx0WVRQbGF5ZXIuc3RhdGUgPSAyO1xuXHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLllUUFBhdXNlKCk7XG5cblx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5tdXRlWVRQVm9sdW1lKCk7XG5cdFx0XHRqUXVlcnkoIFwiI2NvbnRyb2xCYXJfXCIgKyBZVFBsYXllci5pZCApLnJlbW92ZSgpO1xuXG5cdFx0XHRZVFBsYXllci5jb250cm9sQmFyID0gZmFsc2U7XG5cblx0XHRcdGlmKCBZVFBsYXllci5vcHQuc2hvd0NvbnRyb2xzIClcblx0XHRcdFx0alF1ZXJ5Lm1iWVRQbGF5ZXIuYnVpbGRDb250cm9scyggWVRQbGF5ZXIgKTtcblxuXHRcdFx0aWYoIFlUUGxheWVyLm92ZXJsYXkgKVxuXHRcdFx0XHRpZiggWVRQbGF5ZXIub3B0LmFkZFJhc3RlciApIHtcblxuXHRcdFx0XHRcdHZhciBjbGFzc04gPSBZVFBsYXllci5vcHQuYWRkUmFzdGVyID09IFwiZG90XCIgPyBcInJhc3Rlci1kb3RcIiA6IFwicmFzdGVyXCI7XG5cdFx0XHRcdFx0WVRQbGF5ZXIub3ZlcmxheS5hZGRDbGFzcyggWVRQbGF5ZXIuaXNSZXRpbmEgPyBjbGFzc04gKyBcIiByZXRpbmFcIiA6IGNsYXNzTiApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRZVFBsYXllci5vdmVybGF5LnJlbW92ZUNsYXNzKCBmdW5jdGlvbiggaW5kZXgsIGNsYXNzTmFtZXMgKSB7XG5cdFx0XHRcdFx0XHQvLyBjaGFuZ2UgdGhlIGxpc3QgaW50byBhbiBhcnJheVxuXHRcdFx0XHRcdFx0dmFyIGN1cnJlbnRfY2xhc3NlcyA9IGNsYXNzTmFtZXMuc3BsaXQoIFwiIFwiICksXG5cdFx0XHRcdFx0XHRcdC8vIGFycmF5IG9mIGNsYXNzZXMgd2hpY2ggYXJlIHRvIGJlIHJlbW92ZWRcblx0XHRcdFx0XHRcdFx0Y2xhc3Nlc190b19yZW1vdmUgPSBbXTtcblx0XHRcdFx0XHRcdGpRdWVyeS5lYWNoKCBjdXJyZW50X2NsYXNzZXMsIGZ1bmN0aW9uKCBpbmRleCwgY2xhc3NfbmFtZSApIHtcblx0XHRcdFx0XHRcdFx0Ly8gaWYgdGhlIGNsYXNzbmFtZSBiZWdpbnMgd2l0aCBiZyBhZGQgaXQgdG8gdGhlIGNsYXNzZXNfdG9fcmVtb3ZlIGFycmF5XG5cdFx0XHRcdFx0XHRcdGlmKCAvcmFzdGVyLiovLnRlc3QoIGNsYXNzX25hbWUgKSApIHtcblx0XHRcdFx0XHRcdFx0XHRjbGFzc2VzX3RvX3JlbW92ZS5wdXNoKCBjbGFzc19uYW1lICk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0XHRcdGNsYXNzZXNfdG9fcmVtb3ZlLnB1c2goIFwicmV0aW5hXCIgKTtcblx0XHRcdFx0XHRcdC8vIHR1cm4gdGhlIGFycmF5IGJhY2sgaW50byBhIHN0cmluZ1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNsYXNzZXNfdG9fcmVtb3ZlLmpvaW4oIFwiIFwiICk7XG5cdFx0XHRcdFx0fSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0dmFyIHN0YXJ0QXQgPSBZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgPyBZVFBsYXllci5zdGFydF9mcm9tX2xhc3QgOiBZVFBsYXllci5vcHQuc3RhcnRBdCA/IFlUUGxheWVyLm9wdC5zdGFydEF0IDogMTtcblxuXHRcdFx0WVRQbGF5ZXIuc3RhcnRfZnJvbV9sYXN0ID0gbnVsbDtcblxuXHRcdFx0WVRQbGF5ZXIucGxheWVyLnBsYXlWaWRlbygpO1xuXHRcdFx0WVRQbGF5ZXIucGxheWVyLnNlZWtUbyggc3RhcnRBdCwgdHJ1ZSApO1xuXG5cdFx0XHRjbGVhckludGVydmFsKCBZVFBsYXllci5jaGVja0ZvclN0YXJ0QXQgKTtcblx0XHRcdFlUUGxheWVyLmNoZWNrRm9yU3RhcnRBdCA9IHNldEludGVydmFsKCBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQTXV0ZSgpO1xuXG5cdFx0XHRcdHZhciBjYW5QbGF5VmlkZW8gPSBZVFBsYXllci5wbGF5ZXIuZ2V0VmlkZW9Mb2FkZWRGcmFjdGlvbigpID49IHN0YXJ0QXQgLyBZVFBsYXllci5wbGF5ZXIuZ2V0RHVyYXRpb24oKTtcblxuXHRcdFx0XHRpZiggWVRQbGF5ZXIucGxheWVyLmdldER1cmF0aW9uKCkgPiAwICYmIFlUUGxheWVyLnBsYXllci5nZXRDdXJyZW50VGltZSgpID49IHN0YXJ0QXQgJiYgY2FuUGxheVZpZGVvICkge1xuXG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuY2hlY2tGb3JTdGFydEF0ICk7XG5cblx0XHRcdFx0XHRpZiggdHlwZW9mIFlUUGxheWVyLm9wdC5vblJlYWR5ID09IFwiZnVuY3Rpb25cIiApXG5cdFx0XHRcdFx0XHRZVFBsYXllci5vcHQub25SZWFkeSggWVRQbGF5ZXIgKTtcblxuXHRcdFx0XHRcdFlUUGxheWVyLmlzUmVhZHkgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dmFyIFlUUHJlYWR5ID0galF1ZXJ5LkV2ZW50KCBcIllUUFJlYWR5XCIgKTtcblx0XHRcdFx0XHRZVFByZWFkeS50aW1lID0gWVRQbGF5ZXIuY3VycmVudFRpbWU7XG5cdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUHJlYWR5ICk7XG5cblx0XHRcdFx0XHRZVFBsYXllci5wcmV2ZW50VHJpZ2dlciA9IHRydWU7XG5cdFx0XHRcdFx0WVRQbGF5ZXIuc3RhdGUgPSAyO1xuXHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIgKS5ZVFBQYXVzZSgpO1xuXG5cdFx0XHRcdFx0aWYoICFZVFBsYXllci5vcHQubXV0ZSApXG5cdFx0XHRcdFx0XHRqUXVlcnkoIFlUUGxheWVyICkuWVRQVW5tdXRlKCk7XG5cdFx0XHRcdFx0WVRQbGF5ZXIuY2FuVHJpZ2dlciA9IHRydWU7XG5cblx0XHRcdFx0XHRpZiggWVRQbGF5ZXIub3B0LmF1dG9QbGF5ICkge1xuXG5cdFx0XHRcdFx0XHR2YXIgWVRQU3RhcnQgPSBqUXVlcnkuRXZlbnQoIFwiWVRQU3RhcnRcIiApO1xuXHRcdFx0XHRcdFx0WVRQU3RhcnQudGltZSA9IFlUUGxheWVyLmN1cnJlbnRUaW1lO1xuXHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllciApLnRyaWdnZXIoIFlUUFN0YXJ0ICk7XG5cblx0XHRcdFx0XHRcdGpRdWVyeSggWVRQbGF5ZXIucGxheWVyRWwgKS5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0XHRcdG9wYWNpdHk6IDFcblx0XHRcdFx0XHRcdH0sIDEwMDAgKTtcblxuXHRcdFx0XHRcdFx0JFlUUGxheWVyLllUUFBsYXkoKTtcblxuXHRcdFx0XHRcdFx0WVRQbGF5ZXIud3JhcHBlci5DU1NBbmltYXRlKCB7XG5cdFx0XHRcdFx0XHRcdG9wYWNpdHk6IFlUUGxheWVyLmlzQWxvbmUgPyAxIDogWVRQbGF5ZXIub3B0Lm9wYWNpdHlcblx0XHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUgKiAyICk7XG5cblx0XHRcdFx0XHRcdC8qIEZpeCBmb3IgU2FmYXJpIGZyZWV6ZSAqL1xuXG5cdFx0XHRcdFx0XHRpZiggalF1ZXJ5Lm1iQnJvd3Nlci5vcy5uYW1lID09IFwibWFjXCIgJiYgalF1ZXJ5Lm1iQnJvd3Nlci5zYWZhcmkgJiYgalF1ZXJ5Lm1iQnJvd3Nlci52ZXJzaW9uQ29tcGFyZSggalF1ZXJ5Lm1iQnJvd3Nlci5mdWxsVmVyc2lvbiwgXCIxMC4xXCIgKSA8IDAgKSB7IC8valF1ZXJ5Lm1iQnJvd3Nlci5vcy5taW5vcl92ZXJzaW9uIDwgMTFcblxuXHRcdFx0XHRcdFx0XHRZVFBsYXllci5zYWZhcmlQbGF5ID0gc2V0SW50ZXJ2YWwoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmKCBZVFBsYXllci5zdGF0ZSAhPSAxIClcblx0XHRcdFx0XHRcdFx0XHRcdCRZVFBsYXllci5ZVFBQbGF5KCk7XG5cdFx0XHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbCggWVRQbGF5ZXIuc2FmYXJpUGxheSApO1xuXHRcdFx0XHRcdFx0XHR9LCAxMCApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0JFlUUGxheWVyLm9uZSggXCJZVFBSZWFkeVwiLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0JFlUUGxheWVyLllUUFBsYXkoKTtcblx0XHRcdFx0XHRcdH0gKTtcblxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRcdC8vJFlUUGxheWVyLllUUFBhdXNlKCk7XG5cdFx0XHRcdFx0XHRZVFBsYXllci5wbGF5ZXIucGF1c2VWaWRlbygpO1xuXHRcdFx0XHRcdFx0aWYoICFZVFBsYXllci5pc1BsYXllciApIHtcblx0XHRcdFx0XHRcdFx0alF1ZXJ5KCBZVFBsYXllci5wbGF5ZXJFbCApLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0XHRcdFx0XHRvcGFjaXR5OiAxXG5cdFx0XHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUgKTtcblxuXHRcdFx0XHRcdFx0XHRZVFBsYXllci53cmFwcGVyLkNTU0FuaW1hdGUoIHtcblx0XHRcdFx0XHRcdFx0XHRvcGFjaXR5OiBZVFBsYXllci5pc0Fsb25lID8gMSA6IFlUUGxheWVyLm9wdC5vcGFjaXR5XG5cdFx0XHRcdFx0XHRcdH0sIFlUUGxheWVyLm9wdC5mYWRlT25TdGFydFRpbWUgKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYoIFlUUGxheWVyLmNvbnRyb2xCYXIubGVuZ3RoIClcblx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIuY29udHJvbEJhci5maW5kKCBcIi5tYl9ZVFBQbGF5cGF1c2VcIiApLmh0bWwoIGpRdWVyeS5tYllUUGxheWVyLmNvbnRyb2xzLnBsYXkgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuaXNQbGF5ZXIgJiYgIVlUUGxheWVyLm9wdC5hdXRvUGxheSAmJiAoIFlUUGxheWVyLmxvYWRpbmcgJiYgWVRQbGF5ZXIubG9hZGluZy5sZW5ndGggKSApIHtcblx0XHRcdFx0XHRcdFlUUGxheWVyLmxvYWRpbmcuaHRtbCggXCJSZWFkeVwiICk7XG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0WVRQbGF5ZXIubG9hZGluZy5mYWRlT3V0KCk7XG5cdFx0XHRcdFx0XHR9LCAxMDAgKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiggWVRQbGF5ZXIuY29udHJvbEJhciAmJiBZVFBsYXllci5jb250cm9sQmFyLmxlbmd0aCApXG5cdFx0XHRcdFx0XHRZVFBsYXllci5jb250cm9sQmFyLnNsaWRlRG93biggMTAwMCApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiggalF1ZXJ5Lm1iQnJvd3Nlci5vcy5uYW1lID09IFwibWFjXCIgJiYgalF1ZXJ5Lm1iQnJvd3Nlci5zYWZhcmkgJiYgalF1ZXJ5Lm1iQnJvd3Nlci5mdWxsVmVyc2lvbiAmJiBqUXVlcnkubWJCcm93c2VyLnZlcnNpb25Db21wYXJlKCBqUXVlcnkubWJCcm93c2VyLmZ1bGxWZXJzaW9uLCBcIjEwLjFcIiApIDwgMCApIHsgLy9qUXVlcnkubWJCcm93c2VyLm9zLm1pbm9yX3ZlcnNpb24gPCAxMVxuXHRcdFx0XHRcdFlUUGxheWVyLnBsYXllci5wbGF5VmlkZW8oKTtcblx0XHRcdFx0XHRpZiggc3RhcnRBdCA+PSAwIClcblx0XHRcdFx0XHRcdFlUUGxheWVyLnBsYXllci5zZWVrVG8oIHN0YXJ0QXQsIHRydWUgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9LCAxMCApO1xuXG5cdFx0fSxcblx0XHQvKipcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBhbmNob3Jcblx0XHQgKi9cblx0XHRzZXRBbmNob3I6IGZ1bmN0aW9uKCBhbmNob3IgKSB7XG5cdFx0XHR2YXIgJFlUcGxheWVyID0gdGhpcztcblx0XHRcdCRZVHBsYXllci5vcHRpbWl6ZURpc3BsYXkoIGFuY2hvciApO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gYW5jaG9yXG5cdFx0ICovXG5cdFx0Z2V0QW5jaG9yOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBZVFBsYXllciA9IHRoaXMuZ2V0KCAwICk7XG5cdFx0XHRyZXR1cm4gWVRQbGF5ZXIub3B0LmFuY2hvcjtcblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHNcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZvcm1hdFRpbWU6IGZ1bmN0aW9uKCBzICkge1xuXHRcdFx0dmFyIG1pbiA9IE1hdGguZmxvb3IoIHMgLyA2MCApO1xuXHRcdFx0dmFyIHNlYyA9IE1hdGguZmxvb3IoIHMgLSAoIDYwICogbWluICkgKTtcblx0XHRcdHJldHVybiggbWluIDw9IDkgPyBcIjBcIiArIG1pbiA6IG1pbiApICsgXCIgOiBcIiArICggc2VjIDw9IDkgPyBcIjBcIiArIHNlYyA6IHNlYyApO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGFuY2hvclxuXHQgKiBjYW4gYmUgY2VudGVyLCB0b3AsIGJvdHRvbSwgcmlnaHQsIGxlZnQ7IChkZWZhdWx0IGlzIGNlbnRlcixjZW50ZXIpXG5cdCAqL1xuXHRqUXVlcnkuZm4ub3B0aW1pemVEaXNwbGF5ID0gZnVuY3Rpb24oIGFuY2hvciApIHtcblx0XHR2YXIgWVRQbGF5ZXIgPSB0aGlzLmdldCggMCApO1xuXHRcdHZhciBwbGF5ZXJCb3ggPSBqUXVlcnkoIFlUUGxheWVyLnBsYXllckVsICk7XG5cdFx0dmFyIHZpZCA9IHt9O1xuXG5cdFx0WVRQbGF5ZXIub3B0LmFuY2hvciA9IGFuY2hvciB8fCBZVFBsYXllci5vcHQuYW5jaG9yO1xuXG5cdFx0WVRQbGF5ZXIub3B0LmFuY2hvciA9IHR5cGVvZiBZVFBsYXllci5vcHQuYW5jaG9yICE9IFwidW5kZWZpbmVkIFwiID8gWVRQbGF5ZXIub3B0LmFuY2hvciA6IFwiY2VudGVyLGNlbnRlclwiO1xuXHRcdHZhciBZVFBBbGlnbiA9IFlUUGxheWVyLm9wdC5hbmNob3Iuc3BsaXQoIFwiLFwiICk7XG5cblx0XHQvL2RhdGEub3B0aW1pemVEaXNwbGF5ID0gWVRQbGF5ZXIuaXNQbGF5ZXIgPyBmYWxzZSA6IGRhdGEub3B0aW1pemVEaXNwbGF5O1xuXG5cdFx0aWYoIFlUUGxheWVyLm9wdC5vcHRpbWl6ZURpc3BsYXkgKSB7XG5cdFx0XHR2YXIgYWJ1bmRhbmNlID0gWVRQbGF5ZXIuaXNQbGF5ZXIgPyAwIDogMTgwO1xuXHRcdFx0dmFyIHdpbiA9IHt9O1xuXHRcdFx0dmFyIGVsID0gWVRQbGF5ZXIud3JhcHBlcjtcblxuXHRcdFx0d2luLndpZHRoID0gZWwub3V0ZXJXaWR0aCgpO1xuXHRcdFx0d2luLmhlaWdodCA9IGVsLm91dGVySGVpZ2h0KCkgKyBhYnVuZGFuY2U7XG5cblx0XHRcdFlUUGxheWVyLm9wdC5yYXRpbyA9IGV2YWwoIFlUUGxheWVyLm9wdC5yYXRpbyApO1xuXG5cdFx0XHR2aWQud2lkdGggPSB3aW4ud2lkdGg7XG5cdFx0XHQvL1x0XHRcdHZpZC5oZWlnaHQgPSBZVFBsYXllci5vcHQucmF0aW8gPT0gXCIxNi85XCIgPyBNYXRoLmNlaWwoIHZpZC53aWR0aCAqICggOSAvIDE2ICkgKSA6IE1hdGguY2VpbCggdmlkLndpZHRoICogKCAzIC8gNCApICk7XG5cdFx0XHR2aWQuaGVpZ2h0ID0gTWF0aC5jZWlsKCB2aWQud2lkdGggLyBZVFBsYXllci5vcHQucmF0aW8gKTtcblxuXHRcdFx0dmlkLm1hcmdpblRvcCA9IE1hdGguY2VpbCggLSggKCB2aWQuaGVpZ2h0IC0gd2luLmhlaWdodCApIC8gMiApICk7XG5cdFx0XHR2aWQubWFyZ2luTGVmdCA9IDA7XG5cblx0XHRcdHZhciBsb3dlc3QgPSB2aWQuaGVpZ2h0IDwgd2luLmhlaWdodDtcblxuXHRcdFx0aWYoIGxvd2VzdCApIHtcblxuXHRcdFx0XHR2aWQuaGVpZ2h0ID0gd2luLmhlaWdodDtcblx0XHRcdFx0Ly9cdFx0XHRcdHZpZC53aWR0aCA9IFlUUGxheWVyLm9wdC5yYXRpbyA9PSBcIjE2LzlcIiA/IE1hdGguZmxvb3IoIHZpZC5oZWlnaHQgKiAoIDE2IC8gOSApICkgOiBNYXRoLmZsb29yKCB2aWQuaGVpZ2h0ICogKCA0IC8gMyApICk7XG5cdFx0XHRcdHZpZC53aWR0aCA9IE1hdGguY2VpbCggdmlkLmhlaWdodCAqIFlUUGxheWVyLm9wdC5yYXRpbyApO1xuXG5cdFx0XHRcdHZpZC5tYXJnaW5Ub3AgPSAwO1xuXHRcdFx0XHR2aWQubWFyZ2luTGVmdCA9IE1hdGguY2VpbCggLSggKCB2aWQud2lkdGggLSB3aW4ud2lkdGggKSAvIDIgKSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdGZvciggdmFyIGEgaW4gWVRQQWxpZ24gKSB7XG5cblx0XHRcdFx0aWYoIFlUUEFsaWduLmhhc093blByb3BlcnR5KCBhICkgKSB7XG5cblx0XHRcdFx0XHR2YXIgYWwgPSBZVFBBbGlnblsgYSBdLnJlcGxhY2UoIC8gL2csIFwiXCIgKTtcblxuXHRcdFx0XHRcdHN3aXRjaCggYWwgKSB7XG5cblx0XHRcdFx0XHRcdGNhc2UgXCJ0b3BcIjpcblx0XHRcdFx0XHRcdFx0dmlkLm1hcmdpblRvcCA9IGxvd2VzdCA/IC0oICggdmlkLmhlaWdodCAtIHdpbi5oZWlnaHQgKSAvIDIgKSA6IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRjYXNlIFwiYm90dG9tXCI6XG5cdFx0XHRcdFx0XHRcdHZpZC5tYXJnaW5Ub3AgPSBsb3dlc3QgPyAwIDogLSggdmlkLmhlaWdodCAtICggd2luLmhlaWdodCApICk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRjYXNlIFwibGVmdFwiOlxuXHRcdFx0XHRcdFx0XHR2aWQubWFyZ2luTGVmdCA9IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRjYXNlIFwicmlnaHRcIjpcblx0XHRcdFx0XHRcdFx0dmlkLm1hcmdpbkxlZnQgPSBsb3dlc3QgPyAtKCB2aWQud2lkdGggLSB3aW4ud2lkdGggKSA6IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRpZiggdmlkLndpZHRoID4gd2luLndpZHRoIClcblx0XHRcdFx0XHRcdFx0XHR2aWQubWFyZ2luTGVmdCA9IC0oICggdmlkLndpZHRoIC0gd2luLndpZHRoICkgLyAyICk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2aWQud2lkdGggPSBcIjEwMCVcIjtcblx0XHRcdHZpZC5oZWlnaHQgPSBcIjEwMCVcIjtcblx0XHRcdHZpZC5tYXJnaW5Ub3AgPSAwO1xuXHRcdFx0dmlkLm1hcmdpbkxlZnQgPSAwO1xuXHRcdH1cblxuXHRcdHBsYXllckJveC5jc3MoIHtcblx0XHRcdHdpZHRoOiB2aWQud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHZpZC5oZWlnaHQsXG5cdFx0XHRtYXJnaW5Ub3A6IHZpZC5tYXJnaW5Ub3AsXG5cdFx0XHRtYXJnaW5MZWZ0OiB2aWQubWFyZ2luTGVmdCxcblx0XHRcdG1heFdpZHRoOiBcImluaXRpYWxcIlxuXHRcdH0gKTtcblxuXHR9O1xuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGFyclxuXHQgKiBAcmV0dXJucyB7QXJyYXl8c3RyaW5nfEJsb2J8Kn1cblx0ICpcblx0ICovXG5cdGpRdWVyeS5zaHVmZmxlID0gZnVuY3Rpb24oIGFyciApIHtcblx0XHR2YXIgbmV3QXJyYXkgPSBhcnIuc2xpY2UoKTtcblx0XHR2YXIgbGVuID0gbmV3QXJyYXkubGVuZ3RoO1xuXHRcdHZhciBpID0gbGVuO1xuXHRcdHdoaWxlKCBpLS0gKSB7XG5cdFx0XHR2YXIgcCA9IHBhcnNlSW50KCBNYXRoLnJhbmRvbSgpICogbGVuICk7XG5cdFx0XHR2YXIgdCA9IG5ld0FycmF5WyBpIF07XG5cdFx0XHRuZXdBcnJheVsgaSBdID0gbmV3QXJyYXlbIHAgXTtcblx0XHRcdG5ld0FycmF5WyBwIF0gPSB0O1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3QXJyYXk7XG5cdH07XG5cblx0alF1ZXJ5LmZuLnVuc2VsZWN0YWJsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmVhY2goIGZ1bmN0aW9uKCkge1xuXHRcdFx0alF1ZXJ5KCB0aGlzICkuY3NzKCB7XG5cdFx0XHRcdFwiLW1vei11c2VyLXNlbGVjdFwiOiBcIm5vbmVcIixcblx0XHRcdFx0XCItd2Via2l0LXVzZXItc2VsZWN0XCI6IFwibm9uZVwiLFxuXHRcdFx0XHRcInVzZXItc2VsZWN0XCI6IFwibm9uZVwiXG5cdFx0XHR9ICkuYXR0ciggXCJ1bnNlbGVjdGFibGVcIiwgXCJvblwiICk7XG5cdFx0fSApO1xuXHR9O1xuXG5cdC8qIEV4cG9zZWQgcHVibGljIG1ldGhvZCAqL1xuXHRqUXVlcnkuZm4uWVRQbGF5ZXIgPSBqUXVlcnkubWJZVFBsYXllci5idWlsZFBsYXllcjtcblx0alF1ZXJ5LmZuLllUUEdldFBsYXllciA9IGpRdWVyeS5tYllUUGxheWVyLmdldFBsYXllcjtcblx0alF1ZXJ5LmZuLllUUEdldFZpZGVvSUQgPSBqUXVlcnkubWJZVFBsYXllci5nZXRWaWRlb0lEO1xuXHRqUXVlcnkuZm4uWVRQQ2hhbmdlTW92aWUgPSBqUXVlcnkubWJZVFBsYXllci5jaGFuZ2VNb3ZpZTtcblx0alF1ZXJ5LmZuLllUUFBsYXllckRlc3Ryb3kgPSBqUXVlcnkubWJZVFBsYXllci5wbGF5ZXJEZXN0cm95O1xuXG5cdGpRdWVyeS5mbi5ZVFBQbGF5ID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGxheTtcblx0alF1ZXJ5LmZuLllUUFRvZ2dsZVBsYXkgPSBqUXVlcnkubWJZVFBsYXllci50b2dnbGVQbGF5O1xuXHRqUXVlcnkuZm4uWVRQU3RvcCA9IGpRdWVyeS5tYllUUGxheWVyLnN0b3A7XG5cdGpRdWVyeS5mbi5ZVFBQYXVzZSA9IGpRdWVyeS5tYllUUGxheWVyLnBhdXNlO1xuXHRqUXVlcnkuZm4uWVRQU2Vla1RvID0galF1ZXJ5Lm1iWVRQbGF5ZXIuc2Vla1RvO1xuXG5cdGpRdWVyeS5mbi5ZVFBsYXlsaXN0ID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGxheWxpc3Q7XG5cdGpRdWVyeS5mbi5ZVFBQbGF5TmV4dCA9IGpRdWVyeS5tYllUUGxheWVyLnBsYXlOZXh0O1xuXHRqUXVlcnkuZm4uWVRQUGxheVByZXYgPSBqUXVlcnkubWJZVFBsYXllci5wbGF5UHJldjtcblx0alF1ZXJ5LmZuLllUUFBsYXlJbmRleCA9IGpRdWVyeS5tYllUUGxheWVyLnBsYXlJbmRleDtcblxuXHRqUXVlcnkuZm4uWVRQTXV0ZSA9IGpRdWVyeS5tYllUUGxheWVyLm11dGU7XG5cdGpRdWVyeS5mbi5ZVFBVbm11dGUgPSBqUXVlcnkubWJZVFBsYXllci51bm11dGU7XG5cdGpRdWVyeS5mbi5ZVFBUb2dnbGVWb2x1bWUgPSBqUXVlcnkubWJZVFBsYXllci50b2dnbGVWb2x1bWU7XG5cdGpRdWVyeS5mbi5ZVFBTZXRWb2x1bWUgPSBqUXVlcnkubWJZVFBsYXllci5zZXRWb2x1bWU7XG5cblx0alF1ZXJ5LmZuLllUUEdldFZpZGVvRGF0YSA9IGpRdWVyeS5tYllUUGxheWVyLmdldFZpZGVvRGF0YTtcblx0alF1ZXJ5LmZuLllUUEZ1bGxzY3JlZW4gPSBqUXVlcnkubWJZVFBsYXllci5mdWxsc2NyZWVuO1xuXHRqUXVlcnkuZm4uWVRQVG9nZ2xlTG9vcHMgPSBqUXVlcnkubWJZVFBsYXllci50b2dnbGVMb29wcztcblx0alF1ZXJ5LmZuLllUUFNldFZpZGVvUXVhbGl0eSA9IGpRdWVyeS5tYllUUGxheWVyLnNldFZpZGVvUXVhbGl0eTtcblx0alF1ZXJ5LmZuLllUUE1hbmFnZVByb2dyZXNzID0galF1ZXJ5Lm1iWVRQbGF5ZXIubWFuYWdlUHJvZ3Jlc3M7XG5cblx0alF1ZXJ5LmZuLllUUEFwcGx5RmlsdGVyID0galF1ZXJ5Lm1iWVRQbGF5ZXIuYXBwbHlGaWx0ZXI7XG5cdGpRdWVyeS5mbi5ZVFBBcHBseUZpbHRlcnMgPSBqUXVlcnkubWJZVFBsYXllci5hcHBseUZpbHRlcnM7XG5cdGpRdWVyeS5mbi5ZVFBUb2dnbGVGaWx0ZXIgPSBqUXVlcnkubWJZVFBsYXllci50b2dnbGVGaWx0ZXI7XG5cdGpRdWVyeS5mbi5ZVFBUb2dnbGVGaWx0ZXJzID0galF1ZXJ5Lm1iWVRQbGF5ZXIudG9nZ2xlRmlsdGVycztcblx0alF1ZXJ5LmZuLllUUFJlbW92ZUZpbHRlciA9IGpRdWVyeS5tYllUUGxheWVyLnJlbW92ZUZpbHRlcjtcblx0alF1ZXJ5LmZuLllUUERpc2FibGVGaWx0ZXJzID0galF1ZXJ5Lm1iWVRQbGF5ZXIuZGlzYWJsZUZpbHRlcnM7XG5cdGpRdWVyeS5mbi5ZVFBFbmFibGVGaWx0ZXJzID0galF1ZXJ5Lm1iWVRQbGF5ZXIuZW5hYmxlRmlsdGVycztcblx0alF1ZXJ5LmZuLllUUEdldEZpbHRlcnMgPSBqUXVlcnkubWJZVFBsYXllci5nZXRGaWx0ZXJzO1xuXG5cdGpRdWVyeS5mbi5ZVFBHZXRUaW1lID0galF1ZXJ5Lm1iWVRQbGF5ZXIuZ2V0VGltZTtcblx0alF1ZXJ5LmZuLllUUEdldFRvdGFsVGltZSA9IGpRdWVyeS5tYllUUGxheWVyLmdldFRvdGFsVGltZTtcblxuXHRqUXVlcnkuZm4uWVRQQWRkTWFzayA9IGpRdWVyeS5tYllUUGxheWVyLmFkZE1hc2s7XG5cdGpRdWVyeS5mbi5ZVFBSZW1vdmVNYXNrID0galF1ZXJ5Lm1iWVRQbGF5ZXIucmVtb3ZlTWFzaztcblx0alF1ZXJ5LmZuLllUUFRvZ2dsZU1hc2sgPSBqUXVlcnkubWJZVFBsYXllci50b2dnbGVNYXNrO1xuXG5cdGpRdWVyeS5mbi5ZVFBTZXRBbmNob3IgPSBqUXVlcnkubWJZVFBsYXllci5zZXRBbmNob3I7XG5cdGpRdWVyeS5mbi5ZVFBHZXRBbmNob3IgPSBqUXVlcnkubWJZVFBsYXllci5nZXRBbmNob3I7XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqIHRvZG86IEFib3ZlIG1ldGhvZHMgd2lsbCBiZSByZW1vdmVkIHdpdGggdmVyc2lvbiAzLjUuMFxuXHQgKlxuXHQgKiovXG5cdGpRdWVyeS5mbi5tYl9ZVFBsYXllciA9IGpRdWVyeS5tYllUUGxheWVyLmJ1aWxkUGxheWVyO1xuXHRqUXVlcnkuZm4ucGxheU5leHQgPSBqUXVlcnkubWJZVFBsYXllci5wbGF5TmV4dDtcblx0alF1ZXJ5LmZuLnBsYXlQcmV2ID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGxheVByZXY7XG5cdGpRdWVyeS5mbi5jaGFuZ2VNb3ZpZSA9IGpRdWVyeS5tYllUUGxheWVyLmNoYW5nZU1vdmllO1xuXHRqUXVlcnkuZm4uZ2V0VmlkZW9JRCA9IGpRdWVyeS5tYllUUGxheWVyLmdldFZpZGVvSUQ7XG5cdGpRdWVyeS5mbi5nZXRQbGF5ZXIgPSBqUXVlcnkubWJZVFBsYXllci5nZXRQbGF5ZXI7XG5cdGpRdWVyeS5mbi5wbGF5ZXJEZXN0cm95ID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGxheWVyRGVzdHJveTtcblx0alF1ZXJ5LmZuLmZ1bGxzY3JlZW4gPSBqUXVlcnkubWJZVFBsYXllci5mdWxsc2NyZWVuO1xuXHRqUXVlcnkuZm4uYnVpbGRZVFBDb250cm9scyA9IGpRdWVyeS5tYllUUGxheWVyLmJ1aWxkQ29udHJvbHM7XG5cdGpRdWVyeS5mbi5wbGF5WVRQID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGxheTtcblx0alF1ZXJ5LmZuLnRvZ2dsZUxvb3BzID0galF1ZXJ5Lm1iWVRQbGF5ZXIudG9nZ2xlTG9vcHM7XG5cdGpRdWVyeS5mbi5zdG9wWVRQID0galF1ZXJ5Lm1iWVRQbGF5ZXIuc3RvcDtcblx0alF1ZXJ5LmZuLnBhdXNlWVRQID0galF1ZXJ5Lm1iWVRQbGF5ZXIucGF1c2U7XG5cdGpRdWVyeS5mbi5zZWVrVG9ZVFAgPSBqUXVlcnkubWJZVFBsYXllci5zZWVrVG87XG5cdGpRdWVyeS5mbi5tdXRlWVRQVm9sdW1lID0galF1ZXJ5Lm1iWVRQbGF5ZXIubXV0ZTtcblx0alF1ZXJ5LmZuLnVubXV0ZVlUUFZvbHVtZSA9IGpRdWVyeS5tYllUUGxheWVyLnVubXV0ZTtcblx0alF1ZXJ5LmZuLnNldFlUUFZvbHVtZSA9IGpRdWVyeS5tYllUUGxheWVyLnNldFZvbHVtZTtcblx0alF1ZXJ5LmZuLnNldFZpZGVvUXVhbGl0eSA9IGpRdWVyeS5tYllUUGxheWVyLnNldFZpZGVvUXVhbGl0eTtcblx0alF1ZXJ5LmZuLm1hbmFnZVlUUFByb2dyZXNzID0galF1ZXJ5Lm1iWVRQbGF5ZXIubWFuYWdlUHJvZ3Jlc3M7XG5cdGpRdWVyeS5mbi5ZVFBHZXREYXRhRnJvbUZlZWQgPSBqUXVlcnkubWJZVFBsYXllci5nZXRWaWRlb0RhdGE7XG5cblxufSApKCBqUXVlcnksIHl0cCApO1xuXG4vKlxuICogKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAganF1ZXJ5Lm1iLmNvbXBvbmVudHNcbiAqICBmaWxlOiBqcXVlcnkubWIuQ1NTQW5pbWF0ZS5taW4uanNcbiAqXG4gKiAgQ29weXJpZ2h0IChjKSAyMDAxLTIwMTQuIE1hdHRlbyBCaWNvY2NoaSAoUHVwdW56aSk7XG4gKiAgT3BlbiBsYWIgc3JsLCBGaXJlbnplIC0gSXRhbHlcbiAqICBlbWFpbDogbWF0dGVvQG9wZW4tbGFiLmNvbVxuICogIHNpdGU6IFx0aHR0cDovL3B1cHVuemkuY29tXG4gKiAgYmxvZzpcdGh0dHA6Ly9wdXB1bnppLm9wZW4tbGFiLmNvbVxuICogXHRodHRwOi8vb3Blbi1sYWIuY29tXG4gKlxuICogIExpY2VuY2VzOiBNSVQsIEdQTFxuICogIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKiAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC5odG1sXG4gKlxuICogIGxhc3QgbW9kaWZpZWQ6IDI2LzAzLzE0IDIxLjQwXG4gKiAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqL1xuXG5mdW5jdGlvbiB1bmNhbWVsKGUpe3JldHVybiBlLnJlcGxhY2UoLyhbQS1aXSkvZyxmdW5jdGlvbihlKXtyZXR1cm5cIi1cIitlLnRvTG93ZXJDYXNlKCk7fSk7fWZ1bmN0aW9uIHNldFVuaXQoZSx0KXtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgZXx8ZS5tYXRjaCgvXltcXC0wLTlcXC5dK2pRdWVyeS8pP1wiXCIrZSt0OmU7fWZ1bmN0aW9uIHNldEZpbHRlcihlLHQscil7dmFyIGk9dW5jYW1lbCh0KSxuPWpRdWVyeS5icm93c2VyLm1vemlsbGE/XCJcIjpqUXVlcnkuQ1NTLnNmeDtlW24rXCJmaWx0ZXJcIl09ZVtuK1wiZmlsdGVyXCJdfHxcIlwiLHI9c2V0VW5pdChyPmpRdWVyeS5DU1MuZmlsdGVyc1t0XS5tYXg/alF1ZXJ5LkNTUy5maWx0ZXJzW3RdLm1heDpyLGpRdWVyeS5DU1MuZmlsdGVyc1t0XS51bml0KSxlW24rXCJmaWx0ZXJcIl0rPWkrXCIoXCIrcitcIikgXCIsZGVsZXRlIGVbdF07fWpRdWVyeS5zdXBwb3J0LkNTU3RyYW5zaXRpb249ZnVuY3Rpb24oKXt2YXIgZT1kb2N1bWVudC5ib2R5fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsdD1lLnN0eWxlO3JldHVybiB2b2lkIDAhPT10LnRyYW5zaXRpb258fHZvaWQgMCE9PXQuV2Via2l0VHJhbnNpdGlvbnx8dm9pZCAwIT09dC5Nb3pUcmFuc2l0aW9ufHx2b2lkIDAhPT10Lk1zVHJhbnNpdGlvbnx8dm9pZCAwIT09dC5PVHJhbnNpdGlvbjt9KCksalF1ZXJ5LkNTUz17bmFtZTpcIm1iLkNTU0FuaW1hdGVcIixhdXRob3I6XCJNYXR0ZW8gQmljb2NjaGlcIix2ZXJzaW9uOlwiMi4wLjBcIix0cmFuc2l0aW9uRW5kOlwidHJhbnNpdGlvbkVuZFwiLHNmeDpcIlwiLGZpbHRlcnM6e2JsdXI6e21pbjowLG1heDoxMDAsdW5pdDpcInB4XCJ9LGJyaWdodG5lc3M6e21pbjowLG1heDo0MDAsdW5pdDpcIiVcIn0sY29udHJhc3Q6e21pbjowLG1heDo0MDAsdW5pdDpcIiVcIn0sZ3JheXNjYWxlOnttaW46MCxtYXg6MTAwLHVuaXQ6XCIlXCJ9LGh1ZVJvdGF0ZTp7bWluOjAsbWF4OjM2MCx1bml0OlwiZGVnXCJ9LGludmVydDp7bWluOjAsbWF4OjEwMCx1bml0OlwiJVwifSxzYXR1cmF0ZTp7bWluOjAsbWF4OjQwMCx1bml0OlwiJVwifSxzZXBpYTp7bWluOjAsbWF4OjEwMCx1bml0OlwiJVwifX0sbm9ybWFsaXplQ3NzOmZ1bmN0aW9uKGUpe3ZhciB0PWpRdWVyeS5leHRlbmQoITAse30sZSk7alF1ZXJ5LmJyb3dzZXIud2Via2l0fHxqUXVlcnkuYnJvd3Nlci5vcGVyYT9qUXVlcnkuQ1NTLnNmeD1cIi13ZWJraXQtXCI6alF1ZXJ5LmJyb3dzZXIubW96aWxsYT9qUXVlcnkuQ1NTLnNmeD1cIi1tb3otXCI6alF1ZXJ5LmJyb3dzZXIubXNpZSYmKGpRdWVyeS5DU1Muc2Z4PVwiLW1zLVwiKTtmb3IodmFyIHIgaW4gdCl7XCJ0cmFuc2Zvcm1cIj09PXImJih0W2pRdWVyeS5DU1Muc2Z4K1widHJhbnNmb3JtXCJdPXRbcl0sZGVsZXRlIHRbcl0pLFwidHJhbnNmb3JtLW9yaWdpblwiPT09ciYmKHRbalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm0tb3JpZ2luXCJdPWVbcl0sZGVsZXRlIHRbcl0pLFwiZmlsdGVyXCIhPT1yfHxqUXVlcnkuYnJvd3Nlci5tb3ppbGxhfHwodFtqUXVlcnkuQ1NTLnNmeCtcImZpbHRlclwiXT1lW3JdLGRlbGV0ZSB0W3JdKSxcImJsdXJcIj09PXImJnNldEZpbHRlcih0LFwiYmx1clwiLGVbcl0pLFwiYnJpZ2h0bmVzc1wiPT09ciYmc2V0RmlsdGVyKHQsXCJicmlnaHRuZXNzXCIsZVtyXSksXCJjb250cmFzdFwiPT09ciYmc2V0RmlsdGVyKHQsXCJjb250cmFzdFwiLGVbcl0pLFwiZ3JheXNjYWxlXCI9PT1yJiZzZXRGaWx0ZXIodCxcImdyYXlzY2FsZVwiLGVbcl0pLFwiaHVlUm90YXRlXCI9PT1yJiZzZXRGaWx0ZXIodCxcImh1ZVJvdGF0ZVwiLGVbcl0pLFwiaW52ZXJ0XCI9PT1yJiZzZXRGaWx0ZXIodCxcImludmVydFwiLGVbcl0pLFwic2F0dXJhdGVcIj09PXImJnNldEZpbHRlcih0LFwic2F0dXJhdGVcIixlW3JdKSxcInNlcGlhXCI9PT1yJiZzZXRGaWx0ZXIodCxcInNlcGlhXCIsZVtyXSk7dmFyIGk9XCJcIjtcInhcIj09PXImJihpPWpRdWVyeS5DU1Muc2Z4K1widHJhbnNmb3JtXCIsdFtpXT10W2ldfHxcIlwiLHRbaV0rPVwiIHRyYW5zbGF0ZVgoXCIrc2V0VW5pdChlW3JdLFwicHhcIikrXCIpXCIsZGVsZXRlIHRbcl0pLFwieVwiPT09ciYmKGk9alF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm1cIix0W2ldPXRbaV18fFwiXCIsdFtpXSs9XCIgdHJhbnNsYXRlWShcIitzZXRVbml0KGVbcl0sXCJweFwiKStcIilcIixkZWxldGUgdFtyXSksXCJ6XCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiB0cmFuc2xhdGVaKFwiK3NldFVuaXQoZVtyXSxcInB4XCIpK1wiKVwiLGRlbGV0ZSB0W3JdKSxcInJvdGF0ZVwiPT09ciYmKGk9alF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm1cIix0W2ldPXRbaV18fFwiXCIsdFtpXSs9XCIgcm90YXRlKFwiK3NldFVuaXQoZVtyXSxcImRlZ1wiKStcIilcIixkZWxldGUgdFtyXSksXCJyb3RhdGVYXCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiByb3RhdGVYKFwiK3NldFVuaXQoZVtyXSxcImRlZ1wiKStcIilcIixkZWxldGUgdFtyXSksXCJyb3RhdGVZXCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiByb3RhdGVZKFwiK3NldFVuaXQoZVtyXSxcImRlZ1wiKStcIilcIixkZWxldGUgdFtyXSksXCJyb3RhdGVaXCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiByb3RhdGVaKFwiK3NldFVuaXQoZVtyXSxcImRlZ1wiKStcIilcIixkZWxldGUgdFtyXSksXCJzY2FsZVwiPT09ciYmKGk9alF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm1cIix0W2ldPXRbaV18fFwiXCIsdFtpXSs9XCIgc2NhbGUoXCIrc2V0VW5pdChlW3JdLFwiXCIpK1wiKVwiLGRlbGV0ZSB0W3JdKSxcInNjYWxlWFwiPT09ciYmKGk9alF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm1cIix0W2ldPXRbaV18fFwiXCIsdFtpXSs9XCIgc2NhbGVYKFwiK3NldFVuaXQoZVtyXSxcIlwiKStcIilcIixkZWxldGUgdFtyXSksXCJzY2FsZVlcIj09PXImJihpPWpRdWVyeS5DU1Muc2Z4K1widHJhbnNmb3JtXCIsdFtpXT10W2ldfHxcIlwiLHRbaV0rPVwiIHNjYWxlWShcIitzZXRVbml0KGVbcl0sXCJcIikrXCIpXCIsZGVsZXRlIHRbcl0pLFwic2NhbGVaXCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiBzY2FsZVooXCIrc2V0VW5pdChlW3JdLFwiXCIpK1wiKVwiLGRlbGV0ZSB0W3JdKSxcInNrZXdcIj09PXImJihpPWpRdWVyeS5DU1Muc2Z4K1widHJhbnNmb3JtXCIsdFtpXT10W2ldfHxcIlwiLHRbaV0rPVwiIHNrZXcoXCIrc2V0VW5pdChlW3JdLFwiZGVnXCIpK1wiKVwiLGRlbGV0ZSB0W3JdKSxcInNrZXdYXCI9PT1yJiYoaT1qUXVlcnkuQ1NTLnNmeCtcInRyYW5zZm9ybVwiLHRbaV09dFtpXXx8XCJcIix0W2ldKz1cIiBza2V3WChcIitzZXRVbml0KGVbcl0sXCJkZWdcIikrXCIpXCIsZGVsZXRlIHRbcl0pLFwic2tld1lcIj09PXImJihpPWpRdWVyeS5DU1Muc2Z4K1widHJhbnNmb3JtXCIsdFtpXT10W2ldfHxcIlwiLHRbaV0rPVwiIHNrZXdZKFwiK3NldFVuaXQoZVtyXSxcImRlZ1wiKStcIilcIixkZWxldGUgdFtyXSksXCJwZXJzcGVjdGl2ZVwiPT09ciYmKGk9alF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2Zvcm1cIix0W2ldPXRbaV18fFwiXCIsdFtpXSs9XCIgcGVyc3BlY3RpdmUoXCIrc2V0VW5pdChlW3JdLFwicHhcIikrXCIpXCIsZGVsZXRlIHRbcl0pO31yZXR1cm4gdDt9LGdldFByb3A6ZnVuY3Rpb24oZSl7dmFyIHQ9W107Zm9yKHZhciByIGluIGUpdC5pbmRleE9mKHIpPDAmJnQucHVzaCh1bmNhbWVsKHIpKTtyZXR1cm4gdC5qb2luKFwiLFwiKTt9LGFuaW1hdGU6ZnVuY3Rpb24oZSx0LHIsaSxuKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcygpe3UuY2FsbGVkPSEwLHUuQ1NTQUlzUnVubmluZz0hMSxhLm9mZihqUXVlcnkuQ1NTLnRyYW5zaXRpb25FbmQrXCIuXCIrdS5pZCksY2xlYXJUaW1lb3V0KHUudGltZW91dCksYS5jc3MoalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2l0aW9uXCIsXCJcIiksXCJmdW5jdGlvblwiPT10eXBlb2YgbiYmbi5hcHBseSh1KSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LkNTU3F1ZXVlJiYodS5DU1NxdWV1ZSgpLHUuQ1NTcXVldWU9bnVsbCk7fXZhciB1PXRoaXMsYT1qUXVlcnkodGhpcyk7dS5pZD11LmlkfHxcIkNTU0FfXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCk7dmFyIG89b3x8e3R5cGU6XCJub0V2ZW50XCJ9O2lmKHUuQ1NTQUlzUnVubmluZyYmdS5ldmVudFR5cGU9PW8udHlwZSYmIWpRdWVyeS5icm93c2VyLm1zaWUmJmpRdWVyeS5icm93c2VyLnZlcnNpb248PTkpcmV0dXJuIHZvaWQodS5DU1NxdWV1ZT1mdW5jdGlvbigpe2EuQ1NTQW5pbWF0ZShlLHQscixpLG4pO30pO2lmKHUuQ1NTcXVldWU9bnVsbCx1LmV2ZW50VHlwZT1vLnR5cGUsMCE9PWEubGVuZ3RoJiZlKXtpZihlPWpRdWVyeS5ub3JtYWxpemVDc3MoZSksdS5DU1NBSXNSdW5uaW5nPSEwLFwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJihuPXQsdD1qUXVlcnkuZnguc3BlZWRzLl9kZWZhdWx0KSxcImZ1bmN0aW9uXCI9PXR5cGVvZiByJiYoaT1yLHI9MCksXCJzdHJpbmdcIj09dHlwZW9mIHImJihuPXIscj0wKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBpJiYobj1pLGk9XCJjdWJpYy1iZXppZXIoMC42NSwwLjAzLDAuMzYsMC43MilcIiksXCJzdHJpbmdcIj09dHlwZW9mIHQpZm9yKHZhciBmIGluIGpRdWVyeS5meC5zcGVlZHMpe2lmKHQ9PWYpe3Q9alF1ZXJ5LmZ4LnNwZWVkc1tmXTticmVhazt9dD1qUXVlcnkuZnguc3BlZWRzLl9kZWZhdWx0O31pZih0fHwodD1qUXVlcnkuZnguc3BlZWRzLl9kZWZhdWx0KSxcInN0cmluZ1wiPT10eXBlb2YgbiYmKGk9bixuPW51bGwpLCFqUXVlcnkuc3VwcG9ydC5DU1N0cmFuc2l0aW9uKXtmb3IodmFyIGMgaW4gZSl7aWYoXCJ0cmFuc2Zvcm1cIj09PWMmJmRlbGV0ZSBlW2NdLFwiZmlsdGVyXCI9PT1jJiZkZWxldGUgZVtjXSxcInRyYW5zZm9ybS1vcmlnaW5cIj09PWMmJmRlbGV0ZSBlW2NdLFwiYXV0b1wiPT09ZVtjXSYmZGVsZXRlIGVbY10sXCJ4XCI9PT1jKXt2YXIgUz1lW2NdLGw9XCJsZWZ0XCI7ZVtsXT1TLGRlbGV0ZSBlW2NdO31pZihcInlcIj09PWMpe3ZhciBTPWVbY10sbD1cInRvcFwiO2VbbF09UyxkZWxldGUgZVtjXTt9KFwiLW1zLXRyYW5zZm9ybVwiPT09Y3x8XCItbXMtZmlsdGVyXCI9PT1jKSYmZGVsZXRlIGVbY107fXJldHVybiB2b2lkIGEuZGVsYXkocikuYW5pbWF0ZShlLHQsbik7fXZhciB5PXtcImRlZmF1bHRcIjpcImVhc2VcIixcImluXCI6XCJlYXNlLWluXCIsb3V0OlwiZWFzZS1vdXRcIixcImluLW91dFwiOlwiZWFzZS1pbi1vdXRcIixzbmFwOlwiY3ViaWMtYmV6aWVyKDAsMSwuNSwxKVwiLGVhc2VPdXRDdWJpYzpcImN1YmljLWJlemllciguMjE1LC42MSwuMzU1LDEpXCIsZWFzZUluT3V0Q3ViaWM6XCJjdWJpYy1iZXppZXIoLjY0NSwuMDQ1LC4zNTUsMSlcIixlYXNlSW5DaXJjOlwiY3ViaWMtYmV6aWVyKC42LC4wNCwuOTgsLjMzNSlcIixlYXNlT3V0Q2lyYzpcImN1YmljLWJlemllciguMDc1LC44MiwuMTY1LDEpXCIsZWFzZUluT3V0Q2lyYzpcImN1YmljLWJlemllciguNzg1LC4xMzUsLjE1LC44NilcIixlYXNlSW5FeHBvOlwiY3ViaWMtYmV6aWVyKC45NSwuMDUsLjc5NSwuMDM1KVwiLGVhc2VPdXRFeHBvOlwiY3ViaWMtYmV6aWVyKC4xOSwxLC4yMiwxKVwiLGVhc2VJbk91dEV4cG86XCJjdWJpYy1iZXppZXIoMSwwLDAsMSlcIixlYXNlSW5RdWFkOlwiY3ViaWMtYmV6aWVyKC41NSwuMDg1LC42OCwuNTMpXCIsZWFzZU91dFF1YWQ6XCJjdWJpYy1iZXppZXIoLjI1LC40NiwuNDUsLjk0KVwiLGVhc2VJbk91dFF1YWQ6XCJjdWJpYy1iZXppZXIoLjQ1NSwuMDMsLjUxNSwuOTU1KVwiLGVhc2VJblF1YXJ0OlwiY3ViaWMtYmV6aWVyKC44OTUsLjAzLC42ODUsLjIyKVwiLGVhc2VPdXRRdWFydDpcImN1YmljLWJlemllciguMTY1LC44NCwuNDQsMSlcIixlYXNlSW5PdXRRdWFydDpcImN1YmljLWJlemllciguNzcsMCwuMTc1LDEpXCIsZWFzZUluUXVpbnQ6XCJjdWJpYy1iZXppZXIoLjc1NSwuMDUsLjg1NSwuMDYpXCIsZWFzZU91dFF1aW50OlwiY3ViaWMtYmV6aWVyKC4yMywxLC4zMiwxKVwiLGVhc2VJbk91dFF1aW50OlwiY3ViaWMtYmV6aWVyKC44NiwwLC4wNywxKVwiLGVhc2VJblNpbmU6XCJjdWJpYy1iZXppZXIoLjQ3LDAsLjc0NSwuNzE1KVwiLGVhc2VPdXRTaW5lOlwiY3ViaWMtYmV6aWVyKC4zOSwuNTc1LC41NjUsMSlcIixlYXNlSW5PdXRTaW5lOlwiY3ViaWMtYmV6aWVyKC40NDUsLjA1LC41NSwuOTUpXCIsZWFzZUluQmFjazpcImN1YmljLWJlemllciguNiwtLjI4LC43MzUsLjA0NSlcIixlYXNlT3V0QmFjazpcImN1YmljLWJlemllciguMTc1LCAuODg1LC4zMiwxLjI3NSlcIixlYXNlSW5PdXRCYWNrOlwiY3ViaWMtYmV6aWVyKC42OCwtLjU1LC4yNjUsMS41NSlcIn07eVtpXSYmKGk9eVtpXSksYS5vZmYoalF1ZXJ5LkNTUy50cmFuc2l0aW9uRW5kK1wiLlwiK3UuaWQpO3ZhciBtPWpRdWVyeS5DU1MuZ2V0UHJvcChlKSxkPXt9O2pRdWVyeS5leHRlbmQoZCxlKSxkW2pRdWVyeS5DU1Muc2Z4K1widHJhbnNpdGlvbi1wcm9wZXJ0eVwiXT1tLGRbalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2l0aW9uLWR1cmF0aW9uXCJdPXQrXCJtc1wiLGRbalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2l0aW9uLWRlbGF5XCJdPXIrXCJtc1wiLGRbalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvblwiXT1pLHNldFRpbWVvdXQoZnVuY3Rpb24oKXthLm9uZShqUXVlcnkuQ1NTLnRyYW5zaXRpb25FbmQrXCIuXCIrdS5pZCxzKSxhLmNzcyhkKTt9LDEpLHUudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7cmV0dXJuIHUuY2FsbGVkfHwhbj8odS5jYWxsZWQ9ITEsdm9pZCh1LkNTU0FJc1J1bm5pbmc9ITEpKTooYS5jc3MoalF1ZXJ5LkNTUy5zZngrXCJ0cmFuc2l0aW9uXCIsXCJcIiksbi5hcHBseSh1KSx1LkNTU0FJc1J1bm5pbmc9ITEsdm9pZChcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LkNTU3F1ZXVlJiYodS5DU1NxdWV1ZSgpLHUuQ1NTcXVldWU9bnVsbCkpKTt9LHQrcisxMCk7fX0pO319LGpRdWVyeS5mbi5DU1NBbmltYXRlPWpRdWVyeS5DU1MuYW5pbWF0ZSxqUXVlcnkubm9ybWFsaXplQ3NzPWpRdWVyeS5DU1Mubm9ybWFsaXplQ3NzLGpRdWVyeS5mbi5jc3MzPWZ1bmN0aW9uKGUpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1qUXVlcnkodGhpcykscj1qUXVlcnkubm9ybWFsaXplQ3NzKGUpO3QuY3NzKHIpO30pO307XG4vKl9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuIF8ganF1ZXJ5Lm1iLmNvbXBvbmVudHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBmaWxlOiBqcXVlcnkubWIuYnJvd3Nlci5taW4uanMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gbGFzdCBtb2RpZmllZDogMjQvMDUvMTcgMTkuNTYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBPcGVuIExhYiBzLnIubC4sIEZsb3JlbmNlIC0gSXRhbHkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGVtYWlsOiBtYXR0ZW9Ab3Blbi1sYWIuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBzaXRlOiBodHRwOi8vcHVwdW56aS5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgaHR0cDovL29wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGJsb2c6IGh0dHA6Ly9wdXB1bnppLm9wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBRJkE6ICBodHRwOi8vanF1ZXJ5LnB1cHVuemkuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIExpY2VuY2VzOiBNSVQsIEdQTCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC5odG1sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBDb3B5cmlnaHQgKGMpIDIwMDEtMjAxNy4gTWF0dGVvIEJpY29jY2hpIChQdXB1bnppKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXyovXG5cbnZhciBuQWd0PW5hdmlnYXRvci51c2VyQWdlbnQ7alF1ZXJ5LmJyb3dzZXI9alF1ZXJ5LmJyb3dzZXJ8fHt9O2pRdWVyeS5icm93c2VyLm1vemlsbGE9ITE7alF1ZXJ5LmJyb3dzZXIud2Via2l0PSExO2pRdWVyeS5icm93c2VyLm9wZXJhPSExO2pRdWVyeS5icm93c2VyLnNhZmFyaT0hMTtqUXVlcnkuYnJvd3Nlci5jaHJvbWU9ITE7alF1ZXJ5LmJyb3dzZXIuYW5kcm9pZFN0b2NrPSExO2pRdWVyeS5icm93c2VyLm1zaWU9ITE7alF1ZXJ5LmJyb3dzZXIuZWRnZT0hMTtqUXVlcnkuYnJvd3Nlci51YT1uQWd0O2Z1bmN0aW9uIGlzVG91Y2hTdXBwb3J0ZWQoKXt2YXIgYT1uQWd0Lm1zTWF4VG91Y2hQb2ludHMsZT1cIm9udG91Y2hzdGFydFwiaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtyZXR1cm4gYXx8ZT8hMDohMTt9XG52YXIgZ2V0T1M9ZnVuY3Rpb24oKXt2YXIgYT17dmVyc2lvbjpcIlVua25vd24gdmVyc2lvblwiLG5hbWU6XCJVbmtub3duIE9TXCJ9Oy0xIT1uYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiV2luXCIpJiYoYS5uYW1lPVwiV2luZG93c1wiKTstMSE9bmF2aWdhdG9yLmFwcFZlcnNpb24uaW5kZXhPZihcIk1hY1wiKSYmMD5uYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiTW9iaWxlXCIpJiYoYS5uYW1lPVwiTWFjXCIpOy0xIT1uYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKFwiTGludXhcIikmJihhLm5hbWU9XCJMaW51eFwiKTsvTWFjIE9TIFgvLnRlc3QobkFndCkmJiEvTW9iaWxlLy50ZXN0KG5BZ3QpJiYoYS52ZXJzaW9uPS9NYWMgT1MgWCAoMTBbXFwuXFxfXFxkXSspLy5leGVjKG5BZ3QpWzFdLGEudmVyc2lvbj1hLnZlcnNpb24ucmVwbGFjZSgvXy9nLFwiLlwiKS5zdWJzdHJpbmcoMCw1KSk7L1dpbmRvd3MvLnRlc3QobkFndCkmJihhLnZlcnNpb249XCJVbmtub3duLlVua25vd25cIik7L1dpbmRvd3MgTlQgNS4xLy50ZXN0KG5BZ3QpJiZcbihhLnZlcnNpb249XCI1LjFcIik7L1dpbmRvd3MgTlQgNi4wLy50ZXN0KG5BZ3QpJiYoYS52ZXJzaW9uPVwiNi4wXCIpOy9XaW5kb3dzIE5UIDYuMS8udGVzdChuQWd0KSYmKGEudmVyc2lvbj1cIjYuMVwiKTsvV2luZG93cyBOVCA2LjIvLnRlc3QobkFndCkmJihhLnZlcnNpb249XCI2LjJcIik7L1dpbmRvd3MgTlQgMTAuMC8udGVzdChuQWd0KSYmKGEudmVyc2lvbj1cIjEwLjBcIik7L0xpbnV4Ly50ZXN0KG5BZ3QpJiYvTGludXgvLnRlc3QobkFndCkmJihhLnZlcnNpb249XCJVbmtub3duLlVua25vd25cIik7YS5uYW1lPWEubmFtZS50b0xvd2VyQ2FzZSgpO2EubWFqb3JfdmVyc2lvbj1cIlVua25vd25cIjthLm1pbm9yX3ZlcnNpb249XCJVbmtub3duXCI7XCJVbmtub3duLlVua25vd25cIiE9YS52ZXJzaW9uJiYoYS5tYWpvcl92ZXJzaW9uPXBhcnNlRmxvYXQoYS52ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSksYS5taW5vcl92ZXJzaW9uPXBhcnNlRmxvYXQoYS52ZXJzaW9uLnNwbGl0KFwiLlwiKVsxXSkpO3JldHVybiBhO307XG5qUXVlcnkuYnJvd3Nlci5vcz1nZXRPUygpO2pRdWVyeS5icm93c2VyLmhhc1RvdWNoPWlzVG91Y2hTdXBwb3J0ZWQoKTtqUXVlcnkuYnJvd3Nlci5uYW1lPW5hdmlnYXRvci5hcHBOYW1lO2pRdWVyeS5icm93c2VyLmZ1bGxWZXJzaW9uPVwiXCIrcGFyc2VGbG9hdChuYXZpZ2F0b3IuYXBwVmVyc2lvbik7alF1ZXJ5LmJyb3dzZXIubWFqb3JWZXJzaW9uPXBhcnNlSW50KG5hdmlnYXRvci5hcHBWZXJzaW9uLDEwKTt2YXIgbmFtZU9mZnNldCx2ZXJPZmZzZXQsaXg7XG5pZigtMSE9KHZlck9mZnNldD1uQWd0LmluZGV4T2YoXCJPcGVyYVwiKSkpalF1ZXJ5LmJyb3dzZXIub3BlcmE9ITAsalF1ZXJ5LmJyb3dzZXIubmFtZT1cIk9wZXJhXCIsalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzYpLC0xIT0odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIlZlcnNpb25cIikpJiYoalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzgpKTtlbHNlIGlmKC0xIT0odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIk9QUlwiKSkpalF1ZXJ5LmJyb3dzZXIub3BlcmE9ITAsalF1ZXJ5LmJyb3dzZXIubmFtZT1cIk9wZXJhXCIsalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzQpO2Vsc2UgaWYoLTEhPSh2ZXJPZmZzZXQ9bkFndC5pbmRleE9mKFwiTVNJRVwiKSkpalF1ZXJ5LmJyb3dzZXIubXNpZT0hMCxqUXVlcnkuYnJvd3Nlci5uYW1lPVwiTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyXCIsXG5cdFx0alF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzUpO2Vsc2UgaWYoLTEhPW5BZ3QuaW5kZXhPZihcIlRyaWRlbnRcIikpe2pRdWVyeS5icm93c2VyLm1zaWU9ITA7alF1ZXJ5LmJyb3dzZXIubmFtZT1cIk1pY3Jvc29mdCBJbnRlcm5ldCBFeHBsb3JlclwiO3ZhciBzdGFydD1uQWd0LmluZGV4T2YoXCJydjpcIikrMyxlbmQ9c3RhcnQrNDtqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbj1uQWd0LnN1YnN0cmluZyhzdGFydCxlbmQpO31lbHNlLTEhPSh2ZXJPZmZzZXQ9bkFndC5pbmRleE9mKFwiRWRnZVwiKSk/KGpRdWVyeS5icm93c2VyLmVkZ2U9ITAsalF1ZXJ5LmJyb3dzZXIubmFtZT1cIk1pY3Jvc29mdCBFZGdlXCIsalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzUpKTotMSE9KHZlck9mZnNldD1uQWd0LmluZGV4T2YoXCJDaHJvbWVcIikpPyhqUXVlcnkuYnJvd3Nlci53ZWJraXQ9ITAsalF1ZXJ5LmJyb3dzZXIuY2hyb21lPVxuXHRcdCEwLGpRdWVyeS5icm93c2VyLm5hbWU9XCJDaHJvbWVcIixqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbj1uQWd0LnN1YnN0cmluZyh2ZXJPZmZzZXQrNykpOi0xPG5BZ3QuaW5kZXhPZihcIm1vemlsbGEvNS4wXCIpJiYtMTxuQWd0LmluZGV4T2YoXCJhbmRyb2lkIFwiKSYmLTE8bkFndC5pbmRleE9mKFwiYXBwbGV3ZWJraXRcIikmJiEoLTE8bkFndC5pbmRleE9mKFwiY2hyb21lXCIpKT8odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIkNocm9tZVwiKSxqUXVlcnkuYnJvd3Nlci53ZWJraXQ9ITAsalF1ZXJ5LmJyb3dzZXIuYW5kcm9pZFN0b2NrPSEwLGpRdWVyeS5icm93c2VyLm5hbWU9XCJhbmRyb2lkU3RvY2tcIixqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbj1uQWd0LnN1YnN0cmluZyh2ZXJPZmZzZXQrNykpOi0xIT0odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIlNhZmFyaVwiKSk/KGpRdWVyeS5icm93c2VyLndlYmtpdD0hMCxqUXVlcnkuYnJvd3Nlci5zYWZhcmk9ITAsalF1ZXJ5LmJyb3dzZXIubmFtZT1cblx0XHRcIlNhZmFyaVwiLGpRdWVyeS5icm93c2VyLmZ1bGxWZXJzaW9uPW5BZ3Quc3Vic3RyaW5nKHZlck9mZnNldCs3KSwtMSE9KHZlck9mZnNldD1uQWd0LmluZGV4T2YoXCJWZXJzaW9uXCIpKSYmKGpRdWVyeS5icm93c2VyLmZ1bGxWZXJzaW9uPW5BZ3Quc3Vic3RyaW5nKHZlck9mZnNldCs4KSkpOi0xIT0odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIkFwcGxlV2Via2l0XCIpKT8oalF1ZXJ5LmJyb3dzZXIud2Via2l0PSEwLGpRdWVyeS5icm93c2VyLnNhZmFyaT0hMCxqUXVlcnkuYnJvd3Nlci5uYW1lPVwiU2FmYXJpXCIsalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzcpLC0xIT0odmVyT2Zmc2V0PW5BZ3QuaW5kZXhPZihcIlZlcnNpb25cIikpJiYoalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzgpKSk6LTEhPSh2ZXJPZmZzZXQ9bkFndC5pbmRleE9mKFwiRmlyZWZveFwiKSk/KGpRdWVyeS5icm93c2VyLm1vemlsbGE9XG5cdFx0ITAsalF1ZXJ5LmJyb3dzZXIubmFtZT1cIkZpcmVmb3hcIixqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbj1uQWd0LnN1YnN0cmluZyh2ZXJPZmZzZXQrOCkpOihuYW1lT2Zmc2V0PW5BZ3QubGFzdEluZGV4T2YoXCIgXCIpKzEpPCh2ZXJPZmZzZXQ9bkFndC5sYXN0SW5kZXhPZihcIi9cIikpJiYoalF1ZXJ5LmJyb3dzZXIubmFtZT1uQWd0LnN1YnN0cmluZyhuYW1lT2Zmc2V0LHZlck9mZnNldCksalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249bkFndC5zdWJzdHJpbmcodmVyT2Zmc2V0KzEpLGpRdWVyeS5icm93c2VyLm5hbWUudG9Mb3dlckNhc2UoKT09alF1ZXJ5LmJyb3dzZXIubmFtZS50b1VwcGVyQ2FzZSgpJiYoalF1ZXJ5LmJyb3dzZXIubmFtZT1uYXZpZ2F0b3IuYXBwTmFtZSkpO1xuLTEhPShpeD1qUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbi5pbmRleE9mKFwiO1wiKSkmJihqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbj1qUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbi5zdWJzdHJpbmcoMCxpeCkpOy0xIT0oaXg9alF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb24uaW5kZXhPZihcIiBcIikpJiYoalF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb249alF1ZXJ5LmJyb3dzZXIuZnVsbFZlcnNpb24uc3Vic3RyaW5nKDAsaXgpKTtqUXVlcnkuYnJvd3Nlci5tYWpvclZlcnNpb249cGFyc2VJbnQoXCJcIitqUXVlcnkuYnJvd3Nlci5mdWxsVmVyc2lvbiwxMCk7aXNOYU4oalF1ZXJ5LmJyb3dzZXIubWFqb3JWZXJzaW9uKSYmKGpRdWVyeS5icm93c2VyLmZ1bGxWZXJzaW9uPVwiXCIrcGFyc2VGbG9hdChuYXZpZ2F0b3IuYXBwVmVyc2lvbiksalF1ZXJ5LmJyb3dzZXIubWFqb3JWZXJzaW9uPXBhcnNlSW50KG5hdmlnYXRvci5hcHBWZXJzaW9uLDEwKSk7XG5qUXVlcnkuYnJvd3Nlci52ZXJzaW9uPWpRdWVyeS5icm93c2VyLm1ham9yVmVyc2lvbjtqUXVlcnkuYnJvd3Nlci5hbmRyb2lkPS9BbmRyb2lkL2kudGVzdChuQWd0KTtqUXVlcnkuYnJvd3Nlci5ibGFja2JlcnJ5PS9CbGFja0JlcnJ5fEJCfFBsYXlCb29rL2kudGVzdChuQWd0KTtqUXVlcnkuYnJvd3Nlci5pb3M9L2lQaG9uZXxpUGFkfGlQb2R8d2ViT1MvaS50ZXN0KG5BZ3QpO2pRdWVyeS5icm93c2VyLm9wZXJhTW9iaWxlPS9PcGVyYSBNaW5pL2kudGVzdChuQWd0KTtqUXVlcnkuYnJvd3Nlci53aW5kb3dzTW9iaWxlPS9JRU1vYmlsZXxXaW5kb3dzIFBob25lL2kudGVzdChuQWd0KTtqUXVlcnkuYnJvd3Nlci5raW5kbGU9L0tpbmRsZXxTaWxrL2kudGVzdChuQWd0KTtcbmpRdWVyeS5icm93c2VyLm1vYmlsZT1qUXVlcnkuYnJvd3Nlci5hbmRyb2lkfHxqUXVlcnkuYnJvd3Nlci5ibGFja2JlcnJ5fHxqUXVlcnkuYnJvd3Nlci5pb3N8fGpRdWVyeS5icm93c2VyLndpbmRvd3NNb2JpbGV8fGpRdWVyeS5icm93c2VyLm9wZXJhTW9iaWxlfHxqUXVlcnkuYnJvd3Nlci5raW5kbGU7alF1ZXJ5LmlzTW9iaWxlPWpRdWVyeS5icm93c2VyLm1vYmlsZTtqUXVlcnkuaXNUYWJsZXQ9alF1ZXJ5LmJyb3dzZXIubW9iaWxlJiY3NjU8alF1ZXJ5KHdpbmRvdykud2lkdGgoKTtqUXVlcnkuaXNBbmRyb2lkRGVmYXVsdD1qUXVlcnkuYnJvd3Nlci5hbmRyb2lkJiYhL2Nocm9tZS9pLnRlc3QobkFndCk7alF1ZXJ5Lm1iQnJvd3Nlcj1qUXVlcnkuYnJvd3NlcjtcbmpRdWVyeS5icm93c2VyLnZlcnNpb25Db21wYXJlPWZ1bmN0aW9uKGEsZSl7aWYoXCJzdHJpbmdzdHJpbmdcIiE9dHlwZW9mIGErdHlwZW9mIGUpcmV0dXJuITE7Zm9yKHZhciBjPWEuc3BsaXQoXCIuXCIpLGQ9ZS5zcGxpdChcIi5cIiksYj0wLGY9TWF0aC5tYXgoYy5sZW5ndGgsZC5sZW5ndGgpO2I8ZjtiKyspe2lmKGNbYl0mJiFkW2JdJiYwPHBhcnNlSW50KGNbYl0pfHxwYXJzZUludChjW2JdKT5wYXJzZUludChkW2JdKSlyZXR1cm4gMTtpZihkW2JdJiYhY1tiXSYmMDxwYXJzZUludChkW2JdKXx8cGFyc2VJbnQoY1tiXSk8cGFyc2VJbnQoZFtiXSkpcmV0dXJuLTE7fXJldHVybiAwO307XG4vKl9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX1xuIF8ganF1ZXJ5Lm1iLmNvbXBvbmVudHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBmaWxlOiBqcXVlcnkubWIuc2ltcGxlU2xpZGVyLm1pbi5qcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gbGFzdCBtb2RpZmllZDogMDkvMDUvMTcgMTkuMzEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBPcGVuIExhYiBzLnIubC4sIEZsb3JlbmNlIC0gSXRhbHkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGVtYWlsOiBtYXR0ZW9Ab3Blbi1sYWIuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBzaXRlOiBodHRwOi8vcHVwdW56aS5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgaHR0cDovL29wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGJsb2c6IGh0dHA6Ly9wdXB1bnppLm9wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBRJkE6ICBodHRwOi8vanF1ZXJ5LnB1cHVuemkuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIExpY2VuY2VzOiBNSVQsIEdQTCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgaHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2dwbC5odG1sICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBDb3B5cmlnaHQgKGMpIDIwMDEtMjAxNy4gTWF0dGVvIEJpY29jY2hpIChQdXB1bnppKTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF9fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fXyovXG5cbihmdW5jdGlvbihiKXtiLnNpbXBsZVNsaWRlcj17ZGVmYXVsdHM6e2luaXRpYWx2YWw6MCxzY2FsZToxMDAsb3JpZW50YXRpb246XCJoXCIscmVhZG9ubHk6ITEsY2FsbGJhY2s6ITF9LGV2ZW50czp7c3RhcnQ6Yi5icm93c2VyLm1vYmlsZT9cInRvdWNoc3RhcnRcIjpcIm1vdXNlZG93blwiLGVuZDpiLmJyb3dzZXIubW9iaWxlP1widG91Y2hlbmRcIjpcIm1vdXNldXBcIixtb3ZlOmIuYnJvd3Nlci5tb2JpbGU/XCJ0b3VjaG1vdmVcIjpcIm1vdXNlbW92ZVwifSxpbml0OmZ1bmN0aW9uKGMpe3JldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYT10aGlzLGQ9YihhKTtkLmFkZENsYXNzKFwic2ltcGxlU2xpZGVyXCIpO2Eub3B0PXt9O2IuZXh0ZW5kKGEub3B0LGIuc2ltcGxlU2xpZGVyLmRlZmF1bHRzLGMpO2IuZXh0ZW5kKGEub3B0LGQuZGF0YSgpKTt2YXIgZT1cImhcIj09YS5vcHQub3JpZW50YXRpb24/XCJob3Jpem9udGFsXCI6XCJ2ZXJ0aWNhbFwiLGU9YihcIjxkaXYvPlwiKS5hZGRDbGFzcyhcImxldmVsXCIpLmFkZENsYXNzKGUpO1xuXHRkLnByZXBlbmQoZSk7YS5sZXZlbD1lO2QuY3NzKHtjdXJzb3I6XCJkZWZhdWx0XCJ9KTtcImF1dG9cIj09YS5vcHQuc2NhbGUmJihhLm9wdC5zY2FsZT1iKGEpLm91dGVyV2lkdGgoKSk7ZC51cGRhdGVTbGlkZXJWYWwoKTthLm9wdC5yZWFkb25seXx8KGQub24oYi5zaW1wbGVTbGlkZXIuZXZlbnRzLnN0YXJ0LGZ1bmN0aW9uKGMpe2IuYnJvd3Nlci5tb2JpbGUmJihjPWMuY2hhbmdlZFRvdWNoZXNbMF0pO2EuY2FuU2xpZGU9ITA7ZC51cGRhdGVTbGlkZXJWYWwoYyk7XCJoXCI9PWEub3B0Lm9yaWVudGF0aW9uP2QuY3NzKHtjdXJzb3I6XCJjb2wtcmVzaXplXCJ9KTpkLmNzcyh7Y3Vyc29yOlwicm93LXJlc2l6ZVwifSk7Yy5wcmV2ZW50RGVmYXVsdCgpO2Muc3RvcFByb3BhZ2F0aW9uKCk7fSksYihkb2N1bWVudCkub24oYi5zaW1wbGVTbGlkZXIuZXZlbnRzLm1vdmUsZnVuY3Rpb24oYyl7Yi5icm93c2VyLm1vYmlsZSYmKGM9Yy5jaGFuZ2VkVG91Y2hlc1swXSk7YS5jYW5TbGlkZSYmKGIoZG9jdW1lbnQpLmNzcyh7Y3Vyc29yOlwiZGVmYXVsdFwifSksXG5cdFx0XHRkLnVwZGF0ZVNsaWRlclZhbChjKSxjLnByZXZlbnREZWZhdWx0KCksYy5zdG9wUHJvcGFnYXRpb24oKSk7fSkub24oYi5zaW1wbGVTbGlkZXIuZXZlbnRzLmVuZCxmdW5jdGlvbigpe2IoZG9jdW1lbnQpLmNzcyh7Y3Vyc29yOlwiYXV0b1wifSk7YS5jYW5TbGlkZT0hMTtkLmNzcyh7Y3Vyc29yOlwiYXV0b1wifSk7fSkpO30pO30sdXBkYXRlU2xpZGVyVmFsOmZ1bmN0aW9uKGMpe3ZhciBhPXRoaXMuZ2V0KDApO2lmKGEub3B0KXthLm9wdC5pbml0aWFsdmFsPVwibnVtYmVyXCI9PXR5cGVvZiBhLm9wdC5pbml0aWFsdmFsP2Eub3B0LmluaXRpYWx2YWw6YS5vcHQuaW5pdGlhbHZhbChhKTt2YXIgZD1iKGEpLm91dGVyV2lkdGgoKSxlPWIoYSkub3V0ZXJIZWlnaHQoKTthLng9XCJvYmplY3RcIj09dHlwZW9mIGM/Yy5jbGllbnRYK2RvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdC10aGlzLm9mZnNldCgpLmxlZnQ6XCJudW1iZXJcIj09dHlwZW9mIGM/YypkL2Eub3B0LnNjYWxlOmEub3B0LmluaXRpYWx2YWwqZC9hLm9wdC5zY2FsZTtcblx0YS55PVwib2JqZWN0XCI9PXR5cGVvZiBjP2MuY2xpZW50WStkb2N1bWVudC5ib2R5LnNjcm9sbFRvcC10aGlzLm9mZnNldCgpLnRvcDpcIm51bWJlclwiPT10eXBlb2YgYz8oYS5vcHQuc2NhbGUtYS5vcHQuaW5pdGlhbHZhbC1jKSplL2Eub3B0LnNjYWxlOmEub3B0LmluaXRpYWx2YWwqZS9hLm9wdC5zY2FsZTthLnk9dGhpcy5vdXRlckhlaWdodCgpLWEueTthLnNjYWxlWD1hLngqYS5vcHQuc2NhbGUvZDthLnNjYWxlWT1hLnkqYS5vcHQuc2NhbGUvZTthLm91dE9mUmFuZ2VYPWEuc2NhbGVYPmEub3B0LnNjYWxlP2Euc2NhbGVYLWEub3B0LnNjYWxlOjA+YS5zY2FsZVg/YS5zY2FsZVg6MDthLm91dE9mUmFuZ2VZPWEuc2NhbGVZPmEub3B0LnNjYWxlP2Euc2NhbGVZLWEub3B0LnNjYWxlOjA+YS5zY2FsZVk/YS5zY2FsZVk6MDthLm91dE9mUmFuZ2U9XCJoXCI9PWEub3B0Lm9yaWVudGF0aW9uP2Eub3V0T2ZSYW5nZVg6YS5vdXRPZlJhbmdlWTthLnZhbHVlPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBjP1xuXHRcdFx0XHRcdFwiaFwiPT1hLm9wdC5vcmllbnRhdGlvbj9hLng+PXRoaXMub3V0ZXJXaWR0aCgpP2Eub3B0LnNjYWxlOjA+PWEueD8wOmEuc2NhbGVYOmEueT49dGhpcy5vdXRlckhlaWdodCgpP2Eub3B0LnNjYWxlOjA+PWEueT8wOmEuc2NhbGVZOlwiaFwiPT1hLm9wdC5vcmllbnRhdGlvbj9hLnNjYWxlWDphLnNjYWxlWTtcImhcIj09YS5vcHQub3JpZW50YXRpb24/YS5sZXZlbC53aWR0aChNYXRoLmZsb29yKDEwMCphLngvZCkrXCIlXCIpOmEubGV2ZWwuaGVpZ2h0KE1hdGguZmxvb3IoMTAwKmEueS9lKSk7XCJmdW5jdGlvblwiPT10eXBlb2YgYS5vcHQuY2FsbGJhY2smJmEub3B0LmNhbGxiYWNrKGEpO319fTtiLmZuLnNpbXBsZVNsaWRlcj1iLnNpbXBsZVNsaWRlci5pbml0O2IuZm4udXBkYXRlU2xpZGVyVmFsPWIuc2ltcGxlU2xpZGVyLnVwZGF0ZVNsaWRlclZhbDt9KShqUXVlcnkpO1xuLypfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19cbiBfIGpxdWVyeS5tYi5jb21wb25lbnRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gZmlsZToganF1ZXJ5Lm1iLnN0b3JhZ2UubWluLmpzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfIGxhc3QgbW9kaWZpZWQ6IDI0LzA1LzE1IDE2LjA4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gT3BlbiBMYWIgcy5yLmwuLCBGbG9yZW5jZSAtIEl0YWx5ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBlbWFpbDogbWF0dGVvQG9wZW4tbGFiLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gc2l0ZTogaHR0cDovL3B1cHVuemkuY29tICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgIGh0dHA6Ly9vcGVuLWxhYi5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBibG9nOiBodHRwOi8vcHVwdW56aS5vcGVuLWxhYi5jb20gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gUSZBOiAgaHR0cDovL2pxdWVyeS5wdXB1bnppLmNvbSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyBMaWNlbmNlczogTUlULCBHUEwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gICAgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfICAgIGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9ncGwuaHRtbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfXG4gXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX1xuIF8gQ29weXJpZ2h0IChjKSAyMDAxLTIwMTUuIE1hdHRlbyBCaWNvY2NoaSAoUHVwdW56aSk7ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9cbiBfX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18qL1xuXG4oZnVuY3Rpb24oZCl7ZC5tYkNvb2tpZT17c2V0OmZ1bmN0aW9uKGEsYyxmLGIpe1wib2JqZWN0XCI9PXR5cGVvZiBjJiYoYz1KU09OLnN0cmluZ2lmeShjKSk7Yj1iP1wiOyBkb21haW49XCIrYjpcIlwiO3ZhciBlPW5ldyBEYXRlLGQ9XCJcIjswPGYmJihlLnNldFRpbWUoZS5nZXRUaW1lKCkrODY0RTUqZiksZD1cIjsgZXhwaXJlcz1cIitlLnRvR01UU3RyaW5nKCkpO2RvY3VtZW50LmNvb2tpZT1hK1wiPVwiK2MrZCtcIjsgcGF0aD0vXCIrYjt9LGdldDpmdW5jdGlvbihhKXthKz1cIj1cIjtmb3IodmFyIGM9ZG9jdW1lbnQuY29va2llLnNwbGl0KFwiO1wiKSxkPTA7ZDxjLmxlbmd0aDtkKyspe2Zvcih2YXIgYj1jW2RdO1wiIFwiPT1iLmNoYXJBdCgwKTspYj1iLnN1YnN0cmluZygxLGIubGVuZ3RoKTtpZigwPT1iLmluZGV4T2YoYSkpdHJ5e3JldHVybiBKU09OLnBhcnNlKGIuc3Vic3RyaW5nKGEubGVuZ3RoLGIubGVuZ3RoKSk7fWNhdGNoKGUpe3JldHVybiBiLnN1YnN0cmluZyhhLmxlbmd0aCxiLmxlbmd0aCk7fX1yZXR1cm4gbnVsbDt9LFxuXHRyZW1vdmU6ZnVuY3Rpb24oYSl7ZC5tYkNvb2tpZS5zZXQoYSxcIlwiLC0xKTt9fTtkLm1iU3RvcmFnZT17c2V0OmZ1bmN0aW9uKGEsYyl7XCJvYmplY3RcIj09dHlwZW9mIGMmJihjPUpTT04uc3RyaW5naWZ5KGMpKTtsb2NhbFN0b3JhZ2Uuc2V0SXRlbShhLGMpO30sZ2V0OmZ1bmN0aW9uKGEpe2lmKGxvY2FsU3RvcmFnZVthXSl0cnl7cmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlW2FdKTt9Y2F0Y2goYyl7cmV0dXJuIGxvY2FsU3RvcmFnZVthXTt9ZWxzZSByZXR1cm4gbnVsbDt9LHJlbW92ZTpmdW5jdGlvbihhKXthP2xvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGEpOmxvY2FsU3RvcmFnZS5jbGVhcigpO319O30pKGpRdWVyeSk7XG4iXSwiZmlsZSI6ImpxdWVyeS5tYi5ZVFBsYXllci5qcyJ9
