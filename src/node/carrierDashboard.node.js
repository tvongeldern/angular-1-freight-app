dbEndpoint('/carrier-dashboard-bids', 'get', defaultConnection, "carDshbrdBids.sql");

dbEndpoint('/carrier-dashboard-loads', 'get', defaultConnection, "carDshbrdLoads.sql");

dbEndpoint('/carrier-dashboard-drivers', 'get', defaultConnection, 'driverScheduleQueryBeta.sql');

dbEndpoint('/getCarrierDashboardDelivered', 'get', defaultConnection, function(data){
    var query = "SELECT * FROM deliveredLoads";
    return query;
});
