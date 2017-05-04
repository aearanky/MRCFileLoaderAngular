'use strict';

angular.module('angularjsThreejsApp')
	.controller('mainController', function ($scope) {
		$scope.mrcUrl = "/models/mrc/bin8Data/avebin8.mrc";
		console.log("We are sending " + $scope.mrcUrl);
	});
