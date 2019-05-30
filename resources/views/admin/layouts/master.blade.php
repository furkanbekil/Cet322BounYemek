<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="">
    <meta name="author" content="">
    <link rel="shortcut icon" href="{{ Config::get("app.url") }}/admin_new/assets/img/logo-fav.png">
    <title>{{ Config::get("app.name") }} | Admin Girişi</title>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/perfect-scrollbar/css/perfect-scrollbar.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/material-design-icons/css/material-design-iconic-font.min.css"/><!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery.vectormap/jquery-jvectormap-1.2.2.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/jqvmap/jqvmap.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/datetimepicker/css/bootstrap-datetimepicker.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/select2/css/select2.min.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/bootstrap-slider/css/bootstrap-slider.css"/>
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/css/dataTables.bootstrap.min.css"/>
    <!-- Fancybox -->
    <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/fancybox/jquery.fancybox.css" />
    <link rel="stylesheet" href="{{ Config::get("app.url") }}/admin_new/assets/css/style.css" type="text/css"/>
    
    <!-- Crop styles and js -->
	
	  <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/crop/css/style.css" />
	  <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/crop/css/style-example.css" />
	  <link rel="stylesheet" type="text/css" href="{{ Config::get("app.url") }}/admin_new/assets/lib/crop/css/jquery.Jcrop.css" />
	
	 
	 
    
    
    
    <!-- Scripts -->
    
    
    
    
    
    
  </head>
  <body>
    <div class="be-wrapper be-fixed-sidebar">
      <nav class="navbar navbar-default navbar-fixed-top be-top-header">
        <div class="container-fluid">
          <div class="navbar-header"><a href="{{ Config::get("app.url") }}/adminn" class="navbar-brand" style="  background-image: url({{ Config::get("app.url") }}/admin_new/assets/img/logo.png);"></a>
          </div>
          <div class="be-right-navbar">
            <ul class="nav navbar-nav navbar-right be-user-nav">
              <li class="dropdown"><a href="#" data-toggle="dropdown" role="button" aria-expanded="false" class="dropdown-toggle"><img src="{{ Config::get("app.url") }}/admin_new/assets/img/avatar.png" alt="Avatar"><span class="user-name">Túpac Amaru</span></a>
                <ul role="menu" class="dropdown-menu">
                  <li>
                    <div class="user-info">
                      <div class="user-name">{{ Auth::user()->firstname }} {{ Auth::user()->lastname }}</div>
                    </div>
                  </li>
                  <li><a href="{{ Config::get("app.url") }}/adminn/user/edit/{{ Auth::user()->id }}"><span class="icon mdi mdi-face"></span> Hesap</a></li>
                  <li><a href="{{ Config::get("app.url") }}/adminn/user/edit/{{ Auth::user()->id }}"><span class="icon mdi mdi-settings"></span> Ayarlar</a></li>
                  <li><a href="{{ Config::get("app.url") }}/adminn/auth/logout"><span class="icon mdi mdi-power"></span> Logout</a></li>
                </ul>
              </li>
            </ul>
            <div class="page-title"><a href="{{ Config::get("app.url") }}" target="_blank" class="btn btn-space btn-primary btn-lg">Siteye Dön </a></div>
            <ul class="nav navbar-nav navbar-right be-icons-nav">
              
             
            </ul>
          </div>
        </div>
      </nav>
      
      
      @include('admin.layouts.sidebar_left')

      @yield('content')
      
      <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery/jquery.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/js/main.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/bootstrap/dist/js/bootstrap.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-flot/jquery.flot.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-flot/jquery.flot.pie.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-flot/jquery.flot.resize.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-flot/plugins/jquery.flot.orderBars.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-flot/plugins/curvedLines.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery.sparkline/jquery.sparkline.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/countup/countUp.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jqvmap/jquery.vmap.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jqvmap/maps/jquery.vmap.world.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/js/app-dashboard.js" type="text/javascript"></script>
    
    
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery.nestable/jquery.nestable.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/moment.js/min/moment.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datetimepicker/js/bootstrap-datetimepicker.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/daterangepicker/js/daterangepicker.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/select2/js/select2.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/select2/js/select2.full.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/bootstrap-slider/js/bootstrap-slider.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/js/app-form-elements.js" type="text/javascript"></script>
    
    
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/js/jquery.dataTables.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/js/dataTables.bootstrap.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/dataTables.buttons.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/buttons.html5.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/buttons.flash.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/buttons.print.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/buttons.colVis.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/datatables/plugins/buttons/js/buttons.bootstrap.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/js/app-tables-datatables.js" type="text/javascript"></script>
    
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/tinymce/tinymce.min.js"></script>
    
    <!-- Fancybox -->
    <script type="text/javascript" src="{{ Config::get("app.url") }}/admin_new/assets/lib/fancybox/jquery.fancybox.js"></script>
    
     <script type="text/javascript" src="{{ Config::get("app.url") }}/admin_new/assets/lib/crop/scripts/jquery.Jcrop.js"></script>
	  <script type="text/javascript" src="{{ Config::get("app.url") }}/admin_new/assets/lib/crop/scripts/jquery.SimpleCropper.js"></script>
	  <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/parsley/parsley.min.js" type="text/javascript"></script>
    
    
    
    <script type="text/javascript">
      $(document).ready(function(){
      	//initialize the javascript
      	App.init();
      	
      	@if($current_controller == "HomeController")
      		App.dashboard();
      	@endif

      	
      	App.formElements();
      	App.dataTables();
      	
      	$('.fancybox').fancybox({
			helpers	: {
				overlay: {
			      locked: false
			    }
			}
		});
      	
      	$( document ).on('click','.delete-button', function() {
            var r = confirm("Silmek istediğinize emin misiniz?");
            if (r == true) {
                return true;
            }
            else {
                return false;
            }
        });
        
        tinymce.init({
			  selector: '.tinymce',
			  theme: 'modern',
			  entity_encoding : "raw",

			  plugins: [
			    "advlist autolink lists link image charmap print preview anchor",
			    "searchreplace visualblocks code fullscreen",
			    "insertdatetime media table contextmenu paste jbimages"
			  ],
				
			  // ===========================================
			  // PUT PLUGIN'S BUTTON on the toolbar
			  // ===========================================
				
			  toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image jbimages",
				
			  // ===========================================
			  // SET RELATIVE_URLS to FALSE (This is required for images to display properly)
			  // ===========================================
				
			  convert_urls:true,
			  relative_urls:false,
			  remove_script_host:false,
		});
      
      });
    </script>
    
    @yield('script')
      
      
      
    </div>
    
  </body>
</html>