define( [ "./textfield" ], function( TextField ){
	return TextField.extend({
		init: function() {
			this._super();
		},
		_fieldTemplate: function() {
			var retObj = this._super();
			retObj.type = "password";
			return retObj;
		}
	});
});