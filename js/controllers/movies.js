define(['app'], function(app) {
	return app.controller('MoviesController', function($scope, movieRepository) {
		$scope.movies = [];

		$scope.isLoadingMovies = true;
		
		movieRepository.get(function(movies) {
			$scope.$apply(function() {
				$scope.movies = $scope.movies.concat(movies);
				$scope.isLoadingMovies = false;
			});
		});

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