define(['app', 'lisa/textfield'], function(app, TextField) {
	document.createElement('lisa-textfield');

	return app.directive('lisaTextfield', function() {
		return {
			restrict: 'E',
			require: 'ngModel',
			link: function(scope, iElement, iAttrs, controller) {
				var required = iAttrs.lisaRequired !== undefined && iAttrs.lisaRequired !== 'false';

				var textfield = new TextField({
					require: required
				});

				iElement.append(textfield.$el);

				controller.$render = function () {
					textfield.val(controller.$viewValue);
				};

				textfield.$el.bind('blur keyup change', function() {
					controller.$setViewValue(textfield.val());
				});
			}
		};
	});
});