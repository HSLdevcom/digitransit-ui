exports.command = function(latitude, longitude, callback) {
    this.execute(function(latitude2, longitude2) {
        // Requires usnig digitransit-ui with the following in the URL: ?mock
        window.mock.geolocation.setCurrentPosition(latitude2, longitude2);
    }, [latitude, longitude]);
    return this;
}
