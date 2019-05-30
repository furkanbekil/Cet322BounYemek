@extends('site.layouts.master')
@section('content')

<div id="sp-wrapper">
<!-- start page-content -->
<section class="sp-intro sp-intro-image" style="height: 450px" data-background="assets/images/about.jpg">
    <div class="intro-body">
        <div class="intro-title intro-title-1 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.5s">
            Yazarlarımız
        </div>
        <div class="intro-title intro-title-3 wow fadeIn" data-wow-duration="1s" data-wow-delay="1s">
            Bize Kimler Yardım Ediyor?
        </div>
    </div>
</section>

<section class="sp-section text-center" id="team">
    <div class="container">
       

        <div class="row sp-team-container wow sequenced fx-fadeIn">
            @foreach($users as $u)
            <div class="col-lg-3 col-sm-6 col-xs-12">
                <div class="sp-team-block">
                    <div class="image">
                        <img src="{{ Config::get("app.url") }}/uploads/user/{{ $u->image }}" alt="{{ $u->firstname }} {{ $u->lastname }}">
                    </div>
                    <div class="title"><h4>{{ $u->firstname }} {{ $u->lastname }}</h4></div>
                </div>
            </div>
            @endforeach
        </div>
    </div>
</section>

</div>

@stop


