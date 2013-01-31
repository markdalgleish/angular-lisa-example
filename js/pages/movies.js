define(['app', 'text!./movies.html'], function(app, template) {
	return app.directive('pageMovies', function() {

		document.createElement('page-movies');
		
		return {
			restrict: 'E',
			template: template
		};
	});
});