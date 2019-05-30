<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\News;
use App\Models\NewsChild;
use App\User;
use Datatables;
use Config;

class UserController extends BaseController
	
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
			
			
			
			$user = User::select(['id', 'sort', 'firstname', 'lastname', 'email', 'status' ]);

			
			return Datatables::of($user)
			
			->addColumn('action', function ($user) {
				return '<div class="btn-group btn-hspace">
			              <button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle" aria-expanded="false">İşlemler <span class="icon-dropdown mdi mdi-chevron-down"></span></button>
			              <ul role="menu" class="dropdown-menu pull-right">
			                <li><a href="'.route("admin.user.edit",$user->id).'">Düzenle</a></li>
			                <li class="divider"></li>
			                <li><a style="color:red" href="'.route("admin.user.delete",$user->id).'" class="delete-button" >Sil</a></li>
			              </ul>
			            </div>';
			})
			
			->editColumn('status', '@if($status == 1) Açık @else Kapalı @endif')
			
			
			
			
			
			->make(true);
	
		
	}
	
	
    public function getList(Request $request){
        
        $type 	 = $request->get("type","all");
        $user_id = $request->get("user_id",false);
        
		return view('admin.user.list',[
			"type" 		=> $type,
			"user_id"	=> $user_id,
		]);
        
    }
    
    
    
    public function getAdd(Request $request){
	    
	    
	    $input = $request->all();
	    
		return view('admin.user.edit',[
			"input" 	=> $input,
		]);
        
    }
    
    
    public function getEdit($id){
	    
        $row = User::find($id);
        
		return view('admin.user.edit',[
			"row" 		=> $row,
		]);
        
    }
    
    
    
    public function postSave($id, Request $request){
	    
	    
	    $input = $request->all();
	    
	    
	    if($id == 0){
		    $row = new User;
	    }else {
			$row = User::find($id);    
	    }
	    
        $row->firstname			= $input["firstname"];
        $row->lastname 			= $input["lastname"];
        $row->email 			= $input["email"];
        
        if(!empty($input["password"])){
	    	$row->password = 	bcrypt($input["password"]);    
        }
        
        
        
        $admin = $request->input('admin', '');
        if ($admin == "on") {
	        $row->admin = 1;
            
        }else {
	        $row->admin = 0;
        }
        
        
       
        
		
       if(isset($input['image'])){
	        
	        $image_name = "image-".time().''.rand();
		    $uploadPath = public_path().'/uploads/';
		    $image = base64_decode(preg_replace('#data:image/[^;]+;base64,#', '', $input['image']));
		    
		    
		    $img = Image::make($image)->save($uploadPath."user/".$image_name.".jpg",100);

			$row->image = $image_name.".jpg";
			
        }

        
        if($row->save()){
	        
	       	if($id == 0){
			    $row->sort = $row->id;
			    $row->save();
		    }
	        return  redirect()->to(Config::get("app.url")."/adminn/user/list");
	        
        }else {
	        return "bir hata oluştu";
        }
        
        
    }
    
    public function postShortable(Request $request) {
		
		$objs 		 = $request->get("objs");
		$old_obj	 = $request->get("old_obj");
		
		foreach($old_obj as $old){
			if($old != " "){
				$old_[] = User::find($old)->sort;
			}
		}

		foreach($objs as $key => $o){
			echo $o ."->".$old_[$key]."<br>";
			$row = User::find($o);
			$new_sort = $old_[$key];
			$row->sort = $new_sort;
			$row->save();
			echo "sort = ".$new_sort."<br>";
		}
    
    }
    
    public function getDelete($id){
	    
	    
        $row = User::find($id);
        $row->delete();
        
        return redirect()->back();
        
    }
    
    
		

    

    
    
    
    
    
}
