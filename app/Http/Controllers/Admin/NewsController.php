<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\News;
use App\Models\NewsModule;
use App\User;
use Datatables;
use Config;

class NewsController extends BaseController
	
{
	protected $layout = 'admin.layouts.master';
	

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    

    /**
     * Show the form for creating a new resource.
     *
     * @return Response
     */
     
     public function getGrid(Request $request) {
			
			$type 	 = $request->get("type","all");
			$user_id = $request->get("user_id",false);
			
			
			
			$news = News::select(['id', 'sort', 'title', 'status' ]);

			
			return Datatables::of($news)
			
			->addColumn('action', function ($news) {
				return '<div class="btn-group btn-hspace">
			              <button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle" aria-expanded="false">İşlemler <span class="icon-dropdown mdi mdi-chevron-down"></span></button>
			              <ul role="menu" class="dropdown-menu pull-right">
			                <li><a href="'.route("admin.news.edit",$news->id).'">Düzenle</a></li>
			                
			                <li class="divider"></li>
			                <li><a style="color:red" href="'.route("admin.news.delete",$news->id).'" class="delete-button" >Sil</a></li>
			              </ul>
			            </div>';
			})
			
			->editColumn('status', '@if($status == 1) Açık @else Kapalı @endif')
			
			
			
			
			
			
			->make(true);
	
		
	}
	
	
    public function getList(Request $request){
        
        $type 	 	= $request->get("type","all");
        $user_id 	= $request->get("user_id",false);
        
        
		return view('admin.news.list',[
			"type" 		=> $type,
			"user_id"	=> $user_id,
		]);
        
    }
    
    
    
    public function getAdd(Request $request){
	    
	    
	    $input 		= $request->all();
	    
		return view('admin.news.edit',[
			"input" 	=> $input
		]);
        
    }
    
    
    public function getEdit($id){
	    
        $row 		= News::find($id);
        
		return view('admin.news.edit',[
			"row" 		=> $row
		]);
        
    }
    
    
    
    public function postSave($id, Request $request){
	    
	    
	    $input = $request->all();
	    
	    
	    if($id == 0){
		    $row = new News;
	    }else {
			$row = News::find($id);    
	    }
	    
        $row->title					= $input["title"];
        $row->lunch_1				= $input["lunch_1"];
        $row->lunch_2				= $input["lunch_2"];
        $row->lunch_3				= $input["lunch_3"];
        $row->lunch_4				= $input["lunch_4"];
        $row->dinner_1				= $input["dinner_1"];
        $row->dinner_2				= $input["dinner_2"];
        $row->dinner_3				= $input["dinner_3"];
        $row->dinner_4				= $input["dinner_4"];
        
        $row->status 				= 1;
       
        
        if(isset($input['image'])){
	        
	        $image_name = "image-".time().''.rand();
		    $uploadPath = public_path().'/uploads/';
		    $image = base64_decode(preg_replace('#data:image/[^;]+;base64,#', '', $input['image']));
		    
		    
		    $img = Image::make($image)->save($uploadPath."news/".$image_name.".jpg",100);

			$row->image = $image_name.".jpg";
			
        }
        
       
        
/*
		$status = $request->input('status', '');
        if ($status == "on") {
	        $row->status = 1;
            
        }else {
	        $row->status = 0;
        }
*/
       
        
        
        
       
        
        if($row->save()){
	        
	       	if($id == 0){
			    $row->sort = $row->id;
			    $row->save();
		    }
	        return  redirect()->to(route("admin.news.list"));
	        
        }else {
	        return "bir hata oluştu";
        }
        
        
    }
    
    public function postShortable(Request $request) {
		
		$objs 		 = $request->get("objs");
		$old_obj	 = $request->get("old_obj");
		
		foreach($old_obj as $old){
			if($old != " "){
				$old_[] = News::find($old)->sort;
			}
		}

		foreach($objs as $key => $o){
			echo $o ."->".$old_[$key]."<br>";
			$row = News::find($o);
			$new_sort = $old_[$key];
			$row->sort = $new_sort;
			$row->save();
			echo "sort = ".$new_sort."<br>";
		}
    
    }
    
    public function getDelete($id){
	    
	    
        $row = News::find($id);
        $row->delete();
        
        return redirect()->back();
        
    }
    
    
		

    

    
    
    
    
    
}
