define(['app'], function(app) {
	return app.factory('movieRepository', function() {
		var movies = [
			{
				name: 'Star Wars',
				year: 1977
			},
			{
				name: 'The Empire Strikes Back',
				year: 1980
			},
			{
				name: 'Return of the Jedi',
				year: 1983
			}
		];

		function get(callback) {
			setTimeout(function() {
				callback(movies);
			}, 2000);
		}

		return {
			get: get
		};
	});
});