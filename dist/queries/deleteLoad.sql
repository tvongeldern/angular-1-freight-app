DELETE availableLoads, bids, stops, stopAdjustments
FROM availableLoads
LEFT JOIN bids ON bids.loadNumber = availableLoads.loadNumber
LEFT JOIN stops ON stops.loadNumber = availableLoads.loadNumber
LEFT JOIN stopAdjustments ON stopAdjustments.bidNumber = bids.bidNumber
WHERE availableLoads.loadNumber = {{ load }}
