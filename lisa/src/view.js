define( [ "./abstractwidget" ], function( AbstractWidget ) {

    return AbstractWidget.extend({
            defaults: {
            model: null,     // the instance of the Model controlling the widget's value
            modelField: null // the key of the field within the model that the widget is to update
        },

        _initModelView: function() {
            this._super();

            this.model = this.config.model;
            this.modelField = this.config.modelField;
        },

        _initHandlers: function() {
            this._super();

            if (this.model && this.modelField) {
                this.model.on("change." + this.modelField, this._updateView.bind(this));
                this.on("change", this._updateModel.bind(this) );
                this._updateView();
            }
        },

        val: function() {},

        _updateModel: function() {
            this.model.set(this.modelField, this.val());
        },

        _updateView: function() {
            this.val(this.model.get(this.modelField));
        }
    });

});