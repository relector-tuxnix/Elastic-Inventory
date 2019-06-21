var $ = exports;

var common = require('../../elastic-inventory/common.js');

/* GET Home Page */
$.home = function() {

	var self = this;

	if(self.user == null) {

		self.redirect(common.pages.getLogin.uri);

	} else { 

		common.model = {};

		var page = common.make(self, common.pages.home);

		self.html(page);
	}
};

