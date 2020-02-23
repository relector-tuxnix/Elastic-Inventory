var $ = exports;

var common = require('../../elastic-inventory/common.js');

var crypto = require('crypto');
var fs = require('fs');


$.apiGetInventory = function(typeId) {

	var self = this;

	var user = self.user._id;

	var query = `
		SELECT 
		  Store.[_id], 
		  Store.[_creationDate],
		  [value]
		FROM
		 Store, json_each(Store.[_data])
		WHERE
		 Store.[_type] = 'inventory' 
		AND 
		 Store.[_user] = ?
		AND 
		 json_extract([value], '$.type') = ? 
	`;

	common.ECQuery(query, [user, typeId], function(result) {

		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			var inventory = [];

			for(var i = 0, len = result.message.length; i < len; i++) {
				
				try {

					var message = result.message[i];

					var item = JSON.parse(message.value);

					item["_id"] = message._id;
					item["_creationDate"] = message._creationDate;

					inventory.push(item);
					
				} catch(e) {

					console.log(`Could not parse inventory item: ${e}`);
				}
			}

			self.json(inventory);
		}
	});
};


$.apiGetInventoryTypes = function() {

	var self = this;

	var user = self.user._id;

	var query = `
		SELECT DISTINCT 
		  Store._id, 
		  json_extract([value], '$.key') as key, 
		  json_extract([value], '$.label') as label
		FROM
		 Store, json_each(Store.[_data])
		WHERE
		 Store.[_type] = 'inventory-type' 
		AND 
		 Store.[_user] = ?
	`;

	common.ECQuery(query, [user], function(result) {

		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			self.json(result.message);
		}
	});
};


$.apiGetInventoryTypeByKey = function(key) {

	var self = this;

	var user = self.user._id;

	common.EIGetInventoryTypeByKey(user, key, function(result) {

		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			self.json(result.message);
		}
	});
};


$.apiGetInventorySchema = function(typeId) {

	var self = this;

	var user = self.user._id;

	var query = `
         SELECT
           Store._id,
           json_extract([value], '$.schema') as schema,
           json_extract([value], '$.options') as options
         FROM
          Store, json_each(Store.[_data])
         WHERE
          Store.[_type] = 'inventory-schema'
         AND
          Store.[_user] = ?
         AND
          json_extract([value], '$.type') = ?
         LIMIT 1
     `;

	common.ECQueryJSON(query, [user, typeId], function(result) {

		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			self.json(result.message);
		}
	});
};


$.apiGetFile = function(key) {

	var self = this;

	var user = self.user._id;

	common.EIGetFile(user, key, function(result) {

		self.json(result.message);
	});
};


$.apiReturnFile = function(scale, key) {

	var self = this;

	var user = self.user._id;

	/* Check user has that file in db and if they do return it with the mime type set...otherwise return 404 */
	common.EIGetFile(user, key, function(result) {

		if(result.success == false) {

			self.view404();

		} else {

			/* Could not find a file with the given ID */
			if(result.message.length == 0) {

				self.view404();

				return;
			}

			var files = result.message.pop();

			var file = undefined;

			for(var i = 0, len = files._data.length; i < len; i++) {

				var file = files._data[i];

				if(file.scale == scale) {
					break;
				}
			}

			/* Could not find a file with the given SCALE */
			if(file == undefined) {
			
				self.view404();

				return;
			}

			/* Set the download name to the orignal filename rather then the file key */
			var headers = [];
			headers['Content-Type'] = "image/jpg";
			headers['Access-Control-Allow-Origin'] = '*';

			var filename = F.config['files-dir'] + file.folder + key;

			var fullPath = F.path.root(filename);

			fs.access(fullPath, fs.constants.R_OK, (err) => {

				if(err) {
	
					self.view404();

				} else {

					self.file(`~${fullPath}`, key, headers);
				}
			});
		}
	});
};


$.storeInventory = function() {


};
