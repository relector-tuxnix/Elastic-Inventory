$(document).ready(function() {

	$('#register-submit-button').click(function() {

		//setupModal('#generic-modal');

		//$('#generic-modal .btn-primary').hide();
		//$('#generic-modal .modal-body').html("An error occured!");
		//$('#generic-modal').modal('show');

		//showModal();
		
		//showMessage('test', [], false, 0, 0);

		//showLoading();

		var email = $('#email').val();
		var password = $('#password').val();
		var passwordConfirm = $('#confirm').val();
	
		var registerPost = $.ajax({
			type: "POST",
			url: '{{pages.apiRegister.uri}}',
			data: {
				email : email, 
				password : password,
				passwordConfirm : passwordConfirm
			}
		}).done(function(result) {

			if(result == null) {

				showMessage('Error', ['Unexpected error occured!'], false, 0, 0);

			} else {

				if(result.success == true) {

					window.location.replace("{{pages.home.uri}}");	

				} else {

					arrayIntoUL("#register-message-list", result.message);
				}
			}

		}).fail(errorHandler);

	});
});
