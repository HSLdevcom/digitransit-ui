module.exports = function (browser) {
  browser.setCurrentPosition = function (lat, lon, heading, done) {
    browser.execute(function () {
      window.mock.geolocation.setCurrentPosition(lat, lon, heading)
    }, null, function (result) {
      done();
    });
  };

  browser.init = function(done) {
    browser.url(browser.launch_url, function() {
      done();
    });
  };

  browser.expect.map = function () {
    return browser.expect.element('div.leaflet-map-pane');
  };
};
