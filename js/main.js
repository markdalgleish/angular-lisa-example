require.config({
	baseUrl: 'js',
	paths: {
		'text': 'lib/text',
		'angular': '../components/angular/angular',
		'jquery': '../components/jquery/jquery.min',
		'lisa': '../lisa/src',
		'nohtml': 'lib/nohtml',
		'views': '../views',
		'app': 'app/app'
	},
	shim: {
		'angular':{
			exports: 'angular'
		}
	}
});

require([
	'angular',
	'app',
	'controllers/controllers',
	'directives/directives',
	'services/services',
	'pages/pages'
], function (angular) {
	angular.bootstrap(document, ['lisa', 'example-app']);
});