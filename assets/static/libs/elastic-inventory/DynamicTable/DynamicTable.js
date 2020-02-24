/***
																															
	@@@@@@@   @@@ @@@  @@@  @@@   @@@@@@   @@@@@@@@@@   @@@   @@@@@@@  @@@@@@@   @@@@@@   @@@@@@@   @@@       @@@@@@@@  
	@@@@@@@@  @@@ @@@  @@@@ @@@  @@@@@@@@  @@@@@@@@@@@  @@@  @@@@@@@@  @@@@@@@  @@@@@@@@  @@@@@@@@  @@@       @@@@@@@@  
	@@!  @@@  @@! !@@  @@!@!@@@  @@!  @@@  @@! @@! @@!  @@!  !@@         @@!    @@!  @@@  @@!  @@@  @@!       @@!       
	!@!  @!@  !@! @!!  !@!!@!@!  !@!  @!@  !@! !@! !@!  !@!  !@!         !@!    !@!  @!@  !@   @!@  !@!       !@!       
	@!@  !@!   !@!@!   @!@ !!@!  @!@!@!@!  @!! !!@ @!@  !!@  !@!         @!!    @!@!@!@!  @!@!@!@   @!!       @!!!:!    
	!@!  !!!    @!!!   !@!  !!!  !!!@!!!!  !@!   ! !@!  !!!  !!!         !!!    !!!@!!!!  !!!@!!!!  !!!       !!!!!:    
	!!:  !!!    !!:    !!:  !!!  !!:  !!!  !!:     !!:  !!:  :!!         !!:    !!:  !!!  !!:  !!!  !!:       !!:       
	:!:  !:!    :!:    :!:  !:!  :!:  !:!  :!:     :!:  :!:  :!:         :!:    :!:  !:!  :!:  !:!   :!:      :!:       
	 :::: ::     ::     ::   ::  ::   :::  :::     ::    ::   ::: :::     ::    ::   :::   :: ::::   :: ::::   :: ::::  
	:: :  :      :     ::    :    :   : :   :      :    :     :: :: :     :      :   : :  :: : ::   : :: : :  : :: ::   


    * BASED ON:
    * 	 https://github.com/alfajango/jquery-dynatable 
    *
    * TODO:
    *  -Get by json attribute / id
    *  -checkByRowId                      
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

                <ul id="context-menu" class="options-menu">
				    <li id="context-menu-new-tab">New Tab</li>
				    <li id="context-menu-copy-link">Copy Link</li>
				    <li id="context-menu-copy-text">Copy Text</li>
				    <li id="context-menu-copy-value">Copy Value</li>
				    <li id="context-menu-copy-row">Copy Row</li>
				    <li id="context-menu-copy-column">Copy Column</li>
                    <li id="context-menu-expand-column">Expand Column</li>
			    </ul>

				<ul id="select-menu" class="options-menu">
					<li id="select-menu-select-page">Select Page</li>
					<li id="select-menu-deselect-page">Deselect Page</li>
					<li id="select-menu-select-all">Select All</li>
					<li id="select-menu-deselect-all">Deselect All</li>
				</ul>

				<div id="dynamictable-selector" class="text-center form-control">
					<i class="fa fa-list"></i>
					<span id="select-count">&nbsp;</span>
				</div>

				<ul id="per-page-menu" class="options-menu">
					<li id="per-page-menu-default">&nbsp;</li>
				</ul>

				<div id="dynamictable-per-page" class="text-center form-control">
					<i class="fa fa-ruler-vertical"></i>
					<span id="per-page-count">&nbsp;</span>
				</div>

				<div class="filler-header">&nbsp;</div>

                <div class="dynamictable-search-wrapper">
				    <input id="dynamictable-search" type="search" class="form-control" placeholder="Filter">
					<div id="dynamictable-search-clear"> 
                    	<i class="fa fa-times-circle"></i>
					</div>
                </div>

				<div id="dynamictable-export" class="btn btn-dark"><i class="fa fa-download" aria-hidden="true">&nbsp;</i></div>

				<div class="grid-scroll">
					<table class="grid">
						<thead>
							<tr>
							    <th id="empty-message" data-dynamictable-no-sort="true">No results found.</th>
                                <th id="th-default" scope="col"></th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td id="tb-default-checkbox" class="tb-check-box text-center">
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

			</div>
		`,

		paginatePage: true,							/* Once turned off no pagination will occur and all results will be shown in a single table. Will disable paginatePerPage, paginationLinks */
		paginatePerPage: true,						/* Once turned off will not display: Show X per page dropdown */
		recordCount: true,							/* Once turned off will not display: Showing X of Y pages... */
		paginationLinks: true,						/* Once turned off will not display: Prev XYZ Next */
		sort: true,									/* Once turned off no sorting by column will be possible */
		search: true,								/* Once turned off no quick search input field will be shown */
		select: true,								/* Once turned off no checkbox select column will be shown */
		export: true,								/* Once turned off no export button will be displayed. Requires SELECT to be turned on. -- export all if non selected not working */
		contextMenu: true,							/* Once turned off no context menu will appear on left click */
		simple: false,								/* Once turned on all GUI elements excluding the table and context menu will be hidden */
		hideLabels: false,							/* Turn off header of the table */

		columns: [],								/* All columns based on the provided data set, some may be hidden etc */
		renderedColumns: [],						/* Columns that appear on the page */
		columnsIgnore: [],							/* Which columns do we not want to display */
		columnsKeep: [],							/* Which columns do we want to display */
		exportsIgnore: ['dynamictable-select'],		/* On export which columns should be excluded */
		orderColumns: [],							/* Sometimes sorting column order is wanted */
		renameColumns: {},							/* Sometimes we want to rename a column because the one provided by the records is insuffient */
		hideColumnLabel: [],						/* Sometimes you dont want a label on a column */
		disableExpand: [],							/* Tell me which columns cannot be expanded on click */
		cells: [],									/* Custom cell renderers */
		searchKeys: [],								/* Give me a key in settings.records to search */ 
		checkByRowId: [],							/* Give me a row with a unique ID and I will check the row for you, except if SELECT is false */
		checkByRowNumber: [],						/* Give me a row number starting from 0 and I will check the row for you, except if SELECT is false */
		highlightByRowId: [],						/* Give me a row with a unique ID and I will highlight the whole row */
		highlightByRowNumber: [],					/* Give me a row number starting from 0 and I will highlight the whole row */

		paginationClass: 'dynamictable-pagination-links',
		paginationLinkClass: 'dynamictable-page-link',
		paginationPrevClass: 'form-control dynamictable-page-prev',
		paginationNextClass: 'form-control dynamictable-page-next',
		paginationActiveClass: 'dynamictable-active-page',
		paginationDisabledClass: 'dynamictable-disabled-page',
		paginationPrev: 'Previous',
		paginationNext: 'Next',
		paginationGap: [1 ,2, 2, 1],

		totalRecordCount: null,
		queries: [],
		queryRecordCount: null,
		page: null,
		perPage: 1,
		perPageDefault: 10,
		perPageOptions: [5, 10, 20, 50, 100, 200],
		sorts: {},
		sortsKeys: [],
		sortTypes: {},
		records: [],

		shiftState: false,
		ctrlState: false,
		clickThrew: true,                           /* Controls clicks on links within a TD without deselecting the row */

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

			this.settings.element = element;

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

		/* This is called only externally to the plugin not within */
		update: function() {

		    this.records.init();
		    this.domColumns.init();
		    this.process();
		},

		/* 
		 * This does the slicing and dicing of records based on changes made by:
		 *  -PaginationPage
		 *	-PaginationPerPage
		 *  -PaginationLinks
		 *	-Queries
		 *  -Sorts
		 */
		process: function() {

			/* We start fresh with the record set */
			this.records.resetOriginal();

			/* Run our search query if one exists */
			this.queries.run();

			/* Do our sorting if any exists */
			if(this.settings.sort) {
			    this.records.sort();
			}

			/* Now lets do our slicing and dicing */
			if(this.settings.paginatePage) {
			    this.records.paginate();
			}

			/* Update the dom to reflect the change in records */
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
			this.$element.find('#select-menu').hide();
			this.$element.find('#per-page-menu').hide();
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
			obj.$defaultElement = $('.default-table-wrapper');

            /* Remove the main checkbox if select is disabled */
			if(settings.select == false) {
			    obj.$defaultElement.find('.th-check-box').remove();
			}

            /* This is just a stub for reference so can delete */
			obj.$defaultElement.find('.table-header').remove();

			/* We add the required DOM elements to the users element */
			obj.$element = $(settings.element);
			obj.$element.append(obj.$defaultElement.clone().html());

			if(settings.simple == true) {
			    obj.$element.find('.filler-header').remove();
			    obj.$element.find('.filler-footer').remove();
			}

            /* Remove elements that are not shared between tables */
			obj.$defaultElement.find('#context-menu').remove();
			obj.$defaultElement.find('#select-menu').remove();
			obj.$defaultElement.find('#per-page-menu').remove();

			obj.$elementTable = obj.$element.find('.grid');
			obj.$elementTable.find('thead tr').children().not('#empty-message').remove();
			obj.$elementTable.find('tbody tr').remove();

            /* Global Key Listener */
            $(document).on('keyup keydown', function(event) {
                obj.settings.shiftState = event.shiftKey;
                obj.settings.ctrlState = event.ctrlKey;
            });

            obj.$elementTable.on('click', 'tbody td a', function(event) {

                /* Do not want to interfere with column expanding */
                if(obj.settings.ctrlState == true) {
                    event.preventDefault();
                }
            });

    		/* Enable cell expanding for better space utilisation */
			obj.$elementTable.on('click', 'tbody td', function(event) {

                /* We only allow column expansion when ctrl key is down */
                if(obj.settings.ctrlState == false) {
                    return;
                }

				var $td = $(this);
				var $row = $td.parent();
				var colTdIdx = $row.children().index(this);
				var colObjIdx = colTdIdx;

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

                    var $columnTd = $(this);

					var checked = $columnTd.parent().find('.tb-check-box input').prop('checked');
					
					/* Shrink the column if it's expanded, and either the clicked row is selected or the cell can't be selected */
					if($columnTd.hasClass('td-select')) {
					 
						$columnTd.removeClass("td-select");

						if(checked == false) {
							$columnTd.removeClass('off');
						}
					
					/*Expand the column if: the clicked row is either unselected or the cells are links, and not checkboxes */
					} else if($columnTd.hasClass('td-checkbox') == false) {

						$columnTd.addClass("td-select");

						if(checked == false) {
							$columnTd.addClass('off');
						}
					}
				});
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

				var $tr = settings.records[i]['dynamictable-rendered-tr'];

				obj.$elementTable.find('tbody').append($tr);
            }

            /*
             * We set full then do updates, as sometimes we want to hide elements on update.
             * Callback is only called once, so we only want to do a full update once.
             * Otherwise we may get hidden elements popping from subsequent updates that were hidden in the callback.
             */
            obj.setFull();

			/* Drop down menu (top left) */
            obj.paginationPerPage.update();

			/* Page count (bottom left) */
            obj.recordsCount.update();

			/* Page links (bottom right) */
            obj.paginationLinks.update();
     	};
    };


	//-----------------------------------------------------------------
	// Given the settings.records json get the columns (key/column => value)
	// This is only called once to generate the columns.
	//-----------------------------------------------------------------
	function DomColumns(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return obj.$elementTable.is('table');
		};

		this.init = function() {

			if(settings.columns.length == 0 && settings.records.length > 0) {

                this.renameColumns();

				columns = this.orderColumns();

				for(var i = 0, len = columns.length; i < len; i++) {

					var label = columns[i];

					/* Columns Keep gets priority over Ignore */
					if(isNullOrEmpty(settings.columnsKeep) == false) {
			
						if(settings.columnsKeep.indexOf(label) > -1) {

							_this.add(label, i);
						}

					} else if(settings.columnsIgnore.indexOf(label) == -1) {

						_this.add(label, i);
					}
				}
			}
		};

		this.add = function(label, position) {
	
			var columns = settings.columns;
			var id = label;

			var $column;

			if(id == 'dynamictable-select') {

				$column = obj.$defaultElement.find('#th-default').clone();

				$column.removeAttr('id').attr('data-dynamictable-column', id).addClass('dynamictable-head');

			} else {

				/* Add tr th to the DOM */
				$column = obj.$defaultElement.find('#th-default').clone().removeAttr('id');

				/* Check if hide labels for columns */
				if(settings.hideColumnLabel.indexOf(id) == -1) {
					$column.text(label).attr('data-dynamictable-column', id).addClass('dynamictable-head');
				} else {
					$column.attr('data-dynamictable-column', id).addClass('dynamictable-head');
				}
			}

			if(settings.hideLabels == false) {
				obj.$elementTable.find('thead tr').append($column);
			}

			/* Add column data to plugin instance */
			columns.splice(position, 0, {
				index: position,
				label: label,
				id: id,
				sorts: [id]
			});
		};

    	this.orderColumns = function() {

			ordered = [];

			/* Our columns are determined from the keys of the first json record */
			columns = Object.keys(settings.records[0]);

			/* Add our select column if its enabled */
			if(settings.select) {
				ordered.push("dynamictable-select");
			}

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

    	this.renameColumns = function() {

            /* Only determine keys once */
            var columns = Object.keys(settings.records[0]);

			/* Our columns are determined from the keys of the first json record */
			for(var i = 0, len = settings.records.length; i < len; i++) {

                var record = settings.records[i];

                for(var j = 0, len2 = columns.length; j < len2; j++) {
   
                    var columnKey = columns[j];

                    var renameColumn = settings.renameColumns[columnKey]

                    if(isNullOrEmpty(renameColumn)) {
                        continue;
                    }

                    record[renameColumn] = record[columnKey];

                    delete record[columnKey];
                } 
            }		
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
    // Dynamic Table Records
	//  All records -> rows are pre-rendered to ensure faster page loads
    //-----------------------------------------------------------------
	function Records(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {
			return true;
		};

		this.init = function() {

			for(var i = 0, len = settings.records.length; i < len; i++) {

                var record = settings.records[i];

                /* Used to determine original sort order */
			    record['dynamictable-original-index'] = i;

                /* We always need a unique ID per row! */
				record['dynamictable-index'] = i;

				/* From the grid row, clone the default table row and then remove from the grid */
				var $tr = obj.$defaultElement.find('tbody tr').clone().removeAttr('id');

				/* Remove our default TB elements used in pre-rendering */
				$tr.find('#tb-default-checkbox').remove();
				$tr.find('#tb-default').remove();

                /* We need to be able to match a table row to the in-memory record in records */
                $tr.attr('data-dynamictable-index', record['dynamictable-index']);

				/* We want to record which columns are actually shown, unlike dynamictable-select etc */
				settings.renderedColumns = [];

                /* Grab the record's attribute for each column */
				for(var j = 0, len2 = settings.columns.length; j < len2; j++) {

                    var column = settings.columns[j];

                    var key = column.id;

					settings.renderedColumns.push(column);

					/* Temporary TD to render into */
					var $td;

					if(key == 'dynamictable-select') {

						var uniqueId = record['dynamictable-index'];

						$td = obj.$defaultElement.find('#tb-default-checkbox').clone().removeAttr('id');

						$td.find('input').val(uniqueId);
						$td.find('input').attr('id', `${settings.element.id}-checkbox-${uniqueId}`);
						$td.find('label').attr('for', `${settings.element.id}-checkbox-${uniqueId}`);

						$td.addClass("td-select off");

					    /* Tell the cell which column it belongs too for easier lookups */
						$td.attr('data-dynamictable-column', column.label);

					    /* We now have our text after rendering used for search and sorting */
						record[`${key}-rendered`] = "";

					    /* We now have our TD to the official record..updates can occur later and be referenced here */
						record[`${key}-td`] = $td;

						/* We have a custom cell renderer for select boxes */
						var custom = findObjectInArray(settings.cells, {column: key});

					    /* The last step is doing our custom render */
						if(custom) {
							custom.render(settings, null, record, $td);
						}

					} else {

						$td = obj.$defaultElement.find('#tb-default').clone().removeAttr('id');

					    /* Tell the cell which column it belongs too for easier lookups */
						$td.attr('data-dynamictable-column', column.label);

					    /* Do we have a column that is disabled expand specified */
						if(settings.disableExpand.indexOf(key) > -1) {
						    $td.addClass("td-select off");
						}

					    /* We now have our text after rendering used for search and sorting */
						record[`${key}-rendered`] = $td.text();

					    /* We now have our TD to the official record..updates can occur later and be referenced here */
						record[`${key}-td`] = $td;

					    /* If we have a wild card cell renderer then look for a specific renderer for the given column */
						var custom = findObjectInArray(settings.cells, { column: key });

					    /* Otherwise, do we have a custom cell renderer for all cells '*' */
						if(isNull(custom)) {
						    custom = findObjectInArray(settings.cells, { column: '*' });
						}

                        /* The last step is doing our custom render */
						if(custom) {
							custom.render(settings, column, record, $td);
						} else {
							$td.text(record[key]);
						}
					}

					$tr.append($td);
                }

				record['dynamictable-rendered-tr'] = $tr;
			}

			/* Create cache of original full recordset (unpaginated) but cell rendered */
			settings.originalRecords = overload([], settings.records);
		};

		/* For really advanced sorting, see http://james.padolsey.com/javascript/sorting-elements-with-jquery/ */
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
                        var attrRendered = `${attr}-rendered`;

						var direction = sorts[attr];
						var sortType = sortTypes[attr] || obj.sorts.guessType(a, b, attrRendered);
						var comparison = obj.sorts.functions[sortType](a, b, attrRendered, direction);

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

				/* Force false boolean value to -1, true to 1, and tie to 0 */
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

			/* Not sure why `parent()` is needed, the arrow should be inside the link from `append()` above */
			$link.find('.dynamictable-arrow').remove();
		};

		this.removeAllArrows = function() {
			obj.$elementTable.find('.dynamictable-arrow').remove();
		};

		this.toggleSort = function(e, $link, column) {
	
            /* Make sure nothing is selected on sort */
            obj.inputsSelect.deselect();

			var sortedByColumn = this.sortedByColumn($link, column);
			var value = this.sortedByColumnValue(column);

			this.removeAllArrows();

			obj.sorts.clear();

			/* If sorts for this column are already set */
			if(sortedByColumn) {

				/* If ascending, then make descending */
				if(value == 1) {

					for (var i = 0, len = column.sorts.length; i < len; i++) {
						obj.sorts.add(column.sorts[i], -1);
					}
		
					this.appendArrowDown($link);

				/* If descending, remove sort */
				} else {
					
				    for(var i = 0, len = column.sorts.length; i < len; i++) {
						obj.sorts.remove(column.sorts[i]);
					}
					
				    this.removeArrow($link);
				}

			/* Otherwise, if not already set, set to ascending */
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

            /* Make sure nothing is selected on search */
            obj.inputsSelect.deselect();

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

				/* collect all records that return true for query */
				settings.records = $.map(settings.records, function(record) {
					return _this.search(record, query) ? record : null;
				});
			}

			settings.queryRecordCount = obj.records.count();

			if(settings.queryRecordCount == 0) {
				obj.setEmpty(false);
			}
		};

		/*
         * Query functions for in-page querying each function should take a record and a value as input 
         *  and output true of false as to whether the record is a match or not.
         */
		this.search = function(record, queryValue) {

			var contains = false;

			/* Loop through each attribute of record */
			for(attr in record) {

                /* By default we only want rendered cells */
                var attrKey = `${attr}-rendered`;

                /* But sometimes we want to search hidden values in settings.records */
                if(settings.searchKeys.indexOf(attr) > -1) {
                    attrKey = attr;
                }

				if(record.hasOwnProperty(attrKey)) {

					var attrValue = record[attrKey];

					if(typeof(attrValue) === "string" && attrValue.toLowerCase().indexOf(queryValue.toLowerCase()) !== -1) {

						contains = true;

						/* Don't need to keep searching attributes once found */
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
	// Dynamic search input functionality
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
    
            obj.$element.find('#dynamictable-search-clear').on('click', function(e) {
				
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

                for(var i = 0, len = items.length; i < len; i++) {
            
                    var cleaned = {}

				    for(var j = 0, len2 = settings.renderedColumns.length; j < len2; j++) {
        
						var col = settings.renderedColumns[j].label;

						if(settings.exportsIgnore.indexOf(col) > -1) {
							continue;
						}

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
				obj.$defaultElement.find('.tb-check-box').remove();
				obj.$element.find("#select-menu").remove();
				obj.$element.find("#dynamictable-selector").remove();
			}

			return settings.select && !settings.simple;
		};

		this.init = function() {

			_this.first = null;

			_this.create();
		};

		this.create = function() {

			var $selectMenu = obj.$element.find("#select-menu");

			/* Hide select menu when click elsewhere */
			$('html').click(function(e) {

				var $isMenu = $(e.target).closest('div').is('#dynamictable-selector');

				if($isMenu == false) {

					$selectMenu.hide();
				}
			});

            obj.$elementTable.on('click', 'tbody td a', function(event) {

                if(settings.shiftState == true) {

                    /* If we are doing a shift select then do not allow click on links */
                    event.preventDefault();

                } else {

                    /* When we click on a link we do not want the whole row to deselect */
                    settings.clickThrew = false;
                }
            });
            
			obj.$elementTable.on('click', 'tbody td', function() {

                /* Do not allow select when expanding column */
                if(settings.ctrlState == true || settings.clickThrew == false) {

                    settings.clickThrew = true;

                    return;
                }

				/* If we have the context menu open all clicks will close it */
				if(settings.contextMenu == true && obj.inputsContextMenu.isVisible == true) {

					return;
				}

                /* We want to do a multi-select as shift is down */
                if(settings.shiftState == true) {

                    /* Deselect any selected text to prevent shift-select */
                    document.getSelection().removeAllRanges();
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

				_this.shiftSelect($checkbox);

				_this.updateSelectCount();
            });

			obj.$element.on('click', '#dynamictable-selector', function(event) {

				$selectMenu.children().show();

				$selectMenu.css({
					display: "block",
					left: event.pageX,
					top: event.pageY
				});

				$selectMenu.find('#select-menu-select-page').off('click');

                $selectMenu.find('#select-menu-select-page').on('click', function() {

					_this.select();

					$selectMenu.hide();
				});

				$selectMenu.find('#select-menu-select-all').off('click');

                $selectMenu.find('#select-menu-select-all').on('click', function() {

					_this.selectAll();

					$selectMenu.hide();
				});

				$selectMenu.find('#select-menu-deselect-page').off('click');

				$selectMenu.find('#select-menu-deselect-page').on('click', function() {

					_this.deselect();

					$selectMenu.hide();
				});

				$selectMenu.find('#select-menu-deselect-all').off('click');

  				$selectMenu.find('#select-menu-deselect-all').on('click', function() {

					_this.deselectAll();

					$selectMenu.hide();
				});
			});
		};

		this.highlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).addClass('td-highlight');
				$(this).addClass('off');
			});
		};

		this.highlightRowByIndex = function(index) {

			obj.$elementTable.find(`tr[data-dynamictable-index="${index}"]`).children().each(function() {

				$(this).addClass('td-highlight');
				$(this).addClass('off');
			});
		};

		this.unhighlightRow = function($tr) {

			$tr.children().each(function() {

				$(this).removeClass('td-highlight');
				$(this).removeClass('off');

				var key = $(this).attr('data-dynamictable-column');

				/* Do we have a column that is disabled expand specified */
				if(settings.disableExpand.indexOf(key) > -1) {
					$(this).addClass('off');
				}
			});
		};

		this.unhighlightRowByIndex = function(index) {

            obj.$elementTable.find(`tr[data-dynamictable-index="${index}"]`).children().each(function() {

				$(this).removeClass('td-highlight');
				$(this).removeClass('off');

				var key = $(this).attr('data-dynamictable-column');

				/* Do we have a column that is disabled expand specified */
				if(settings.disableExpand.indexOf(key) > -1) {
					$(this).addClass('off');
				}
			});
		};

		this.getSelected = function() {

			var ids = [];

			for(var i = 0, len = settings.originalRecords.length; i < len; i++) {

				var $tick = settings.originalRecords[i]['dynamictable-select-td'].find('input');

				if($tick.prop('checked')) {

					ids.push(settings.originalRecords[i]);
				}
			}

			return ids;
		};

	    /* Select all rows */
        this.updateSelectCount = function() {

			var selectCount = 0;
			var $selectCount = obj.$element.find("#select-count");

			/* We use the in-memory pre-rendered originalRecords TD's as that covers all records not just paginated records */
			for(var i = 0, len = settings.originalRecords.length; i < len; i++) {

				var isChecked = settings.originalRecords[i]['dynamictable-select-td'].find('input').prop("checked");

				if(isChecked) {
					selectCount++;
				}		
			}

			$selectCount.text(selectCount);

			if(selectCount == 0) {
				$selectCount.hide();
			} else {
				$selectCount.show();
			}
        };

        /* Select all rows on page */
        this.select = function() {

			/* Reset first clicked state */
			_this.first = null;

			/* We use the in-memory pre-rendered record TD's as that the paginated */
			for(var i = 0, len = settings.records.length; i < len; i++) {

				var $tr = settings.records[i]['dynamictable-select-td'].parent();

				_this.selectByTr($tr);
			}

			_this.updateSelectCount();
        };

	    /* Select all rows */
        this.selectAll = function() {

			/* Reset first clicked state */
			_this.first = null;

			/* We use the in-memory pre-rendered originalRecords TD's as that covers all records not just paginated records */
			for(var i = 0, len = settings.originalRecords.length; i < len; i++) {

				var $tr = settings.originalRecords[i]['dynamictable-select-td'].parent();

				_this.selectByTr($tr);
			}

			_this.updateSelectCount();
        };

        /* Select by a dynamictable-index */
        this.selectByIndex = function(index) {

            obj.$elementTable.find(`tr[data-dynamictable-index="${index}"]`).each(function() {

                $tr = $(this);

				_this.selectByTr($tr);
            });

			_this.updateSelectCount();
        };

        /* Select by a table row element */
        this.selectByTr = function($tr) {

			_this.highlightRow($tr);

            $tr.find('.tb-check-box input').prop("checked", true);
        };

        /* Deselect all rows on page */
        this.deselect = function() {

			/* Reset first clicked state */
			_this.first = null;

			/* We use the in-memory pre-rendered record TD's as that the paginated */
			for(var i = 0, len = settings.records.length; i < len; i++) {

				var $tr = settings.records[i]['dynamictable-select-td'].parent();

				_this.deselectByTr($tr);
			}

			_this.updateSelectCount();
        };

	    /* Deselect all rows */
        this.deselectAll = function() {

			/* Reset first clicked state */
			_this.first = null;

			/* We use the in-memory pre-rendered originalRecords TD's as that covers all records not just paginated records */
			for(var i = 0, len = settings.originalRecords.length; i < len; i++) {

				var $tr = settings.originalRecords[i]['dynamictable-select-td'].parent();

				_this.deselectByTr($tr);
			}

			_this.updateSelectCount();
        };

        /* Deselect by a dynamictable-index */
        this.deselectByIndex = function(index) {

            obj.$elementTable.find(`tr[data-dynamictable-index="${index}"]`).each(function() {

                $tr = $(this);

				_this.deselectByTr($tr);
            });

			_this.updateSelectCount();
        };

	    /* Deselect by a table row element */
        this.deselectByTr = function($tr) {

			_this.unhighlightRow($tr);

            $tr.find('.tb-check-box input').prop("checked", false);
        };

		/* Select by shift */
        this.shiftSelect = function(checkbox) {
 
            /* We need two check boxes checked */
            if(_this.first == null) {

                _this.first = checkbox;
                    
                return;
            }

            /* Our starting box in select cannot be unchecked, so set first to the last clicked row instead */
            if(_this.first.prop("checked") == false) {
                  
                _this.first = checkbox;
                    
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

			_this.updateSelectCount();
        };
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

			_this.isVisible = false;

		    return build;
		};

		this.init = function() {
			
		    var $contextMenu = obj.$element.find("#context-menu");

			/* Hide context menu when click elsewhere */
			$('html').click(function(e) {

			    $contextMenu.hide();

				_this.isVisible = false;
			});

			/* Allow a context menu to appear when right click occurs. */
			$(document).on('contextmenu', `#${settings.element.id} tbody td`, function(event) {

                var $td = $(this);

				if(settings.select) {
					obj.$element.find("#select-menu").hide();
					obj.$element.find("#per-page-menu").hide();
				}

                /* Give the matching in-memory row record for the selected cell */
                var completeRecord = findObjectInArray(settings.records, {
				    'dynamictable-index' : $td.parent().attr('data-dynamictable-index')
			    });
    
			    $contextMenu.children().hide();

			    $contextMenu.css({
					display: "block",
					left: event.pageX,
					top: event.pageY
				});

				_this.isVisible = true;

                /* Lets allow expanding column via right click */
				$contextMenu.find('#context-menu-expand-column').show();
				$contextMenu.find('#context-menu-expand-column').off('click');

                $contextMenu.find('#context-menu-expand-column').on('click', function() {

                    obj.settings.ctrlState = true;

                    $td.click();

                    obj.settings.ctrlState = false;

					$contextMenu.hide();
				});

				/* If we have a link then provide new tab option */
				var link = $(this).find('a');

				if(link.length == 1) {

					var linkHref = $(link).attr('href');

					if(isNullOrWhiteSpace(linkHref) == false) {

					    $contextMenu.find('#context-menu-new-tab').show();
					    $contextMenu.find('#context-menu-new-tab').off('click');

					    $contextMenu.find('#context-menu-new-tab').on('click', function () {

							window.open(linkHref, '_blank');

							$('#context-menu').hide();
						});

					    $contextMenu.find('#context-menu-copy-link').show();
					    $contextMenu.find('#context-menu-copy-link').off('click');

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

				/* Get our cell text */
				var cellText = $td.text();

				if(isNullOrWhiteSpace(cellText) == false) {

				    $contextMenu.find('#context-menu-copy-text').show();
				    $contextMenu.find('#context-menu-copy-text').off('click');

				    $contextMenu.find('#context-menu-copy-text').on('click', function() {

						toClipboard(cellText);

						$('#context-menu').hide();
					});
				}

				/* Get our cell value */
				var cellValue = completeRecord[$td.attr('data-dynamictable-column')];

				if(isNullOrWhiteSpace(cellValue) == false) {

				    $contextMenu.find('#context-menu-copy-value').show();
				    $contextMenu.find('#context-menu-copy-value').off('click');

				    $contextMenu.find('#context-menu-copy-value').on('click', function() {

						toClipboard(cellValue);

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

				/* 
                    Get a column of text based off the selected cell.
                    We count col from 1 not 0, so give an offset of +1
                */
				var col = $td.parent().children().index(this) + 1;

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

    	    var $perPage = obj.$element.find('#dynamictable-per-page');
			var $perPageCount = obj.$element.find("#per-page-count");
		    var $perPageMenu = obj.$element.find("#per-page-menu");

            if(isNullOrWhiteSpace(settings.perPageDefault)) {
                perPageDefault = 10;
            }

      		this.set(settings.perPageDefault, true);
      
     		for(var i = 0, len = settings.perPageOptions.length; i < len; i++) {

        		var number = settings.perPageOptions[i];

				var $item = obj.$element.find('#per-page-menu-default').clone().removeAttr('id');

				$item.html(number);

				$perPageMenu.append($item);
      		}

			obj.$element.find('#per-page-menu-default').remove();

			$perPageCount.text($perPageMenu.find('li:first').text());

			/* Hide per page menu when click elsewhere */
			$('html').click(function(e) {

				var $isMenu = $(e.target).closest('div').is('#dynamictable-per-page');

				if($isMenu == false) {
					$perPageMenu.hide();
				}
			});

			obj.$element.on('click', '#dynamictable-per-page', function(event) {

				$perPageMenu.children().show();

				$perPageMenu.css({
					display: "block",
					left: event.pageX,
					top: event.pageY
				});

				$perPageMenu.find('li').off('click');

                $perPageMenu.find('li').on('click', function() {

					var perPageCount = $(this).text();

     		    	_this.set(perPageCount);

					$perPageCount.text(perPageCount);

					$perPageMenu.hide();

 					obj.process();
				});
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

					/* Page Numbers */
					if(breakIndex > 0 && i !== 1 && nextBreak && nextBreak > (i + 1)) {

						var ellip = '<li><span class="dynamictable-page-break">&hellip;</span></li>';

						li = breakIndex < 2 ? ellip + li : li + ellip;
					}

					/* Previous Button */
					if(settings.paginationPrev && i === 1) {

						var prevLi = obj.paginationLinks.buildLink(page - 1, settings.paginationPrev, pageLinkClass + ' ' + settings.paginationPrevClass, page === 1, disabledPageClass);
						li = prevLi + li;
					}

					/* Next Button */
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
				$this.closest(settings.paginationClass).find(`.${activePageClass}`).removeClass(activePageClass);
				$this.addClass(activePageClass);
			
				/* 
				 * Lets update our PaginationPage object.
				 *	Which will then be used by PaginationLinks update function on next table render.
				 *	 Which will then call the PaginationLinks build function to recreate the links. 
				 */
				obj.paginationPage.set($this.data('dynamictable-page'));

				obj.process();

				e.preventDefault();
			});

			return pageLinks;
		};

		this.buildLink = function(page, label, linkClass, conditional, conditionalClass) {

		    var link = '<a data-dynamictable-page=' + page + ' class="' + linkClass;
		    var li = '<li';

		    if(conditional) {
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
	$.fn.dynamictable = function(options) {

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

