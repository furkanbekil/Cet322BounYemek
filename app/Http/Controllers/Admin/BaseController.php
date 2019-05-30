<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class BaseController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
     
    public $sidebar;
    
    public function __construct() {
	    
		
		
		$routeArray = app('request')->route()->getAction();
        $controllerAction = class_basename($routeArray['controller']);
        list($controller, $action) = explode('@', $controllerAction);
        
        view()->share('current_controller', $controller);
        
		
    }
     
    
    
}
