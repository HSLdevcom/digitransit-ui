# Stadtnavi extension

Stadtnavi has added the following features:

### Dynamic parking lots routing and parking lots

![Screenshot](images/dynamic-parking-lots.png)

This map layer adds information about map car parking lots with information about capacity, free spaces and opening hours.

All the information is drawn from a ParkAPI feed. Herrenberg's feed is available at: https://api.stadtnavi.de/parkapi.json

#### Frontend

To visualise the parking lots, an instance of [tilelive-park-api](https://github.com/stadtnavi/tilelive-park-api) needs to be added to `hsl-map-server`.

The main code frontend resides in `DynamicParkingLots.js` and `DynamicParkingLotsPopup.js`.

If a parking lot close to being full, then a warning is shown. The user may decide to re-run the routing query
excluding full car-parks.

![Screenshot](images/dynamic-parking-lot-full.png)

This code lives in `CarLeg.js`.

#### Related pull requests & commits

- https://github.com/stadtnavi/digitransit-ui/pull/70
- https://github.com/stadtnavi/digitransit-ui/pull/74
- https://github.com/stadtnavi/digitransit-ui/pull/142
- https://github.com/stadtnavi/digitransit-ui/pull/277
- https://github.com/mfdz/OpenTripPlanner-data-container/commit/e2572ea5b526bedf0359b681f7e7391017f69db5
