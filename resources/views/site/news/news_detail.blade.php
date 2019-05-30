@extends('site.layouts.master')
@section('content')

<section class="sp-intro sp-intro-image" style="height: 475px;" data-background="assets/images/portfolio6.jpg">
    <div class="intro-body">
        <div class="intro-title intro-title-1 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.5s">
            Yemek Listesi
        </div>
        <div class="intro-title intro-title-3 wow fadeIn" data-wow-duration="1s" data-wow-delay="1s">
            {{ $row->title }} Tarihi
        </div>
    </div>
</section>

<section class="sp-section">
    <div class="container">
        <div class="row">
            <div class="col-md-8 col-xs-12">
                <div class="sp-slick-imac slick-dots-outside">
                    <div class="item"><img src="{{ Config::get("app.url") }}/uploads/news/{{ $row->image }}" alt="{{ $row->title }} Yemek Listesi"></div>
                </div>
            </div>
            <div class="col-md-4 col-xs-12 wow fadeInRight" data-wow-duration="1s" data-wow-delay=".5s">
                <h4>{{ $row->title }} Yemek Listesi</h4>
                <p>Aşağıda yemek listesi yer almaktadır. Lezzetini beğenmediğiniz yemeği aşağıdaki form'dan bize ulaştırabilirsiniz</p>
                <div class="sp-portfolio-list">
                    <ul>
                        <li><i class="icon-ion-pizza"></i> {{ $row->lunch_1 }}</li>
                        <li><i class="icon-ion-pizza"></i> {{ $row->lunch_2 }}</li>
                        <li><i class="icon-ion-pizza"></i> {{ $row->lunch_3 }}</li>
                        <li><i class="icon-ion-pizza"></i> {{ $row->lunch_4 }}</li>
                        <br>
                        <a href="{{ route("contact") }}" class="btn btn-sm btn-primary">Şikayet Et</a>

                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>



@stop