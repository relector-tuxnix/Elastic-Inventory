var $ = exports;

/*
 * ELASTIC INVENTORY PAGES
 */

$.apiGetInventory = {
	uri: '/api/get-inventory/{typeId}',
	base: '/api/get-inventory',
	controller: 'elastic-inventory/api.js',
	flags: ['get', 'authorize'],
	priority: 1,
	label: 'Get Inventory By Type.'
};

$.apiGetInventoryTypes = {
	uri: '/api/get-inventory-types',
	controller: 'elastic-inventory/api.js',
	flags: ['get'],
	priority: 1,
	label: 'Get Inventory Types.'
};

$.apiGetInventoryTypeByKey = {
	uri: '/api/get-inventory-type-by-key/{key}',
	controller: 'elastic-inventory/api.js',
	flags: ['get'],
	priority: 1,
	label: 'Get Inventory Type By Label.'
};

$.apiGetInventorySchema = {
	uri: '/api/get-inventory-schema/{typeId}',
	base: '/api/get-inventory-schema',
	controller: 'elastic-inventory/api.js',
	flags: ['get'],
	priority: 1,
	label: 'Get Inventory Schema.'
};

$.apiGetById = {
	active: false,
	priority: 1
};

$.apiDeleteById = {
	active: false,
	priority: 1
};

$.error = {
	uri: '/error',
	controller: 'elastic-core/default.js',
	flags: [],
	priority: 1,
	label: 'Error Occured',
	views: [
		{"body" : 'elastic-inventory/error.html'},
		{'defaultjs' : 'elastic-inventory/default.js'},
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

$.home = {
	uri: '/',
	controller: 'elastic-inventory/inventory.js',
	flags: ['get'],
	priority: 1,
	label: 'Inventory',
	views: [],
	above: [],
	below: []
};

/* Shows all inventory categories on a single page */
$.inventory = {
	uri: '/Inventory',
	controller: 'elastic-inventory/inventory.js',
	flags: ['get'],
	priority: 1,
	label: 'Inventory',
	views: [
		{'navigationjs' : 'elastic-inventory/navigation.js'}, 
		{'navigation' : 'elastic-inventory/navigation.html'}, 
		{'inventoryjs' : 'elastic-inventory/inventory.js'}, 
		{'ecmodals' : 'elastic-core/modals.html'},
		{'modals' : 'elastic-inventory/modals.html'},
		{'body' : 'elastic-inventory/inventory.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

/* Shows a single inventory category on a page */
$.inventoryByTypeKey = {
	uri: '/Inventory/{key}',
	controller: 'elastic-inventory/inventory.js',
	flags: ['get'],
	base: '/inventory',
	label: 'Inventory',
	views: [
		{'navigationjs' : 'elastic-inventory/navigation.js'}, 
		{'navigation' : 'elastic-inventory/navigation.html'}, 
		{'inventoryjs' : 'elastic-inventory/inventory.js'}, 
		{'ecmodals' : 'elastic-core/modals.html'},
		{'modals' : 'elastic-inventory/modals.html'},
		{'body' : 'elastic-inventory/inventory.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

/* Perform an Upsert on an inventory item */
$.storeInventory = {
	uri: '/Inventory/Store',
	controller: 'elastic-inventory/api.js',
	flag: ['authorize', 'post'],
	label: 'Inventory Store',
	above: [],
	below: []
};

$.getLogin = {
	uri: '/login',
	controller: 'elastic-core/login.js',
	flags: ['get'],
	label: 'Login',
	views: [
		{'loginjs' : 'elastic-inventory/login.js'},
		{'ecmodals' : 'elastic-core/modals.html'},
		{'modals' : 'elastic-inventory/modals.html'},
		{'body' : 'elastic-inventory/login.html'},
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

$.postLogin = {
	uri: '/login',
	controller: 'elastic-core/login.js',
	flags: ['unauthorize', 'post'],
	label: 'Login',
	views: [
		{'body' : 'elastic-inventory/login.html'},
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

$.getRegister = {
	uri: '/register',
	controller: 'elastic-core/register.js',
	flags: ['unauthorize'],
	label: 'Register',
	views: [
		{'registerjs' : 'elastic-inventory/register.js'},
		{'ecmodals' : 'elastic-core/modals.html'},
		{'modals' : 'elastic-inventory/modals.html'},
		{'body' : 'elastic-inventory/register.html'},
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};

$.apiGetFile = {
	uri: '/api/get-file',
	controller: 'elastic-inventory/api.js',
	flags: ['get', 'authorize'],
	label: 'Get File'
};

$.apiReturnFile = {
	uri: '/file/{type}/{key}',
	controller: 'elastic-inventory/api.js',
	base: '/file',
	smallThumb: '/file/small-thumb/',
	mediumThumb: '/file/medium-thumb/',
	original: '/file/original/',
	flags: ['get', 'authorize'],
	label: 'Return File',
};

/*
 * RELATIONSHIPS
 */

$.inventory.below = [];

