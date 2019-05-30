@extends('admin.layouts.master')
@section('content')
<div class="be-content">
        
        <div class="main-content container-fluid">
	        
	       <div class="row">
            <div class="col-md-12">
              <div class="panel panel-default panel-border-color panel-border-color-primary">
                <div class="panel-heading panel-heading-divider">Kullanıcı Ekle / Düzenle<span class="panel-subtitle">Aşağıdaki alanları doldurmalısınız</span></div>
                <div class="panel-body">
                  <form action="{{ route("admin.user.save",isset($row->id) ? $row->id : '0') }}" enctype="multipart/form-data" method="post" style="border-radius: 0px;" class="form-horizontal group-border-dashed">
                    
                  
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Admin mi?</label>
                      <div class="col-sm-6">
                        <div class="switch-button switch-button-lg">
	                      <input type="checkbox" name="admin" <?php if (isset($row)) {  if($row->admin == 1){ echo "checked"; } } ?> id="admin"><span>
	                        <label for="admin"></label></span>
	                    </div>
                      </div>
                    </div>
                    
                    
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">İsim</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="firstname" value="<?php if (isset($row)) { echo $row->firstname; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Soyisim</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="lastname" value="<?php if (isset($row)) { echo $row->lastname; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">E-Mail</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="email" value="<?php if (isset($row)) { echo $row->email; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Resim (255 x 288)</label>
                        <div class="col-sm-6">
							<input type="hidden" id="image" name="image" >
                            <div class="cropme" data_width="255" data_height="288" data_hidden_file_id="image"><a class="btn btn-primary" > <i class="mdi mdi-upload"></i> Resim Yükle</a></div>
                            <?php if (isset($row->image)) { ?>
                                <a class="fancybox col-sm-3 mt7" href="{{ Config::get("app.url") }}/uploads/user/{{ $row->image }}" data-fancybox-group="gallery" title="{{ $row->title }}">Göster</a>
                            <?php } ?>

                        </div>
                    </div>
                    
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Şifre</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="password" value="" placeholder="Boş bırakırsanız şifre değişmeyecektir" >
                      </div>
                    </div>
                    
                    
                                       
                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                    
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label"></label>
                      <div class="col-sm-6">
                        <button type="submit" class="btn btn-space btn-primary btn-lg">Formu Kaydet</button>

                      </div>
                    </div>
                    
                    
                    
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          
         
      </div>
    
@stop

@section("script")

<script>
	
	 
	$( document ).ready(function() {
		
		
		$('.cropme').simpleCropper();

		
		
	});
	
	
</script>
@stop
   
   