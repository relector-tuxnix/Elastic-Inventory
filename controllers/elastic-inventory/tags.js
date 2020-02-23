var $ = exports;

var common = require('../../elastic-inventory/common.js');

/* GET Tags Page */
$.tags = function(tag) {

	var self = this;

	common.model = {};
	common.model.tag = tag;

	var page = common.make(self, common.pages.tags);

	self.html(page);
};
