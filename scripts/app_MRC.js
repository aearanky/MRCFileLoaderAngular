'use strict';

angular.module('angularjsThreejsApp', ["ngMrcviewer"])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'views/mainView.html',
				controller: 'mainController'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
 