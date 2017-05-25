app.directive('utpCustomerBidManager', function(){

    return {
        restrict: 'E',
        scope: {
            info: '=',
            refreshData:'='
        },
        templateUrl: 'bidManager_tmp.html',
        controller: 'bidManagerController',
        controllerAs: 'bidMgrCtrl'
    }

});
