$(document).ready(function() {

	$('#navigation-search-clear').on('click', function(e) {
		
		$('#navigation-search').val('');

		e.preventDefault();
	});

	$('#navigation-search-submit').on('click', function(e) {
		
		var searchTerm = $('#navigation-search').val();

		console.log(searchTerm);

		e.preventDefault();
	});

	$.ajax({ 
		type: "GET", 
		url: "{{pages.apiGetInventoryTypes.uri}}", 
		data: {} 
	}).done(function(result) { 

		for(var i = 0, len = result.length; i < len; i++) {

			var message = result[i];

			var $item = $("#inventory-menu-item").clone();

			$item.removeAttr('id');

			$item.attr('href', `{{pages.inventoryByTypeKey.base}}/${message.key}`);
			$item.html(message.label);

			$("#inventory-menu").append($item);
		}

		$("#inventory-menu-item").remove();

	}).fail(errorHandler);
});
