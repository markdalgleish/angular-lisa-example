require.config({
	baseUrl: 'js',
	paths: {
		'angular': '../components/angular/angular',
		'jquery': '../components/jquery/jquery.min',
		'lisa': '../lisa/src',
		'nohtml': 'lib/nohtml'
	},
	shim: {
		'angular':{
			exports: 'angular'
		}
	}
});

require(['angular', 'controllers/controllers', 'directives/directives'], function (angular) {
	angular.bootstrap(document, ['lisa-example']);
});