app.filter('stateFilter', function() {

	return function( items, state ) {

		if (state.value.length != 2){
			return items;
		} else {

			var filtered = [];

			angular.forEach(items, function(item) {

				var key = !!(state.stop == 'org') ? 0 : (item.stops.length - 1);

				if (state.value.toUpperCase() == item.stops[key].state) {
					filtered.push(item);
				}

			});

			return filtered;

		}

	};

});

app.filter('zipFilter', function(){

	return function(items, zipObj){

		var filtered = [];

		if (String(zipObj.value).length != 5){
			return items;
		} else if (zipObj.range == '') {

			angular.forEach(items, function(item) {

				var key = !!(zipObj.stop == 'org') ? 0 : (item.stops.length - 1);

				if (zipObj.value == item.stops[key].zip) {
					filtered.push(item);
				}

			});

			return filtered;

		} else {

			angular.forEach(items, function(item) {

				var range = parseInt(zipObj.range);
				var key = !!(zipObj.stop == 'org') ? 0 : (item.stops.length - 1);
				var distance = parseInt(getD(zipObj.value,item.stops[key].zip));

				if (distance < range) {
					filtered.push(item);
				};

			});

			return filtered;

		}

	}

});

app.filter('distanceFilter', function() {

	return function( items, distance ) {

		if ((String(distance.value).length > 1) && (String(distance.value).length < 5)){
			var filtered = [];

			angular.forEach(items, function(item) {

				var dist = 0;

				for (var i = 0; i < item.stops.length; i++){
					if (!!item.stops[(i + 1)]){
						var org = item.stops[i].zip;
						var dest = item.stops[(i + 1)].zip;
						dist += parseInt(getD(org,dest)) * 1.15;
					} else {
						dist += 0;
					}
				}

				var desired = parseInt(distance.value);

				if (distance.min && (dist > desired)) {
					filtered.push(item);
				} else if (!distance.min && (dist < desired)) {
					filtered.push(item);
				}

			});

			return filtered;

		} else {
			return items;
		}

	};

});

app.filter('datesFilter', function($filter){

	return function(items, datesObj){

		var filtered = [];

		if (!datesObj.fromDate && !datesObj.untilDate){
			return items;
		} else if (!!datesObj.fromDate && !datesObj.untilDate){

			angular.forEach(items, function(item){

				var erlDate = $filter('date')(datesObj.fromDate,'yyyy-MM-dd');

				if (erlDate < '2016-02-28'){
					filtered.push(item);
				} else if (item.stops[0].lateDate >= erlDate){
					filtered.push(item);
				}

			});

			return filtered;

		} else if (!datesObj.fromDate && !!datesObj.untilDate){

			angular.forEach(items, function(item){

				var untDate = $filter('date')(datesObj.untilDate,'yyyy-MM-dd');


				if (untDate < '2016-02-28'){
					filtered.push(item);
				} else if (item.stops[0].earlyDate <= untDate){
					filtered.push(item);
				}

			});

			return filtered;

		} else if (!!datesObj.fromDate && !!datesObj.untilDate){

			angular.forEach(items, function(item){

				var untDate = $filter('date')(datesObj.untilDate,'yyyy-MM-dd');
				var erlDate = $filter('date')(datesObj.fromDate,'yyyy-MM-dd');

				if ((erlDate < '2016-02-28') || (untDate < '2016-02-28')){
					filtered.push(item);
				} else if ((item.stops[0].lateDate >= erlDate) && (item.stops[0].earlyDate <= untDate)){
					filtered.push(item);
				}

			});

			return filtered;

		}

	}

});

app.filter('driverFilter', function($filter, timeDateSvc){

	return function(items, dr){

		if (dr){
			return items;
			/*/var driver = JSON.parse(dr);

			var filtered = [];
			var truck = {
				time: (driver.drStatus == 1) ? driver.nextEmptyTime : null,
				date: (driver.drStatus == 1) ? $filter('date')(driver.nextEmptyDate,'yyyy-MM-dd') : null,
				zip: (driver.drStatus == 1) ? driver.nextEmptyZip : null
			};

			if (truck.date){

				angular.forEach(items, function(item){
					var pick = item.stops[0];
					var distance = getD(truck.zip,pick.zip);
					var dateDiff = timeDateSvc.differenceInDays(truck.date, pick.lateDate);
					var timeDiff = timeDateSvc.differenceInMinutes(truck.time, pick.lateTime);

					if ((dateDiff > 0) && ((distance / dateDiff) < 800)){
						filtered.push(item);
					} else if ((dateDiff == 0) && (distance / timeDiff < .85)){
						filtered.push(item);
					}
				});
				return filtered;

			} else {
				return items;
			}/*/

		} else {
			return items;
		}

	}

});
