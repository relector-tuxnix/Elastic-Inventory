var $ = exports;

var common = require('../../elastic-inventory/common.js');

/* GET View Inventory */
$.viewInventory = function() {

	var self = this;

	common.model = {};

	var page = common.make(self, common.pages.viewInventory);

	self.html(page);
};

