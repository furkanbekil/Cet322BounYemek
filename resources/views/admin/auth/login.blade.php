@extends('admin.layouts.login')
@section('content')



<div class="splash-container">
	<div class="panel panel-default panel-border-color panel-border-color-primary">
	  <div class="panel-heading"><img src="{{ Config::get("app.url") }}/admin_new/assets/img/logo.png" alt="logo" width="191" height="70" class="logo-img"><span class="splash-description">Lütfen Bilgilerinizi Giriniz</span></div>
	  <div class="panel-body">
		  
		@if (\Session::has('danger'))
		<div role="alert" class="alert alert-contrast alert-danger alert-dismissible">
	        <div class="icon"><span class="mdi mdi-close-circle-o"></span></div>
	        <div class="message">
	          <button type="button" data-dismiss="alert" aria-label="Close" class="close"><span aria-hidden="true" class="mdi mdi-close"></span></button>{!! \Session::get('danger') !!}
	        </div>
	    </div>
		@endif
	    
	    
	    <form action="{{ Config::get("app.url") }}/adminn/auth/login" method="post">
	      <div class="form-group">
	        <input id="username" type="text" placeholder="Kullanıcı Adı" name="email" autocomplete="off" class="form-control">
	      </div>
	      <div class="form-group">
	        <input id="password" type="password" name="password" placeholder="Şifre" class="form-control">
	      </div>
	      
	      <input type="hidden" name="_token" value="{{ csrf_token() }}">
	      <div class="form-group login-submit">
	        <button data-dismiss="modal" type="submit" class="btn btn-primary btn-xl">Giriş Yap</button>
	      </div>
	    </form>
	  </div>
	</div>
	<div class="splash-footer"><span>&copy; 2019 <a href="#">{{ Config::get("app.site_name") }}</a></span></div>
</div>

@stop