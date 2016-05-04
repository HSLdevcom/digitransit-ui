exports.command = function(latitude, longitude, callback) {
    this.execute(function() {
        window.mock.geolocation.setCurrentPosition(59.896442, 10.554464);
    });
    return this;
};