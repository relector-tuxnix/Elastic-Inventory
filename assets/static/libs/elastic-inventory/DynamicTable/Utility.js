/***

                                                                                
    @@@  @@@  @@@@@@@  @@@  @@@       @@@  @@@@@@@  @@@ @@@          @@@   @@@@@@   
    @@@  @@@  @@@@@@@  @@@  @@@       @@@  @@@@@@@  @@@ @@@          @@@  @@@@@@@   
    @@!  @@@    @@!    @@!  @@!       @@!    @@!    @@! !@@          @@!  !@@       
    !@!  @!@    !@!    !@!  !@!       !@!    !@!    !@! @!!          !@!  !@!       
    @!@  !@!    @!!    !!@  @!!       !!@    @!!     !@!@!           !!@  !!@@!!    
    !@!  !!!    !!!    !!!  !!!       !!!    !!!      @!!!           !!!   !!@!!!   
    !!:  !!!    !!:    !!:  !!:       !!:    !!:      !!:            !!:       !:!  
    :!:  !:!    :!:    :!:   :!:      :!:    :!:      :!:  :!:  !!:  :!:      !:!   
    ::::: ::     ::     ::   :: ::::   ::     ::       ::  :::  ::: : ::  :::: ::   
     : :  :      :     :    : :: : :  :       :        :   :::   : :::    :: : :    
                

    * BASED ON:
    * 	 Stackoverflow Q & A                                                        

    |----------------------------------|
    | UTILITY.JS                       |
    |     -Useful helper functions     |
    |----------------------------------|

***/


/* Useful to have some nice colours for graphs etc */
var colourPalette = ['rgb(44,154,222)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)',
                   'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)',
                   'rgb(201, 203, 207)', '#FF6633', '#FFB399', '#FF33FF', '#FFFF99',
                   '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
                   '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', '#FF99E6',
                   '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC', '#66994D', '#B366CC',
                   '#4D8000', '#B33300', '#CC80CC', '#66664D', '#991AFF', '#E666FF',
                   '#4DB3FF', '#1AB399', '#E666B3', '#33991A', '#CC9999', '#B3B31A',
                   '#00E680', '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
                   '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', '#E64D66',
                   '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];


function validateIP(address) {

    if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address)) {

        if (/(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/.test(address)) {
            // Internal IP
            return 1;
        } else {
            // External IP
            return 2;
        }
    }

    if (/(^i\-)[0-9a-zA-Z]*?$/.test(address)) {
        // It's an AWS instance ID
        return 401;
    }

    if(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(address)) {
        // It's a GUID
        return 101;
    }

    if (/((^INC)|(^REQ)|(^CRQ)|(^WO))[0-9]*?$/.test(address)) {

        // It's a remedy number
        return 201;
    }

    if (/[^@]+@[^\.]+\..+/g.test(address)) {

        // It's a email address
        return 301;
    }

    // Not an IP or GUID
    return 0;
}


function isUrlValid(url) {

    return /^((https?|ftp):\/\/)?(([^:\n\r]+):([^@\n\r]+)@)?((www\.)?([^/\n\r]+))\/?([^?\n\r]+)?\??([^#\n\r]*)?#?([^\n\r]*)/i.test(url);
}

String.prototype.capitalize = function(string) {

    var target = this;
    return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
}


String.prototype.capitalizeAll = function() {

    var target = this;
    return target.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });     
};


/* Removes new lines, double spaces, tabs */
String.prototype.clean = function() {

    var target = this;
    return target.replace(/\s\s+/g, '');
};


String.prototype.replaceAll = function(search, replacement) {

    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


String.prototype.toCamelCase = function() {

    var target = this;
    return target.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); }).replace(/\s/g, '').replace(/^(.)/, function($1) { return $1.toLowerCase(); });
};


String.prototype.htmlEntities = function() {
    
    var target = this;
    return target.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};


function isNull(value) {

    if(value == null || value == undefined) {
        return true;
    }

    return false;
};


function isNullOrWhiteSpace(value) {

    if(value == null || value == undefined || value == "") {
        return true;
    }

    return false;
};


function isNullOrEmpty(value) {

    if(value == null || value == undefined || value == "" || value == {} || value == []) {
        return true;
    }

    return false;
};


function writeBlob(b64data, type) {

    var byteString = atob(b64data);

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for(var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return URL.createObjectURL(new Blob([ab], { type: type }));
}


function bytesToSize(bytes) {

    var sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if(bytes == 0) {
        return '0 Bytes';
    }

    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}


function toClipboard(value) {

    console.log(`Copying to clipboard: "${value}"`);

    var temp = $("<input>");
    $("body").append(temp);
    $(temp).val(value).select();
    document.execCommand("copy");
    $(temp).remove();
}


function getUrlParam(name) {

    if(name=(new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        
        return name[1].replace(/%20/g, ' ').replace(/%27/g, "'");
    }

    return "";
}


/*
 * Return true if supplied test function passes for ALL items in an array
 */
function allMatch(item, arrayOrObject, test) {

    // start off with true result by default
    var match = true;
    var isArray = $.isArray(arrayOrObject);

    // Loop through all items in array
    $.each(arrayOrObject, function(key, value) {

        var result = isArray ? test(item, value) : test(item, key, value);

        // If a single item tests false, go ahead and break the array by returning false
        // and return false as result,
        // otherwise, continue with next iteration in loop
        // (if we make it through all iterations without overriding match with false,
        // then we can return the true result we started with by default)
        if(!result) { 
			return match = false; 
		}
    });

    return match;
}


/* 
 * Find an object in an array of objects by attributes.
 * E.g. find object with {id: 'hi', name: 'there'} in an array of objects
 */
function findObjectInArray(array, objectAttr) {

    /* We want our found item to be the last item in the array, so we dont break on first find */
    var foundObject = null;

    for(var i = 0, len = array.length; i < len; i++) {

        var item = array[i];

        // For each object in array, test to make sure all attributes in objectAttr match
        if(allMatch(item, objectAttr, function(item, key, value) { return item[key] == value; })) {
            foundObject = item;
        }
    }

    return foundObject;
}


/* 
 * Find all objects in an array of objects by attributes.
 * E.g. find object with {id: 'hi', name: 'there'} in an array of objects
 */
function findObjectsInArray(array, objectAttr) {

    var foundObjects = [];

    for(var i = 0, len = array.length; i < len; i++) {

        var item = array[i];

        // For each object in array, test to make sure all attributes in objectAttr match
        if(allMatch(item, objectAttr, function(item, key, value) { return item[key] == value; })) {
            foundObjects.push(item);
        }
    }

    return foundObjects;
}


/*
 * Recursively merge properties of obj2 into obj1 (destructive changes to obj1 only)
 * Oject 2 will clobber Object 1 even with:
 *   '', [], {}, function
 * Object 1 will be preserved from Object 2 clobbering for values of:
 *    null, undefined
 */
function overload(obj1, obj2) {

    if(isNull(obj2)) {
        return obj1;
    }

    if(isNull(obj1)) {
        return obj2;
    }

    if(obj1.constructor == Object && obj2.constructor == Object) {

        for(var p in obj2) {

            if(isNullOrEmpty(obj2[p]) == false) {

                // Property in destination object set; update its value.
                if(obj2[p].constructor == Object) {

                    if(p in obj1 && obj1[p].constructor == Object) {

                        overload(obj1[p], obj2[p]);

                        continue;
                    }

                } else if(obj2[p].constructor == Array) {

                    if(p in obj1 && obj1[p].constructor == Array) {

                        overload(obj1[p], obj2[p]);
                
                        continue;
                    }
                }
            }

            /* Do a blind copy, so long as its not null */
            if(isNull(obj2[p]) == false) {

                obj1[p] = obj2[p];

                continue;
            }

            /* Object 1 has the same keys as Object 2 if it does not exist already. */
            if(p in obj1 == false) {

                obj1[p] = '';
            }
      
            /* Otherwise, lets preserve Object 1 key=>value and move on. */
        }

    } else if(obj1.constructor == Array && obj2.constructor == Array) {

        for(var i = 0, len = obj2.length; i < len; i++) {

            obj1.push(obj2[i]);
        }
    
    } else if(obj1.constructor == Array && obj2.constructor == Object) {

        obj1.push(obj2);

    } else {

        /* Object 2 should override Object 1 -> two function for example. */
        obj1 = obj2;
    }

    return obj1;
}


/* 
 * Do a deep copy of an object!
 * -No circular references allowed
 * -No functions allowed
 */
function clone(obj1) {

    return JSON.parse(JSON.stringify(obj1));
}


/*
 * Sort a collection of DIV's by attribute 'data-sort'
 */
$.fn.sortDivs = function sortDivs() {

    $(this).children().sort(function(a, b) {
		return ($(b).data("sort")) < ($(a).data("sort")) ? 1 : -1; 
	}).appendTo(this);
};


