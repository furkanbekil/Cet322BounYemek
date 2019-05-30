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
    <link rel="stylesheet" href="{{ Config::get("app.url") }}/admin_new/assets/css/style.css" type="text/css"/>
  </head>
  <body class="be-splash-screen">
    <div class="be-wrapper be-login">
      <div class="be-content">
        <div class="main-content container-fluid">
          
          
          @yield('content')
          
          
        </div>
      </div>
    </div>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/jquery/jquery.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/perfect-scrollbar/js/perfect-scrollbar.jquery.min.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/js/main.js" type="text/javascript"></script>
    <script src="{{ Config::get("app.url") }}/admin_new/assets/lib/bootstrap/dist/js/bootstrap.min.js" type="text/javascript"></script>
    <script type="text/javascript">
      $(document).ready(function(){
      	//initialize the javascript
      	App.init();
      });
      
    </script>
  </body>
</html>