@extends('site.layouts.master')
@section('content')

<div id="sp-wrapper">
<!-- start page-content -->
<section class="sp-intro sp-intro-image" style="height: 450px" data-background="assets/images/about.jpg">
    <div class="intro-body">
        <div class="intro-title intro-title-1 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.5s">
            Şikayet
        </div>
        <div class="intro-title intro-title-3 wow fadeIn" data-wow-duration="1s" data-wow-delay="1s">
            Beğenmediğiniz yemekleri bildirin!
        </div>
    </div>
</section>

<section id="sp-contact" class="sp-section">
    <div class="container">
        <div class="row">
            <div class="col-lg-6 col-md-6 col-sm-12">
                <div class="sp-contacts-list">
                    <ul>
                        <li><i class="icon-ion-ios-location-outline"></i> Adres: Bebek Mh., 34342 Beşiktaş/İstanbul
</li>
                        <li><i class="icon-ion-ios-telephone-outline"></i> Telefon: +90 212 359 54 00</li>
                        <li><i class="icon-ion-ios-email-outline"></i>E-mail: kurumsaliletisim@boun.edu.tr</li>
                    </ul>
                </div>
                <hr>
                <p>Beğenmediğiniz yada şikayette bulunmak istediğiniz konuları bize yazabilirsiniz. Bu konular rektörlük ile görüşülerek tarafınıza bilgi verilecektir.</p>
            </div>
            <div class="col-lg-5 offset-lg-1 col-md-6 col-sm-12">
                <form method="post" action="{{ route("contact.save") }}">
                    <div class="form-group">
                        <label class="sr-only" for="cf-name">İsminiz</label>
                        <input class="form-control" name="name" id="cf-name" type="text" placeholder="İsminiz">
                    </div>
                    <div class="form-group">
                        <label class="sr-only" for="cf-email">Email Adresiniz</label>
                        <input class="form-control" name="email" id="cf-email" type="email" placeholder="Email Adresiniz">
                    </div>
                    <div class="form-group">
                        <label class="sr-only" for="cf-phone">Telefonunuz</label>
                        <input class="form-control" name="phone" id="cf-phone" type="tel" placeholder="Telefonunuz">
                    </div>
                    <div class="form-group">
                        <label class="sr-only" for="cf-message">Mesajınız</label>
                        <textarea class="form-control" name="message" id="cf-message" rows="4" placeholder="Mesajınız"></textarea>
                    </div>
                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                    <button class="btn btn-primary" type="submit">Gönder</button>
                </form>
            </div>
        </div>
    </div>
</section>

</div>

@stop

@section('js')
<script>
	$( document ).ready(function() {
		@if(\Request::get("status") == "success")
	    	alert ("Kaydınız Alındı. İlginiz için teşekkür ederiz");
	    @endif
	});
</script>
@stop


