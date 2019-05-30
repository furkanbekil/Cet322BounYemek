@extends('admin.layouts.master')
@section('content')
<div class="be-content">
        
    <div class="main-content container-fluid">
      
     	<div class="row">
            <div class="col-sm-12">
              <div class="panel panel-default panel-table">
                <div class="panel-heading">Kullanıcı Listeleme
                  <div class="tools"><a href="{{ route("admin.user.add") }}" class="btn btn-space btn-primary btn-lg">Yeni + </a></div>
                </div>
                <div class="panel-body">
                  <table id="table_" class="table table-striped table-hover table-fw-widget sortableTable">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Sıralama</th>
						<th>Adı</th>
						<th>Soy Adı</th>
						<th>E-Mail</th>
						<th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>  
       
    </div>
         
</div>


    
@stop

@section('script')

<script>

	$.extend( true, $.fn.dataTable.defaults, {
      dom:
        "<'row be-datatable-header'<'col-sm-6'l><'col-sm-6'f>>" +
        "<'row be-datatable-body'<'col-sm-12'tr>>" +
        "<'row be-datatable-footer'<'col-sm-5'i><'col-sm-7'p>>"
    } );
    
	var table = $('#table_').DataTable({
        processing: true,
        serverSide: true,
        stateSave: true,
        order : [[ 1, "asc" ]],
        ajax: '{{ route("admin.user.grid") }}?type={{ $type }}<?php if($user_id){ echo "&user_id=".$user_id;} ?>',
        columns: [
			{data: 'id'},
			{data: 'sort'},
			{data: 'firstname'},
			{data: 'lastname'},
			{data: 'email'},
			{data: 'action', orderable: false, searchable: false}
		]
	});
	
	var info = table.page.info();
	
    
  
</script>


@stop
   