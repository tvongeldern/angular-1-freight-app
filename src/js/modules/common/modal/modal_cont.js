app.controller('modalController', function($scope){

    var ctrl = this;

    ctrl.height = $scope.modalHeight || 'auto';

    ctrl.width = $scope.modalWidth || 'auto';

    ctrl.close = function(){
        $scope.showModal = false;
    };

});
