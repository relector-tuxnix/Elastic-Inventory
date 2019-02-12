var F = require('total.js');
var cuid = require('cuid');

var $ = module.exports = require('../elastic-core/common.js');


F.once('load', function() {

	$.defaultLimit = F.config['default-item-limit'];

	$.defaultTheme = F.config['default_theme'];

	console.log(`LOADING ELASTIC-INVENTORY WITH THEME ${$.defaultTheme}`);

	var pages = require(`./${$.defaultTheme}-pages.js`);

	$.registerPages(pages);

	$.processRoutes();
});


$.EBSavePost = function(data, callback) {

	var constraints = {
		"_key": {
			presence: {
				allowEmpty: true
			}
		},
		"_uri": {
			presence: true,
			format: {
				pattern: "[aA-zZ0-9\-]+",
				flags: "i",
				message: "can only contain a-z, -, 0-9"
			},
	  		length: {
				minimum: 5
	  		}
	  	},
		"_content": {
			presence: true,
			length: {
				minimum: 4
			}
		},	
		"_tags": {
			presence: {
				allowEmpty: true
			}
		}
	};

	var failed = $.validate(data, constraints, {format: "flat"});

	if(failed != undefined) {

		callback({"success" : false, "message" : failed});

		return;
	}

	var query;

	if(data._key == "") {

		query = [`_type = "post"`, `_uri = "${data._uri}"`];

	} else {
		
		query = [`_key = "${data._key}"`];		
	}

	$.ECGet(query, 1, [], [], [], function(result) {

		if(result.error == true) {

			callback({"success" : false, "message" : "An unexpected error occured!"});
			
			return;
		}

		/* Existing document so do merge update */
		if(result.success == true) {
			
			var post = result.message[0];

			/* Can only update what you own */
			if(post._user != data._user) {

				callback({"success" : false, "message" : "The URI or KEY is already in use by another user!"});

				return;
			}

			/* Make sure the provided and retrieved documents are the same */
			data._key = post._key;

			/* Add attributes that may not exist */
			data._created = post._created;		

			console.log("Updating post...");

		} else {

			/* Force a new document to be created */
			data._key = "";

			console.log("New post...");
		}

		$.ECStore(data._key, data, function(results) {
			callback(results);
		});
	});
};

