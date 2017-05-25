app.controller("createWhsModalController", function($scope, $filter, basicService, googleAPI){

	var ctrl = this;

	$scope.page1 = {
		exists: true,
		show: true
	};

	$scope.page2 = {
		exists: false,
		show: false
	};

	$scope.buildWhsError = null;

	$scope.submitFormData = function(obj){
		var data = Object.assign({}, obj);
		if (!data.whsName || data.whsName.length < 4){
			$scope.buildWhsError = "Please complete the warehouse name";
		} else if (!data.address1 || data.address1.length < 1){
			$scope.buildWhsError = "Please enter warehouse address";
		} else if (!data.city || data.city.length < 2){
			$scope.buildWhsError = "Please enter warehouse city";
		} else if (!data.state || data.state.length != 2){
			$scope.buildWhsError = "Please enter warehouse state as a two-digit postal code";
		} else if (!data.zip || String(data.zip).length !=5){
			$scope.buildWhsError = "Please enter warehouse zip code";
		} else if (!data.phone || strip(data.phone, true).length != 10){
			$scope.buildWhsError = "Please enter warehouse phone number";
		} else if (!data.transpoMgr){
			$scope.buildWhsError = "Please enter transportation manager name, or at least a contact who knows warehouse shipping and receiving procedures";
		} else if (!data.opsMgmt){
			$scope.buildWhsError = "Please select option that best describes warehouse operations management";
		} else if (!data.genOpen){
			$scope.buildWhsError = (data.opsMgmt == 2) ? "Please enter office open time" : "Please enter warehouse open time";
		} else if (!data.genClose){
			$scope.buildWhsError = (data.opsMgmt == 2) ? "Please enter office close time" : "Please enter warehouse close time";
		} else if (!data.lumpers){
			$scope.buildWhsError = "Please select option that best describes warehouse lumpers procedure";
		} else if ((data.opsMgmt == 1) && (!data.genApt)){
			$scope.buildWhsError = "Please select option that best describes warehouse appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.shipPhone)){
			$scope.buildWhsError = "Please shipping department phone number";
		} else if ((data.opsMgmt == 2) && (!data.shipMgr)){
			$scope.buildWhsError = "Please enter shipping manager name, or at least a contact who knows warehouse shipping procedures";
		} else if ((data.opsMgmt == 2) && (!data.shipApt)){
			$scope.buildWhsError = "Please select option that best describes shipping appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.shipOpen)){
			$scope.buildWhsError = "Please enter shipping open time";
		} else if ((data.opsMgmt == 2) && (!data.shipClose)){
			$scope.buildWhsError = "Please enter shipping close time";
		} else if ((data.opsMgmt == 2) && (!data.recPhone)){
			$scope.buildWhsError = "Please receiving department phone number";
		} else if ((data.opsMgmt == 2) && (!data.recMgr)){
			$scope.buildWhsError = "Please enter receiving manager name, or at least a contact who knows warehouse shipping procedures";
		} else if ((data.opsMgmt == 2) && (!data.recApt)){
			$scope.buildWhsError = "Please select option that best describes receiving appointment policy";
		} else if ((data.opsMgmt == 2) && (!data.recOpen)){
			$scope.buildWhsError = "Please enter receiving open time";
		} else if ((data.opsMgmt == 2) && (!data.recClose)){
			$scope.buildWhsError = "Please enter receiving close time";
		} else {
			data.phone = strip(obj.phone);
			data.shipPhone = strip(obj.shipPhone);
			data.recPhone = strip(obj.recPhone);
			data.genOpen = $filter('date')(obj.genOpen,'H:mm:ss');
			data.genClose = $filter('date')(obj.genClose,'H:mm:ss');
			data.shipOpen = $filter('date')(obj.shipOpen,'H:mm:ss');
			data.shipClose = $filter('date')(obj.shipClose,'H:mm:ss');
			data.recOpen = $filter('date')(obj.recOpen,'H:mm:ss');
			data.recClose = $filter('date')(obj.recClose,'H:mm:ss');

			googleAPI.addressCheck(data.address1, data.city, data.state)
			.then(function(response){
				if (!response.exactMatch){
					if (response.street_number && response.route){
						data.address1 = obj.address1 = response.street_number && response.route ? response.street_number + " " + response.route : '';
						data.city = obj.city = response.locality || '';
						data.state = obj.state = response.administrative_area_level_1 || '';
						data.zip = obj.zip = response.postal_code || '';
						$scope.buildWhsError = "Address has been verified, but minor details have been adjusted. Please review and re-submit.";
					} else {
						warehouseNoMatch();
					}
				} else {
					basicService.put('../node/new-warehouse', data)
					.then(function(response){
						$scope.info.whsNumber = response.insertID;
						$scope.info.hideModal();
					}, function(response){
						console.error("ERROR");
						console.log(response);
					});
				}
			})
			.catch(function(response){
				if (response.error != 'connection'){
					warehouseNoMatch();
				}
			});

		}
	};

	$scope.phoneInput = function(arg){
		var str = strip($scope.info[arg], true);
		var num = strip($scope.info[arg]);
		if (num > 99999) {
			$scope.info[arg] = "(" + str.substring(0,3) + ") - " + str.substring(3,6) + " - " + str.substring(6,str.length);
		} else if (num > 99) {
			$scope.info[arg] = "(" + str.substring(0,3) + ") - " + str.substring(3,str.length);
		}
		while ($scope.info[arg].length > 18){
			$scope.info[arg] = $scope.info[arg].substring(0, $scope.info[arg].length - 1);
		}
	};

	function strip(input, stringBool){
		var str = String(input).replace(/\D/g,'');
		if (stringBool && str){
			return String(str);
		} else if (str){
			return parseInt(str);
		} else {
			return '';
		}
	};

	function warehouseNoMatch(){
		$scope.buildWhsError = "The address you submitted could not be verified. Please try again.";
	};

});
