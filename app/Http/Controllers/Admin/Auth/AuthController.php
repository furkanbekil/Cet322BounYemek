<?php

namespace App\Http\Controllers\Admin\Auth;

use Illuminate\Http\Request;

use App\Http\Requests;

use App\Models\User;
use Validator;
use Auth;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Config;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Registration & Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users, as well as the
    | authentication of existing users. By default, this controller uses
    | a simple trait to add these behaviors. Why don't you explore it?
    |
    */

    use AuthenticatesUsers;

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('guest', ['except' => 'getLogout']);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, [
            'name' => 'required|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|confirmed|min:6',
        ]);
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return User
     */
    protected function create(array $data){
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
        ]);
    }
    
    
    public function getUpdate(){
	    
	    $user = User::find(1);
	    $user->password = bcrypt(123456);
	    $user->save();
	    echo $user;
	    exit;

    }
    
    public function getLogin(){
	    
        return view('admin.auth.login',[

		]);
    }
    
    
    public function postLogin(Request $request){
	    $input = $request->all();
	    
        if (Auth::attempt(['email' => $input["email"], 'password' => $input["password"], 'admin' => 1])){
		    return  redirect()->to(route("admin.news.list"));

		}else {
			return  redirect()->to(route("admin.auth.login"))->with('danger', 'Kullanıcı yada şifre yanlış');
		}
    }
    
    public function getLogout(){
	    
        Auth::logout();
        return  redirect()->to(route("admin.auth.login"));
    }
    
    
}
