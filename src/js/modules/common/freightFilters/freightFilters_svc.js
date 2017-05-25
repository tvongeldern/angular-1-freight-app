app.service('freightFilters', function(){

    function handling(int){
		if (int == 1){
			return "Pallets";
		} else if (int == 2){
			return "Gaylords";
		} else if (int == 3){
			return "Boxes (50 or less)";
		} else if (int == 4){
			return "Boxes (More than 50)";
		} else if (int == 5){
			return "Floor-Loaded/Loose";
		} else {
			return "ERROR";
		}
	}

    function stopAction(int, capitalize){
        var str = ''
        if (int == 0){
            str = "pickup";
        } else {
            str = "delivery";
        }
        if (capitalize){
            return str.charAt(0).toUpperCase() + str.slice(1);
        } else {
            return str;
        }
    }

    function loadStatus(int){
        var obj = {};
        if (int == 0){
            obj = {
                'state': 'On Hold',
                'action': 'put on hold'
            }
        } else if (int == 1){
            obj = {
                'state': 'Ready',
                'action': 'readied'
            }
        } else if (int == 2){
            obj = {
                'state': 'In Progress',
                'action': 'begun'
            }
        }

        return obj;
    }

    function stopStatus(int){
        var str = '';
        if (int == 1){
            str = "Not Yet Started";
        } else if (int == 2){
            str = 'En Route';
        } else if (int == 3){
            str = 'At Stop';
        } else if (int == 4){
            str = 'Working';
        } else if (int == 5){
            str = 'Finished';
        } else if (int == 6){
            str = 'Rejected';
        }
        return str;
    }

    return {
        handling,
        stopAction,
        loadStatus,
        stopStatus
    }

});
