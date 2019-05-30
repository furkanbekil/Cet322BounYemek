@extends('admin.layouts.master')
@section('content')
<div class="be-content">
        
    <div class="main-content container-fluid">
      
     	<div class="row">
            <div class="col-sm-12">
              <div class="panel panel-default panel-table">
                <div class="panel-heading">Şikayetleri Listeleme

                </div>
                <div class="panel-body">
                  <table id="table_" class="table table-striped table-hover table-fw-widget sortableTable">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>İsim</th>
						<th>Email</th>
						<th>Telefon</th>
						<th>Mesaj</th>
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
        order : [[ 0, "asc" ]],
        ajax: '{{ route("admin.contact.grid") }}?type={{ $type }}<?php if($user_id){ echo "&user_id=".$user_id;} ?>',
        columns: [
			{data: 'id', name: 'id'},
			{data: 'name', name: 'name'},
			{data: 'email', name: 'email'},
			{data: 'phone', name: 'phone'},
			{data: 'message', name: 'message'},
		],
		fnDrawCallback: function( oSettings ) {
	      $(".copy_link").on("click", function () {
		  		
		  		
				
				
				  var $temp = $("<input>");
				  $("body").append($temp);
				  $temp.val($(this).data("link")).select();
				  document.execCommand("copy");
				  $temp.remove();
				

			});
	    },
	});
	
	var info = table.page.info();
	
	
  
</script>



@stop
   