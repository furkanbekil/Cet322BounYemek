@extends('admin.layouts.master')
@section('content')
<div class="be-content">
        
        <div class="main-content container-fluid">
	        
	       <div class="row">
            <div class="col-md-12">
              <div class="panel panel-default panel-border-color panel-border-color-primary">
                <div class="panel-heading panel-heading-divider">Yemek Ekle / Düzenle<span class="panel-subtitle">Aşağıdaki alanları doldurmalısınız</span></div>
                <div class="panel-body">
                  <form action="{{ route("admin.news.save",isset($row->id) ? $row->id : '0') }}" enctype="multipart/form-data" method="post" style="border-radius: 0px;" class="form-horizontal group-border-dashed">
                    
                   
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Tarih (29-01-2018)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="title" value="<?php if (isset($row)) { echo $row->title; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Öğle Yemek 1 (Çorba)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="lunch_1" value="<?php if (isset($row)) { echo $row->lunch_1; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Öğle Yemek 2 (Ana yemek)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="lunch_2" value="<?php if (isset($row)) { echo $row->lunch_2; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Öğle Yemek 3 (Tatlı)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="lunch_3" value="<?php if (isset($row)) { echo $row->lunch_3; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Öğle Yemek 4 (Pilav)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="lunch_4" value="<?php if (isset($row)) { echo $row->lunch_4; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Akşam Yemek 1 (Çorba)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="dinner_1" value="<?php if (isset($row)) { echo $row->dinner_1; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Akşam Yemek 2 (Ana yemek)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="dinner_2" value="<?php if (isset($row)) { echo $row->dinner_2; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Akşam Yemek 3 (Tatlı)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="dinner_3" value="<?php if (isset($row)) { echo $row->dinner_3; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="col-sm-3 control-label">Akşam Yemek 4 (Pilav)</label>
                      <div class="col-sm-6">
                        <input type="text" class="form-control" name="dinner_4" value="<?php if (isset($row)) { echo $row->dinner_4; } ?>" >
                      </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="col-sm-3 control-label">Resim (640 x 440)</label>
                        <div class="col-sm-6">
							<input type="hidden" id="image" name="image" >
                            <div class="cropme" data_width="640" data_height="440" data_hidden_file_id="image"><a class="btn btn-primary" > <i class="mdi mdi-upload"></i> Resim Yükle</a></div>
                            <?php if (isset($row->image)) { ?>
                                <a class="fancybox col-sm-3 mt7" href="{{ Config::get("app.url") }}/uploads/news/{{ $row->image }}" data-fancybox-group="gallery" title="{{ $row->title }}">Göster</a>
                            <?php } ?>

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
   