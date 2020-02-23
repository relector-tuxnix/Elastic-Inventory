var F = require('total.js');
var cuid = require('cuid');

var $ = module.exports = require('../elastic-core/common.js');

var fileStoreLocation = F.config['files-dir'];
var tmpStoreLocation = F.config['files-tmp-dir'];
var originalLocation = F.config['files-original-dir'];
var mediumThumbLocation = F.config['files-medium-thumb-dir'];
var smallThumbLocation = F.config['files-small-thumb-dir'];


F.once('load', function() {

	$.defaultLimit = F.config['default-item-limit'];

	$.defaultTheme = F.config['default_theme'];

	console.log(`LOADING ELASTIC-INVENTORY WITH THEME ${$.defaultTheme}`);

	var pages = require(`./${$.defaultTheme}-pages.js`);

	$.registerPages(pages);

	$.processRoutes();
});


$.EIGetFile = function(user, key, callback) {

	var query = `
	  	SELECT 
		  Store.[_id], 
	 	  Store.[_user], 
		  Store.[_creationDate],
		  Store.[_data]
		FROM
		 Store
		WHERE
		 Store.[_type] = 'inventory-file' 
		AND
		 Store.[_user] = ?
		AND 
		 Store.[_id] = ?
	`;

	$.ECQueryJSON(query, [user, key], function(result) {

		callback(result);
	});
};


$.EIGetInventoryTypeByKey = function(user, key, callback) {

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
		AND
		  json_extract([value], '$.key') = ?
	`;

	$.ECQuery(query, [user, key], function(result) {

		callback(result);
	});
};


$.EIStoreInventory = function(user, data, callback) {


};

