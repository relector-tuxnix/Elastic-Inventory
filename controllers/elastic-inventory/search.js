var $ = exports;

var common = require('../../elastic-inventory/common.js');

/* GET Search Page */
$.search = function(query) {

	var self = this;

	common.model = {};
	common.model.query = query;

	var page = common.make(self, common.pages.search);

	self.html(page);
};

/* GET Tags Search Page */
$.tags = function(tag) {

	var self = this;

	common.model = {};
	common.model.tag = tag;

	var page = common.make(self, common.pages.tags);

	self.html(page);
};
