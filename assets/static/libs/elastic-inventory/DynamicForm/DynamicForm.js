/***
																													
	@@@@@@@   @@@ @@@  @@@  @@@   @@@@@@   @@@@@@@@@@   @@@   @@@@@@@  @@@@@@@@   @@@@@@   @@@@@@@   @@@@@@@@@@   
	@@@@@@@@  @@@ @@@  @@@@ @@@  @@@@@@@@  @@@@@@@@@@@  @@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@@@@@  
	@@!  @@@  @@! !@@  @@!@!@@@  @@!  @@@  @@! @@! @@!  @@!  !@@       @@!       @@!  @@@  @@!  @@@  @@! @@! @@!  
	!@!  @!@  !@! @!!  !@!!@!@!  !@!  @!@  !@! !@! !@!  !@!  !@!       !@!       !@!  @!@  !@!  @!@  !@! !@! !@!  
	@!@  !@!   !@!@!   @!@ !!@!  @!@!@!@!  @!! !!@ @!@  !!@  !@!       @!!!:!    @!@  !@!  @!@!!@!   @!! !!@ @!@  
	!@!  !!!    @!!!   !@!  !!!  !!!@!!!!  !@!   ! !@!  !!!  !!!       !!!!!:    !@!  !!!  !!@!@!    !@!   ! !@!  
	!!:  !!!    !!:    !!:  !!!  !!:  !!!  !!:     !!:  !!:  :!!       !!:       !!:  !!!  !!: :!!   !!:     !!:  
	:!:  !:!    :!:    :!:  !:!  :!:  !:!  :!:     :!:  :!:  :!:       :!:       :!:  !:!  :!:  !:!  :!:     :!:  
	 :::: ::     ::     ::   ::  ::   :::  :::     ::    ::   ::: :::   ::       ::::: ::  ::   :::  :::     ::   
	:: :  :      :     ::    :    :   : :   :      :    :     :: :: :   :         : :  :    :   : :   :      :    
																												  
																												
    * BASED ON:
    * 	https://github.com/gitana/alpaca 
	*	https://github.com/ansman/validate.js/blob/master/validate.js
    *
    * TODO:
	*

    |---------------------------------------|
    | FORMBUILDER.JS                        |
	|	-Generate form based on JSON schema |
	|---------------------------------------|
	| VALIDATE.JS							|
	|	-Validate form elements 			|
    |---------------------------------------|
    | UTILITY.JS                            |
    |	-Useful helper functions            |
    |---------------------------------------|

***/

(function($) {

	var modelPrototypes = {
		dom: Dom,
		inputsText: InputsText,
		inputsSelect: InputsSelect,
		inputsTextArea: InputsTextArea,
		inputsCalendar: InputsCalendar,
		inputsCurrency: InputsCurrency,
		inputsNumber: InputsNumber,
		inputsFile: InputsFile,
		inputsImagePreview: InputsImagePreview,
		inputsTags: InputsTags
	};

	//-----------------------------------------------------------------
	// Cached plugin global defaults
	//-----------------------------------------------------------------
	var defaults = {

		template: `

			<div class="default-form-wrapper">
				<div class="dynamicform-input-text field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-select field">
					<label class="control-label" for="#">&nbsp;</label>
					<select name="#" autocomplete="off">
						<option value="">&nbsp;</option>
					</select>
				</div>
				<div class="dynamicform-input-textarea field">
					<label class="control-label" for="#">&nbsp;</label>
					<textarea rows="5" cols="40" name="#" autocomplete="off"></textarea>
				</div>
				<div class="dynamicform-input-calendar field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-currency field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-number field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-file field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-imagepreview field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
				<div class="dynamicform-input-tags field">
					<label class="control-label" for="#">&nbsp;</label>
					<input type="text" name="#" autocomplete="off">
				</div>
			</div>
		`,

		schema: {},				/* Give me the schema that describes the form */
		data: {},				/* Give me data that matches the schema Labels */

		postRender: null
	};


	//-----------------------------------------------------------------
	// Each dynamicform instance inherits from this,
	// set properties specific to instance
	//-----------------------------------------------------------------
	var df = {

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

		/* 
		 * This is called only externally to the plugin not within 
		 */
		update: function() {

		    this.process();
		},

		/* 
		 * 
		 */
		process: function() {

			/* Update the dom to reflect the change in records */
			this.dom.update();
		},


		/*
		 * Get all values in as JSON string
		 */
		serialize: function() {

			var values = {};

			for(model in modelPrototypes) {

				var modelInstance = this[model];

				if(isNullOrEmpty(modelInstance.serialize)) {
					continue;
				}

				overload(values, this[model].serialize());
			}

			return values;
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

            /* We only want one default table */
		    $('.default-form-wrapper').remove();

			/* Now lets add our default template to the DOM */
			$('body').prepend(settings.template);

			/* Now we get our inserted template element */
			obj.$defaultElement = $('body .default-form-wrapper');

			/* We add the required DOM elements to the users element */
			obj.$element = $(settings.element);
    	};

        /* 
		 * Update table contents with new records array from query 
		 */
        this.update = function() {};
    };


	//-----------------------------------------------------------------
	// Dynamic Text input functionality
	//-----------------------------------------------------------------
	function InputsText(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "text";

			return true;
		};

		this.init = function() {

			//console.log("InputsText");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-text").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Select input functionality
	//-----------------------------------------------------------------
	function InputsSelect(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "select";
	
		    return true;
		};

		this.init = function() {

			//console.log("InputsSelect");

			var fields = settings.schema.fields;

			for(var i = 0, lenI = fields.length; i < lenI; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-select").clone();

				$container.find("option").remove();
				$container.attr('data-sort', field.order);

				var $label = $container.find("label"); 
				var $select = $container.find("select");

				$label.text(field.label);			
				$label.attr('for', field.name);

				$select.attr('name', field.name);

				var options = field.options || [];

				for(var j = 0, lenJ = options.length; j < lenJ; j++) {

					var option = options[j];

					var $option = obj.$defaultElement.find(".dynamicform-input-select option").clone();

					if(isNullOrEmpty(option.label)) {
						$option.text(option.value);
					} else {
						$option.text(option.label);
					}

					$option.val(option.value);

					if(option.value.toLowerCase() == data.toLowerCase()) {
						$option.attr("selected", "selected");
					}

					$select.append($option);
				}

				field.$domContainer = $container;
				field.$domInput = $select;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic TextArea input functionality
	//-----------------------------------------------------------------
	function InputsTextArea(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "textarea";
	
		    return true;
		};

		this.init = function() {

			//console.log("InputsTextArea");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-textarea").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("textarea");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Calendar input functionality
	//-----------------------------------------------------------------
	function InputsCalendar(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "calendar";

		    return true;
		};

		this.init = function() {

			console.log("InputsCalendar");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-calendar").clone();

				var $label = $container.find("label");
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				var preferences = field.preferences || {};

				var defaultPreferences = {};

				/* Merge user preferences with default preferences */
				overload(defaultPreferences, preferences);

				console.log(defaultPreferences);
				console.log($container);

				/* 
				 * Depends on: https://fomantic-ui.com/modules/calendar.html 
				 */
				$input.calendar(defaultPreferences);

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Currency input functionality
	//-----------------------------------------------------------------
	function InputsCurrency(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "currency";	

		    return true;
		};

		this.init = function() {

			//console.log("InputsCurrency");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-currency").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				var preferences = field.preferences || {};

				var defaultPreferences = {
					prefix : 'US$ ',
					centsSeparator : '.',
					thousandsSeparator : ',',
					limit : false,
					centsLimit : 2,
					clearPrefix : false,
					allowNegative : false,
					clearOnEmpty: false
				};

				/* Merge user preferences with default preferences */
				overload(defaultPreferences, preferences);

				/* 
				 * Depends on: http://price-format.github.io/Jquery-Price-Format/
				 */
				//$input.priceFormat(defaultPreferences);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Number input functionality
	//-----------------------------------------------------------------
	function InputsNumber(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "number";

		    return true;
		};

		this.init = function() {

			//console.log("InputsNumber");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-number").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic File input functionality
	//-----------------------------------------------------------------
	function InputsFile(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "file";	

		    return true;
		};

		this.init = function() {

			//console.log("InputsFile");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-file").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Thumbnail input functionality
	//-----------------------------------------------------------------
	function InputsImagePreview(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "imagepreview";	

		    return true;
		};

		this.init = function() {

			//console.log("InputsImagePreview");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-imagepreview").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);
				$input.val(data);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Dynamic Tags input functionality
	//-----------------------------------------------------------------
	function InputsTags(obj, settings) {

		var _this = this;

		this.initOnLoad = function() {

			_this.type = "tags";

		    return true;
		};

		this.init = function() {

			//console.log("InputsTags");

			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				var data = settings.data[field.label] || "";

				var $container = obj.$defaultElement.find(".dynamicform-input-tags").clone();

				var $label = $container.find("label"); 
				var $input = $container.find("input");

				$container.attr('data-sort', field.order);

				$label.text(field.label);			
				$label.attr('for', field.name);

				$input.attr('name', field.name);

				field.$domContainer = $container;
				field.$domInput = $input;	
				field.$domLabel = $label;

				obj.$element.append($container);
			}

			obj.$element.sortDivs();
		};

        this.serialize = function() {

			var values = {};
			var fields = settings.schema.fields;

			for(var i = 0, len = fields.length; i < len; i++) {

				var field = fields[i];

				if(field.type != _this.type) {
					continue;
				}

				values[field.label] = field.$domInput.val();
			}

			return values;
		};
	};


	//-----------------------------------------------------------------
	// Create dynamicform plugin based on a defined object
	//-----------------------------------------------------------------
	$.fn.dynamicform = function(options) {

		return this.each(function() {

			if(!$.data(this, 'dynamicform')) {

                //console.log("NEW DYNAMICFORM");
                //console.log(this);
                //console.log(options);

				$.data(this, 'dynamicform', Object.create(df).init(this, options));
			}

			//console.log("FOUND DYNAMICFORM INSTANCE:");
			//console.log($.data(this, 'dynamicform'));
		});
	};

})(jQuery);

