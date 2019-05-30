<?php

namespace App\Http\Controllers\Site;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

use GrahamCampbell\Flysystem\Facades\Flysystem;

use Intervention\Image\Facades\Image;


use App\Models\News;
use App\Models\Slider;
use App\Models\Services;

use App\User;
use Datatables;
use Config;
use Carbon\Carbon;

class HomeController extends BaseController
	
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
	
	public function index(Request $request) {
			
			$news = News::where("id","<",68)->where("status",1)->orderBy("id","asc")->paginate(9);
			
			return view('site.index.index',[
				"news" => $news,
			]);
		
		
	}
     
    public function today(Request $request) {
			
			$today  		= Date("d-m-Y");
			$today_text  	= Date("l");
			$news			= News::where("title",$today)->first();
			
			$data["id"] 		= $news->id;
			$data["date"] 		= $news->title;
			$data["date_text"] 	= $today_text;
			$data["lunch_1"] 	= $news->lunch_1;
			$data["lunch_2"] 	= $news->lunch_2;
			$data["lunch_3"] 	= $news->lunch_3;
			$data["lunch_4"] 	= $news->lunch_4;
			$data["dinner_1"] 	= $news->dinner_1;
			$data["dinner_2"] 	= $news->dinner_2;
			$data["dinner_3"] 	= $news->dinner_3;
			$data["dinner_4"] 	= $news->dinner_4;
			
			$result["status"] 	= "OK";
			$result["errorCode"] 	= "00";
			$result["message"]	= null;
			$result["data"]		= $data;
			return $result;
		
		
	}
	
	public function get_list(Request $request) {
			
			
		$start 		=  Carbon::now()->startOfMonth()->format("m-Y");
		$news			= News::where('title', 'like', '%'.$start.'%')->orderBy("title","asc")->get();
		
		foreach($news as $key => $n){
			$data[$key]["id"] 			= $n->id;
			$data[$key]["date"] 		= $n->title;
			$data[$key]["date_text"] 	= Carbon::parse($n->title)->format("l");
			$data[$key]["lunch_1"] 		= $n->lunch_1;
			$data[$key]["lunch_2"] 		= $n->lunch_2;
			$data[$key]["lunch_3"] 		= $n->lunch_3;
			$data[$key]["lunch_4"] 		= $n->lunch_4;
			$data[$key]["dinner_1"] 	= $n->dinner_1;
			$data[$key]["dinner_2"] 	= $n->dinner_2;
			$data[$key]["dinner_3"] 	= $n->dinner_3;
			$data[$key]["dinner_4"] 	= $n->dinner_4;
		}
		
		
		$result["status"] 		= "OK";
		$result["errorCode"] 	= "00";
		$result["message"]		= null;
		$result["data"]			= $data;
		return $result;
		
		
	}
	
	
	
	
	
	
	
	
	
	
    
    
    
    
}
