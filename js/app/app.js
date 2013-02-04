'use strict';

define(['angular', 'text!views/app.html'], function (angular, template) {
    var app = angular.module('example-app', []);

    app.directive('exampleApp', function() {
    	return {
    		restrict: 'A',
    		template: template
    	}
    });

    return app;
});