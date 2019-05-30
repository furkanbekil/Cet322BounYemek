<?php

namespace App\Http\Controllers\Site;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\Pages;
use App\Models\PagesModule;
use App\User;
use Datatables;
use Config;
use Mail;

class UsersController extends BaseController
	
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
	
	public function get_list(Request $request) {
		
		$users = User::all();
		
        return view('site.users.user_list',[
			"users" => $users,
		]);
      
	
	
		
	}
    
	public function save(Request $request) {
		$input 		= $request->all();
		
		
		$firstname 	= $input["firstname"];
		$subject 	= $input["subject"];
		$mail 		= $input["email"];
		$message_form 	= $input["message"];
		
        Mail::send('site.emails.contact', array("firstname" => $firstname, "subject" => $subject, "mail" => $mail, "message_form" => $message_form), function ($message) {
			    $message->from('info@nap.com.tr', 'Nap');
			
			    $message->to("berkay.bekil@gmail.com")->replyTo('info@nap.com.tr')->subject('Nap Contact');
		});
		
		
        return  redirect()->to(route("contact.detail")."?status=success");
      
	
	
		
	}
	
    
    
    
    
}
