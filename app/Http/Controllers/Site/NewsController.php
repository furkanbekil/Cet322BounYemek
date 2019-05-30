<?php

namespace App\Http\Controllers\Site;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\News;
use App\Models\Services;
use App\User;
use Datatables;
use Config;
use Carbon\Carbon;

class NewsController extends BaseController
	
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
	
	
	
	public function detail($slug) {
			
			
			$row 				= News::where("slug",$slug)->first();

			
			return view('site.news.news_detail',[
				"row"			=> $row,
			]);
			
	
		
	}
	
	
    
    
    
    
}
