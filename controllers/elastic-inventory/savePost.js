var $ = exports;

var common = require('../../elastic-inventory/common.js');


$.newPost = function() {

	var self = this;

	common.model = {};

	var page = common.make(self, common.pages.newPost);

	self.html(page);
};

$.exportPost = function(uri) {

	var self = this;
	var user = self.user._id;
	var query = [`_type = "post"`, `_user = "${user}"`];

	if(uri.toLowerCase() != "all") {
		
		query.push(`_uri = "${uri}"`);
	}

	common.ECGet(query, [], [], [], [], function(results) {

		if(results.success == false) {
			
			self.view404("No post(s) found!");
			
		} else {

			//Set the download name to the orignal filename rather then the file key
			var headers = [];
			headers["Pragma"] = "public";
			headers["Expires"] = "0";
			headers['Access-Control-Allow-Origin'] = "*";
			headers["Cache-Control"] = "must-revalidate, post-check=0, pre-check=0";
			headers["Content-Type"] = "application/force-download";
			headers["Content-Type"] = "application/octet-stream";
			headers["Content-Type"] = "application/download";
			headers["Content-Disposition"] = `attachment;filename=${uri}.json`;
			headers["Content-Transfer-Encoding"] = "binary";

			self.plain(JSON.stringify(results.message), headers);
		}
	});
};

