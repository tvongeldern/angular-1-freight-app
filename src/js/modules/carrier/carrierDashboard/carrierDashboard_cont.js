app.controller('carrierDashboardController', function($scope, basicService){

    var ctrl = this;
    var user = JSON.parse(sessionStorage.getItem('registeredUser') || '{}').uid;

    $scope.searchVar = '';

    $scope.bids = [];
    $scope.drivers = [];
    $scope.loads = [];
    $scope.delivered = [];

	ctrl.showTab = function(input){
		$scope.tabVar = input;
        retrieve(input);
        if (input == 'bids'){
            retrieve('drivers')
        }
	};

    function retrieve(input){
        basicService.get('../../node/carrier-dashboard-' + input + '/?user=' + user)
        .then(function success(response){
            $scope[input] = response;
        }, function failure(response){
            console.log(response);
        });
    };

});
