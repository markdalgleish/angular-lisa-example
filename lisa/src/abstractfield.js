/**
 * base class for all form fields
 * provides validation and returns data for api calls
 * @constructor
 */
define( [ "jquery", "./view", "nohtml" ], function( $, View, nohtml ) {
	return View.extend({
		defaults: {
			name: "",			// (required) - name of the field
			require: false,		// validation requirements (false, true, regexp, function)
			value: "",			// default value
			label: "",			// human readable label of this field
			placeholder: "",
			showInvalid: true
		},
		_initModelView: function() {
			this._super();
			this.label = this.config.label;

			if (this.model && this.modelField) {
					this.require = this.config.require = ($.isFunction(this.model.fields) &&
							this.model.fields() &&
							this.model.fields()[this.modelField] &&
							this.model.fields()[this.modelField].mandatory);
			} else {
					this.require = this.config.require;
			}

			this.name = this.config.name;
			this.$field = $( nohtml( this._fieldTemplate() ) );
		},
		_initHandlers: function() {
			this._super();

			if (this.model && this.modelField) {
				this.on('change', function() {
						this._firstChangeOrValidation_handler('change');
				}.bind(this));

				this.model.on('validate', function() {
						this._firstChangeOrValidation_handler('validate');
				}.bind(this));
			}
		},
		_initSetup: function() {
			this._super();
			this.config.value && this._setVal( this.config.value );
		},

		_firstChangeOrValidation_handler: function(type) {
				this._bindModelValidationEvents(type);
				this._firstChangeOrValidation_handler = $.noop;
		},

		_bindModelValidationEvents: function(type) {
				this.model.on('validatefield.' + this.modelField, function() {
						this._setValidating(true);
						this.setInvalid(false);
				}.bind(this)).on('validfield.' + this.modelField, function() {
						this._setValidating(false);
						this.setInvalid(false);
				}.bind(this)).on('invalidfield.' + this.modelField, function(jEv) {
						this._setValidating(false);
						this.setInvalid(true, jEv && jEv.errorMessage);
				}.bind(this));

				if (type === 'change') {
						this.model.validate(this.modelField, this.val());
				}
		},

		_generateErrorMessage: function() {
				if (this.errorEl === undefined) {
						this.errorEl = $( nohtml( this._errorMessage_template() ) );
				}
		},

		_showErrorMessage: function(msg) {
				if (msg === undefined || this.$el === undefined) {
						return;
				}

				this._generateErrorMessage();

				this.errorEl.text(msg).show().insertAfter(this.$el);
		},

		_hideErrorMessage: function() {
				if (this.errorEl !== undefined) {
						this.errorEl.hide();
				}
		},
		_setValidating: function() {},

		_setInvalid: function(invalid, errorMessage) {
				if (this.config.showInvalid) {
						if (invalid && errorMessage !== undefined) {
								this._showErrorMessage(errorMessage);
						} else {
								this._hideErrorMessage();
						}

						this.$el[invalid ? 'addClass' : 'removeClass']("error");
				}
		},

		setInvalid: function(invalid, errorMessage) {
				this._setInvalid(invalid, errorMessage);
		},
		
		val: function( val ) {
			if( val === undefined ) {
				return this._getVal();
			} else {
				return this._setVal( val );
			}
		},
		validate: function() {
			var val = this._getVal(), req = this.require;
			if(req === false) {
				return true;
			} else if(req === true) {
				return val.length > 0;
			} else if(req.test && $.isFunction(req.test)) {
				return req.test(val);
			} else if($.isFunction(req)) {
				return req(val, this);
			}
		},

		_getVal: function() {
			return this.$field.val();
		},
		_setVal: function( val ) {
			return this.$field.val( val );
		},
		_mainTemplate: function() { return (
			{ tag: "DIV", id: this.id(), cls: "uiField " + (this.require ? " control-group " : ""), children: [
				{ tag: "LABEL", "for": this.id( "field" ), cls: "uiField-label", children: [
					this.label,
					this._requireTemplate()
				] },
				this.$field
			] }
		); },
		_fieldTemplate: $.noop,
		_requireTemplate: function() { return (
			this.require ? { tag: "SPAN", cls: "require", text: "*" } : null
		); },

		_errorMessage_template: function() {
				return { tag: 'DIV', css: {
						color: 'red',
						fontStyle: 'italic',
						margin: '3px 0 1px 0'
				} };
		}
	});
});
