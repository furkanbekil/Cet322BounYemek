@extends('site.layouts.master')
@section('content')

<!-- start page-content -->
<section class="sp-intro sp-intro-image" style="height: 450px" data-background="{{ Config::get("app.url") }}/site/assets/images/blog2.jpg">
    <div class="intro-body">
        <div class="intro-title intro-title-1 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.5s">
            BounYemek
        </div>
        <div class="intro-title intro-title-3 wow fadeIn" data-wow-duration="1s" data-wow-delay="1s">
            Boğaziçi Üniversitesi Yemek Listesi
        </div>
    </div>
</section>

<section id="sp-blog" class="sp-section">
    <div class="container" id="sp-blog-inner">
        <div class="content-column">
            <div class="row" id="sp-blog-grid">
                @foreach($news as $key => $n)
                <div class="col-lg-4 col-md-12 col-xs-12">
                    <div class="sp-blog-block masonry">
                        <div class="sp-blog-image"><a href="{{ route("news.detail",$n->slug) }}" style="background-image:url('{{ Config::get("app.url") }}/uploads/news/{{ $n->image }}');"></a></div>
                        <h3 class="entry-title"><a href="{{ route("news.detail",$n->slug) }}">{{ $n->title }} Yemek listesi</a></h3>
                       
                        <p>Bugünkü yemekte çorba <span style="color: #C3AC6D;">{{ $n->lunch_1 }}</span> olarak var. Diğer yemekler için hemen tıkla!</p>
                        <div class="sp-blog-read">
                            <a href="{{ route("news.detail",$n->slug) }}" class="btn btn-sm btn-primary">Yemek Listesini Gör</a>
                        </div>
                    </div>
                </div>
                @endforeach
                

<!-- start pagination.html-->
<div class="col-md-12">
    <div class="sp-pagination">
        {{ $news->links() }}
    </div>
</div>
<!-- end pagination.html-->
            </div>
        </div>
        
</div>
<!-- end sidebar.html-->
        </div>
    </div>
</section>

@stop