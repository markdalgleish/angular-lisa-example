define(['app', 'services/movies'], function(app, moviesService) {
	return app.controller('MoviesController', function($scope) {
		$scope.movies = [];

		$scope.isLoadingMovies = true;
		moviesService.get(function(movies) {
			$scope.$apply(function() {
				$scope.movies = $scope.movies.concat(movies);
				$scope.isLoadingMovies = false;
			});
		});

		setTimeout(function() {
			$scope.$apply(function() {
				$scope.newMovieName = 'Star Wars Episode VII';
				$scope.newMovieYear = 2015;
			});
		}, 2000);

		$scope.addMovie = function() {
			$scope.movies.push({
				name: $scope.newMovieName,
				year: $scope.newMovieYear
			});

			$scope.newMovieName = '';
			$scope.newMovieYear = '';
		}

	});
});