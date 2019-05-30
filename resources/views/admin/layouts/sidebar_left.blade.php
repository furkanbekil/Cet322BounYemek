<div class="be-left-sidebar">
    <div class="left-sidebar-wrapper"><a href="#" class="left-sidebar-toggle">Dashboard</a>
      <div class="left-sidebar-spacer">
        <div class="left-sidebar-scroll">
          <div class="left-sidebar-content">
            <ul class="sidebar-elements">
              <li class="divider">Menu</li>

              
              <li class="parent @if($current_controller == "NewsController") active @endif"><a href="javascript:;"><i class="icon mdi mdi-file"></i><span>Yemek Listesi</span></a>
                <ul class="sub-menu">
                  
                  <li><a href="{{ route("admin.news.list") }}">Listele</a></li>
                  <li><a href="{{ route("admin.news.add") }}">Ekle</a></li>
                </ul>
              </li>
              
			  <li class="parent @if($current_controller == "ContactController") active @endif"><a href="javascript:;"><i class="icon mdi mdi-file"></i><span>Şikayet Listesi</span></a>
                <ul class="sub-menu">
                  
                  <li><a href="{{ route("admin.contact.list") }}">Listele</a></li>
                </ul>
              </li>
              
              <li class="parent @if($current_controller == "UserController") active @endif"><a href="javascript:;"><i class="icon mdi mdi-face"></i><span>Kullanıcılar</span></a>
                <ul class="sub-menu">
	                <li><a href="{{ route("admin.user.list") }}">Listele</a></li>
					<li><a href="{{ route("admin.user.add") }}">Ekle</a></li>
                  
                </ul>
              </li>

	              
	              
              
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  </div>