/*
 * TODO:
 *  -Ordering of columns
 *  -Cleanup input CSS
 *  -Export icon
 *  -Get by json attribute / id
 */
(function($) {

	var modelPrototypes = {
		dom: Dom,
		domColumns: DomColumns,
		records: Records,
		recordsCount: RecordsCount,
		sorts: Sorts,
		sortsHeaders: SortsHeaders,
		queries: Queries,
		inputsSearch: InputsSearch,
		inputsExport: InputsExport,
		inputsSelect: InputsSelect,
		inputsContextMenu: InputsContextMenu,
		paginationPage: PaginationPage,
		paginationPerPage: PaginationPerPage,
		paginationLinks: PaginationLinks
	}; 

	//-----------------------------------------------------------------
	// Cached plugin global defaults
	//-----------------------------------------------------------------
	var defaults = {

		template: `	

			<div id="loader" class="gunner">&nbsp;</div>
	
			<ul id="context-menu">
				<li id="context-menu-new-tab">New Tab</li>
				<li id="context-menu-copy-link">Copy Link</li>
				<li id="context-menu-copy-cell">Copy Cell</li>
				<li id="context-menu-copy-row">Copy Row</li>
				<li id="context-menu-copy-column">Copy Column</li>
			</ul>

			<div id="default-table-wrapper">

				<select id="dynamictable-per-page" class="dynamictable-per-page-select form-control">&nbsp;</select>
				<div class="filler-header">&nbsp;</div>
				<input id="dynamictable-search" type="search" class="form-control" placeholder="Filter results...">
				<div id="dynamictable-export" class="btn btn-dark"><i class="fa fa-download" aria-hidden="true">&nbsp;</i></div>

				<table id="grid" class="table table-sm table-light">
					<thead>
						<tr>
						  	<th class="th-check-box text-center" data-dynamictable-no-sort="true">
								<div class="checkbox">
									<input type="checkbox" id="" val="" />
									<label for=""></label>
								</div>
							</th>
							<th id="empty-message" data-dynamictable-no-sort="true">No results found.</th>
							<th id="th-default" scope="col"></th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="tb-check-box text-center">
								<div class="checkbox">
									<input type="checkbox" id="" val="" />
									<label for=""></label>
								</div>
							</td>
							<td id="tb-default"><a href="#" target="_blank"></a></td>
						</tr>
					</tbody>
				</table>

				<span id="dynamictable-record-count">&nbsp;</span>
				<div class="filler-footer">&nbsp;</div>
				<ul id="dynamictable-pagination-links">&nbsp;</ul>

			</div>`,
		paginatePage: true,
		paginatePerPage: true,
		recordCount: true,
		sort: true,
		search: true,
		select: true,
		export: true,
		contextMenu: true,

		columns: [],
		columnsIgnore: ['dynamictable-index'],
		exportsIgnore: ['dynamictable-index'],
		orderColumn: [],
		idColumn: ['Id'],
		cells: {},

		shiftState: false,
		paginationClass: 'dynamictable-pagination-links',
		paginationLinkClass: 'dynamictable-page-link',
		paginationPrevClass: 'dynamictable-page-prev',
		paginationNextClass: 'dynamictable-page-next',
		paginationActiveClass: 'dynamictable-active-page',
		paginationDisabledClass: 'dynamictable-disabled-page',
		paginationPrev: 'Previous',
		paginationNext: 'Next',
		paginationGap: [1,2,2,1],

		totalRecordCount: null,
		queries: [],
		queryRecordCount: null,
		page: null,
		perPageDefault: 10,
		perPageOptions: [5, 10, 20, 50, 100, 200],
		sorts: {},
		sortsKeys: [],
		sortTypes: {},
		records: []
	};


	//-----------------------------------------------------------------
	// Each dynamictable instance inherits from this,
	// set properties specific to instance
	//-----------------------------------------------------------------
	var dt = {

		init: function(element, options) {

			this.settings = $.extend(true, {}, defaults, options);

			this.settings.element = element.id;

			for(model in modelPrototypes) {

				if(modelPrototypes.hasOwnProperty(model)) {

					var modelInstance = this[model] = new modelPrototypes[model](this, this.settings);

					if(modelInstance.initOnLoad()) {
						modelInstance.init();
					}
				}
			}
			
			this.process();

			return this;
		},

		process: function() {

			this.records.resetOriginal();
			this.queries.run();

			if(this.settings.sort) {
				 this.records.sort();
			}

			if(this.settings.paginatePage) {
				 this.records.paginate();
			}

			this.dom.update();
		},

		/* Lets reset the table to empty */
		setEmpty: function(hideAll) {

			this.$elementTable.find('thead th').hide();
			this.$elementTable.find('#empty-message').show();

			if(hideAll == true) {
				this.$element.children().not("#grid").hide();
			}
		},

		setFull: function(showAll) {

			this.$elementTable.find('thead th').show();
			this.$elementTable.find('#empty-message').hide();

			if(showAll == true) {

				$('#loader').hide();

				this.$element.children().not("script").show();
			}
		}
	};


    //-----------------------------------------------------------------
    // Dynatable object models
    //-----------------------------------------------------------------
    function Dom(obj, settings) {

        var _this = this;

		this.initOnLoad = function() { 
			return true; 
		};

		this.init = function() {

			/* We only want one template per page */
			$('#default-table-wrapper').remove();
			$('#context-menu').remove();

			/* Now lets add our default template to the DOM */
			$('body').prepend(settings.template);

			/* Now we get our inserted template element */
			obj.$defaultElement = $('#default-table-wrapper');

			/* We add the required DOM elements to the users element */
			obj.$element = $(`#${settings.element}`);
			obj.$element.append(obj.$defaultElement.clone().html());
			obj.$elementTable = obj.$element.find('#grid');
			obj.$elementTable.find('thead tr').children().not('.th-check-box').not('#empty-message').remove();
			obj.$elementTable.find('.th-check-box input').attr('id', `${settings.element}-checkbox`);
			obj.$elementTable.find('.th-check-box label').attr('for', `${settings.element}-checkbox`);
			obj.$elementTable.find('tbody tr').remove();

			/* Enable cell expanding for better space utilisation */
			obj.$elementTable.on('click', 'tbody td', function() {

				var $td = $(this);
				var $row = $td.parent();
				var col = $row.children().index(this);

				if(settings.select) {
					col += 1;
				}

            	obj.$elementTable.find(`td:nth-child(${col})`).each(function() {

					var checked = $td.parent().find('.tb-check-box input').prop('checked');
					
					/* Shrink the column if it's expanded, and either the clicked row is selected or the cell can't be selected */
					if($(this).hasClass('td-select')) {
					 
						$(this).removeClass("td-select");

						if(checked == false) {
							$(this).removeClass('off');
						}
					
					/*Expand the column if: the clicked row is either unselected or the cells are links, and not checkboxes */
					} else if($(this).hasClass('td-checkbox') == false) {

						$(this).addClass("td-select");

						if(checked == false) {
							$(this).addClass('off');
						}
					}
				});
			});
		};

        /* Update table contents with new records array from query */
        this.update = function() {

			/* Always do this first to keep the DOM clean */
			obj.$elementTable.find('tbody').children().remove();

			/* If we have nothing to show then go no further */
			if(settings.records.length == 0) {

				obj.setEmpty(false);

				return;
			}

			/* Loop through records and render rows -> cells */
            for(var i = 0, len = settings.records.length; i < len; i++) {

				var record = settings.records[i];

				/* From the grid row, clone the default table row and then remove from the grid */
				var $tr = obj.$defaultElement.find('tbody tr').clone().removeAttr('id');

				if(settings.select) {
					var uniqueId = record['dynamictable-index']
					$tr.find('.tb-check-box input').val(uniqueId);
					$tr.find('.tb-check-box input').attr('id', `${settings.element}-checkbox-${uniqueId}`);
					$tr.find('.tb-check-box label').attr('for', `${settings.element}-checkbox-${uniqueId}`);
				}

				/* grab the record's attribute for each column */
				for(var j = 0, len2 = settings.columns.length; j < len2; j++) {

					var column = settings.columns[j];
					var key = column.id;

					$td = $tr.find('#tb-default').clone().removeAttr('id');

					/* We have a custom cell */
					if(key in settings.cells) {

						eval(settings.cells[key]);

					} else {

						$td.text(record[key]);
					}

					/* keep cells for hidden column headers hidden */
					if(column.hidden) {
						$td.hide();
					}

					$tr.append($td);
				}

				$tr.find('#tb-default').remove();

				obj.$elementTable.find('tbody').append($tr);
			}

            /* Interactive Elements */
            if(settings.paginatePage) {
				obj.paginationLinks.update();
            }

			if(settings.paginatePerPage) {
				obj.paginationPerPage.update();
	 		}

            if(settings.recordCount) {
				obj.recordsCount.update();
			}

            /* Sort headers functionality */
            if(settings.sort && settings.columns) {

                obj.sortsHeaders.removeAllArrows();

                for(var i = 0, len = settings.columns.length; i < len; i++) {

                    var column = settings.columns[i];
                    var sortedByColumn = utility.allMatch(settings.sorts, column.sorts, function(sorts, sort) { return sort in sorts; });
                    var value = settings.sorts[column.sorts[0]];

                    if(sortedByColumn) {

                        obj.$element.find('[data-dynamictable-column="' + column.id + '"]').find('.dynamictable-sort-header').each(function() {

                            if(value == 1) {
                                obj.sortsHeaders.appendArrowUp($(this));
                            } else {
                                obj.sortsHeaders.appendArrowDown($(this));
                            }
                        });
                    }
                }
            }

			obj.setFull(true);
     	};
    };


	//-----------------------------------------------------------------
	// Given the settings.records json get the columns (key/column => value)
	//-----------------------------------------------------------------
	function DomColumns(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return obj.$elementTable.is('table');
		};

		this.init = function() {

			if(settings.columns.length == 0 && settings.records.length > 0) {

				columns = Object.keys(settings.records[0]);

				for(var i = 0; i < columns.length; i++) {

					var label = columns[i];

					if(settings.columnsIgnore.indexOf(label) == -1) {

						_this.add(label, i);
					}
				}
			}
		};

		this.add = function(label, position) {
	
			var columns = settings.columns;
			var id = label;

			/* Add tr th to the DOM */
			var $column = obj.$defaultElement.find('#th-default').clone().remove('id');
			$column = $column.text(label).attr('data-dynamictable-column', id).addClass('dynamictable-head');
			obj.$elementTable.find('thead tr').append($column);

			/* Add column data to plugin instance */
			columns.splice(position, 0, {
				index: position,
				label: label,
				id: id,
				sorts: [id],
				hidden: false
			});
		};

		this.remove = function(columnIndexOrId) {

			var columns = settings.columns;
			var length = columns.length;

			if(typeof(columnIndexOrId) === "number") {

				var column = columns[columnIndexOrId];
				this.removeFromTable(column.id);
				this.removeFromArray(columnIndexOrId);

			} else {

				// Traverse columns array in reverse order so that subsequent indices
				// don't get messed up when we delete an item from the array in an iteration
				for(var i = columns.length - 1; i >= 0; i--) {

					var column = columns[i];

					if(column.id === columnIndexOrId) {
						this.removeFromTable(columnIndexOrId);
						this.removeFromArray(i);
					}
				}
			}

			obj.dom.update();
		};

		this.removeFromTable = function(columnId) {
			obj.$elementTable.find('thead tr').children('[data-dynamictable-column="' + columnId + '"]').first().remove();
		};

		this.removeFromArray = function(index) {
			
			var columns = settings.columns;
			var adjustColumns;

			columns.splice(index, 1);

			adjustColumns = columns.slice(index, columns.length);

			for(var i = 0, len = adjustColumns.length; i < len; i++) {
				adjustColumns[i].index -= 1;
			}
		};
	};


    //-----------------------------------------------------------------
    // Dynatable object models
    //-----------------------------------------------------------------
	function Records(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return true;
		};

		this.init = function() {

			/* Give each record a unique key */
			for(var i = 0, len = settings.records.length; i < len; i++) {
				settings.records[i]['dynamictable-index'] = i;
			}

			// Create cache of original full recordset (unpaginated and unqueried)
			settings.originalRecords = $.extend(true, [], settings.records);
		};

		// For really advanced sorting, see http://james.padolsey.com/javascript/sorting-elements-with-jquery/
		this.sort = function() {
				
			var sort = [].sort;
			var sorts = settings.sorts;
			var sortsKeys = settings.sortsKeys;
			var sortTypes = settings.sortTypes;

			var sortFunction = function(a, b) {
				
				var comparison;
				
				if($.isEmptyObject(sorts)) {

					comparison = obj.sorts.functions['originalPlacement'](a, b);

				} else {

					for(var i = 0, len = sortsKeys.length; i < len; i++) {

						var attr = sortsKeys[i];
						var direction = sorts[attr];
						var sortType = sortTypes[attr] || obj.sorts.guessType(a, b, attr);
						var comparison = obj.sorts.functions[sortType](a, b, attr, direction);

						// Don't need to sort any further unless this sort is a tie between a and b,
						// so break the for loop unless tied
						if(comparison !== 0) { 
							break; 
						}
					}
				}
				
				return comparison;
			}

			return sort.call(settings.records, sortFunction);
		};

		this.paginate = function() {

			var bounds = this.pageBounds();
			var first = bounds[0];
			var last = bounds[1];
			
			settings.records = settings.records.slice(first, last);
		};

		this.resetOriginal = function() {
			settings.records = settings.originalRecords || [];
		};

		this.pageBounds = function() {

			var page = settings.page || 1;
			var first = (page - 1) * settings.perPage;
			var last = Math.min(first + settings.perPage, settings.queryRecordCount);

			return [first, last];
		};

		// count records from table
		this.count = function() {

			return settings.records.length;
		};
	};


	//-----------------------------------------------------------------
    // Dynatable object models
    //-----------------------------------------------------------------
	function RecordsCount(obj, settings) {

		this.initOnLoad = function() {
			return settings.recordCount;
		};

    	this.init = function() {};

		this.create = function() {

			var recordsShown = obj.records.count();
			var	recordsQueryCount = settings.queryRecordCount;
			var	recordsTotal = settings.totalRecordCount;
			var	text = 'Showing ';

			if(recordsShown < recordsQueryCount && settings.paginatePage) {

				var bounds = obj.records.pageBounds();
				
				text += "<span class='dynamictable-record-bounds'>" + (bounds[0] + 1) + " to " + bounds[1] + "</span> of ";

			} else if(recordsShown === recordsQueryCount && settings.paginatePage) {

				text += recordsShown + " of ";
			}

			text += recordsQueryCount;

			if(recordsQueryCount < recordsTotal) {
				text += " (filtered from " + recordsTotal + " total records)";
			}

			return text;
		};

		this.update = function() {
			obj.$element.find('#dynamictable-record-count').html(obj.recordsCount.create());
		};

		this.attach = function() {
			obj.$element.after(this.create());	
		};
	};
    

	//-----------------------------------------------------------------
    // Dynatable object models
    //-----------------------------------------------------------------
	function Sorts(obj, settings) {

		this.initOnLoad = function() {
			return settings.sort;
		};

		this.init = function() {

			if(!settings.sortsKeys.length) {
				settings.sortsKeys = Object.keys(settings.sorts);
			}
		};

		this.add = function(attr, direction) {

			var sortsKeys = settings.sortsKeys;
			var index = $.inArray(attr, sortsKeys);

			settings.sorts[attr] = direction;

			if(index === -1) { 
				sortsKeys.push(attr);
			}

			return dt;
		};

		this.remove = function(attr) {

			var sortsKeys = settings.sortsKeys;
			var	index = $.inArray(attr, sortsKeys);

			delete settings.sorts[attr];

			if(index !== -1) { 
				sortsKeys.splice(index, 1); 
			}

			return dt;
		};

		this.clear = function() {
			settings.sorts = {};
			settings.sortsKeys.length = 0;
		};

		// Try to intelligently guess which sort function to use
		// based on the type of attribute values.
		// Consider using something more robust than `typeof` (http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/)
		this.guessType = function(a, b, attr) {

			var types = {
				string: 'string',
				number: 'number',
				'boolean': 'number',
				object: 'number' // dates and null values are also objects, this works...
			};
			
			var attrType = a[attr] ? typeof(a[attr]) : typeof(b[attr]);
			var type = types[attrType] || 'number';
			
			return type;
		};

		// Built-in sort functions
		// (the most common use-cases I could think of)
		this.functions = {

			number: function(a, b, attr, direction) {
				return a[attr] === b[attr] ? 0 : (direction > 0 ? a[attr] - b[attr] : b[attr] - a[attr]);
			},

			string: function (a, b, attr, direction) {

				var aAttr = (a['dynamictable-sortable-text'] && a['dynamictable-sortable-text'][attr]) ? a['dynamictable-sortable-text'][attr] : a[attr];
				var bAttr = (b['dynamictable-sortable-text'] && b['dynamictable-sortable-text'][attr]) ? b['dynamictable-sortable-text'][attr] : b[attr];

				aAttr = aAttr.toLowerCase();
				bAttr = bAttr.toLowerCase();

				var comparison = aAttr === bAttr ? 0 : (direction > 0 ? aAttr > bAttr : bAttr > aAttr);

				// force false boolean value to -1, true to 1, and tie to 0
				return comparison === false ? -1 : (comparison - 0);
			},

			originalPlacement: function(a, b) {
				return a['dynamictable-original-index'] - b['dynamictable-original-index'];
			}
		};
	};


  	//-----------------------------------------------------------------
    // Turn table headers into links which add sort to sorts array
    //-----------------------------------------------------------------
	function SortsHeaders(obj, settings) {

	    var _this = this;

    	this.initOnLoad = function() {
    	  	return settings.sort;
    	};

    	this.init = function() {
      		this.attach();
    	};

		this.create = function(cell) {
			
			var $cell = $(cell);

			/* We only want the link created once! */
			if($cell.children().length > 0) {
				return;
			}

			var $link = $('<a></a>', {
				'class': 'dynamictable-sort-header',
				href: '#',
				html: $cell.html()
			});
			
			var id = $cell.data('dynamictable-column');

			var column = utility.findObjectInArray(settings.columns, {id: id});

			$link.bind('click', function(e) {
				_this.toggleSort(e, $link, column);
				obj.process();
				e.preventDefault();
			});

			if(this.sortedByColumn($link, column)) {
				if (this.sortedByColumnValue(column) == 1) {
					this.appendArrowUp($link);
				} else {
					this.appendArrowDown($link);
				}
			}

			return $link;
		};

		this.removeAll = function() {

			obj.$elementTable.find('thead tr').children('th,td').each(function() {
				_this.removeAllArrows();
				_this.removeOne(this);
			});
		};

		this.removeOne = function(cell) {

			var $cell = $(cell);
			var $link = $cell.find('.dynamictable-sort-header');

			if($link.length) {
				var html = $link.html();
				$link.remove();
				$cell.html($cell.html() + html);
			}
		};

		this.attach = function() {
				
			obj.$elementTable.find('thead tr').children('th,td').each(function() {
				_this.attachOne(this);
			});
		};

		this.attachOne = function (cell) {

			var $cell = $(cell);

			if(!$cell.data('dynamictable-no-sort')) {
				$cell.html(this.create(cell));
			}
		};

		this.appendArrowUp = function($link) {
			this.removeArrow($link);
			$link.append("<span class='dynamictable-arrow'> &#9650;</span>");
		};

		this.appendArrowDown = function($link) {
			this.removeArrow($link);
			$link.append("<span class='dynamictable-arrow'> &#9660;</span>");
		};

		this.removeArrow = function($link) {
			// Not sure why `parent()` is needed, the arrow should be inside the link from `append()` above
			$link.find('.dynamictable-arrow').remove();
		};

		this.removeAllArrows = function() {
			obj.$elementTable.find('.dynamictable-arrow').remove();
		};

		this.toggleSort = function(e, $link, column) {

			var sortedByColumn = this.sortedByColumn($link, column);
			var value = this.sortedByColumnValue(column);

			this.removeAllArrows();
			obj.sorts.clear();

			// If sorts for this column are already set
			if(sortedByColumn) {

				// If ascending, then make descending
				if(value == 1) {

					for (var i = 0, len = column.sorts.length; i < len; i++) {
						obj.sorts.add(column.sorts[i], -1);
					}
		
					this.appendArrowDown($link);

				// If descending, remove sort
				} else {
					
					for (var i = 0, len = column.sorts.length; i < len; i++) {
						obj.sorts.remove(column.sorts[i]);
					}
					
					this.removeArrow($link);
				}

			// Otherwise, if not already set, set to ascending
			} else {

				for(var i = 0, len = column.sorts.length; i < len; i++) {
					obj.sorts.add(column.sorts[i], 1);
				}

				this.appendArrowUp($link);
			}
		};

		this.sortedByColumn = function($link, column) {
			return utility.allMatch(settings.sorts, column.sorts, function(sorts, sort) { return sort in sorts; });
		};

		this.sortedByColumnValue = function(column) {
			return settings.sorts[column.sorts[0]];
		};
	};


  	//-----------------------------------------------------------------
	// 
	//-----------------------------------------------------------------
	function Queries(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return settings.search;
		};

		this.init = function() { 
			settings.queries = [];
		};	

		/* Shortcut for performing simple query from built-in search */
		this.runSearch = function(q) {

			/* reset to first page since query will change records */
			if(settings.paginatePage) {
				settings.page = 1;
			}

			settings.queries = [q];
			
			obj.process();
		};

		this.run = function() {

			for(var i = 0, len = settings.queries.length; i < len; i++) {

				query = settings.queries[i];

				// collect all records that return true for query
				settings.records = $.map(settings.records, function(record) {
					return _this.search(record, query) ? record : null;
				});
			}

			settings.queryRecordCount = obj.records.count();

			if(settings.queryRecordCount == 0) {
				obj.setEmpty(false);
			}
		};

		// Query functions for in-page querying
		// each function should take a record and a value as input
		// and output true of false as to whether the record is a match or not
		this.search = function(record, queryValue) {

			var contains = false;

			// Loop through each attribute of record
			for(attr in record) {

				if(record.hasOwnProperty(attr)) {

					var attrValue = record[attr];

					if(typeof(attrValue) === "string" && attrValue.toLowerCase().indexOf(queryValue.toLowerCase()) !== -1) {

						contains = true;

						// Don't need to keep searching attributes once found
						break;

					} else {

						continue;
					}
				}
			}

			return contains;
		};
	};


	//-----------------------------------------------------------------
	// Provide a public function for selecting page
	//-----------------------------------------------------------------
	function InputsSearch(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return settings.search;
		};

		this.init = function() {
			_this.create();
		};

		this.create = function() {

			var $search = obj.$element.find('#dynamictable-search');	

			$search.bind('keyup', function(e) {
				
				if(e.which == 13) {
					obj.queries.runSearch($(this).val());
					e.preventDefault();
				}
			});
		};
	};


	//-----------------------------------------------------------------
	// Export functionality
	//-----------------------------------------------------------------
	function InputsExport(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return settings.export && settings.select;
		};

		this.init = function() {
			_this.create();
		};

		this.create = function() {

			var $export = obj.$element.find('#dynamictable-export');	

			$export.click(function() {

				var items = obj.inputsSelect.getSelected();

				console.log(items);

				if(items.length > 0) {

					_this.downloadText('output.csv', _this.convertToCSV(items), "text/csv");
				}
			});
		};

		this.arrayToCSV = function(strArray) {

			var result = "";

			for(var i = 0; i < strArray.length; i++) {

				if(i > 0) {
					result += ",";
				}

				var value = String(strArray[i]).clean();

				/* If our value contains semicolums then we need to ensure the whole block is in quotes */
				if(value.indexOf(",") !== -1) {
					value = `"${value}"`;
				}

				result += value;
			};

			return result;
		};

		this.convertToCSV = function(data) {

			var columnDelimiter = ',';
			var lineDelimiter = '\n';

			if(data == null || !data.length) {
				return "";
			}

			var keys = Object.keys(data[0]);

			var result = '';
			result += keys.join(columnDelimiter);
			result += lineDelimiter;

			data.forEach(function(item) {

				var values = [];

				keys.forEach(function(key) {

					values.push(item[key]);
				});

				result += _this.arrayToCSV(values);

				result += lineDelimiter;
			});

			return result;
		};

		this.downloadText = function(filename, text, type) {

			var blob = new Blob([text], { type: `${type};charset=utf-8;` });

			var link = document.createElement("a");

			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		};
	};


	//-----------------------------------------------------------------
	// Select functionality
	//-----------------------------------------------------------------
	function InputsSelect(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			if(settings.select == false) {
				obj.$defaultElement.find('.th-check-box').remove();
				obj.$defaultElement.find('.tb-check-box').remove();
			}

			return settings.select;
		};

		this.init = function() {

			_this.first = null;

			_this.create();
		};

		this.create = function() {

			$(document).on('keyup keydown', function(e) {
				settings.shiftState = e.shiftKey;
			});

			obj.$elementTable.on('click', '.tb-check-box input', function(e) {

				var checked = $(this).prop("checked");

				if(checked) {

					$(this).prop('checked', true);

                    _this.highlightRow($(this).parent().parent().parent());

				} else {
					
					$(this).prop('checked', false);

 					_this.unhighlightRow($(this).parent().parent().parent());
				}
			});

			obj.$elementTable.on('click', '.th-check-box input', function(e) {

				var checked = $(this).prop("checked");

				obj.$elementTable.find('.tb-check-box input').each(function(index) {

					if(checked) {

						$(this).prop('checked', true);

                        _this.highlightRow($(this).parent().parent().parent());

					} else {

						$(this).prop('checked', false);

                        _this.unhighlightRow($(this).parent().parent().parent());
					}
				});
			});

			obj.$elementTable.on('change', '.tb-check-box input', function(e) {

				/* Don't shift select when the table's header's checkbox is checked. */
				if(obj.$elementTable.find('.th-check-box input').prop('checked') == false) {
					_this.shiftSelect(this);
				}
			});
		};

		this.highlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).addClass('td-highlight');

				if($(this).hasClass('off')) {
					$(this).attr('data-keep-off', 'true');
				} else {
					$(this).addClass('off');
				}
			});
		};

		this.unhighlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).removeClass('td-highlight');

				if ($(this).attr('data-keep-off')) {
					$(this).removeAttr('data-keep-off');
				} else {
					$(this).removeClass('off');
				}
			});
		};

		this.getSelected = function() {

			var ids = [];

			var ticks = obj.$elementTable.find('.tb-check-box input');

			for(i = 0; i < ticks.length; i++) {

				var tick = ticks[i];

				if(tick.checked) {

					var completeRecord = utility.findObjectInArray(settings.records, {
						'dynamictable-index' : tick.value
					});

					if(completeRecord == null) {
						continue;
					}

					for(var j = 0, len = settings.exportsIgnore.length; j < len; j++) {
						delete completeRecord[settings.exportsIgnore[j]];
					}
					
					ids.push(completeRecord);
				}
			}

			return ids;
		};

        this.shiftSelect = function(checkbox) {

            /* Make sure shift is selected ! */
            if(settings.shiftState == true) {

                /* We need two check boxes checked */
                if(_this.first == null) {
                    return;
                }

                /* Make sure we have a range between FIRST and LAST */
                var last = checkbox;
                var temp = 0;
                var firstIndex = 0;
                var lastIndex = 0;

                /* Find out the index of the selected boxs */
                obj.$elementTable.find('.tb-check-box input').each(function(index) {

                    /* Lets work out the click indexes */
                    if(this == _this.first) {
                        firstIndex = index;
                    }

					if(this == last) {
                        lastIndex = index;
                    }
                });

                /* Once we know the direction set it */
                if(firstIndex >= lastIndex) {
                    temp = lastIndex;
                    lastIndex = firstIndex;
                    firstIndex = temp;
                }

                /* Select everything from the FIRST to the LAST checkbox */
                obj.$elementTable.find('.tb-check-box input').each(function(index) {

                    if(index >= firstIndex && index <= lastIndex) {

                        $(this).prop('checked', true);

	                    _this.highlightRow($(this).parent().parent().parent());

                    } else {

                        $(this).prop('checked', false);

	                    _this.unhighlightRow($(this).parent().parent().parent());
					}
                });

				_this.first = checkbox;

            } else {

                _this.first = checkbox;
            }
        }
	};


	//-----------------------------------------------------------------
	// Context Menu functionality
	//-----------------------------------------------------------------
	function InputsContextMenu(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return settings.contextMenu;
		};

		this.init = function() {
			_this.create();
		};

		this.create = function() {

			/* Allow a context menu to appear when right click occurs. */
			$(document).on('contextmenu', `#${settings.element} tbody td`, function(event) {

				$('#context-menu').children().hide();

				$('#context-menu').css({
					display: "block",
					left: event.pageX,
					top: event.pageY
				});


				/* If we have a link then provide new tab option */
				var link = $(this).find('a');

				if(link.length == 1) {

					var linkHref = $(link).attr('href');

					if(utility.isNullOrWhiteSpace(linkHref) == false) {

						$('#context-menu-new-tab').show();
						$('#context-menu-new-tab').off('click');

						$('#context-menu-copy-link').show();
						$('#context-menu-copy-link').off('click');

						$('#context-menu-new-tab').on('click', function() {

							window.open(linkHref, '_blank');

							$('#context-menu').hide();
						});

						$('#context-menu-copy-link').on('click', function() {

							/* We have a relative link */
							if(linkHref.startsWith("/") == true) {
								_this.toClipboard(`${window.location.protocol}\/\/${window.location.host}${linkHref}`);
							} else {
								_this.toClipboard(linkHref);
							}

							$('#context-menu').hide();
						});
					}
				}

				/* Get our cell of text */
				var cellText = $(this).text();

				if(utility.isNullOrWhiteSpace(cellText) == false) {

					$('#context-menu-copy-cell').show();
					$('#context-menu-copy-cell').off('click');

					$('#context-menu-copy-cell').on('click', function () {
						_this.toClipboard(cellText);

						$('#context-menu').hide();
					});
				}

				/* Get our row of text as CSV */
				var rows = [];

				$(this).parent().children().not(".tb-check-box").each(function() {
					rows.push($(this).text());
				});

				if(rows.length > 0) {

					$('#context-menu-copy-row').show();
					$('#context-menu-copy-row').off('click');

					$('#context-menu-copy-row').on('click', function() {
						_this.toClipboard(obj.inputsExport.arrayToCSV(rows));

						$('#context-menu').hide();
					});
				}

				/* Get a column of text based off the selected cell */
				var col = $(this).parent().children().index(this);

				if(settings.select) {
					col += 1;
				}

				var columns = [];

			   	obj.$elementTable.find(`td:nth-child(${col})`).each(function() {
					columns.push($(this).text());
				});

				if(columns.length > 0) {

					$('#context-menu-copy-column').show();
					$('#context-menu-copy-column').off('click');

					$('#context-menu-copy-column').on('click', function () {
						_this.toClipboard(obj.inputsExport.arrayToCSV(columns));

						$('#context-menu').hide();
					});
				}

				event.preventDefault();
			});
		};

		this.toClipboard = function(value) {

			console.log(`Copying to clipboard: "${value}"`);

			var temp = $("<input>");
			$("body").append(temp);
			$(temp).val(value).select();
			document.execCommand("copy");
			$(temp).remove();
		};
	};



	//-----------------------------------------------------------------
	// Provide a public function for selecting page
	//-----------------------------------------------------------------
	function PaginationPage(obj, settings) {
	
		this.initOnLoad = function() {
			return settings.paginatePage;
		};

		this.init = function() {
			this.set(1);
		};

		this.set = function(page) {
			settings.page = parseInt(page, 10);
		}
	};


	//-----------------------------------------------------------------
	// Pagination links which update dataset.page attribute
	//-----------------------------------------------------------------
	function PaginationPerPage(obj, settings) {

    	var _this = this;

    	this.initOnLoad = function() {
      		return settings.paginatePage;
   		};

    	this.init = function() {

      		this.set(settings.perPageDefault, true);

			this.$select = obj.$element.find('#dynamictable-per-page');

			if(settings.paginatePerPage) {
				this.create();
			} else {
				this.$select.remove();
			}
    	};

    	this.create = function() {

     		for(var i = 0, len = settings.perPageOptions.length; i < len; i++) {

        		var number = settings.perPageOptions[i];
            	var selected = settings.perPage == number ? 'selected="selected"' : '';

        		_this.$select.append('<option value="' + number + '" ' + selected + '>' + number + '</option>');
      		}

     		_this.$select.change(function() {
	     		_this.set($(this).val());
				obj.$elementTable.find('.th-check-box input').prop('checked', false);
				obj.$elementTable.find('.tb-check-box input').prop('checked', false);
        		obj.process();
			});
    	};

    	this.update = function() {
   			obj.$element.find('#dynamictable-per-page').val(parseInt(settings.perPage));
    	};

    	this.set = function(number, skipResetPage) {

      		if(!skipResetPage) { 
				obj.paginationPage.set(1); 
			}

     		settings.perPage = parseInt(number);
    	};
	};


	//-----------------------------------------------------------------
	// Pagination links which update dataset.page attribute
	//-----------------------------------------------------------------
	function PaginationLinks(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return false;
		};

		this.init = function() {
 			this.attach();
    	};

		this.create = function() {

			var pageLinks = "";
			var	pageLinkClass = settings.paginationLinkClass;
			var	activePageClass = settings.paginationActiveClass;
			var	disabledPageClass = settings.paginationDisabledClass;
			var	pages = Math.ceil(settings.queryRecordCount / settings.perPage);
			var	page = settings.page;

			var	breaks = [
				settings.paginationGap[0],
				settings.page - settings.paginationGap[1],
				settings.page + settings.paginationGap[2],
				(pages + 1) - settings.paginationGap[3]
			];

			for(var i = 1; i <= pages; i++) {

				if((i > breaks[0] && i < breaks[1]) || (i > breaks[2] && i < breaks[3])) {

					// skip to next iteration in loop
					continue;

				} else {

					var li = obj.paginationLinks.buildLink(i, i, pageLinkClass, page == i, activePageClass);

					// If i is not between one of the following
					// (1 + (settings.paginationGap[0]))
					// (page - settings.paginationGap[1])
					// (page + settings.paginationGap[2])
					// (pages - settings.paginationGap[3])
					var breakIndex = $.inArray(i, breaks);
					var nextBreak = breaks[breakIndex + 1];

					if(breakIndex > 0 && i !== 1 && nextBreak && nextBreak > (i + 1)) {

						var ellip = '<li><span class="dynamictable-page-break">&hellip;</span></li>';

						li = breakIndex < 2 ? ellip + li : li + ellip;
					}

					if(settings.paginationPrev && i === 1) {

						var prevLi = obj.paginationLinks.buildLink(page - 1, settings.paginationPrev, pageLinkClass + ' ' + settings.paginationPrevClass, page === 1, disabledPageClass);
						li = prevLi + li;
					}

					if(settings.paginationNext && i === pages) {

						var nextLi = obj.paginationLinks.buildLink(page + 1, settings.paginationNext, pageLinkClass + ' ' + settings.paginationNextClass, page === pages, disabledPageClass);
						li += nextLi;
					}

					pageLinks += li;
				}
			}

			// only bind page handler to non-active and non-disabled page links
			var selector = `#${obj.$element.attr('id')} #dynamictable-pagination-links a.${pageLinkClass}:not(.${activePageClass},.${disabledPageClass})`;

			// kill any existing delegated-bindings so they don't stack up
			$(document).undelegate(selector, 'click.dynamictable');

			$(document).delegate(selector, 'click.dynamictable', function(e) {
				$this = $(this);
				$this.closest(settings.paginationClass).find('.' + activePageClass).removeClass(activePageClass);
				$this.addClass(activePageClass);
				obj.paginationPage.set($this.data('dynamictable-page'));
				obj.process();
				e.preventDefault();
			});

			return pageLinks;
		};

		this.update = function() {
   			obj.$element.find('#dynamictable-pagination-links').html(obj.paginationLinks.create());
		};

		this.buildLink = function(page, label, linkClass, conditional, conditionalClass) {

			var link = '<a data-dynamictable-page=' + page + ' class="' + linkClass;
			var li = '<li';

			if (conditional) {
					link += ' ' + conditionalClass;
					li += ' class="' + conditionalClass + '"';
			}

			link += '">' + label + '</a>';
			li += '>' + link + '</li>';

			return li;
		};

		this.attach = function() {

			// append page links *after* delegate-event-binding so it doesn't need to
			// find and select all page links to bind event
			obj.$element.after(obj.paginationLInks.create());
		};
	};


	var utility = {

		isNullOrWhiteSpace: function(value) {

			if(value == null || value == undefined || value == "") {
				return true;
			}

			return false;
		},

		// Find an object in an array of objects by attributes.
		// E.g. find object with {id: 'hi', name: 'there'} in an array of objects
		findObjectInArray: function(array, objectAttr) {

			var _this = this;
			var foundObject = null;
			
			for(var i = 0, len = array.length; i < len; i++) {

				var item = array[i];
				
				// For each object in array, test to make sure all attributes in objectAttr match
				if(_this.allMatch(item, objectAttr, function(item, key, value) { return item[key] == value; })) {
					foundObject = item;
					break;
				}
			}
			
			return foundObject;
		},

		// Return true if supplied test function passes for ALL items in an array
		allMatch: function(item, arrayOrObject, test) {
				
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
				if (!result) { return match = false; }
			});

			return match;
		}
	};

	String.prototype.capitalize = function(string) {
		var target = this;
		return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase();
	}

	String.prototype.capitalizeAll = function () {
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

	String.prototype.toCamelCase = function(str) {
		var target = this;
		return target.replace(/\s(.)/g, function ($1) { return $1.toUpperCase(); }).replace(/\s/g, '').replace(/^(.)/, function($1) { return $1.toLowerCase(); });
	};


	//-----------------------------------------------------------------
	// Create dynamictable plugin based on a defined object
	//-----------------------------------------------------------------
	$.fn['dynamictable'] = function(options) {

		return this.each(function() {

			if(!$.data(this, 'dynamictable')) {
				$.data(this, 'dynamictable', Object.create(dt).init(this, options));
			}

			//console.log("FOUND DYNAMICTABLE INSTANCE:");
			//console.log($.data(this, 'dynamictable'));
		});
	};

})(jQuery);
