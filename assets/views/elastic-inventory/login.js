$(document).ready(function() {

	$('#login-submit-button').click(function() {

		var email = $('#email').val();
		var password = $('#password').val();
		
		var registerPost = $.ajax({
			type: "POST",
			url: '{{pages.apiLogin.uri}}',
			data: {
				email : email, 
				password : password,
			}
		}).done(function(result) {

			if(result == null) {

				showMessage('Error', ['Unexpected error occured!'], false, 0, 0);

			} else {

				if(result.success == true) {

					window.location.replace("{{pages.home.uri}}");	

				} else {

					arrayIntoUL("#login-message-list", result.message);
				}
			}

		}).fail(errorHandler);
	});
});
