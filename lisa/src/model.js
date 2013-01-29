define( [ "jquery", "./observable" ], function( $, Observable ) {

    return Observable.extend({
        defaults: {
            data: null
        },

        _fieldValidationDefaults: {
            mandatory: false,
            maxLength: undefined,
            regex: /.*/,
            onValidateField: undefined,
            onValidateModel: function(validIf) {
                validIf(true);
            }
        },

        init: function() {
            this._super();
            this._values = $.extend({}, this.config.data);

            this._validationIndex = -1;
            
            this._pendingValidateFieldDeferreds = {};
            this._onValidateFieldResultsCache = {};
        },

        fields: function() {
            return {};
        },

        set: function(key, value) {
            if (this._values[key] === value) {
                return;
            }
            this._values[key] = value;
            this.fire("change." + key);
            return this.validate(key, value);
        },

        get: function(key) {
            return this._values[key];
        },

        validate: function(sourceKey, sourceValue) {
            if (this.fields() === undefined) {
                return;
            }

            return this._generateValidationPromise(sourceKey, sourceValue);
        },

        _generateValidationPromise: function(sourceKey, sourceValue) {
            var validationIndex = this._validationIndex,
                validationPromise,
                fieldValidationPromises;

            if (sourceKey === undefined) {
                this.fire('validate');
            }

            if (this._hasPendingValidationPromise(sourceKey)) {
                validationPromise = this._pendingValidationPromise;
            } else {
                validationIndex = this._validationIndex = this._validationIndex + 1;

                fieldValidationPromises = this._generateAllFieldValidationPromises(validationIndex, sourceKey, sourceValue);

                validationPromise = $.when.apply(null, fieldValidationPromises);
            }

            this._pendingValidationPromise = validationPromise;

            validationPromise = this._bindEventsToValidationPromise(validationPromise, validationIndex);

            return validationPromise;
        },

        _hasPendingValidationPromise: function(sourceKey) {
            return (sourceKey === undefined &&
                this._pendingValidationPromise !== undefined &&
                this._pendingValidationPromise.state() === 'pending');
        },

        _generateAllFieldValidationPromises: function(validationIndex, sourceKey, sourceValue) {
            var fieldValidationPromises = [],
                fields = this.fields();

            for (var key in fields) {
                if (fields.hasOwnProperty(key)) {
                    fieldValidationPromises.push(this._generateFieldValidationPromise(validationIndex, key, sourceKey, sourceValue));
                }
            }

            return fieldValidationPromises;
        },

        _bindEventsToValidationPromise: function(validationPromise, validationIndex) {
            var fireValidEvent = function() {
                    if (validationIndex === this._validationIndex) {
                        this.fire('valid');
                    }
                }.bind(this),

                fireInvalidEvent = function() {
                    if (validationIndex === this._validationIndex) {
                        this.fire('invalid');
                    }
                }.bind(this),

                deletePendingValidationPromise = function() {
                    delete this._pendingValidationPromise;
                }.bind(this);

            return validationPromise.done(fireValidEvent).fail(fireInvalidEvent).always(deletePendingValidationPromise);
        },

        _generateFieldValidationPromise: function(validationIndex, key, sourceKey, sourceValue) {
            var fields = this.fields();

            if (fields === undefined || fields[key] === undefined) {
                return;
            }

            this.fire('validatefield.' + key);

            var fieldValidationDeferred = new $.Deferred(),
                fieldSpec = this._getFieldSpec(key),
                value = this.get(key) || '',

                isBlank = function() {
                    return value === undefined ||
                        (value.trim && value.trim() === '') ||
                        value.length === 0;
                },

                isBlankAndNotMandatory = function() {
                    return !fieldSpec.mandatory && isBlank();
                },

                isBlankAndMandatory = function() {
                    return fieldSpec.mandatory && isBlank();
                },

                isTooLong = function() {
                    return fieldSpec.maxLength !== undefined && value.length > fieldSpec.maxLength;
                },

                failsRegex = function() {
                    return !fieldSpec.regex.test(value);
                };

            if (isBlankAndNotMandatory()) {
                fieldValidationDeferred.resolve();
            } else if (isBlankAndMandatory() || isTooLong() || failsRegex()) {
                fieldValidationDeferred.reject();
            } else {
                fieldValidationDeferred = this._attachFieldValidationFunctionsToDeferred(fieldValidationDeferred, fieldSpec, key, sourceKey, sourceValue);
            }

            fieldValidationDeferred = this._bindFieldValidationEventsToDeferred(fieldValidationDeferred, validationIndex, key);

            return fieldValidationDeferred.promise();
        },

        _attachFieldValidationFunctionsToDeferred: function(fieldDeferred, fieldSpec, key, sourceKey, sourceValue) {
            var onValidateFieldDeferred = this._generateOnValidateFieldDeferred(fieldSpec.onValidateField, key, sourceKey, sourceValue),
                onValidateModelDeferred = this._generateOnValidateModelDeferred(fieldSpec.onValidateModel, sourceKey, sourceValue);

            $.when(onValidateFieldDeferred, onValidateModelDeferred).done(function() {
                fieldDeferred.resolve();
            }).fail(function() {
                fieldDeferred.reject();
            });

            return fieldDeferred;
        },

        _bindFieldValidationEventsToDeferred: function(fieldValidationDeferred, validationIndex, key) {
            var jEv = {},

                fireValidEvent = function(){
                    if (validationIndex === this._validationIndex) {
                        this.fire('validfield.' + key, jEv);
                    }
                }.bind(this),

                fireInvalidEvent = function(){
                    if (validationIndex === this._validationIndex) {
                        jEv.errorMessage = this.fields()[key].errorMessage;

                        this.fire('invalidfield.' + key, jEv);
                    }
                }.bind(this);

            return fieldValidationDeferred.done(fireValidEvent).fail(fireInvalidEvent);
        },

        _generateOnValidateFieldDeferred: function(onValidateField, key, sourceKey, sourceValue) {
            var onValidateFieldDeferred = new $.Deferred(),
                isValidatingChangedField = (key === sourceKey);

            if (!$.isFunction(onValidateField)) {
                return onValidateFieldDeferred.resolve();
            }

            onValidateFieldDeferred = (isValidatingChangedField ?
                this._runOnValidateFieldFunction(onValidateFieldDeferred, onValidateField, sourceKey, sourceValue) :
                this._getExistingFieldDeferred(onValidateFieldDeferred, key));

            return onValidateFieldDeferred;
        },

        _runOnValidateFieldFunction: function(validateFieldDeferred, onValidateField, sourceKey, sourceValue) {
            var pendingFieldKey = sourceKey + '_' + sourceValue,
                pendingValidateFieldDeferred = this._pendingValidateFieldDeferreds[pendingFieldKey],
                hasPendingFieldDeferred = (pendingValidateFieldDeferred !== undefined),
                jEv;

            if (!hasPendingFieldDeferred) {
                this._pendingValidateFieldDeferreds[pendingFieldKey] = validateFieldDeferred;

                validateFieldDeferred.always(function() {
                    delete this._pendingValidateFieldDeferreds[pendingFieldKey];
                }.bind(this));

                jEv = {
                    model: this,
                    value: sourceValue
                };

                onValidateField(function(isValid) {
                    this._onValidateFieldResultsCache[sourceKey] = (isValid ? 'resolve' : 'reject');
                    validateFieldDeferred[isValid ? 'resolve' : 'reject']();
                }.bind(this), jEv);
            } else {
                validateFieldDeferred = pendingValidateFieldDeferred;
            }

            return validateFieldDeferred;
        },

        _getExistingFieldDeferred: function(validateFieldDeferred, key) {
            var pendingFieldDeferred = this._pendingValidateFieldDeferreds[key + '_' + this._values[key]];

            return pendingFieldDeferred || validateFieldDeferred[this._onValidateFieldResultsCache[key] || 'reject']();
        },

        _generateOnValidateModelDeferred: function(onValidateModel, sourceKey, sourceValue) {
            var onValidateModelDeferred = new $.Deferred(),
                jEv = {
                    model: this,
                    sourceKey: sourceKey,
                    sourceValue: sourceValue
                };

            onValidateModel(function(isValid) {
                onValidateModelDeferred[isValid ? 'resolve' : 'reject']();
            }, jEv);

            return onValidateModelDeferred;
        },

        _getFieldSpec: function(key) {
            return $.extend({}, this._fieldValidationDefaults, this.fields()[key]);
        },

        val: function() {
            return $.extend(true, {}, this._values);
        }

    });

});
