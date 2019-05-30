<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\Contact;
use App\User;
use Datatables;
use Config;

class ContactController extends BaseController
	
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
			
			
			
			$contact = Contact::select(['id', 'name', 'email', 'phone', 'message' ]);

			
			return Datatables::of($contact)
			
			->addColumn('action', function ($contact) {
				return '<div class="btn-group btn-hspace">
			              <button type="button" data-toggle="dropdown" class="btn btn-default dropdown-toggle" aria-expanded="false">İşlemler <span class="icon-dropdown mdi mdi-chevron-down"></span></button>
			              <ul role="menu" class="dropdown-menu pull-right">
			                <li><a href="'.route("admin.contact.edit",$contact->id).'">Düzenle</a></li>
			                <li class="divider"></li>
			                <li><a style="color:red" href="'.route("admin.contact.delete",$contact->id).'" class="delete-button" >Sil</a></li>
			              </ul>
			            </div>';
			})
			
			
			
			
			
			
			->make(true);
	
		
	}
	
	
    public function getList(Request $request){
        
        $type 	 	= $request->get("type","all");
        $user_id 	= $request->get("user_id",false);
        
        
		return view('admin.contact.list',[
			"type" 		=> $type,
			"user_id"	=> $user_id,
		]);
        
    }
    
    
    
    public function getAdd(Request $request){
	    
	    
	    $input 		= $request->all();
	    
		return view('admin.contact.edit',[
			"input" 	=> $input,
		]);
        
    }
    
    
    public function getEdit($id){
	    
        $row 		= Contact::find($id);
        
		return view('admin.contact.edit',[
			"row" 		=> $row,
		]);
        
    }
    
    
    
    public function postSave($id, Request $request){
	    
	    
	    $input = $request->all();
	    
	    
	    if($id == 0){
		    $row = new Contact;
	    }else {
			$row = Contact::find($id);    
	    }
	    
        $row->title					= $input["title"];
        $row->title_tr				= $input["title_tr"];
        $row->description 			= $input["description"];
        $row->description_tr 		= $input["description_tr"];
        
        if(isset($input['image'])){
	        
	        $image_name = "image-".time().''.rand();
		    $uploadPath = public_path().'/uploads/';
		    $image = base64_decode(preg_replace('#data:image/[^;]+;base64,#', '', $input['image']));
		    
		    
		    $img = Image::make($image)->save($uploadPath."contact/".$image_name.".jpg",100);

			$row->image = $image_name.".jpg";
			
        }
        
       
        
		$status = $request->input('status', '');
        if ($status == "on") {
	        $row->status = 1;
            
        }else {
	        $row->status = 0;
        }
        
       
        
        if($row->save()){
	        
	       	if($id == 0){
			    $row->sort = $row->id;
			    $row->save();
		    }
	        return  redirect()->to(route("admin.contact.list"));
	        
        }else {
	        return "bir hata oluştu";
        }
        
        
    }
    
    public function postShortable(Request $request) {
		
		$objs 		 = $request->get("objs");
		$old_obj	 = $request->get("old_obj");
		
		foreach($old_obj as $old){
			if($old != " "){
				$old_[] = Contact::find($old)->sort;
			}
		}

		foreach($objs as $key => $o){
			echo $o ."->".$old_[$key]."<br>";
			$row = Contact::find($o);
			$new_sort = $old_[$key];
			$row->sort = $new_sort;
			$row->save();
			echo "sort = ".$new_sort."<br>";
		}
    
    }
    
    public function getDelete($id){
	    
	    
        $row = Contact::find($id);
        $row->delete();
        
        return redirect()->back();
        
    }
    
    
		

    

    
    
    
    
    
}
