var $ = exports;

var common = require('../../elastic-inventory/common.js');

var crypto = require('crypto');
var fs = require('fs');


$.apiGetTypes = function() {

	var self = this;

	var query = 'SELECT DISTINCT type FROM Inventory';  

	common.ECQuery(query, [], function(result) {

		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			self.json(result);
		}
	});
};


$.apiSavePost = function() {

	var self = this;

	var data = {
		'_key' : '', 
		'_type' : 'post', 
		'_uri' : self.body.uri, 
		'_content' : self.body.content, 
		'_user' : self.user.id, 
		'_tags' : self.body["tags[]"]
	};

	/* Have to remove the dummy element because of https://github.com/nodejs/node/issues/11145 */
	data._tags.splice(0, 2);

	common.EISavePost(data, function(result) {
	
		if(result.success == false) {
	
			self.view500(result.message);

		} else {

			self.json(result);
		}
	});
};


$.apiDeletePost = function() {

	var self = this;

	var uri = self.body.uri;
	var user = self.user.id;

	var query = [`_type = "post"`, `_uri = "${uri}"`, `_user = "${user}"`];

	common.ECGet(query, 1, [], [], [], function(result) {

		if(result.success == false) {
			
			self.view500("Failed to find post with the provided URI.");

		} else {
	
			var post = result.message[0];

			common.ECDelete(post._key, function(result) {

				if(result.success == false) {
			
					self.view500("Failed to delete post!");

				} else {

					self.json(result);
				}
			});
		}
	});
};


/*
 * Get live posts.
 */
$.apiGetMany = function() {

	var self = this;

	var range = self.body["range[]"];
	var last = self.body["last[]"];
	var category = self.body.category;
	var order = self.body["order[]"];
	var limit = self.body.limit;

	var query = [`_type = "post"`, `"${category}" IN _tags`, `"live" IN _tags`];

	common.ECGet(query, limit, last, range, order, function(results) {

		if(results.success == false) {
			
			self.view404("No posts found!");
			
		} else {

			self.json(results);
		}
	});
};


/*
 * Get posts based on the users identity.
 */
$.apiGetMyPosts = function() {

	var self = this;

	var range = self.body["range[]"];
	var last = self.body["last[]"];
	var category = self.body.category;
	var order = self.body["order[]"];
	var limit = self.body.limit;
	var user = self.user.id;
	var query;

	if(category == "other") {
		query = [`_type = "post"`, `"quote" NOT IN _tags`, `"summary" NOT IN _tags`, `"article" NOT IN _tags`, `_user = "${user}"`];
	} else {
		query = [`_type = "post"`, `"${category}" IN _tags`, `_user = "${user}"`];
	}

	common.ECGet(query, limit, last, range, order, function(results) {

		if(results.success == false) {
			
			self.view404("No posts found!");
			
		} else {

			self.json(results);
		}
	});
};


/*
 * Get a single post.
 */
$.apiGetPost = function() {

	var self = this;

	var uri = self.body.uri;

	common.ECGet([`_type = "post"`, `_uri = "${uri}"`], 1, [], [], [], function(result) {

		if(result.success == false) {
			
			self.view404("Could not get post with given URI!");
			
		} else {

			var post = result.message[0];

			/*
			 * If you own the post then you can view it. 
			 * If you do not own it then it has to be live to view. 
			 */
			if((self.user == null || self.user.id != post._user) && post.live == 'false') {
			
				self.view401("You do not have access to view this post.");		

				return;
			}

			self.json(result);
		}
	});
};


/*
 * Get comments for a single post.
 * -Need to implement a page that correlates all comments based on email into a single page
 */
$.apiGetComments = function() {

	var self = this;

	var key = self.body.key;
	var last = self.body["last[]"];
	var order = self.body["order[]"];
	var limit = self.body.limit;

	common.ECGet([`_type = "post"`, `_key = "${key}"`], 1, [], [], [], function(result) {

		if(result.success == false) {
			
			self.view404("Could not find the given post!");
			
		} else {

			var post = result.message[0];

			/*
			 * If you own the post then you can view it. 
			 * If you do not own it then it has to be live to view. 
			 */
			if((self.user == null || self.user.id != post._user) && post.live == 'false') {
			
				self.view401("You do not have access to view this post.");		

				return;
			}

			common.ECGet([`_type = "comment"`, `_parent_post = "${post._key}"`, `_verified = "true"`], limit, last, [], order, function(result) {

				if(result.success == false) {
					
					self.view404("No comments found for the given post!");
					
				} else {

					var cleanMessage = result.message;

					for(var i = 0; i < cleanMessage.length; i++) {

						/* We want a nice human readable format */
						cleanMessage[i]._created = new Date(cleanMessage[i]._created).toDateString();

						/* We want to protect emails for privacy and security */
						cleanMessage[i]._email = "";
					}

					self.json(result);
				}
			});
		}
	});
};


/*
 * Need to implement:
 *	-IP post limits
 *	-Allow reaction +1/-1
 */
$.apiSaveComment = function() {

	var self = this;

	var key = self.body.key;
	var comment = self.body.comment;
	var name = self.body.name;
	var email = self.body.email;

	var data = { '_key' : '', 
		     '_type' : 'comment', 
		     '_parent_post' : key, 
		     '_comment' : comment, 
		     '_name' : name, 
		     '_email' : email, 
		     '_email_hash' : '', 
		     '_verified' : 'false', 
		     '_notify' : 'false',
		     '_pin' : common.EBGeneratePin(5) 
	};

	var constraints = {
		"_email": {
			presence: true,
	  		email: true,
		},
		"_name": {
			presence: true,
			format: {
				pattern: "[aA-zZ0-9\\s]+",
				flags: "i",
				message: "can only contain a-z, A-Z, Space, 0-9"
			},
	  		length: {
				minimum: 2,
				maximum: 20
	  		}
	  	},
		"_comment": {
			presence: true,
			format: {
				pattern: "[aA-zZ0-9\\.\\s]+",
				flags: "i",
				message: "can only contain a-z, A-Z, Period (.), Space ( ), 0-9"
			},
	  		length: {
				minimum: 5,
				maximum: 280
	  		}
	  	}
	};

	var failed = common.validate(data, constraints, {format: "flat"});

	if(failed == undefined) {

		data._email_hash = crypto.createHash('md5').update(email).digest('hex');
		    
		common.ECStore(data._key, data, function(results) {

			if(results.success == false) {
		
				self.view500("Failed to save post!");

			} else {

				common.EBSendEmail(data._email, 'Your PIN ✔', data._pin, data._pin); 

				self.json(results);
			}
		});

	} else {

		self.json({success: false, message: failed});
	}
};


$.apiVerifyComment = function() {

	var self = this;

	var pin = self.body.pin;

	common.ECGet([`_type = "comment"`, `_pin = "${pin}"`, `_verified = "false"`], 1, [], [], [], function(result) {

		if(result.success == false) {
			
			self.view404("No comment found with that pin!");
			
		} else {

			var data = result.message.pop();

			data._verified = 'true';

			common.ECStore(data._key, data, function(result) {

				if(result.success == false) {
			
					self.view500("Failed to verify comment!");

				} else {

					self.json(result);
				}
			});
		}
	});
};


$.apiSaveContact = function() {

	var self = this;

	var message = self.body.message;
	var email = self.body.email;

	var data = { '_key' : '', 
		     '_type' : 'contact', 
		     '_message' : message, 
		     '_email' : email, 
		     '_verified' : 'false', 
		     '_pin' : common.EBGeneratePin(5) 
	};

	var constraints = {
		"_email": {
			presence: true,
	  		email: true,
		},
		"_message": {
			presence: true,
			format: {
				pattern: "[aA-zZ0-9\\.\\s]+",
				flags: "i",
				message: "can only contain a-z, A-Z, Period (.), Space ( ), 0-9"
			},
	  		length: {
				minimum: 5,
				maximum: 280
	  		}
	  	}
	};

	var failed = common.validate(data, constraints, {format: "flat"});

	if(failed == undefined) {

		common.ECStore(data._key, data, function(results) {

			if(results.success == false) {
		
				self.view500("Failed to save contact!");

			} else {

				common.EBSendEmail(data._email, 'Your PIN ✔', data._pin, data._pin); 

				self.json(results);
			}
		});

	} else {

		self.json({success: false, message: failed});
	}
};


$.apiVerifyContact = function() {

	var self = this;

	var pin = self.body.pin;

	common.ECGet([`_type = "contact"`, `_pin = "${pin}"`, `_verified = "false"`], 1, [], [], [], function(result) {

		if(result.success == false) {
			
			self.view404("No contact found with that pin!");
			
		} else {

			var data = result.message.pop();

			data._verified = 'true';

			common.ECStore(data._key, data, function(result) {

				if(result.success == false) {
			
					self.view500("Failed to verify contact!");

				} else {

					common.EBSendEmail("SYSTEM", `Contact Form : ${data._email}`, data._message, data._message); 

					self.json(result);
				}
			});
		}
	});
};


$.apiGetTags = function() {

	var self = this;

	var sql = "";
	sql += `SELECT DISTINCT tag FROM core as c UNNEST(c._tags) as tag WHERE c._type = "post" AND "summary" IN c._tags`;
	sql += ` AND "live" IN c._tags AND tag != "live" AND tag != "article" AND tag != "quote" AND tag != "summary" ORDER BY tag ASC`;

	common.ECQuery(sql, function(result) {

		if(result.success == false) {
			
			self.view404("No tags found!");
			
		} else {

			self.json(result);
		}	
	});
};


$.apiGetPostsByTag = function() {

	var self = this;

	var tag = decodeURIComponent(self.body.tag);

	var sql = `SELECT core.* FROM core WHERE _type = "post" AND "live" IN _tags AND "summary" IN _tags AND "${tag}" IN _tags ORDER BY _key DESC LIMIT 16`;

	common.ECQuery(sql, function(result) {

		if(result.success == false) {
			
			self.view404("No posts with the given tag found!");
			
		} else {

			self.json(result);
		}	
	});
};


$.apiSearch = function() {

	var self = this;

	var query = self.body.query;

	common.ECSearch(query, 10, function(results) {
 
		if(results.success == false) {
			
			self.view404(results.message);
			
		} else {

			var keys = [];

			for(var i = 0; i < results.message.length; i++) {

				var key = results.message[i].id;
	
			       	keys.push(`_key = "${key}"`);
			}

			/* Need to make sure we only return live posts */
			var sql = `SELECT core.* FROM core WHERE _type = "post" AND "live" IN _tags AND "summary" IN _tags AND (${keys.join(' OR ')})`;

			common.ECQuery(sql, function(result) {

				if(result.success == false) {
					
					self.view404("No results found!");
					
				} else {

					self.json(result);
				}	

			});
		}
	});
};


$.apiImportPost = function() {

	var self = this;

	//Do not delete temporary files until the end of the request
	self.noClear(true);	

	if(self.files.length != 1) {

		self.view500("No file provided!");

		return;
	}

	var user = self.user.id;
	var file = self.files.pop();

	fs.readFile(file.path, 'utf8', function(err, contents) {

		if(err != null) {

			self.view500("Failed to read file contents!");

			return;
		}

		try {

			var posts = JSON.parse(contents);

			if(Array.isArray(posts) == true) {

				for(var i = 0; i < posts.length; i++) {

					var post = posts[i];

					/* Force the user to the current user */
					post._user = user;

					/* Force the type to POST */
					post._type = "post";

					common.EISavePost(post, function(result) {
					
						//console.log(result);

						/* Need to implement a feedback mechanism here */
						if(result.success == false) {
					
						} else {
							
						}
					});

					self.json({"success" : true, "message" : "Posts are importing..."});
				}

			} else {

				self.view500("Failed to parse file contents. Needs to be a JSON array!");
			}

		} catch (ex) {

			console.log(ex);

			self.view500("Failed to parse file contents!");
		}
	});	
};


$.apiGetFile = function() {

	var self = this;

	var user = self.user.id;
	var key = self.body.key;

	common.CBGetFile(user, key, function(result) {

		self.json(result);
	});
};


$.apiReturnFile = function(type, key) {

	var self = this;

	var user = self.user.id;

	console.log("HERE");

	/* Check user has that file in db and if they do return it with the mime type set...otherwise return 404 */
//	common.EIGetFile(user, key, function(result) {

//		if(result.success == false) {

//			self.view404();

//		} else {

			//var file = result.message[0];

			/* Set the download name to the orignal filename rather then the file key */
			var headers = [];
			headers['Content-Type'] = "image/jpg";
			headers['Access-Control-Allow-Origin'] = '*';

			var filename = F.config[`files-${type}-dir`] + key;

			var fullPath = F.path.root(filename);

			console.log(fullPath);

			fs.access(fullPath, fs.constants.R_OK, (err) => {

				if(err) {
	
					self.view404();

				} else {

					self.file(`~${fullPath}`, key, headers);
				}
			});
//		}
//	});
};
