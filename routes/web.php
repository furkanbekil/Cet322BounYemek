<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/adminn/auth/login', 'Admin\Auth\AuthController@getLogin')->name('admin.auth.login');
Route::get('/adminn/auth/logout', 'Admin\Auth\AuthController@getLogout')->name('admin.auth.logout');
Route::post('/adminn/auth/login', 'Admin\Auth\AuthController@postLogin')->name('admin.auth.login');

Route::group(['middleware' => 'authAdmin'], function () {
	
	Route::group(['prefix' => 'adminn'], function () {
		
	    
	    Route::get('/', 'Admin\HomeController@index')->name('admin.home');
		
		
		// News Route Start \\
		
		Route::get('/news/list', 'Admin\NewsController@getList')->name('admin.news.list');
		Route::get('/news/grid', 'Admin\NewsController@getGrid')->name('admin.news.grid');
		Route::get('/news/edit/{id}', 'Admin\NewsController@getEdit')->name('admin.news.edit');
		Route::get('/news/add', 'Admin\NewsController@getAdd')->name('admin.news.add');
		Route::post('/news/save/{id}', 'Admin\NewsController@postSave')->name('admin.news.save');
		Route::post('/news/shortable', 'Admin\NewsController@postShortable')->name('admin.news.sortable');
		Route::get('/news/delete/{id}', 'Admin\NewsController@getDelete')->name('admin.news.delete');
		
		
		// News Route Stop \\
		
		
		
		// Contact Route Start \\
		
		Route::get('/contact/list', 'Admin\ContactController@getList')->name('admin.contact.list');
		Route::get('/contact/grid', 'Admin\ContactController@getGrid')->name('admin.contact.grid');
		Route::get('/contact/edit/{id}', 'Admin\ContactController@getEdit')->name('admin.contact.edit');
		Route::get('/contact/add', 'Admin\ContactController@getAdd')->name('admin.contact.add');
		Route::post('/contact/save/{id}', 'Admin\ContactController@postSave')->name('admin.contact.save');
		Route::post('/contact/shortable', 'Admin\ContactController@postShortable')->name('admin.contact.sortable');
		Route::get('/contact/delete/{id}', 'Admin\ContactController@getDelete')->name('admin.contact.delete');
		
		
		// Contact Route Stop \\
		
				
		
		// User Route Start \\
		
		Route::get('/user/list', 'Admin\UserController@getList')->name('admin.user.list');
		Route::get('/user/grid', 'Admin\UserController@getGrid')->name('admin.user.grid');
		Route::get('/user/edit/{id}', 'Admin\UserController@getEdit')->name('admin.user.edit');
		Route::get('/user/add', 'Admin\UserController@getAdd')->name('admin.user.add');
		Route::post('/user/save/{id}', 'Admin\UserController@postSave')->name('admin.user.save');
		Route::post('/user/shortable', 'Admin\UserController@postShortable')->name('admin.user.sortable');
		Route::get('/user/delete/{id}', 'Admin\UserController@getDelete')->name('admin.user.delete');
		
		
		// User Route Stop \\
		
		
		
		
	});
	

});


Route::get('/', 'Site\HomeController@index')->name('home');
Route::get('/yemek/{slug}', 'Site\NewsController@detail')->name('news.detail');
Route::get('/yazarlar/', 'Site\UsersController@get_list')->name('users.list');
Route::get('/sikayet/', 'Site\ContactController@contact')->name('contact');
Route::post('/sikayet/kaydet', 'Site\ContactController@contact_save')->name('contact.save');

Route::group(['prefix' => 'api/v1'], function () {
	Route::post('/today', 'Site\HomeController@today')->name('api.v1.today');
	Route::post('/list', 'Site\HomeController@get_list')->name('api.v1.list');
});

