var $ = exports;

var common = require('../../elastic-inventory/common.js');

/* GET Root Page */
$.home = function() {

	var self = this;

	self.redirect(common.pages.inventory.uri);
};


/* GET Inventory Page */
$.inventory = function() {

	var self = this;

	if(self.user == null) {

		self.redirect(common.pages.getLogin.uri);

	} else { 

		common.model = {};
		common.model.typeId = "ck6bwxrlg0002gszq2i0wb0h1";
		common.model.typeKey = "gemstones";
		common.model.typeLabel = "Gemstones";
		
		var page = common.make(self, common.pages.inventory);

		self.html(page);
	}
};

/* GET Inventory Type By Label Key Page */
$.inventoryByTypeKey = function(key) {

	var self = this;

	if(self.user == null) {

		self.redirect(common.pages.getLogin.uri);

	} else { 

		common.EIGetInventoryTypeByKey(self.user._id, key, function(result) {

			if(result.success == true && result.message.length > 0) {

				var message = result.message[0];

				console.log(message);

				common.model = {};
				common.model.typeId = message._id;
				common.model.typeKey = message.key;
				common.model.typeLabel = message.label;

				var page = common.make(self, common.pages.inventoryByTypeKey);

				self.html(page);

			} else {

				self.view404();
			}
		}); 
	}
};
