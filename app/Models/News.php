<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;


use Cocur\Slugify\Slugify;
use Cviebrock\EloquentSluggable\Sluggable;


class News extends Model implements AuthenticatableContract, CanResetPasswordContract
{
    use Authenticatable, CanResetPassword, Sluggable;
    
	
	public function sluggable()
    {
        return [
            'slug' => [
                'source' => 'title'
                
            ]
        ];
    }
    
    public function customizeSlugEngine(Slugify $engine, $attribute)
	{
	    return $engine->activateRuleset('turkish');
	}
	


    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'news';
    
    
    
    

}
