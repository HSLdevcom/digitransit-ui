exports.command = function setGeolocation(latitude, longitude) {
  /* eslint-disable prefer-arrow-callback */
  this.execute(function fakeGeo(latitude2, longitude2) {
    // Requires using digitransit-ui with the following in the URL: ?mock
    window.mock.geolocation.setCurrentPosition(
      // Hack around PositionStore
      (2 * latitude2) - window.mock.data.position.coords.latitude,
      (2 * longitude2) - window.mock.data.position.coords.longitude);
  }, [latitude, longitude]);
  return this;
};
