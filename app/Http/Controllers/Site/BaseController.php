<?php

namespace App\Http\Controllers\Site;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Models\SummerSchoolsCountry;
use App\Models\LanguageSchoolsCountry;
use App\Models\Pages;
use App\Models\Banners;
use App\Models\References;
use App\Models\Projects;
use App\Models\Announcement;
use Carbon\Carbon;
use Config;

class BaseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
     
    public $sidebar;
    
    public function __construct() {
	    

	    date_default_timezone_set('Europe/Istanbul');
		Carbon::setLocale('tr');
		
		
/*
		if(isset($_SERVER["HTTP_CF_VISITOR"])){
			
		
		if (strpos($_SERVER["HTTP_CF_VISITOR"], 'https') !== false) {
		    //echo 'var';
		}else {
			
			$redirect= "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
			header("Location:$redirect"); 
		}
		}
		
		if (substr($_SERVER['HTTP_HOST'], 0, 4) === 'www.') {
		    header('Location: http'.(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on' ? 's':'').'://' . substr($_SERVER['HTTP_HOST'], 4).$_SERVER['REQUEST_URI']);
		    exit;
		}
*/
		
		
		
		$routeArray = app('request')->route()->getAction();
        $controllerAction = class_basename($routeArray['controller']);
        list($controller, $action) = explode('@', $controllerAction);
        
        //view()->share('current_controller', $controllerAction);
        view()->share('current_controller', $controller);
        
       
        
        view()->share('body_class', false);
        
        
        
		
    }
     
    
    
}
