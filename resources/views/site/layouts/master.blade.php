<!doctype html>
<html class="no-js" lang="tr">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>BounYemek | Furkan Bekil</title>

    <!-- inject:css -->
    <link rel="stylesheet" href="{{ Config::get("app.url") }}/site/assets/styles/bootstrap.css">
    <link rel="stylesheet" href="{{ Config::get("app.url") }}/site/assets/styles/main.css">
    <link rel="stylesheet" href="{{ Config::get("app.url") }}/site/assets/icon-font/css/sp-theme-icons.css">
    <!-- endinject -->
</head>
<body>

<div id="sp-preloader"></div>
<div id="sp-top-scrolling-anchor"></div>

<a href="#sp-top-scrolling-anchor" class="sp-scroll-top">
    <span class="anno-text">Go to top</span>
    <i class="icon-angle-up"></i>
</a>

<!-- start header.html-->
<header id="sp-header" class="stuck-slidein">
    <div class="container-fluid" id="sp-header-inner">
        <a href="{{ route("home") }}" class="brand-logo">
            <h1><span>Boun</span>Yemek</h1>
        </a>

        <nav id="sp-primary-nav">
            <ul class="nav_menu">
                <li><a href="{{ route("home") }}">Anasayfa</a></li>
                <li><a href="{{ route("users.list") }}">Yazarlar</a></li>
                <li><a href="{{ route("contact") }}">Yemek Şikayet Et</a></li>
                
            </ul>

            <a href="#" id="sp-mobile-nav-trigger">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </a>
        </nav>

        
    </div>
</header>


<!-- fullscreen mobile menu -->
<div id="sp-mobile-nav-container">
    <div class="overlay-inner-wrap">
        <nav>
            <ul class="nav_menu">
                <li class="current-menu-item"><a href="{{ route("home") }}">Anasayfa</a></li>
                <li class="current-menu-item"><a href="{{ route("users.list") }}">Yazarlar</a></li>
                <li class="current-menu-item"><a href="{{ route("contact") }}">Yemek Şikayet Et</a></li>
                
            </ul>
        </nav>
        <div class="sp-soc-icons">
            <a href="#" title="facebook" target="_blank"><i class="icon-facebook"></i></a>
            <a href="#" title="twitter" target="_blank"><i class="icon-twitter"></i></a>
            <a href="#" title="instagram" target="_blank"><i class="icon-instagram"></i></a>
        </div>
    </div>
</div>

<div id="sp-mobile-nav-bg"></div>
<!-- end header.html-->

<div id="sp-wrapper">

@yield("content")

<!-- end page-content -->
</div>

<!-- start footer.html-->
<footer id="sp-footer" class="sp-footer-fixed">
	
	<div class="sp-end-footer">
		<div class="container">
			<div class="end-footer-block">
				© 2019 BounYemek by <a href="#">Furkan Bekil</a>. All rights reserved.
			</div>
			<div class="end-footer-block menu-block">
				<ul>
					<li><a href="{{ route("home") }}">Anasayfa</a></li>
                <li><a href="{{ route("users.list") }}">Yazarlar</a></li>
                <li><a href="{{ route("contact") }}">Yemek Şikayet Et</a></li>
				</ul>
			</div>
		</div>
	</div>
</footer>
<div id="sp-footer-sizing-helper"></div>
<!-- end footer.html-->

<!-- JS assets -->
<!-- start page-footer-assets -->


<!-- end page-footer-assets -->
<script>
    var SOPRANO_FONTS = [
        'Montserrat:400,400i,500,500i,600,600i,700,700i',
        'Source Sans Pro:300,300i,400,400i,600,600i,700,700i',
        'Shadows Into Light:400'
    ];
</script>

<!-- base:js -->
<script src="{{ Config::get("app.url") }}/site/assets/scripts/jquery.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/modernizr.js"></script>
<!-- endinject -->

<!-- assets:js -->
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/fclick-lib.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jarallax.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.ajaxChimp.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.appear.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.circle-progress.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.countdown.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.easings.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.mb.YTPlayer.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.swipebox.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.throttle-debounce.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/jquery.typed.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/pzt_helpers.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/retina.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/shuffle.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/slick.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/sticky-kit.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/textrotator.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/wf_loader.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/assets/wow.js"></script>
<!-- endinject -->

<!-- bootstrap:js -->
<script src="{{ Config::get("app.url") }}/site/assets/scripts/bootstrap/bs.collapse.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/bootstrap/bs.util.js"></script>
<!-- endinject -->

<!-- controllers:js -->
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/animated_circles.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/blog.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/clients.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/color_swarm.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/faq.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/footer.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/google_maps.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/header.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/intro.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/mailchimp_subscribe.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/others.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/page_scrolling.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/portfolio.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/preloader.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/progress_bars.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/rolling_numbers.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/sliders.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/sticky_sidebars.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/textrotator.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/typed.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/wfl_init.js"></script>
<script src="{{ Config::get("app.url") }}/site/assets/scripts/controllers/wow.js"></script>
<!-- endinject -->

@yield("js")
</body>
</html>