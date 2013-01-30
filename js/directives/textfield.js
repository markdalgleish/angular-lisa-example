define(['angular', 'lisa/textfield'], function(angular, TextField) {
	return angular.module('lisa', []).directive('lisaTextfield', function() {
		
		// IE fix
		document.createElement('lisa-textfield');

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