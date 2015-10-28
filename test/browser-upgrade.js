function setCurrentPosition(browser) {
  return function (lat, lon, heading, done) {
    browser.execute(function () {
      window.mock.geolocation.setCurrentPosition(lat, lon, heading)
    }, null, function (result) {
      done();
    });
  };
}

function upgrade(browser) {
  browser.setCurrentPosition = setCurrentPosition(browser);
}

module.exports = upgrade;
