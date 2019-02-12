var $ = exports;

/*
 * PAGES
 */

$.apiSearch = {
	uri: '/api/search',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	priority: 1,
	label: 'Search.'
};

$.apiGetMany = {
	uri: '/api/get-many',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	priority: 1,
	label: 'API Get Many.'
};

$.apiGetMyPosts = {
	uri: '/api/get-my-posts',
	controller: 'elastic-inventory/api.js',
	flags: ['post', 'authorize'],
	priority: 1,
	label: 'API Get My Posts.'
};

$.apiGetPost = {
	uri: '/api/get-post',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Get Post.'
};

$.apiGetPostsByTag = {
	uri: '/api/get-posts-by-tag',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Get Posts By Tag.'
};

$.apiGetComments = {
	uri: '/api/get-post-comments',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Get Post Comments.'
};

$.apiGetTags = {
	uri: '/api/get-tags',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Get Tags.'
};

$.apiSavePost = {
	uri: '/api/save-post',
	controller: 'elastic-inventory/api.js',
	flags: ['post', 'authorize'],
	label: 'API Save Post.'
};

$.apiImportPost = {
	uri: '/api/import-post',
	controller: 'elastic-inventory/api.js',
	flags : ['+xhr', 'upload', 'post', 'authorize'],
	length: 819200,
	label: 'API Import Post.'
};

$.apiSaveComment = {
	uri: '/api/save-comment',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Save Comment.'
};

$.apiVerifyComment = {
	uri: '/api/verify-comment',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Verify Comment.'
};

$.apiSaveContact = {
	uri: '/api/save-contact',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Save Contact.'
};

$.apiVerifyContact = {
	uri: '/api/verify-contact',
	controller: 'elastic-inventory/api.js',
	flags: ['post'],
	label: 'API Verify Contact.'
};

$.apiDeletePost = {
	uri: '/api/delete-post',
	controller: 'elastic-inventory/api.js',
	flags: ['post', 'authorize'],
	label: 'API Delete Post.'
};

$.apiGetById = {
	active: false,
	priority: 1
};

$.apiDeleteById = {
	active: false,
	priority: 1
}

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
	controller: 'elastic-inventory/home.js',
	flags: ['get'],
	priority: 1,
	label: 'Home',
	views: [
		{'homejs' : 'elastic-inventory/home.js'}, 
		{'body' : 'elastic-inventory/home.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}

	],
	above: [],
	below: []
};

$.homeByDate = {
	uri: '/date/{fromDate}/{toDate}',
	controller: 'elastic-inventory/home.js',
	base: '/date',
	label: 'Home',
	views: [
		{'homejs' : 'elastic-inventory/home.js'}, 
		{'body' : 'elastic-inventory/home.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	flags: ['get'],
	above: [],
	below: []
};

$.exportPost = {
	uri: '/export-post/{uri}',
	base: '/export-post',
	controller: 'elastic-inventory/savePost.js',
	flags: ['authorize', 'get'],
	label: 'Export Post.'
};

$.newPost = {
	uri: '/save-post',
	controller: 'elastic-inventory/savePost.js',
	label: 'Save Post',
	views: [
		{'savePostjs' : 'elastic-inventory/savePost.js'}, 
		{'body' : 'elastic-inventory/savePost.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	flags: ['authorize', 'get'],
	above: [],
	below: []
};

$.updatePost = {
	uri: '/save-post/{type}/{uri}',
	controller: 'elastic-inventory/savePost.js',
	base: '/save-post',
	label: 'Save Post',
	views: [
		{'savePostjs' : 'elastic-inventory/savePost.js'}, 
		{'body' : 'elastic-inventory/savePost.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}

	],
	flags: ['authorize', 'get'],
	above: [],
	below: []
};

$.search = {
	uri: '/search/{query}',
	controller: 'elastic-inventory/search.js',
	base: '/search',
	label: 'Search',
	views: [
		{'homejs' : 'elastic-inventory/home.js'}, 
		{'body' : 'elastic-inventory/home.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	flags: ['get'],
	above: [],
	below: []
};

$.tags = {
	uri: '/tags/{tag}',
	controller: 'elastic-inventory/search.js',
	base: '/tags',
	label: 'Tags Search',
	views: [
		{'homejs' : 'elastic-inventory/home.js'}, 
		{'body' : 'elastic-inventory/home.html'}, 
		{'defaultjs' : 'elastic-inventory/default.js'}, 
		{'default' : 'elastic-inventory/default.html'}
	],
	flags: ['get'],
	above: [],
	below: []
};

$.getLogin = {
	uri: '/login',
	controller: 'elastic-core/login.js',
	flags: ['get'],
	label: 'Login',
	views: [
		{'body' : 'elastic-inventory/login.html'},
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
	flags: [],
	label: 'Register',
	views: [
		{'body' : 'elastic-inventory/register.html'},
		{'default' : 'elastic-inventory/default.html'}
	],
	above: [],
	below: []
};


/*
 * RELATIONSHIPS
 */

$.home.below = [
	$.search, 
	$.newPost, 
	$.updatePost
];

$.search.above = [$.home];
$.newPost.above = [$.home];
$.updatePost.above = [$.home];

