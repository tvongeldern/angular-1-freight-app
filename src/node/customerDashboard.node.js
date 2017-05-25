dbEndpoint('/customer-available-loads', 'get', multipleConnection, 'custDshbrdAvailLoads.sql');

dbEndpoint('/customer-transit-loads', 'get', multipleConnection, "custDshbrdTransitLoads.sql");

dbEndpoint('/customer-tendered-loads', 'get', multipleConnection, "custDshbrdTenderedLoads.sql");
