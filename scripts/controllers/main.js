'use strict';

angular.module('angularjsThreejsApp')
	.controller('MainCtrl', function ($scope) {
		$scope.mrcUrl = "models/mrc/bin8Data/avebin8.mrc";

		// $scope.changeModel = function() {
			// if ($scope.assimpModelUrl == "models/interior.3ds.json") {
				// $scope.assimpModelUrl = "models/jeep1.ms3d.json";
			// }
			// else {
				// $scope.assimpModelUrl = "models/interior.3ds.json";
			// }
		// };
	});
