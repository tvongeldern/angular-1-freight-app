dbEndpoint('/validateCredentials', 'post', defaultConnection, function(data){
    return ("SELECT * from users WHERE username='" + data.un + "' AND passwrd='" + data.pw + "'");
}, function(data, response, err, rows){
    if (!err){
    	if (rows.length > 0){
    		var obj = {
    			userType: rows[0].userType,
    			userID: rows[0].userID,
    			success: true
    		};
    		response.send(obj);

    	} else {
    		response.send("creds");
    	}
    } else {
    	response.send(err);
    	console.log(err);
    }
});
