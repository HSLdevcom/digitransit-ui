exports.command = function setGeolocation(latitude, longitude) {
  /* eslint-disable prefer-arrow-callback */
  this.execute(function fakeGeo(latitude2, longitude2) {
    // Requires using digitransit-ui with the following in the URL: ?mock
    window.mock.geolocation.setCurrentPosition(latitude2, longitude2, null, true);
  }, [latitude, longitude]);
  return this;
};
