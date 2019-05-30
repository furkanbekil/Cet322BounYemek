<?php

namespace App\Http\Controllers\Site;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\Contact;
use App\User;
use Datatables;
use Config;
use Mail;

class ContactController extends BaseController
	
{
	protected $layout = 'site.layouts.master';
	

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
     
   
    public function __construct(){ 
	    parent::__construct(); 
	    
	}
	
	public function contact(Request $request) {
		

		
        return view('site.contact.contact',[

		]);
      
	
	
		
	}
    
	public function contact_save(Request $request) {
		$input 		= $request->all();
		
		
		$name 			= $input["name"];
		$phone 			= $input["phone"];
		$mail 			= $input["email"];
		$message_form 	= $input["message"];
		
		$contact = new Contact;
		$contact->name 		= $name;
		$contact->phone 	= $phone;
		$contact->email 	= $mail;
		$contact->message 	= $message_form;
		$contact->save();
		
		
        return  redirect()->to(route("contact")."?status=success");
      
	
	
		
	}
	
    
    
    
    
}
