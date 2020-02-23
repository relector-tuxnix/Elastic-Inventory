$(document).ready(function() {

	$('#imagebox_close').click(function(e) {

		$('#imagebox_full').css('visibility', 'hidden');
	});

	window.imageBox = function(files) {

		$("#imagebox_full").find('.imagebox_thumb').not("#imagebox_thumb").remove();

		for(var i = 0, len = files.length; i < len; i++) {

			var fileId = files[i];

			if(i == 0) {
				$("#imagebox_full_image").attr('src', `{{pages.apiReturnFile.mediumThumb}}${fileId}`);
			}

			var $thumb = $("#imagebox_thumb").clone().removeAttr('id');

			$thumb.attr('src', `{{pages.apiReturnFile.smallThumb}}${fileId}`);
			$thumb.attr('data-id', fileId);

			$thumb.click(function(e) {

				var fileId = $(this).attr('data-id');

				$("#imagebox_full_image").attr('src', `{{pages.apiReturnFile.mediumThumb}}${fileId}`);
			});

			$("#imagebox_thumbs").append($thumb);
		}

		$('#imagebox_full').css('visibility', 'visible');
	};
	
	$.ajax({ 
		type: "GET", 
		url: "{{pages.apiGetInventorySchema.base}}/{{typeId}}", 
		data: {} 
	}).done(function(result) { 

		if(result.length == 0) {
			return;
		}

		var result = result[0];
		var schema = result.schema;

		$.ajax({ 
			type: "GET", 
			url: "{{pages.apiGetInventory.base}}/{{typeId}}", 
			data: {} 
		}).done(function(records) { 

			var $dt = $('#inventory-table').dynamictable({
				perPageDefault: 5,
				records: records,
				columnsIgnore: ["_id", "_creationDate", "type"],
				exportsIgnore: ["_id", "_creationDate", "files"],
				orderColumns: ["files"],
				hideColumnLabel: ["files"],
				disableExpand: ["files"],
				select: true,
				cells: [{
					column: "files",
					render: function(settings, column, record, $td) {

						var $img;

						if(Object.keys(record.files).length > 0) {

							/* We grab the first thumb available */
							var fileId = record.files[0];

							$img = $('<img />', {
								'id' : fileId,
								'src' : `{{pages.apiReturnFile.smallThumb}}${fileId}`
							});

							/* Need to record the click event on the body, so its not lost when pagination event occur */
							$('body').on('click', `#${fileId}`, function(e) {

								/* 
								 * As we bound the click to the body, all event bubble up.
								 * This means the TD is clicked before this event.
								 * We want to toggle the TD back to what it was before this event was fired.
								 */
								$(this).parent().click();

								window.imageBox(record.files);
							});

							$td.append($img);

						} else {

							$img = $('<img />', {
								src: '/images/elastic-inventory/file-generic-icon-small-thumb.png',
								alt: ''
							});

							$td.append($img);
						}

						$td.find('a').remove();

						$img.css('margin', '0px');
						$img.css('padding', '5px');
						$img.css('max-width', '200px');
						$img.css('max-height', '200px');

						$img.addClass('black-back-text');

						$td.width(200);
						$td.height(200);
					}
				}]

			}).data('dynamictable');

			$("#add-edit-button").click(function(event) {

				var data = $dt.inputsSelect.getSelected();

				/* Add Action */
				if(data.length == 0) {

				/* Edit Action */
				} else if(data.length == 1) {

					data = data.pop();

				} else if(data.length > 1) {
			
					showMessage("Note", ["You need to select (1) item to Edit or (0) to Add!"]);
	
					return;
				}
			
				setupModal("#editor-item-modal");

				$('#active-modal .header').text('Edit');
			
				var form = $("#active-modal #editor-item-form").dynamicform({
					"schema" : schema,
					"data": data,
					"postRender": function(control) {}
				}).data('dynamicform');

				showModal();	

				$("#active-modal .btn-primary").click(function() {

					console.log(form.serialize());
				});
			});

		}).fail(errorHandler);

	}).fail(errorHandler);
});
