app.service("userDataService",function($http, $q){

	return {

		verifyCredentials: function(username,password){

			var prom = $q.defer();

			var data = {"un": username, "pw": password};

			$http.post("node/validateCredentials", data)
			.success(function(response){
				prom.resolve(response);
			})
			.error(function(error){
				prom.reject(error);
			});

			return prom.promise;

		}

	}

});

