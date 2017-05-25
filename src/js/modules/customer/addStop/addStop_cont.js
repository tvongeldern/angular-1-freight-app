app.controller("addStopController", function($scope, basicService){

	var ctrl = this;

	$scope.infoObject = {};

	$scope.controllerObj = function(obj){
		$scope.infoObject = obj;
	};

	$scope.showResultsMenu = false;

	$scope.searchResults = {};

	$scope.hideSearch = function(){
		$scope.showResultsMenu = false;
	};

	$scope.clearWhs = function(whsObj){
		whsObj.whsName = '';
		whsObj.address = '';
		whsObj.address2 = '';
		whsObj.city = '';
		whsObj.state = '';
		whsObj.zip = '';
	};

	$scope.offerMatches = function(stopObj, whsNum){
		if (!whsNum){
			stopObj.whsNumber = '';
		}
		if ((stopObj.whsNumber.length > 0) || (stopObj.whsName.length > 0) || (stopObj.address.length > 0) || (stopObj.address2.length > 0) || (stopObj.city.length > 0) || (stopObj.state.length > 0) || (stopObj.zip.length > 0)){
			var url = '../node/warehouse-matches/?';
			['whsNumber', 'whsName', 'address', 'address2', 'city', 'state', 'zip'].forEach(function(item, index){
				if (stopObj[item]){
					if (url != '../node/searchWhs/?'){
						url += '&';
					}
					url += item + "=" + encodeURIComponent(stopObj[item]);
				}
			});
			basicService.get(url)
			.then(function success(response){
				$scope.showResultsMenu = true;
				$scope.searchResults = response;
			}, function error(response){
				console.error("WHS SEARCH ERROR");
				console.log(response);
			});
		} else {
			$scope.showResultsMenu = false;
		}
	};

	$scope.searchSelect = function(whsObject){
		$scope.infoObject.whsNumber = whsObject.whsNumber;
		$scope.infoObject.whsName = whsObject.whsName;
		$scope.infoObject.address = whsObject.address1;
		$scope.infoObject.address2 = whsObject.address2;
		$scope.infoObject.city = whsObject.city;
		$scope.infoObject.state = whsObject.state;
		$scope.infoObject.zip = whsObject.zip;
		$scope.hideSearch();
	};

});
