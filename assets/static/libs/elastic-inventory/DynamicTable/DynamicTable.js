/***
                                                                                                                                             
    @@@@@@@   @@@ @@@  @@@  @@@   @@@@@@   @@@@@@@@@@   @@@   @@@@@@@  @@@@@@@   @@@@@@   @@@@@@@   @@@       @@@@@@@@            @@@   @@@@@@   
    @@@@@@@@  @@@ @@@  @@@@ @@@  @@@@@@@@  @@@@@@@@@@@  @@@  @@@@@@@@  @@@@@@@  @@@@@@@@  @@@@@@@@  @@@       @@@@@@@@            @@@  @@@@@@@   
    @@!  @@@  @@! !@@  @@!@!@@@  @@!  @@@  @@! @@! @@!  @@!  !@@         @@!    @@!  @@@  @@!  @@@  @@!       @@!                 @@!  !@@       
    !@!  @!@  !@! @!!  !@!!@!@!  !@!  @!@  !@! !@! !@!  !@!  !@!         !@!    !@!  @!@  !@   @!@  !@!       !@!                 !@!  !@!       
    @!@  !@!   !@!@!   @!@ !!@!  @!@!@!@!  @!! !!@ @!@  !!@  !@!         @!!    @!@!@!@!  @!@!@!@   @!!       @!!!:!              !!@  !!@@!!    
    !@!  !!!    @!!!   !@!  !!!  !!!@!!!!  !@!   ! !@!  !!!  !!!         !!!    !!!@!!!!  !!!@!!!!  !!!       !!!!!:              !!!   !!@!!!   
    !!:  !!!    !!:    !!:  !!!  !!:  !!!  !!:     !!:  !!:  :!!         !!:    !!:  !!!  !!:  !!!  !!:       !!:                 !!:       !:!  
    :!:  !:!    :!:    :!:  !:!  :!:  !:!  :!:     :!:  :!:  :!:         :!:    :!:  !:!  :!:  !:!   :!:      :!:       :!:  !!:  :!:      !:!   
     :::: ::     ::     ::   ::  ::   :::  :::     ::    ::   ::: :::     ::    ::   :::   :: ::::   :: ::::   :: ::::  :::  ::: : ::  :::: ::   
    :: :  :      :     ::    :    :   : :   :      :    :     :: :: :     :      :   : :  :: : ::   : :: : :  : :: ::   :::   : :::    :: : :    
                                                                                                                                             

    * BASED ON:
    * 	 https://github.com/alfajango/jquery-dynatable 
    *
    * TODO:
    *  -Get by json attribute / id
    *	-checkByRowId                      
    *  -checkByRowNumber                     
    *  -highlightByRowId             
    *  -highlightByRowNumber

    |----------------------------------|
    | DYNAMICTABLE.JS                  |
    |     -Display data as table       |
    |     -Pagination                  |
    |     -Quick search by term        |
    |     -Selecting                   |
    |----------------------------------|
    | UTILITY.JS                       |
    |     -Useful helper functions     |
    |----------------------------------|

***/

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

			<div class="default-table-wrapper">

                <h2 class="table-header">&nbsp;</h2>

                <ul id="context-menu">
				    <li id="context-menu-new-tab">New Tab</li>
				    <li id="context-menu-copy-link">Copy Link</li>
				    <li id="context-menu-copy-cell">Copy Cell</li>
				    <li id="context-menu-copy-row">Copy Row</li>
				    <li id="context-menu-copy-column">Copy Column</li>
			    </ul>

				<select id="dynamictable-per-page" class="dynamictable-per-page-select form-control">&nbsp;</select>
				<div class="filler-header">&nbsp;</div>

                <div class="dynamictable-search-wrapper">
				    <input id="dynamictable-search" type="search" class="form-control" placeholder="Filter...">
                    <i id="dynamictable-search-clear" class="fa fa-times-circle"></i>
                </div>

				<div id="dynamictable-export" class="btn btn-dark"><i class="fa fa-download" aria-hidden="true">&nbsp;</i></div>

				<div class="grid-scroll">
					<table class="grid table table-sm table-light">
						<thead>
							<tr>
							    <th id="empty-message" data-dynamictable-no-sort="true">No results found.</th>
								<th class="th-check-box text-center" data-dynamictable-no-sort="true">
									<div class="checkbox">
										<input type="checkbox" />
										<label for=""></label>
									</div>
								</th>
								<th id="th-default" scope="col"></th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="tb-check-box text-center">
									<div class="checkbox">
										<input type="checkbox" />
										<label for=""></label>
									</div>
								</td>
								<td id="tb-default"><a href="#" target="_blank"></a></td>
							</tr>
						</tbody>
					</table>
				</div>

				<span id="dynamictable-record-count">&nbsp;</span>
				<div class="filler-footer">&nbsp;</div>
				<ul id="dynamictable-pagination-links">&nbsp;</ul>

			</div>`,

		paginatePage: true,                         /* Once turned off no pagination will occur and all results will be shown in a single table. Will disable paginatePerPage, paginationLinks */
		paginatePerPage: true,                      /* Once turned off will not display: Show X per page dropdown */
		recordCount: true,                          /* Once turned off will not display: Showing X of Y pages... */
		paginationLinks: true,                      /* Once turned off will not display: Prev XYZ Next */
		sort: true,                                 /* Once turned off no sorting by column will be possible */
		search: true,                               /* Once turned off no quick search input field will be shown */
		select: true,                               /* Once turned off no checkbox select column will be shown */
		export: true,                               /* Once turned off no export button will be displayed. Requires SELECT to be turned on. -- export all if non selected not working */
		contextMenu: true,                          /* Once turned off no context menu will appear on left click */
		simple: false,                              /* Once turned on all GUI elements excluding the table and context menu will be hidden */
        hideLabels: false,                          /* Turn off header of the table */

		columns: [],                                /* All columns based on the provided data set, some may be hidden etc */
		renderedColumns: [],                        /* Columns that appear on the page */
		columnsIgnore: ['dynamictable-index'],      /* Which columns do we not want to display */
		exportsIgnore: ['dynamictable-index'],      /* On export which columns should be excluded */
		orderColumns: [],                           /* Sometimes sorting column order is wanted */
		hideColumnLabel: [],                        /* Sometimes you dont want a label on a column */
		disableExpand: [],                          /* Tell me which columns cannot be expanded on click */
		cells: [],                                  /* Custom cell renderers */
		checkByRowId: [],                           /* Give me a row with a unique ID and I will check the row for you, except if SELECT is false */
		checkByRowNumber: [],                       /* Give me a row number starting from 0 and I will check the row for you, except if SELECT is false */
		highlightByRowId: [],                       /* Give me a row with a unique ID and I will highlight the whole row */
		highlightByRowNumber: [],                   /* Give me a row number starting from 0 and I will highlight the whole row */

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
		records: [],

        shiftState: false,
        ctrlState: false,

        callback: null
	};


	//-----------------------------------------------------------------
	// Each dynamictable instance inherits from this,
	// set properties specific to instance
	//-----------------------------------------------------------------
	var dt = {

		init: function(element, options) {

            /* We want to ensure our defaults are preserved...so we clone before merge */
            this.settings = overload(clone(defaults), options);

			this.settings.element = element.id;

			for(model in modelPrototypes) {

			    var modelInstance = this[model] = new modelPrototypes[model](this, this.settings);

			    if(modelInstance.initOnLoad()) {
                    //console.log(`Loading: ${model}`);
			        modelInstance.init();
			    }
			}

			this.process();

			return this;
		},

		update: function() {

		    this.records.init();
		    this.domColumns.init();
		    this.process();
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

		    if(hideAll == true) {
		        this.$element.children().hide();
		    }

			this.$elementTable.find('thead th').hide();
			this.$elementTable.find('#empty-message').show();

            this.$element.find('.btn').hide();
			this.$element.find('.table-header').show();
            this.$element.find('.form-control').hide();
			this.$element.find('.grid-scroll').show();
			this.$element.find('.grid').show();
		},

		setFull: function() {

		    this.$elementTable.find('thead th').show();
            this.$elementTable.find('#empty-message').hide();

            this.$element.find('.dynamictable-search-wrapper').show();
            this.$element.find('.btn').show();
            this.$element.find('.form-control').show();
            this.$element.find('.filler-header').show();
            this.$element.find('.filler-footer').show();
            this.$element.find('#context-menu').hide();
            this.$element.find('.grid-scroll').show();
			this.$element.find('.grid').show();

            if(isNull(this.settings.callback) == false) {
                this.settings.callback();
            }
		}
	};


    //-----------------------------------------------------------------
    // Dynatable object models
    //-----------------------------------------------------------------
    function Dom(obj, settings) {

        var _this = this;

		this.initOnLoad = function() { 

            _this.first = true;

			return true; 
		};

		this.init = function() {

            /* We only want one default table */
		    $('.default-table-wrapper').remove();

			/* Now lets add our default template to the DOM */
		    $('body').prepend(settings.template);

			/* Now we get our inserted template element */
			obj.$defaultElement = $('.default-table-wrapper').attr('id', `${settings.element}-default`);

            /* Remove the main checkbox if select is disabled */
			if(settings.select == false) {
			    obj.$defaultElement.find('.th-check-box').remove();
			}

            /* This is just a stub for reference so can delete */
			obj.$defaultElement.find('.table-header').remove();

			/* We add the required DOM elements to the users element */
			obj.$element = $(`#${settings.element}`);
			obj.$element.append(obj.$defaultElement.clone().html());

			if(settings.simple == true) {
			    obj.$element.find('.filler-header').remove();
			    obj.$element.find('.filler-footer').remove();
			}

            /* Remove elements that are not shared between tables */
			obj.$defaultElement.find('#context-menu').remove();

			obj.$elementTable = obj.$element.find('.grid');
			obj.$elementTable.find('thead tr').children().not('.th-check-box').not('#empty-message').remove();
			obj.$elementTable.find('.th-check-box input').attr('id', `${settings.element}-checkbox`);
			obj.$elementTable.find('.th-check-box label').attr('for', `${settings.element}-checkbox`);
			obj.$elementTable.find('tbody tr').remove();

            /* Global Key Listener */
            $(document).on('keyup keydown', function(event) {
                obj.settings.shiftState = event.shiftKey;
                obj.settings.ctrlState = event.ctrlKey;
            });

    		/* Enable cell expanding for better space utilisation */
			obj.$elementTable.on('click', 'tbody td', function() {

				var $td = $(this);
				var $row = $td.parent();
				var colTdIdx = $row.children().index(this);
				var colObjIdx = colTdIdx;

                /* Do we have a column expansion ? */
                if(obj.settings.ctrlState == true) {

				    /* Because we always +1 when select is enabled we never set a click event on the select column */
				    if(settings.select) {
					    colObjIdx -= 1;
				    }

				    colTdIdx += 1;

		            /* Do we have a column that with disabled expand specified */
				    var colObj = findObjectInArray(settings.renderedColumns, {index: colObjIdx});
		
				    if(isNullOrWhiteSpace(colObj) == false && settings.disableExpand.indexOf(colObj.label) > -1) {
					    return;
				    } 

                    /* Deselect any selected text to prevent shift-select */
                    document.getSelection().removeAllRanges();
				
				    /* Add our expand click event to the column */
            	    obj.$elementTable.find(`td:nth-child(${colTdIdx})`).each(function() {

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
                }
			});
		};

        /* Update table contents with new records array from query */
        this.update = function() {

            if(isNullOrWhiteSpace(settings.cells)) {
                settings.cells = [];
            }

			/* Always do this first to keep the DOM clean */
			obj.$elementTable.find('tbody').children().remove();

			/* If we have nothing to show then go no further */
			if(settings.records.length == 0) {

				obj.setEmpty(true);

				return;
			}

			/* Loop through records and render rows -> cells */
            for(var i = 0, len = settings.records.length; i < len; i++) {

				var record = settings.records[i];

				/* From the grid row, clone the default table row and then remove from the grid */
				var $tr = obj.$defaultElement.find('tbody tr').clone().removeAttr('id');

				if(settings.select) {

					var uniqueId = record['dynamictable-index'];

					$tr.find('.tb-check-box input').val(uniqueId);
					$tr.find('.tb-check-box input').attr('id', `${settings.element}-checkbox-${uniqueId}`);
					$tr.find('.tb-check-box label').attr('for', `${settings.element}-checkbox-${uniqueId}`);

                    /* We have a custom cell renderer for select boxes */
					var custom = findObjectInArray(settings.cells, {column: 'select-box'});

					if(custom) {
						custom.render(settings, record, $tr);
					}
				}

				settings.renderedColumns = [];

				/* grab the record's attribute for each column */
				for(var j = 0, len2 = settings.columns.length; j < len2; j++) {

				    var column = settings.columns[j];
                    var key = column.id;

					$td = $tr.find('#tb-default').clone().removeAttr('id');
		
                    /* If we have a wild card cell renderer then look for a specific renderer for the given column */
                    var custom = findObjectInArray(settings.cells, {column: key});

                    /* Otherwise, do we have a custom cell renderer for all cells '*' */
                    if(isNull(custom)) {
					    custom = findObjectInArray(settings.cells, {column: '*'});
                    }

					if(custom) {
						custom.render(settings, column, record, $td);
					} else {
						$td.text(record[key]);
					}

					/* Do we have a column that is disabled expand specified */
					if(settings.disableExpand.indexOf(key) > -1) {
						$td.addClass("td-select off");
					} 
	
					/* keep cells for hidden column headers hidden */
					if(column.hidden) {
						$td.hide();
					}

				    /* We want to record which columns are actually shown */
					settings.renderedColumns.push(column);

					$tr.append($td);
				}

				$tr.find('#tb-default').remove();

				obj.$elementTable.find('tbody').append($tr);
            }

            /* 
                We do set full then updates, as sometimes we want to hide elements on update.
                Callback is only called once, so we only want to do a full update once.
                Otherwise we may get hidden elements popping from subsequent updates that were hidden in the callback.
            */
            obj.setFull();

            obj.paginationPerPage.update();
            obj.recordsCount.update();
            obj.paginationLinks.update();
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

				columns = this.orderColumns();

				for(var i = 0, len = columns.length; i < len; i++) {

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
			var $column = obj.$defaultElement.find('#th-default').clone().removeAttr('id');

			/* Check if hide labels for columns */
			if(settings.hideColumnLabel.indexOf(id) == -1) {
				$column = $column.text(label).attr('data-dynamictable-column', id).addClass('dynamictable-head');
			} else {
				$column = $column.attr('data-dynamictable-column', id).addClass('dynamictable-head');
			}

            if(settings.hideLabels == false) {
			    obj.$elementTable.find('thead tr').append($column);
            }

			/* Add column data to plugin instance */
			columns.splice(position, 0, {
				index: position,
				label: label,
				id: id,
				sorts: [id],
				hidden: false,
			});
		};

    	this.orderColumns = function() {

			ordered = [];

			/* Our columns are determined from the keys of the first json record */
			columns = Object.keys(settings.records[0]);

			/* Need to order columns from left to right */
			for(var i = 0, len = settings.orderColumns.length; i < len; i++) {

				for(var j = 0, len2 = columns.length; j < len2; j++) {
							
					if(settings.orderColumns[i] == columns[j]) {
	
						ordered.push(columns[j]);	
					}
				}
			}

			/* Add any remaining columns */
			if(ordered.length < columns.length) {

				ordered = ordered.concat(columns).filter(function(value, index, self) {
					return self.indexOf(value) === index; 
				});
			}

			return ordered;
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
			
			var columns = settings.columns.splice(index, 1);
			var adjustColumns = columns.slice(index, columns.length);

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

			for(var i = 0, len = settings.records.length; i < len; i++) {

                /* Used to determine original sort order */
			    settings.records[i]['dynamictable-original-index'] = i;

                /* We always need a unique ID per row! */
				settings.records[i]['dynamictable-index'] = i;
			}

			// Create cache of original full recordset (unpaginated)
			settings.originalRecords = overload([], settings.records);
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

	    this.remove = function(rowId) {

			var allRecords = settings.originalRecords;

            for(var i = 0, len = allRecords.length; i < len; i++) {

                if(allRecords[i]['dynamictable-index'] == rowId) {
                    allRecords.splice(i, 1);
                    break;
                }
            }

            settings.originalRecords = allRecords;

            obj.process();
		};

        this.get = function(rowId) {

            var allRecords = settings.originalRecords;

            for(var i = 0, len = allRecords.length; i < len; i++) {

                if(allRecords[i]['dynamictable-index'] == rowId) {
                    return allRecords[i];
                }
            }

            return {};
        };
	};


	//-----------------------------------------------------------------
    // Helper for Records Count Input Element
    //-----------------------------------------------------------------
	function RecordsCount(obj, settings) {

	    this.initOnLoad = function() {
            return false;
		};

    	this.init = function() {};

		this.create = function() {

			var recordsShown = obj.records.count();
			var	recordsQueryCount = settings.queryRecordCount;
			var	recordsTotal = settings.totalRecordCount;
			var	text = 'Showing ';

			if((recordsShown < recordsQueryCount) && settings.paginatePage) {

				var bounds = obj.records.pageBounds();
				
				text += "<span class='dynamictable-record-bounds'>" + (bounds[0] + 1) + " to " + bounds[1] + "</span> of ";

			} else if((recordsShown === recordsQueryCount) && settings.paginatePage) {

				text += recordsShown + " of ";
			}

			text += recordsQueryCount;

			if(recordsQueryCount < recordsTotal) {
				text += " (filtered from " + recordsTotal + " total records)";
			}

			return text;
		};

		this.update = function() {

		    var build = settings.recordCount && settings.paginatePage && !settings.simple;

		    if(build == false) {

		        obj.$element.find('#dynamictable-record-count').hide();

		    } else {

		        obj.$element.find('#dynamictable-record-count').html(obj.recordsCount.create());
		        obj.$element.find('#dynamictable-record-count').show();
		    }
		};

		this.attach = function() {
			obj.$element.after(this.create());	
		};
	};
    

	//-----------------------------------------------------------------
    // Helper for Column Sorting
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

			var column = findObjectInArray(settings.columns, {id: id});

			$link.bind('click', function(e) {
				_this.toggleSort(e, $link, column);
				obj.process();
				e.preventDefault();
			});

			if(this.sortedByColumn($link, column)) {

				if(this.sortedByColumnValue(column) == 1) {
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
					
				    for(var i = 0, len = column.sorts.length; i < len; i++) {
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
			return allMatch(settings.sorts, column.sorts, function(sorts, sort) { return sort in sorts; });
		};

		this.sortedByColumnValue = function(column) {
			return settings.sorts[column.sorts[0]];
		};
	};


  	//-----------------------------------------------------------------
	// Query table dataset
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
    
            /* Make sure the input matches the given query */
            obj.$element.find('#dynamictable-search').val(q);

			/* reset to first page since query will change records */
			if(settings.paginatePage) {
				settings.page = 1;
			}

			settings.queries = [q];
			
			obj.process();

            /* Always show the quick search so users can clear search and get all results back if there are rows to still search */
            if(obj.settings.originalRecords.length > 0) {

			    obj.$element.find('.table-header').show();
			    obj.$element.find('.filler-header').show();
			    obj.$element.find('.dynamictable-search-wrapper').show().children().show();
            }
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
	// Dynamic search input functinoality
	//-----------------------------------------------------------------
	function InputsSearch(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

		    var build = settings.search && !settings.simple;

		    if(build == false) {
		        obj.$element.find('.dynamictable-search-wrapper').remove();
		    }

		    return build;
		};

		this.init = function() {

            var $search = obj.$element.find('#dynamictable-search');

			$search.bind('keyup', function(e) {
				
				if(e.which == 13) {
					obj.queries.runSearch($(this).val());
					e.preventDefault();
				}
			});
    
            obj.$element.find('#dynamictable-search-clear').bind('click', function(e) {
				
                $search.val('');

				obj.queries.runSearch('');

			    e.preventDefault();
			});
		};
	};


	//-----------------------------------------------------------------
	// Export functionality
	//-----------------------------------------------------------------
	function InputsExport(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

		    var build = settings.export && settings.select && !settings.simple;

		    if(build == false) {
		        obj.$element.find('#dynamictable-export').remove();
		    }

		    return build;
		};

		this.init = function() {

			var $export = obj.$element.find('#dynamictable-export');	

			$export.click(function() {

				var items = obj.inputsSelect.getSelected();

                if(items.length == 0) {

                    items = obj.settings.originalRecords;
                }

                var toExport = [];

                /* Remove export columns that are to be ignored! */
                for(var i = 0, len = items.length; i < len; i++) {
            
                    var cleaned = {}

				    for(var j = 0, len2 = settings.renderedColumns.length; j < len2; j++) {
        
				        var col = settings.renderedColumns[j].label;

					    cleaned[col] = items[i][col];
				    }

                    toExport.push(cleaned);
                }

				if(toExport.length > 0) {

					_this.downloadText('output.csv', _this.convertToCSV(toExport), "text/csv");
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

			return settings.select && !settings.simple;
		};

		this.init = function() {

			_this.first = null;

			_this.create();
		};

		this.create = function() {

			obj.$elementTable.on('click', 'tbody td', function() {

                /* Do not allow select when expanding column */
                if(settings.ctrlState == true) {
                    return;
                }

                /* Lets toggle the checkbox */
                var $tr = $(this).parent();
                var $checkbox = $(this).parent().find('.tb-check-box input');

                /* On click, the state will be the opposite of what we want to set it too */
                var checked = $checkbox.prop("checked");

                if(checked) {

					$checkbox.prop('checked', false);

                    _this.unhighlightRow($tr);

                } else {
	
                    $checkbox.prop('checked', true);

                    _this.highlightRow($tr);
                }

                /* We want to do a multi-select as shift is down */
                if(settings.shiftState == true) {

                    /* Deselect any selected text to prevent shift-select */
                    document.getSelection().removeAllRanges();
                }

				_this.shiftSelect($checkbox);
            });

			obj.$elementTable.on('change', '.tb-check-box input', function(e) {
    
                /* Lets toggle the checkbox */
                var $tr = $(this).parent().parent().parent();
                var $checkbox = $(this);
				var checked = $(this).prop("checked"); 

                /* Will be checked by the user, so no need to programatically do it */
				if(checked) {

                    _this.highlightRow($tr);

				} else {

 					_this.unhighlightRow($tr);
				}

                _this.shiftSelect($checkbox);
			});

			obj.$elementTable.on('click', '.th-check-box input', function(e) {
    
				var checked = $(this).prop("checked");

				obj.$elementTable.find('.tb-check-box input').each(function(index) {

                    var $tr = $(this).parent().parent().parent();
                    var $checkbox = $(this);

					if(checked) {

						$checkbox.prop('checked', true);

                        _this.highlightRow($tr);

					} else {

						$checkbox.prop('checked', false);

                        _this.unhighlightRow($tr);
					}
				});
			});
		};

		this.highlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).addClass('td-highlight');
				$(this).addClass('off');
			});
		};

		this.unhighlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).removeClass('td-highlight');
				$(this).removeClass('off');
			});
		};

		this.getSelected = function() {

			var ids = [];

			var ticks = obj.$elementTable.find('.tb-check-box input');

			for(i = 0; i < ticks.length; i++) {

				var tick = ticks[i];

				if(tick.checked) {

					var completeRecord = findObjectInArray(settings.records, {
						'dynamictable-index' : tick.value
					});

					if(completeRecord == null) {
						continue;
					}

                    /* Provide the DOM element the checkbox is contained within */
                    completeRecord['dynamictable-tb-check-box'] = $(tick).parent();

					ids.push(completeRecord);
				}
			}

			return ids;
		};

        this.deselect = function() {

            obj.$elementTable.find('.th-check-box input').prop('checked', false);

            obj.$elementTable.find('tr').each(function() {

                $tr = $(this);

			    _this.unhighlightRow($tr);

                $tr.find('.tb-check-box input').prop("checked", false);
            });
        };

        this.shiftSelect = function(checkbox) {
 
            /* We need two check boxes checked */
            if(_this.first == null) {

                _this.first = checkbox;
                    
                return;
            }

            /* Our starting box in select cannot be unchecked */
            if(_this.first.prop("checked") == false) {
                  
                _this.first = null;
                    
                return; 
            }

            /* Make sure shift is selected ! */
            if(settings.shiftState == false) {

                _this.first = checkbox;

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
                if(this == _this.first.get(0)) {
                    firstIndex = index;
                }

				if(this == last.get(0)) {
                    lastIndex = index;
                }
            });

            /* We have done our computing of FIRST and LAST now lets set the new first for next time */
       	    _this.first = last;

            /* Once we know the direction set it */
            if(firstIndex >= lastIndex) {
                temp = lastIndex;
                lastIndex = firstIndex;
                firstIndex = temp;
            }

           /* Select everything from the FIRST to the LAST checkbox */
            obj.$elementTable.find('.tb-check-box input').each(function(index) {

                var $tr = $(this).parent().parent().parent();
                var $checkbox = $(this);

                if(index >= firstIndex && index <= lastIndex) {

                    $checkbox.prop('checked', true);

	                _this.highlightRow($tr);
                }
            });
        }
	};


	//-----------------------------------------------------------------
	// Context Menu functionality
	//-----------------------------------------------------------------
	function InputsContextMenu(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

		    var build = settings.contextMenu;

		    if(build == false) {
		        obj.$element.find("#context-menu").hide();
		    }

		    return build;
		};

		this.init = function() {
			
		    $contextMenu = obj.$element.find("#context-menu");

			/* Hide context menu when click elsewhere */
			$('html').click(function() {
			    $contextMenu.hide();
			});

			/* Allow a context menu to appear when right click occurs. */
			$(document).on('contextmenu', `#${settings.element} tbody td`, function(event) {

			    $contextMenu.children().hide();

			    $contextMenu.css({
					display: "block",
					left: event.pageX,
					top: event.pageY
				});

				/* If we have a link then provide new tab option */
				var link = $(this).find('a');

				if(link.length == 1) {

					var linkHref = $(link).attr('href');

					if(isNullOrWhiteSpace(linkHref) == false) {

					    $contextMenu.find('#context-menu-new-tab').show();
					    $contextMenu.find('#context-menu-new-tab').off('click');

					    $contextMenu.find('#context-menu-copy-link').show();
					    $contextMenu.find('#context-menu-copy-link').off('click');

					    $contextMenu.find('#context-menu-new-tab').on('click', function () {

							window.open(linkHref, '_blank');

							$('#context-menu').hide();
						});

					    $contextMenu.find('#context-menu-copy-link').on('click', function () {

							/* We have a relative link */
							if(linkHref.startsWith("/") == true) {
								toClipboard(`${window.location.protocol}\/\/${window.location.host}${linkHref}`);
							} else {
								toClipboard(linkHref);
							}

							$contextMenu.hide();
						});
					}
				}

				/* Get our cell of text */
				var cellText = $(this).text();

				if(isNullOrWhiteSpace(cellText) == false) {

				    $contextMenu.find('#context-menu-copy-cell').show();
				    $contextMenu.find('#context-menu-copy-cell').off('click');

				    $contextMenu.find('#context-menu-copy-cell').on('click', function () {

						toClipboard(cellText);

						$('#context-menu').hide();
					});
				}

				/* Get our row of text as CSV */
				var rows = [];

				$(this).parent().children().not(".tb-check-box").each(function() {
					rows.push($(this).text());
				});

				if(rows.length > 0) {

				    $contextMenu.find('#context-menu-copy-row').show();
				    $contextMenu.find('#context-menu-copy-row').off('click');

				    $contextMenu.find('#context-menu-copy-row').on('click', function() {

						toClipboard(obj.inputsExport.arrayToCSV(rows));

						$contextMenu.hide();
					});
				}

				/* Get a column of text based off the selected cell */
				var col = $(this).parent().children().index(this) + 1;

				var columns = [];

			   	obj.$elementTable.find(`td:nth-child(${col})`).each(function() {
					columns.push($(this).text());
				});

				if(columns.length > 0) {

				    $contextMenu.find('#context-menu-copy-column').show();
				    $contextMenu.find('#context-menu-copy-column').off('click');

				    $contextMenu.find('#context-menu-copy-column').on('click', function() {

						toClipboard(obj.inputsExport.arrayToCSV(columns));

						$contextMenu.hide();
					});
				}

				event.preventDefault();
			});
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

    	    /* We always need this element to exist as paginatePage and paginateLinks depend on the perPage count */
    	    return true;
   		};

    	this.init = function() {

    	    this.$select = obj.$element.find('#dynamictable-per-page');

            if(isNullOrWhiteSpace(settings.perPageDefault)) {
                perPageDefault = 10;
            }

      		this.set(settings.perPageDefault, true);
      
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

            var build = settings.paginatePerPage && settings.paginatePage && !settings.simple;

    	    if(build == false) {

    	        obj.$element.find('#dynamictable-per-page').hide();

    	    } else {

    	        obj.$element.find('#dynamictable-per-page').val(parseInt(settings.perPage));
    	        obj.$element.find('#dynamictable-per-page').show();
    	    }
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

		this.init = function () {};

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

		this.buildLink = function (page, label, linkClass, conditional, conditionalClass) {

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

		this.update = function() {

		    var build = settings.paginationLinks && settings.paginatePage && !settings.simple;

		    if(build == false) {

		        obj.$element.find('#dynamictable-pagination-links').hide();

		    } else {

		        obj.$element.find('#dynamictable-pagination-links').html(obj.paginationLinks.create());
		        obj.$element.find('#dynamictable-pagination-links').show();
		    }
		};
	};


	//-----------------------------------------------------------------
	// Create dynamictable plugin based on a defined object
	//-----------------------------------------------------------------
	$.fn['dynamictable'] = function(options) {

		return this.each(function() {

			if(!$.data(this, 'dynamictable')) {

                //console.log("NEW DYNAMICTABLE");
                //console.log(this);
                //console.log(options);

				$.data(this, 'dynamictable', Object.create(dt).init(this, options));
			}

			//console.log("FOUND DYNAMICTABLE INSTANCE:");
			//console.log($.data(this, 'dynamictable'));
		});
	};

})(jQuery);

